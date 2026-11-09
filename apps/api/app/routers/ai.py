import json
import urllib.error
import urllib.request
from collections.abc import Iterator
from datetime import datetime, timezone
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from ..auth import get_claims
from ..config import settings
from ..db import get_pool

router = APIRouter(prefix="/api/v1/ai", tags=["poufa-ai"])


class CreateConversationRequest(BaseModel):
    title: str | None = Field(default=None, max_length=160)
    farm_id: UUID | None = None


class SendMessageRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=4000)
    farm_id: UUID | None = None


class RenameConversationRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=160)


def _build_farm_context(user_id: str, requested_farm_id: UUID | None = None) -> str:
    """
    Récupère uniquement le contexte minimal autorisé depuis Neon PostgreSQL
    pour alimenter POUFA AI avec les vraies valeurs métier.
    """
    if not settings.database_url:
        return "Aucune base de données configurée."

    try:
        with get_pool().connection() as conn:
            with conn.cursor() as cur:
                # 1. Identifier les fermes autorisées pour l'utilisateur (ou ferme de démo KIMBA)
                cur.execute(
                    """
                    SELECT f.id, f.official_code, f.name, f.province, f.locality, f.farming_type
                    FROM farms f
                    LEFT JOIN farm_memberships fm ON fm.farm_id = f.id AND fm.clerk_user_id = %s AND fm.status = 'active'
                    WHERE fm.clerk_user_id = %s
                       OR f.created_by = %s
                       OR f.official_code = 'GA-EST-2026-001'
                    ORDER BY (CASE WHEN fm.clerk_user_id IS NOT NULL THEN 0 ELSE 1 END), f.created_at DESC
                    LIMIT 5
                    """,
                    (user_id, user_id, user_id),
                )
                farms = cur.fetchall()
                if not farms:
                    return "Aucune ferme active rattachée à ce compte."

                selected_farm = farms[0]
                if requested_farm_id:
                    matched = [f for f in farms if str(f[0]) == str(requested_farm_id)]
                    if not matched:
                        raise HTTPException(status.HTTP_403_FORBIDDEN, "Accès non autorisé à cette ferme")
                    selected_farm = matched[0]

                farm_id, f_code, f_name, f_prov, f_loc, f_type = selected_farm

                # 2. Bandes et arithmétique canonique (placés - morts - sorties)
                cur.execute(
                    """
                    SELECT b.id, b.official_code, b.placement_date, b.initial_count, b.status,
                           COALESCE((SELECT SUM(d.deaths) FROM daily_records d WHERE d.band_id = b.id), 0) AS total_deaths,
                           COALESCE((SELECT SUM(d.feed_kg) FROM daily_records d WHERE d.band_id = b.id), 0) AS total_feed_kg,
                           COALESCE((SELECT SUM(e.quantity) FROM flock_exits e WHERE e.band_id = b.id), 0) AS total_exits
                    FROM bands b
                    WHERE b.farm_id = %s
                    ORDER BY b.placement_date DESC NULLS LAST
                    LIMIT 5
                    """,
                    (farm_id,),
                )
                bands = cur.fetchall()

                # 3. Dernière pesée
                cur.execute(
                    """
                    SELECT weighing_date, sample_count, total_weight_kg, average_weight_kg
                    FROM weighings
                    WHERE farm_id = %s
                    ORDER BY weighing_date DESC
                    LIMIT 3
                    """,
                    (farm_id,),
                )
                weighings = cur.fetchall()

                # 4. Stocks et réceptions d'intrants
                cur.execute(
                    """
                    SELECT product_name, quantity, unit, receipt_date, status
                    FROM inventory_receipts
                    WHERE farm_id = %s
                    ORDER BY receipt_date DESC
                    LIMIT 5
                    """,
                    (farm_id,),
                )
                receipts = cur.fetchall()

                # 5. Signalements sanitaires
                cur.execute(
                    """
                    SELECT problem_type, signs, affected_count, event_date, status
                    FROM health_declarations
                    WHERE farm_id = %s
                    ORDER BY event_date DESC
                    LIMIT 5
                    """,
                    (farm_id,),
                )
                health = cur.fetchall()

                # 6. Lots de traçabilité
                cur.execute(
                    """
                    SELECT official_code, provisional_code, quantity, transfer_date, recipient, status
                    FROM lots
                    WHERE farm_id = %s
                    ORDER BY transfer_date DESC
                    LIMIT 5
                    """,
                    (farm_id,),
                )
                lots = cur.fetchall()

        lines = [
            f"Ferme active : {f_name} (Code officiel : {f_code or 'Non attribué'}, Province : {f_prov}, Localité : {f_loc}, Type : {f_type})",
        ]
        if bands:
            lines.append("Bandes d'élevage :")
            for b_id, b_code, p_date, init_c, b_status, deaths, feed_kg, exits in bands:
                init_val = int(init_c or 0)
                deaths_val = int(deaths or 0)
                exits_val = int(exits or 0)
                current_pop = max(0, init_val - deaths_val - exits_val)
                mort_pct = round((deaths_val / init_val) * 100, 2) if init_val > 0 else 0.0
                viab_pct = round(100.0 - mort_pct, 2) if init_val > 0 else 0.0
                lines.append(
                    f"  - Bande {b_code or str(b_id)[:8]} ({b_status}) : mise en place le {p_date}, "
                    f"placés = {init_val}, mortalités cumulées = {deaths_val} (taux mortalité = {mort_pct} %, viabilité = {viab_pct} %), "
                    f"sorties/cessions = {exits_val}, effectif actuel présent = {current_pop} sujets, "
                    f"aliment distribué cumulé = {float(feed_kg or 0):.1f} kg."
                )
        if weighings:
            lines.append("Dernières pesées :")
            for w_date, s_count, tot_w, avg_w in weighings:
                lines.append(
                    f"  - {w_date} : échantillon de {s_count} sujets, poids total {float(tot_w):.2f} kg, poids moyen = {float(avg_w or 0):.3f} kg/sujet."
                )
        if receipts:
            lines.append("Réceptions d'intrants récentes :")
            for p_name, qty, unit, r_date, r_status in receipts:
                lines.append(f"  - {r_date} : {p_name} — {float(qty):.1f} {unit} (statut : {r_status}).")
        if health:
            lines.append("Signalements sanitaires :")
            for p_type, signs, aff, e_date, h_status in health:
                lines.append(
                    f"  - {e_date} : {p_type} ({signs or 'aucun signe détaillé'}), sujets touchés : {aff or 0}, statut : {h_status}."
                )
        if lots:
            lines.append("Lots de traçabilité :")
            for o_code, p_code, l_qty, t_date, recip, l_status in lots:
                lines.append(
                    f"  - Lot {o_code or p_code} : {l_qty} sujets cédés le {t_date} à {recip or 'non spécifié'} (statut : {l_status})."
                )
        return "\n".join(lines)
    except HTTPException:
        raise
    except Exception as exc:
        return f"Contexte partiellement indisponible ({exc})."


