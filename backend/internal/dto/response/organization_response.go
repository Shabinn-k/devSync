package response

import (
	"time"
	"github.com/google/uuid"
)

type OrganizationResponse struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	Description string    `json:"description"`
	LogoURL     string    `json:"logo_url"`
	Website     string    `json:"website"`
	Location    string    `json:"location"`
	CreatedBy   uuid.UUID `json:"created_by"`
	MemberCount int       `json:"member_count"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type OrganizationMemberResponse struct {
	ID       uuid.UUID       `json:"id"`
	UserID   uuid.UUID       `json:"user_id"`
	UserName string          `json:"user_name"`
	UserEmail string         `json:"user_email"`
	Role     string          `json:"role"`
	JoinedAt time.Time       `json:"joined_at"`
	User     UserResponse    `json:"user,omitempty"`
}

type OrganizationDetailResponse struct {
	OrganizationResponse
	Members []OrganizationMemberResponse `json:"members"`
}