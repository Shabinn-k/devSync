package team

import (
	"context"
	"errors"
	"fmt"

	"devSync/config"
	"devSync/internal/dto/request"
	"devSync/internal/dto/response"
	"devSync/internal/model"
	"devSync/internal/repositories/auth"
	"devSync/internal/repositories/organization"
	"devSync/internal/repositories/team"
	notifService "devSync/internal/services/notification"
)

// Service errors
var (
	ErrForbidden          = errors.New("forbidden")
	ErrNotOrgMember       = errors.New("user is not a member of this organization")
	ErrCannotChangeOwnRole = errors.New("cannot change your own role")
	ErrCannotRemoveSelf    = errors.New("cannot remove yourself")
	ErrNotFound           = team.ErrNotFound
)

type Service interface {
	Create(ctx context.Context, userID int, req request.CreateTeamRequest) (*response.TeamResponse, error)
	GetByID(ctx context.Context, userID, teamID int) (*response.TeamDetailResponse, error)
	GetByOrganization(ctx context.Context, userID, orgID, limit, offset int) ([]response.TeamResponse, int64, error)
	GetMyTeams(ctx context.Context, userID int) ([]response.TeamResponse, error)
	Update(ctx context.Context, userID, teamID int, req request.UpdateTeamRequest) (*response.TeamResponse, error)
	Delete(ctx context.Context, userID, teamID int) error

	AddMember(ctx context.Context, userID, teamID int, req request.AddTeamMemberRequest) (*response.TeamMemberResponse, error)
	GetMembers(ctx context.Context, userID, teamID int) ([]response.TeamMemberResponse, error)
	UpdateMemberRole(ctx context.Context, userID, teamID, memberID int, req request.UpdateTeamMemberRoleRequest) error
	RemoveMember(ctx context.Context, userID, teamID, memberID int) error
}

type service struct {
	teamRepo team.Repository
	orgRepo  organization.Repository
	authRepo auth.Repository
	cfg      *config.AppConfig
	notifSvc notifService.Service
}

func NewService(
	teamRepo team.Repository,
	orgRepo organization.Repository,
	authRepo auth.Repository,
	cfg *config.AppConfig,
	notifSvc notifService.Service,
) Service {
	return &service{
		teamRepo: teamRepo,
		orgRepo:  orgRepo,
		authRepo: authRepo,
		cfg:      cfg,
		notifSvc: notifSvc,
	}
}

// ============ TEAM CRUD ============

func (s *service) Create(ctx context.Context, userID int, req request.CreateTeamRequest) (*response.TeamResponse, error) {
	// Check if user is organization member
	isMember, err := s.orgRepo.IsMember(ctx, req.OrganizationID, userID)
	if err != nil {
		return nil, err
	}
	if !isMember {
		return nil, ErrNotOrgMember
	}

	// Check if lead exists
	lead, err := s.authRepo.GetUserByID(ctx, req.LeadID)
	if err != nil {
		return nil, fmt.Errorf("lead user not found: %w", err)
	}

	// Check if lead is organization member
	isLeadOrgMember, err := s.orgRepo.IsMember(ctx, req.OrganizationID, req.LeadID)
	if err != nil {
		return nil, err
	}
	if !isLeadOrgMember {
		return nil, errors.New("team lead must be a member of the organization")
	}

	team := &model.Team{
		OrganizationID: req.OrganizationID,
		Name:           req.Name,
		Description:    req.Description,
		LeadID:         req.LeadID,
		IsActive:       true,
	}

	if err := s.teamRepo.Create(ctx, team); err != nil {
		return nil, err
	}

	// Always add lead as team admin
	leadMember := &model.TeamMember{
		TeamID: team.ID,
		UserID: req.LeadID,
		Role:   model.TeamRoleAdmin,
	}
	if err := s.teamRepo.AddMember(ctx, leadMember); err != nil {
		s.teamRepo.Delete(ctx, team.ID)
		return nil, errors.New("failed to add lead as team member")
	}

	// Also add creator as team admin if different from lead
	if userID != req.LeadID {
		creatorMember := &model.TeamMember{
			TeamID: team.ID,
			UserID: userID,
			Role:   model.TeamRoleAdmin,
		}
		_ = s.teamRepo.AddMember(ctx, creatorMember)
	}

	return s.mapToResponse(team, lead), nil
}

