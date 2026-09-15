package dashboard

import (
	"context"
	"time"

	"devSync/internal/model"
)

func (r *repository) CountProjects(ctx context.Context, userID int) (int64, error) {
	if !r.db.WithContext(ctx).Migrator().HasTable("projects") {
		return 0, nil
	}
	var count int64
	err := r.db.WithContext(ctx).Table("projects").
		Where("is_active = ? AND (created_by = ? OR id IN (SELECT project_id FROM project_members WHERE user_id = ? AND is_active = ?) OR organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = ? AND is_active = ?))", true, userID, userID, true, userID, true).
		Count(&count).Error
	return count, err
}

func (r *repository) CountTasks(ctx context.Context, userID int) (int64, error) {
	if !r.db.WithContext(ctx).Migrator().HasTable("tasks") {
		return 0, nil
	}
	var count int64
	err := r.db.WithContext(ctx).Table("tasks").
		Where("is_active = ? AND (created_by = ? OR assignee_id = ?)", true, userID, userID).
		Count(&count).Error
	return count, err
}

func (r *repository) CountTeams(ctx context.Context, userID int) (int64, error) {
	if !r.db.WithContext(ctx).Migrator().HasTable("teams") {
		return 0, nil
	}
	var count int64
	err := r.db.WithContext(ctx).Table("teams").
		Where("is_active = ? AND (lead_id = ? OR id IN (SELECT team_id FROM team_members WHERE user_id = ? AND is_active = ?) OR organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = ? AND is_active = ?))", true, userID, userID, true, userID, true).
		Count(&count).Error
	return count, err
}

func (r *repository) CountCompletedTasks(ctx context.Context, userID int) (int64, error) {
	if !r.db.WithContext(ctx).Migrator().HasTable("tasks") {
		return 0, nil
	}
	var count int64
	err := r.db.WithContext(ctx).Table("tasks").
		Where("is_active = ? AND (created_by = ? OR assignee_id = ?) AND status = ?", true, userID, userID, model.TaskStatusDone).
		Count(&count).Error
	return count, err
}

func (r *repository) CountActiveTasks(ctx context.Context, userID int) (int64, error) {
	if !r.db.WithContext(ctx).Migrator().HasTable("tasks") {
		return 0, nil
	}
	var count int64
	err := r.db.WithContext(ctx).Table("tasks").
		Where("is_active = ? AND (created_by = ? OR assignee_id = ?) AND status != ?", true, userID, userID, model.TaskStatusDone).
		Count(&count).Error
	return count, err
}

func (r *repository) GetRecentActivities(ctx context.Context, userID int, limit int) ([]Activity, error) {
	if r.db.WithContext(ctx).Migrator().HasTable("notifications") {
		var notifs []model.Notification
		err := r.db.WithContext(ctx).
			Where("user_id = ?", userID).
			Order("created_at DESC").
			Limit(limit).
			Find(&notifs).Error
		if err == nil && len(notifs) > 0 {
			activities := make([]Activity, len(notifs))
			for i, n := range notifs {
				activities[i] = Activity{
					ID:        n.ID,
					Type:      n.Type,
					Action:    n.Title,
					Title:     n.Content,
					UserName:  "DevSync",
					CreatedAt: n.CreatedAt,
				}
			}
			return activities, nil
		}
	}
	return []Activity{}, nil
}

func (r *repository) GetUpcomingTasks(ctx context.Context, userID int, limit int) ([]Task, error) {
	if !r.db.WithContext(ctx).Migrator().HasTable("tasks") {
		return []Task{}, nil
	}
	var dbTasks []model.Task
	err := r.db.WithContext(ctx).
		Where("is_active = ? AND (created_by = ? OR assignee_id = ?) AND status != ?", true, userID, userID, model.TaskStatusDone).
		Order("due_date ASC NULLS LAST, created_at DESC").
		Limit(limit).
		Find(&dbTasks).Error
	if err != nil {
		return []Task{}, nil
	}
	tasks := make([]Task, len(dbTasks))
	for i, t := range dbTasks {
		var dueDate time.Time
		if t.DueDate != nil {
			dueDate = *t.DueDate
		}
		tasks[i] = Task{
			ID:       t.ID,
			Title:    t.Title,
			DueDate:  dueDate,
			Priority: t.Priority,
			Status:   t.Status,
		}
	}
	return tasks, nil
}
