package request

type CreateChannelRequest struct {
	Name           string `json:"name" validate:"required,min=2,max=100"`
	Type           string `json:"type" validate:"required,oneof=org project team direct"`
	OrganizationID *int   `json:"organization_id" validate:"omitempty,gt=0"`
	ProjectID      *int   `json:"project_id" validate:"omitempty,gt=0"`
	TeamID         *int   `json:"team_id" validate:"omitempty,gt=0"`
	RecipientID    *int   `json:"recipient_id" validate:"omitempty,gt=0"`
}

type SendMessageRequest struct {
	Message       string `json:"message" validate:"required,min=1,max=4000"`
	AttachmentURL string `json:"attachment_url" validate:"omitempty,max=2048"`
}

type DirectMessageRequest struct {
	RecipientID int    `json:"recipient_id" validate:"required,gt=0"`
	Message     string `json:"message"`
}
