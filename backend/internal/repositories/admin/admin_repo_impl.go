package admin

import (
	"context"
	"errors"
	"time"

	"gorm.io/gorm"

	"devSync/internal/model"
)

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}


func (r *repository) ListUsers(ctx context.Context, q ListUsersQuery) ([]model.User, int64, error) {
	if q.Page < 1 {
		q.Page = 1
	}
	if q.Limit < 1 {
		q.Limit = 20
	} else if q.Limit > 100 {
		q.Limit = 100
	}
	offset := (q.Page - 1) * q.Limit

	query := r.db.WithContext(ctx).Model(&model.User{})

	if q.Search != "" {
		like := "%" + q.Search + "%"
		query = query.Where("name ILIKE ? OR email ILIKE ?", like, like)
	}
	if q.RoleID > 0 {
		query = query.Where("role_id = ?", q.RoleID)
	}
	if q.IsActive != nil {
		query = query.Where("is_active = ?", *q.IsActive)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	var users []model.User
	err := query.
		Preload("Role").
		Order("created_at DESC").
		Limit(q.Limit).
		Offset(offset).
		Find(&users).Error

	return users, total, err
}

func (r *repository) GetUserByID(ctx context.Context, id int) (*model.User, error) {
	var u model.User
	err := r.db.WithContext(ctx).
		Preload("Role").
		Where("id = ?", id).
		First(&u).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, gorm.ErrRecordNotFound
	}
	return &u, err
}

func (r *repository) CountUserRelations(ctx context.Context, userID int) (orgs, teams, projects, tasks int, err error) {
	var o, t, p, tk int64

	if err = r.db.WithContext(ctx).Model(&model.OrganizationMember{}).
		Where("user_id = ? AND is_active = ?", userID, true).
		Count(&o).Error; err != nil {
		return
	}
	if err = r.db.WithContext(ctx).Model(&model.TeamMember{}).
		Where("user_id = ? AND is_active = ?", userID, true).
		Count(&t).Error; err != nil {
		return
	}
	if err = r.db.WithContext(ctx).Model(&model.ProjectMember{}).
		Where("user_id = ? AND is_active = ?", userID, true).
		Count(&p).Error; err != nil {
		return
	}
	if err = r.db.WithContext(ctx).Model(&model.Task{}).
		Where("assignee_id = ? AND is_active = ?", userID, true).
		Count(&tk).Error; err != nil {
		return
	}

	return int(o), int(t), int(p), int(tk), nil
}


func (r *repository) ListOrganizations(ctx context.Context, q ListOrgsQuery) ([]model.Organization, int64, error) {
	if q.Page < 1 {
		q.Page = 1
	}
	if q.Limit < 1 {
		q.Limit = 20
	} else if q.Limit > 100 {
		q.Limit = 100
	}
	offset := (q.Page - 1) * q.Limit

	query := r.db.WithContext(ctx).Model(&model.Organization{})

	if q.Search != "" {
		like := "%" + q.Search + "%"
		query = query.Where("name ILIKE ? OR slug ILIKE ?", like, like)
	}
	if q.IsActive != nil {
		query = query.Where("is_active = ?", *q.IsActive)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	var orgs []model.Organization
	err := query.
		Preload("Owner").
		Order("created_at DESC").
		Limit(q.Limit).
		Offset(offset).
		Find(&orgs).Error

	return orgs, total, err
}

func (r *repository) GetOrganizationByID(ctx context.Context, id int) (*model.Organization, error) {
	var org model.Organization
	err := r.db.WithContext(ctx).
		Preload("Owner").
		Where("id = ?", id).
		First(&org).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, gorm.ErrRecordNotFound
	}
	return &org, err
}

func (r *repository) CountOrgRelations(ctx context.Context, orgID int) (members, teams, projects int, err error) {
	var m, t, p int64

	if err = r.db.WithContext(ctx).Model(&model.OrganizationMember{}).
		Where("organization_id = ? AND is_active = ?", orgID, true).
		Count(&m).Error; err != nil {
		return
	}
	if err = r.db.WithContext(ctx).Model(&model.Team{}).
		Where("organization_id = ? AND is_active = ?", orgID, true).
		Count(&t).Error; err != nil {
		return
	}
	if err = r.db.WithContext(ctx).Model(&model.Project{}).
		Where("organization_id = ? AND is_active = ?", orgID, true).
		Count(&p).Error; err != nil {
		return
	}

	return int(m), int(t), int(p), nil
}

func (r *repository) UpdateOrgStatus(ctx context.Context, orgID int, isActive bool) error {
	return r.db.WithContext(ctx).
		Model(&model.Organization{}).
		Where("id = ?", orgID).
		Updates(map[string]interface{}{
			"is_active":  isActive,
			"updated_at": time.Now(),
		}).Error
}

