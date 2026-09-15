package model

import (
	"time"
)

type Organization struct {
	ID          int    `gorm:"primaryKey;autoIncrement"`
	Name        string `gorm:"size:100;not null"`
	Slug        string `gorm:"size:100;uniqueIndex;not null"`
	Description string `gorm:"type:text"`
	LogoURL     string `gorm:"type:text"`
	Website     string `gorm:"size:200"`
	Location    string `gorm:"size:100"`
	CreatedBy   int    `gorm:"not null"`
	IsActive    bool   `gorm:"default:true"`
	CreatedAt   time.Time `gorm:"autoCreateTime"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime"`

	Owner   User                 `gorm:"foreignKey:CreatedBy"`
	Members []OrganizationMember `gorm:"foreignKey:OrganizationID"`
}

type OrganizationMember struct {
	ID             int       `gorm:"primaryKey;autoIncrement"`
	OrganizationID int       `gorm:"not null;index"`
	UserID         int       `gorm:"not null;index"`
	Role           string    `gorm:"size:20;not null;default:'member'"`
	JoinedAt       time.Time `gorm:"autoCreateTime"`
	IsActive       bool      `gorm:"default:true"`
	CreatedAt      time.Time `gorm:"autoCreateTime"`
	UpdatedAt      time.Time `gorm:"autoUpdateTime"`

	Organization Organization `gorm:"foreignKey:OrganizationID"`
	User         User         `gorm:"foreignKey:UserID"`
}

const (
	OrgRoleAdmin    = RoleAdmin
	OrgRoleTeamLead = RoleTeamLead
	RoleMember      = "member"
	RoleViewer      = "viewer"
)