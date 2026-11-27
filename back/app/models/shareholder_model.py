from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, CheckConstraint, ForeignKey, Identity, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.app_user_model import AppUser
    from app.models.representation_form_model import RepresentationForm

REPRESENTATIVE_NAME_MAX_LENGTH = 200
REPRESENTATIVE_TAX_ID_MAX_LENGTH = 20
SHARES_PERCENTAGE_PRECISION = 7
SHARES_PERCENTAGE_SCALE = 4
SHARE_CAPITAL_PRECISION = 15
SHARE_CAPITAL_SCALE = 2
MIN_SHARES_PERCENTAGE = 0
MAX_SHARES_PERCENTAGE = 100


class Shareholder(Base):
    __tablename__ = "shareholder"
    __table_args__ = (
        CheckConstraint("shares_count >= 0", name="shares_count_non_negative"),
        CheckConstraint(
            f"shares_percentage BETWEEN {MIN_SHARES_PERCENTAGE} AND {MAX_SHARES_PERCENTAGE}",
            name="shares_percentage_range",
        ),
        CheckConstraint("share_capital >= 0", name="share_capital_non_negative"),
    )

    id: Mapped[int] = mapped_column(Integer, Identity(), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("app_user.id", ondelete="CASCADE"), unique=True)
    representative_name: Mapped[str | None] = mapped_column(String(REPRESENTATIVE_NAME_MAX_LENGTH))
    representative_tax_id: Mapped[str | None] = mapped_column(String(REPRESENTATIVE_TAX_ID_MAX_LENGTH))
    shares_count: Mapped[int] = mapped_column(BigInteger)
    shares_percentage: Mapped[Decimal] = mapped_column(Numeric(SHARES_PERCENTAGE_PRECISION, SHARES_PERCENTAGE_SCALE))
    share_capital: Mapped[Decimal] = mapped_column(Numeric(SHARE_CAPITAL_PRECISION, SHARE_CAPITAL_SCALE))

    user: Mapped["AppUser"] = relationship(back_populates="shareholder")
    representation_forms: Mapped[list["RepresentationForm"]] = relationship(
        back_populates="shareholder", cascade="all, delete-orphan", passive_deletes=True
    )
