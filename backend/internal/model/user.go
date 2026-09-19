package model

import "time"
 

type User struct {
	ID             int        `gorm:"primaryKey;autoIncrement" json:"id"`
	Name           string     `gorm:"size:100;not null" json:"name"`
	Email          string     `gorm:"size:100;uniqueIndex;not null" json:"email"`
	PasswordHash   string     `gorm:"type:text;not null" json:"-"`
	RoleID         int        `gorm:"not null;default:1;index" json:"role_id"`
	Role           Role       `gorm:"foreignKey:RoleID" json:"role,omitempty"`
	OrganizationID *int       `gorm:"index" json:"organization_id"`
	IsVerified     bool       `gorm:"default:false" json:"is_verified"`  
	LastLoginAt    *time.Time `json:"last_login_at"`
	IsActive       bool       `gorm:"default:true" json:"is_active"`
	CreatedAt      time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt      time.Time  `gorm:"autoUpdateTime" json:"updated_at"`

	RefreshTokens []RefreshToken  `gorm:"foreignKey:UserID" json:"-"`
	TeamMembers   []TeamMember    `gorm:"foreignKey:UserID" json:"-"`
	Projects      []ProjectMember `gorm:"foreignKey:UserID" json:"-"`
	Tasks         []Task          `gorm:"foreignKey:AssigneeID" json:"-"`
}

