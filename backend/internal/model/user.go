package model

import (
	"time"
	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Name     string     `gorm:"size:100;not null"`
	Email        string     `gorm:"size:100;uniqueIndex;not null"`
	PasswordHash string     `gorm:"type:text;not null"`
	
	IsVerified      bool       `gorm:"default:false"`
	VerificationOTP string     `gorm:"size:10"`
	OTPExpiresAt    *time.Time
	LastOTPResendAt *time.Time

	ResetOTP          *string    `gorm:"size:10"`
	ResetOTPExpiresAt *time.Time
	
	ResetToken          *string    `gorm:"size:100;index"`
	ResetTokenExpiresAt *time.Time
	
	LastLoginAt *time.Time
	IsActive    bool       `gorm:"default:true"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
	
	RefreshTokens []RefreshToken `gorm:"foreignKey:UserID"`
}