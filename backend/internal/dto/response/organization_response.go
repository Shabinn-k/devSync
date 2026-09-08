package response

import (
	"time"
)

type OrganizationResponse struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	Description string    `json:"description"`
	LogoURL     string    `json:"logo_url"`
	Website     string    `json:"website"`
	Location    string    `json:"location"`
	CreatedBy   int       `json:"created_by"`
	MemberCount int       `json:"member_count"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type OrganizationMemberResponse struct {
	ID        int          `json:"id"`
	UserID    int          `json:"user_id"`
	UserName  string       `json:"user_name"`
	UserEmail string       `json:"user_email"`
	Role      string       `json:"role"`
	JoinedAt  time.Time    `json:"joined_at"`
	User      UserResponse `json:"user,omitempty"`
}

type OrganizationDetailResponse struct {
	OrganizationResponse
	Members []OrganizationMemberResponse `json:"members"`
}
