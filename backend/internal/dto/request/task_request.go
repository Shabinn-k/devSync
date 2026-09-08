package request

import "time"

type CreateTaskRequest struct {
	ProjectID   int        `json:"project_id" validate:"required"`
	Title       string     `json:"title" validate:"required,min=2,max=200"`
	Description string     `json:"description" validate:"omitempty,max=500"`
	Priority    string     `json:"priority" validate:"omitempty,oneof=low medium high urgent"`
	AssigneeID  *int       `json:"assignee_id"`
	DueDate     *time.Time `json:"due_date"`
}

type UpdateTaskRequest struct {
	Title       string     `json:"title" validate:"omitempty,min=2,max=200"`
	Description string     `json:"description" validate:"omitempty,max=500"`
	Status      string     `json:"status" validate:"omitempty,oneof=todo in_progress review done"`
	Priority    string     `json:"priority" validate:"omitempty,oneof=low medium high urgent"`
	AssigneeID  *int       `json:"assignee_id"`
	DueDate     *time.Time `json:"due_date"`
}

type UpdateTaskStatusRequest struct {
	Status string `json:"status" validate:"required,oneof=todo in_progress review done"`
}

type AddCommentRequest struct {
	Content string `json:"content" validate:"required,min=1"`
}