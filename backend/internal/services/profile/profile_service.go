package profile

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/google/uuid"

	"devSync/config"
	"devSync/internal/dto/request"
	"devSync/internal/dto/response"
	"devSync/internal/model"
	"devSync/internal/repositories/profile"
	"devSync/utils/bcrypt"
)

type Service interface {
	GetProfile(ctx context.Context, userID uuid.UUID) (*response.ProfileResponse, error)
	GetProfileByUsername(ctx context.Context, username string) (*response.ProfileResponse, error)
	UpdateProfile(ctx context.Context, userID uuid.UUID, req *request.UpdateProfileRequest) (*response.ProfileResponse, error)
	ChangePassword(ctx context.Context, userID uuid.UUID, req *request.ChangePasswordRequest) error
	UpdateAvatar(ctx context.Context, userID uuid.UUID, avatarURL string) error
}

type service struct {
	repo profile.Repository
	cfg  *config.AppConfig
}

func NewService(repo profile.Repository, cfg *config.AppConfig) Service {
	return &service{repo: repo, cfg: cfg}
}

func (s *service) GetProfile(ctx context.Context, userID uuid.UUID) (*response.ProfileResponse, error) {
	user, err := s.repo.GetUserByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	profile, _ := s.repo.GetProfileByUserID(ctx, userID)

	return s.mapToProfileResponse(user, profile), nil
}

func (s *service) GetProfileByUsername(ctx context.Context, username string) (*response.ProfileResponse, error) {
	user, err := s.repo.GetUserByUsername(ctx, username)
	if err != nil {
		return nil, err
	}

	profile, _ := s.repo.GetProfileByUserID(ctx, user.ID)

	return s.mapToProfileResponse(user, profile), nil
}

func (s *service) UpdateProfile(ctx context.Context, userID uuid.UUID, req *request.UpdateProfileRequest) (*response.ProfileResponse, error) {
	user, err := s.repo.GetUserByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	// Update user fields
	if req.Name != "" {
		user.Name = req.Name
	}

	if err := s.repo.UpdateUser(ctx, user); err != nil {
		return nil, err
	}

	// Get or create profile
	profile, err := s.repo.GetProfileByUserID(ctx, userID)
	if err != nil{
		return nil, err
	}

	if profile == nil {
		profile = &model.UserProfile{
			UserID: userID,
		}
	}

	// Update profile fields
	if req.Bio != "" {
		profile.Bio = req.Bio
	}
	if req.GitHubUsername != "" {
		profile.GitHubUsername = req.GitHubUsername
	}
	if req.PortfolioURL != "" {
		profile.PortfolioURL = req.PortfolioURL
	}
	if req.Location != "" {
		profile.Location = req.Location
	}
	if req.Skills != "" {
		profile.Skills = req.Skills
	}
	if req.SocialLinks != "" {
		profile.SocialLinks = req.SocialLinks
	}

	if profile.ID == uuid.Nil {
		if err := s.repo.CreateProfile(ctx, profile); err != nil {
			return nil, err
		}
	} else {
		if err := s.repo.UpdateProfile(ctx, profile); err != nil {
			return nil, err
		}
	}

	return s.mapToProfileResponse(user, profile), nil
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
			_ = json.Unmarshal([]byte(profile.Skills), &skills)
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
		Name:       user.Name, 
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