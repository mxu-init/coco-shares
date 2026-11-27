from collections.abc import Callable

from pytest_bdd import given, parsers, scenarios, then, when

from app.core.config import settings
from app.core.enums import UserRole
from app.core.security import create_access_token
from app.models import AppUser

scenarios("current_user.feature")

CURRENT_USER_PATH = f"{settings.API_V1_PREFIX}/auth/me"
PASSWORD_HASH_FIELD = "password_hash"


@given(parsers.parse('a logged in user with the role "{role}"'), target_fixture="user")
def save_logged_in_user(create_user: Callable[..., AppUser], role: str) -> AppUser:
    return create_user(UserRole(role))


@when("the user requests their own data", target_fixture="response")
def request_own_data(client, user: AppUser):
    token = create_access_token(subject=str(user.id), role=user.role)
    return client.get(CURRENT_USER_PATH, headers={"Authorization": f"Bearer {token}"})


@when("the current user is requested without a token", target_fixture="response")
def request_without_token(client):
    return client.get(CURRENT_USER_PATH)


@then("the response contains the data of that user")
def check_user_data(response, user: AppUser) -> None:
    body = response.json()
    assert body["id"] == user.id
    assert body["email"] == user.email
    assert body["role"] == user.role


@then("the response does not include the password hash")
def check_password_hash_hidden(response) -> None:
    assert PASSWORD_HASH_FIELD not in response.json()
