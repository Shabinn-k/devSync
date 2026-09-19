package model

import (
	"time"
)

type Team struct {
	ID             int        `gorm:"primaryKey;autoIncrement"`
	OrganizationID int        `gorm:"not null;index"`
	Name           string     `gorm:"size:100;not null"`
	LeadID         int        `gorm:"not null;index"`
	IsActive       bool       `gorm:"default:true"`
	CreatedAt      time.Time  `gorm:"autoCreateTime"`
	UpdatedAt      time.Time  `gorm:"autoUpdateTime"`
 
	Organization Organization    `gorm:"foreignKey:OrganizationID"`
	Lead         User            `gorm:"foreignKey:LeadID"`
	Members      []TeamMember    `gorm:"foreignKey:TeamID"`
}

func (Team) TableName() string {
	return "teams"
}

type TeamMember struct {
	ID        int       `gorm:"primaryKey;autoIncrement"`
	TeamID    int       `gorm:"not null;index"`
	UserID    int       `gorm:"not null;index"`
	Role      string    `gorm:"size:20;default:'member'"`
	JoinedAt  time.Time `gorm:"autoCreateTime"`
	IsActive  bool      `gorm:"default:true"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
 
	Team Team `gorm:"foreignKey:TeamID"`
	User User `gorm:"foreignKey:UserID"`
}

func (TeamMember) TableName() string {
	return "team_members"
}
 
const (
	TeamRoleAdmin  = "admin"
	TeamRoleMember = "member"
)