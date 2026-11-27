import pytest

from app.core.enums import UserRole


def test_admin_lists_users_paginated(client, auth_headers, create_user):
    headers = auth_headers(UserRole.ADMIN)
    create_user(UserRole.USER)
    r = client.get("/api/v1/users?page=1&size=5", headers=headers)
    assert r.status_code == 200
    body = r.json()
    assert {"items", "total", "page", "size"} <= body.keys()
    assert body["total"] == 2
    assert all("password_hash" not in u for u in body["items"])


def test_admin_filters_by_role(client, auth_headers, create_user):
    headers = auth_headers(UserRole.ADMIN)
    create_user(UserRole.USER)
    create_user(UserRole.MANAGER)
    r = client.get("/api/v1/users?role=admin&is_active=true", headers=headers)
    assert r.status_code == 200
    items = r.json()["items"]
    assert len(items) == 1
    assert all(u["role"] == "admin" for u in items)


def test_admin_searches_by_email(client, auth_headers, create_user):
    headers = auth_headers(UserRole.ADMIN)
    searched_user = create_user(UserRole.USER)
    r = client.get("/api/v1/users", params={"search": searched_user.email}, headers=headers)
    assert r.status_code == 200
    body = r.json()
    assert body["total"] == 1
    assert body["items"][0]["email"] == searched_user.email


def test_user_detail_without_password_hash(client, auth_headers):
    headers = auth_headers(UserRole.ADMIN)
    first = client.get("/api/v1/users?size=1", headers=headers).json()["items"][0]
    r = client.get(f"/api/v1/users/{first['id']}", headers=headers)
    assert r.status_code == 200
    assert "password_hash" not in r.json()


def test_user_not_found(client, auth_headers):
    headers = auth_headers(UserRole.ADMIN)
    assert client.get("/api/v1/users/999999", headers=headers).status_code == 404


@pytest.mark.parametrize("role", [UserRole.MANAGER, UserRole.USER])
def test_non_admin_is_denied(client, auth_headers, role):
    headers = auth_headers(role)
    assert client.get("/api/v1/users", headers=headers).status_code == 403
    assert client.get("/api/v1/users/1", headers=headers).status_code == 403


def test_no_token_is_unauthorized(client):
    assert client.get("/api/v1/users").status_code == 401
