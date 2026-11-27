from fastapi import APIRouter

from app.api import app_user_router, health_router
from app.core.config import settings

api_router = APIRouter(prefix=settings.API_V1_PREFIX)
api_router.include_router(health_router.router)
api_router.include_router(app_user_router.router)