def _system_prompt(farm_context: str) -> str:
    return (
        "Tu es POUFA AI, l'assistant intelligent intégré à POUFA pour le suivi technico-économique "
        "et la traçabilité avicole au Gabon.\n"
        "Règles strictes d'identité et de sécurité :\n"
        "1. Ton nom public est uniquement « POUFA AI ». Ne mentionne jamais d'autres noms d'assistants, "
        "ni le nom du fournisseur de modèle sous-jacent.\n"
        "2. Réponds dans la langue de l'utilisateur (français par défaut, ou anglais si la question est en anglais) "
        "avec un ton clair, calme, précis et professionnel.\n"
        "3. Appuie-toi strictement sur les données réelles de l'exploitation fournies ci-dessous. "
        "Cite les chiffres exacts (effectif placé, mortalités, sorties, effectif actuel, poids moyen, lots, stocks). "
        "N'invente jamais de données absentes.\n"
        "4. Tu fournis une assistance analytique en lecture seule : tu ne modifies aucun enregistrement, "
        "tu ne clôtures aucune bande et tu ne poses jamais de diagnostic vétérinaire officiel.\n\n"
        "=== DONNÉES AUTORISÉES DE L'EXPLOITATION ===\n"
        f"{farm_context}\n"
        "============================================"
    )


