package auth

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"devSync/config"
	"devSync/internal/dto/mapper"
	"devSync/internal/dto/request"
	"devSync/internal/dto/response"
	"devSync/internal/models"
	"devSync/internal/repositories/auth"
	"devSync/pkg/bcrypt"
	"devSync/pkg/jwt"
	"devSync/pkg/mailer"
	"devSync/pkg/otp"
)

const otpValidity = 10 * time.Minute

type Service interface {
	Register(ctx context.Context, req *request.RegisterRequest) (*response.AuthResponse, error)
	Login(ctx context.Context, req *request.LoginRequest) (*response.AuthResponse, error)
	VerifyEmail(ctx context.Context, req *request.VerifyEmailRequest) error
	ResendOTP(ctx context.Context, req *request.ResendOTPRequest) error
	ForgotPassword(ctx context.Context, req *request.ForgotPasswordRequest) error
	ResetPassword(ctx context.Context, req *request.ResetPasswordRequest) error
	RefreshToken(ctx context.Context, req *request.RefreshTokenRequest) (*response.TokenResponse, error)
	Logout(ctx context.Context, req *request.LogoutRequest) error
	GetCurrentUser(ctx context.Context, userID uuid.UUID) (*response.UserResponse, error)
}

type service struct {
	repo auth.Repository
	cfg  *config.AppConfig
}

func NewService(repo auth.Repository, cfg *config.AppConfig) Service {
	return &service{repo: repo, cfg: cfg}
}

func (s *service) Register(ctx context.Context, req *request.RegisterRequest) (*response.AuthResponse, error) {
	exists, _ := s.repo.EmailExists(ctx, req.Email)
	if exists {
		return nil, errors.New("email already registered")
	}

	exists, _ = s.repo.UsernameExists(ctx, req.Username)
	if exists {
		return nil, errors.New("username already taken")
	}

	hashed, err := bcrypt.Hash(req.Password)
	if err != nil {
		return nil, err
	}

	code, _ := otp.Generate()
	expiry := time.Now().Add(otpValidity)

	user := &models.User{
		FullName:        req.FullName,
		Username:        req.Username,
		Email:           req.Email,
		PasswordHash:    hashed,
		IsVerified:      false,
		VerificationOTP: code,
		OTPExpiresAt:    &expiry,
		IsActive:        true,
	}

	if err := s.repo.CreateUser(ctx, user); err != nil {
		return nil, err
	}

	go mailer.SendOTPEmail(s.cfg, user.Email, code, "email verification")

	accessToken, refreshToken, err := s.issueTokens(ctx, user.ID)
	if err != nil {
		return nil, err
	}

	resp := mapper.ToAuthResponse(user, accessToken, refreshToken, int64(s.cfg.JWTAccessExpiry.Seconds()))
	return &resp, nil
}

func (s *service) Login(ctx context.Context, req *request.LoginRequest) (*response.AuthResponse, error) {
	user, err := s.repo.GetUserByEmail(ctx, req.Email)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	if err := bcrypt.Compare(user.PasswordHash, req.Password); err != nil {
		return nil, errors.New("invalid credentials")
	}

	if !user.IsVerified {
		return nil, errors.New("email not verified")
	}

	if !user.IsActive {
		return nil, errors.New("account deactivated")
	}

	s.repo.UpdateLastLogin(ctx, user.ID)

	accessToken, refreshToken, err := s.issueTokens(ctx, user.ID)
	if err != nil {
		return nil, err
	}

	resp := mapper.ToAuthResponse(user, accessToken, refreshToken, int64(s.cfg.JWTAccessExpiry.Seconds()))
	return &resp, nil
}

func (s *service) VerifyEmail(ctx context.Context, req *request.VerifyEmailRequest) error {
	user, err := s.repo.GetUserByEmail(ctx, req.Email)
	if err != nil {
		return errors.New("invalid OTP")
	}

	if user.VerificationOTP != req.OTP || user.OTPExpiresAt == nil || time.Now().After(*user.OTPExpiresAt) {
		return errors.New("invalid or expired OTP")
	}

	return s.repo.VerifyEmail(ctx, user.ID)
}

