package model

import (
	"time"
)

type ChatChannel struct {
	ID             int          `gorm:"primaryKey;autoIncrement" json:"id"`
	OrganizationID *int         `gorm:"index" json:"organization_id,omitempty"`
	ProjectID      *int         `gorm:"index" json:"project_id,omitempty"`
	TeamID         *int         `gorm:"index" json:"team_id,omitempty"`  
	Name           string       `gorm:"size:100;not null" json:"name"`
	Type           string       `gorm:"size:20;not null;default:'org'" json:"type"` 
	CreatedBy      int          `gorm:"not null" json:"created_by"`
	CreatedAt      time.Time    `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt      time.Time    `gorm:"autoUpdateTime" json:"updated_at"`
 
	Organization *Organization `gorm:"foreignKey:OrganizationID" json:"organization,omitempty"`
	Project      *Project      `gorm:"foreignKey:ProjectID" json:"project,omitempty"`
	Creator      User          `gorm:"foreignKey:CreatedBy" json:"creator"`
	Members      []ChatMember  `gorm:"foreignKey:ChannelID" json:"members,omitempty"`
	Messages     []ChatMessage `gorm:"foreignKey:ChannelID" json:"messages,omitempty"`
}

type ChatMember struct {
	ID        int       `gorm:"primaryKey;autoIncrement" json:"id"`
	ChannelID int       `gorm:"not null;index" json:"channel_id"`
	UserID    int       `gorm:"not null;index" json:"user_id"`
	JoinedAt  time.Time `gorm:"autoCreateTime" json:"joined_at"`

	User User `gorm:"foreignKey:UserID" json:"user"`
}

type ChatMessage struct {
	ID            int       `gorm:"primaryKey;autoIncrement" json:"id"`
	ChannelID     int       `gorm:"not null;index" json:"channel_id"`
	SenderID      int       `gorm:"not null;index" json:"sender_id"`
	Message       string    `gorm:"type:text;not null" json:"message"`
	AttachmentURL string    `gorm:"type:text" json:"attachment_url,omitempty"`
	CreatedAt     time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt     time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	Sender User `gorm:"foreignKey:SenderID" json:"sender"`
}

const (
	ChatTypeOrg     = "org"
	ChatTypeProject = "project"
	ChatTypeTeam    = "team"  
	ChatTypeDirect  = "direct"
)