func (r *repository) UpdateOrgOwner(ctx context.Context, orgID, newOwnerID int) error {
	return r.db.WithContext(ctx).
		Model(&model.Organization{}).
		Where("id = ?", orgID).
		Updates(map[string]interface{}{
			"created_by": newOwnerID,
			"updated_at": time.Now(),
		}).Error
}

func (r *repository) IsOrgMember(ctx context.Context, orgID, userID int) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&model.OrganizationMember{}).
		Where("organization_id = ? AND user_id = ? AND is_active = ?", orgID, userID, true).
		Count(&count).Error
	return count > 0, err
}

func (r *repository) UpsertOrgMemberAdmin(ctx context.Context, orgID, userID int) error {
	var existing model.OrganizationMember
	err := r.db.WithContext(ctx).
		Where("organization_id = ? AND user_id = ?", orgID, userID).
		First(&existing).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return r.db.WithContext(ctx).Create(&model.OrganizationMember{
			OrganizationID: orgID,
			UserID:         userID,
			Role:           model.OrgRoleAdmin,
			IsActive:       true,
		}).Error
	}
	if err != nil {
		return err
	}

	return r.db.WithContext(ctx).
		Model(&model.OrganizationMember{}).
		Where("id = ?", existing.ID).
		Updates(map[string]interface{}{
			"role":       model.OrgRoleAdmin,
			"is_active":  true,
			"updated_at": time.Now(),
		}).Error
}


func (r *repository) CountUsers(ctx context.Context) (int64, error) {
	var c int64
	err := r.db.WithContext(ctx).Model(&model.User{}).Count(&c).Error
	return c, err
}

func (r *repository) CountUsersByActive(ctx context.Context, active bool) (int64, error) {
	var c int64
	err := r.db.WithContext(ctx).Model(&model.User{}).Where("is_active = ?", active).Count(&c).Error
	return c, err
}

func (r *repository) CountUsersCreatedSince(ctx context.Context, since any) (int64, error) {
	var c int64
	err := r.db.WithContext(ctx).Model(&model.User{}).Where("created_at >= ?", since).Count(&c).Error
	return c, err
}

func (r *repository) CountActiveAdminsExcluding(ctx context.Context, excludeUserID int) (int64, error) {
	var c int64
	err := r.db.WithContext(ctx).Model(&model.User{}).
		Where("role_id = ? AND is_active = ? AND id != ?", model.RoleIDAdmin, true, excludeUserID).
		Count(&c).Error
	return c, err
}

func (r *repository) CountOrganizations(ctx context.Context) (int64, error) {
	var c int64
	err := r.db.WithContext(ctx).Model(&model.Organization{}).Count(&c).Error
	return c, err
}

func (r *repository) CountOrganizationsByActive(ctx context.Context, active bool) (int64, error) {
	var c int64
	err := r.db.WithContext(ctx).Model(&model.Organization{}).Where("is_active = ?", active).Count(&c).Error
	return c, err
}

func (r *repository) CountTeams(ctx context.Context) (int64, error) {
	var c int64
	err := r.db.WithContext(ctx).Model(&model.Team{}).Where("is_active = ?", true).Count(&c).Error
	return c, err
}

func (r *repository) CountProjects(ctx context.Context) (int64, error) {
	var c int64
	err := r.db.WithContext(ctx).Model(&model.Project{}).Where("is_active = ?", true).Count(&c).Error
	return c, err
}

func (r *repository) CountTasks(ctx context.Context) (int64, error) {
	var c int64
	err := r.db.WithContext(ctx).Model(&model.Task{}).Where("is_active = ?", true).Count(&c).Error
	return c, err
}

func (r *repository) CountTasksByStatus(ctx context.Context, status string) (int64, error) {
	var c int64
	err := r.db.WithContext(ctx).Model(&model.Task{}).
		Where("status = ? AND is_active = ?", status, true).
		Count(&c).Error
	return c, err
}


func (r *repository) RecentUsers(ctx context.Context, limit int) ([]model.User, error) {
	var rows []model.User
	err := r.db.WithContext(ctx).Model(&model.User{}).
		Order("created_at DESC").Limit(limit).Find(&rows).Error
	return rows, err
}

func (r *repository) RecentOrgs(ctx context.Context, limit int) ([]model.Organization, error) {
	var rows []model.Organization
	err := r.db.WithContext(ctx).Model(&model.Organization{}).
		Order("created_at DESC").Limit(limit).Find(&rows).Error
	return rows, err
}

func (r *repository) RecentProjects(ctx context.Context, limit int) ([]model.Project, error) {
	var rows []model.Project
	err := r.db.WithContext(ctx).Model(&model.Project{}).
		Order("created_at DESC").Limit(limit).Find(&rows).Error
	return rows, err
}

func (r *repository) RecentTasks(ctx context.Context, limit int) ([]model.Task, error) {
	var rows []model.Task
	err := r.db.WithContext(ctx).Model(&model.Task{}).
		Order("created_at DESC").Limit(limit).Find(&rows).Error
	return rows, err
}