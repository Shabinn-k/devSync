package join_request

import (
	"context"
	"errors"

	"gorm.io/gorm"

	"devSync/internal/model"
)

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) Create(ctx context.Context, req *model.OrganizationJoinRequest) error {
	return r.db.WithContext(ctx).Create(req).Error
}

func (r *repository) GetByID(ctx context.Context, id int) (*model.OrganizationJoinRequest, error) {
	var out model.OrganizationJoinRequest
	err := r.db.WithContext(ctx).
		Preload("User").
		Preload("Organization").
		Where("id = ?", id).
		First(&out).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, gorm.ErrRecordNotFound
	}
	return &out, err
}

func (r *repository) GetPendingByOrgAndUser(ctx context.Context, orgID, userID int) (*model.OrganizationJoinRequest, error) {
	var out model.OrganizationJoinRequest
	err := r.db.WithContext(ctx).
		Where("organization_id = ? AND user_id = ? AND status = ?", orgID, userID, model.JoinRequestPending).
		First(&out).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &out, err
}

func (r *repository) List(ctx context.Context, q ListQuery) ([]model.OrganizationJoinRequest, int64, error) {
	if q.Page < 1 {
		q.Page = 1
	}
	if q.Limit < 1 {
		q.Limit = 20
	} else if q.Limit > 100 {
		q.Limit = 100
	}
	offset := (q.Page - 1) * q.Limit

	query := r.db.WithContext(ctx).Model(&model.OrganizationJoinRequest{})
	if q.OrganizationID > 0 {
		query = query.Where("organization_id = ?", q.OrganizationID)
	}
	if q.UserID > 0 {
		query = query.Where("user_id = ?", q.UserID)
	}
	if q.Status != "" {
		query = query.Where("status = ?", q.Status)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	var rows []model.OrganizationJoinRequest
	err := query.
		Preload("User").
		Preload("Organization").
		Order("created_at DESC").
		Limit(q.Limit).
		Offset(offset).
		Find(&rows).Error

	return rows, total, err
}

func (r *repository) Update(ctx context.Context, req *model.OrganizationJoinRequest) error {
	return r.db.WithContext(ctx).Save(req).Error
}

func (r *repository) CountPendingForOrg(ctx context.Context, orgID int) (int64, error) {
	var c int64
	err := r.db.WithContext(ctx).Model(&model.OrganizationJoinRequest{}).
		Where("organization_id = ? AND status = ?", orgID, model.JoinRequestPending).
		Count(&c).Error
	return c, err
}