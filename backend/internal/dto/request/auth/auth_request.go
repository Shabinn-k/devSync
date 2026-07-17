package request

// RegisterRequest represents the payload for new user registration.
type RegisterRequest struct {
	Name            string `json:"name" binding:"required,min=2,max=100"`
	Email           string `json:"email" binding:"required,email,max=150"`
	Password        string `json:"password" binding:"required,min=8,max=72"`
	ConfirmPassword string `json:"confirm_password" binding:"required,eqfield=Password"`
}

// LoginRequest represents the payload for user login.
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// VerifyEmailRequest represents the payload for verifying a user's email via OTP.
type VerifyEmailRequest struct {
	Email string `json:"email" binding:"required,email"`
	OTP   string `json:"otp" binding:"required,len=6,numeric"`
}

// ResendOTPRequest represents the payload for requesting a new OTP
// (used for email verification resend flow).
type ResendOTPRequest struct {
	Email string `json:"email" binding:"required,email"`
}

// ForgotPasswordRequest represents the payload for initiating a
// password reset. Triggers an OTP/reset token sent to the user's email.
type ForgotPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}

// ResetPasswordRequest represents the payload for completing a
// password reset using the OTP issued via ForgotPasswordRequest.
type ResetPasswordRequest struct {
	Email           string `json:"email" binding:"required,email"`
	OTP             string `json:"otp" binding:"required,len=6,numeric"`
	NewPassword     string `json:"new_password" binding:"required,min=8,max=72"`
	ConfirmPassword string `json:"confirm_password" binding:"required,eqfield=NewPassword"`
}

// RefreshTokenRequest represents the payload for exchanging a valid
// refresh token for a new access token.
type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// LogoutRequest represents the payload for logging out a session.
// The refresh token is invalidated/revoked server-side on logout.
type LogoutRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}