Feature: Shareholder list

  Background:
    Given two shareholders and a user without shares

  Scenario: The list never exposes personal data
    When a "user" requests the shareholder list
    Then the response status is 200
    And each shareholder only includes its public fields
    And no personal data appears in the response

  Scenario: Only shareholders are listed, from most to fewest shares
    When a "user" requests the shareholder list
    Then the listed shareholders are "Luis Pérez Martín, Inversiones Levante S.L."

  Scenario: The list is paginated
    When a "user" requests page 2 of the shareholder list with 1 shareholder per page
    Then the response status is 200
    And the page shows 1 shareholder out of a total of 2

  Scenario Outline: Any authenticated role can see the list
    When a "<role>" requests the shareholder list
    Then the response status is 200

    Examples:
      | role    |
      | admin   |
      | manager |
      | user    |

  Scenario: The list requires a session
    When the shareholder list is requested without a token
    Then the response status is 401
    And the response detail is "No has iniciado sesión"
