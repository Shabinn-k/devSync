package model

import (
	"time"
)

type Project struct {
	ID             int        `gorm:"primaryKey;autoIncrement"`
	OrganizationID int        `gorm:"not null;index"`
	Name           string     `gorm:"size:100;not null"`
	Description    string     `gorm:"type:text"`
	Status         string     `gorm:"size:20;default:'active'"`
	Priority       string     `gorm:"size:20;default:'medium'"`
	StartDate      *time.Time `gorm:"index"`
	EndDate        *time.Time `gorm:"index"`
	CreatedBy      int        `gorm:"not null"`
	IsActive       bool       `gorm:"default:true"`
	CreatedAt      time.Time  `gorm:"autoCreateTime"`
	UpdatedAt      time.Time  `gorm:"autoUpdateTime"`

	Organization Organization    `gorm:"foreignKey:OrganizationID"`
	Creator      User            `gorm:"foreignKey:CreatedBy"`
	Members      []ProjectMember `gorm:"foreignKey:ProjectID"`
	Tasks        []Task          `gorm:"foreignKey:ProjectID"`
}

const (
	ProjectStatusActive    = "active"
	ProjectStatusInactive  = "inactive"
	ProjectStatusCompleted = "completed"
	ProjectStatusArchived  = "archived"
)

const (
	ProjectPriorityLow    = "low"
	ProjectPriorityMedium = "medium"
	ProjectPriorityHigh   = "high"
	ProjectPriorityUrgent = "urgent"
)

type ProjectMember struct {
	ID        int       `gorm:"primaryKey;autoIncrement"`
	ProjectID int       `gorm:"not null;index"`
	UserID    int       `gorm:"not null;index"`
	Role      string    `gorm:"size:20;default:'member'"`
	JoinedAt  time.Time `gorm:"autoCreateTime"`
	IsActive  bool      `gorm:"default:true"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`

	Project Project `gorm:"foreignKey:ProjectID"`
	User    User    `gorm:"foreignKey:UserID"`
}

const (
	ProjectRoleAdmin  = "admin"
	ProjectRoleMember = "member"
	ProjectRoleViewer = "viewer"
)