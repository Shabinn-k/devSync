package dashboard

import (
	"context" 

	"github.com/google/uuid"

	"devSync/config"
	"devSync/internal/dto/response"
	"devSync/internal/repositories/dashboard"
)

type Service interface {
	GetStats(ctx context.Context, userID uuid.UUID) (*response.DashboardStatsResponse, error)
	GetActivities(ctx context.Context, userID uuid.UUID, limit int) ([]response.ActivityResponse, error)
	GetTasks(ctx context.Context, userID uuid.UUID, limit int) ([]response.TaskResponse, error)
}

type service struct {
	repo dashboard.Repository
	cfg  *config.AppConfig
}

func NewService(repo dashboard.Repository, cfg *config.AppConfig) Service {
	return &service{
		repo: repo,
		cfg:  cfg,
	}
}

func (s *service) GetStats(ctx context.Context, userID uuid.UUID) (*response.DashboardStatsResponse, error) {
	// Get real stats from database
	projects, _ := s.repo.CountProjects(ctx, userID)
	tasks, _ := s.repo.CountTasks(ctx, userID)
	teams, _ := s.repo.CountTeams(ctx, userID)
	completedTasks, _ := s.repo.CountCompletedTasks(ctx, userID)
	activeTasks, _ := s.repo.CountActiveTasks(ctx, userID)

	// Calculate completion rate
	completionRate := 0
	if tasks > 0 {
		completionRate = int((float64(completedTasks) / float64(tasks)) * 100)
	}

	return &response.DashboardStatsResponse{
		Projects:       projects,
		Tasks:          tasks,
		Teams:          teams,
		CompletedTasks: completedTasks,
		ActiveTasks:    activeTasks,
		PendingTasks:   tasks - completedTasks - activeTasks,
		OverdueTasks:   0,
		CompletionRate: completionRate,
	}, nil
}

func (s *service) GetActivities(ctx context.Context, userID uuid.UUID, limit int) ([]response.ActivityResponse, error) {
	// Get real activities from database
	activities, err := s.repo.GetRecentActivities(ctx, userID, limit)
	if err != nil {
		return []response.ActivityResponse{}, nil
	}

	var result []response.ActivityResponse
	for _, act := range activities {
		result = append(result, response.ActivityResponse{
			ID:     act.ID,
			Type:   act.Type,
			Action: act.Action,
			Title:  act.Title,
			Time:   act.CreatedAt.Format("2 hours ago"),
			User:   act.UserName,
		})
	}
	return result, nil
}

func (s *service) GetTasks(ctx context.Context, userID uuid.UUID, limit int) ([]response.TaskResponse, error) {
	// Get real tasks from database
	tasks, err := s.repo.GetUpcomingTasks(ctx, userID, limit)
	if err != nil {
		return []response.TaskResponse{}, nil
	}

	var result []response.TaskResponse
	for _, task := range tasks {
		result = append(result, response.TaskResponse{
			ID:       task.ID,
			Title:    task.Title,
			DueDate:  task.DueDate.Format("Jan 2"),
			Priority: task.Priority,
			Status:   task.Status,
		})
	}
	return result, nil
}