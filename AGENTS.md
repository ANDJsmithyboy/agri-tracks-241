# POUFA — Suivi technico-économique & traçabilité avicole (Gabon)

Monorepo du système national POUFA. Cahier des charges : 68 fonctionnalités
(36 MVP obligatoires, 18 phase ultérieure, 5 à arbitrer, 9 évolutives).

## Structure

- `apps/web/` — Next.js 16 (App Router, TS strict, Tailwind v4, shadcn/ui,
  Geist, Clerk, Neon). Build : `npm --prefix apps/web run build -- --webpack`
  (Turbopack crash sur cette machine). Interface en français.
- `apps/android/` — Kotlin + Jetpack Compose (AGP 8.11.1, Kotlin 2.1.20,
  compileSdk 36, minSdk 26). Offline-first : Room + outbox + WorkManager.
  Build via GitHub Actions (`.github/workflows/android-ci.yml`).
- `apps/api/` — FastAPI + Neon + auth JWT Clerk. Sync push/pull idempotent.
  Lancer : `cd apps/api && uvicorn app.main:app --reload` (voir son README).

## Commandes (depuis la racine)

```bash
npm run dev      # http://localhost:3000 — apps/web
npm run build    # build de production
npm run lint     # ESLint
```

Ou depuis `apps/web` : `npm run dev|build|lint|start`.

## Conventions

- **UI en français** ; routes en français (`/tableau-de-bord`, `/fermes`…).
- Tokens design dans `apps/web/src/app/globals.css` (palette institutionnelle
  verte #176B45, thèmes clair/sombre/système). Ne pas hardcoder de couleurs.
- Navigation par rôle : `src/lib/roles.ts` + `src/lib/nav.ts`. Le sélecteur
  de rôle est un **aperçu dev** — la vraie autorisation vient du serveur.
- `components/ui/` = composants shadcn (ne pas éditer à la main, régénérer
  via `npx shadcn@latest add …`).
- États « en attente de synchro » : localStorage `poufa-pending-count`,
  événement `poufa:sync-changed` (voir `src/components/layout/sync-status.tsx`).
- Priorités fonctionnelles préservées : ne pas transformer une fonction
  « phase ultérieure » en MVP, ne pas inventer de seuils officiels.

## Intégrations

Clerk (auth web ✅ / Android à venir) → Neon (Postgres ✅ healthcheck) →
FastAPI (`apps/api` ✅ squelette sync) → DeepSeek (clé dans `.env.local`,
POUFA AI à venir) → PWA hors ligne → Android Kotlin (SLIDE 00 fait).
Voir `apps/web/.env.example` et `apps/api/.env.example`.
