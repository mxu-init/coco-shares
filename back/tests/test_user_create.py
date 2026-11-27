from pytest_bdd import given, parsers, scenarios, then, when
from sqlalchemy.orm import Session

from app.core.enums import PersonType, UserRole
from app.core.security import decode_activation_token
from app.models import AppUser

scenarios("user_create.feature")

USERS_PATH = "/api/v1/users"
EXISTING_USER_TAX_ID = "87654321X"
INDIVIDUAL_USER = {
    "role": "user",
    "person_type": "individual",
    "first_name": "Ana",
    "last_name": "López García",
    "email": "ana.lopez@correo.es",
    "tax_id": "12345678Z",
}
COMPANY_USER = {
    "role": "user",
    "person_type": "legal_entity",
    "first_name": "Inversiones Levante S.L.",
    "email": "contactolevante@correo.es",
    "tax_id": "B12345674",
}


@given(parsers.parse('a user with email "{email}" already exists'))
def create_existing_user(db_session: Session, email: str) -> None:
    db_session.add(
        AppUser(
            role=UserRole.USER,
            person_type=PersonType.INDIVIDUAL,
            first_name="Marta",
            last_name="Ruiz Soto",
            tax_id=EXISTING_USER_TAX_ID,
            email=email,
            password_hash="hash",
        )
    )
    db_session.commit()


@when(parsers.parse('an admin creates an individual user with tax id "{tax_id}"'), target_fixture="response")
def create_user_with_tax_id(client, auth_headers, tax_id: str):
    return client.post(USERS_PATH, json={**INDIVIDUAL_USER, "tax_id": tax_id}, headers=auth_headers(UserRole.ADMIN))


@when(parsers.parse('an admin creates an individual user with email "{email}"'), target_fixture="response")
def create_user_with_email(client, auth_headers, email: str):
    return client.post(USERS_PATH, json={**INDIVIDUAL_USER, "email": email}, headers=auth_headers(UserRole.ADMIN))


@when(parsers.parse('an admin creates a company with last name "{last_name}"'), target_fixture="response")
def create_company(client, auth_headers, last_name: str):
    return client.post(
        USERS_PATH, json={**COMPANY_USER, "last_name": last_name}, headers=auth_headers(UserRole.ADMIN)
    )


@then("the created user is returned with an activation token")
def check_created_user(response) -> None:
    body = response.json()
    assert body["email"] == INDIVIDUAL_USER["email"]
    assert decode_activation_token(body["activation_token"])["sub"] == str(body["id"])
    assert "password_hash" not in body


@then("the created user has no last name")
def check_company_without_last_name(response) -> None:
    assert response.json()["last_name"] is None
