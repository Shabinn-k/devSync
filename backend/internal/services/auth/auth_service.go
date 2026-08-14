package auth

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"

	"devSync/config"
	"devSync/internal/cache"
	"devSync/internal/dto/mapper"
	authRequest "devSync/internal/dto/request"
	authResponse "devSync/internal/dto/response"
	"devSync/internal/model"
	"devSync/internal/repositories/auth"
	"devSync/utils/bcrypt"
	"devSync/utils/jwt"
	"devSync/utils/otp"
	"devSync/utils/smtp"
)

const (
	otpValidity    = 10 * time.Minute
	resendCooldown = 60 * time.Second
)

type Service interface {
	Register(ctx context.Context, req *authRequest.RegisterRequest) (*authResponse.UserResponse, error)
	Login(ctx context.Context, req *authRequest.LoginRequest) (*authResponse.AuthResponse, error)
	VerifyEmail(ctx context.Context, req *authRequest.VerifyEmailRequest) error
	ResendOTP(ctx context.Context, req *authRequest.ResendOTPRequest) error
	ForgotPassword(ctx context.Context, req *authRequest.ForgotPasswordRequest) error
	VerifyOTP(ctx context.Context, email, otp string) error
	ResetPassword(ctx context.Context, req *authRequest.ResetPasswordRequest) error
	RefreshToken(ctx context.Context, req *authRequest.RefreshTokenRequest) (*authResponse.TokenResponse, error)
	Logout(ctx context.Context, req *authRequest.LogoutRequest) error
	GetCurrentUser(ctx context.Context, userID uuid.UUID) (*authResponse.UserResponse, error)
}

type service struct {
	repo  auth.Repository
	cfg   *config.AppConfig
	cache cache.Cache
}

func NewService(repo auth.Repository, cfg *config.AppConfig, cache cache.Cache) Service {
	return &service{
		repo:  repo,
		cfg:   cfg,
		cache: cache,
	}
}

