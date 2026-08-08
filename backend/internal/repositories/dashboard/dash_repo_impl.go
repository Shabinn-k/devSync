package dashboard

import (
	"context"
	"time"

	"github.com/google/uuid"
)

func (r *repository) CountProjects(ctx context.Context, userID uuid.UUID) (int64, error) {
	return 12, nil
}

func (r *repository) CountTasks(ctx context.Context, userID uuid.UUID) (int64, error) {
	return 48, nil
}

func (r *repository) CountTeams(ctx context.Context, userID uuid.UUID) (int64, error) {
	return 4, nil
}

func (r *repository) CountCompletedTasks(ctx context.Context, userID uuid.UUID) (int64, error) {
	return 32, nil
}

func (r *repository) CountActiveTasks(ctx context.Context, userID uuid.UUID) (int64, error) {
	return 16, nil
}

func (r *repository) GetRecentActivities(ctx context.Context, userID uuid.UUID, limit int) ([]Activity, error) {
	
	return []Activity{
		{
			ID:        "1",
			Type:      "task",
			Action:    "completed",
			Title:     "Design system updates",
			UserName:  "You",
			CreatedAt: time.Now().Add(-2 * time.Hour),
		},
		{
			ID:        "2",
			Type:      "project",
			Action:    "created",
			Title:     "Mobile App Redesign",
			UserName:  "Sarah Chen",
			CreatedAt: time.Now().Add(-4 * time.Hour),
		},
		{
			ID:        "3",
			Type:      "task",
			Action:    "assigned",
			Title:     "API Integration",
			UserName:  "Mike Johnson",
			CreatedAt: time.Now().Add(-6 * time.Hour),
		},
	}, nil
}

func (r *repository) GetUpcomingTasks(ctx context.Context, userID uuid.UUID, limit int) ([]Task, error) {
	return []Task{
		{
			ID:       "1",
			Title:    "Complete user profile design",
			DueDate:  time.Now(),
			Priority: "High",
			Status:   "todo",
		},
		{
			ID:       "2",
			Title:    "Fix login page bug",
			DueDate:  time.Now().Add(24 * time.Hour),
			Priority: "Medium",
			Status:   "in_progress",
		},
		{
			ID:       "3",
			Title:    "Update documentation",
			DueDate:  time.Now().Add(72 * time.Hour),
			Priority: "Low",
			Status:   "todo",
		},
	}, nil
}