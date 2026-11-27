from collections.abc import Callable
from decimal import Decimal

from pytest_bdd import given, parsers, scenarios, then, when
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.enums import UserRole
from app.core.security import create_access_token
from app.models import AppUser, Shareholder

scenarios("current_user.feature")

CURRENT_USER_PATH = f"{settings.API_V1_PREFIX}/auth/me"
PASSWORD_HASH_FIELD = "password_hash"
SHAREHOLDER_DATA = {
    "representative_name": "Luis Pérez Gómez",
    "representative_tax_id": "11111111H",
    "shares_count": 1500,
    "shares_percentage": Decimal("12.5000"),
    "share_capital": Decimal("15000.00"),
}


@given(parsers.parse('a logged in user with the role "{role}"'), target_fixture="user")
def save_logged_in_user(create_user: Callable[..., AppUser], role: str) -> AppUser:
    return create_user(UserRole(role))


@given("a logged in shareholder", target_fixture="user")
def save_logged_in_shareholder(create_user: Callable[..., AppUser], db_session: Session) -> AppUser:
    user = create_user(UserRole.USER)
    user.shareholder = Shareholder(**SHAREHOLDER_DATA)
    db_session.commit()
    return user


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


@then("the response contains the shareholder data of that user")
def check_shareholder_data(response) -> None:
    shareholder = response.json()["shareholder"]
    assert shareholder["representative_name"] == SHAREHOLDER_DATA["representative_name"]
    assert shareholder["representative_tax_id"] == SHAREHOLDER_DATA["representative_tax_id"]
    assert shareholder["shares_count"] == SHAREHOLDER_DATA["shares_count"]
    assert Decimal(shareholder["shares_percentage"]) == SHAREHOLDER_DATA["shares_percentage"]
    assert Decimal(shareholder["share_capital"]) == SHAREHOLDER_DATA["share_capital"]
