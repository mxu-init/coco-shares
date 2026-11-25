from fastapi import APIRouter

from app.core.enums import HealthStatus
from app.schemas.health_schema import HealthRead

router = APIRouter(prefix="/health", tags=["health"])


@router.get("", response_model=HealthRead)
def read_health() -> HealthRead:
    return HealthRead(status=HealthStatus.OK)
