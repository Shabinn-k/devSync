package model

import (
	"time"
	"github.com/google/uuid"
)

type UserProfile struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID         uuid.UUID  `gorm:"type:uuid;not null;uniqueIndex"`
	AvatarURL      string     `gorm:"type:text"`
	Bio            string     `gorm:"type:text"`
	Skills         string     `gorm:"type:text"`        
	GitHubUsername string     `gorm:"size:100"`
	PortfolioURL   string     `gorm:"size:200"`
	Location       string     `gorm:"size:100"`
	SocialLinks    string     `gorm:"type:text"`        

	CreatedAt      time.Time
	UpdatedAt      time.Time

	User User `gorm:"foreignKey:UserID"`
}