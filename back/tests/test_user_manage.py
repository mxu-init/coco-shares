from collections.abc import Callable
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from httpx import Response
from pytest_bdd import given, parsers, scenarios, then, when
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.core.enums import MeetingType, RepresentationFormStatus, UserRole
from app.core.exceptions import ConflictError
from app.core.security import create_access_token, hash_password, verify_password
from app.models import AppUser, Meeting, RepresentationForm, Shareholder
from app.services import app_user_service

scenarios("user_manage.feature")

USERS_PATH = "/api/v1/users"
CURRENT_USER_PATH = "/api/v1/auth/me"
LOGIN_PATH = "/api/v1/auth/token"
OLD_PASSWORD = "old_password"
VALID_INDIVIDUAL_TAX_ID = "12345678Z"
SHAREHOLDER_PHONE = "600000000"
SHAREHOLDER_ADDRESS = "Calle Mayor 1, Murcia"
REPRESENTATION_EMAIL = "juntas@cohispania.com"
LAST_ACTIVE_ADMIN_MESSAGE = "Debe quedar al menos un administrador activo"
FOREIGN_KEYS_PRAGMA = "PRAGMA foreign_keys=ON"


def bearer_headers(user: AppUser) -> dict[str, str]:
    token = create_access_token(subject=str(user.id), role=user.role)
    return {"Authorization": f"Bearer {token}"}


@given("an active admin is logged in", target_fixture="admin")
def save_admin(create_user: Callable[..., AppUser]) -> AppUser:
    return create_user(UserRole.ADMIN)


@given(parsers.parse('a user with the role "{role}" exists'), target_fixture="user")
def save_user(db_session: Session, create_user: Callable[..., AppUser], role: str) -> AppUser:
    user = create_user(UserRole(role))
    user.tax_id = VALID_INDIVIDUAL_TAX_ID
    user.password_hash = hash_password(OLD_PASSWORD)
    db_session.commit()
    return user


@given(parsers.parse('another user with email "{email}" exists'))
def save_another_user(db_session: Session, create_user: Callable[..., AppUser], email: str) -> None:
    another_user = create_user(UserRole.USER)
    another_user.email = email
    db_session.commit()


@given("the user is not active anymore")
def deactivate_user(db_session: Session, user: AppUser) -> None:
    user.is_active = False
    db_session.commit()


@given("the user is a shareholder with a representation form")
def make_user_shareholder(db_session: Session, user: AppUser) -> None:
    db_session.execute(text(FOREIGN_KEYS_PRAGMA))
    user.shareholder = Shareholder(shares_count=100, shares_percentage=Decimal("1.5"), share_capital=Decimal("100"))
    meeting = Meeting(type=MeetingType.ORDINARY, title="Junta 2026", announcement="Anuncio", legal_terms="Bases")
    db_session.add(meeting)
    db_session.flush()
    user.shareholder.representation_forms.append(
        RepresentationForm(meeting_id=meeting.id, sent_to=REPRESENTATION_EMAIL, status=RepresentationFormStatus.SENT)
    )
    db_session.commit()


@given("the user created a meeting", target_fixture="meeting")
def save_meeting_created_by_user(db_session: Session, user: AppUser) -> Meeting:
    meeting = Meeting(
        type=MeetingType.EXTRAORDINARY,
        title="Junta extraordinaria",
        announcement="Anuncio",
        legal_terms="Bases",
        created_by=user.id,
    )
    db_session.add(meeting)
    db_session.commit()
    return meeting


@when(
    parsers.parse('the admin changes the user first name to "{first_name}" and the role to "{role}"'),
    target_fixture="response",
)
def change_name_and_role(client: TestClient, admin: AppUser, user: AppUser, first_name: str, role: str) -> Response:
    changes = {"first_name": first_name, "role": role}
    return client.patch(f"{USERS_PATH}/{user.id}", json=changes, headers=bearer_headers(admin))


@when(parsers.parse('the admin changes the user tax id to "{tax_id}"'), target_fixture="response")
def change_tax_id(client: TestClient, admin: AppUser, user: AppUser, tax_id: str) -> Response:
    return client.patch(f"{USERS_PATH}/{user.id}", json={"tax_id": tax_id}, headers=bearer_headers(admin))


@when(parsers.parse('the admin changes the user email to "{email}"'), target_fixture="response")
def change_email(client: TestClient, admin: AppUser, user: AppUser, email: str) -> Response:
    return client.patch(f"{USERS_PATH}/{user.id}", json={"email": email}, headers=bearer_headers(admin))


@when("the admin saves the user with its current email", target_fixture="response")
def save_same_email(client: TestClient, admin: AppUser, user: AppUser) -> Response:
    return client.patch(f"{USERS_PATH}/{user.id}", json={"email": user.email}, headers=bearer_headers(admin))


