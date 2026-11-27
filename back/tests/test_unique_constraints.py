from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime, timezone
from decimal import Decimal

import pytest
from pytest_bdd import given, parsers, scenarios, then, when
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.enums import MeetingStatus, MeetingType, PersonType, RepresentationFormStatus, UserRole
from app.models import AppUser, Meeting, MeetingCall, RepresentationForm, Shareholder

scenarios("unique_constraints.feature")

FIRST_CALL_NUMBER = 1
CALL_STARTS_AT = datetime(2027, 6, 22, 10, tzinfo=timezone.utc)
REPRESENTATION_EMAIL = "juntas@example.com"


@dataclass
class ExistingData:
    user: AppUser
    shareholder: Shareholder
    meeting: Meeting


def build_user(email: str, tax_id: str) -> AppUser:
    return AppUser(
        role=UserRole.USER,
        person_type=PersonType.INDIVIDUAL,
        first_name="Ana",
        last_name="García",
        tax_id=tax_id,
        email=email,
        password_hash="hash",
    )


def build_shareholder(user: AppUser) -> Shareholder:
    return Shareholder(user=user, shares_count=100, shares_percentage=Decimal("1.5"), share_capital=Decimal("600"))


def build_call(meeting: Meeting) -> MeetingCall:
    return MeetingCall(meeting=meeting, call_number=FIRST_CALL_NUMBER, starts_at=CALL_STARTS_AT, location="Madrid")


def build_representation_form(existing: ExistingData) -> RepresentationForm:
    return RepresentationForm(
        meeting=existing.meeting,
        shareholder=existing.shareholder,
        sent_to=REPRESENTATION_EMAIL,
        status=RepresentationFormStatus.SENT,
    )


DUPLICATE_BUILDERS: dict[str, Callable[[ExistingData], object]] = {
    "a user with the same email": lambda existing: build_user(existing.user.email, "11111111H"),
    "a user with the same tax id": lambda existing: build_user("otra@example.com", existing.user.tax_id),
    "a second shareholder record for the same user": lambda existing: build_shareholder(existing.user),
    "a second call with the same number": lambda existing: build_call(existing.meeting),
    "a second representation form for the same meeting": build_representation_form,
}


@given(
    "a published meeting with a shareholder who has sent a representation form",
    target_fixture="existing",
)
def create_existing_data(db_session: Session) -> ExistingData:
    user = build_user("ana@example.com", "12345678Z")
    shareholder = build_shareholder(user)
    meeting = Meeting(
        type=MeetingType.ORDINARY,
        title="Junta General Ordinaria",
        announcement="Anuncio",
        legal_terms="Marco legal",
        status=MeetingStatus.PUBLISHED,
    )
    existing = ExistingData(user=user, shareholder=shareholder, meeting=meeting)
    db_session.add_all([user, shareholder, meeting, build_call(meeting), build_representation_form(existing)])
    db_session.commit()
    return existing


@when(parsers.parse("{duplicate} is saved"), target_fixture="save_duplicate")
def prepare_duplicate(db_session: Session, existing: ExistingData, duplicate: str) -> Callable[[], None]:
    def save_duplicate() -> None:
        db_session.add(DUPLICATE_BUILDERS[duplicate](existing))
        db_session.commit()

    return save_duplicate


@then("the database rejects it")
def check_rejected(db_session: Session, save_duplicate: Callable[[], None]) -> None:
    with pytest.raises(IntegrityError):
        save_duplicate()
    db_session.rollback()
