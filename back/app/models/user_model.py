from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, DateTime, Enum, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.enums import PersonType, UserRole

NAME_MAX_LENGTH = 150
EMAIL_MAX_LENGTH = 150
PASSWORD_HASH_MAX_LENGTH = 128
TAX_ID_MAX_LENGTH = 9
PHONE_MAX_LENGTH = 16
ADDRESS_MAX_LENGTH = 500


class User(Base):
    __tablename__ = "app_user"
    __table_args__ = (
        CheckConstraint(
            "person_type IS NULL"
            " OR (person_type = 'individual' AND last_name IS NOT NULL)"
            " OR (person_type = 'legal_entity' AND last_name IS NULL)",
            name="ck_app_user_last_name_matches_person_type",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    role: Mapped[UserRole] = mapped_column(
        Enum(
            UserRole,
            name="user_role",
            values_callable=lambda enum_class: [member.value for member in enum_class],
        )
    )
    email: Mapped[str] = mapped_column(String(EMAIL_MAX_LENGTH), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(PASSWORD_HASH_MAX_LENGTH))
    must_change_password: Mapped[bool] = mapped_column(Boolean, default=True)
    person_type: Mapped[PersonType | None] = mapped_column(
        Enum(
            PersonType,
            name="person_type",
            values_callable=lambda enum_class: [member.value for member in enum_class],
        )
    )
    first_name: Mapped[str | None] = mapped_column(String(NAME_MAX_LENGTH))
    last_name: Mapped[str | None] = mapped_column(String(NAME_MAX_LENGTH))
    tax_id: Mapped[str | None] = mapped_column(String(TAX_ID_MAX_LENGTH), unique=True, index=True)
    phone: Mapped[str | None] = mapped_column(String(PHONE_MAX_LENGTH))
    address: Mapped[str | None] = mapped_column(String(ADDRESS_MAX_LENGTH))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )