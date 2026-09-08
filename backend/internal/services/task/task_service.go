package task

import (
	"context"
	"errors"
	"fmt"

	"devSync/config"
	"devSync/internal/dto/request"
	"devSync/internal/dto/response"
	"devSync/internal/model"
	authRepo "devSync/internal/repositories/auth"
	projRepo "devSync/internal/repositories/project"
	taskRepo "devSync/internal/repositories/task"
	notifService "devSync/internal/services/notification"
)

type Service interface {
	// Task operations
	Create(ctx context.Context, userID int, req *request.CreateTaskRequest) (*response.TaskResponse, error)
	GetByID(ctx context.Context, userID, taskID int) (*response.TaskDetailResponse, error)
	GetByProject(ctx context.Context, userID, projectID int, page, limit int) ([]response.TaskResponse, int64, error)
	GetMyTasks(ctx context.Context, userID int, page, limit int) ([]response.TaskResponse, int64, error)
	Update(ctx context.Context, userID, taskID int, req *request.UpdateTaskRequest) (*response.TaskResponse, error)
	Delete(ctx context.Context, userID, taskID int) error
	UpdateStatus(ctx context.Context, userID, taskID int, req *request.UpdateTaskStatusRequest) error

	// Comment operations
	AddComment(ctx context.Context, userID, taskID int, req *request.AddCommentRequest) (*response.CommentResponse, error)
	GetComments(ctx context.Context, userID, taskID int, page, limit int) ([]response.CommentResponse, int64, error)
	DeleteComment(ctx context.Context, userID, commentID int) error
}

type service struct {
	taskRepo    taskRepo.Repository
	projectRepo projRepo.Repository
	authRepo    authRepo.Repository
	cfg         *config.AppConfig
	notifSvc    notifService.Service
}

func NewService(
	taskRepo taskRepo.Repository,
	projectRepo projRepo.Repository,
	authRepo authRepo.Repository,
	cfg *config.AppConfig,
	notifSvc notifService.Service,
) Service {
	return &service{
		taskRepo:    taskRepo,
		projectRepo: projectRepo,
		authRepo:    authRepo,
		cfg:         cfg,
		notifSvc:    notifSvc,
	}
}

func (s *service) Create(ctx context.Context, userID int, req *request.CreateTaskRequest) (*response.TaskResponse, error) {
	// Check user role: only team leads and admins can create tasks
	user, err := s.authRepo.GetUserByID(ctx, userID)
	if err != nil {
		return nil, errors.New("user not found")
	}
	isAdmin, _ := s.projectRepo.IsAdmin(ctx, req.ProjectID, userID)
	if user.Role != model.RoleTeamLead && user.Role != model.RoleAdmin && !isAdmin {
		return nil, errors.New("only team leads and admins can create tasks")
	}

	// Check if user is project member
	isMember, err := s.projectRepo.IsMember(ctx, req.ProjectID, userID)
	if err != nil || !isMember {
		return nil, errors.New("unauthorized: must be a project member")
	}

	// If assignee is set, check if they exist and are a project member
	if req.AssigneeID != nil {
		_, err := s.authRepo.GetUserByID(ctx, *req.AssigneeID)
		if err != nil {
			return nil, errors.New("assignee user not found")
		}
		isAssigneeMember, err := s.projectRepo.IsMember(ctx, req.ProjectID, *req.AssigneeID)
		if err != nil || !isAssigneeMember {
			return nil, errors.New("assignee must be a member of the project")
		}
	}

	task := &model.Task{
		ProjectID:   req.ProjectID,
		Title:       req.Title,
		Description: req.Description,
		Priority:    req.Priority,
		AssigneeID:  req.AssigneeID,
		CreatedBy:   userID,
		DueDate:     req.DueDate,
		Status:      model.TaskStatusTodo,
		IsActive:    true,
	}

	if err := s.taskRepo.Create(ctx, task); err != nil {
		return nil, err
	}

	// Get full task with relations
	task, err = s.taskRepo.GetByID(ctx, task.ID)
	if err != nil {
		return nil, err
	}

	// Send notification if assigned
	if req.AssigneeID != nil && *req.AssigneeID != userID {
		s.sendNotification(ctx, *req.AssigneeID, model.TypeTaskAssigned,
			"Task Assigned",
			fmt.Sprintf("You have been assigned to task: %s", task.Title),
			fmt.Sprintf("/tasks/%d", task.ID))
	}

	return s.mapToResponse(task), nil
}

