package response

import "time"

type TeamResponse struct {
	ID             int          `json:"id"`
	OrganizationID int          `json:"organization_id"`
	Name           string       `json:"name"`
	Description    string       `json:"description"`
	LeadID         int          `json:"lead_id"`
	Lead           *UserResponse `json:"lead,omitempty"`
	MemberCount    int          `json:"member_count"`
	IsActive       bool         `json:"is_active"`
	CreatedAt      time.Time    `json:"created_at"`
	UpdatedAt      time.Time    `json:"updated_at"`
}

type TeamDetailResponse struct {
	TeamResponse
	Members []TeamMemberResponse `json:"members"`
}

type TeamMemberResponse struct {
	ID       int          `json:"id"`
	TeamID   int          `json:"team_id"`
	UserID   int          `json:"user_id"`
	User     *UserResponse `json:"user,omitempty"`
	Role     string       `json:"role"`
	JoinedAt time.Time    `json:"joined_at"`
}