from datetime import datetime, timezone

from pytest_bdd import given, parsers, scenarios, then, when
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.enums import PersonType, UserRole
from app.core.security import decode_access_token, hash_password
from app.models.app_user_model import AppUser
from app.repositories import app_user_repository
from app.schemas.auth_schema import BEARER_TOKEN_TYPE

scenarios("login.feature")

LOGIN_PATH = f"{settings.API_V1_PREFIX}/auth/token"
ARGON2_HASH_PREFIX = "$argon2"
SECONDS_PER_MINUTE = 60
EXPIRATION_TOLERANCE_SECONDS = 60
TOKEN_RESPONSE_FIELDS = {"access_token", "token_type"}


@given(
    parsers.parse('an active user "{email}" with the password "{password}" and the role "{role}"'),
    target_fixture="registered_user",
)
def create_active_user(db_session: Session, email: str, password: str, role: str) -> AppUser:
    user = AppUser(
        role=UserRole(role),
        person_type=PersonType.INDIVIDUAL,
        first_name="Ana",
        last_name="García",
        tax_id="12345678Z",
        email=email,
        password_hash=hash_password(password),
    )
    return app_user_repository.add(db_session, user)


@given(parsers.parse('the user "{email}" is inactive'))
def deactivate_user(db_session: Session, email: str) -> None:
    user = app_user_repository.find_by_email(db_session, email)
    user.is_active = False
    db_session.commit()


@when(parsers.parse('the client logs in with "{email}" and "{password}"'), target_fixture="response")
def log_in(client, email: str, password: str):
    return client.post(LOGIN_PATH, data={"username": email, "password": password})


@then("the response contains a bearer token")
def check_bearer_token(response) -> None:
    body = response.json()
    assert body["token_type"] == BEARER_TOKEN_TYPE
    assert body["access_token"]


@then(parsers.parse('the token contains the user id and the role "{role}"'))
def check_token_payload(response, registered_user: AppUser, role: str) -> None:
    payload = decode_access_token(response.json()["access_token"])
    assert payload["sub"] == str(registered_user.id)
    assert payload["role"] == role


@then("the token expires after the configured minutes")
def check_token_expiration(response) -> None:
    payload = decode_access_token(response.json()["access_token"])
    expected_expiration = datetime.now(timezone.utc).timestamp() + settings.JWT_EXPIRE_MINUTES * SECONDS_PER_MINUTE
    assert abs(payload["exp"] - expected_expiration) < EXPIRATION_TOLERANCE_SECONDS


@then("the response does not expose the password")
def check_password_not_exposed(response) -> None:
    assert set(response.json()) == TOKEN_RESPONSE_FIELDS


@then(parsers.parse('the password of "{email}" is stored as an argon2 hash'))
def check_argon2_hash(db_session: Session, email: str) -> None:
    user = app_user_repository.find_by_email(db_session, email)
    assert user.password_hash.startswith(ARGON2_HASH_PREFIX)
