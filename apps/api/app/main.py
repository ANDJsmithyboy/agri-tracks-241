from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .db import init_db
from .routers import farms_router, router


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.database_url and settings.auto_init_db:
        init_db()
    yield


app = FastAPI(
    title="POUFA API",
    version="0.1.0",
    description="API métier POUFA — synchronisation offline-first, Neon PostgreSQL, auth Clerk.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(farms_router)
