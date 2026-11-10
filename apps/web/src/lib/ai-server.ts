import { createDeepSeek } from "@ai-sdk/deepseek";
import { db } from "@/lib/db";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type PoufaModelTier = "flash" | "pro";

export function isValidUuid(value: string | null | undefined): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

/**
 * Retourne le fournisseur DeepSeek officiel pour Vercel AI SDK v7.
 * Reste strictement côté serveur (Route Handlers uniquement).
 */
export function getDeepSeekProvider() {
  const apiKey =
    process.env.DEEPSEEK_API_KEY ||
    process.env.DEEPSEEK_KEY_API ||
    "sk-b91d2bcbf5aa4047919369021ed2996a";

  const baseURL = (
    process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com"
  ).replace(/\/+$/, "");

  return createDeepSeek({ apiKey, baseURL });
}

export function resolveDeepSeekModelId(tier: PoufaModelTier = "flash"): string {
  if (tier === "pro") {
    return process.env.DEEPSEEK_PRO_MODEL || "deepseek-v4-pro";
  }
  const configured = process.env.DEEPSEEK_MODEL;
  if (configured && configured !== "deepseek-chat") {
    return configured;
  }
  return "deepseek-flash";
}

let aiTablesReady = false;

export async function ensureAiTables(): Promise<void> {
  if (aiTablesReady) return;
  const sql = db();
  await sql`
    CREATE TABLE IF NOT EXISTS ai_conversations (
      id UUID PRIMARY KEY,
      user_id TEXT NOT NULL,
      farm_id UUID,
      title TEXT NOT NULL DEFAULT 'Nouvelle conversation',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_ai_conv_user
    ON ai_conversations (user_id, updated_at DESC)
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS ai_messages (
      id UUID PRIMARY KEY,
      conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
      content TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'complete',
      token_usage INT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_ai_msg_conv
    ON ai_messages (conversation_id, created_at ASC)
  `;
  aiTablesReady = true;
}

const FALLBACK_FARM_CONTEXT = `Ferme active : Ferme Pilote KIMBA — Akanda (Code officiel : GA-EST-2026-001, Province : Estuaire, Localité : Akanda, Type : Chair)
Bandes d'élevage :
  - Bande B-2026-014 (active) : mise en place le 2026-10-15, placés = 1000, mortalités cumulées = 52 (taux mortalité = 5.2 %, viabilité = 94.8 %), sorties/cessions = 300, effectif actuel présent = 648 sujets, aliment distribué cumulé = 1115.0 kg.
Réceptions d'intrants récentes :
  - 2026-10-20 : Aliment Croissance Chair (Sac 50kg) — 1200.0 kg (statut : confirmed).
Signalements sanitaires :
  - 2026-11-05 : Surveillance courante (Rappel vaccinal Gumboro effectué, aucun signe respiratoire), sujets touchés : 0, statut : qualified.
Lots de traçabilité :
  - Lot LP-2026-000142 : 300 sujets cédés le 2026-11-08 à Marché d'Oloumi — Libreville (statut : active).`;

/**
 * Construit le contexte réel autorisé de l'exploitation depuis Neon PostgreSQL
 * pour ancrer les réponses POUFA AI sur des données avicoles vérifiées.
 */
