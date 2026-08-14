package model

import (
	"github.com/google/uuid"
	"time"
)

type Organization struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Name        string    `gorm:"size:100;not null"`
	Slug        string    `gorm:"size:100;uniqueIndex;not null"`
	Description string    `gorm:"type:text"`
	LogoURL     string    `gorm:"type:text"`
	Website     string    `gorm:"size:200"`
	Location    string    `gorm:"size:100"`
	CreatedBy   uuid.UUID `gorm:"type:uuid;not null"`
	IsActive    bool      `gorm:"default:true"`
	CreatedAt   time.Time `gorm:"autoCreateTime"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime"`

	Owner   User                 `gorm:"foreignKey:CreatedBy"`
	Members []OrganizationMember `gorm:"foreignKey:OrganizationID"`
}

type OrganizationMember struct {
	ID             uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	OrganizationID uuid.UUID `gorm:"type:uuid;not null;index"`
	UserID         uuid.UUID `gorm:"type:uuid;not null;index"`
	Role           string    `gorm:"size:20;not null;default:'member'"`
	JoinedAt       time.Time `gorm:"autoCreateTime"`
	IsActive       bool      `gorm:"default:true"`
	CreatedAt      time.Time `gorm:"autoCreateTime"`
	UpdatedAt      time.Time `gorm:"autoUpdateTime"`

	Organization Organization `gorm:"foreignKey:OrganizationID"`
	User         User         `gorm:"foreignKey:UserID"`
}

const (
	RoleAdmin  = "admin"
	RoleMember = "member"
	RoleViewer = "viewer"
)
