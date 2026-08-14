package request

type CreateOrganizationRequest struct {
	Name        string `json:"name" validate:"required,min=2,max=100"`
	Slug        string `json:"slug" validate:"required,min=2,max=100,slug_format"`
	Description string `json:"description" validate:"omitempty,max=500"`
	Website     string `json:"website" validate:"omitempty,url"`
	Location    string `json:"location" validate:"omitempty,max=100"`
}

type UpdateOrganizationRequest struct {
	Name        string `json:"name" validate:"omitempty,min=2,max=100"`
	Description string `json:"description" validate:"omitempty,max=500"`
	Website     string `json:"website" validate:"omitempty,url"`
	Location    string `json:"location" validate:"omitempty,max=100"`
}

type AddMemberRequest struct {
	UserID string `json:"user_id" validate:"omitempty"`
	Email  string `json:"email" validate:"omitempty"`
	Role   string `json:"role" validate:"required,oneof=admin member viewer"`
}

type UpdateMemberRoleRequest struct {
	Role string `json:"role" validate:"required,oneof=admin member viewer"`
}
