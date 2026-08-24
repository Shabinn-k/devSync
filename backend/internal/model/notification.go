package model

import (
	"time"
)

type Notification struct {
	ID        int64     `gorm:"primaryKey;autoIncrement"`
	UserID    int64     `gorm:"not null;index"`
	Type      string    `gorm:"size:50;not null"`
	Title     string    `gorm:"size:200;not null"`
	Content   string    `gorm:"type:text"`
	ActionURL string    `gorm:"size:500"`
	Metadata  string    `gorm:"type:text"` // JSON
	IsRead    bool      `gorm:"default:false;index"`
	CreatedAt time.Time `gorm:"index"`
	UpdatedAt time.Time

	User User `gorm:"foreignKey:UserID"`
}

const (
	TypeTaskAssigned      = "task.assigned"
	TypeTaskCompleted     = "task.completed"
	TypeTaskOverdue       = "task.overdue"
	TypeProjectCreated    = "project.created"
	TypeProjectCompleted  = "project.completed"
	TypeMemberAdded       = "member.added"
	TypeMemberRemoved     = "member.removed"
	TypeRoleChanged       = "role.changed"
	TypeOrganizationCreated = "organization.created"
	TypeCommentAdded      = "comment.added"
	TypeMention           = "mention"
	TypeSystem            = "system"
)