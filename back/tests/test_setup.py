from sqlalchemy import text


def test_api_root_responds(client):
    response = client.get("/")
    assert response.status_code == 200


def test_test_database_is_reachable(db_session):
    assert db_session.execute(text("SELECT 1")).scalar() == 1
