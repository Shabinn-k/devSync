package auth

import (
	"time"
	"github.com/google/uuid"
)

type UserResponse struct {
	ID         uuid.UUID `json:"id"`
	Name   string    `json:"full_name"`
	Email      string    `json:"email"`
	IsVerified bool      `json:"is_verified"`
	IsActive   bool      `json:"is_active"`
	CreatedAt  time.Time `json:"created_at"`
}

type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int64  `json:"expires_in"`
}

type AuthResponse struct {
	User  UserResponse  `json:"user"`
	Token TokenResponse `json:"token"`
}

type MessageResponse struct {
	Message string `json:"message"`
}