import uuid
from datetime import date

import psycopg
from fastapi import APIRouter, Depends, HTTPException
from psycopg.types.json import Jsonb

from ..auth import get_claims
from ..db import get_pool
from ..schemas import (
    FARMING_TYPES,
    GABON_PROVINCES,
    BandSummary,
    FarmCreate,
    FarmListResponse,
    FarmOut,
)

router = APIRouter(prefix="/api/v1/farms", tags=["farms"])


def _farm_row_to_out(row, band) -> FarmOut:
    f = row
    return FarmOut(
        id=str(f[0]), official_code=f[1], name=f[2], province=f[3],
        locality=f[4], farming_type=f[5], building_count_declared=f[6],
        status=f[7], membership_role=f[8], version=f[9],
        active_band=(
            BandSummary(
                id=str(band[0]), official_code=band[1],
                placement_date=band[2].isoformat() if band[2] else None,
                initial_count=band[3], current_population=band[4],
            ) if band else None
        ),
        created_at=f[10].isoformat(), updated_at=f[11].isoformat(),
    )


def _active_band(conn, farm_id: str):
    return conn.execute(
        """
        SELECT b.id, b.official_code, b.placement_date, b.initial_count,
               (b.initial_count - COALESCE(SUM(d.deaths),0)) AS pop
        FROM bands b
        LEFT JOIN daily_records d ON d.band_id = b.id
        WHERE b.farm_id = %s AND b.status = 'active'
        GROUP BY b.id ORDER BY b.placement_date DESC NULLS LAST LIMIT 1
        """,
        (farm_id,),
    ).fetchone()


@router.get("", response_model=FarmListResponse)
def list_farms(claims: dict = Depends(get_claims)) -> FarmListResponse:
    """Fermes autorisées pour l'utilisateur authentifié (membership actif)."""
    user = claims["sub"]
    with get_pool().connection() as conn:
        rows = conn.execute(
            """
            SELECT f.id, f.official_code, f.name, f.province, f.locality,
                   f.farming_type, f.building_count_declared, f.status,
                   m.membership_role, f.version, f.created_at, f.updated_at
            FROM farms f
            JOIN farm_memberships m ON m.farm_id = f.id
            WHERE m.clerk_user_id = %s AND m.status = 'active'
            ORDER BY f.created_at
            """,
            (user,),
        ).fetchall()
        farms = []
        for r in rows:
            band = _active_band(conn, str(r[0]))
            farms.append(_farm_row_to_out(r, band))
    return FarmListResponse(farms=farms)


@router.get("/{farm_id}", response_model=FarmOut)
def get_farm(farm_id: uuid.UUID, claims: dict = Depends(get_claims)) -> FarmOut:
    user = claims["sub"]
    with get_pool().connection() as conn:
        row = conn.execute(
            """
            SELECT f.id, f.official_code, f.name, f.province, f.locality,
                   f.farming_type, f.building_count_declared, f.status,
                   m.membership_role, f.version, f.created_at, f.updated_at
            FROM farms f JOIN farm_memberships m ON m.farm_id = f.id
            WHERE f.id = %s AND m.clerk_user_id = %s AND m.status = 'active'
            """,
            (str(farm_id), user),
        ).fetchone()
        if not row:
            raise HTTPException(404, {"code": "farm_not_found_or_forbidden"})
        band = _active_band(conn, str(farm_id))
    return _farm_row_to_out(row, band)


@router.post("", response_model=FarmOut, status_code=201)
def create_farm(body: FarmCreate, claims: dict = Depends(get_claims)) -> FarmOut:
    """
    Crée une ferme + membership owner dans une transaction.
    Idempotent via client_id (UUID généré par le client mobile).
    """
    user = claims["sub"]
    province = body.province.strip().lower()
    if province not in GABON_PROVINCES:
        raise HTTPException(422, {"code": "invalid_province"})
    if body.farming_type not in FARMING_TYPES:
        raise HTTPException(422, {"code": "invalid_farming_type"})

    farm_id = uuid.uuid4()
    with get_pool().connection() as conn:
        try:
            with conn.transaction():
                # Idempotence : même client_id → retourne la ferme existante
                if body.client_id:
                    existing = conn.execute(
                        "SELECT id FROM farms WHERE created_by=%s AND client_id=%s",
                        (user, str(body.client_id)),
                    ).fetchone()
                    if existing:
                        row = conn.execute(
                            """
                            SELECT f.id, f.official_code, f.name, f.province, f.locality,
                                   f.farming_type, f.building_count_declared, f.status,
                                   m.membership_role, f.version, f.created_at, f.updated_at
                            FROM farms f JOIN farm_memberships m ON m.farm_id=f.id
                            WHERE f.id=%s AND m.clerk_user_id=%s
                            """,
                            (str(existing[0]), user),
                        ).fetchone()
                        return _farm_row_to_out(row, None)

                conn.execute(
                    """
                    INSERT INTO farms
                        (id, name, province, locality, farming_type,
                         building_count_declared, created_by, client_id)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
                    """,
                    (
                        str(farm_id), body.name.strip(), province,
                        body.locality.strip(), body.farming_type,
                        body.building_count_declared, user,
                        str(body.client_id) if body.client_id else None,
                    ),
                )
                conn.execute(
                    """
                    INSERT INTO farm_memberships (farm_id, clerk_user_id, membership_role)
                    VALUES (%s, %s, 'owner')
                    """,
                    (str(farm_id), user),
                )
                conn.execute(
                    """
                    INSERT INTO audit_log (actor_id, entity_type, entity_id, action, detail)
                    VALUES (%s, 'farm', %s, 'farm.created', %s)
                    """,
                    (user, str(farm_id), Jsonb({"name": body.name.strip(), "province": province})),
                )
        except psycopg.errors.UniqueViolation:
            raise HTTPException(409, {"code": "farm_duplicate"})

        row = conn.execute(
            """
            SELECT f.id, f.official_code, f.name, f.province, f.locality,
                   f.farming_type, f.building_count_declared, f.status,
                   m.membership_role, f.version, f.created_at, f.updated_at
            FROM farms f JOIN farm_memberships m ON m.farm_id=f.id
            WHERE f.id=%s AND m.clerk_user_id=%s
            """,
            (str(farm_id), user),
        ).fetchone()
    return _farm_row_to_out(row, None)
