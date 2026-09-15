package response

import "time"

type ChatChannelResponse struct {
	ID             int                  `json:"id"`
	OrganizationID *int                 `json:"organization_id,omitempty"`
	ProjectID      *int                 `json:"project_id,omitempty"`
	TeamID         *int                 `json:"team_id,omitempty"`
	Name           string               `json:"name"`
	Type           string               `json:"type"`
	CreatedBy      int                  `json:"created_by"`
	CreatedAt      time.Time            `json:"created_at"`
	UpdatedAt      time.Time            `json:"updated_at"`
	Members        []ChatMemberResponse `json:"members,omitempty"`
	LastMessage    *ChatMessageResponse `json:"last_message,omitempty"`
}

type ChatMemberResponse struct {
	ID       int       `json:"id"`
	UserID   int       `json:"user_id"`
	UserName string    `json:"user_name"`
	Email    string    `json:"email"`
	JoinedAt time.Time `json:"joined_at"`
}

type ChatMessageResponse struct {
	ID            int       `json:"id"`
	ChannelID     int       `json:"channel_id"`
	SenderID      int       `json:"sender_id"`
	SenderName    string    `json:"sender_name"`
	SenderEmail   string    `json:"sender_email"`
	Message       string    `json:"message"`
	AttachmentURL string    `json:"attachment_url,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
}
