from pytest_bdd import given, parsers, scenarios, then, when
from sqlalchemy import func, select

from app.core.enums import PageKey, UserRole
from app.models.app_user_model import AppUser
from app.models.page_content_model import PageContent
from app.repositories import page_content_repository
from seeders.initial_data_seeder import seed_initial_data

scenarios("seed.feature")

EDITED_BODY = "Texto editado por el admin"


@given("the initial data is seeded")
def seed_once(db_session) -> None:
    seed_initial_data(db_session)


@given(parsers.parse('the text "{page_key}" has been edited'))
def edit_page_content(db_session, page_key: str) -> None:
    page_content = page_content_repository.find_by_page_key(db_session, page_key)
    page_content.body = EDITED_BODY
    db_session.commit()


@when("the initial data is seeded again")
def seed_again(db_session) -> None:
    seed_initial_data(db_session)


@when("the initial data is seeded twice")
def seed_twice(db_session) -> None:
    seed_initial_data(db_session)
    seed_initial_data(db_session)


@then("exactly one admin user exists")
def check_single_admin(db_session) -> None:
    admin_count = db_session.scalar(select(func.count()).select_from(AppUser).where(AppUser.role == UserRole.ADMIN))
    assert admin_count == 1


@then("each initial page content exists once")
def check_page_contents(db_session) -> None:
    page_keys = db_session.scalars(select(PageContent.page_key)).all()
    assert sorted(page_keys) == sorted(PageKey)


@then(parsers.parse('the text "{page_key}" keeps the edited body'))
def check_edited_body(db_session, page_key: str) -> None:
    assert page_content_repository.find_by_page_key(db_session, page_key).body == EDITED_BODY
