package profile

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strconv"
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
	if req.Skills != "" {
		var parsedSkills []string
		if err := json.Unmarshal([]byte(req.Skills), &parsedSkills); err == nil {
			bytes, _ := json.Marshal(parsedSkills)
			userProfile.Skills = string(bytes)
		} else {
			parts := strings.Split(req.Skills, ",")
			var clean []string
			for _, p := range parts {
				p = strings.TrimSpace(p)
				if p != "" {
					clean = append(clean, p)
				}
			}
			bytes, _ := json.Marshal(clean)
			userProfile.Skills = string(bytes)
		}
	}
	if req.SocialLinks != "" {
		userProfile.SocialLinks = req.SocialLinks
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
			_ = json.Unmarshal([]byte(profile.SocialLinks), &socialLinks)
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
	if err != nil {
		return nil, errors.New("github username not found")
	}

	if username == "" {
		return nil, errors.New("no github username connected")
	}

	username = cleanGitHubUsername(username)

	contributions, total, err := s.fetchContributions(ctx, username)
	if err != nil {
		return nil, err
	}

	return &response.GitHubContributionsResponse{
		Username:      username,
		Total:         total,
		Contributions: contributions,
		AveragePerDay: calculateAverage(contributions),
	}, nil
}

func (s *service) fetchContributions(ctx context.Context, username string) ([]response.GitHubContribution, int, error) {
	contributions, total, err := s.fetchFromContributionPage(ctx, username)
	if err == nil && len(contributions) > 0 {
		return contributions, total, nil
	}
	return s.fetchFromAPI(ctx, username)
}

func (s *service) fetchFromContributionPage(ctx context.Context, username string) ([]response.GitHubContribution, int, error) {
	url := fmt.Sprintf("https://github.com/users/%s/contributions", username)

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, 0, err
	}

	req.Header.Set("Accept", "text/html,application/xhtml+xml")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		if resp.StatusCode == http.StatusNotFound {
			return nil, 0, errors.New("GitHub user not found")
		}
		return nil, 0, fmt.Errorf("GitHub contribution page returned status %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, 0, err
	}

	htmlStr := string(body)

	toolTipRegex := regexp.MustCompile(`<tool-tip[^>]*for="([^"]*)"[^>]*>(.*?)</tool-tip>`)
	toolTipMatches := toolTipRegex.FindAllStringSubmatch(htmlStr, -1)
	toolTipCountMap := make(map[string]int)
	countRegex := regexp.MustCompile(`(\d+)\s+contribution`)

	for _, tm := range toolTipMatches {
		if len(tm) >= 3 {
			targetID := tm[1]
			text := tm[2]
			if cm := countRegex.FindStringSubmatch(text); len(cm) >= 2 {
				cnt, _ := strconv.Atoi(cm[1])
				toolTipCountMap[targetID] = cnt
			}
		}
	}

	dayTagRegex := regexp.MustCompile(`<(td|rect)[^>]*class="[^"]*ContributionCalendar-day[^"]*"[^>]*>`)
	dayTags := dayTagRegex.FindAllString(htmlStr, -1)

	if len(dayTags) == 0 {
		dayTagRegex = regexp.MustCompile(`<(td|rect)[^>]*data-date="([^"]*)"[^>]*>`)
		dayTags = dayTagRegex.FindAllString(htmlStr, -1)
	}

	if len(dayTags) == 0 {
		return nil, 0, fmt.Errorf("no contribution data found")
	}

	reDate := regexp.MustCompile(`data-date="([^"]+)"`)
	reLevel := regexp.MustCompile(`data-level="([^"]+)"`)
	reCount := regexp.MustCompile(`data-count="([^"]+)"`)
	reID := regexp.MustCompile(`id="([^"]+)"`)

	var contributions []response.GitHubContribution
	total := 0

	for _, tag := range dayTags {
		dateMatch := reDate.FindStringSubmatch(tag)
		if len(dateMatch) < 2 {
			continue
		}
		date := dateMatch[1]

		level := 0
		if levelMatch := reLevel.FindStringSubmatch(tag); len(levelMatch) >= 2 {
			level, _ = strconv.Atoi(levelMatch[1])
		}

		count := 0
		if countMatch := reCount.FindStringSubmatch(tag); len(countMatch) >= 2 {
			count, _ = strconv.Atoi(countMatch[1])
		} else if idMatch := reID.FindStringSubmatch(tag); len(idMatch) >= 2 {
			if c, ok := toolTipCountMap[idMatch[1]]; ok {
				count = c
			} else if level > 0 {
				count = level
			}
		} else if level > 0 {
			count = level
		}

		contributions = append(contributions, response.GitHubContribution{
			Date:  date,
			Count: count,
			Level: level,
		})
		total += count
	}

	if len(contributions) == 0 {
		return nil, 0, fmt.Errorf("no valid contribution records extracted")
	}

	if len(contributions) > 56 {
		contributions = contributions[len(contributions)-56:]
	}

	return contributions, total, nil
}

func (s *service) fetchFromAPI(ctx context.Context, username string) ([]response.GitHubContribution, int, error) {
	url := fmt.Sprintf("https://api.github.com/users/%s/events/public?per_page=100", username)

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, 0, err
	}

	req.Header.Set("Accept", "application/json")
	req.Header.Set("User-Agent", "DevSync/1.0")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, 0, fmt.Errorf("API status: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, 0, err
	}

	var events []map[string]interface{}
	if err := json.Unmarshal(body, &events); err != nil {
		return nil, 0, err
	}

	contributionsMap := make(map[string]int)
	today := time.Now()
	oneYearAgo := today.AddDate(-1, 0, 0)

	for _, event := range events {
		createdAt, ok := event["created_at"].(string)
		if !ok {
			continue
		}
		date, err := time.Parse(time.RFC3339, createdAt)
		if err != nil {
			continue
		}
		if date.After(oneYearAgo) && date.Before(today) {
			dateKey := date.Format("2006-01-02")
			contributionsMap[dateKey]++
		}
	}

	var contributions []response.GitHubContribution
	total := 0

	for i := 56; i >= 0; i-- {
		date := today.AddDate(0, 0, -i)
		dateKey := date.Format("2006-01-02")
		count := contributionsMap[dateKey]
		level := getContributionLevel(count)

		contributions = append(contributions, response.GitHubContribution{
			Date:  dateKey,
			Count: count,
			Level: level,
		})
		total += count
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

func getContributionLevel(count int) int {
	if count == 0 {
		return 0
	}
	if count <= 2 {
		return 1
	}
	if count <= 4 {
		return 2
	}
	if count <= 6 {
		return 3
	}
	return 4
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