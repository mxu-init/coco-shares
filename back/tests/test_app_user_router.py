import pytest
from fastapi.testclient import TestClient

from app.core.dependencies import get_token_payload
from app.main import app

# Requiere la base de datos migrada y sembrada (alembic upgrade head + python -m seeders).


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def as_role(role: str | None) -> None:
    """Simula el token sin depender del login (CS-14)."""
    if role is None:
        app.dependency_overrides.pop(get_token_payload, None)
    else:
        app.dependency_overrides[get_token_payload] = lambda: {"role": role}


def test_admin_lists_users_paginated(client):
    as_role("admin")
    r = client.get("/api/v1/users?page=1&size=5")
    assert r.status_code == 200
    body = r.json()
    assert {"items", "total", "page", "size"} <= body.keys()
    assert body["total"] >= 1
    assert all("password_hash" not in u for u in body["items"])


def test_admin_filters_by_role(client):
    as_role("admin")
    r = client.get("/api/v1/users?role=admin&is_active=true")
    assert r.status_code == 200
    assert all(u["role"] == "admin" for u in r.json()["items"])


def test_admin_searches_by_email(client):
    as_role("admin")
    r = client.get("/api/v1/users?search=admin")
    assert r.status_code == 200
    assert r.json()["total"] >= 1


def test_user_detail_without_password_hash(client):
    as_role("admin")
    first = client.get("/api/v1/users?size=1").json()["items"][0]
    r = client.get(f"/api/v1/users/{first['id']}")
    assert r.status_code == 200
    assert "password_hash" not in r.json()


def test_user_not_found(client):
    as_role("admin")
    assert client.get("/api/v1/users/999999").status_code == 404


@pytest.mark.parametrize("role", ["manager", "user"])
def test_non_admin_is_denied(client, role):
    as_role(role)
    assert client.get("/api/v1/users").status_code == 403
    assert client.get("/api/v1/users/1").status_code == 403


def test_no_token_is_unauthorized(client):
    as_role(None)
    assert client.get("/api/v1/users").status_code == 401