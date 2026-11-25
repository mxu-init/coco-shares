from fastapi import APIRouter

from app.api import test_routes
from app.core.config import settings

api_router = APIRouter(prefix=settings.API_V1_PREFIX)

api_router.include_router(test_routes.router)
