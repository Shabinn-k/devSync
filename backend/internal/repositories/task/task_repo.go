package task

import (
	"context"
	"errors"

	"gorm.io/gorm"
	"devSync/internal/model"
)

var (
	ErrTaskNotFound = errors.New("task not found")
	ErrCommentNotFound = errors.New("comment not found")
)

type Repository interface {
	Create(ctx context.Context, task *model.Task) error
	GetByID(ctx context.Context, id int) (*model.Task, error)
	GetByProject(ctx context.Context, projectID int, limit, offset int) ([]model.Task, int64, error)
	GetByAssignee(ctx context.Context, userID int, limit, offset int) ([]model.Task, int64, error)
	Update(ctx context.Context, task *model.Task) error
	Delete(ctx context.Context, id int) error
	UpdateStatus(ctx context.Context, id int, status string) error
	GetCommentCount(ctx context.Context, taskID int) (int64, error)

	AddComment(ctx context.Context, comment *model.Comment) error
	GetCommentByID(ctx context.Context, id int) (*model.Comment, error)
	GetComments(ctx context.Context, taskID int, limit, offset int) ([]model.Comment, int64, error)
	DeleteComment(ctx context.Context, id int) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}