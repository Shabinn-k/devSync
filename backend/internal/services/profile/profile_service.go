package profile

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"

	"devSync/config"
	"devSync/internal/dto/request"
	"devSync/internal/dto/response"
	"devSync/internal/model"
	profileRepo "devSync/internal/repositories/profile"
	"devSync/utils/bcrypt"
)

type Service interface {
	GetProfile(ctx context.Context, userID uuid.UUID) (*response.ProfileResponse, error)
	UpdateProfile(ctx context.Context, userID uuid.UUID, req *request.UpdateProfileRequest) (*response.ProfileResponse, error)
	ChangePassword(ctx context.Context, userID uuid.UUID, req *request.ChangePasswordRequest) error
	UpdateAvatar(ctx context.Context, userID uuid.UUID, avatarURL string) error
	GetGitHubContributions(ctx context.Context, userID uuid.UUID) (*response.GitHubContributionsResponse, error)
}

type service struct {
	repo   profileRepo.Repository
	cfg    *config.AppConfig
	client *http.Client
}

func NewService(repo profileRepo.Repository, cfg *config.AppConfig) Service {
	return &service{
		repo: repo,
		cfg:  cfg,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (s *service) GetProfile(ctx context.Context, userID uuid.UUID) (*response.ProfileResponse, error) {
	user, err := s.repo.GetUserByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	userProfile, _ := s.repo.GetProfileByUserID(ctx, userID)

	return s.mapToProfileResponse(user, userProfile), nil
}

func (s *service) UpdateProfile(ctx context.Context, userID uuid.UUID, req *request.UpdateProfileRequest) (*response.ProfileResponse, error) {
	user, err := s.repo.GetUserByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	if req.Name != "" {
		user.Name = req.Name
	}

	if err := s.repo.UpdateUser(ctx, user); err != nil {
		return nil, err
	}

	userProfile, err := s.repo.GetProfileByUserID(ctx, userID)
	if err != nil && err != profileRepo.ErrProfileNotFound {
		return nil, err
	}

	if userProfile == nil {
		userProfile = &model.UserProfile{
			UserID: userID,
		}
	}

	if req.Bio != "" {
		userProfile.Bio = req.Bio
	}
	if req.GitHubUsername != "" {
		userProfile.GitHubUsername = cleanGitHubUsername(req.GitHubUsername)
	}
	if req.PortfolioURL != "" {
		userProfile.PortfolioURL = req.PortfolioURL
	}
	if req.Location != "" {
		userProfile.Location = req.Location
	}
	if req.Skills != nil {
		var cleanSkills []string
		switch v := req.Skills.(type) {
		case string:
			if err := json.Unmarshal([]byte(v), &cleanSkills); err != nil {
				parts := strings.Split(v, ",")
				for _, p := range parts {
					p = strings.TrimSpace(p)
					if p != "" {
						cleanSkills = append(cleanSkills, p)
					}
				}
			}
		case []interface{}:
			for _, item := range v {
				if str, ok := item.(string); ok && strings.TrimSpace(str) != "" {
					cleanSkills = append(cleanSkills, strings.TrimSpace(str))
				}
			}
		case []string:
			cleanSkills = v
		}
		bytes, _ := json.Marshal(cleanSkills)
		userProfile.Skills = string(bytes)
	}
	if req.SocialLinks != nil {
		cleanSocial := make(map[string]string)
		switch v := req.SocialLinks.(type) {
		case string:
			var parsed map[string]string
			if err := json.Unmarshal([]byte(v), &parsed); err == nil {
				cleanSocial = parsed
			} else {
				var innerStr string
				if err := json.Unmarshal([]byte(v), &innerStr); err == nil {
					_ = json.Unmarshal([]byte(innerStr), &cleanSocial)
				}
			}
		case map[string]interface{}:
			for k, val := range v {
				if strVal, ok := val.(string); ok && strings.TrimSpace(strVal) != "" {
					cleanSocial[k] = strings.TrimSpace(strVal)
				}
			}
		case map[string]string:
			cleanSocial = v
		}
		bytes, _ := json.Marshal(cleanSocial)
		userProfile.SocialLinks = string(bytes)
	}

	if userProfile.ID == uuid.Nil {
		if err := s.repo.CreateProfile(ctx, userProfile); err != nil {
			return nil, err
		}
	} else {
		if err := s.repo.UpdateProfile(ctx, userProfile); err != nil {
			return nil, err
		}
	}

	return s.mapToProfileResponse(user, userProfile), nil
}

func (s *service) ChangePassword(ctx context.Context, userID uuid.UUID, req *request.ChangePasswordRequest) error {
	user, err := s.repo.GetUserByID(ctx, userID)
	if err != nil {
		return err
	}

	if err := bcrypt.Compare(user.PasswordHash, req.CurrentPassword); err != nil {
		return errors.New("current password is incorrect")
	}

	hashedPassword, err := bcrypt.Hash(req.NewPassword)
	if err != nil {
		return err
	}

	return s.repo.UpdatePassword(ctx, userID, hashedPassword)
}

func (s *service) UpdateAvatar(ctx context.Context, userID uuid.UUID, avatarURL string) error {
	return s.repo.UpdateAvatar(ctx, userID, avatarURL)
}

func (s *service) mapToProfileResponse(user *model.User, profile *model.UserProfile) *response.ProfileResponse {
	var skills []string
	var socialLinks map[string]string
	avatarURL := ""
	bio := ""
	githubUsername := ""
	portfolioURL := ""
	location := ""

	if profile != nil {
		avatarURL = profile.AvatarURL
		bio = profile.Bio
		githubUsername = profile.GitHubUsername
		portfolioURL = profile.PortfolioURL
		location = profile.Location

		if profile.Skills != "" {
			if err := json.Unmarshal([]byte(profile.Skills), &skills); err != nil {
				parts := strings.Split(profile.Skills, ",")
				for _, p := range parts {
					p = strings.TrimSpace(p)
					if p != "" {
						skills = append(skills, p)
					}
				}
			}
		}
		if profile.SocialLinks != "" {
			if err := json.Unmarshal([]byte(profile.SocialLinks), &socialLinks); err != nil {
				var innerStr string
				if err := json.Unmarshal([]byte(profile.SocialLinks), &innerStr); err == nil {
					_ = json.Unmarshal([]byte(innerStr), &socialLinks)
				}
			}
		}
	}

	if skills == nil {
		skills = []string{}
	}
	if socialLinks == nil {
		socialLinks = make(map[string]string)
	}

	return &response.ProfileResponse{
		ID:             user.ID,
		Name:           user.Name,
		Email:          user.Email,
		AvatarURL:      avatarURL,
		Bio:            bio,
		Skills:         skills,
		GitHubUsername: githubUsername,
		PortfolioURL:   portfolioURL,
		Location:       location,
		SocialLinks:    socialLinks,
		IsVerified:     user.IsVerified,
		CreatedAt:      user.CreatedAt,
		UpdatedAt:      user.UpdatedAt,
	}
}

func (s *service) GetGitHubContributions(ctx context.Context, userID uuid.UUID) (*response.GitHubContributionsResponse, error) {
	username, err := s.repo.GetGitHubUsername(ctx, userID)
	if err != nil || username == "" {
		profile, pErr := s.repo.GetProfileByUserID(ctx, userID)
		if pErr == nil && profile != nil {
			username = profile.GitHubUsername
		}
	}

	if username == "" {
		return nil, errors.New("no github username connected")
	}

	username = cleanGitHubUsername(username)

	contributions, total, err := s.fetchContributions(ctx, username)
	if err != nil {
		// Surface the real error instead of silently returning a fake
		// all-zero grid — a fabricated "success" response is worse than
		// an explicit error the frontend can show to the user.
		return nil, err
	}

	return &response.GitHubContributionsResponse{
		Username:      username,
		Total:         total,
		Contributions: contributions,
		AveragePerDay: calculateAverage(contributions),
	}, nil
}

// fetchContributions pulls real contribution-calendar data from a
// community-maintained JSON mirror of GitHub's contribution graph
// (https://github-contributions-api.jogruber.de). This returns the
// same data you see on your GitHub profile, unlike scraping GitHub's
// HTML (which changes without notice and silently breaks) or using
// the public events API (which only reflects the last ~100 public
// events, not your actual contribution calendar).
func (s *service) fetchContributions(ctx context.Context, username string) ([]response.GitHubContribution, int, error) {
	url := fmt.Sprintf("https://github-contributions-api.jogruber.de/v4/%s?y=last", username)

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, 0, err
	}
	req.Header.Set("Accept", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to reach GitHub contributions service: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return nil, 0, errors.New("GitHub user not found")
	}
	if resp.StatusCode != http.StatusOK {
		return nil, 0, fmt.Errorf("GitHub contributions service returned status %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, 0, err
	}

	var payload struct {
		Error         string `json:"error"`
		Contributions []struct {
			Date  string `json:"date"`
			Count int    `json:"count"`
			Level int    `json:"level"`
		} `json:"contributions"`
	}

	if err := json.Unmarshal(body, &payload); err != nil {
		return nil, 0, fmt.Errorf("failed to parse contributions response: %w", err)
	}

	if payload.Error != "" {
		return nil, 0, fmt.Errorf("GitHub contributions service error: %s", payload.Error)
	}
	if len(payload.Contributions) == 0 {
		return nil, 0, errors.New("no contribution data found for this username")
	}

	// Return the full year (matches GitHub's own contribution graph),
	// instead of truncating to a handful of weeks — a short slice left
	// the grid looking like a tiny cluster in the corner of the card.
	all := payload.Contributions

	contributions := make([]response.GitHubContribution, 0, len(all))
	total := 0
	for _, c := range all {
		contributions = append(contributions, response.GitHubContribution{
			Date:  c.Date,
			Count: c.Count,
			Level: c.Level,
		})
		total += c.Count
	}

	return contributions, total, nil
}

func cleanGitHubUsername(username string) string {
	username = strings.TrimSpace(username)
	re := regexp.MustCompile(`^(https?://)?(www\.)?github\.com/`)
	username = re.ReplaceAllString(username, "")
	if idx := strings.IndexAny(username, "?#"); idx != -1 {
		username = username[:idx]
	}
	parts := strings.Split(username, "/")
	if len(parts) > 0 {
		username = parts[0]
	}
	return strings.TrimSpace(username)
}

func calculateAverage(contributions []response.GitHubContribution) int {
	if len(contributions) == 0 {
		return 0
	}
	total := 0
	for _, c := range contributions {
		total += c.Count
	}
	return total / len(contributions)
}