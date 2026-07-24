package auth

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"

	"devSync/config"
	"devSync/internal/dto/mapper"
	authRequest "devSync/internal/dto/request/auth"
	authResponse "devSync/internal/dto/response/auth"
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
	ResetPassword(ctx context.Context, req *authRequest.ResetPasswordRequest) error
	RefreshToken(ctx context.Context, req *authRequest.RefreshTokenRequest) (*authResponse.TokenResponse, error)
	Logout(ctx context.Context, req *authRequest.LogoutRequest) error
	GetCurrentUser(ctx context.Context, userID uuid.UUID) (*authResponse.UserResponse, error)
}

type service struct {
	repo auth.Repository
	cfg  *config.AppConfig
}

func NewService(repo auth.Repository, cfg *config.AppConfig) Service {
	return &service{repo: repo, cfg: cfg}
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
	now := time.Now()

	user := &model.User{
		Name:        req.Name,
		Email:           req.Email,
		PasswordHash:    hashed,
		IsVerified:      false,
		VerificationOTP: code,
		OTPExpiresAt:    &expiry,
		LastOTPResendAt: &now,
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

	if user.IsVerified {
		return errors.New("email already verified")
	}

	if user.OTPExpiresAt == nil || time.Now().After(*user.OTPExpiresAt) {
		return errors.New("invalid or expired OTP")
	}

	if !otp.CompareOTP(req.OTP, user.VerificationOTP) {
		return errors.New("invalid or expired OTP")
	}

	return s.repo.VerifyEmail(ctx, user.ID)
}

func (s *service) ResendOTP(ctx context.Context, req *authRequest.ResendOTPRequest) error {
	user, err := s.repo.GetUserByEmail(ctx, req.Email)
	if err != nil {
		return nil
	}

	if user.IsVerified {
		return nil
	}

	if user.LastOTPResendAt != nil && time.Since(*user.LastOTPResendAt) < resendCooldown {
		return errors.New("please wait before requesting another OTP")
	}

	code, err := otp.Generate()
	if err != nil {
		return err
	}
	expiry := time.Now().Add(otpValidity)

	if err := s.repo.UpdateOTP(ctx, user.ID, code, expiry); err != nil {
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

	if user.LastOTPResendAt != nil && time.Since(*user.LastOTPResendAt) < resendCooldown {
		return errors.New("please wait before requesting another reset code")
	}

	code, err := otp.Generate()
	if err != nil {
		return err
	}
	expiry := time.Now().Add(otpValidity)

	if err := s.repo.SaveResetOTP(ctx, user.ID, code, expiry); err != nil {
		return err
	}

	go smtp.SendOTPEmail(s.cfg, user.Email, code, "password reset")
	return nil
}

func (s *service) ResetPassword(ctx context.Context, req *authRequest.ResetPasswordRequest) error {
	user, err := s.repo.GetUserByEmail(ctx, req.Email)
	if err != nil {
		return errors.New("invalid or expired OTP")
	}

	if user.ResetOTP == nil || user.ResetOTPExpiresAt == nil || time.Now().After(*user.ResetOTPExpiresAt) {
		return errors.New("invalid or expired OTP")
	}

	if !otp.CompareOTP(req.OTP, *user.ResetOTP) {
		return errors.New("invalid or expired OTP")
	}

	hashed, err := bcrypt.Hash(req.NewPassword)
	if err != nil {
		return err
	}

	if err := s.repo.UpdatePassword(ctx, user.ID, hashed); err != nil {
		return err
	}

	if err := s.repo.ClearResetOTP(ctx, user.ID); err != nil {
		return err
	}

	return s.repo.RevokeAllUserTokens(ctx, user.ID)
}

func (s *service) RefreshToken(ctx context.Context, req *authRequest.RefreshTokenRequest) (*authResponse.TokenResponse, error) {
	claims, err := jwt.ParseToken(req.RefreshToken, s.cfg.JWTRefreshSecret)
	if err != nil || claims.TokenType != "refresh" {
		return nil, errors.New("invalid refresh token")
	}

	hash := jwt.HashToken(req.RefreshToken)
	storedToken, err := s.repo.GetRefreshTokenByHash(ctx, hash)
	if err != nil {
		return nil, errors.New("invalid refresh token")
	}

	if storedToken.IsRevoked {
		_ = s.repo.RevokeAllUserTokens(ctx, storedToken.UserID)
		return nil, errors.New("invalid refresh token")
	}

	if time.Now().After(storedToken.ExpiresAt) {
		_ = s.repo.RevokeRefreshToken(ctx, storedToken.ID)
		return nil, errors.New("invalid refresh token")
	}

	if claims.ID != storedToken.ID.String() || claims.UserID != storedToken.UserID {
		return nil, errors.New("invalid refresh token")
	}

	// Revoke old refresh token (Rotation)
	if err := s.repo.RevokeRefreshToken(ctx, storedToken.ID); err != nil {
		return nil, err
	}

	// Issue NEW tokens
	newAccessToken, newRefreshToken, err := s.issueTokens(ctx, storedToken.UserID)
	if err != nil {
		return nil, err
	}

	resp := mapper.ToTokenResponse(newAccessToken, newRefreshToken, int64(s.cfg.JWTAccessExpiry.Seconds()))
	return &resp, nil
}

func (s *service) Logout(ctx context.Context, req *authRequest.LogoutRequest) error {
	claims, err := jwt.ParseToken(req.RefreshToken, s.cfg.JWTRefreshSecret)
	if err != nil || claims.TokenType != "refresh" {
		return errors.New("invalid refresh token")
	}

	hash := jwt.HashToken(req.RefreshToken)
	storedToken, err := s.repo.GetRefreshTokenByHash(ctx, hash)
	if err != nil {
		return errors.New("invalid refresh token")
	}

	if storedToken.IsRevoked || storedToken.UserID != claims.UserID || claims.ID != storedToken.ID.String() {
		return errors.New("invalid refresh token")
	}

	return s.repo.RevokeRefreshToken(ctx, storedToken.ID)
}

func (s *service) GetCurrentUser(ctx context.Context, userID uuid.UUID) (*authResponse.UserResponse, error) {
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