package task

import (
	"context"
	"strings"
	"testing"

	"devSync/config"
	"devSync/internal/dto/request"
	"devSync/internal/model"
	projectRepo "devSync/internal/repositories/project"
	taskRepo "devSync/internal/repositories/task"
)

type taskRepositoryStub struct {
	taskRepo.Repository
	task    *model.Task
	updates int
}

func (s *taskRepositoryStub) GetByID(context.Context, int) (*model.Task, error) {
	copy := *s.task
	return &copy, nil
}
func (s *taskRepositoryStub) Update(_ context.Context, task *model.Task) error {
	s.updates++
	s.task = task
	return nil
}
func (s *taskRepositoryStub) GetCommentCount(context.Context, int) (int64, error) { return 0, nil }

type projectRepositoryStub struct {
	projectRepo.Repository
	admin  bool
	member bool
}

func (s *projectRepositoryStub) GetByID(context.Context, int) (*model.Project, error) {
	return &model.Project{ID: 2, IsActive: true}, nil
}
func (s *projectRepositoryStub) IsAdmin(context.Context, int, int) (bool, error) { return s.admin, nil }
func (s *projectRepositoryStub) IsMember(context.Context, int, int) (bool, error) {
	return s.member, nil
}

func TestTaskDetailsRequireCreatorOrProjectAdmin(t *testing.T) {
	ctx := context.Background()
	for _, tc := range []struct {
		name        string
		userID      int
		admin       bool
		wantAllowed bool
	}{
		{"ordinary project member", 4, false, false},
		{"assignee", 5, false, false},
		{"task creator", 9, false, true},
		{"project administrator", 6, true, true},
	} {
		t.Run(tc.name, func(t *testing.T) {
			base := &model.Task{ID: 1, ProjectID: 2, CreatedBy: 9, AssigneeID: intPtrTask(5), Title: "Before", IsActive: true}
			tasks := &taskRepositoryStub{task: base}
			projects := &projectRepositoryStub{admin: tc.admin, member: true}
			svc := NewService(tasks, projects, nil, &config.AppConfig{}, nil)
			_, err := svc.Update(ctx, tc.userID, base.ID, &request.UpdateTaskRequest{Title: "After"})
			if (err == nil) != tc.wantAllowed {
				t.Fatalf("error=%v wantAllowed=%v", err, tc.wantAllowed)
			}
			if tc.wantAllowed && tasks.updates != 1 {
				t.Fatalf("updates=%d want=1", tasks.updates)
			}
			if !tc.wantAllowed && !strings.Contains(err.Error(), "unauthorized") {
				t.Fatalf("unexpected error: %v", err)
			}
		})
	}
}

func intPtrTask(v int) *int { return &v }
