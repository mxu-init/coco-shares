Feature: Account activation

  Background:
    Given an admin has created the user "ana.lopez@correo.es"

  Scenario: The user sets a password and logs in
    When the user activates the account with the password "Segura#2026ok"
    Then the response status is 204
    And the user can log in with "ana.lopez@correo.es" and "Segura#2026ok"

  Scenario: An activation link only works once
    Given the user has activated the account with the password "Segura#2026ok"
    When the user activates the account with the password "Otra#Clave2026"
    Then the response status is 422
    And the response detail is "Los datos enviados no son válidos"

  Scenario Outline: A weak password is rejected
    When the user activates the account with the password "<password>"
    Then the response status is 422
    And the response detail is "Los datos enviados no son válidos"

    Examples:
      | password     |
      | Corta#1      |
      | sinmayus#2026 |
      | SINMINUS#2026 |
      | SinNumeros#ab |
      | SinEspecial2026 |

  Scenario: A session token cannot activate an account
    When someone activates the account with a session token
    Then the response status is 422
    And the response detail is "Los datos enviados no son válidos"

  Scenario: An activation token cannot be used as a session
    When the activation token is used as a session token
    Then the response status is 401
