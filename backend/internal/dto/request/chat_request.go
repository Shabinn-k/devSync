package request

type CreateChannelRequest struct {
	Name           string `json:"name" validate:"required,min=2,max=100"`
	Type           string `json:"type" validate:"required,oneof=org project direct"`
	OrganizationID *int   `json:"organization_id"`
	ProjectID      *int   `json:"project_id"`
	TeamID         *int   `json:"team_id"`
	RecipientID    *int   `json:"recipient_id"` 
}

type SendMessageRequest struct {
	Message       string `json:"message" validate:"required,min=1"`
	AttachmentURL string `json:"attachment_url"`
}

type DirectMessageRequest struct {
	RecipientID int    `json:"recipient_id" validate:"required"`
	Message     string `json:"message"`
}
