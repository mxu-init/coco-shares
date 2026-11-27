from pydantic import BaseModel, ConfigDict

from app.core.enums import HealthStatus


class HealthRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    status: HealthStatus
