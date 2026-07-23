package model

import (
	"time"
	"github.com/google/uuid"
)

type RefreshToken struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey"`
	UserID    uuid.UUID `gorm:"type:uuid;not null;index"`
	TokenHash string    `gorm:"type:text;not null;index"`
	ExpiresAt time.Time `gorm:"not null"`
	IsRevoked bool      `gorm:"default:false;index"`
	CreatedAt time.Time
	UpdatedAt time.Time
	
	User User `gorm:"foreignKey:UserID"`
}