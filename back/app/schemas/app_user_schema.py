from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.enums import PersonType, UserRole
from app.core.tax_id_validators import normalize_tax_id
from app.models.app_user_model import (
    ADDRESS_MAX_LENGTH,
    EMAIL_MAX_LENGTH,
    FIRST_NAME_MAX_LENGTH,
    LAST_NAME_MAX_LENGTH,
    PHONE_MAX_LENGTH,
)
from app.models.shareholder_model import (
    MAX_SHARES_PERCENTAGE,
    MIN_SHARES_PERCENTAGE,
    REPRESENTATIVE_NAME_MAX_LENGTH,
    REPRESENTATIVE_TAX_ID_MAX_LENGTH,
    SHARE_CAPITAL_PRECISION,
    SHARE_CAPITAL_SCALE,
    SHARES_PERCENTAGE_PRECISION,
    SHARES_PERCENTAGE_SCALE,
)

PASSWORD_MIN_LENGTH = 8
EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
INVALID_INDIVIDUAL_TAX_ID_MESSAGE = "El DNI o NIE no es válido"
INVALID_LEGAL_ENTITY_TAX_ID_MESSAGE = "El NIF no es válido"
LAST_NAME_REQUIRED_MESSAGE = "Los apellidos son obligatorios en una persona física"
SHAREHOLDER_CONTACT_REQUIRED_MESSAGE = "El teléfono y la dirección son obligatorios en un accionista"


class ShareholderCreate(BaseModel):
    representative_name: str | None = Field(None, max_length=REPRESENTATIVE_NAME_MAX_LENGTH)
    representative_tax_id: str | None = Field(None, max_length=REPRESENTATIVE_TAX_ID_MAX_LENGTH)
    shares_count: int = Field(ge=0)
    shares_percentage: Decimal = Field(
        ge=MIN_SHARES_PERCENTAGE,
        le=MAX_SHARES_PERCENTAGE,
        max_digits=SHARES_PERCENTAGE_PRECISION,
        decimal_places=SHARES_PERCENTAGE_SCALE,
    )
    share_capital: Decimal = Field(ge=0, max_digits=SHARE_CAPITAL_PRECISION, decimal_places=SHARE_CAPITAL_SCALE)


class UserCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    role: UserRole
    person_type: PersonType
    first_name: str = Field(min_length=1, max_length=FIRST_NAME_MAX_LENGTH)
    last_name: str | None = Field(None, max_length=LAST_NAME_MAX_LENGTH)
    email: str = Field(max_length=EMAIL_MAX_LENGTH, pattern=EMAIL_PATTERN)
    tax_id: str
    password: str = Field(min_length=PASSWORD_MIN_LENGTH)
    phone: str | None = Field(None, max_length=PHONE_MAX_LENGTH)
    address: str | None = Field(None, max_length=ADDRESS_MAX_LENGTH)
    shareholder: ShareholderCreate | None = None

    @field_validator("email")
    @classmethod
    def lowercase_email(cls, email: str) -> str:
        return email.lower()

    @field_validator("tax_id")
    @classmethod
    def normalize_tax_id_value(cls, tax_id: str) -> str:
        return normalize_tax_id(tax_id)

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