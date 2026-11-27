from decimal import Decimal

from pytest_bdd import given, parsers, scenarios, then, when
from sqlalchemy.orm import Session

from app.core.enums import PersonType, UserRole
from app.core.security import create_access_token
from app.models import AppUser, Shareholder

scenarios("shareholder_list.feature")

SHAREHOLDERS_PATH = "/api/v1/shareholders"
REPRESENTATIVE_TAX_ID = "11111111H"
PUBLIC_FIELDS = {
    "id",
    "first_name",
    "last_name",
    "representative_name",
    "shares_count",
    "shares_percentage",
    "share_capital",
}


def build_user(
    *, person_type: PersonType, first_name: str, last_name: str | None, tax_id: str, email: str, phone: str, address: str
) -> AppUser:
    return AppUser(
        role=UserRole.USER,
        person_type=person_type,
        first_name=first_name,
        last_name=last_name,
        tax_id=tax_id,
        email=email,
        phone=phone,
        address=address,
        password_hash="hash",
    )


def bearer_headers(role: str) -> dict[str, str]:
    token = create_access_token(subject="1", role=UserRole(role))
    return {"Authorization": f"Bearer {token}"}


def full_name(shareholder: dict) -> str:
    return " ".join(filter(None, [shareholder["first_name"], shareholder["last_name"]]))


@given("two shareholders and a user without shares", target_fixture="users")
def create_users(db_session: Session) -> list[AppUser]:
    company = build_user(
        person_type=PersonType.LEGAL_ENTITY,
        first_name="Inversiones Levante S.L.",
        last_name=None,
        tax_id="B12345674",
        email="contacto@levante.es",
        phone="600111222",
        address="Calle Mayor 1, Murcia",
    )
    person = build_user(
        person_type=PersonType.INDIVIDUAL,
        first_name="Luis",
        last_name="Pérez Martín",
        tax_id="12345678Z",
        email="luis.perez@correo.es",
        phone="611222333",
        address="Avenida Libertad 5, Madrid",
    )
    user_without_shares = build_user(
        person_type=PersonType.INDIVIDUAL,
        first_name="Marta",
        last_name="Ruiz Soto",
        tax_id="87654321X",
        email="marta.ruiz@correo.es",
        phone="622333444",
        address="Plaza Nueva 3, Sevilla",
    )
    company_shares = Shareholder(
        user=company,
        representative_name="María López García",
        representative_tax_id=REPRESENTATIVE_TAX_ID,
        shares_count=7538,
        shares_percentage=Decimal("5.8000"),
        share_capital=Decimal("45303.38"),
    )
    person_shares = Shareholder(
        user=person,
        shares_count=54309,
        shares_percentage=Decimal("41.7800"),
        share_capital=Decimal("326397.09"),
    )
    db_session.add_all([company, person, user_without_shares, company_shares, person_shares])
    db_session.commit()
    return [company, person, user_without_shares]


@when(parsers.parse('a "{role}" requests the shareholder list'), target_fixture="response")
def request_list(client, role: str):
    return client.get(SHAREHOLDERS_PATH, headers=bearer_headers(role))


@when(
    parsers.parse('a "{role}" requests page {page:d} of the shareholder list with {size:d} shareholder per page'),
    target_fixture="response",
)
def request_page(client, role: str, page: int, size: int):
    return client.get(SHAREHOLDERS_PATH, params={"page": page, "size": size}, headers=bearer_headers(role))


@when("the shareholder list is requested without a token", target_fixture="response")
def request_without_token(client):
    return client.get(SHAREHOLDERS_PATH)


@then("each shareholder only includes its public fields")
def check_public_fields(response) -> None:
    assert all(set(shareholder) == PUBLIC_FIELDS for shareholder in response.json()["items"])


@then("no personal data appears in the response")
def check_no_personal_data(response, users: list[AppUser]) -> None:
    personal_values = [value for user in users for value in (user.tax_id, user.email, user.phone, user.address)]
    personal_values.append(REPRESENTATIVE_TAX_ID)
    assert not any(value in response.text for value in personal_values)


@then(parsers.parse('the listed shareholders are "{names}"'))
def check_listed_names(response, names: str) -> None:
    assert [full_name(shareholder) for shareholder in response.json()["items"]] == names.split(", ")


@then(parsers.parse("the page shows {count:d} shareholder out of a total of {total:d}"))
def check_page(response, count: int, total: int) -> None:
    body = response.json()
    assert len(body["items"]) == count
    assert body["total"] == total
