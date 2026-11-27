import os

os.environ.setdefault("APP_NAME", "COCO-SHARES")
os.environ.setdefault("APP_VERSION", "1.0.0")
os.environ.setdefault("APP_DESCRIPTION", "BOILERPLATE FASTAPI BASED")
os.environ.setdefault("DB_HOST", "localhost")
os.environ.setdefault("DB_NAME", "test_db")
os.environ.setdefault("DB_USER", "test_user")
os.environ.setdefault("DB_PASSWORD", "test_password")
os.environ.setdefault("JWT_SECRET", "test_jwt_secret_with_enough_length_for_hs256")
os.environ.setdefault("FIRST_ADMIN_EMAIL", "admin@example.com")
os.environ.setdefault("FIRST_ADMIN_PASSWORD", "test_admin_password")
os.environ.setdefault("FIRST_ADMIN_FIRST_NAME", "Admin")
os.environ.setdefault("FIRST_ADMIN_LAST_NAME", "Test")
os.environ.setdefault("FIRST_ADMIN_TAX_ID", "00000000T")

from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from pytest_bdd import parsers, then
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base
from app.core.dependencies import get_db
from app.main import app

SQLITE_IN_MEMORY_URL = "sqlite://"


@pytest.fixture
def db_session() -> Iterator[Session]:
    engine = create_engine(
        SQLITE_IN_MEMORY_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    with sessionmaker(bind=engine, expire_on_commit=False)() as session:
        yield session
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture
def client(db_session: Session) -> Iterator[TestClient]:
    app.dependency_overrides[get_db] = lambda: db_session
    yield TestClient(app)
    app.dependency_overrides.clear()


@then(parsers.parse("the response status is {status_code:d}"))
def check_response_status(response, status_code: int) -> None:
    assert response.status_code == status_code


@then(parsers.parse('the response detail is "{detail}"'))
def check_response_detail(response, detail: str) -> None:
    assert response.json()["detail"] == detail
