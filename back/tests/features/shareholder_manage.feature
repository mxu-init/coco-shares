Feature: Shareholder record management

  Background:
    Given an active admin is logged in
    And a user with phone and address exists

  Scenario: An admin creates the shareholder record of a user
    When the admin creates the shareholder record with 1500 shares, 12.3456 percent and 1500.00 of capital
    Then the response status is 201
    And the user has a shareholder record with 1500 shares, 12.3456 percent and 1500.00 of capital

  Scenario: A user can only have one shareholder record
    Given the user already has a shareholder record
    When the admin creates the shareholder record with 1500 shares, 12.3456 percent and 1500.00 of capital
    Then the response status is 409
    And the response detail is "El usuario ya tiene una ficha de accionista"

  Scenario Outline: Values out of range are rejected on creation
    When the admin creates the shareholder record with <shares> shares, <percentage> percent and <capital> of capital
    Then the response status is 422
    And the response detail is "Los datos enviados no son válidos"
    And the user has no shareholder record

    Examples:
      | shares | percentage | capital  |
      | -1     | 10         | 100.00   |
      | 100    | -0.0001    | 100.00   |
      | 100    | 100.0001   | 100.00   |
      | 100    | 10.12345   | 100.00   |
      | 100    | 10         | -0.01    |
      | 100    | 10         | 100.123  |

  Scenario: A shareholder record needs the phone and address of the user
    Given the user has no phone
    When the admin creates the shareholder record with 1500 shares, 12.3456 percent and 1500.00 of capital
    Then the response status is 422
    And the response detail is "Los datos enviados no son válidos"

  Scenario: An admin edits the shareholder record and the values are kept as typed
    Given the user already has a shareholder record
    When the admin changes the shares to 2000 and the representative name to "Lucía Gómez"
    Then the response status is 200
    And the user has a shareholder record with 2000 shares, 10.0000 percent and 1000.00 of capital
    And the representative name is "Lucía Gómez"

  Scenario: Values out of range are rejected on edition
    Given the user already has a shareholder record
    When the admin changes the percentage to 101
    Then the response status is 422
    And the response detail is "Los datos enviados no son válidos"
    And the user has a shareholder record with 1000 shares, 10.0000 percent and 1000.00 of capital

  Scenario: An admin deletes a shareholder record without dependencies
    Given the user already has a shareholder record
    When the admin deletes the shareholder record
    Then the response status is 204
    And the user has no shareholder record

  Scenario: A shareholder record with representation forms cannot be deleted
    Given the user already has a shareholder record with a representation form
    When the admin deletes the shareholder record
    Then the response status is 409
    And the response detail is "No se puede eliminar la ficha porque tiene boletines de representación"
    And the user has a shareholder record with 1000 shares, 10.0000 percent and 1000.00 of capital

  Scenario: A user without shareholder record cannot be edited
    When the admin changes the percentage to 50
    Then the response status is 404
    And the response detail is "El usuario no tiene ficha de accionista"

  Scenario: An unknown user cannot get a shareholder record
    When the admin creates a shareholder record for the user with id 999999
    Then the response status is 404
    And the response detail is "Usuario no encontrado"

  Scenario Outline: Only an admin can manage shareholder records
    Given a "<role>" is logged in instead
    When the admin creates the shareholder record with 1500 shares, 12.3456 percent and 1500.00 of capital
    Then the response status is 403

    Examples:
      | role    |
      | manager |
      | user    |
