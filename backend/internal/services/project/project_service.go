	package project

	import (
		"context"
		"errors"
		"fmt"
		"strings"

		"devSync/config"
		"devSync/internal/dto/request"
		"devSync/internal/dto/response"
		"devSync/internal/model"
		"devSync/internal/repositories/auth"
		"devSync/internal/repositories/organization"
		"devSync/internal/repositories/project"
		teamRepo "devSync/internal/repositories/team"
		notifService "devSync/internal/services/notification"
	)

	type Service interface {
		Create(ctx context.Context, userID int, req *request.CreateProjectRequest) (*response.ProjectResponse, error)
		GetByID(ctx context.Context, userID int, projectID int) (*response.ProjectDetailResponse, error)
		GetByOrganization(ctx context.Context, userID, orgID int, page, limit int) ([]response.ProjectResponse, int64, error)
		GetByUser(ctx context.Context, userID int, page, limit int) ([]response.ProjectResponse, int64, error)
		Update(ctx context.Context, userID int, projectID int, req *request.UpdateProjectRequest) (*response.ProjectResponse, error)
		Delete(ctx context.Context, userID int, projectID int) error

		AddMember(ctx context.Context, userID int, projectID int, req *request.AddProjectMemberRequest) (*response.ProjectMemberResponse, error)
		GetMembers(ctx context.Context, userID int, projectID int) ([]response.ProjectMemberResponse, error)
		UpdateMemberRole(ctx context.Context, userID int, projectID, memberID int, role string) error
		RemoveMember(ctx context.Context, userID int, projectID, memberID int) error
	}

	type service struct {
		projectRepo project.Repository
		orgRepo     organization.Repository
		teamRepo    teamRepo.Repository  
		authRepo    auth.Repository
		cfg         *config.AppConfig
		notifSvc    notifService.Service
	}

	func NewService(
		projectRepo project.Repository,
		orgRepo organization.Repository,
		teamRepo teamRepo.Repository, 
		authRepo auth.Repository,
		cfg *config.AppConfig,
		notifSvc notifService.Service,
	) Service {
		return &service{
			projectRepo: projectRepo,
			orgRepo:     orgRepo,
			teamRepo:    teamRepo,
			authRepo:    authRepo,
			cfg:         cfg,
			notifSvc:    notifSvc,
		}
	}
	
	func (s *service) Create(ctx context.Context, userID int, req *request.CreateProjectRequest) (*response.ProjectResponse, error) {

		user, err := s.authRepo.GetUserByID(ctx, userID)
		if err != nil {
			return nil, errors.New("user not found")
		}
		if user.RoleID != model.RoleIDTeamLead && user.RoleID != model.RoleIDAdmin {
	return nil, errors.New("only team leads and admins can create projects")
}

		isMember, err := s.orgRepo.IsMember(ctx, req.OrganizationID, userID)
		if err != nil || !isMember {
			isAdmin, adminErr := s.orgRepo.IsAdmin(ctx, req.OrganizationID, userID)
			if adminErr != nil || !isAdmin {
				return nil, errors.New("unauthorized: must be an organization member")
			}
		}
	
		if req.TeamID != nil && *req.TeamID > 0 {
			team, err := s.teamRepo.GetByID(ctx, *req.TeamID)
			if err != nil || team == nil {
				return nil, errors.New("team not found")
			}
			if team.OrganizationID != req.OrganizationID {
				return nil, errors.New("team does not belong to this organization")
			}
		}

		priority := req.Priority
		if priority == "" {
			priority = model.ProjectPriorityMedium
		}

		proj := &model.Project{
			OrganizationID: req.OrganizationID,
			TeamID:         req.TeamID,
			Name:           req.Name,
			Description:    req.Description,
			Priority:       priority,
			StartDate:      req.StartDate,
			EndDate:        req.EndDate,
			CreatedBy:      userID,
			Status:         model.ProjectStatusActive,
			IsActive:       true,
		}

		if err := s.projectRepo.Create(ctx, proj); err != nil {
			return nil, err
		}

		creatorMember := &model.ProjectMember{
			ProjectID: proj.ID,
			UserID:    userID,
			Role:      model.ProjectRoleAdmin,
			IsActive:  true,
		}
		if err := s.projectRepo.AddMember(ctx, creatorMember); err != nil {
			return nil, err
		}

		var orgMembers []model.OrganizationMember
		if members, err := s.orgRepo.GetMembers(ctx, req.OrganizationID); err == nil {
			orgMembers = members
			for _, m := range orgMembers {
				if m.UserID == userID {
					continue
				}
				pm := &model.ProjectMember{
					ProjectID: proj.ID,
					UserID:    m.UserID,
					Role:      model.ProjectRoleMember,
					IsActive:  true,
				}
				_ = s.projectRepo.AddMember(ctx, pm)
			}
		}

		if s.notifSvc != nil {
			_ = s.notifSvc.NotifyUser(
				ctx,
				userID,
				model.TypeProjectCreated,
				"Project Created",
				fmt.Sprintf("Your project '%s' has been created.", proj.Name),
				fmt.Sprintf("/projects/%d", proj.ID),
				map[string]interface{}{"project_id": proj.ID, "name": proj.Name},
			)

			for _, m := range orgMembers {
				if m.UserID == userID {
					continue
				}
				_ = s.notifSvc.NotifyUser(
					ctx,
					m.UserID,
					model.TypeProjectCreated,
					"New Project in Your Org",
					fmt.Sprintf("Project '%s' was created by %s.", proj.Name, user.Name),
					fmt.Sprintf("/projects/%d", proj.ID),
					map[string]interface{}{
						"project_id":      proj.ID,
						"name":            proj.Name,
						"organization_id": req.OrganizationID,
					},
				)
			}
		}

		return s.mapToResponse(proj), nil
	}

	func (s *service) GetByID(ctx context.Context, userID int, projectID int) (*response.ProjectDetailResponse, error) {
		isMember, err := s.projectRepo.IsMember(ctx, projectID, userID)
		if err != nil || !isMember {
			return nil, errors.New("unauthorized: must be a project member")
		}

		proj, err := s.projectRepo.GetByID(ctx, projectID)
		if err != nil {
			return nil, err
		}

		members, err := s.projectRepo.GetMembers(ctx, projectID)
		if err != nil {
			return nil, err
		}

		taskCount, _ := s.projectRepo.GetTaskCount(ctx, projectID)

		return s.mapToDetailResponse(proj, members, taskCount), nil
	}

	func (s *service) GetByOrganization(ctx context.Context, userID, orgID int, page, limit int) ([]response.ProjectResponse, int64, error) {
		isMember, err := s.orgRepo.IsMember(ctx, orgID, userID)
		if err != nil || !isMember {
			return nil, 0, errors.New("unauthorized: must be an organization member")
		}

		offset := (page - 1) * limit
		projects, total, err := s.projectRepo.GetByOrganization(ctx, orgID, limit, offset)
		if err != nil {
			return nil, 0, err
		}

		result := make([]response.ProjectResponse, len(projects))
		for i, p := range projects {
			taskCount, _ := s.projectRepo.GetTaskCount(ctx, p.ID)
			result[i] = *s.mapToResponseWithCount(&p, taskCount)
		}

		return result, total, nil
	}

	func (s *service) GetByUser(ctx context.Context, userID int, page, limit int) ([]response.ProjectResponse, int64, error) {
		offset := (page - 1) * limit
		projects, total, err := s.projectRepo.GetByUser(ctx, userID, limit, offset)
		if err != nil {
			return nil, 0, err
		}

		result := make([]response.ProjectResponse, len(projects))
		for i, p := range projects {
			taskCount, _ := s.projectRepo.GetTaskCount(ctx, p.ID)
			result[i] = *s.mapToResponseWithCount(&p, taskCount)
		}

		return result, total, nil
	}

	func (s *service) Update(ctx context.Context, userID int, projectID int, req *request.UpdateProjectRequest) (*response.ProjectResponse, error) {
		isAdmin, err := s.projectRepo.IsAdmin(ctx, projectID, userID)
		if err != nil || !isAdmin {
			return nil, errors.New("unauthorized: admin role required")
		}

		proj, err := s.projectRepo.GetByID(ctx, projectID)
		if err != nil {
			return nil, err
		}

		previousStatus := proj.Status

		if req.Name != "" {
			proj.Name = req.Name
		}
		if req.Description != "" {
			proj.Description = req.Description
		}
		if req.Status != "" {
			proj.Status = req.Status
		}
		if req.Priority != "" {
			proj.Priority = strings.ToLower(req.Priority)
		}
		if req.StartDate != nil {
			proj.StartDate = req.StartDate
		}
		if req.EndDate != nil {
			proj.EndDate = req.EndDate
		}
		if req.TeamID != nil {
			proj.TeamID = req.TeamID
		}

		if err := s.projectRepo.Update(ctx, proj); err != nil {
			return nil, err
		}

		if previousStatus != model.ProjectStatusCompleted && proj.Status == model.ProjectStatusCompleted && s.notifSvc != nil {
			members, _ := s.projectRepo.GetMembers(ctx, projectID)
			for _, m := range members {
				_ = s.notifSvc.NotifyUser(
					ctx,
					m.UserID,
					model.TypeProjectCompleted,
					"Project Completed",
					fmt.Sprintf("Project '%s' has been marked as completed.", proj.Name),
					fmt.Sprintf("/projects/%d", proj.ID),
					map[string]interface{}{"project_id": proj.ID, "name": proj.Name},
				)
			}
		}

		return s.mapToResponse(proj), nil
	}

	func (s *service) Delete(ctx context.Context, userID int, projectID int) error {
		isAdmin, err := s.projectRepo.IsAdmin(ctx, projectID, userID)
		if err != nil || !isAdmin {
			return errors.New("unauthorized: admin role required")
		}

		return s.projectRepo.Delete(ctx, projectID)
	}

	func (s *service) AddMember(ctx context.Context, userID int, projectID int, req *request.AddProjectMemberRequest) (*response.ProjectMemberResponse, error) {
		isAdmin, err := s.projectRepo.IsAdmin(ctx, projectID, userID)
		if err != nil || !isAdmin {
			return nil, errors.New("unauthorized: admin role required")
		}

		proj, err := s.projectRepo.GetByID(ctx, projectID)
		if err != nil {
			return nil, errors.New("project not found")
		}

		isOrgMember, err := s.orgRepo.IsMember(ctx, proj.OrganizationID, req.UserID)
		if err != nil || !isOrgMember {
			return nil, errors.New("user is not a member of the organization")
		}

		targetUser, err := s.authRepo.GetUserByID(ctx, req.UserID)
		if err != nil {
			return nil, errors.New("user not found")
		}

		member := &model.ProjectMember{
			ProjectID: projectID,
			UserID:    req.UserID,
			Role:      req.Role,
			IsActive:  true,
		}

		if err := s.projectRepo.AddMember(ctx, member); err != nil {
			return nil, err
		}

		member.User = *targetUser

		if s.notifSvc != nil {
			_ = s.notifSvc.NotifyUser(
				ctx,
				req.UserID,
				model.TypeMemberAdded,
				"Added to Project",
				fmt.Sprintf("You have been added to project '%s'.", proj.Name),
				fmt.Sprintf("/projects/%d", projectID),
				map[string]interface{}{"project_id": projectID, "role": req.Role},
			)
		}

		return s.mapToMemberResponse(member), nil
	}

	func (s *service) GetMembers(ctx context.Context, userID int, projectID int) ([]response.ProjectMemberResponse, error) {
		isMember, err := s.projectRepo.IsMember(ctx, projectID, userID)
		if err != nil || !isMember {
			return nil, errors.New("unauthorized: must be a project member")
		}

		members, err := s.projectRepo.GetMembers(ctx, projectID)
		if err != nil {
			return nil, err
		}

		result := make([]response.ProjectMemberResponse, len(members))
		for i, m := range members {
			result[i] = *s.mapToMemberResponse(&m)
		}

		return result, nil
	}

	func (s *service) UpdateMemberRole(ctx context.Context, userID int, projectID, memberID int, role string) error {
		isAdmin, err := s.projectRepo.IsAdmin(ctx, projectID, userID)
		if err != nil || !isAdmin {
			return errors.New("unauthorized: admin role required")
		}

		member, err := s.projectRepo.GetMemberByID(ctx, projectID, memberID)
		if err != nil {
			return err
		}
		if member.UserID == userID {
			return errors.New("cannot change your own role")
		}

		return s.projectRepo.UpdateMemberRole(ctx, projectID, memberID, role)
	}

	func (s *service) RemoveMember(ctx context.Context, userID int, projectID, memberID int) error {
		isAdmin, err := s.projectRepo.IsAdmin(ctx, projectID, userID)
		if err != nil || !isAdmin {
			return errors.New("unauthorized: admin role required")
		}

		member, err := s.projectRepo.GetMemberByID(ctx, projectID, memberID)
		if err != nil {
			return err
		}
		if member.UserID == userID {
			return errors.New("cannot remove yourself")
		}

		return s.projectRepo.RemoveMember(ctx, projectID, memberID)
	}

	func (s *service) mapToResponse(project *model.Project) *response.ProjectResponse {
		resp := &response.ProjectResponse{
			ID:             project.ID,
			OrganizationID: project.OrganizationID,
			TeamID:         project.TeamID,
			Name:           project.Name,
			Description:    project.Description,
			Status:         project.Status,
			Priority:       project.Priority,
			StartDate:      project.StartDate,
			EndDate:        project.EndDate,
			CreatedBy:      project.CreatedBy,
			IsActive:       project.IsActive,
			CreatedAt:      project.CreatedAt,
			UpdatedAt:      project.UpdatedAt,
		}
		if project.Team != nil {
			resp.TeamName = project.Team.Name
		}
		return resp
	}

	func (s *service) mapToResponseWithCount(project *model.Project, taskCount int64) *response.ProjectResponse {
		resp := s.mapToResponse(project)
		resp.TaskCount = int(taskCount)
		return resp
	}

	func (s *service) mapToDetailResponse(project *model.Project, members []model.ProjectMember, taskCount int64) *response.ProjectDetailResponse {
		memberResponses := make([]response.ProjectMemberResponse, len(members))
		for i, m := range members {
			memberResponses[i] = *s.mapToMemberResponse(&m)
		}

		base := s.mapToResponseWithCount(project, taskCount)

		return &response.ProjectDetailResponse{
			ProjectResponse: *base,
			Members:         memberResponses,
		}
	}

	func (s *service) mapToMemberResponse(member *model.ProjectMember) *response.ProjectMemberResponse {
		return &response.ProjectMemberResponse{
			ID:        member.ID,
			ProjectID: member.ProjectID,
			UserID:    member.UserID,
			UserName:  member.User.Name,
			UserEmail: member.User.Email,
			Role:      member.Role,
			JoinedAt:  member.JoinedAt,
		}
	}