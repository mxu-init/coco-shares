from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ShareholderPublicRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: str | None
    representative_name: str | None
    shares_count: int
    shares_percentage: Decimal
    share_capital: Decimal


class ShareholderPublicPageRead(BaseModel):
    items: list[ShareholderPublicRead]
    total: int
    page: int
    size: int


class ShareholderUpdate(BaseModel):
    representative_name: str | None = None
    representative_tax_id: str | None = None
    shares_count: int | None = None
    shares_percentage: Decimal | None = None
    share_capital: Decimal | None = None
