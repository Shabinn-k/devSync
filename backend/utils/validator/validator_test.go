package validator_test

import (
	"testing"

	"devSync/internal/dto/request"
	"devSync/utils/validator"
)

func TestValidateRequestDTOs(t *testing.T) {
	tests := []struct {
		name      string
		value     any
		wantError bool
	}{
		{"valid login", request.LoginRequest{Email: "a@example.com", Password: "pass"}, false},
		{"missing login email", request.LoginRequest{Password: "pass"}, true},
		{"invalid registration role", request.RegisterRequest{Name: "Tester", Email: "a@example.com", Password: "Pass1234", ConfirmPassword: "Pass1234", Role: "admin"}, true},
		{"valid task", request.CreateTaskRequest{ProjectID: 1, Title: "Task", Priority: "high"}, false},
		{"invalid task priority", request.CreateTaskRequest{ProjectID: 1, Title: "Task", Priority: "critical"}, true},
		{"negative team id", request.CreateTeamRequest{OrganizationID: -1, Name: "Team", LeadID: 1}, true},
		{"overlong chat message", request.SendMessageRequest{Message: string(make([]byte, 4001))}, true},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			got := validator.ValidateStruct(test.value) != nil
			if got != test.wantError {
				t.Fatalf("validation error=%v want=%v", got, test.wantError)
			}
		})
	}
}
