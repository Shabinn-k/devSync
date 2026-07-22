package service

import (
	"time"

	"github.com/google/uuid"

	"devSync/config"
	"devSync/internal/dto/mapper"
	"devSync/internal/dto/request"
	"devSync/internal/dto/response"
	apperrors "devSync/internal/errors"
	"devSync/internal/models"
	repository "devSync/internal/repositories/auth"
	"devSync/pkg/bcrypt"
	"devSync/pkg/jwt"
	"devSync/pkg/mailer"
	"devSync/pkg/otp"
)

const otpValidity = 10 * time.Minute

type AuthService interface {
	Register(req *request.RegisterRequest) (response.RegisterResponse, error)
	Login(req *request.LoginRequest) (response.LoginResponse, error)
	VerifyEmail(req *request.VerifyEmailRequest) error
	ResendOTP(req *request.ResendOTPRequest) error
	ForgotPassword(req *request.ForgotPasswordRequest) error
	ResetPassword(req *request.ResetPasswordRequest) error
	RefreshAccessToken(req *request.RefreshTokenRequest) (response.TokenResponse, error)
	Logout(req *request.LogoutRequest) error
	GetCurrentUser(userID uuid.UUID) (response.UserResponse, error)
}

type authService struct {
	repo repository.AuthRepository
	cfg  *config.AppConfig
}

func NewAuthService(repo repository.AuthRepository, cfg *config.AppConfig) AuthService {
	return &authService{repo: repo, cfg: cfg}
}

func (s *authService) Register(req *request.RegisterRequest) (response.RegisterResponse, error) {
	if _, err := s.repo.FindUserByEmail(req.Email); err == nil {
		return response.RegisterResponse{}, apperrors.ErrEmailTaken
	}
	if _, err := s.repo.FindUserByUsername(req.Username); err == nil {
		return response.RegisterResponse{}, apperrors.ErrUsernameTaken
	}

	hashedPassword, err := bcrypt.Hash(req.Password)
	if err != nil {
		return response.RegisterResponse{}, err
	}

	code, err := otp.Generate()
	if err != nil {
		return response.RegisterResponse{}, err
	}
	expiry := time.Now().Add(otpValidity)

	user := &models.User{
		FullName:        req.FullName,
		Username:        req.Username,
		Email:           req.Email,
		PasswordHash:    hashedPassword,
		IsVerified:      false,
		VerificationOTP: code,
		OTPExpiresAt:    &expiry,
		IsActive:        true,
	}

	if err := s.repo.CreateUser(user); err != nil {
		return response.RegisterResponse{}, err
	}

	_ = mailer.SendOTPEmail(s.cfg, user.Email, code, "email verification")

	return mapper.ToRegisterResponse(user, "Registration successful. Please verify your email using the OTP sent."), nil
}

func (s *authService) Login(req *request.LoginRequest) (response.LoginResponse, error) {
	user, err := s.repo.FindUserByEmail(req.Email)
	if err != nil {
		return response.LoginResponse{}, apperrors.ErrInvalidCreds
	}

	if err := bcrypt.Compare(user.PasswordHash, req.Password); err != nil {
		return response.LoginResponse{}, apperrors.ErrInvalidCreds
	}

	if !user.IsVerified {
		return response.LoginResponse{}, apperrors.ErrNotVerified
	}

	accessToken, refreshToken, err := s.issueTokens(user.ID)
	if err != nil {
		return response.LoginResponse{}, err
	}

	return mapper.ToLoginResponse(user, accessToken, refreshToken, int64(s.cfg.JWTAccessExpiry.Seconds())), nil
}

func (s *authService) VerifyEmail(req *request.VerifyEmailRequest) error {
	user, err := s.repo.FindUserByEmail(req.Email)
	if err != nil {
		return apperrors.ErrInvalidOTP
	}

	if user.VerificationOTP != req.OTP || user.OTPExpiresAt == nil || time.Now().After(*user.OTPExpiresAt) {
		return apperrors.ErrInvalidOTP
	}

	user.IsVerified = true
	user.VerificationOTP = ""
	user.OTPExpiresAt = nil
	return s.repo.UpdateUser(user)
}

