package repository

import (
	"context"

	"github.com/google/uuid"

	"devSync/internal/modules/auth/model"
)

type AuthRepository interface {
	// Create a new user account
	CreateUser(ctx context.Context, user *model.User) error

	// Retrieve user by ID
	GetUserByID(ctx context.Context, id uuid.UUID) (*model.User, error)

	// Retrieve user by email
	GetUserByEmail(ctx context.Context, email string) (*model.User, error)

	// Check if an email already exists
	EmailExists(ctx context.Context, email string) (bool, error)

	// Update user's password
	UpdatePassword(ctx context.Context, userID uuid.UUID, passwordHash string) error

	// Update last successful login timestamp
	UpdateLastLogin(ctx context.Context, userID uuid.UUID) error

	// Verify user's email
	VerifyEmail(ctx context.Context, userID uuid.UUID) error

	// Update user profile information
	UpdateUser(ctx context.Context, user *model.User) error

	// Soft delete a user account
	DeleteUser(ctx context.Context, userID uuid.UUID) error
}