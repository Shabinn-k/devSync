package project

import (
	"context"
	"errors"
	"time"

	"gorm.io/gorm"

	"devSync/internal/model"
)

func (r *repository) Create(ctx context.Context, project *model.Project) error {
	return r.db.WithContext(ctx).Create(project).Error
}

func (r *repository) GetByID(ctx context.Context, id int) (*model.Project, error) {
	var project model.Project
	err := r.db.WithContext(ctx).
		Where("id = ? AND is_active = ?", id, true).
		First(&project).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrProjectNotFound
	}
	return &project, err
}

func (r *repository) GetByOrganization(ctx context.Context, orgID int, limit, offset int) ([]model.Project, int64, error) {
	var projects []model.Project
	var total int64

	query := r.db.WithContext(ctx).Model(&model.Project{}).
		Where("organization_id = ? AND is_active = ?", orgID, true)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.
		Limit(limit).
		Offset(offset).
		Order("created_at DESC").
		Find(&projects).Error

	return projects, total, err
}

func (r *repository) GetByUser(ctx context.Context, userID int, limit, offset int) ([]model.Project, int64, error) {
	var projects []model.Project
	var total int64

	query := r.db.WithContext(ctx).
		Table("projects").
		Joins("JOIN project_members ON project_members.project_id = projects.id").
		Where("project_members.user_id = ? AND project_members.is_active = ? AND projects.is_active = ?", userID, true, true)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.
		Limit(limit).
		Offset(offset).
		Order("projects.created_at DESC").
		Find(&projects).Error

	return projects, total, err
}

func (r *repository) Update(ctx context.Context, project *model.Project) error {
	project.UpdatedAt = time.Now()
	return r.db.WithContext(ctx).Save(project).Error
}

func (r *repository) Delete(ctx context.Context, id int) error {
	return r.db.WithContext(ctx).
		Model(&model.Project{}).
		Where("id = ?", id).
		Update("is_active", false).Error
}

func (r *repository) GetTaskCount(ctx context.Context, projectID int) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&model.Task{}).
		Where("project_id = ? AND is_active = ?", projectID, true).
		Count(&count).Error
	return count, err
}
 
func (r *repository) AddMember(ctx context.Context, member *model.ProjectMember) error {
	var existing model.ProjectMember
	err := r.db.WithContext(ctx).
		Where("project_id = ? AND user_id = ? AND is_active = ?", member.ProjectID, member.UserID, true).
		First(&existing).Error

	if err == nil {
		return ErrMemberAlreadyExists
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	return r.db.WithContext(ctx).Create(member).Error
}

func (r *repository) GetMember(ctx context.Context, projectID int, userID int) (*model.ProjectMember, error) {
	var member model.ProjectMember
	err := r.db.WithContext(ctx).
		Where("project_id = ? AND user_id = ? AND is_active = ?", projectID, userID, true).
		First(&member).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrMemberNotFound
	}
	return &member, err
}

func (r *repository) GetMemberByID(ctx context.Context, projectID, memberID int) (*model.ProjectMember, error) {
	var member model.ProjectMember
	err := r.db.WithContext(ctx).
		Where("project_id = ? AND id = ? AND is_active = ?", projectID, memberID, true).
		First(&member).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrMemberNotFound
	}
	return &member, err
}

func (r *repository) GetMembers(ctx context.Context, projectID int) ([]model.ProjectMember, error) {
	var members []model.ProjectMember
	err := r.db.WithContext(ctx).
		Where("project_id = ? AND is_active = ?", projectID, true).
		Preload("User").
		Order("joined_at ASC").
		Find(&members).Error
	return members, err
}

func (r *repository) UpdateMemberRole(ctx context.Context, projectID, memberID int, role string) error {
	return r.db.WithContext(ctx).
		Model(&model.ProjectMember{}).
		Where("project_id = ? AND id = ?", projectID, memberID).
		Updates(map[string]interface{}{
			"role":       role,
			"updated_at": time.Now(),
		}).Error
}

func (r *repository) RemoveMember(ctx context.Context, projectID, memberID int) error {
	return r.db.WithContext(ctx).
		Model(&model.ProjectMember{}).
		Where("project_id = ? AND id = ?", projectID, memberID).
		Updates(map[string]interface{}{
			"is_active":  false,
			"updated_at": time.Now(),
		}).Error
}

func (r *repository) IsMember(ctx context.Context, projectID int, userID int) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&model.ProjectMember{}).
		Where("project_id = ? AND user_id = ? AND is_active = ?", projectID, userID, true).
		Count(&count).Error
	return count > 0, err
}

func (r *repository) IsAdmin(ctx context.Context, projectID int, userID int) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&model.ProjectMember{}).
		Where("project_id = ? AND user_id = ? AND role = ? AND is_active = ?", projectID, userID, model.ProjectRoleAdmin, true).
		Count(&count).Error
	return count > 0, err
}

