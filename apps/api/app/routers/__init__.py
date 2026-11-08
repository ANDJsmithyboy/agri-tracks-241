from .ai import router as ai_router
from .farms import router as farms_router
from .sync import router

__all__ = ["router", "farms_router", "ai_router"]
