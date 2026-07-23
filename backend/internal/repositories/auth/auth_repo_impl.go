package auth

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"devSync/internal/model"
)

var ErrNotFound = errors.New("record not found")

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

// ============ USER ============

func (r *repository) CreateUser(ctx context.Context, user *model.User) error {
	return r.db.WithContext(ctx).Create(user).Error
}

func (r *repository) GetUserByEmail(ctx context.Context, email string) (*model.User, error) {
	var user model.User
	err := r.db.WithContext(ctx).Where("email = ?", email).First(&user).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &user, err
}

func (r *repository) GetUserByID(ctx context.Context, id uuid.UUID) (*model.User, error) {
	var user model.User
	err := r.db.WithContext(ctx).Where("id = ?", id).First(&user).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &user, err
}

func (r *repository) GetUserByUsername(ctx context.Context, username string) (*model.User, error) {
	var user model.User
	err := r.db.WithContext(ctx).Where("username = ?", username).First(&user).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &user, err
}

func (r *repository) EmailExists(ctx context.Context, email string) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&model.User{}).Where("email = ?", email).Count(&count).Error
	return count > 0, err
}

func (r *repository) UsernameExists(ctx context.Context, username string) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&model.User{}).Where("username = ?", username).Count(&count).Error
	return count > 0, err
}

func (r *repository) UpdateUser(ctx context.Context, user *model.User) error {
	user.UpdatedAt = time.Now()
	return r.db.WithContext(ctx).Save(user).Error
}

func (r *repository) UpdatePassword(ctx context.Context, userID uuid.UUID, passwordHash string) error {
	return r.db.WithContext(ctx).Model(&model.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"password_hash": passwordHash,
		"updated_at":    time.Now(),
	}).Error
}

func (r *repository) VerifyEmail(ctx context.Context, userID uuid.UUID) error {
	return r.db.WithContext(ctx).Model(&model.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"is_verified":      true,
		"verification_otp": "",
		"otp_expires_at":   nil,
		"updated_at":       time.Now(),
	}).Error
}

func (r *repository) UpdateOTP(ctx context.Context, userID uuid.UUID, otp string, expiresAt time.Time) error {
	now := time.Now()
	return r.db.WithContext(ctx).Model(&model.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"verification_otp":   otp,
		"otp_expires_at":     expiresAt,
		"last_otp_resend_at": now,
		"updated_at":         now,
	}).Error
}

func (r *repository) UpdateLastLogin(ctx context.Context, userID uuid.UUID) error {
	now := time.Now()
	return r.db.WithContext(ctx).Model(&model.User{}).Where("id = ?", userID).Update("last_login_at", now).Error
}

// ============ REFRESH TOKEN ============

func (r *repository) CreateRefreshToken(ctx context.Context, token *model.RefreshToken) error {
	return r.db.WithContext(ctx).Create(token).Error
}

func (r *repository) GetRefreshTokenByHash(ctx context.Context, hash string) (*model.RefreshToken, error) {
	var token model.RefreshToken
	err := r.db.WithContext(ctx).Where("token_hash = ?", hash).First(&token).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &token, err
}

func (r *repository) RevokeRefreshToken(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Model(&model.RefreshToken{}).Where("id = ?", id).Update("is_revoked", true).Error
}

func (r *repository) RevokeAllUserTokens(ctx context.Context, userID uuid.UUID) error {
	return r.db.WithContext(ctx).Model(&model.RefreshToken{}).Where("user_id = ?", userID).Update("is_revoked", true).Error
}

// ============ PASSWORD RESET ============

func (r *repository) SaveResetOTP(ctx context.Context, userID uuid.UUID, otp string, expiresAt time.Time) error {
	now := time.Now()
	return r.db.WithContext(ctx).Model(&model.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"reset_otp":          otp,
		"reset_otp_expires_at": expiresAt,
		"last_otp_resend_at":   now,
		"updated_at":           now,
	}).Error
}

func (r *repository) ClearResetOTP(ctx context.Context, userID uuid.UUID) error {
	return r.db.WithContext(ctx).Model(&model.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"reset_otp":          nil,
		"reset_otp_expires_at": nil,
		"updated_at":         time.Now(),
	}).Error
}