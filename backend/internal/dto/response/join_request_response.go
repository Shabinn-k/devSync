package response

import "time"

type JoinRequestUserSummary struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

type JoinRequestOrgSummary struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Slug        string `json:"slug"`
	Description string `json:"description"`
	MemberCount int    `json:"member_count"`
}

type JoinRequestResponse struct {
	ID             int                     `json:"id"`
	OrganizationID int                     `json:"organization_id"`
	UserID         int                     `json:"user_id"`
	Message        string                  `json:"message"`
	Status         string                  `json:"status"`
	ReviewedBy     *int                    `json:"reviewed_by"`
	ReviewedAt     *time.Time              `json:"reviewed_at"`
	CreatedAt      time.Time               `json:"created_at"`
	UpdatedAt      time.Time               `json:"updated_at"`

	User         *JoinRequestUserSummary `json:"user,omitempty"`
	Organization *JoinRequestOrgSummary  `json:"organization,omitempty"`
}