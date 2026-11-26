Feature: Business errors

  Scenario Outline: Business errors return a Spanish message
    Given an endpoint that raises "<error_name>"
    When the client requests that endpoint
    Then the response status is <status_code>
    And the response detail is "<message>"

    Examples:
      | error_name            | status_code | message                                     |
      | NotFoundError         | 404         | Recurso no encontrado                       |
      | ConflictError         | 409         | El recurso ya existe                        |
      | UnauthorizedError     | 401         | No has iniciado sesión                      |
      | PermissionDeniedError | 403         | No tienes permiso para realizar esta acción |
