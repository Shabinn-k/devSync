package response

import (
	"time"
)

type ProjectResponse struct {
	ID             int        `json:"id"`
	OrganizationID int        `json:"organization_id"`
	Name           string     `json:"name"`
	Description    string     `json:"description"`
	Status         string     `json:"status"`
	Priority       string     `json:"priority"`
	StartDate      *time.Time `json:"start_date"`
	EndDate        *time.Time `json:"end_date"`
	CreatedBy      int        `json:"created_by"`
	MemberCount    int        `json:"member_count"`
	TaskCount      int        `json:"task_count"`
	IsActive       bool       `json:"is_active"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

type ProjectDetailResponse struct {
	ProjectResponse
	Members []ProjectMemberResponse `json:"members"`
	Tasks   []TaskResponse          `json:"tasks,omitempty"`
}

type ProjectMemberResponse struct {
	ID        int       `json:"id"`
	ProjectID int       `json:"project_id"`
	UserID    int       `json:"user_id"`
	UserName  string    `json:"user_name"`
	UserEmail string    `json:"user_email"`
	Role      string    `json:"role"`
	JoinedAt  time.Time `json:"joined_at"`
}
