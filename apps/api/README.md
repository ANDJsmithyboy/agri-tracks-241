# POUFA Backend API 🇬🇦
> API REST haute performance pour la plateforme avicole **POUFA** — FastAPI, Neon PostgreSQL (pgvector ready), Clerk Auth & DeepSeek AI streaming.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/Neon-PostgreSQL-00E599?logo=postgresql&logoColor=white)](https://neon.tech/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk%20JWT-6C47FF?logo=clerk&logoColor=white)](https://clerk.com/)
[![DeepSeek](https://img.shields.io/badge/AI-DeepSeek%20SSE-0066FF)](https://www.deepseek.com/)

---

## ⚡ Fonctionnalités Clés

- **Synchronisation Offline-First Idempotente** :
  - Support de la réplication bidirectionnelle avec l'application native Android (Room DB).
  - Chaque opération possède un `op_id` immuable généré côté client (`INSERT ... ON CONFLICT DO NOTHING`).
  - Endpoints push / pull incrémentaux avec curseur temporel.
- **Authentification Sécurisée Clerk** :
  - Vérification cryptographique des JWT de session Clerk via JWKS (`RS256`).
  - Validation fine des claims (`iss`, `aud`/`azp`).
- **POUFA AI Conversationnel en Streaming SSE** :
  - Endpoint `/api/v1/ai/chat/stream` en Server-Sent Events (SSE).
  - Intégration DeepSeek avec injection du contexte avicole gabonais et historique persisté.
- **Base de Données Neon Serverless** :
  - Pool de connexions optimisé avec `psycopg_pool` pour PostgreSQL.
  - Auto-initialisation des tables et schémas relationnels.

---

## 🚀 Démarrage Rapide

### 1. Prérequis
- Python 3.11+
- Git

### 2. Cloner et préparer l'environnement
```bash
git clone https://github.com/ANDJsmithyboy/Fastapi-poufa.git
cd Fastapi-poufa

# Création du venv
python -m venv .venv

# Activation (Windows PowerShell)
.venv\Scripts\Activate.ps1
# Activation (Linux / macOS)
source .venv/bin/activate

# Installation des dépendances
pip install -r requirements.txt
```

### 3. Configuration des variables d'environnement
Copiez `.env.example` vers `.env` et complétez vos identifiants :
```bash
cp .env.example .env
```

Variables requises :
```ini
DATABASE_URL=postgresql://...
CLERK_ISSUER=https://...
CLERK_JWKS_URL=https://.../.well-known/jwks.json
CLERK_AUTHORIZED_PARTIES=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
DEEPSEEK_API_KEY=sk-...
```

### 4. Lancer le serveur
```bash
uvicorn app.main:app --reload --port 8000
```
L'API est accessible sur `http://127.0.0.1:8000`.  
La documentation Swagger interactive est disponible sur `http://127.0.0.1:8000/docs`.

---

## 📡 Endpoints Principaux

| Méthode | Route | Auth | Rôle |
|---|---|---|---|
| `GET` | `/api/v1/health` | Non | Healthcheck & connectivité Neon |
| `GET` | `/api/v1/me` | Clerk JWT | Profil utilisateur connecté |
| `POST` | `/api/v1/sync/push` | Clerk JWT | Réception des opérations mobiles (idempotent) |
| `GET` | `/api/v1/sync/pull` | Clerk JWT | Curseur incrémental serveur → client |
| `GET` | `/api/v1/sync/status` | Clerk JWT | État de la file de synchronisation |
| `GET` | `/api/v1/farms` | Clerk JWT | Liste des fermes de l'utilisateur |
| `POST` | `/api/v1/ai/chat/stream`| Clerk JWT | Streaming SSE conversationnel DeepSeek |
| `GET` | `/api/v1/ai/conversations`| Clerk JWT | Historique des conversations IA |

---

## 🐳 Déploiement Docker

Un `Dockerfile` optimisé multi-stage est inclus :
```bash
docker build -t poufa-api .
docker run -p 8000:8000 --env-file .env poufa-api
```

---

## 🛡️ Licence
Propriétaire — POUFA Gabon / SmartANDJ. Tous droits réservés.
