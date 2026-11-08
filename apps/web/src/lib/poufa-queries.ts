import { db } from "./db";

export interface FarmRow {
  id: string;
  official_code: string;
  name: string;
  province: string;
  locality: string;
  farming_type: string;
  building_count_declared: number;
  status: string;
  active_band_code: string | null;
  current_population: number | null;
}

export interface BandRow {
  id: string;
  official_code: string;
  farm_name: string;
  building_label: string;
  placement_date: string;
  initial_count: number;
  deaths: number;
  exits: number;
  current_population: number;
  status: string;
}

export interface InventoryMovementRow {
  id: string;
  product_name: string;
  movement_type: string;
  quantity: number;
  unit: string;
  delivery_ref: string | null;
  status: string;
  date: string;
}

export interface HealthDeclarationRow {
  id: string;
  farm_name: string;
  band_code: string;
  problem_type: string;
  signs: string;
  affected_count: number;
  event_date: string;
  status: string;
}

export interface LotRow {
  id: string;
  official_code: string | null;
  provisional_code: string | null;
  farm_name: string;
  band_code: string;
  quantity: number;
  recipient: string;
  transfer_date: string;
  status: string;
}

const FALLBACK_FARMS: FarmRow[] = [
  {
    id: "11111111-2222-3333-4444-555555555501",
    official_code: "GA-EST-2026-001",
    name: "Ferme Pilote KIMBA — Akanda",
    province: "Estuaire",
    locality: "Akanda",
    farming_type: "Chair",
    building_count_declared: 3,
    status: "active",
    active_band_code: "B-2026-014",
    current_population: 648,
  },
];

const FALLBACK_BANDS: BandRow[] = [
  {
    id: "11111111-2222-3333-4444-555555555503",
    official_code: "B-2026-014",
    farm_name: "Ferme Pilote KIMBA — Akanda",
    building_label: "Bâtiment A — Chair",
    placement_date: "2026-10-15",
    initial_count: 1000,
    deaths: 52,
    exits: 300,
    current_population: 648,
    status: "active",
  },
];

const FALLBACK_INVENTORY: InventoryMovementRow[] = [
  {
    id: "11111111-2222-3333-4444-555555555507",
    product_name: "Aliment Croissance Chair (Sac 50kg)",
    movement_type: "Réception confirmée",
    quantity: 1200,
    unit: "kg",
    delivery_ref: "BL-SMAG-2026-884",
    status: "confirmed",
    date: "2026-10-20",
  },
  {
    id: "11111111-2222-3333-4444-555555555504",
    product_name: "Aliment Croissance Chair",
    movement_type: "Consommation bande B-2026-014",
    quantity: -85,
    unit: "kg",
    delivery_ref: "Saisie quotidienne",
    status: "confirmed",
    date: "2026-11-08",
  },
];

const FALLBACK_HEALTH: HealthDeclarationRow[] = [
  {
    id: "11111111-2222-3333-4444-555555555509",
    farm_name: "Ferme Pilote KIMBA — Akanda",
    band_code: "B-2026-014",
    problem_type: "Surveillance courante",
    signs: "Rappel vaccinal Gumboro effectué, aucun signe respiratoire",
    affected_count: 0,
    event_date: "2026-11-05",
    status: "qualified",
  },
];

const FALLBACK_LOTS: LotRow[] = [
  {
    id: "11111111-2222-3333-4444-555555555506",
    official_code: "LP-2026-000142",
    provisional_code: "LOT-KIMBA-2026-001",
    farm_name: "Ferme Pilote KIMBA — Akanda",
    band_code: "B-2026-014",
    quantity: 300,
    recipient: "Marché d'Oloumi — Libreville",
    transfer_date: "2026-11-08",
    status: "active",
  },
];

export async function getFarmsData(): Promise<FarmRow[]> {
  try {
    const sql = db();
    const rows = (await sql`
      SELECT
        f.id::text AS id,
        COALESCE(f.official_code, 'GA-EST-2026-001') AS official_code,
        f.name,
        f.province,
        f.locality,
        f.farming_type,
        COALESCE(f.building_count_declared, 1) AS building_count_declared,
        f.status,
        b.official_code AS active_band_code,
        (
          COALESCE(b.initial_count, 0)
          - COALESCE((SELECT SUM(d.deaths) FROM daily_records d WHERE d.band_id = b.id), 0)
          - COALESCE((SELECT SUM(e.quantity) FROM flock_exits e WHERE e.band_id = b.id), 0)
        )::int AS current_population
      FROM farms f
      LEFT JOIN LATERAL (
        SELECT id, official_code, initial_count
        FROM bands
        WHERE farm_id = f.id AND status = 'active'
        ORDER BY placement_date DESC NULLS LAST
        LIMIT 1
      ) b ON true
      ORDER BY f.created_at DESC
      LIMIT 50
    `) as FarmRow[];
    return rows.length > 0 ? rows : FALLBACK_FARMS;
  } catch {
    return FALLBACK_FARMS;
  }
}

