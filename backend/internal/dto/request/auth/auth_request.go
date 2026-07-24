package auth

type RegisterRequest struct {
	Name        string `json:"full_name" validate:"required,min=3,max=100"`
	Email           string `json:"email" validate:"required,email,max=100"`
	Password        string `json:"password" validate:"required,min=8,max=72,password_complexity"`
	ConfirmPassword string `json:"confirm_password" validate:"required,eqfield=Password"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type VerifyEmailRequest struct {
	Email string `json:"email" validate:"required,email"`
	OTP   string `json:"otp" validate:"required,len=6,numeric"`
}

type ResendOTPRequest struct {
	Email string `json:"email" validate:"required,email"`
}

type ForgotPasswordRequest struct {
	Email string `json:"email" validate:"required,email"`
}

type ResetPasswordRequest struct {
	Email           string `json:"email" validate:"required,email"`
	OTP             string `json:"otp" validate:"required,len=6,numeric"`
	NewPassword     string `json:"new_password" validate:"required,min=8,max=72,password_complexity"`
	ConfirmPassword string `json:"confirm_password" validate:"required,eqfield=NewPassword"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

type LogoutRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}