func (s *service) Register(ctx context.Context, req *authRequest.RegisterRequest) (*authResponse.UserResponse, error) {
	exists, _ := s.repo.EmailExists(ctx, req.Email)
	if exists {
		return nil, errors.New("email already registered")
	}

	hashed, err := bcrypt.Hash(req.Password)
	if err != nil {
		return nil, err
	}

	code, err := otp.Generate()
	if err != nil {
		return nil, err
	}
	expiry := time.Now().Add(otpValidity)

	user := &model.User{
		Name:            req.Name,
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

	go smtp.SendOTPEmail(s.cfg, user.Email, code, "email verification")

	resp := mapper.ToUserResponse(user)
	return &resp, nil
}

func (s *service) Login(ctx context.Context, req *authRequest.LoginRequest) (*authResponse.AuthResponse, error) {
	user, err := s.repo.GetUserByEmail(ctx, req.Email)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}
	if user == nil {
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

	_ = s.repo.UpdateLastLogin(ctx, user.ID)

	accessToken, refreshToken, err := s.issueTokens(ctx, user.ID)
	if err != nil {
		return nil, err
	}

	resp := mapper.ToAuthResponse(user, accessToken, refreshToken, int64(s.cfg.JWTAccessExpiry.Seconds()))
	return &resp, nil
}

func (s *service) VerifyEmail(ctx context.Context, req *authRequest.VerifyEmailRequest) error {
	user, err := s.repo.GetUserByEmail(ctx, req.Email)
	if err != nil {
		return errors.New("invalid or expired OTP")
	}
	if user == nil {
		return errors.New("invalid or expired OTP")
	}

	if user.IsVerified {
		return errors.New("email already verified")
	}

	if user.OTPExpiresAt == nil || time.Now().After(*user.OTPExpiresAt) {
		return errors.New("invalid or expired OTP")
	}

	if req.OTP != user.VerificationOTP {
		return errors.New("invalid or expired OTP")
	}

	return s.repo.VerifyEmail(ctx, user.ID)
}

func (s *service) ResendOTP(ctx context.Context, req *authRequest.ResendOTPRequest) error {
	user, err := s.repo.GetUserByEmail(ctx, req.Email)
	if err != nil {
		return nil
	}
	if user == nil {
		return nil
	}

	if user.IsVerified {
		return nil
	}

	code, err := otp.Generate()
	if err != nil {
		return err
	}
	expiry := time.Now().Add(otpValidity)

	user.VerificationOTP = code
	user.OTPExpiresAt = &expiry
	if err := s.repo.UpdateUser(ctx, user); err != nil {
		return err
	}

	go smtp.SendOTPEmail(s.cfg, user.Email, code, "email verification")
	return nil
}

func (s *service) ForgotPassword(ctx context.Context, req *authRequest.ForgotPasswordRequest) error {
	user, err := s.repo.GetUserByEmail(ctx, req.Email)
	if err != nil {
		return nil
	}
	if user == nil {
		return nil
	}

	code, err := otp.Generate()
	if err != nil {
		return err
	}
	if err := s.cache.SetOTP(ctx, req.Email, code, otpValidity); err != nil {
		return err
	}

	go smtp.SendOTPEmail(s.cfg, user.Email, code, "password reset")
	return nil
}

func (s *service) VerifyOTP(ctx context.Context, email, otp string) error {
	storedOTP, err := s.cache.GetOTP(ctx, email)
	if err != nil {
		return errors.New("OTP expired or not found")
	}

	if storedOTP != otp {
		return errors.New("invalid OTP")
	}

	if err := s.cache.MarkOTPVerified(ctx, email); err != nil {
		return err
	}

	return nil
}

func (s *service) ResetPassword(ctx context.Context, req *authRequest.ResetPasswordRequest) error {
	verified, err := s.cache.IsOTPVerified(ctx, req.Email)
	if err != nil || !verified {
		return errors.New("OTP not verified. Please verify OTP first")
	}

	user, err := s.repo.GetUserByEmail(ctx, req.Email)
	if err != nil {
		return errors.New("user not found")
	}
	if user == nil {
		return errors.New("user not found")
	}

	hashed, err := bcrypt.Hash(req.NewPassword)
	if err != nil {
		return err
	}

	if err := s.repo.UpdatePassword(ctx, user.ID, hashed); err != nil {
		return err
	}

	_ = s.cache.DeleteOTP(ctx, req.Email)
	_ = s.cache.DeleteOTPVerified(ctx, req.Email)

	return s.repo.RevokeAllUserTokens(ctx, user.ID)
}

func (s *service) RefreshToken(ctx context.Context, req *authRequest.RefreshTokenRequest) (*authResponse.TokenResponse, error) {
	claims, err := jwt.ParseToken(req.RefreshToken, s.cfg.JWTRefreshSecret)
	if err != nil {
		return nil, errors.New("invalid refresh token")
	}

	if claims.TokenType != "refresh" {
		return nil, errors.New("invalid token type")
	}

	oldHash := jwt.HashToken(req.RefreshToken)
	oldToken, err := s.repo.GetRefreshTokenByHash(ctx, oldHash)
	if err != nil || oldToken == nil || oldToken.IsRevoked || time.Now().After(oldToken.ExpiresAt) {
		return nil, errors.New("invalid or revoked refresh token")
	}

	user, err := s.repo.GetUserByID(ctx, claims.UserID)
	if err != nil || user == nil || !user.IsActive {
		return nil, errors.New("user account inactive or not found")
	}

	newAccessToken, err := jwt.GenerateAccessToken(user.ID, s.cfg.JWTAccessSecret, s.cfg.JWTAccessExpiry)
	if err != nil {
		return nil, err
	}

	newRefreshToken, jti, err := jwt.GenerateRefreshToken(user.ID, s.cfg.JWTRefreshSecret, s.cfg.JWTRefreshExpiry)
	if err != nil {
		return nil, err
	}

	newToken := &model.RefreshToken{
		ID:        jti,
		UserID:    user.ID,
		TokenHash: jwt.HashToken(newRefreshToken),
		ExpiresAt: time.Now().Add(s.cfg.JWTRefreshExpiry),
		IsRevoked: false,
	}
	if err := s.repo.CreateRefreshToken(ctx, newToken); err != nil {
		return nil, err
	}

	_ = s.repo.RevokeRefreshToken(ctx, oldToken.ID)

	resp := mapper.ToTokenResponse(newAccessToken, newRefreshToken, int64(s.cfg.JWTAccessExpiry.Seconds()))
	return &resp, nil
}

func (s *service) Logout(ctx context.Context, req *authRequest.LogoutRequest) error {
	hash := jwt.HashToken(req.RefreshToken)
	storedToken, err := s.repo.GetRefreshTokenByHash(ctx, hash)
	if err != nil {
		return errors.New("invalid refresh token")
	}
	if storedToken == nil {
		return errors.New("invalid refresh token")
	}

	return s.repo.RevokeRefreshToken(ctx, storedToken.ID)
}

func (s *service) GetCurrentUser(ctx context.Context, userID uuid.UUID) (*authResponse.UserResponse, error) {
	user, err := s.repo.GetUserByID(ctx, userID)
	if err != nil {
		return nil, errors.New("user not found")
	}
	if user == nil {
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

	token := &model.RefreshToken{
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