@when(parsers.parse('the admin changes its own role to "{role}"'), target_fixture="response")
def change_own_role(client: TestClient, admin: AppUser, role: str) -> Response:
    return client.patch(f"{USERS_PATH}/{admin.id}", json={"role": role}, headers=bearer_headers(admin))


@when("the admin deactivates the user", target_fixture="response")
def deactivate_user_by_admin(client: TestClient, admin: AppUser, user: AppUser) -> Response:
    return client.patch(f"{USERS_PATH}/{user.id}/status", json={"is_active": False}, headers=bearer_headers(admin))


@when("the admin activates the user", target_fixture="response")
def activate_user_by_admin(client: TestClient, admin: AppUser, user: AppUser) -> Response:
    return client.patch(f"{USERS_PATH}/{user.id}/status", json={"is_active": True}, headers=bearer_headers(admin))


@when("the admin deactivates itself", target_fixture="response")
def deactivate_own_user(client: TestClient, admin: AppUser) -> Response:
    return client.patch(f"{USERS_PATH}/{admin.id}/status", json={"is_active": False}, headers=bearer_headers(admin))


@when(parsers.parse("the admin deactivates the user with id {user_id:d}"), target_fixture="response")
def deactivate_unknown_user(client: TestClient, admin: AppUser, user_id: int) -> Response:
    return client.patch(f"{USERS_PATH}/{user_id}/status", json={"is_active": False}, headers=bearer_headers(admin))


@when("the admin resets the user password", target_fixture="response")
def reset_password(client: TestClient, admin: AppUser, user: AppUser) -> Response:
    return client.patch(f"{USERS_PATH}/{user.id}/password", headers=bearer_headers(admin))


@when("the admin deletes itself", target_fixture="response")
def delete_own_user(client: TestClient, admin: AppUser) -> Response:
    return client.delete(f"{USERS_PATH}/{admin.id}", headers=bearer_headers(admin))


@when("the admin deletes the user", target_fixture="response")
def delete_user_by_admin(client: TestClient, admin: AppUser, user: AppUser) -> Response:
    return client.delete(f"{USERS_PATH}/{user.id}", headers=bearer_headers(admin))


@then(parsers.parse('the user has the first name "{first_name}" and the role "{role}"'))
def check_name_and_role(response: Response, first_name: str, role: str) -> None:
    body = response.json()
    assert body["first_name"] == first_name
    assert body["role"] == role


@then("the user is not active")
def check_user_is_not_active(response: Response) -> None:
    assert response.json()["is_active"] is False


@then("the user is active")
def check_user_is_active(response: Response) -> None:
    assert response.json()["is_active"] is True


@then("the user cannot access its own profile")
def check_user_loses_access(client: TestClient, user: AppUser) -> None:
    assert client.get(CURRENT_USER_PATH, headers=bearer_headers(user)).status_code == 401


@then("the user can only log in with the new temporary password")
def check_new_password(response: Response, db_session: Session, user: AppUser) -> None:
    temporary_password = response.json()["temporary_password"]
    db_session.refresh(user)
    assert verify_password(temporary_password, user.password_hash)
    assert not verify_password(OLD_PASSWORD, user.password_hash)
    assert user.must_change_password is True


@then("the user, its shareholder record and its representation forms are deleted")
def check_personal_data_is_deleted(db_session: Session, user: AppUser) -> None:
    db_session.expire_all()
    assert db_session.get(AppUser, user.id) is None
    assert db_session.scalars(select(Shareholder)).all() == []
    assert db_session.scalars(select(RepresentationForm)).all() == []


@then("the meeting is kept without author")
def check_meeting_is_kept(db_session: Session, meeting: Meeting) -> None:
    db_session.refresh(meeting)
    assert meeting.created_by is None


@pytest.mark.parametrize("role", [UserRole.MANAGER, UserRole.USER])
def test_non_admin_cannot_manage_users(client: TestClient, create_user: Callable[..., AppUser], role: UserRole) -> None:
    headers = bearer_headers(create_user(role))
    target_path = f"{USERS_PATH}/{create_user(UserRole.USER).id}"
    assert client.patch(target_path, json={"first_name": "Ana"}, headers=headers).status_code == 403
    assert client.patch(f"{target_path}/status", json={"is_active": False}, headers=headers).status_code == 403
    assert client.patch(f"{target_path}/password", headers=headers).status_code == 403
    assert client.delete(target_path, headers=headers).status_code == 403


def test_last_active_admin_is_protected(db_session: Session, create_user: Callable[..., AppUser]) -> None:
    last_admin = create_user(UserRole.ADMIN)
    requesting_user = create_user(UserRole.MANAGER)
    with pytest.raises(ConflictError, match=LAST_ACTIVE_ADMIN_MESSAGE):
        app_user_service.delete_user(db_session, last_admin.id, requesting_user)
