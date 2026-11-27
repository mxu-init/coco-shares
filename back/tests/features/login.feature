Feature: Login

  Background:
    Given an active user "ana.garcia@example.com" with the password "Password123" and the role "user"

  Scenario: Login with valid credentials returns a token
    When the client logs in with "ana.garcia@example.com" and "Password123"
    Then the response status is 200
    And the response contains a bearer token
    And the token contains the user id and the role "user"
    And the token expires after the configured minutes
    And the response does not expose the password

  Scenario: The email is compared without case sensitivity
    When the client logs in with "Ana.Garcia@Example.COM" and "Password123"
    Then the response status is 200
    And the response contains a bearer token

  Scenario Outline: Wrong credentials return a generic error
    When the client logs in with "<email>" and "<password>"
    Then the response status is 401
    And the response detail is "Email o contraseña incorrectos"

    Examples:
      | email                  | password     |
      | ana.garcia@example.com | WrongPass123 |
      | nadie@example.com      | Password123  |

  Scenario: An inactive user cannot log in
    Given the user "ana.garcia@example.com" is inactive
    When the client logs in with "ana.garcia@example.com" and "Password123"
    Then the response status is 401
    And the response detail is "Tu usuario está desactivado. Contacta con el administrador"

  Scenario: The password is stored as an argon2 hash
    Then the password of "ana.garcia@example.com" is stored as an argon2 hash
