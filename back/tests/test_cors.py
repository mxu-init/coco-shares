from pytest_bdd import scenarios, then, when

scenarios("cors.feature")

FRONTEND_ORIGIN = "http://localhost:5173"


@when("the frontend origin sends a preflight request to the health endpoint", target_fixture="response")
def request_preflight(client):
    return client.options(
        "/api/v1/health",
        headers={"Origin": FRONTEND_ORIGIN, "Access-Control-Request-Method": "GET"},
    )


@then("the response allows the frontend origin")
def check_allowed_origin(response) -> None:
    assert response.headers["access-control-allow-origin"] == FRONTEND_ORIGIN
