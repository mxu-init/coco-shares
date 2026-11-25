from pytest_bdd import given, parsers, scenarios, when

from app.core import exceptions
from app.main import app

scenarios("error_handling.feature")

ERRORS_PATH = "/test/errors"


def raise_error_by_name(error_name: str) -> None:
    raise getattr(exceptions, error_name)()


@given(parsers.parse('an endpoint that raises "{error_name}"'), target_fixture="error_name")
def register_error_endpoint(error_name: str) -> str:
    if not any(getattr(route, "path", None) == f"{ERRORS_PATH}/{{error_name}}" for route in app.routes):
        app.add_api_route(f"{ERRORS_PATH}/{{error_name}}", raise_error_by_name, methods=["GET"])
    return error_name


@when("the client requests that endpoint", target_fixture="response")
def request_error_endpoint(client, error_name: str):
    return client.get(f"{ERRORS_PATH}/{error_name}")
