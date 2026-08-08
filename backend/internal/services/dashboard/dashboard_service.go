package dashboard

import (
	"context"
	"time"
	"fmt"
	"github.com/google/uuid"

	"devSync/config"
	"devSync/internal/dto/response"
	"devSync/internal/repositories/dashboard"
)

type Service interface {
	GetDashboard(ctx context.Context, userID uuid.UUID) (*response.DashboardResponse, error)
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

func (s *service) GetDashboard(ctx context.Context, userID uuid.UUID) (*response.DashboardResponse, error) {
	// Get all data in parallel
	projects, _ := s.repo.CountProjects(ctx, userID)
	tasks, _ := s.repo.CountTasks(ctx, userID)
	teams, _ := s.repo.CountTeams(ctx, userID)
	completedTasks, _ := s.repo.CountCompletedTasks(ctx, userID)
	activeTasks, _ := s.repo.CountActiveTasks(ctx, userID)
	activities, _ := s.repo.GetRecentActivities(ctx, userID, 5)
	upcomingTasks, _ := s.repo.GetUpcomingTasks(ctx, userID, 5)

	// Calculate completion rate
	completionRate := 0
	if tasks > 0 {
		completionRate = int((float64(completedTasks) / float64(tasks)) * 100)
	}

	return &response.DashboardResponse{
		Stats: response.DashboardStats{
			Projects:       int(projects),
			Tasks:          int(tasks),
			Teams:          int(teams),
			CompletedTasks: int(completedTasks),
			ActiveTasks:    int(activeTasks),
			CompletionRate: completionRate,
		},
		Activities: s.mapActivities(activities),
		Tasks:      s.mapTasks(upcomingTasks),
	}, nil
}

func (s *service) mapActivities(activities []dashboard.Activity) []response.ActivityResponse {
	var result []response.ActivityResponse
	for _, act := range activities {
		result = append(result, response.ActivityResponse{
			ID:     act.ID,
			Type:   act.Type,
			Action: act.Action,
			Title:  act.Title,
			Time:   s.formatTime(act.CreatedAt),
			User:   act.UserName,
		})
	}
	return result
}

func (s *service) mapTasks(tasks []dashboard.Task) []response.TaskResponse {
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
	return result
}

func (s *service) formatTime(t time.Time) string {
	diff := time.Now().Sub(t)
	if diff < time.Hour {
		return "Just now"
	}
	if diff < 2*time.Hour {
		return "1 hour ago"
	}
	if diff < 24*time.Hour {
		return fmt.Sprintf("%d hours ago", int(diff.Hours()))
	}
	days := int(diff.Hours() / 24)
	if days == 1 {
		return "1 day ago"
	}
	return fmt.Sprintf("%d days ago", days)
}