package response

import (
	"time"
	"github.com/google/uuid"
)

type ProfileResponse struct {
	ID             uuid.UUID          `json:"id"`
	Name           string             `json:"name"`
	Email          string             `json:"email"`
	AvatarURL      string             `json:"avatar_url"`
	Bio            string             `json:"bio"`
	Skills         []string           `json:"skills"`
	GitHubUsername string             `json:"github_username"`
	PortfolioURL   string             `json:"portfolio_url"`
	Location       string             `json:"location"`
	SocialLinks    map[string]string  `json:"social_links"`
	IsVerified     bool               `json:"is_verified"`
	CreatedAt      time.Time          `json:"created_at"`
	UpdatedAt      time.Time          `json:"updated_at"`
}

// ✅ Add GitHub contributions response
type GitHubContribution struct {
	Date  string `json:"date"`
	Count int    `json:"count"`
	Level int    `json:"level"`
}

type GitHubContributionsResponse struct {
	Username      string               `json:"username"`
	Total         int                  `json:"total"`
	Contributions []GitHubContribution `json:"contributions"`
	AveragePerDay int                  `json:"average_per_day"`
}