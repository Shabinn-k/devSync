package model

import "time"

type OrganizationJoinRequest struct {
	ID             int        `gorm:"primaryKey;autoIncrement" json:"id"`
	OrganizationID int        `gorm:"not null;index" json:"organization_id"`
	UserID         int        `gorm:"not null;index" json:"user_id"`
	Message        string     `gorm:"type:text" json:"message"`
	Status         string     `gorm:"size:20;default:'pending';index" json:"status"`
	ReviewedBy     *int       `gorm:"index" json:"reviewed_by"`
	ReviewedAt     *time.Time `json:"reviewed_at"`
	CreatedAt      time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt      time.Time  `gorm:"autoUpdateTime" json:"updated_at"`

	Organization Organization `gorm:"foreignKey:OrganizationID" json:"organization,omitempty"`
	User         User         `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Reviewer     *User        `gorm:"foreignKey:ReviewedBy" json:"reviewer,omitempty"`
}

func (OrganizationJoinRequest) TableName() string {
	return "organization_join_requests"
}

const (
	JoinRequestPending  = "pending"
	JoinRequestApproved = "approved"
	JoinRequestRejected = "rejected"
)