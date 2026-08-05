package profile

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"devSync/internal/model"
)

// ============ USER OPERATIONS ============

func (r *repository) GetUserByID(ctx context.Context, id uuid.UUID) (*model.User, error) {
	var user model.User
	err := r.db.WithContext(ctx).
		Preload("Profile").
		Where("id = ? AND is_active = ?", id, true).
		First(&user).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &user, err
}

func (r *repository) GetUserByUsername(ctx context.Context, username string) (*model.User, error) {
	var user model.User
	err := r.db.WithContext(ctx).
		Preload("Profile").
		Where("username = ? AND is_active = ?", username, true).
		First(&user).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &user, err
}

func (r *repository) GetUserByEmail(ctx context.Context, email string) (*model.User, error) {
	var user model.User
	err := r.db.WithContext(ctx).
		Where("email = ?", email).
		First(&user).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &user, err
}

func (r *repository) UpdateUser(ctx context.Context, user *model.User) error {
	user.UpdatedAt = time.Now()
	return r.db.WithContext(ctx).Save(user).Error
}

func (r *repository) UpdatePassword(ctx context.Context, userID uuid.UUID, passwordHash string) error {
	return r.db.WithContext(ctx).
		Model(&model.User{}).
		Where("id = ?", userID).
		Updates(map[string]interface{}{
			"password_hash": passwordHash,
			"updated_at":    time.Now(),
		}).Error
}

func (r *repository) UsernameExists(ctx context.Context, username string, excludeID uuid.UUID) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&model.User{}).
		Where("username = ? AND id != ?", username, excludeID).
		Count(&count).Error
	return count > 0, err
}

// ============ PROFILE OPERATIONS ============

func (r *repository) GetProfileByUserID(ctx context.Context, userID uuid.UUID) (*model.UserProfile, error) {
	var profile model.UserProfile
	err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		First(&profile).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrProfileNotFound
	}
	return &profile, err
}

func (r *repository) CreateProfile(ctx context.Context, profile *model.UserProfile) error {
	return r.db.WithContext(ctx).Create(profile).Error
}

func (r *repository) UpdateProfile(ctx context.Context, profile *model.UserProfile) error {
	profile.UpdatedAt = time.Now()
	return r.db.WithContext(ctx).Save(profile).Error
}

func (r *repository) UpdateAvatar(ctx context.Context, userID uuid.UUID, avatarURL string) error {
	// First try to update existing profile
	result := r.db.WithContext(ctx).
		Model(&model.UserProfile{}).
		Where("user_id = ?", userID).
		Updates(map[string]interface{}{
			"avatar_url": avatarURL,
			"updated_at": time.Now(),
		})

	if result.Error != nil {
		return result.Error
	}

	// If no profile exists, create one
	if result.RowsAffected == 0 {
		profile := &model.UserProfile{
			UserID:    userID,
			AvatarURL: avatarURL,
		}
		return r.db.WithContext(ctx).Create(profile).Error
	}

	return nil
}