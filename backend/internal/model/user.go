package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID               uuid.UUID `gorm:"type:uuid;primaryKey"`
	FullName         string    `gorm:"size:100;not null"`
	Username         string    `gorm:"size:50;uniqueIndex;not null"`
	Email            string    `gorm:"size:100;uniqueIndex;not null"`
	PasswordHash     string    `gorm:"type:text;not null"`

	IsVerified       bool      `gorm:"default:false"`
	VerificationOTP  string    `gorm:"size:10"`
	OTPExpiresAt     *time.Time

	IsActive         bool      `gorm:"default:true"`

	CreatedAt        time.Time
	UpdatedAt        time.Time

	RefreshTokens    []RefreshToken `gorm:"foreignKey:UserID"`
}


func (u *User) BeforeCreate(tx *gorm.DB) error {
	u.ID = uuid.New()
	return nil
}