package invitation

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"devSync/internal/model"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
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

func (r *repository) AcceptPending(ctx context.Context, token, email string, userID int) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var inv model.OrganizationInvitation
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("token = ?", token).First(&inv).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ErrInvitationNotFound
			}
			return err
		}
		if !inv.ExpiresAt.After(time.Now()) {
			return ErrInvitationExpired
		}
		if inv.Status != model.InvitationStatusPending {
			return errors.New("invitation is no longer pending")
		}
		if !strings.EqualFold(strings.TrimSpace(email), strings.TrimSpace(inv.Email)) {
			return errors.New("invitation email does not match user email")
		}
		// Serialize membership creation for this user and tenant, including
		// acceptance of separate pending invitations for the same organization.
		lockKey := fmt.Sprintf("devsync-org-member:%d:%d", inv.OrganizationID, userID)
		if err := tx.Exec("SELECT pg_advisory_xact_lock(hashtext(?))", lockKey).Error; err != nil {
			return err
		}
		var count int64
		if err := tx.Model(&model.OrganizationMember{}).Where("organization_id = ? AND user_id = ? AND is_active = true", inv.OrganizationID, userID).Count(&count).Error; err != nil {
			return err
		}
		if count > 0 {
			return errors.New("user is already a member of this organization")
		}
		result := tx.Model(&model.OrganizationInvitation{}).
			Where("id = ? AND status = ? AND expires_at > ?", inv.ID, model.InvitationStatusPending, time.Now()).
			Update("status", model.InvitationStatusAccepted)
		if result.Error != nil {
			return result.Error
		}
		if result.RowsAffected != 1 {
			return errors.New("invitation is no longer valid")
		}
		member := model.OrganizationMember{OrganizationID: inv.OrganizationID, UserID: userID, Role: inv.Role, IsActive: true}
		return tx.Create(&member).Error
	})
}

func (r *repository) SetPendingStatus(ctx context.Context, token, status string) error {
	result := r.db.WithContext(ctx).Model(&model.OrganizationInvitation{}).
		Where("token = ? AND status = ? AND expires_at > ?", token, model.InvitationStatusPending, time.Now()).
		Updates(map[string]any{"status": status, "updated_at": time.Now()})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		var inv model.OrganizationInvitation
		if err := r.db.WithContext(ctx).Select("expires_at").Where("token = ?", token).First(&inv).Error; err != nil {
			return ErrInvitationNotFound
		}
		if !inv.ExpiresAt.After(time.Now()) {
			return ErrInvitationExpired
		}
		return errors.New("invitation is no longer pending")
	}
	return nil
}
