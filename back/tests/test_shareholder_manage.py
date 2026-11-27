from decimal import Decimal

from pytest_bdd import given, parsers, scenarios, then, when
from sqlalchemy.orm import Session

from app.core.enums import MeetingType, PersonType, RepresentationFormStatus, UserRole
from app.core.security import create_access_token
from app.models import AppUser, Meeting, RepresentationForm, Shareholder

scenarios("shareholder_manage.feature")

UNKNOWN_USER_ID = 999999
EXISTING_SHAREHOLDER = {
    "shares_count": 1000,
    "shares_percentage": Decimal("10.0000"),
    "share_capital": Decimal("1000.00"),
}


def shareholder_path(user_id: int) -> str:
    return f"/api/v1/users/{user_id}/shareholder"


def bearer_headers(user: AppUser) -> dict[str, str]:
    token = create_access_token(subject=str(user.id), role=user.role)
    return {"Authorization": f"Bearer {token}"}


@given("an active admin is logged in", target_fixture="headers")
def admin_headers(create_user) -> dict[str, str]:
    return bearer_headers(create_user(UserRole.ADMIN))


@given(parsers.parse('a "{role}" is logged in instead'), target_fixture="headers")
def role_headers(create_user, role: str) -> dict[str, str]:
    return bearer_headers(create_user(UserRole(role)))


@given("a user with phone and address exists", target_fixture="user")
def create_user_with_contact(db_session: Session) -> AppUser:
    user = AppUser(
        role=UserRole.USER,
        person_type=PersonType.INDIVIDUAL,
        first_name="Ana",
        last_name="López García",
        tax_id="12345678Z",
        email="ana.lopez@correo.es",
        phone="600111222",
        address="Calle Mayor 1, Murcia",
        password_hash="hash",
    )
    db_session.add(user)
    db_session.commit()
    return user


@given("the user has no phone")
def remove_phone(db_session: Session, user: AppUser) -> None:
    user.phone = None
    db_session.commit()


@given("the user already has a shareholder record")
def add_shareholder(db_session: Session, user: AppUser) -> None:
    user.shareholder = Shareholder(**EXISTING_SHAREHOLDER)
    db_session.commit()


@given("the user already has a shareholder record with a representation form")
def add_shareholder_with_form(db_session: Session, user: AppUser) -> None:
    add_shareholder(db_session, user)
    meeting = Meeting(type=MeetingType.ORDINARY, title="Junta 2026", announcement="Anuncio", legal_terms="Bases")
    db_session.add(
        RepresentationForm(
            meeting=meeting,
            shareholder=user.shareholder,
            sent_to=user.email,
            status=RepresentationFormStatus.SENT,
        )
    )
    db_session.commit()


@when(
    parsers.parse(
        "the admin creates the shareholder record with {shares} shares, {percentage} percent and {capital} of capital"
    ),
    target_fixture="response",
)
def create_shareholder(client, headers, user: AppUser, shares: str, percentage: str, capital: str):
    body = {"shares_count": int(shares), "shares_percentage": percentage, "share_capital": capital}
    return client.post(shareholder_path(user.id), json=body, headers=headers)


@when("the admin creates a shareholder record for the user with id 999999", target_fixture="response")
def create_shareholder_for_unknown_user(client, headers):
    body = {"shares_count": 1, "shares_percentage": "1", "share_capital": "1"}
    return client.post(shareholder_path(UNKNOWN_USER_ID), json=body, headers=headers)


@when(
    parsers.parse('the admin changes the shares to {shares:d} and the representative name to "{name}"'),
    target_fixture="response",
)
def change_shares_and_representative(client, headers, user: AppUser, shares: int, name: str):
    body = {"shares_count": shares, "representative_name": name}
    return client.patch(shareholder_path(user.id), json=body, headers=headers)


@when(parsers.parse("the admin changes the percentage to {percentage}"), target_fixture="response")
def change_percentage(client, headers, user: AppUser, percentage: str):
    return client.patch(shareholder_path(user.id), json={"shares_percentage": percentage}, headers=headers)


@when("the admin deletes the shareholder record", target_fixture="response")
def delete_shareholder(client, headers, user: AppUser):
    return client.delete(shareholder_path(user.id), headers=headers)


@then(
    parsers.parse(
        "the user has a shareholder record with {shares:d} shares, {percentage} percent and {capital} of capital"
    )
)
def check_shareholder(db_session: Session, user: AppUser, shares: int, percentage: str, capital: str) -> None:
    db_session.expire_all()
    shareholder = db_session.get(AppUser, user.id).shareholder
    assert shareholder.shares_count == shares
    assert shareholder.shares_percentage == Decimal(percentage)
    assert shareholder.share_capital == Decimal(capital)


@then(parsers.parse('the representative name is "{name}"'))
def check_representative_name(db_session: Session, user: AppUser, name: str) -> None:
    db_session.expire_all()
    assert db_session.get(AppUser, user.id).shareholder.representative_name == name


@then(parsers.parse('the invalid field is "{field}"'))
def check_invalid_field(response, field: str) -> None:
    assert [error["loc"][-1] for error in response.json()["errors"]] == [field]


@then("the user has no shareholder record")
def check_no_shareholder(db_session: Session, user: AppUser) -> None:
    db_session.expire_all()
    assert db_session.get(AppUser, user.id).shareholder is None
