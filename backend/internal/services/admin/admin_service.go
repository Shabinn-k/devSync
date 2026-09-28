package admin

import (
	"context"
	"errors"
	"fmt" 
	"sort"
	"time"

	"github.com/redis/go-redis/v9"

	"devSync/config"
	adminRepo "devSync/internal/repositories/admin"
	authRepo "devSync/internal/repositories/auth"
	adminRequest "devSync/internal/dto/request"
	adminResponse "devSync/internal/dto/response"
	"devSync/internal/model"
)

type Service interface {
	ListUsers(ctx context.Context, q adminRequest.AdminListUsersQuery) ([]adminResponse.AdminUserResponse, int64, error)
	GetUser(ctx context.Context, id int) (*adminResponse.AdminUserDetailResponse, error)
	UpdateUserRole(ctx context.Context, adminID, userID, roleID int) error
	UpdateUserStatus(ctx context.Context, adminID, userID int, isActive bool) error
	DeleteUser(ctx context.Context, adminID, userID int) error

	ListOrganizations(ctx context.Context, q adminRequest.AdminListOrgsQuery) ([]adminResponse.AdminOrganizationResponse, int64, error)
	GetOrganization(ctx context.Context, id int) (*adminResponse.AdminOrganizationResponse, error)
	UpdateOrgStatus(ctx context.Context, orgID int, isActive bool) error
	TransferOwnership(ctx context.Context, orgID, newOwnerID int) error
	DeleteOrg(ctx context.Context, orgID int) error

	GetStats(ctx context.Context) (*adminResponse.AdminStatsResponse, error)
}

type service struct {
	repo        adminRepo.Repository
	authRepo    authRepo.Repository
	redisClient *redis.Client
	cfg         *config.AppConfig
}

func NewService(repo adminRepo.Repository, authRepo authRepo.Repository, redisClient *redis.Client, cfg *config.AppConfig) Service {
	return &service{repo: repo, authRepo: authRepo, redisClient: redisClient, cfg: cfg}
}


func (s *service) ListUsers(ctx context.Context, q adminRequest.AdminListUsersQuery) ([]adminResponse.AdminUserResponse, int64, error) {
	users, total, err := s.repo.ListUsers(ctx, adminRepo.ListUsersQuery{
		Page:     q.Page,
		Limit:    q.Limit,
		Search:   q.Search,
		RoleID:   q.RoleID,
		IsActive: q.IsActive,
	})
	if err != nil {
		return nil, 0, err
	}

	out := make([]adminResponse.AdminUserResponse, len(users))
	for i, u := range users {
		out[i] = *toAdminUserResponse(&u)
	}
	return out, total, nil
}

func (s *service) GetUser(ctx context.Context, id int) (*adminResponse.AdminUserDetailResponse, error) {
	u, err := s.repo.GetUserByID(ctx, id)
	if err != nil {
		return nil, errors.New("user not found")
	}

	orgs, teams, projects, tasks, err := s.repo.CountUserRelations(ctx, id)
	if err != nil {
		return nil, err
	}

	base := toAdminUserResponse(u)
	return &adminResponse.AdminUserDetailResponse{
		AdminUserResponse: *base,
		OrgCount:          orgs,
		TeamCount:         teams,
		ProjectCount:      projects,
		TaskCount:         tasks,
	}, nil
}

func (s *service) UpdateUserRole(ctx context.Context, adminID, userID, roleID int) error {
	if adminID == userID {
		return errors.New("cannot change your own role")
	}
	if roleID < 1 || roleID > 3 {
		return errors.New("invalid role_id")
	}
	target, err := s.repo.GetUserByID(ctx, userID)
	if err != nil {
		return errors.New("user not found")
	}
	if target.RoleID == model.RoleIDAdmin && roleID != model.RoleIDAdmin {
		if err := s.guardLastAdmin(ctx, userID); err != nil {
			return err
		}
	}
	return s.authRepo.UpdateRole(ctx, userID, roleID)
}

func (s *service) UpdateUserStatus(ctx context.Context, adminID, userID int, isActive bool) error {
	if adminID == userID {
		return errors.New("cannot change your own status")
	}
	u, err := s.repo.GetUserByID(ctx, userID)
	if err != nil {
		return errors.New("user not found")
	}
	if !isActive {
		if err := s.guardLastAdmin(ctx, userID); err != nil {
			return err
		}
	}
	u.IsActive = isActive
	if err := s.authRepo.UpdateUser(ctx, u); err != nil {
		return err
	}
	if !isActive {
		_ = s.authRepo.RevokeAllUserTokens(ctx, userID)
	}
	return nil
}

