import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .db import init_db
from .routers import ai_router, farms_router, router

logger = logging.getLogger("poufa.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.database_url and settings.auto_init_db:
        try:
            init_db()
            logger.info("Database initialized successfully.")
        except Exception as exc:
            logger.warning("Database init deferred or failed: %s", exc)
    yield


app = FastAPI(
    title="POUFA API",
    version="0.3.0",
    description="API métier POUFA — synchronisation offline-first, Neon PostgreSQL, auth Clerk, POUFA AI.",
    lifespan=lifespan,
)

# Configuration CORS stricte avec allowlist explicite des domaines POUFA
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["system"])
def root():
    return {
        "name": "POUFA API",
        "version": "0.3.0",
        "status": "online",
        "challenge": "KIMBA 2026",
    }


@app.get("/health", tags=["system"])
def health():
    return {"ok": True, "status": "healthy"}


app.include_router(router)
app.include_router(farms_router)
app.include_router(ai_router)
