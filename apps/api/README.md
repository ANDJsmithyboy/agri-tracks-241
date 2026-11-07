# POUFA API — FastAPI + Neon + Clerk

API métier POUFA : synchronisation offline-first (push/pull idempotent),
auth par JWT de session Clerk, Neon PostgreSQL.

## Installation

```bash
cd apps/api
python -m venv .venv && .venv\Scripts\activate   # Windows
pip install -r requirements.txt
copy .env.example .env   # puis remplir DATABASE_URL + CLERK_*
uvicorn app.main:app --reload --port 8000
```

## Endpoints

| Méthode | Route | Auth | Rôle |
|---|---|---|---|
| GET | `/api/v1/health` | non | santé + DB |
| GET | `/api/v1/me` | Clerk JWT | identité utilisateur |
| POST | `/api/v1/sync/push` | Clerk JWT | ops client → serveur (idempotent UUID) |
| GET | `/api/v1/sync/pull` | Clerk JWT | curseur incrémental serveur → client |
| GET | `/api/v1/sync/status` | Clerk JWT | état de la file serveur |

## Contrat de synchronisation

- Chaque opération porte un `op_id` UUID immuable généré côté client.
- `INSERT … ON CONFLICT DO NOTHING` → `accepted` ou `duplicate`, jamais de double traitement.
- Le statut « pending » côté serveur est réservé aux ops reçues mais non
  encore appliquées au domaine métier (schéma métier à venir).

## À venir

- Schéma métier Neon (farms, flocks, daily_records, lots, inventory_ledger…).
- Application des ops dans les tables métier avec règles de gestion.
- `/api/v1/farms`, `/flocks`, `/lots`, `/attachments`, `/business-rules`.
