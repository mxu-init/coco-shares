Feature: Cross-origin access for the frontend

  Scenario: The frontend origin is allowed
    When the frontend origin sends a preflight request to the health endpoint
    Then the response status is 200
    And the response allows the frontend origin
