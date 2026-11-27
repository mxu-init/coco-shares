Feature: Current user

  Scenario: A logged in user gets their own data without the password
    Given a logged in user with the role "manager"
    When the user requests their own data
    Then the response status is 200
    And the response contains the data of that user
    And the response does not include the password hash

  Scenario: The current user cannot be requested without a token
    When the current user is requested without a token
    Then the response status is 401
    And the response detail is "No has iniciado sesión"

  Scenario: A shareholder gets their shareholder data
    Given a logged in shareholder
    When the user requests their own data
    Then the response status is 200
    And the response contains the shareholder data of that user
