package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID uuid.UUID `gorm:"type:uuid;primaryKey"`

	Username string `gorm:"type:varchar(50);uniqueIndex;not null"`
	Email    string `gorm:"type:varchar(255);uniqueIndex;not null"`

	PasswordHash string `gorm:"type:text;not null"`

	IsVerified bool `gorm:"default:false"`
	IsActive   bool `gorm:"default:true"`

	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	u.ID = uuid.New()
	return nil
}