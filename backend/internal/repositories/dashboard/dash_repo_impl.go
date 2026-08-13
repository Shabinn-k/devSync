package dashboard

import (
	"context"

	"github.com/google/uuid"
	"devSync/internal/model"
)

func (r *repository) CountProjects(ctx context.Context, userID uuid.UUID) (int64, error) {
	if !r.db.WithContext(ctx).Migrator().HasTable("projects") {
		return 0, nil
	}
	var count int64
	err := r.db.WithContext(ctx).Table("projects").Where("user_id = ? OR created_by = ?", userID, userID).Count(&count).Error
	return count, err
}

func (r *repository) CountTasks(ctx context.Context, userID uuid.UUID) (int64, error) {
	if !r.db.WithContext(ctx).Migrator().HasTable("tasks") {
		return 0, nil
	}
	var count int64
	err := r.db.WithContext(ctx).Table("tasks").Where("user_id = ? OR assigned_to = ?", userID, userID).Count(&count).Error
	return count, err
}

func (r *repository) CountTeams(ctx context.Context, userID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&model.OrganizationMember{}).
		Where("user_id = ? AND is_active = ?", userID, true).
		Count(&count).Error
	return count, err
}

func (r *repository) CountCompletedTasks(ctx context.Context, userID uuid.UUID) (int64, error) {
	if !r.db.WithContext(ctx).Migrator().HasTable("tasks") {
		return 0, nil
	}
	var count int64
	err := r.db.WithContext(ctx).Table("tasks").Where("(user_id = ? OR assigned_to = ?) AND status = ?", userID, userID, "completed").Count(&count).Error
	return count, err
}

func (r *repository) CountActiveTasks(ctx context.Context, userID uuid.UUID) (int64, error) {
	if !r.db.WithContext(ctx).Migrator().HasTable("tasks") {
		return 0, nil
	}
	var count int64
	err := r.db.WithContext(ctx).Table("tasks").Where("(user_id = ? OR assigned_to = ?) AND status != ?", userID, userID, "completed").Count(&count).Error
	return count, err
}

func (r *repository) GetRecentActivities(ctx context.Context, userID uuid.UUID, limit int) ([]Activity, error) {
	if !r.db.WithContext(ctx).Migrator().HasTable("activities") {
		return []Activity{}, nil
	}
	var activities []Activity
	err := r.db.WithContext(ctx).Table("activities").Where("user_id = ?", userID).Order("created_at DESC").Limit(limit).Find(&activities).Error
	if err != nil {
		return []Activity{}, nil
	}
	return activities, nil
}

func (r *repository) GetUpcomingTasks(ctx context.Context, userID uuid.UUID, limit int) ([]Task, error) {
	if !r.db.WithContext(ctx).Migrator().HasTable("tasks") {
		return []Task{}, nil
	}
	var tasks []Task
	err := r.db.WithContext(ctx).Table("tasks").Where("(user_id = ? OR assigned_to = ?) AND status != ?", userID, userID, "completed").Order("due_date ASC").Limit(limit).Find(&tasks).Error
	if err != nil {
		return []Task{}, nil
	}
	return tasks, nil
}