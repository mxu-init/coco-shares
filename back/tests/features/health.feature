Feature: Service health

  Scenario: Health endpoint reports the service is running
    When the client requests the health endpoint
    Then the response status is 200
    And the response status field is "ok"
