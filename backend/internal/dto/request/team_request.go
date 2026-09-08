package request

type CreateTeamRequest struct {
	OrganizationID int    `json:"organization_id" validate:"required"`
	Name           string `json:"name" validate:"required,min=2,max=100"`
	Description    string `json:"description" validate:"omitempty,max=500"`
	LeadID         int    `json:"lead_id" validate:"required"`
}

type UpdateTeamRequest struct {
	Name        string `json:"name" validate:"omitempty,min=2,max=100"`
	Description string `json:"description" validate:"omitempty,max=500"`
	LeadID      int    `json:"lead_id" validate:"omitempty"`
	IsActive    *bool  `json:"is_active"`
}

type AddTeamMemberRequest struct {
	UserID int    `json:"user_id" validate:"required"`
	Role   string `json:"role" validate:"required,oneof=admin member"`
}

type UpdateTeamMemberRoleRequest struct {
	Role string `json:"role" validate:"required,oneof=admin member"`
}