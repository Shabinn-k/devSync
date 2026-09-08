package auth

import (
	"context"
	"time"

	"devSync/internal/model"
)

type Repository interface {
	CreateUser(ctx context.Context, user *model.User) error
	GetUserByEmail(ctx context.Context, email string) (*model.User, error)
	GetUserByID(ctx context.Context, id int) (*model.User, error)
	EmailExists(ctx context.Context, email string) (bool, error)
	UpdateUser(ctx context.Context, user *model.User) error
	UpdatePassword(ctx context.Context, userID int, passwordHash string) error
	VerifyEmail(ctx context.Context, userID int) error
	UpdateLastLogin(ctx context.Context, userID int) error
	UpdateOTP(ctx context.Context, userID int, otp string, expiresAt time.Time) error

	CreateRefreshToken(ctx context.Context, token *model.RefreshToken) error
	GetRefreshTokenByHash(ctx context.Context, hash string) (*model.RefreshToken, error)
	RevokeRefreshToken(ctx context.Context, id int) error
	RevokeAllUserTokens(ctx context.Context, userID int) error

	SaveResetOTP(ctx context.Context, userID int, otp string, expiresAt time.Time) error
	ClearResetOTP(ctx context.Context, userID int) error
}

