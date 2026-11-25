from pytest_bdd import scenarios, then, when
from sqlalchemy import func, select

from app.core.enums import UserRole
from app.core.seed import seed_initial_data
from app.models.user_model import User

scenarios("seed.feature")


@when("the initial data is seeded twice")
def seed_twice(db_session) -> None:
    seed_initial_data(db_session)
    seed_initial_data(db_session)


@then("exactly one admin user exists")
def check_single_admin(db_session) -> None:
    admin_count = db_session.scalar(select(func.count()).select_from(User).where(User.role == UserRole.ADMIN))
    assert admin_count == 1
