package request

import (
	"time"
)

type CreateProjectRequest struct {
	OrganizationID int        `json:"organization_id" validate:"required"`
	Name           string     `json:"name" validate:"required,min=2,max=100"`
	Description    string     `json:"description" validate:"omitempty,max=500"`
	Priority       string     `json:"priority" validate:"omitempty,oneof=low medium high urgent"`
	StartDate      *time.Time `json:"start_date"`
	EndDate        *time.Time `json:"end_date"`
}

type UpdateProjectRequest struct {
	Name        string     `json:"name" validate:"omitempty,min=2,max=100"`
	Description string     `json:"description" validate:"omitempty,max=500"`
	Status      string     `json:"status" validate:"omitempty,oneof=active inactive completed archived"`
	Priority    string     `json:"priority" validate:"omitempty,oneof=low medium high urgent"`
	StartDate   *time.Time `json:"start_date"`
	EndDate     *time.Time `json:"end_date"`
}

type AddProjectMemberRequest struct {
	UserID int    `json:"user_id" validate:"required"`
	Role   string `json:"role" validate:"required,oneof=admin member viewer"`
}

type UpdateProjectMemberRoleRequest struct {
	Role string `json:"role" validate:"required,oneof=admin member viewer"`
}

