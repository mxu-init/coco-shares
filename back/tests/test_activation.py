from pytest_bdd import given, parsers, scenarios, then, when

from app.core.config import settings
from app.core.enums import UserRole
from app.core.security import create_access_token

scenarios("activation.feature")

USERS_PATH = f"{settings.API_V1_PREFIX}/users"
ACTIVATION_PATH = f"{settings.API_V1_PREFIX}/auth/activate"
LOGIN_PATH = f"{settings.API_V1_PREFIX}/auth/token"
CURRENT_USER_PATH = f"{settings.API_V1_PREFIX}/auth/me"
NEW_USER = {
    "role": "user",
    "person_type": "individual",
    "first_name": "Ana",
    "last_name": "López García",
    "tax_id": "12345678Z",
}


@given(parsers.parse('an admin has created the user "{email}"'), target_fixture="created_user")
def create_user_as_admin(client, auth_headers, email: str) -> dict:
    response = client.post(USERS_PATH, json={**NEW_USER, "email": email}, headers=auth_headers(UserRole.ADMIN))
    return response.json()


@given(parsers.parse('the user has activated the account with the password "{password}"'))
def activate_before(client, created_user: dict, password: str) -> None:
    client.post(ACTIVATION_PATH, json={"token": created_user["activation_token"], "new_password": password})


@when(parsers.parse('the user activates the account with the password "{password}"'), target_fixture="response")
def activate_account(client, created_user: dict, password: str):
    return client.post(ACTIVATION_PATH, json={"token": created_user["activation_token"], "new_password": password})


@when("someone activates the account with a session token", target_fixture="response")
def activate_with_session_token(client, created_user: dict):
    session_token = create_access_token(subject=str(created_user["id"]), role=UserRole.USER)
    return client.post(ACTIVATION_PATH, json={"token": session_token, "new_password": "Segura#2026ok"})


@when("the activation token is used as a session token", target_fixture="response")
def use_activation_token_as_session(client, created_user: dict):
    headers = {"Authorization": f"Bearer {created_user['activation_token']}"}
    return client.get(CURRENT_USER_PATH, headers=headers)


@then(parsers.parse('the user can log in with "{email}" and "{password}"'))
def check_login(client, email: str, password: str) -> None:
    response = client.post(LOGIN_PATH, data={"username": email, "password": password})
    assert response.status_code == 200
