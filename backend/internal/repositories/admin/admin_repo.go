package admin

import (
	"context"

	"devSync/internal/model"
)

type Repository interface {
	ListUsers(ctx context.Context, q ListUsersQuery) ([]model.User, int64, error)
	GetUserByID(ctx context.Context, id int) (*model.User, error)
	CountUserRelations(ctx context.Context, userID int) (orgs, teams, projects, tasks int, err error)

	ListOrganizations(ctx context.Context, q ListOrgsQuery) ([]model.Organization, int64, error)
	GetOrganizationByID(ctx context.Context, id int) (*model.Organization, error)
	CountOrgRelations(ctx context.Context, orgID int) (members, teams, projects int, err error)
	UpdateOrgStatus(ctx context.Context, orgID int, isActive bool) error
	UpdateOrgOwner(ctx context.Context, orgID, newOwnerID int) error
	IsOrgMember(ctx context.Context, orgID, userID int) (bool, error)
	UpsertOrgMemberAdmin(ctx context.Context, orgID, userID int) error

	CountUsers(ctx context.Context) (int64, error)
	CountUsersByActive(ctx context.Context, active bool) (int64, error)
	CountUsersCreatedSince(ctx context.Context, since any) (int64, error)
	CountActiveAdminsExcluding(ctx context.Context, excludeUserID int) (int64, error)
	CountOrganizations(ctx context.Context) (int64, error)
	CountOrganizationsByActive(ctx context.Context, active bool) (int64, error)
	CountTeams(ctx context.Context) (int64, error)
	CountProjects(ctx context.Context) (int64, error)
	CountTasks(ctx context.Context) (int64, error)
	CountTasksByStatus(ctx context.Context, status string) (int64, error)

	RecentUsers(ctx context.Context, limit int) ([]model.User, error)
	RecentOrgs(ctx context.Context, limit int) ([]model.Organization, error)
	RecentProjects(ctx context.Context, limit int) ([]model.Project, error)
	RecentTasks(ctx context.Context, limit int) ([]model.Task, error)
}

type ListUsersQuery struct {
	Page     int
	Limit    int
	Search   string
	RoleID   int
	IsActive *bool
}

type ListOrgsQuery struct {
	Page     int
	Limit    int
	Search   string
	IsActive *bool
}