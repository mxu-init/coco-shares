Feature: Initial data

  Scenario: Seeding twice does not duplicate data
    When the initial data is seeded twice
    Then exactly one admin user exists
    And each initial page content exists once

  Scenario: Seeding does not overwrite an edited text
    Given the initial data is seeded
    And the text "no_active_meeting" has been edited
    When the initial data is seeded again
    Then the text "no_active_meeting" keeps the edited body
