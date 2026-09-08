package dashboard

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"devSync/config"
	"devSync/internal/dto/response"
	"devSync/internal/repositories/dashboard"
	"github.com/redis/go-redis/v9"
)

type Service interface {
	GetDashboard(ctx context.Context, userID int) (*response.DashboardResponse, error)
}

type service struct {
	repo  dashboard.Repository
	cfg   *config.AppConfig
	cache *redis.Client
}

// ✅ Fix: Accept redisClient as third parameter
func NewService(repo dashboard.Repository, cfg *config.AppConfig, cache *redis.Client) Service {
	return &service{
		repo:  repo,
		cfg:   cfg,
		cache: cache,
	}
}

func (s *service) GetDashboard(ctx context.Context, userID int) (*response.DashboardResponse, error) {
	// Check cache first
	cacheKey := fmt.Sprintf("dashboard:user:%d", userID)
	cached, err := s.cache.Get(ctx, cacheKey).Result()
	if err == nil {
		var dashboard response.DashboardResponse
		if err := json.Unmarshal([]byte(cached), &dashboard); err == nil {
			return &dashboard, nil
		}
	}

	projects, _ := s.repo.CountProjects(ctx, userID)
	tasks, _ := s.repo.CountTasks(ctx, userID)
	teams, _ := s.repo.CountTeams(ctx, userID)
	completedTasks, _ := s.repo.CountCompletedTasks(ctx, userID)
	activeTasks, _ := s.repo.CountActiveTasks(ctx, userID)
	activities, _ := s.repo.GetRecentActivities(ctx, userID, 5)
	upcomingTasks, _ := s.repo.GetUpcomingTasks(ctx, userID, 5)

	completionRate := 0
	if tasks > 0 {
		completionRate = int((float64(completedTasks) / float64(tasks)) * 100)
	}

	dashboard := &response.DashboardResponse{
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
	}

	// Cache for 5 minutes
	data, _ := json.Marshal(dashboard)
	s.cache.Set(ctx, cacheKey, data, 5*time.Minute)

	return dashboard, nil
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

func (s *service) mapTasks(tasks []dashboard.Task) []response.DashboardTaskResponse {
	var result []response.DashboardTaskResponse
	for _, task := range tasks {
		dueDateStr := ""
		if !task.DueDate.IsZero() {
			dueDateStr = task.DueDate.Format("Jan 2")
		}
		result = append(result, response.DashboardTaskResponse{
			ID:       task.ID,
			Title:    task.Title,
			DueDate:  dueDateStr,
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