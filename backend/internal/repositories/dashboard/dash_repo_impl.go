package dashboard

import (
	"context"

	"devSync/internal/model"
)

func (r *repository) CountProjects(ctx context.Context, userID int) (int64, error) {
	if !r.db.WithContext(ctx).Migrator().HasTable("projects") {
		return 0, nil
	}
	var count int64
	err := r.db.WithContext(ctx).Table("projects").Where("created_by = ?", userID).Count(&count).Error
	return count, err
}

func (r *repository) CountTasks(ctx context.Context, userID int) (int64, error) {
	if !r.db.WithContext(ctx).Migrator().HasTable("tasks") {
		return 0, nil
	}
	var count int64
	err := r.db.WithContext(ctx).Table("tasks").Where("created_by = ? OR assignee_id = ?", userID, userID).Count(&count).Error
	return count, err
}

func (r *repository) CountTeams(ctx context.Context, userID int) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&model.OrganizationMember{}).
		Where("user_id = ? AND is_active = ?", userID, true).
		Count(&count).Error
	return count, err
}

func (r *repository) CountCompletedTasks(ctx context.Context, userID int) (int64, error) {
	if !r.db.WithContext(ctx).Migrator().HasTable("tasks") {
		return 0, nil
	}
	var count int64
	err := r.db.WithContext(ctx).Table("tasks").Where("(created_by = ? OR assignee_id = ?) AND status = ?", userID, userID, "done").Count(&count).Error
	return count, err
}

func (r *repository) CountActiveTasks(ctx context.Context, userID int) (int64, error) {
	if !r.db.WithContext(ctx).Migrator().HasTable("tasks") {
		return 0, nil
	}
	var count int64
	err := r.db.WithContext(ctx).Table("tasks").Where("(created_by = ? OR assignee_id = ?) AND status != ?", userID, userID, "done").Count(&count).Error
	return count, err
}

func (r *repository) GetRecentActivities(ctx context.Context, userID int, limit int) ([]Activity, error) {
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

func (r *repository) GetUpcomingTasks(ctx context.Context, userID int, limit int) ([]Task, error) {
	if !r.db.WithContext(ctx).Migrator().HasTable("tasks") {
		return []Task{}, nil
	}
	var tasks []Task
	err := r.db.WithContext(ctx).Table("tasks").Where("(created_by = ? OR assignee_id = ?) AND status != ?", userID, userID, "done").Order("due_date ASC").Limit(limit).Find(&tasks).Error
	if err != nil {
		return []Task{}, nil
	}
	return tasks, nil
}

