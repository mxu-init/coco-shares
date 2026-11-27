from fastapi import Depends
from pytest_bdd import given, parsers, scenarios, when

from app.core.dependencies import require_roles
from app.core.enums import UserRole
from app.main import app

scenarios("role_access.feature")

PROTECTED_PATH = "/test/protected"
INVALID_TOKEN = "invalid.token.value"


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


@when(parsers.parse('the client requests it with a token for the role "{role}"'), target_fixture="response")
def request_with_role(client, auth_headers, role: str):
    return client.get(PROTECTED_PATH, headers=auth_headers(UserRole(role)))


@when("the client requests it without a token", target_fixture="response")
def request_without_token(client):
    return client.get(PROTECTED_PATH)


@when("the client requests it with an invalid token", target_fixture="response")
def request_with_invalid_token(client):
    return client.get(PROTECTED_PATH, headers=bearer_headers(INVALID_TOKEN))
