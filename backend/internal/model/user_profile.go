package model

import (
	"time"
)

type UserProfile struct {
	ID             int       `gorm:"primaryKey;autoIncrement"`
	UserID         int       `gorm:"not null;uniqueIndex"`
	AvatarURL      string    `gorm:"type:text"`
	Bio            string    `gorm:"type:text"`
	Skills         string    `gorm:"type:text"`
	GitHubUsername string    `gorm:"size:100"`
	PortfolioURL   string    `gorm:"size:200"`
	Location       string    `gorm:"size:100"`
	SocialLinks    string    `gorm:"type:text"`
	CreatedAt      time.Time `gorm:"autoCreateTime"`
	UpdatedAt      time.Time `gorm:"autoUpdateTime"`

	User User `gorm:"foreignKey:UserID"`
}