func (s *service) DeleteUser(ctx context.Context, adminID, userID int) error {
	if adminID == userID {
		return errors.New("cannot delete yourself")
	}
	u, err := s.repo.GetUserByID(ctx, userID)
	if err != nil {
		return errors.New("user not found")
	}
	if !u.IsActive {
	}
	if err := s.guardLastAdmin(ctx, userID); err != nil {
		return err
	}
	u.IsActive = false
	if err := s.authRepo.UpdateUser(ctx, u); err != nil {
		return err
	}
	_ = s.authRepo.RevokeAllUserTokens(ctx, userID)
	return nil
}

func (s *service) guardLastAdmin(ctx context.Context, targetUserID int) error {
	target, err := s.repo.GetUserByID(ctx, targetUserID)
	if err != nil {
		return errors.New("user not found")
	}
	if target.RoleID != model.RoleIDAdmin {
	}

	remainingAdmins, err := s.repo.CountActiveAdminsExcluding(ctx, targetUserID)
	if err != nil {
		return err
	}
	if remainingAdmins == 0 {
		return errors.New("cannot deactivate the last active admin")
	}
	return nil
}


func (s *service) ListOrganizations(ctx context.Context, q adminRequest.AdminListOrgsQuery) ([]adminResponse.AdminOrganizationResponse, int64, error) {
	orgs, total, err := s.repo.ListOrganizations(ctx, adminRepo.ListOrgsQuery{
		Page:     q.Page,
		Limit:    q.Limit,
		Search:   q.Search,
		IsActive: q.IsActive,
	})
	if err != nil {
		return nil, 0, err
	}

	out := make([]adminResponse.AdminOrganizationResponse, len(orgs))
	for i, o := range orgs {
		resp := toAdminOrgResponse(&o)
		m, t, p, _ := s.repo.CountOrgRelations(ctx, o.ID)
		resp.MemberCount = m
		resp.TeamCount = t
		resp.ProjectCount = p
		out[i] = *resp
	}
	return out, total, nil
}

func (s *service) GetOrganization(ctx context.Context, id int) (*adminResponse.AdminOrganizationResponse, error) {
	org, err := s.repo.GetOrganizationByID(ctx, id)
	if err != nil {
		return nil, errors.New("organization not found")
	}

	m, t, p, _ := s.repo.CountOrgRelations(ctx, id)
	resp := toAdminOrgResponse(org)
	resp.MemberCount = m
	resp.TeamCount = t
	resp.ProjectCount = p
	return resp, nil
}

func (s *service) UpdateOrgStatus(ctx context.Context, orgID int, isActive bool) error {
	org, err := s.repo.GetOrganizationByID(ctx, orgID)
	if err != nil {
		return errors.New("organization not found")
	}
	if org.IsActive == isActive {
		return errors.New("organization already in that state")
	}
	return s.repo.UpdateOrgStatus(ctx, orgID, isActive)
}

func (s *service) TransferOwnership(ctx context.Context, orgID, newOwnerID int) error {
	org, err := s.repo.GetOrganizationByID(ctx, orgID)
	if err != nil {
		return errors.New("organization not found")
	}
	if org.CreatedBy == newOwnerID {
		return errors.New("user is already the owner of this organization")
	}

	newOwner, err := s.repo.GetUserByID(ctx, newOwnerID)
	if err != nil {
		return errors.New("new owner not found")
	}
	if !newOwner.IsActive {
		return errors.New("cannot transfer ownership to an inactive user")
	}

	isMember, err := s.repo.IsOrgMember(ctx, orgID, newOwnerID)
	if err != nil {
		return err
	}
	if !isMember {
		return errors.New("new owner is not a member of this organization")
	}
return ctx.Err()
}

func (s *service) DeleteOrg(ctx context.Context, orgID int) error {
	if _, err := s.repo.GetOrganizationByID(ctx, orgID); err != nil {
		return errors.New("organization not found")
	}
	return s.repo.UpdateOrgStatus(ctx, orgID, false)
}


