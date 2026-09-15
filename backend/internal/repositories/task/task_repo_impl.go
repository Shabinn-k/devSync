package task

import (
	"context"
	"errors"
	"time"

	"gorm.io/gorm"
	"devSync/internal/model"
)

func (r *repository) Create(ctx context.Context, task *model.Task) error {
	return r.db.WithContext(ctx).Create(task).Error
}

func (r *repository) GetByID(ctx context.Context, id int) (*model.Task, error) {
	var task model.Task
	err := r.db.WithContext(ctx).
		Where("id = ? AND is_active = ?", id, true).
		Preload("Assignee").
		Preload("Creator").
		First(&task).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrTaskNotFound
	}
	return &task, err
}

func (r *repository) GetByProject(ctx context.Context, projectID int, limit, offset int) ([]model.Task, int64, error) {
	var tasks []model.Task
	var total int64

	query := r.db.WithContext(ctx).Model(&model.Task{}).
		Where("project_id = ? AND is_active = ?", projectID, true)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.
		Preload("Assignee").
		Preload("Creator").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&tasks).Error

	return tasks, total, err
}

func (r *repository) GetByAssignee(ctx context.Context, userID int, limit, offset int) ([]model.Task, int64, error) {
	var tasks []model.Task
	var total int64

	query := r.db.WithContext(ctx).Model(&model.Task{}).
		Where("(created_by = ? OR assignee_id = ?) AND is_active = ?", userID, userID, true)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.
		Preload("Assignee").
		Preload("Creator").
		Preload("Project").
		Order("due_date ASC, created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&tasks).Error

	return tasks, total, err
}

func (r *repository) Update(ctx context.Context, task *model.Task) error {
	task.UpdatedAt = time.Now()
	return r.db.WithContext(ctx).Save(task).Error
}

func (r *repository) Delete(ctx context.Context, id int) error {
	return r.db.WithContext(ctx).
		Model(&model.Task{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"is_active":  false,
			"updated_at": time.Now(),
		}).Error
}

func (r *repository) UpdateStatus(ctx context.Context, id int, status string) error {
	updates := map[string]interface{}{
		"status":     status,
		"updated_at": time.Now(),
	}
	if status == model.TaskStatusDone {
		now := time.Now()
		updates["completed_at"] = &now
	} else {
		updates["completed_at"] = nil
	}
	return r.db.WithContext(ctx).
		Model(&model.Task{}).
		Where("id = ?", id).
		Updates(updates).Error
}

func (r *repository) GetCommentCount(ctx context.Context, taskID int) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&model.Comment{}).
		Where("task_id = ?", taskID).
		Count(&count).Error
	return count, err
}

func (r *repository) AddComment(ctx context.Context, comment *model.Comment) error {
	return r.db.WithContext(ctx).Create(comment).Error
}

func (r *repository) GetComments(ctx context.Context, taskID int, limit, offset int) ([]model.Comment, int64, error) {
	var comments []model.Comment
	var total int64

	query := r.db.WithContext(ctx).Model(&model.Comment{}).
		Where("task_id = ?", taskID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.
		Preload("User").
		Order("created_at ASC").
		Limit(limit).
		Offset(offset).
		Find(&comments).Error

	return comments, total, err
}

func (r *repository) GetCommentByID(ctx context.Context, id int) (*model.Comment, error) {
	var comment model.Comment
	err := r.db.WithContext(ctx).
		Preload("User").
		First(&comment, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCommentNotFound
		}
		return nil, err
	}
	return &comment, nil
}

func (r *repository) DeleteComment(ctx context.Context, id int) error {
	return r.db.WithContext(ctx).Delete(&model.Comment{}, "id = ?", id).Error
}