package project

import (
	"context"
	"errors"

	"gorm.io/gorm"

	"devSync/internal/model"
)

var (
	ErrProjectNotFound     = errors.New("project not found")
	ErrMemberAlreadyExists = errors.New("user is already a member")
	ErrMemberNotFound      = errors.New("member not found")
)

type Repository interface {
	Create(ctx context.Context, project *model.Project) error
	GetByID(ctx context.Context, id int) (*model.Project, error)
	GetByOrganization(ctx context.Context, orgID int, limit, offset int) ([]model.Project, int64, error)
	GetByUser(ctx context.Context, userID int, limit, offset int) ([]model.Project, int64, error)
	Update(ctx context.Context, project *model.Project) error
	Delete(ctx context.Context, id int) error
	GetTaskCount(ctx context.Context, projectID int) (int64, error)
 
	AddMember(ctx context.Context, member *model.ProjectMember) error
	GetMember(ctx context.Context, projectID int, userID int) (*model.ProjectMember, error)
	GetMemberByID(ctx context.Context, projectID int, memberID int) (*model.ProjectMember, error)
	GetMembers(ctx context.Context, projectID int) ([]model.ProjectMember, error)
	UpdateMemberRole(ctx context.Context, projectID int, memberID int, role string) error
	RemoveMember(ctx context.Context, projectID int, memberID int) error
	IsMember(ctx context.Context, projectID int, userID int) (bool, error)
	IsAdmin(ctx context.Context, projectID int, userID int) (bool, error)
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

