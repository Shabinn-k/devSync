package auth

import (
	"context"
	"time"

	"github.com/google/uuid"

	"devSync/internal/model"
)

type Repository interface {
	// User
	CreateUser(ctx context.Context, user *model.User) error
	GetUserByEmail(ctx context.Context, email string) (*model.User, error)
	GetUserByID(ctx context.Context, id uuid.UUID) (*model.User, error)
	GetUserByUsername(ctx context.Context, username string) (*model.User, error)
	EmailExists(ctx context.Context, email string) (bool, error)
	UsernameExists(ctx context.Context, username string) (bool, error)
	UpdateUser(ctx context.Context, user *model.User) error
	UpdatePassword(ctx context.Context, userID uuid.UUID, passwordHash string) error
	VerifyEmail(ctx context.Context, userID uuid.UUID) error
	UpdateLastLogin(ctx context.Context, userID uuid.UUID) error
	UpdateOTP(ctx context.Context, userID uuid.UUID, otp string, expiresAt time.Time) error

	// Refresh Token
	CreateRefreshToken(ctx context.Context, token *model.RefreshToken) error
	GetRefreshTokenByHash(ctx context.Context, hash string) (*model.RefreshToken, error)
	RevokeRefreshToken(ctx context.Context, id uuid.UUID) error
	RevokeAllUserTokens(ctx context.Context, userID uuid.UUID) error

	// Password Reset OTP
	SaveResetOTP(ctx context.Context, userID uuid.UUID, otp string, expiresAt time.Time) error
	ClearResetOTP(ctx context.Context, userID uuid.UUID) error
}