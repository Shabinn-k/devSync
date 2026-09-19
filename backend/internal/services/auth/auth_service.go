package auth

import (
	"context"
	"errors"
	"time"

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
	otpValidity      = 10 * time.Minute
	resendCooldown   = 60 * time.Second
	maxOTPAttempts   = 5
	resetVerifiedTTL = 10 * time.Minute
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
	GetCurrentUser(ctx context.Context, userID int) (*authResponse.UserResponse, error)
}

type service struct {
	repo  auth.Repository
	cfg   *config.AppConfig
	cache cache.Cache
}

func NewService(repo auth.Repository, cfg *config.AppConfig, cache cache.Cache) Service {
	return &service{repo: repo, cfg: cfg, cache: cache}
}

// ---- Register ----
func (s *service) Register(ctx context.Context, req *authRequest.RegisterRequest) (*authResponse.UserResponse, error) {
	exists, _ := s.repo.EmailExists(ctx, req.Email)
	if exists {
		return nil, errors.New("email already registered")
	}

	hashed, err := bcrypt.Hash(req.Password)
	if err != nil {
		return nil, err
	}

	// Map string role → role_id (dev-permissive; gate on cfg.Env in production)
	roleID := model.RoleIDDeveloper
	switch req.Role {
	case model.RoleNameTeamLead:
		roleID = model.RoleIDTeamLead
	case model.RoleNameAdmin:
		roleID = model.RoleIDAdmin
	}

	user := &model.User{
		Name:         req.Name,
		Email:        req.Email,
		PasswordHash: hashed,
		RoleID:       roleID,
		IsVerified:   false,
		IsActive:     true,
	}

	if err := s.repo.CreateUser(ctx, user); err != nil {
		return nil, err
	}

	code, err := otp.Generate()
	if err != nil {
		return nil, err
	}
	if err := s.cache.SetOTP(ctx, cache.PurposeVerify, user.Email, code, otpValidity); err != nil {
		return nil, err
	}
	_ = s.cache.DeleteOTPAttempts(ctx, cache.PurposeVerify, user.Email)

	go smtp.SendOTPEmail(s.cfg, user.Email, code, "email verification")

	resp := mapper.ToUserResponse(user)
	return &resp, nil
}

