package model

import (
	"time"
)

type Task struct {
	ID          int        `gorm:"primaryKey;autoIncrement"`
	ProjectID   int        `gorm:"not null;index"`
	Title       string     `gorm:"size:200;not null"`
	Description string     `gorm:"type:text"`
	Status      string     `gorm:"size:20;default:'todo'"`
	Priority    string     `gorm:"size:20;default:'medium'"`
	AssigneeID  *int       `gorm:"index"`
	CreatedBy   int        `gorm:"not null"`
	DueDate     *time.Time `gorm:"index"`
	CompletedAt *time.Time
	IsActive    bool       `gorm:"default:true"`
	CreatedAt   time.Time  `gorm:"autoCreateTime"`
	UpdatedAt   time.Time  `gorm:"autoUpdateTime"`

	// Relationships
	Project  Project   `gorm:"foreignKey:ProjectID"`
	Assignee *User     `gorm:"foreignKey:AssigneeID"`
	Creator  User      `gorm:"foreignKey:CreatedBy"`
	Comments []Comment `gorm:"foreignKey:TaskID"`
}

// Task Status Constants
const (
	TaskStatusTodo       = "todo"
	TaskStatusInProgress = "in_progress"
	TaskStatusReview     = "review"
	TaskStatusDone       = "done"
)

// Task Priority Constants
const (
	TaskPriorityLow    = "low"
	TaskPriorityMedium = "medium"
	TaskPriorityHigh   = "high"
	TaskPriorityUrgent = "urgent"
)

type Comment struct {
	ID        int       `gorm:"primaryKey;autoIncrement"`
	TaskID    int       `gorm:"not null;index"`
	UserID    int       `gorm:"not null;index"`
	Content   string    `gorm:"type:text;not null"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`

	// Relationships
	Task Task `gorm:"foreignKey:TaskID"`
	User User `gorm:"foreignKey:UserID"`
}