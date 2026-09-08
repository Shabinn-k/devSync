package response

import "time"

type TaskResponse struct {
	ID          int        `json:"id"`
	ProjectID   int        `json:"project_id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Status      string     `json:"status"`
	Priority    string     `json:"priority"`
	AssigneeID  *int       `json:"assignee_id"`
	Assignee    *UserResponse `json:"assignee,omitempty"`
	CreatedBy   int        `json:"created_by"`
	Creator     *UserResponse `json:"creator,omitempty"`
	DueDate     *time.Time `json:"due_date"`
	CompletedAt *time.Time `json:"completed_at"`
	CommentCount int       `json:"comment_count"`
	IsActive    bool       `json:"is_active"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type TaskDetailResponse struct {
	TaskResponse
	Comments []CommentResponse `json:"comments"`
}

type CommentResponse struct {
	ID        int          `json:"id"`
	TaskID    int          `json:"task_id"`
	UserID    int          `json:"user_id"`
	User      *UserResponse `json:"user,omitempty"`
	Content   string       `json:"content"`
	CreatedAt time.Time    `json:"created_at"`
	UpdatedAt time.Time    `json:"updated_at"`
}