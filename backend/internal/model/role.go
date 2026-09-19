package model

import "time"

type Role struct {
	ID        int       `gorm:"primaryKey;autoIncrement" json:"id"`
	Name      string    `gorm:"size:50;uniqueIndex;not null" json:"name"`
	Level     int       `gorm:"not null;uniqueIndex" json:"level"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

const (
	RoleIDTeamLead  = 1
	RoleIDDeveloper = 2
	RoleIDAdmin     = 3
)

const (
	RoleNameDeveloper = "developer"
	RoleNameTeamLead  = "team_lead"
	RoleNameAdmin     = "admin"
)