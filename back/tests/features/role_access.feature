Feature: Role based access

  Background:
    Given an endpoint restricted to managers and admins

  Scenario Outline: Access depends on the role in the token
    When the client requests it with a token for the role "<role>"
    Then the response status is <status_code>

    Examples:
      | role        | status_code |
      | admin       | 200         |
      | manager     | 200         |
      | shareholder | 403         |

  Scenario: Access without a token is rejected
    When the client requests it without a token
    Then the response status is 401
    And the response detail is "No has iniciado sesión"

  Scenario: Access with an invalid token is rejected
    When the client requests it with an invalid token
    Then the response status is 401
    And the response detail is "La sesión no es válida o ha caducado"
