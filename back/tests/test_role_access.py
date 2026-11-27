from collections.abc import Callable

from fastapi import Depends
from pytest_bdd import given, parsers, scenarios, when
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import require_roles
from app.core.enums import UserRole
from app.core.security import create_access_token
from app.main import app
from app.models import AppUser

scenarios("role_access.feature")

PROTECTED_PATH = "/test/protected"
INVALID_TOKEN = "invalid.token.value"
ACTIVE_STATE = "active"
EXPIRED_TOKEN_MINUTES = -1


def read_protected_resource() -> dict[str, str]:
    return {"status": "ok"}


def bearer_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


@given("an endpoint restricted to managers and admins")
def register_protected_endpoint() -> None:
    if any(getattr(route, "path", None) == PROTECTED_PATH for route in app.routes):
        return
    app.add_api_route(
        PROTECTED_PATH,
        read_protected_resource,
        methods=["GET"],
        dependencies=[Depends(require_roles(UserRole.MANAGER, UserRole.ADMIN))],
    )


@given(parsers.parse('an {state} user with the role "{role}"'), target_fixture="user")
def save_user_with_state(create_user: Callable[..., AppUser], state: str, role: str) -> AppUser:
    return create_user(UserRole(role), is_active=state == ACTIVE_STATE)


@given("the user has been deleted")
def delete_user(db_session: Session, user: AppUser) -> None:
    db_session.delete(user)
    db_session.commit()


@when(parsers.parse('the client requests it with a token for the role "{role}"'), target_fixture="response")
def request_with_role(client, auth_headers, role: str):
    return client.get(PROTECTED_PATH, headers=auth_headers(UserRole(role)))


@when("the client requests it with a token for that user", target_fixture="response")
def request_with_user_token(client, user: AppUser):
    token = create_access_token(subject=str(user.id), role=user.role)
    return client.get(PROTECTED_PATH, headers=bearer_headers(token))


@when("the client requests it with an expired token for that user", target_fixture="response")
def request_with_expired_token(client, monkeypatch, user: AppUser):
    monkeypatch.setattr(settings, "JWT_EXPIRE_MINUTES", EXPIRED_TOKEN_MINUTES)
    token = create_access_token(subject=str(user.id), role=user.role)
    return client.get(PROTECTED_PATH, headers=bearer_headers(token))


@when(parsers.parse('the client requests it with a token that says the role "{role}"'), target_fixture="response")
def request_with_token_role(client, user: AppUser, role: str):
    token = create_access_token(subject=str(user.id), role=UserRole(role))
    return client.get(PROTECTED_PATH, headers=bearer_headers(token))


@when("the client requests it without a token", target_fixture="response")
def request_without_token(client):
    return client.get(PROTECTED_PATH)


@when("the client requests it with an invalid token", target_fixture="response")
def request_with_invalid_token(client):
    return client.get(PROTECTED_PATH, headers=bearer_headers(INVALID_TOKEN))
