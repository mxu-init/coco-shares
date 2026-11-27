from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Identity, Integer, String, func, true
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, string_enum
from app.core.enums import PersonType, UserRole

if TYPE_CHECKING:
    from app.models.document_model import Document
    from app.models.meeting_model import Meeting
    from app.models.page_content_model import PageContent
    from app.models.shareholder_model import Shareholder

FIRST_NAME_MAX_LENGTH = 100
LAST_NAME_MAX_LENGTH = 150
TAX_ID_MAX_LENGTH = 20
EMAIL_MAX_LENGTH = 255
PHONE_MAX_LENGTH = 20
ADDRESS_MAX_LENGTH = 255
PASSWORD_HASH_MAX_LENGTH = 255


class AppUser(Base):
    __tablename__ = "app_user"

    id: Mapped[int] = mapped_column(Integer, Identity(), primary_key=True)
    role: Mapped[UserRole] = mapped_column(string_enum(UserRole, "role"))
    person_type: Mapped[PersonType] = mapped_column(string_enum(PersonType, "person_type"))
    first_name: Mapped[str] = mapped_column(String(FIRST_NAME_MAX_LENGTH))
    last_name: Mapped[str | None] = mapped_column(String(LAST_NAME_MAX_LENGTH))
    tax_id: Mapped[str] = mapped_column(String(TAX_ID_MAX_LENGTH), unique=True)
    email: Mapped[str] = mapped_column(String(EMAIL_MAX_LENGTH), unique=True)
    phone: Mapped[str | None] = mapped_column(String(PHONE_MAX_LENGTH))
    address: Mapped[str | None] = mapped_column(String(ADDRESS_MAX_LENGTH))
    password_hash: Mapped[str] = mapped_column(String(PASSWORD_HASH_MAX_LENGTH))
    must_change_password: Mapped[bool] = mapped_column(Boolean, default=True, server_default=true())
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default=true())
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    shareholder: Mapped["Shareholder | None"] = relationship(
        back_populates="user", cascade="all, delete-orphan", passive_deletes=True
    )
    created_meetings: Mapped[list["Meeting"]] = relationship(back_populates="creator", passive_deletes=True)
    uploaded_documents: Mapped[list["Document"]] = relationship(back_populates="uploader", passive_deletes=True)
    edited_page_contents: Mapped[list["PageContent"]] = relationship(back_populates="editor", passive_deletes=True)
