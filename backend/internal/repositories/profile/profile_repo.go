package profile

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"devSync/internal/model"
)

var (
	ErrNotFound        = errors.New("user not found")
	ErrProfileNotFound = errors.New("profile not found")
)

type Repository interface {
	GetUserByID(ctx context.Context, id uuid.UUID) (*model.User, error)
	UpdateUser(ctx context.Context, user *model.User) error
	UpdatePassword(ctx context.Context, userID uuid.UUID, passwordHash string) error

	GetProfileByUserID(ctx context.Context, userID uuid.UUID) (*model.UserProfile, error)
	CreateProfile(ctx context.Context, profile *model.UserProfile) error
	UpdateProfile(ctx context.Context, profile *model.UserProfile) error
	UpdateAvatar(ctx context.Context, userID uuid.UUID, avatarURL string) error
	
	GetGitHubUsername(ctx context.Context, userID uuid.UUID) (string, error)
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}