package model

import (
	"time"
	"gorm.io/gorm"
	"github.com/google/uuid"
)

type RefreshToken struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey"`
	UserID     uuid.UUID `gorm:"type:uuid;not null;index"`

	TokenHash  string    `gorm:"type:text;not null"`

	ExpiresAt  time.Time `gorm:"not null"`
	IsRevoked  bool      `gorm:"default:false"`

	DeviceName string    `gorm:"size:100"`
	UserAgent  string    `gorm:"type:text"`
	IPAddress  string    `gorm:"size:50"`

	CreatedAt  time.Time
	UpdatedAt  time.Time

	User User `gorm:"foreignKey:UserID"`
}

func (r *RefreshToken) BeforeCreate(tx *gorm.DB) error {
	r.ID = uuid.New()
	return nil
}