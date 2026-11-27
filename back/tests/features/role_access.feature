Feature: Role based access

  Background:
    Given an endpoint restricted to managers and admins

  Scenario Outline: Access depends on the role of the user
    When the client requests it with a token for the role "<role>"
    Then the response status is <status_code>

    Examples:
      | role        | status_code |
      | admin       | 200         |
      | manager     | 200         |
      | user        | 403         |

  Scenario: Access without a token is rejected
    When the client requests it without a token
    Then the response status is 401
    And the response detail is "No has iniciado sesión"

  Scenario: Access with an invalid token is rejected
    When the client requests it with an invalid token
    Then the response status is 401
    And the response detail is "La sesión no es válida o ha caducado"

  Scenario: Access with an expired token is rejected
    Given an active user with the role "admin"
    When the client requests it with an expired token for that user
    Then the response status is 401
    And the response detail is "La sesión no es válida o ha caducado"

  Scenario: An inactive user is rejected even with a valid token
    Given an inactive user with the role "admin"
    When the client requests it with a token for that user
    Then the response status is 401
    And the response detail is "La sesión no es válida o ha caducado"

  Scenario: A deleted user is rejected even with a valid token
    Given an active user with the role "admin"
    And the user has been deleted
    When the client requests it with a token for that user
    Then the response status is 401
    And the response detail is "La sesión no es válida o ha caducado"

  Scenario: The role saved for the user prevails over the role in the token
    Given an active user with the role "user"
    When the client requests it with a token that says the role "admin"
    Then the response status is 403
    And the response detail is "No tienes permiso para realizar esta acción"
