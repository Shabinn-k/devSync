package organization

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"devSync/internal/model"
)

// ============ REPOSITORY STRUCT ============

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

// ============ ORGANIZATION OPERATIONS ============

func (r *repository) Create(ctx context.Context, org *model.Organization) error {
	return r.db.WithContext(ctx).Create(org).Error
}

func (r *repository) GetByID(ctx context.Context, id uuid.UUID) (*model.Organization, error) {
	var org model.Organization
	err := r.db.WithContext(ctx).
		Where("id = ? AND is_active = ?", id, true).
		First(&org).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &org, err
}

func (r *repository) GetBySlug(ctx context.Context, slug string) (*model.Organization, error) {
	var org model.Organization
	err := r.db.WithContext(ctx).
		Where("slug = ? AND is_active = ?", slug, true).
		First(&org).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &org, err
}

func (r *repository) Update(ctx context.Context, org *model.Organization) error {
	org.UpdatedAt = time.Now()
	return r.db.WithContext(ctx).Save(org).Error
}

func (r *repository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&model.Organization{}).
		Where("id = ?", id).
		Update("is_active", false).Error
}

func (r *repository) List(ctx context.Context, userID uuid.UUID, limit, offset int) ([]model.Organization, int64, error) {
	var orgs []model.Organization
	var total int64

	if err := r.db.WithContext(ctx).
		Model(&model.Organization{}).
		Joins("JOIN organization_members ON organization_members.organization_id = organizations.id").
		Where("organization_members.user_id = ? AND organization_members.is_active = ? AND organizations.is_active = ?", userID, true, true).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := r.db.WithContext(ctx).
		Model(&model.Organization{}).
		Joins("JOIN organization_members ON organization_members.organization_id = organizations.id").
		Where("organization_members.user_id = ? AND organization_members.is_active = ? AND organizations.is_active = ?", userID, true, true).
		Limit(limit).
		Offset(offset).
		Order("organizations.created_at DESC").
		Find(&orgs).Error

	return orgs, total, err
}

// ✅ ============ ADD THIS MISSING METHOD ============
func (r *repository) GetMemberCount(ctx context.Context, orgID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&model.OrganizationMember{}).
		Where("organization_id = ? AND is_active = ?", orgID, true).
		Count(&count).Error
	return count, err
}

// ============ MEMBER OPERATIONS ============

func (r *repository) AddMember(ctx context.Context, member *model.OrganizationMember) error {
	// Check if member already exists
	var existing model.OrganizationMember
	err := r.db.WithContext(ctx).
		Where("organization_id = ? AND user_id = ? AND is_active = ?", member.OrganizationID, member.UserID, true).
		First(&existing).Error
	
	if err == nil {
		return ErrUserAlreadyMember
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	return r.db.WithContext(ctx).Create(member).Error
}

func (r *repository) GetMember(ctx context.Context, orgID, userID uuid.UUID) (*model.OrganizationMember, error) {
	var member model.OrganizationMember
	err := r.db.WithContext(ctx).
		Where("organization_id = ? AND user_id = ? AND is_active = ?", orgID, userID, true).
		First(&member).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrMemberNotFound
	}
	return &member, err
}

func (r *repository) GetMemberByID(ctx context.Context, orgID, memberID uuid.UUID) (*model.OrganizationMember, error) {
	var member model.OrganizationMember
	err := r.db.WithContext(ctx).
		Where("organization_id = ? AND id = ? AND is_active = ?", orgID, memberID, true).
		First(&member).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrMemberNotFound
	}
	return &member, err
}

func (r *repository) GetMembers(ctx context.Context, orgID uuid.UUID) ([]model.OrganizationMember, error) {
	var members []model.OrganizationMember
	err := r.db.WithContext(ctx).
		Where("organization_id = ? AND is_active = ?", orgID, true).
		Preload("User").
		Order("joined_at ASC").
		Find(&members).Error
	return members, err
}

func (r *repository) UpdateMemberRole(ctx context.Context, orgID, memberID uuid.UUID, role string) error {
	return r.db.WithContext(ctx).
		Model(&model.OrganizationMember{}).
		Where("organization_id = ? AND id = ?", orgID, memberID).
		Updates(map[string]interface{}{
			"role":       role,
			"updated_at": time.Now(),
		}).Error
}

func (r *repository) RemoveMember(ctx context.Context, orgID, memberID uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&model.OrganizationMember{}).
		Where("organization_id = ? AND id = ?", orgID, memberID).
		Update("is_active", false).Error
}

func (r *repository) IsMember(ctx context.Context, orgID, userID uuid.UUID) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&model.OrganizationMember{}).
		Where("organization_id = ? AND user_id = ? AND is_active = ?", orgID, userID, true).
		Count(&count).Error
	return count > 0, err
}

func (r *repository) GetUserOrganizations(ctx context.Context, userID uuid.UUID) ([]model.Organization, error) {
	var orgs []model.Organization
	err := r.db.WithContext(ctx).
		Model(&model.Organization{}).
		Joins("JOIN organization_members ON organization_members.organization_id = organizations.id").
		Where("organization_members.user_id = ? AND organization_members.is_active = ? AND organizations.is_active = ?", userID, true, true).
		Order("organizations.created_at DESC").
		Find(&orgs).Error
	return orgs, err
}