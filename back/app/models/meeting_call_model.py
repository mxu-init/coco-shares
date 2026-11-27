from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Identity, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.meeting_model import Meeting

FIRST_CALL_NUMBER = 1
SECOND_CALL_NUMBER = 2
LOCATION_MAX_LENGTH = 255
ONLINE_URL_MAX_LENGTH = 500


class MeetingCall(Base):
    __tablename__ = "meeting_call"
    __table_args__ = (
        UniqueConstraint("meeting_id", "call_number"),
        CheckConstraint(f"call_number IN ({FIRST_CALL_NUMBER}, {SECOND_CALL_NUMBER})", name="call_number_valid"),
    )

    id: Mapped[int] = mapped_column(Integer, Identity(), primary_key=True)
    meeting_id: Mapped[int] = mapped_column(ForeignKey("meeting.id", ondelete="CASCADE"))
    call_number: Mapped[int] = mapped_column(Integer)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    location: Mapped[str | None] = mapped_column(String(LOCATION_MAX_LENGTH))
    online_url: Mapped[str | None] = mapped_column(String(ONLINE_URL_MAX_LENGTH))

    meeting: Mapped["Meeting"] = relationship(back_populates="calls")
