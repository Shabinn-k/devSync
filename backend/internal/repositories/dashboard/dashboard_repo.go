package dashboard

import (
	"context"
	"time"

	"gorm.io/gorm"
)

type Repository interface {
	CountProjects(ctx context.Context, userID int) (int64, error)
	CountTasks(ctx context.Context, userID int) (int64, error)
	CountTeams(ctx context.Context, userID int) (int64, error)
	CountCompletedTasks(ctx context.Context, userID int) (int64, error)
	CountActiveTasks(ctx context.Context, userID int) (int64, error)
	GetRecentActivities(ctx context.Context, userID int, limit int) ([]Activity, error)
	GetUpcomingTasks(ctx context.Context, userID int, limit int) ([]Task, error)
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

type Activity struct {
	ID        int
	Type      string
	Action    string
	Title     string
	UserName  string
	CreatedAt time.Time
}

type Task struct {
	ID       int
	Title    string
	DueDate  time.Time
	Priority string
	Status   string
}