func (s *authService) ResendOTP(req *request.ResendOTPRequest) error {
	user, err := s.repo.FindUserByEmail(req.Email)
	if err != nil {
		return nil
	}

	code, err := otp.Generate()
	if err != nil {
		return err
	}
	expiry := time.Now().Add(otpValidity)

	user.VerificationOTP = code
	user.OTPExpiresAt = &expiry
	if err := s.repo.UpdateUser(user); err != nil {
		return err
	}

	_ = mailer.SendOTPEmail(s.cfg, user.Email, code, "email verification")
	return nil
}

func (s *authService) ForgotPassword(req *request.ForgotPasswordRequest) error {
	user, err := s.repo.FindUserByEmail(req.Email)
	if err != nil {
		return nil
	}

	code, err := otp.Generate()
	if err != nil {
		return err
	}
	expiry := time.Now().Add(otpValidity)

	user.VerificationOTP = code
	user.OTPExpiresAt = &expiry
	if err := s.repo.UpdateUser(user); err != nil {
		return err
	}

	_ = mailer.SendOTPEmail(s.cfg, user.Email, code, "password reset")
	return nil
}

func (s *authService) ResetPassword(req *request.ResetPasswordRequest) error {
	user, err := s.repo.FindUserByEmail(req.Email)
	if err != nil {
		return apperrors.ErrInvalidOTP
	}

	if user.VerificationOTP != req.OTP || user.OTPExpiresAt == nil || time.Now().After(*user.OTPExpiresAt) {
		return apperrors.ErrInvalidOTP
	}

	hashedPassword, err := bcrypt.Hash(req.NewPassword)
	if err != nil {
		return err
	}

	user.PasswordHash = hashedPassword
	user.VerificationOTP = ""
	user.OTPExpiresAt = nil
	if err := s.repo.UpdateUser(user); err != nil {
		return err
	}

	return s.repo.RevokeAllRefreshTokensByUserID(user.ID)
}

func (s *authService) RefreshAccessToken(req *request.RefreshTokenRequest) (response.TokenResponse, error) {
	claims, err := jwt.ParseToken(req.RefreshToken, s.cfg.JWTRefreshSecret)
	if err != nil {
		return response.TokenResponse{}, apperrors.ErrInvalidToken
	}

	hash := jwt.HashToken(req.RefreshToken)
	storedToken, err := s.repo.FindRefreshTokenByHash(hash)
	if err != nil || storedToken.IsRevoked || time.Now().After(storedToken.ExpiresAt) {
		return response.TokenResponse{}, apperrors.ErrInvalidToken
	}

	accessToken, err := jwt.GenerateAccessToken(claims.UserID, s.cfg.JWTAccessSecret, s.cfg.JWTAccessExpiry)
	if err != nil {
		return response.TokenResponse{}, err
	}

	return mapper.ToTokenResponse(accessToken, req.RefreshToken, int64(s.cfg.JWTAccessExpiry.Seconds())), nil
}

func (s *authService) Logout(req *request.LogoutRequest) error {
	hash := jwt.HashToken(req.RefreshToken)
	storedToken, err := s.repo.FindRefreshTokenByHash(hash)
	if err != nil {
		return nil
	}
	return s.repo.RevokeRefreshToken(storedToken.ID)
}

func (s *authService) GetCurrentUser(userID uuid.UUID) (response.UserResponse, error) {
	user, err := s.repo.FindUserByID(userID)
	if err != nil {
		return response.UserResponse{}, err
	}
	return mapper.ToUserResponse(user), nil
}

func (s *authService) issueTokens(userID uuid.UUID) (accessToken, refreshToken string, err error) {
	accessToken, err = jwt.GenerateAccessToken(userID, s.cfg.JWTAccessSecret, s.cfg.JWTAccessExpiry)
	if err != nil {
		return "", "", err
	}

	refreshToken, jti, err := jwt.GenerateRefreshToken(userID, s.cfg.JWTRefreshSecret, s.cfg.JWTRefreshExpiry)
	if err != nil {
		return "", "", err
	}

	tokenRecord := &models.RefreshToken{
		ID:        jti,
		UserID:    userID,
		TokenHash: jwt.HashToken(refreshToken),
		ExpiresAt: time.Now().Add(s.cfg.JWTRefreshExpiry),
		IsRevoked: false,
	}
	if err := s.repo.CreateRefreshToken(tokenRecord); err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}