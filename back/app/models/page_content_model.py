from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Identity, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.app_user_model import AppUser

PAGE_KEY_MAX_LENGTH = 50
TITLE_MAX_LENGTH = 255


class PageContent(Base):
    __tablename__ = "page_content"

    id: Mapped[int] = mapped_column(Integer, Identity(), primary_key=True)
    page_key: Mapped[str] = mapped_column(String(PAGE_KEY_MAX_LENGTH), unique=True)
    title: Mapped[str] = mapped_column(String(TITLE_MAX_LENGTH))
    body: Mapped[str] = mapped_column(Text)
    updated_by: Mapped[int | None] = mapped_column(ForeignKey("app_user.id", ondelete="SET NULL"), index=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    editor: Mapped["AppUser | None"] = relationship(back_populates="edited_page_contents")
