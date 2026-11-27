Feature: User creation

  Scenario: An admin creates a user
    When an admin creates an individual user with tax id "12345678Z"
    Then the response status is 201
    And the created user is returned with an activation token

  Scenario: A repeated email is rejected
    Given a user with email "ana.lopez@correo.es" already exists
    When an admin creates an individual user with email "ana.lopez@correo.es"
    Then the response status is 409
    And the response detail is "Ya existe un usuario con ese email"

  Scenario: An invalid tax id is rejected
    When an admin creates an individual user with tax id "12345678A"
    Then the response status is 422
    And the response detail is "Los datos enviados no son válidos"

  Scenario: A company is saved without last name
    When an admin creates a company with last name "López"
    Then the response status is 201
    And the created user has no last name