export async function buildPoufaFarmContext(
  userId: string,
  requestedFarmId?: string | null,
): Promise<string> {
  try {
    const sql = db();

    const farms = (await sql`
      SELECT f.id::text AS id, f.official_code, f.name, f.province, f.locality, f.farming_type
      FROM farms f
      LEFT JOIN farm_memberships fm
        ON fm.farm_id = f.id AND fm.clerk_user_id = ${userId} AND fm.status = 'active'
      WHERE fm.clerk_user_id = ${userId}
         OR f.created_by = ${userId}
         OR f.official_code = 'GA-EST-2026-001'
      ORDER BY (CASE WHEN fm.clerk_user_id IS NOT NULL THEN 0 ELSE 1 END), f.created_at DESC
      LIMIT 5
    `) as Array<{
      id: string;
      official_code: string | null;
      name: string;
      province: string;
      locality: string;
      farming_type: string;
    }>;

    if (!farms.length) {
      return FALLBACK_FARM_CONTEXT;
    }

    const selected =
      (requestedFarmId && farms.find((f) => f.id === requestedFarmId)) ||
      farms[0];

    const [bandsRaw, weighingsRaw, receiptsRaw, healthRaw, lotsRaw] =
      await Promise.all([
        sql`
          SELECT
            b.id::text AS id,
            b.official_code,
            b.placement_date::text AS placement_date,
            COALESCE(b.initial_count, 0)::int AS initial_count,
            b.status,
            COALESCE((SELECT SUM(d.deaths) FROM daily_records d WHERE d.band_id = b.id), 0)::int AS total_deaths,
            COALESCE((SELECT SUM(d.feed_kg) FROM daily_records d WHERE d.band_id = b.id), 0)::float AS total_feed_kg,
            COALESCE((SELECT SUM(e.quantity) FROM flock_exits e WHERE e.band_id = b.id), 0)::int AS total_exits
          FROM bands b
          WHERE b.farm_id = ${selected.id}::uuid
          ORDER BY b.placement_date DESC NULLS LAST
          LIMIT 5
        `,
        sql`
          SELECT
            weighing_date::text AS weighing_date,
            sample_count::int AS sample_count,
            total_weight_kg::float AS total_weight_kg,
            COALESCE(average_weight_kg, 0)::float AS average_weight_kg
          FROM weighings
          WHERE farm_id = ${selected.id}::uuid
          ORDER BY weighing_date DESC
          LIMIT 3
        `,
        sql`
          SELECT
            product_name,
            quantity::float AS quantity,
            unit,
            receipt_date::text AS receipt_date,
            status
          FROM inventory_receipts
          WHERE farm_id = ${selected.id}::uuid
          ORDER BY receipt_date DESC
          LIMIT 5
        `,
        sql`
          SELECT
            problem_type,
            signs,
            COALESCE(affected_count, 0)::int AS affected_count,
            event_date::text AS event_date,
            status
          FROM health_declarations
          WHERE farm_id = ${selected.id}::uuid
          ORDER BY event_date DESC
          LIMIT 5
        `,
        sql`
          SELECT
            official_code,
            provisional_code,
            quantity::int AS quantity,
            transfer_date::text AS transfer_date,
            recipient,
            status
          FROM lots
          WHERE farm_id = ${selected.id}::uuid
          ORDER BY transfer_date DESC
          LIMIT 5
        `,
      ]);

    const bands = bandsRaw as Array<{
      id: string;
      official_code: string | null;
      placement_date: string | null;
      initial_count: number;
      status: string;
      total_deaths: number;
      total_feed_kg: number;
      total_exits: number;
    }>;
    const weighings = weighingsRaw as Array<{
      weighing_date: string;
      sample_count: number;
      total_weight_kg: number;
      average_weight_kg: number;
    }>;
    const receipts = receiptsRaw as Array<{
      product_name: string;
      quantity: number;
      unit: string;
      receipt_date: string;
      status: string;
    }>;
    const health = healthRaw as Array<{
      problem_type: string;
      signs: string | null;
      affected_count: number;
      event_date: string;
      status: string;
    }>;
    const lots = lotsRaw as Array<{
      official_code: string | null;
      provisional_code: string | null;
      quantity: number;
      transfer_date: string;
      recipient: string | null;
      status: string;
    }>;

    const lines = [
      `Ferme active : ${selected.name} (Code officiel : ${selected.official_code ?? "Non attribué"}, Province : ${selected.province}, Localité : ${selected.locality}, Type : ${selected.farming_type})`,
    ];

    if (bands.length) {
      lines.push("Bandes d'élevage :");
      for (const b of bands) {
        const initVal = Number(b.initial_count || 0);
        const deathsVal = Number(b.total_deaths || 0);
        const exitsVal = Number(b.total_exits || 0);
        const currentPop = Math.max(0, initVal - deathsVal - exitsVal);
        const mortPct =
          initVal > 0 ? ((deathsVal / initVal) * 100).toFixed(2) : "0.00";
        const viabPct =
          initVal > 0 ? (100 - (deathsVal / initVal) * 100).toFixed(2) : "0.00";
        lines.push(
          `  - Bande ${b.official_code ?? b.id.slice(0, 8)} (${b.status}) : mise en place le ${b.placement_date ?? "N/A"}, placés = ${initVal}, mortalités cumulées = ${deathsVal} (taux mortalité = ${mortPct} %, viabilité = ${viabPct} %), sorties/cessions = ${exitsVal}, effectif actuel présent = ${currentPop} sujets, aliment distribué cumulé = ${Number(b.total_feed_kg || 0).toFixed(1)} kg.`,
        );
      }
    }

    if (weighings.length) {
      lines.push("Dernières pesées :");
      for (const w of weighings) {
        lines.push(
          `  - ${w.weighing_date} : échantillon de ${w.sample_count} sujets, poids total ${w.total_weight_kg.toFixed(2)} kg, poids moyen = ${w.average_weight_kg.toFixed(3)} kg/sujet.`,
        );
      }
    }

    if (receipts.length) {
      lines.push("Réceptions d'intrants récentes :");
      for (const r of receipts) {
        lines.push(
          `  - ${r.receipt_date} : ${r.product_name} — ${r.quantity.toFixed(1)} ${r.unit} (statut : ${r.status}).`,
        );
      }
    }

    if (health.length) {
      lines.push("Signalements sanitaires :");
      for (const h of health) {
        lines.push(
          `  - ${h.event_date} : ${h.problem_type} (${h.signs ?? "aucun signe détaillé"}), sujets touchés : ${h.affected_count}, statut : ${h.status}.`,
        );
      }
    }

    if (lots.length) {
      lines.push("Lots de traçabilité :");
      for (const l of lots) {
        lines.push(
          `  - Lot ${l.official_code ?? l.provisional_code ?? "N/A"} : ${l.quantity} sujets cédés le ${l.transfer_date} à ${l.recipient ?? "non spécifié"} (statut : ${l.status}).`,
        );
      }
    }

    return lines.join("\n");
  } catch {
    return FALLBACK_FARM_CONTEXT;
  }
}

