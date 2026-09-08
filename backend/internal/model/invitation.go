package model

import (
	"time"
)

type OrganizationInvitation struct {
	ID             int       `gorm:"primaryKey;autoIncrement"`
	OrganizationID int       `gorm:"not null;index"`
	Email          string    `gorm:"size:255;not null;index"`
	Token          string    `gorm:"size:255;not null;uniqueIndex"`
	Role           string    `gorm:"size:20;default:'member'"`
	Status         string    `gorm:"size:20;default:'pending'"`
	ExpiresAt      time.Time `gorm:"not null"`
	CreatedBy      int       `gorm:"not null"`
	CreatedAt      time.Time `gorm:"autoCreateTime"`
	UpdatedAt      time.Time `gorm:"autoUpdateTime"`

	Organization Organization `gorm:"foreignKey:OrganizationID"`
	Creator      User         `gorm:"foreignKey:CreatedBy"`
}


const (
	InvitationStatusPending  = "pending"
	InvitationStatusAccepted = "accepted"
	InvitationStatusDeclined = "declined"
	InvitationStatusExpired  = "expired"
)