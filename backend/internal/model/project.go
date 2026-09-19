package model

import (
	"time"
)

type Project struct {
	ID             int        `gorm:"primaryKey;autoIncrement" json:"id"`
	OrganizationID int        `gorm:"not null;index" json:"organization_id"`
	TeamID         *int       `gorm:"index" json:"team_id,omitempty"`  
	Name           string     `gorm:"size:100;not null" json:"name"`
	Description    string     `gorm:"type:text" json:"description"`
	Status         string     `gorm:"size:20;default:'active'" json:"status"`
	Priority       string     `gorm:"size:20;default:'medium'" json:"priority"`
	StartDate      *time.Time `gorm:"index" json:"start_date,omitempty"`
	EndDate        *time.Time `gorm:"index" json:"end_date,omitempty"`
	CreatedBy      int        `gorm:"not null" json:"created_by"`
	IsActive       bool       `gorm:"default:true" json:"is_active"`
	CreatedAt      time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt      time.Time  `gorm:"autoUpdateTime" json:"updated_at"`

	Organization Organization    `gorm:"foreignKey:OrganizationID" json:"organization,omitempty"`
	Team         *Team           `gorm:"foreignKey:TeamID" json:"team,omitempty"` 
	Creator      User            `gorm:"foreignKey:CreatedBy" json:"creator,omitempty"`
	Members      []ProjectMember `gorm:"foreignKey:ProjectID" json:"members,omitempty"`
	Tasks        []Task          `gorm:"foreignKey:ProjectID" json:"tasks,omitempty"`
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
)