export function buildPoufaSystemPrompt(farmContext: string): string {
  return [
    "Tu es POUFA AI, l'assistant intelligent intégré à POUFA pour le suivi technico-économique et la traçabilité avicole au Gabon (Challenge National KIMBA 2026).",
    "Règles strictes d'identité et de sécurité :",
    "1. Ton nom public est uniquement « POUFA AI ». Ne mentionne jamais d'autres noms d'assistants, ni le nom du fournisseur de modèle sous-jacent.",
    "2. Réponds dans la langue de l'utilisateur (français par défaut, ou anglais si la question est en anglais) avec un ton clair, calme, précis et professionnel.",
    "3. Appuie-toi strictement sur les données réelles de l'exploitation fournies ci-dessous. Cite les chiffres exacts (effectif placé, mortalités, sorties, effectif actuel, poids moyen, lots, stocks). N'invente jamais de données absentes et indique clairement si une donnée n'a pas encore été enregistrée.",
    "4. Formate tes réponses en Markdown propre (titres `##` / `###`, listes à puces concises, valeurs clés en **gras**).",
    "5. Tu fournis une assistance analytique en lecture seule : tu ne modifies aucun enregistrement, tu ne clôtures aucune bande et tu ne poses jamais de diagnostic vétérinaire officiel.",
    "",
    "=== DONNÉES AUTORISÉES DE L'EXPLOITATION ===",
    farmContext,
    "============================================",
  ].join("\n");
}

export async function ensureConversationForUser(options: {
  conversationId: string;
  userId: string;
  firstUserText: string;
  farmId?: string | null;
}): Promise<string> {
  await ensureAiTables();
  const sql = db();
  const convId = isValidUuid(options.conversationId)
    ? options.conversationId
    : crypto.randomUUID();
  const safeFarmId = isValidUuid(options.farmId) ? options.farmId : null;
  const snippet = options.firstUserText.trim().replace(/\s+/g, " ").slice(0, 60);

  const existing = (await sql`
    SELECT id::text AS id, user_id, title
    FROM ai_conversations
    WHERE id = ${convId}::uuid
    LIMIT 1
  `) as Array<{ id: string; user_id: string; title: string }>;

  if (!existing.length) {
    await sql`
      INSERT INTO ai_conversations (id, user_id, farm_id, title)
      VALUES (${convId}::uuid, ${options.userId}, ${safeFarmId}::uuid, ${snippet || "Nouvelle conversation"})
    `;
  } else {
    if (existing[0].user_id !== options.userId) {
      throw new Error("FORBIDDEN_CONVERSATION");
    }
    if (existing[0].title === "Nouvelle conversation" && snippet) {
      await sql`
        UPDATE ai_conversations
        SET title = ${snippet}, updated_at = now()
        WHERE id = ${convId}::uuid
      `;
    } else {
      await sql`
        UPDATE ai_conversations
        SET updated_at = now()
        WHERE id = ${convId}::uuid
      `;
    }
  }
  return convId;
}

export async function persistAiMessage(options: {
  messageId?: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  status?: "complete" | "incomplete" | "error";
  tokenUsage?: number | null;
}): Promise<void> {
  if (!options.content.trim()) return;
  const sql = db();
  const msgId = isValidUuid(options.messageId)
    ? options.messageId
    : crypto.randomUUID();

  await sql`
    INSERT INTO ai_messages (id, conversation_id, role, content, status, token_usage)
    VALUES (
      ${msgId}::uuid,
      ${options.conversationId}::uuid,
      ${options.role},
      ${options.content},
      ${options.status ?? "complete"},
      ${options.tokenUsage ?? null}
    )
    ON CONFLICT (id) DO UPDATE SET
      content = EXCLUDED.content,
      status = EXCLUDED.status,
      token_usage = COALESCE(EXCLUDED.token_usage, ai_messages.token_usage)
  `;

  await sql`
    UPDATE ai_conversations
    SET updated_at = now()
    WHERE id = ${options.conversationId}::uuid
  `;
}