func (s *service) GetByID(ctx context.Context, userID, teamID int) (*response.TeamDetailResponse, error) {
	team, err := s.teamRepo.GetByID(ctx, teamID)
	if err != nil {
		return nil, err
	}

	// Check if user is team member
	isMember, err := s.teamRepo.IsMember(ctx, teamID, userID)
	if err != nil {
		return nil, err
	}
	if !isMember {
		return nil, ErrForbidden
	}

	members, err := s.teamRepo.GetMembers(ctx, teamID)
	if err != nil {
		return nil, err
	}

	memberCount, err := s.teamRepo.GetMemberCount(ctx, teamID)
	if err != nil {
		return nil, err
	}

	return s.mapToDetailResponse(team, members, int(memberCount)), nil
}

func (s *service) GetByOrganization(ctx context.Context, userID, orgID, limit, offset int) ([]response.TeamResponse, int64, error) {
	// Check if user is organization member
	isMember, err := s.orgRepo.IsMember(ctx, orgID, userID)
	if err != nil {
		return nil, 0, err
	}
	if !isMember {
		return nil, 0, ErrNotOrgMember
	}

	teams, total, err := s.teamRepo.GetByOrganization(ctx, orgID, limit, offset)
	if err != nil {
		return nil, 0, err
	}

	result := make([]response.TeamResponse, len(teams))
	for i, t := range teams {
		memberCount, _ := s.teamRepo.GetMemberCount(ctx, t.ID)
		result[i] = *s.mapToResponseWithCount(&t, int(memberCount))
	}

	return result, total, nil
}

func (s *service) GetMyTeams(ctx context.Context, userID int) ([]response.TeamResponse, error) {
	teams, err := s.teamRepo.GetUserTeams(ctx, userID)
	if err != nil {
		return nil, err
	}

	result := make([]response.TeamResponse, len(teams))
	for i, t := range teams {
		memberCount, _ := s.teamRepo.GetMemberCount(ctx, t.ID)
		result[i] = *s.mapToResponseWithCount(&t, int(memberCount))
	}

	return result, nil
}

func (s *service) Update(ctx context.Context, userID, teamID int, req request.UpdateTeamRequest) (*response.TeamResponse, error) {
	// Check if user is admin
	isAdmin, err := s.teamRepo.IsAdmin(ctx, teamID, userID)
	if err != nil {
		return nil, err
	}
	if !isAdmin {
		return nil, ErrForbidden
	}

	team, err := s.teamRepo.GetByID(ctx, teamID)
	if err != nil {
		return nil, err
	}

	if req.Name != "" {
		team.Name = req.Name
	}
	if req.Description != "" {
		team.Description = req.Description
	}
	if req.LeadID != 0 {
		// Check if lead exists
		_, err := s.authRepo.GetUserByID(ctx, req.LeadID)
		if err != nil {
			return nil, fmt.Errorf("lead user not found: %w", err)
		}
		team.LeadID = req.LeadID
	}
	if req.IsActive != nil {
		team.IsActive = *req.IsActive
	}

	if err := s.teamRepo.Update(ctx, team); err != nil {
		return nil, err
	}

	lead, err := s.authRepo.GetUserByID(ctx, team.LeadID)
	if err != nil {
		return nil, err
	}

	return s.mapToResponse(team, lead), nil
}

func (s *service) Delete(ctx context.Context, userID, teamID int) error {
	isAdmin, err := s.teamRepo.IsAdmin(ctx, teamID, userID)
	if err != nil {
		return err
	}
	if !isAdmin {
		return ErrForbidden
	}

	return s.teamRepo.Delete(ctx, teamID)
}

// ============ MEMBERS ============

func (s *service) AddMember(ctx context.Context, userID, teamID int, req request.AddTeamMemberRequest) (*response.TeamMemberResponse, error) {
	isAdmin, err := s.teamRepo.IsAdmin(ctx, teamID, userID)
	if err != nil {
		return nil, err
	}
	if !isAdmin {
		return nil, ErrForbidden
	}

	// Check if target user exists
	targetUser, err := s.authRepo.GetUserByID(ctx, req.UserID)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	// Check if target user is in the same organization
	team, err := s.teamRepo.GetByID(ctx, teamID)
	if err != nil {
		return nil, err
	}

	isOrgMember, err := s.orgRepo.IsMember(ctx, team.OrganizationID, req.UserID)
	if err != nil {
		return nil, err
	}
	if !isOrgMember {
		return nil, errors.New("user must be a member of the organization first")
	}

	member := &model.TeamMember{
		TeamID: teamID,
		UserID: req.UserID,
		Role:   req.Role,
	}

	if err := s.teamRepo.AddMember(ctx, member); err != nil {
		return nil, err
	}

	if s.notifSvc != nil && req.UserID != userID {
		_ = s.notifSvc.NotifyUser(
			ctx,
			req.UserID,
			model.TypeMemberAdded,
			"Added to Team",
			fmt.Sprintf("You have been added to team '%s'.", team.Name),
			fmt.Sprintf("/teams/%d", teamID),
			map[string]interface{}{"team_id": teamID, "role": req.Role},
		)
	}

	return s.mapToMemberResponse(member, targetUser), nil
}

