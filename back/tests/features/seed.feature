Feature: Initial data

  Scenario: The first admin is created only once
    When the initial data is seeded twice
    Then exactly one admin user exists