func (s *service) GetByID(ctx context.Context, userID, taskID int) (*response.TaskDetailResponse, error) {
	task, err := s.taskRepo.GetByID(ctx, taskID)
	if err != nil {
		return nil, err
	}

	// Check if user is project member
	isMember, err := s.projectRepo.IsMember(ctx, task.ProjectID, userID)
	if err != nil || !isMember {
		return nil, errors.New("unauthorized: must be project member")
	}

	comments, _, err := s.taskRepo.GetComments(ctx, taskID, 100, 0)
	if err != nil {
		return nil, err
	}

	commentCount, err := s.taskRepo.GetCommentCount(ctx, taskID)
	if err != nil {
		return nil, err
	}

	return s.mapToDetailResponse(task, comments, commentCount), nil
}

func (s *service) GetByProject(ctx context.Context, userID, projectID int, page, limit int) ([]response.TaskResponse, int64, error) {
	isMember, err := s.projectRepo.IsMember(ctx, projectID, userID)
	if err != nil || !isMember {
		return nil, 0, errors.New("unauthorized: must be project member")
	}

	user, _ := s.authRepo.GetUserByID(ctx, userID)
	offset := (page - 1) * limit
	var tasks []model.Task
	var total int64

	if user != nil && user.Role == model.RoleDeveloper {
		// Developers only see tasks assigned to them in the project
		allMyTasks, _, err := s.taskRepo.GetByAssignee(ctx, userID, 1000, 0)
		if err != nil {
			return nil, 0, err
		}
		var filtered []model.Task
		for _, t := range allMyTasks {
			if t.ProjectID == projectID {
				filtered = append(filtered, t)
			}
		}
		total = int64(len(filtered))
		start := offset
		if start > len(filtered) {
			start = len(filtered)
		}
		end := start + limit
		if end > len(filtered) {
			end = len(filtered)
		}
		tasks = filtered[start:end]
	} else {
		tasks, total, err = s.taskRepo.GetByProject(ctx, projectID, limit, offset)
		if err != nil {
			return nil, 0, err
		}
	}

	result := make([]response.TaskResponse, len(tasks))
	for i, t := range tasks {
		commentCount, _ := s.taskRepo.GetCommentCount(ctx, t.ID)
		result[i] = *s.mapToResponseWithCount(&t, commentCount)
	}

	return result, total, nil
}

func (s *service) GetMyTasks(ctx context.Context, userID int, page, limit int) ([]response.TaskResponse, int64, error) {
	offset := (page - 1) * limit
	tasks, total, err := s.taskRepo.GetByAssignee(ctx, userID, limit, offset)
	if err != nil {
		return nil, 0, err
	}

	result := make([]response.TaskResponse, len(tasks))
	for i, t := range tasks {
		commentCount, _ := s.taskRepo.GetCommentCount(ctx, t.ID)
		result[i] = *s.mapToResponseWithCount(&t, commentCount)
	}

	return result, total, nil
}

func (s *service) Update(ctx context.Context, userID, taskID int, req *request.UpdateTaskRequest) (*response.TaskResponse, error) {
	task, err := s.taskRepo.GetByID(ctx, taskID)
	if err != nil {
		return nil, err
	}

	// Check if user is project member
	isMember, err := s.projectRepo.IsMember(ctx, task.ProjectID, userID)
	if err != nil || !isMember {
		return nil, errors.New("unauthorized: must be project member")
	}

	oldAssigneeID := task.AssigneeID
	if req.Title != "" {
		task.Title = req.Title
	}
	if req.Description != "" {
		task.Description = req.Description
	}
	if req.Priority != "" {
		task.Priority = req.Priority
	}
	if req.AssigneeID != nil {
		_, err := s.authRepo.GetUserByID(ctx, *req.AssigneeID)
		if err != nil {
			return nil, errors.New("assignee user not found")
		}
		isAssigneeMember, err := s.projectRepo.IsMember(ctx, task.ProjectID, *req.AssigneeID)
		if err != nil || !isAssigneeMember {
			return nil, errors.New("assignee must be a member of the project")
		}
		task.AssigneeID = req.AssigneeID
	}
	if req.DueDate != nil {
		task.DueDate = req.DueDate
	}

	if err := s.taskRepo.Update(ctx, task); err != nil {
		return nil, err
	}

	task, err = s.taskRepo.GetByID(ctx, taskID)
	if err != nil {
		return nil, err
	}

	// Notify new assignee if changed
	if req.AssigneeID != nil && (oldAssigneeID == nil || *req.AssigneeID != *oldAssigneeID) && *req.AssigneeID != userID {
		s.sendNotification(ctx, *req.AssigneeID, model.TypeTaskAssigned,
			"Task Assigned",
			fmt.Sprintf("You have been assigned to task: %s", task.Title),
			fmt.Sprintf("/tasks/%d", task.ID))
	}

	return s.mapToResponse(task), nil
}