func (s *service) GetMembers(ctx context.Context, userID, teamID int) ([]response.TeamMemberResponse, error) {
	// Check if user is team member
	isMember, err := s.teamRepo.IsMember(ctx, teamID, userID)
	if err != nil {
		return nil, err
	}
	if !isMember {
		return nil, ErrForbidden
	}

	members, err := s.teamRepo.GetMembers(ctx, teamID)
	if err != nil {
		return nil, err
	}

	result := make([]response.TeamMemberResponse, len(members))
	for i, m := range members {
		result[i] = *s.mapToMemberResponse(&m, &m.User)
	}

	return result, nil
}

func (s *service) UpdateMemberRole(ctx context.Context, userID, teamID, memberID int, req request.UpdateTeamMemberRoleRequest) error {
	isAdmin, err := s.teamRepo.IsAdmin(ctx, teamID, userID)
	if err != nil {
		return err
	}
	if !isAdmin {
		return ErrForbidden
	}

	member, err := s.teamRepo.GetMemberByID(ctx, teamID, memberID)
	if err != nil {
		return err
	}

	// Prevent changing own role
	if member.UserID == userID {
		return ErrCannotChangeOwnRole
	}

	return s.teamRepo.UpdateMemberRole(ctx, teamID, memberID, req.Role)
}

func (s *service) RemoveMember(ctx context.Context, userID, teamID, memberID int) error {
	isAdmin, err := s.teamRepo.IsAdmin(ctx, teamID, userID)
	if err != nil {
		return err
	}
	if !isAdmin {
		return ErrForbidden
	}

	member, err := s.teamRepo.GetMemberByID(ctx, teamID, memberID)
	if err != nil {
		return err
	}

	// Prevent removing yourself
	if member.UserID == userID {
		return ErrCannotRemoveSelf
	}

	return s.teamRepo.RemoveMember(ctx, teamID, memberID)
}

// ============ MAPPERS ============

func (s *service) mapToResponse(team *model.Team, lead *model.User) *response.TeamResponse {
	return &response.TeamResponse{
		ID:             team.ID,
		OrganizationID: team.OrganizationID,
		Name:           team.Name,
		Description:    team.Description,
		LeadID:         team.LeadID,
		IsActive:       team.IsActive,
		CreatedAt:      team.CreatedAt,
		UpdatedAt:      team.UpdatedAt,
		Lead: &response.UserResponse{
			ID:    lead.ID,
			Name:  lead.Name,
			Email: lead.Email,
		},
	}
}

func (s *service) mapToResponseWithCount(team *model.Team, memberCount int) *response.TeamResponse {
	resp := &response.TeamResponse{
		ID:             team.ID,
		OrganizationID: team.OrganizationID,
		Name:           team.Name,
		Description:    team.Description,
		LeadID:         team.LeadID,
		MemberCount:    memberCount,
		IsActive:       team.IsActive,
		CreatedAt:      team.CreatedAt,
		UpdatedAt:      team.UpdatedAt,
	}

	if team.Lead.ID != 0 {
		resp.Lead = &response.UserResponse{
			ID:    team.Lead.ID,
			Name:  team.Lead.Name,
			Email: team.Lead.Email,
		}
	}

	return resp
}

func (s *service) mapToDetailResponse(team *model.Team, members []model.TeamMember, memberCount int) *response.TeamDetailResponse {
	memberResponses := make([]response.TeamMemberResponse, len(members))
	for i, m := range members {
		memberResponses[i] = *s.mapToMemberResponse(&m, &m.User)
	}

	base := s.mapToResponseWithCount(team, memberCount)

	return &response.TeamDetailResponse{
		TeamResponse: *base,
		Members:      memberResponses,
	}
}

func (s *service) mapToMemberResponse(member *model.TeamMember, user *model.User) *response.TeamMemberResponse {
	return &response.TeamMemberResponse{
		ID:       member.ID,
		TeamID:   member.TeamID,
		UserID:   member.UserID,
		Role:     member.Role,
		JoinedAt: member.JoinedAt,
		User: &response.UserResponse{
			ID:    user.ID,
			Name:  user.Name,
			Email: user.Email,
		},
	}
}