// ---- Login ----
func (s *service) Login(ctx context.Context, req *authRequest.LoginRequest) (*authResponse.AuthResponse, error) {
	user, err := s.repo.GetUserByEmail(ctx, req.Email)
	if err != nil || user == nil {
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

// ---- VerifyEmail ----
func (s *service) VerifyEmail(ctx context.Context, req *authRequest.VerifyEmailRequest) error {
	user, err := s.repo.GetUserByEmail(ctx, req.Email)
	if err != nil || user == nil {
		return errors.New("invalid or expired OTP")
	}
	if user.IsVerified {
		return errors.New("email already verified")
	}

	n, err := s.cache.IncrOTPAttempts(ctx, cache.PurposeVerify, req.Email, otpValidity)
	if err != nil {
		return errors.New("could not verify otp")
	}
	if n > maxOTPAttempts {
		_ = s.cache.DeleteOTP(ctx, cache.PurposeVerify, req.Email)
		return errors.New("too many attempts, please request a new otp")
	}

	stored, err := s.cache.GetOTP(ctx, cache.PurposeVerify, req.Email)
	if err != nil || stored != req.OTP {
		return errors.New("invalid or expired OTP")
	}

	if err := s.repo.VerifyEmail(ctx, user.ID); err != nil {
		return err
	}

	_ = s.cache.DeleteOTP(ctx, cache.PurposeVerify, req.Email)
	_ = s.cache.DeleteOTPAttempts(ctx, cache.PurposeVerify, req.Email)
	return nil
}

// ---- ResendOTP ----
func (s *service) ResendOTP(ctx context.Context, req *authRequest.ResendOTPRequest) error {
	user, err := s.repo.GetUserByEmail(ctx, req.Email)
	if err != nil || user == nil || user.IsVerified {
		return nil // silent — don't leak existence
	}

	cool, err := s.cache.IsOTPCooldown(ctx, cache.PurposeVerify, req.Email)
	if err != nil {
		return err
	}
	if cool {
		return errors.New("please wait before requesting another otp")
	}

	code, err := otp.Generate()
	if err != nil {
		return err
	}
	if err := s.cache.SetOTP(ctx, cache.PurposeVerify, user.Email, code, otpValidity); err != nil {
		return err
	}
	_ = s.cache.SetOTPCooldown(ctx, cache.PurposeVerify, user.Email, resendCooldown)
	_ = s.cache.DeleteOTPAttempts(ctx, cache.PurposeVerify, user.Email)

	go smtp.SendOTPEmail(s.cfg, user.Email, code, "email verification")
	return nil
}

// ---- ForgotPassword ----
func (s *service) ForgotPassword(ctx context.Context, req *authRequest.ForgotPasswordRequest) error {
	user, err := s.repo.GetUserByEmail(ctx, req.Email)
	if err != nil || user == nil {
		return nil
	}

	cool, _ := s.cache.IsOTPCooldown(ctx, cache.PurposeReset, req.Email)
	if cool {
		return errors.New("please wait before requesting another otp")
	}

	code, err := otp.Generate()
	if err != nil {
		return err
	}
	if err := s.cache.SetOTP(ctx, cache.PurposeReset, req.Email, code, otpValidity); err != nil {
		return err
	}
	_ = s.cache.SetOTPCooldown(ctx, cache.PurposeReset, req.Email, resendCooldown)
	_ = s.cache.DeleteOTPAttempts(ctx, cache.PurposeReset, req.Email)

	go smtp.SendOTPEmail(s.cfg, user.Email, code, "password reset")
	return nil
}

// ---- VerifyOTP ----
func (s *service) VerifyOTP(ctx context.Context, email, otp string) error {
	n, err := s.cache.IncrOTPAttempts(ctx, cache.PurposeReset, email, otpValidity)
	if err != nil {
		return errors.New("could not verify otp")
	}
	if n > maxOTPAttempts {
		_ = s.cache.DeleteOTP(ctx, cache.PurposeReset, email)
		return errors.New("too many attempts, please request a new otp")
	}

	stored, err := s.cache.GetOTP(ctx, cache.PurposeReset, email)
	if err != nil {
		return errors.New("OTP expired or not found")
	}
	if stored != otp {
		return errors.New("invalid OTP")
	}

	return s.cache.MarkOTPVerified(ctx, cache.PurposeReset, email, resetVerifiedTTL)
}

// ---- ResetPassword ----
func (s *service) ResetPassword(ctx context.Context, req *authRequest.ResetPasswordRequest) error {
	verified, err := s.cache.IsOTPVerified(ctx, cache.PurposeReset, req.Email)
	if err != nil || !verified {
		return errors.New("OTP not verified. Please verify OTP first")
	}

	user, err := s.repo.GetUserByEmail(ctx, req.Email)
	if err != nil || user == nil {
		return errors.New("user not found")
	}

	hashed, err := bcrypt.Hash(req.NewPassword)
	if err != nil {
		return err
	}
	if err := s.repo.UpdatePassword(ctx, user.ID, hashed); err != nil {
		return err
	}

	_ = s.cache.DeleteOTP(ctx, cache.PurposeReset, req.Email)
	_ = s.cache.DeleteOTPVerified(ctx, cache.PurposeReset, req.Email)
	_ = s.cache.DeleteOTPAttempts(ctx, cache.PurposeReset, req.Email)

	return s.repo.RevokeAllUserTokens(ctx, user.ID)
}

// ---- RefreshToken ----
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
	newRefreshToken, _, err := jwt.GenerateRefreshToken(user.ID, s.cfg.JWTRefreshSecret, s.cfg.JWTRefreshExpiry)
	if err != nil {
		return nil, err
	}

	newToken := &model.RefreshToken{
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

// ---- Logout ----
func (s *service) Logout(ctx context.Context, req *authRequest.LogoutRequest) error {
	hash := jwt.HashToken(req.RefreshToken)
	storedToken, err := s.repo.GetRefreshTokenByHash(ctx, hash)
	if err != nil || storedToken == nil {
		return errors.New("invalid refresh token")
	}
	return s.repo.RevokeRefreshToken(ctx, storedToken.ID)
}

// ---- GetCurrentUser ----
func (s *service) GetCurrentUser(ctx context.Context, userID int) (*authResponse.UserResponse, error) {
	user, err := s.repo.GetUserByID(ctx, userID)
	if err != nil || user == nil {
		return nil, errors.New("user not found")
	}
	resp := mapper.ToUserResponse(user)
	return &resp, nil
}

// ---- issueTokens ----
func (s *service) issueTokens(ctx context.Context, userID int) (string, string, error) {
	accessToken, err := jwt.GenerateAccessToken(userID, s.cfg.JWTAccessSecret, s.cfg.JWTAccessExpiry)
	if err != nil {
		return "", "", err
	}
	refreshToken, _, err := jwt.GenerateRefreshToken(userID, s.cfg.JWTRefreshSecret, s.cfg.JWTRefreshExpiry)
	if err != nil {
		return "", "", err
	}
	token := &model.RefreshToken{
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