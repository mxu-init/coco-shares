from fastapi import APIRouter

from app.api import health_router
from app.core.config import settings

api_router = APIRouter(prefix=settings.API_V1_PREFIX)
api_router.include_router(health_router.router)
