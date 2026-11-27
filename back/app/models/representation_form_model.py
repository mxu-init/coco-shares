from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Identity, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, string_enum
from app.core.enums import RepresentationFormStatus

if TYPE_CHECKING:
    from app.models.meeting_model import Meeting
    from app.models.shareholder_model import Shareholder

SENT_TO_MAX_LENGTH = 255


class RepresentationForm(Base):
    __tablename__ = "representation_form"
    __table_args__ = (UniqueConstraint("meeting_id", "shareholder_id"),)

    id: Mapped[int] = mapped_column(Integer, Identity(), primary_key=True)
    meeting_id: Mapped[int] = mapped_column(ForeignKey("meeting.id", ondelete="RESTRICT"))
    shareholder_id: Mapped[int] = mapped_column(ForeignKey("shareholder.id", ondelete="CASCADE"), index=True)
    sent_to: Mapped[str] = mapped_column(String(SENT_TO_MAX_LENGTH))
    sent_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    status: Mapped[RepresentationFormStatus] = mapped_column(string_enum(RepresentationFormStatus, "status"))

    meeting: Mapped["Meeting"] = relationship(back_populates="representation_forms")
    shareholder: Mapped["Shareholder"] = relationship(back_populates="representation_forms")