func (s *service) ResendOTP(ctx context.Context, req *request.ResendOTPRequest) error {
	user, err := s.repo.GetUserByEmail(ctx, req.Email)
	if err != nil {
		return nil
	}

	code, _ := otp.Generate()
	expiry := time.Now().Add(otpValidity)

	user.VerificationOTP = code
	user.OTPExpiresAt = &expiry
	if err := s.repo.UpdateUser(ctx, user); err != nil {
		return err
	}

	go mailer.SendOTPEmail(s.cfg, user.Email, code, "email verification")
	return nil
}

func (s *service) ForgotPassword(ctx context.Context, req *request.ForgotPasswordRequest) error {
	user, err := s.repo.GetUserByEmail(ctx, req.Email)
	if err != nil {
		return nil
	}

	code, _ := otp.Generate()
	expiry := time.Now().Add(otpValidity)

	user.VerificationOTP = code
	user.OTPExpiresAt = &expiry
	if err := s.repo.UpdateUser(ctx, user); err != nil {
		return err
	}

	go mailer.SendOTPEmail(s.cfg, user.Email, code, "password reset")
	return nil
}

func (s *service) ResetPassword(ctx context.Context, req *request.ResetPasswordRequest) error {
	user, err := s.repo.GetUserByEmail(ctx, req.Email)
	if err != nil {
		return errors.New("invalid OTP")
	}

	if user.VerificationOTP != req.OTP || user.OTPExpiresAt == nil || time.Now().After(*user.OTPExpiresAt) {
		return errors.New("invalid or expired OTP")
	}

	hashed, err := bcrypt.Hash(req.NewPassword)
	if err != nil {
		return err
	}

	user.PasswordHash = hashed
	user.VerificationOTP = ""
	user.OTPExpiresAt = nil
	if err := s.repo.UpdateUser(ctx, user); err != nil {
		return err
	}

	return s.repo.RevokeAllUserTokens(ctx, user.ID)
}

func (s *service) RefreshToken(ctx context.Context, req *request.RefreshTokenRequest) (*response.TokenResponse, error) {
	claims, err := jwt.ParseToken(req.RefreshToken, s.cfg.JWTRefreshSecret)
	if err != nil {
		return nil, errors.New("invalid refresh token")
	}

	hash := jwt.HashToken(req.RefreshToken)
	storedToken, err := s.repo.GetRefreshTokenByHash(ctx, hash)
	if err != nil || storedToken.IsRevoked || time.Now().After(storedToken.ExpiresAt) {
		return nil, errors.New("invalid refresh token")
	}

	accessToken, err := jwt.GenerateAccessToken(claims.UserID, s.cfg.JWTAccessSecret, s.cfg.JWTAccessExpiry)
	if err != nil {
		return nil, err
	}

	resp := mapper.ToTokenResponse(accessToken, req.RefreshToken, int64(s.cfg.JWTAccessExpiry.Seconds()))
	return &resp, nil
}

func (s *service) Logout(ctx context.Context, req *request.LogoutRequest) error {
	hash := jwt.HashToken(req.RefreshToken)
	token, err := s.repo.GetRefreshTokenByHash(ctx, hash)
	if err != nil {
		return nil
	}
	return s.repo.RevokeRefreshToken(ctx, token.ID)
}

func (s *service) GetCurrentUser(ctx context.Context, userID uuid.UUID) (*response.UserResponse, error) {
	user, err := s.repo.GetUserByID(ctx, userID)
	if err != nil {
		return nil, errors.New("user not found")
	}
	resp := mapper.ToUserResponse(user)
	return &resp, nil
}

func (s *service) issueTokens(ctx context.Context, userID uuid.UUID) (string, string, error) {
	accessToken, err := jwt.GenerateAccessToken(userID, s.cfg.JWTAccessSecret, s.cfg.JWTAccessExpiry)
	if err != nil {
		return "", "", err
	}

	refreshToken, jti, err := jwt.GenerateRefreshToken(userID, s.cfg.JWTRefreshSecret, s.cfg.JWTRefreshExpiry)
	if err != nil {
		return "", "", err
	}

	token := &models.RefreshToken{
		ID:        jti,
		UserID:    userID,
		TokenHash: jwt.HashToken(refreshToken),
		ExpiresAt: time.Now().Add(s.cfg.JWTRefreshExpiry),
		IsRevoked: false,
	}
	if err := s.repo.CreateRefreshToken(ctx, token); err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}