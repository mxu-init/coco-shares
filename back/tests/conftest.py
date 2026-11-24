import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL, make_url
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database_connection import Base, get_db
from app.main import app

TEST_DATABASE_NAME = f"{settings.DB_NAME}_test"
MAINTENANCE_DATABASE_NAME = "postgres"


def build_database_url(database_name: str) -> URL:
    return make_url(settings.database_url).set(database=database_name)


def create_test_database_if_missing() -> None:
    maintenance_engine = create_engine(
        build_database_url(MAINTENANCE_DATABASE_NAME),
        isolation_level="AUTOCOMMIT",
    )
    with maintenance_engine.connect() as connection:
        database_exists = connection.execute(
            text("SELECT 1 FROM pg_database WHERE datname = :database_name"),
            {"database_name": TEST_DATABASE_NAME},
        ).scalar()
        if not database_exists:
            connection.execute(text(f'CREATE DATABASE "{TEST_DATABASE_NAME}"'))
    maintenance_engine.dispose()


@pytest.fixture(scope="session")
def test_engine():
    create_test_database_if_missing()
    engine = create_engine(build_database_url(TEST_DATABASE_NAME))
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture
def db_session(test_engine):
    connection = test_engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection, join_transaction_mode="create_savepoint")
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
