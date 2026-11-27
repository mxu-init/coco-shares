Feature: Unique constraints

  Background:
    Given a published meeting with a shareholder who has sent a representation form

  Scenario Outline: The database rejects duplicated data
    When <duplicate> is saved
    Then the database rejects it

    Examples:
      | duplicate                                        |
      | a user with the same email                       |
      | a user with the same tax id                      |
      | a second shareholder record for the same user    |
      | a second call with the same number               |
      | a second representation form for the same meeting |