func (s *service) Delete(ctx context.Context, userID, taskID int) error {
	task, err := s.taskRepo.GetByID(ctx, taskID)
	if err != nil {
		return err
	}

	// Check if user is project admin or task creator
	isAdmin, err := s.projectRepo.IsAdmin(ctx, task.ProjectID, userID)
	if err != nil {
		return err
	}
	if task.CreatedBy != userID && !isAdmin {
		return errors.New("unauthorized: only task creator or admin can delete")
	}

	return s.taskRepo.Delete(ctx, taskID)
}

func (s *service) UpdateStatus(ctx context.Context, userID, taskID int, req *request.UpdateTaskStatusRequest) error {
	task, err := s.taskRepo.GetByID(ctx, taskID)
	if err != nil {
		return err
	}

	// Check if user is project member
	isMember, err := s.projectRepo.IsMember(ctx, task.ProjectID, userID)
	if err != nil || !isMember {
		return errors.New("unauthorized: must be project member")
	}

	if err := s.taskRepo.UpdateStatus(ctx, taskID, req.Status); err != nil {
		return err
	}

	// Send notification if completed
	if req.Status == model.TaskStatusDone {
		if task.CreatedBy != userID {
			s.sendNotification(ctx, task.CreatedBy, model.TypeTaskCompleted,
				"Task Completed",
				fmt.Sprintf("Task '%s' was marked as done", task.Title),
				fmt.Sprintf("/tasks/%d", taskID))
		}
		if task.AssigneeID != nil && *task.AssigneeID != userID && *task.AssigneeID != task.CreatedBy {
			s.sendNotification(ctx, *task.AssigneeID, model.TypeTaskCompleted,
				"Task Completed",
				fmt.Sprintf("Task '%s' was marked as done", task.Title),
				fmt.Sprintf("/tasks/%d", taskID))
		}
	}

	return nil
}

// Comment methods
func (s *service) AddComment(ctx context.Context, userID, taskID int, req *request.AddCommentRequest) (*response.CommentResponse, error) {
	task, err := s.taskRepo.GetByID(ctx, taskID)
	if err != nil {
		return nil, err
	}

	// Check if user is project member
	isMember, err := s.projectRepo.IsMember(ctx, task.ProjectID, userID)
	if err != nil || !isMember {
		return nil, errors.New("unauthorized: must be project member")
	}

	comment := &model.Comment{
		TaskID:  taskID,
		UserID:  userID,
		Content: req.Content,
	}

	if err := s.taskRepo.AddComment(ctx, comment); err != nil {
		return nil, err
	}

	// Get user for response
	user, err := s.authRepo.GetUserByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	// Send notifications to task creator and assignee if different from commenter
	if task.CreatedBy != userID {
		s.sendNotification(ctx, task.CreatedBy, model.TypeCommentAdded,
			"New Comment",
			fmt.Sprintf("%s commented on task '%s'", user.Name, task.Title),
			fmt.Sprintf("/tasks/%d", taskID))
	}
	if task.AssigneeID != nil && *task.AssigneeID != userID && *task.AssigneeID != task.CreatedBy {
		s.sendNotification(ctx, *task.AssigneeID, model.TypeCommentAdded,
			"New Comment",
			fmt.Sprintf("%s commented on task '%s'", user.Name, task.Title),
			fmt.Sprintf("/tasks/%d", taskID))
	}

	resp := s.mapToCommentResponse(comment, user)
	return &resp, nil
}

