package model

import (
	"time"
)

type User struct {
	ID                int        `gorm:"primaryKey;autoIncrement"`
	Name              string     `gorm:"size:100;not null"`
	Email             string     `gorm:"size:100;uniqueIndex;not null"`
	PasswordHash      string     `gorm:"type:text;not null"`
	Role              string     `gorm:"size:20;default:'developer'"` // ✅ NEW: developer | team_lead | admin
	IsVerified        bool       `gorm:"default:false"`
	VerificationOTP   string     `gorm:"size:10"`
	OTPExpiresAt      *time.Time
	ResetOTP          string     `gorm:"size:10"`
	ResetOTPExpiresAt *time.Time
	LastOTPResendAt   *time.Time
	LastLoginAt       *time.Time
	IsActive          bool       `gorm:"default:true"`
	CreatedAt         time.Time  `gorm:"autoCreateTime"`
	UpdatedAt         time.Time  `gorm:"autoUpdateTime"`

	// Relationships
	RefreshTokens []RefreshToken    `gorm:"foreignKey:UserID"`
	Organizations []OrganizationMember `gorm:"foreignKey:UserID"`
	Projects      []ProjectMember   `gorm:"foreignKey:UserID"`
	Tasks         []Task            `gorm:"foreignKey:AssigneeID"`
}
 
const (
	RoleDeveloper = "developer"
	RoleTeamLead  = "team_lead"
	RoleAdmin     = "admin"
)