func (s *service) GetStats(ctx context.Context) (*adminResponse.AdminStatsResponse, error) {
	weekAgo := time.Now().Add(-7 * 24 * time.Hour)

	usersTotal, _ := s.repo.CountUsers(ctx)
	usersActive, _ := s.repo.CountUsersByActive(ctx, true)
	usersNew, _ := s.repo.CountUsersCreatedSince(ctx, weekAgo)

	orgsTotal, _ := s.repo.CountOrganizations(ctx)
	orgsActive, _ := s.repo.CountOrganizationsByActive(ctx, true)

	teamsTotal, _ := s.repo.CountTeams(ctx)
	projectsTotal, _ := s.repo.CountProjects(ctx)

	tasksTotal, _ := s.repo.CountTasks(ctx)
	tasksDone, _ := s.repo.CountTasksByStatus(ctx, model.TaskStatusDone)
	tasksInProgress, _ := s.repo.CountTasksByStatus(ctx, model.TaskStatusInProgress)

	type feedItem struct {
		Type        string
		Description string
		Timestamp   time.Time
	}
	var feed []feedItem

	if rows, err := s.repo.RecentUsers(ctx, 10); err == nil {
		for _, u := range rows {
			feed = append(feed, feedItem{
				Type:        "user_created",
				Description: fmt.Sprintf("New user: %s (%s)", u.Name, u.Email),
				Timestamp:   u.CreatedAt,
			})
		}
	}
	if rows, err := s.repo.RecentOrgs(ctx, 10); err == nil {
		for _, o := range rows {
			feed = append(feed, feedItem{
				Type:        "org_created",
				Description: fmt.Sprintf("New organization: %s", o.Name),
				Timestamp:   o.CreatedAt,
			})
		}
	}
	if rows, err := s.repo.RecentProjects(ctx, 10); err == nil {
		for _, p := range rows {
			feed = append(feed, feedItem{
				Type:        "project_created",
				Description: fmt.Sprintf("New project: %s", p.Name),
				Timestamp:   p.CreatedAt,
			})
		}
	}
	if rows, err := s.repo.RecentTasks(ctx, 10); err == nil {
		for _, t := range rows {
			feed = append(feed, feedItem{
				Type:        "task_created",
				Description: fmt.Sprintf("New task: %s", t.Title),
				Timestamp:   t.CreatedAt,
			})
		}
	}

	sort.Slice(feed, func(i, j int) bool {
		return feed[i].Timestamp.After(feed[j].Timestamp)
	})
	if len(feed) > 20 {
		feed = feed[:20]
	}

	activity := make([]adminResponse.AdminActivityItem, len(feed))
	for i, f := range feed {
		activity[i] = adminResponse.AdminActivityItem{
			Type:        f.Type,
			Description: f.Description,
			Timestamp:   f.Timestamp,
		}
	}

	return &adminResponse.AdminStatsResponse{
		Users: adminResponse.AdminStatsUsers{
			Total: usersTotal, Active: usersActive, NewThisWeek: usersNew,
		},
		Organizations: adminResponse.AdminStatsOrganizations{
			Total: orgsTotal, Active: orgsActive,
		},
		Teams:    adminResponse.AdminStatsTeams{Total: teamsTotal},
		Projects: adminResponse.AdminStatsProjects{Total: projectsTotal},
		Tasks: adminResponse.AdminStatsTasks{
			Total: tasksTotal, Completed: tasksDone, InProgress: tasksInProgress,
		},
		RecentActivity: activity,
	}, nil
}


func toAdminUserResponse(u *model.User) *adminResponse.AdminUserResponse {
	roleName := u.Role.Name
	if roleName == "" {
		switch u.RoleID {
		case model.RoleIDAdmin:
			roleName = model.RoleNameAdmin
		case model.RoleIDTeamLead:
			roleName = model.RoleNameTeamLead
		default:
			roleName = model.RoleNameDeveloper
		}
	}
	return &adminResponse.AdminUserResponse{
		ID:          u.ID,
		Name:        u.Name,
		Email:       u.Email,
		RoleID:      u.RoleID,
		Role:        roleName,
		IsVerified:  u.IsVerified,
		IsActive:    u.IsActive,
		LastLoginAt: u.LastLoginAt,
		CreatedAt:   u.CreatedAt,
	}
}

func toAdminOrgResponse(o *model.Organization) *adminResponse.AdminOrganizationResponse {
	return &adminResponse.AdminOrganizationResponse{
		ID:          o.ID,
		Name:        o.Name,
		Slug:        o.Slug,
		Description: o.Description,
		CreatedBy:   o.CreatedBy,
		OwnerName:   o.Owner.Name,
		OwnerEmail:  o.Owner.Email,
		IsActive:    o.IsActive,
		CreatedAt:   o.CreatedAt,
		UpdatedAt:   o.UpdatedAt,
	}
}