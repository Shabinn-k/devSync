package dashboard

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Repository interface {
	
	CountProjects(ctx context.Context, userID uuid.UUID) (int64, error)
	CountTasks(ctx context.Context, userID uuid.UUID) (int64, error)
	CountTeams(ctx context.Context, userID uuid.UUID) (int64, error)
	CountCompletedTasks(ctx context.Context, userID uuid.UUID) (int64, error)
	CountActiveTasks(ctx context.Context, userID uuid.UUID) (int64, error)
	GetRecentActivities(ctx context.Context, userID uuid.UUID, limit int) ([]Activity, error)
	GetUpcomingTasks(ctx context.Context, userID uuid.UUID, limit int) ([]Task, error)
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

type Activity struct {
	ID        string
	Type      string
	Action    string
	Title     string
	UserName  string
	CreatedAt time.Time
}

type Task struct {
	ID       string
	Title    string
	DueDate  time.Time
	Priority string
	Status   string
}