def _open_deepseek_request(messages: list[dict], stream: bool):
    if not settings.deepseek_api_key:
        raise RuntimeError("Clé API non configurée sur le serveur FastAPI (DEEPSEEK_API_KEY).")

    base_url = settings.deepseek_base_url.rstrip("/")
    url = f"{base_url}/chat/completions"
    models_to_try = [settings.deepseek_model]
    if "deepseek-chat" not in models_to_try:
        models_to_try.append("deepseek-chat")

    last_err: Exception | None = None
    for model_name in models_to_try:
        payload = json.dumps(
            {
                "model": model_name,
                "messages": messages,
                "stream": stream,
                "temperature": 0.3,
                "max_tokens": 1200,
            }
        ).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=payload,
            headers={
                "Content-Type": "application/json",
                "Accept": "text/event-stream" if stream else "application/json",
                "Authorization": f"Bearer {settings.deepseek_api_key}",
            },
            method="POST",
        )
        try:
            return urllib.request.urlopen(req, timeout=45)
        except urllib.error.HTTPError as http_err:
            last_err = http_err
            if http_err.code in (400, 404, 422) and model_name != models_to_try[-1]:
                continue
            err_body = http_err.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"Erreur fournisseur IA (HTTP {http_err.code}): {err_body[:240]}") from http_err
        except Exception as exc:
            last_err = exc
            raise RuntimeError(f"Erreur de connexion au service IA : {exc}") from exc

    raise RuntimeError(f"Impossible de joindre le service IA : {last_err}")


@router.post("/conversations", status_code=status.HTTP_201_CREATED)
def create_conversation(
    body: CreateConversationRequest,
    claims: dict = Depends(get_claims),
) -> dict:
    user_id = claims.get("sub") or "anonymous"
    conv_id = uuid4()
    title = (body.title or "Nouvelle conversation").strip() or "Nouvelle conversation"
    now = datetime.now(timezone.utc)

    with get_pool().connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO ai_conversations (id, user_id, farm_id, title, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (conv_id, user_id, body.farm_id, title, now, now),
            )
    return {
        "id": str(conv_id),
        "title": title,
        "farmId": str(body.farm_id) if body.farm_id else None,
        "createdAt": now.isoformat(),
        "updatedAt": now.isoformat(),
    }


@router.get("/conversations")
def list_conversations(claims: dict = Depends(get_claims)) -> dict:
    user_id = claims.get("sub") or "anonymous"
    with get_pool().connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, title, farm_id, created_at, updated_at
                FROM ai_conversations
                WHERE user_id = %s
                ORDER BY updated_at DESC
                LIMIT 50
                """,
                (user_id,),
            )
            rows = cur.fetchall()
    return {
        "conversations": [
            {
                "id": str(r[0]),
                "title": r[1],
                "farmId": str(r[2]) if r[2] else None,
                "createdAt": r[3].isoformat() if r[3] else None,
                "updatedAt": r[4].isoformat() if r[4] else None,
            }
            for r in rows
        ]
    }


@router.get("/conversations/{conversation_id}")
def get_conversation(
    conversation_id: UUID,
    claims: dict = Depends(get_claims),
) -> dict:
    user_id = claims.get("sub") or "anonymous"
    with get_pool().connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, user_id, title, farm_id, created_at, updated_at
                FROM ai_conversations
                WHERE id = %s
                """,
                (conversation_id,),
            )
            conv = cur.fetchone()
            if not conv:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Conversation introuvable")
            if conv[1] != user_id:
                raise HTTPException(status.HTTP_403_FORBIDDEN, "Accès refusé à cette conversation")

            cur.execute(
                """
                SELECT id, role, content, status, token_usage, created_at
                FROM ai_messages
                WHERE conversation_id = %s
                ORDER BY created_at ASC
                """,
                (conversation_id,),
            )
            msgs = cur.fetchall()

    return {
        "id": str(conv[0]),
        "title": conv[2],
        "farmId": str(conv[3]) if conv[3] else None,
        "createdAt": conv[4].isoformat() if conv[4] else None,
        "updatedAt": conv[5].isoformat() if conv[5] else None,
        "messages": [
            {
                "id": str(m[0]),
                "role": m[1],
                "content": m[2],
                "status": m[3],
                "tokenUsage": m[4],
                "createdAt": m[5].isoformat() if m[5] else None,
            }
            for m in msgs
        ],
    }


