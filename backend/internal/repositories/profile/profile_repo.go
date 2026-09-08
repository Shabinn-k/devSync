package profile

import (
	"context"
	"errors"

	"gorm.io/gorm"

	"devSync/internal/model"
)

var (
	ErrNotFound        = errors.New("user not found")
	ErrProfileNotFound = errors.New("profile not found")
)

type Repository interface {
	GetUserByID(ctx context.Context, id int) (*model.User, error)
	UpdateUser(ctx context.Context, user *model.User) error
	UpdatePassword(ctx context.Context, userID int, passwordHash string) error

	GetProfileByUserID(ctx context.Context, userID int) (*model.UserProfile, error)
	CreateProfile(ctx context.Context, profile *model.UserProfile) error
	UpdateProfile(ctx context.Context, profile *model.UserProfile) error
	UpdateAvatar(ctx context.Context, userID int, avatarURL string) error

	GetGitHubUsername(ctx context.Context, userID int) (string, error)
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

