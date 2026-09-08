package team

import (
	"context"
	"errors"

	"gorm.io/gorm"
	"devSync/internal/model"
)

var (
	ErrNotFound       = errors.New("team not found")
	ErrMemberNotFound = errors.New("member not found")
	ErrAlreadyMember  = errors.New("user is already a member")
)

type Repository interface {
	// Team operations
	Create(ctx context.Context, team *model.Team) error
	GetByID(ctx context.Context, id int) (*model.Team, error)
	GetByOrganization(ctx context.Context, orgID int, limit, offset int) ([]model.Team, int64, error)
	GetUserTeams(ctx context.Context, userID int) ([]model.Team, error)
	Update(ctx context.Context, team *model.Team) error
	Delete(ctx context.Context, id int) error
	GetMemberCount(ctx context.Context, teamID int) (int64, error)

	// Member operations
	AddMember(ctx context.Context, member *model.TeamMember) error
	GetMember(ctx context.Context, teamID, userID int) (*model.TeamMember, error)
	GetMemberByID(ctx context.Context, teamID, memberID int) (*model.TeamMember, error)
	GetMembers(ctx context.Context, teamID int) ([]model.TeamMember, error)
	UpdateMemberRole(ctx context.Context, teamID, memberID int, role string) error
	RemoveMember(ctx context.Context, teamID, memberID int) error
	IsMember(ctx context.Context, teamID, userID int) (bool, error)
	IsAdmin(ctx context.Context, teamID, userID int) (bool, error)
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}