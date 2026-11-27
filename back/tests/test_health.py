from pytest_bdd import parsers, scenarios, then, when

scenarios("health.feature")


@when("the client requests the health endpoint", target_fixture="response")
def request_health(client):
    return client.get("/api/v1/health")


@then(parsers.parse('the response status field is "{expected_status}"'))
def check_status_field(response, expected_status: str) -> None:
    assert response.json()["status"] == expected_status