func (s *service) GetComments(ctx context.Context, userID, taskID int, page, limit int) ([]response.CommentResponse, int64, error) {
	task, err := s.taskRepo.GetByID(ctx, taskID)
	if err != nil {
		return nil, 0, err
	}

	// Check if user is project member
	isMember, err := s.projectRepo.IsMember(ctx, task.ProjectID, userID)
	if err != nil || !isMember {
		return nil, 0, errors.New("unauthorized: must be project member")
	}

	offset := (page - 1) * limit
	comments, total, err := s.taskRepo.GetComments(ctx, taskID, limit, offset)
	if err != nil {
		return nil, 0, err
	}

	result := make([]response.CommentResponse, len(comments))
	for i, c := range comments {
		result[i] = s.mapToCommentResponse(&c, &c.User)
	}

	return result, total, nil
}

func (s *service) DeleteComment(ctx context.Context, userID, commentID int) error {
	comment, err := s.taskRepo.GetCommentByID(ctx, commentID)
	if err != nil {
		return err
	}

	task, err := s.taskRepo.GetByID(ctx, comment.TaskID)
	if err != nil {
		return err
	}

	isAdmin, err := s.projectRepo.IsAdmin(ctx, task.ProjectID, userID)
	if err != nil {
		return err
	}

	if comment.UserID != userID && task.CreatedBy != userID && !isAdmin {
		return errors.New("unauthorized: cannot delete this comment")
	}

	return s.taskRepo.DeleteComment(ctx, commentID)
}

// Helper methods
func (s *service) sendNotification(ctx context.Context, userID int, notifType, title, content, actionURL string) {
	if s.notifSvc == nil || userID <= 0 {
		return
	}
	_ = s.notifSvc.NotifyUser(ctx, userID, notifType, title, content, actionURL, nil)
}

func (s *service) mapToResponse(task *model.Task) *response.TaskResponse {
	commentCount, _ := s.taskRepo.GetCommentCount(context.Background(), task.ID)
	return s.mapToResponseWithCount(task, commentCount)
}

func (s *service) mapToResponseWithCount(task *model.Task, commentCount int64) *response.TaskResponse {
	resp := &response.TaskResponse{
		ID:          task.ID,
		ProjectID:   task.ProjectID,
		Title:       task.Title,
		Description: task.Description,
		Status:      task.Status,
		Priority:    task.Priority,
		AssigneeID:  task.AssigneeID,
		CreatedBy:   task.CreatedBy,
		DueDate:     task.DueDate,
		CompletedAt: task.CompletedAt,
		CommentCount: int(commentCount),
		IsActive:    task.IsActive,
		CreatedAt:   task.CreatedAt,
		UpdatedAt:   task.UpdatedAt,
	}

	if task.Assignee != nil {
		resp.Assignee = &response.UserResponse{
			ID:   task.Assignee.ID,
			Name: task.Assignee.Name,
			Email: task.Assignee.Email,
		}
	}

	if task.Creator.ID != 0 {
		resp.Creator = &response.UserResponse{
			ID:   task.Creator.ID,
			Name: task.Creator.Name,
			Email: task.Creator.Email,
		}
	}

	return resp
}

func (s *service) mapToDetailResponse(task *model.Task, comments []model.Comment, commentCount int64) *response.TaskDetailResponse {
	base := s.mapToResponseWithCount(task, commentCount)

	commentResponses := make([]response.CommentResponse, len(comments))
	for i, c := range comments {
		commentResponses[i] = s.mapToCommentResponse(&c, &c.User)
	}

	return &response.TaskDetailResponse{
		TaskResponse: *base,
		Comments:     commentResponses,
	}
}

func (s *service) mapToCommentResponse(comment *model.Comment, user *model.User) response.CommentResponse {
	return response.CommentResponse{
		ID:      comment.ID,
		TaskID:  comment.TaskID,
		UserID:  comment.UserID,
		Content: comment.Content,
		CreatedAt: comment.CreatedAt,
		UpdatedAt: comment.UpdatedAt,
		User: &response.UserResponse{
			ID:    user.ID,
			Name:  user.Name,
			Email: user.Email,
		},
	}
}