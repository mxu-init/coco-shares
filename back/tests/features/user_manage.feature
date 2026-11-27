Feature: User management

  Background:
    Given an active admin is logged in
    And a user with the role "user" exists

  Scenario: An admin edits the data and the role of a user
    When the admin changes the user first name to "Lucía" and the role to "manager"
    Then the response status is 200
    And the user has the first name "Lucía" and the role "manager"

  Scenario: An edition keeps the same validations as the creation
    When the admin changes the user tax id to "12345678A"
    Then the response status is 422
    And the response detail is "Los datos enviados no son válidos"

  Scenario: An edition with the email of another user is rejected
    Given another user with email "marta.ruiz@correo.es" exists
    When the admin changes the user email to "marta.ruiz@correo.es"
    Then the response status is 409
    And the response detail is "Ya existe un usuario con ese email"

  Scenario: An edition that keeps the same email is accepted
    When the admin saves the user with its current email
    Then the response status is 200

  Scenario: An admin cannot remove its own admin role
    When the admin changes its own role to "manager"
    Then the response status is 409
    And the response detail is "No puede quitarse a sí mismo el rol de administrador"

  Scenario: A deactivated user loses access on the next request
    When the admin deactivates the user
    Then the response status is 200
    And the user is not active
    And the user cannot access its own profile

  Scenario: An admin reactivates a user
    Given the user is not active anymore
    When the admin activates the user
    Then the response status is 200
    And the user is active

  Scenario: An admin cannot deactivate itself
    When the admin deactivates itself
    Then the response status is 409
    And the response detail is "No puede desactivar su propio usuario"

  Scenario: An admin resets the password of a user
    When the admin resets the user password
    Then the response status is 200
    And the user can only log in with the new temporary password

  Scenario: An admin cannot delete itself
    When the admin deletes itself
    Then the response status is 409
    And the response detail is "No puede borrar su propio usuario"

  Scenario: Deleting a user removes its personal data and keeps its authorship
    Given the user is a shareholder with a representation form
    And the user created a meeting
    When the admin deletes the user
    Then the response status is 204
    And the user, its shareholder record and its representation forms are deleted
    And the meeting is kept without author

  Scenario: An unknown user cannot be edited
    When the admin deactivates the user with id 999999
    Then the response status is 404
    And the response detail is "Usuario no encontrado"
