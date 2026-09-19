package request

import (
	"time"
)

type CreateProjectRequest struct {
	OrganizationID int        `json:"organization_id" validate:"required"`
	TeamID         *int       `json:"team_id" validate:"omitempty,gt=0"`
	Name           string     `json:"name" validate:"required,min=2,max=100"`
	Description    string     `json:"description" validate:"omitempty,max=500"`
	Priority       string     `json:"priority" validate:"omitempty,oneof=low medium high urgent LOW MEDIUM HIGH URGENT"`
	StartDate      *time.Time `json:"start_date"`
	EndDate        *time.Time `json:"end_date"`
}

type UpdateProjectRequest struct {
	Name        string     `json:"name" validate:"omitempty,min=2,max=100"`
	Description string     `json:"description" validate:"omitempty,max=500"`
	Status      string     `json:"status" validate:"omitempty,oneof=active inactive completed archived"`
	Priority    string     `json:"priority" validate:"omitempty,oneof=low medium high urgent LOW MEDIUM HIGH URGENT"`
	TeamID      *int       `json:"team_id"`
	StartDate   *time.Time `json:"start_date"`
	EndDate     *time.Time `json:"end_date"`
}

type AddProjectMemberRequest struct {
	UserID int    `json:"user_id" validate:"required"`
	Role   string `json:"role" validate:"required,oneof=admin member"`
}

type UpdateProjectMemberRoleRequest struct {
	Role string `json:"role" validate:"required,oneof=admin member"`
}