@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: UUID,
    claims: dict = Depends(get_claims),
) -> dict:
    user_id = claims.get("sub") or "anonymous"
    with get_pool().connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "DELETE FROM ai_conversations WHERE id = %s AND user_id = %s RETURNING id",
                (conversation_id, user_id),
            )
            deleted = cur.fetchone()
            if not deleted:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Conversation introuvable")
    return {"deleted": True, "id": str(conversation_id)}


@router.patch("/conversations/{conversation_id}")
def rename_conversation(
    conversation_id: UUID,
    body: RenameConversationRequest,
    claims: dict = Depends(get_claims),
) -> dict:
    user_id = claims.get("sub") or "anonymous"
    now = datetime.now(timezone.utc)
    new_title = body.title.strip()
    if not new_title:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Le titre ne peut pas être vide")
    with get_pool().connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE ai_conversations
                SET title = %s, updated_at = %s
                WHERE id = %s AND user_id = %s
                RETURNING id, title
                """,
                (new_title, now, conversation_id, user_id),
            )
            updated = cur.fetchone()
            if not updated:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Conversation introuvable")
    return {"id": str(updated[0]), "title": updated[1], "updatedAt": now.isoformat()}


def _prepare_conversation_and_history(
    conversation_id: UUID,
    user_id: str,
    user_content: str,
    farm_id: UUID | None,
) -> tuple[UUID, list[dict]]:
    now = datetime.now(timezone.utc)
    user_msg_id = uuid4()
    snippet_title = user_content.strip().replace("\n", " ")[:60]

    with get_pool().connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT user_id, title, farm_id FROM ai_conversations WHERE id = %s",
                (conversation_id,),
            )
            conv = cur.fetchone()
            if not conv:
                cur.execute(
                    """
                    INSERT INTO ai_conversations (id, user_id, farm_id, title, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (conversation_id, user_id, farm_id, snippet_title or "Nouvelle conversation", now, now),
                )
                effective_farm_id = farm_id
            else:
                if conv[0] != user_id:
                    raise HTTPException(status.HTTP_403_FORBIDDEN, "Accès refusé à cette conversation")
                effective_farm_id = farm_id or conv[2]
                new_title = snippet_title if conv[1] == "Nouvelle conversation" and snippet_title else conv[1]
                cur.execute(
                    "UPDATE ai_conversations SET title = %s, updated_at = %s WHERE id = %s",
                    (new_title, now, conversation_id),
                )

            cur.execute(
                """
                INSERT INTO ai_messages (id, conversation_id, role, content, status, created_at)
                VALUES (%s, %s, 'user', %s, 'complete', %s)
                """,
                (user_msg_id, conversation_id, user_content, now),
            )

            cur.execute(
                """
                SELECT role, content
                FROM ai_messages
                WHERE conversation_id = %s AND status = 'complete'
                ORDER BY created_at ASC
                LIMIT 20
                """,
                (conversation_id,),
            )
            history_rows = cur.fetchall()

    farm_context = _build_farm_context(user_id, effective_farm_id)
    messages = [{"role": "system", "content": _system_prompt(farm_context)}]
    for r_role, r_content in history_rows:
        if r_role in ("user", "assistant"):
            messages.append({"role": r_role, "content": r_content})
    return user_msg_id, messages


