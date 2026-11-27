from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Identity, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.app_user_model import AppUser
    from app.models.meeting_model import Meeting

TITLE_MAX_LENGTH = 255
FILE_PATH_MAX_LENGTH = 500


class Document(Base):
    __tablename__ = "document"

    id: Mapped[int] = mapped_column(Integer, Identity(), primary_key=True)
    meeting_id: Mapped[int] = mapped_column(ForeignKey("meeting.id", ondelete="CASCADE"), index=True)
    uploaded_by: Mapped[int | None] = mapped_column(ForeignKey("app_user.id", ondelete="SET NULL"), index=True)
    title: Mapped[str] = mapped_column(String(TITLE_MAX_LENGTH))
    file_path: Mapped[str] = mapped_column(String(FILE_PATH_MAX_LENGTH))
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    meeting: Mapped["Meeting"] = relationship(back_populates="documents")
    uploader: Mapped["AppUser | None"] = relationship(back_populates="uploaded_documents")
