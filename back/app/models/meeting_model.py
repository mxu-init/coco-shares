from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Identity, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, string_enum
from app.core.enums import MeetingStatus, MeetingType

if TYPE_CHECKING:
    from app.models.app_user_model import AppUser
    from app.models.document_model import Document
    from app.models.meeting_call_model import MeetingCall
    from app.models.representation_form_model import RepresentationForm

TITLE_MAX_LENGTH = 255


class Meeting(Base):
    __tablename__ = "meeting"

    id: Mapped[int] = mapped_column(Integer, Identity(), primary_key=True)
    created_by: Mapped[int | None] = mapped_column(ForeignKey("app_user.id", ondelete="SET NULL"), index=True)
    type: Mapped[MeetingType] = mapped_column(string_enum(MeetingType, "type"))
    title: Mapped[str] = mapped_column(String(TITLE_MAX_LENGTH))
    announcement: Mapped[str] = mapped_column(Text)
    legal_terms: Mapped[str] = mapped_column(Text)
    status: Mapped[MeetingStatus] = mapped_column(string_enum(MeetingStatus, "status"), default=MeetingStatus.DRAFT)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    creator: Mapped["AppUser | None"] = relationship(back_populates="created_meetings")
    calls: Mapped[list["MeetingCall"]] = relationship(
        back_populates="meeting",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="MeetingCall.call_number",
    )
    documents: Mapped[list["Document"]] = relationship(
        back_populates="meeting", cascade="all, delete-orphan", passive_deletes=True
    )
    representation_forms: Mapped[list["RepresentationForm"]] = relationship(
        back_populates="meeting", passive_deletes="all"
    )