@router.post("/conversations/{conversation_id}/messages")
def send_message_sync(
    conversation_id: UUID,
    body: SendMessageRequest,
    claims: dict = Depends(get_claims),
) -> dict:
    user_id = claims.get("sub") or "anonymous"
    _, messages = _prepare_conversation_and_history(
        conversation_id, user_id, body.content, body.farm_id
    )
    assistant_msg_id = uuid4()
    now = datetime.now(timezone.utc)

    try:
        with _open_deepseek_request(messages, stream=False) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            answer = data["choices"][0]["message"]["content"]
            tokens = data.get("usage", {}).get("total_tokens")
    except Exception as exc:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, str(exc)) from exc

    with get_pool().connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO ai_messages (id, conversation_id, role, content, status, token_usage, created_at)
                VALUES (%s, %s, 'assistant', %s, 'complete', %s, %s)
                """,
                (assistant_msg_id, conversation_id, answer, tokens, now),
            )
            cur.execute(
                "UPDATE ai_conversations SET updated_at = %s WHERE id = %s",
                (now, conversation_id),
            )

    return {
        "messageId": str(assistant_msg_id),
        "conversationId": str(conversation_id),
        "role": "assistant",
        "content": answer,
        "status": "complete",
        "tokenUsage": tokens,
        "createdAt": now.isoformat(),
    }


@router.post("/conversations/{conversation_id}/stream")
def stream_message(
    conversation_id: UUID,
    body: SendMessageRequest,
    claims: dict = Depends(get_claims),
) -> StreamingResponse:
    user_id = claims.get("sub") or "anonymous"
    _, messages = _prepare_conversation_and_history(
        conversation_id, user_id, body.content, body.farm_id
    )
    assistant_msg_id = uuid4()

    def event_generator() -> Iterator[str]:
        start_payload = json.dumps(
            {"messageId": str(assistant_msg_id), "conversationId": str(conversation_id)}
        )
        yield f"event: message.start\ndata: {start_payload}\n\n"

        accumulated: list[str] = []
        token_usage: int | None = None
        try:
            with _open_deepseek_request(messages, stream=True) as resp:
                for raw_line in resp:
                    line = raw_line.decode("utf-8", errors="ignore").strip()
                    if not line or not line.startswith("data:"):
                        continue
                    data_str = line[5:].strip()
                    if data_str == "[DONE]":
                        break
                    try:
                        chunk = json.loads(data_str)
                    except json.JSONDecodeError:
                        continue
                    if "usage" in chunk and chunk["usage"]:
                        token_usage = chunk["usage"].get("total_tokens")
                    choices = chunk.get("choices") or []
                    if not choices:
                        continue
                    delta = choices[0].get("delta") or {}
                    text_piece = delta.get("content")
                    if text_piece:
                        accumulated.append(text_piece)
                        delta_payload = json.dumps({"text": text_piece}, ensure_ascii=False)
                        yield f"event: message.delta\ndata: {delta_payload}\n\n"

            full_text = "".join(accumulated).strip()
            now = datetime.now(timezone.utc)
            if full_text:
                with get_pool().connection() as conn:
                    with conn.cursor() as cur:
                        cur.execute(
                            """
                            INSERT INTO ai_messages (id, conversation_id, role, content, status, token_usage, created_at)
                            VALUES (%s, %s, 'assistant', %s, 'complete', %s, %s)
                            """,
                            (assistant_msg_id, conversation_id, full_text, token_usage, now),
                        )
                        cur.execute(
                            "UPDATE ai_conversations SET updated_at = %s WHERE id = %s",
                            (now, conversation_id),
                        )
            complete_payload = json.dumps(
                {
                    "messageId": str(assistant_msg_id),
                    "conversationId": str(conversation_id),
                    "status": "complete",
                    "tokenUsage": token_usage,
                }
            )
            yield f"event: message.complete\ndata: {complete_payload}\n\n"
        except Exception as exc:
            partial_text = "".join(accumulated).strip()
            if partial_text:
                try:
                    with get_pool().connection() as conn:
                        with conn.cursor() as cur:
                            cur.execute(
                                """
                                INSERT INTO ai_messages (id, conversation_id, role, content, status, created_at)
                                VALUES (%s, %s, 'assistant', %s, 'incomplete', %s)
                                """,
                                (assistant_msg_id, conversation_id, partial_text, datetime.now(timezone.utc)),
                            )
                except Exception:
                    pass
            err_payload = json.dumps({"messageId": str(assistant_msg_id), "error": str(exc)}, ensure_ascii=False)
            yield f"event: message.error\ndata: {err_payload}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

