from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.core.enums import PersonType, UserRole


class ShareholderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    representative_name: str | None
    representative_tax_id: str | None
    shares_count: int
    shares_percentage: Decimal
    share_capital: Decimal


class UserListRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: UserRole
    person_type: PersonType
    first_name: str
    last_name: str | None
    tax_id: str
    email: str
    phone: str | None
    is_active: bool
    created_at: datetime


class UserDetailRead(UserListRead):
    address: str | None
    updated_at: datetime
    shareholder: ShareholderRead | None = None


class UserPageRead(BaseModel):
    items: list[UserListRead]
    total: int
    page: int
    size: int