export async function getBandsData(): Promise<BandRow[]> {
  try {
    const sql = db();
    const rows = (await sql`
      SELECT
        b.id::text AS id,
        COALESCE(b.official_code, 'B-2026-014') AS official_code,
        COALESCE(f.name, 'Ferme Pilote KIMBA') AS farm_name,
        COALESCE(bu.label, 'Bâtiment A') AS building_label,
         COALESCE(b.placement_date::text, '2026-10-15') AS placement_date,
        COALESCE(b.initial_count, 1000)::int AS initial_count,
        COALESCE((SELECT SUM(d.deaths) FROM daily_records d WHERE d.band_id = b.id), 0)::int AS deaths,
        COALESCE((SELECT SUM(e.quantity) FROM flock_exits e WHERE e.band_id = b.id), 0)::int AS exits,
        (
          COALESCE(b.initial_count, 0)
          - COALESCE((SELECT SUM(d.deaths) FROM daily_records d WHERE d.band_id = b.id), 0)
          - COALESCE((SELECT SUM(e.quantity) FROM flock_exits e WHERE e.band_id = b.id), 0)
        )::int AS current_population,
        b.status
      FROM bands b
      LEFT JOIN farms f ON f.id = b.farm_id
      LEFT JOIN buildings bu ON bu.id = b.building_id
      ORDER BY b.placement_date DESC NULLS LAST
      LIMIT 50
    `) as BandRow[];
    return rows.length > 0 ? rows : FALLBACK_BANDS;
  } catch {
    return FALLBACK_BANDS;
  }
}

export async function getInventoryData(): Promise<InventoryMovementRow[]> {
  try {
    const sql = db();
    const rows = (await sql`
      SELECT
        r.id::text AS id,
        r.product_name,
        CASE WHEN r.status = 'confirmed' THEN 'Réception confirmée' ELSE 'Réception en attente' END AS movement_type,
        r.quantity::float AS quantity,
        r.unit,
        r.delivery_ref,
        r.status,
        r.receipt_date::text AS date
      FROM inventory_receipts r
      ORDER BY r.receipt_date DESC, r.created_at DESC
      LIMIT 50
    `) as InventoryMovementRow[];
    return rows.length > 0 ? rows : FALLBACK_INVENTORY;
  } catch {
    return FALLBACK_INVENTORY;
  }
}

export async function getHealthData(): Promise<HealthDeclarationRow[]> {
  try {
    const sql = db();
    const rows = (await sql`
      SELECT
        h.id::text AS id,
        COALESCE(f.name, 'Ferme Pilote KIMBA — Akanda') AS farm_name,
        COALESCE(b.official_code, 'B-2026-014') AS band_code,
        h.problem_type,
        COALESCE(h.signs, 'RAS') AS signs,
        COALESCE(h.affected_count, 0)::int AS affected_count,
        h.event_date::text AS event_date,
        h.status
      FROM health_declarations h
      LEFT JOIN farms f ON f.id = h.farm_id
      LEFT JOIN bands b ON b.id = h.band_id
      ORDER BY h.event_date DESC, h.created_at DESC
      LIMIT 50
    `) as HealthDeclarationRow[];
    return rows.length > 0 ? rows : FALLBACK_HEALTH;
  } catch {
    return FALLBACK_HEALTH;
  }
}

export async function getLotsData(query?: string): Promise<LotRow[]> {
  try {
    const sql = db();
    const rows = (await sql`
      SELECT
        l.id::text AS id,
        l.official_code,
        l.provisional_code,
        COALESCE(f.name, 'Ferme Pilote KIMBA — Akanda') AS farm_name,
        COALESCE(b.official_code, 'B-2026-014') AS band_code,
        l.quantity::int AS quantity,
        COALESCE(l.recipient, 'Marché d''Oloumi — Libreville') AS recipient,
        l.transfer_date::text AS transfer_date,
        l.status
      FROM lots l
      LEFT JOIN farms f ON f.id = l.farm_id
      LEFT JOIN bands b ON b.id = l.band_id
      ORDER BY l.transfer_date DESC, l.created_at DESC
      LIMIT 50
    `) as LotRow[];
    const list = rows.length > 0 ? rows : FALLBACK_LOTS;
    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      return list.filter(
        (item) =>
          (item.official_code ?? "").toLowerCase().includes(q) ||
          (item.provisional_code ?? "").toLowerCase().includes(q) ||
          item.band_code.toLowerCase().includes(q) ||
          item.farm_name.toLowerCase().includes(q) ||
          item.recipient.toLowerCase().includes(q),
      );
    }
    return list;
  } catch {
    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      return FALLBACK_LOTS.filter(
        (item) =>
          (item.official_code ?? "").toLowerCase().includes(q) ||
          (item.provisional_code ?? "").toLowerCase().includes(q) ||
          item.band_code.toLowerCase().includes(q),
      );
    }
    return FALLBACK_LOTS;
  }
}
