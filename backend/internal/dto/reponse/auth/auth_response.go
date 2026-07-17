package response

import (
	"time"

	"github.com/google/uuid"
)

// UserResponse is the public-safe representation of a user.
// It deliberately excludes PasswordHash, OTP, OTPExpiresAt, and any
// other internal/sensitive fields present on model.User.
type UserResponse struct {
	ID              uuid.UUID `json:"id"`
	Name            string    `json:"name"`
	Email           string    `json:"email"`
	Role            string    `json:"role"`
	IsEmailVerified bool      `json:"is_email_verified"`
	AvatarURL       string    `json:"avatar_url,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
}

// TokenResponse represents an access/refresh token pair issued to
// the client. Used standalone on refresh, and embedded in LoginResponse.
type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int64  `json:"expires_in"` // seconds until access token expiry
}

// RegisterResponse is returned after successful registration.
// No tokens are issued here — the user must verify their email
// (via VerifyEmailRequest) before a session is granted.
type RegisterResponse struct {
	User    UserResponse `json:"user"`
	Message string       `json:"message"`
}

// LoginResponse is returned after successful authentication.
type LoginResponse struct {
	User  UserResponse  `json:"user"`
	Token TokenResponse `json:"token"`
}

// MessageResponse is a generic acknowledgement payload used for
// endpoints that don't need to return a resource — e.g. ResendOTP,
// ForgotPassword, ResetPassword, Logout.
type MessageResponse struct {
	Message string `json:"message"`
}

// ErrorResponse is the standard error envelope returned by auth
// endpoints on failure (validation errors, invalid credentials,
// expired OTP, expired/revoked refresh token, etc.).
type ErrorResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Errors  interface{} `json:"errors,omitempty"` // field-level validation errors, if any
}