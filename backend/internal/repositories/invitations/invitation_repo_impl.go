package invitation

import (
	"context"
	"errors"
	"time"

	"gorm.io/gorm"
	"devSync/internal/model"
)

func (r *repository) Create(ctx context.Context, invitation *model.OrganizationInvitation) error {
	return r.db.WithContext(ctx).Create(invitation).Error
}

func (r *repository) GetByToken(ctx context.Context, token string) (*model.OrganizationInvitation, error) {
	var invitation model.OrganizationInvitation
	err := r.db.WithContext(ctx).
		Where("token = ?", token).
		Preload("Organization").
		First(&invitation).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrInvitationNotFound
	}
	if err != nil {
		return nil, err
	}

	if invitation.ExpiresAt.Before(time.Now()) {
		return nil, ErrInvitationExpired
	}

	return &invitation, nil
}

func (r *repository) Update(ctx context.Context, invitation *model.OrganizationInvitation) error {
	invitation.UpdatedAt = time.Now()
	return r.db.WithContext(ctx).Save(invitation).Error
}

func (r *repository) Delete(ctx context.Context, id int) error {
	return r.db.WithContext(ctx).Delete(&model.OrganizationInvitation{}, id).Error
}

func (r *repository) DeleteExpired(ctx context.Context) error {
	return r.db.WithContext(ctx).
		Where("expires_at < ?", time.Now()).
		Delete(&model.OrganizationInvitation{}).Error
}