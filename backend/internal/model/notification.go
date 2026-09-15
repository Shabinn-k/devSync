package model

import (
	"time"
)

type Notification struct {
	ID        int       `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID    int       `gorm:"not null;index" json:"user_id"`
	Type      string    `gorm:"size:50;not null" json:"type"`
	Title     string    `gorm:"size:200;not null" json:"title"`
	Content   string    `gorm:"type:text;not null" json:"content"`
	ActionURL string    `gorm:"size:500" json:"action_url"`
	Metadata  string    `gorm:"type:jsonb" json:"metadata"`
	IsRead    bool      `gorm:"default:false;index" json:"is_read"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	User User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func (Notification) TableName() string {
	return "notifications"
}

const (
	TypeTaskAssigned        = "task.assigned"
	TypeTaskCompleted       = "task.completed"
	TypeTaskOverdue         = "task.overdue"
	TypeProjectCreated      = "project.created"
	TypeProjectCompleted    = "project.completed"
	TypeMemberAdded         = "member.added"
	TypeMemberRemoved       = "member.removed"
	TypeRoleChanged         = "role.changed"
	TypeOrganizationCreated = "organization.created"
	TypeCommentAdded        = "comment.added"
	TypeMention             = "mention"
	TypeSystem              = "system"
)