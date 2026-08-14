package organization

import (
	"context"
	"errors"
	"strings"

	"github.com/google/uuid"

	"devSync/config"
	"devSync/internal/dto/request"
	"devSync/internal/dto/response"
	"devSync/internal/model"
	"devSync/internal/repositories/auth"
	"devSync/internal/repositories/organization"
)

type Service interface {
	Create(ctx context.Context, userID uuid.UUID, req *request.CreateOrganizationRequest) (*response.OrganizationResponse, error)
	GetByID(ctx context.Context, userID, id uuid.UUID) (*response.OrganizationDetailResponse, error)
	GetBySlug(ctx context.Context, slug string) (*response.OrganizationResponse, error)
	Update(ctx context.Context, userID, orgID uuid.UUID, req *request.UpdateOrganizationRequest) (*response.OrganizationResponse, error)
	Delete(ctx context.Context, userID, orgID uuid.UUID) error
	List(ctx context.Context, userID uuid.UUID, page, limit int) ([]response.OrganizationResponse, int64, error)

	AddMember(ctx context.Context, userID, orgID uuid.UUID, req *request.AddMemberRequest) (*response.OrganizationMemberResponse, error)
	GetMembers(ctx context.Context, userID, orgID uuid.UUID) ([]response.OrganizationMemberResponse, error)
	UpdateMemberRole(ctx context.Context, userID, orgID uuid.UUID, memberID uuid.UUID, role string) error
	RemoveMember(ctx context.Context, userID, orgID uuid.UUID, memberID uuid.UUID) error
	GetUserOrganizations(ctx context.Context, userID uuid.UUID) ([]response.OrganizationResponse, error)
}

type service struct {
	orgRepo  organization.Repository
	authRepo auth.Repository 
	cfg      *config.AppConfig
}

func NewService(orgRepo organization.Repository, authRepo auth.Repository, cfg *config.AppConfig) Service {
	return &service{
		orgRepo:  orgRepo,
		authRepo: authRepo,
		cfg:      cfg,
	}
}

func (s *service) Create(ctx context.Context, userID uuid.UUID, req *request.CreateOrganizationRequest) (*response.OrganizationResponse, error) {

	if _, err := s.orgRepo.GetBySlug(ctx, req.Slug); err == nil {
		return nil, organization.ErrDuplicateSlug
	}

	org := &model.Organization{
		Name:        req.Name,
		Slug:        strings.ToLower(req.Slug),
		Description: req.Description,
		Website:     req.Website,
		Location:    req.Location,
		CreatedBy:   userID,
		IsActive:    true,
	}

	if err := s.orgRepo.Create(ctx, org); err != nil {
		return nil, err
	}

	member := &model.OrganizationMember{
		OrganizationID: org.ID,
		UserID:         userID,
		Role:           model.RoleAdmin,
		IsActive:       true,
	}
	if err := s.orgRepo.AddMember(ctx, member); err != nil {
		return nil, err
	}

	return s.mapToResponse(org), nil
}

func (s *service) GetByID(ctx context.Context, userID, id uuid.UUID) (*response.OrganizationDetailResponse, error) {
	isMember, err := s.orgRepo.IsMember(ctx, id, userID)
	if err != nil || !isMember {
		return nil, errors.New("unauthorized: organization member required")
	}

	org, err := s.orgRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	members, err := s.orgRepo.GetMembers(ctx, id)
	if err != nil {
		return nil, err
	}

	return s.mapToDetailResponse(org, members), nil
}

func (s *service) GetBySlug(ctx context.Context, slug string) (*response.OrganizationResponse, error) {
	org, err := s.orgRepo.GetBySlug(ctx, slug)
	if err != nil {
		return nil, err
	}
	return s.mapToResponse(org), nil
}

func (s *service) Update(ctx context.Context, userID, orgID uuid.UUID, req *request.UpdateOrganizationRequest) (*response.OrganizationResponse, error) {
	if !s.isAdmin(ctx, orgID, userID) {
		return nil, errors.New("unauthorized: admin role required")
	}

	org, err := s.orgRepo.GetByID(ctx, orgID)
	if err != nil {
		return nil, err
	}

	if req.Name != "" {
		org.Name = req.Name
	}
	if req.Description != "" {
		org.Description = req.Description
	}
	if req.Website != "" {
		org.Website = req.Website
	}
	if req.Location != "" {
		org.Location = req.Location
	}

	if err := s.orgRepo.Update(ctx, org); err != nil {
		return nil, err
	}

	return s.mapToResponse(org), nil
}

func (s *service) Delete(ctx context.Context, userID, orgID uuid.UUID) error {
	if !s.isAdmin(ctx, orgID, userID) {
		return errors.New("unauthorized: admin role required")
	}
	return s.orgRepo.Delete(ctx, orgID)
}

func (s *service) List(ctx context.Context, userID uuid.UUID, page, limit int) ([]response.OrganizationResponse, int64, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit

	orgs, total, err := s.orgRepo.List(ctx, userID, limit, offset)
	if err != nil {
		return nil, 0, err
	}

	result := make([]response.OrganizationResponse, len(orgs))
	for i, org := range orgs {
		result[i] = *s.mapToResponse(&org)
	}

	return result, total, nil
}

func (s *service) AddMember(ctx context.Context, userID, orgID uuid.UUID, req *request.AddMemberRequest) (*response.OrganizationMemberResponse, error) {
	if !s.isAdmin(ctx, orgID, userID) {
		return nil, errors.New("unauthorized: admin role required")
	}

	var targetUserID uuid.UUID
	if req.UserID != "" {
		if parsed, err := uuid.Parse(req.UserID); err == nil {
			targetUserID = parsed
		}
	}

	if targetUserID == uuid.Nil && req.Email != "" {
		user, err := s.authRepo.GetUserByEmail(ctx, req.Email)
		if err != nil {
			return nil, errors.New("user not found with specified email")
		}
		targetUserID = user.ID
	}

	if targetUserID == uuid.Nil {
		return nil, errors.New("valid user ID or email is required")
	}

	user, err := s.authRepo.GetUserByID(ctx, targetUserID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	member := &model.OrganizationMember{
		OrganizationID: orgID,
		UserID:         targetUserID,
		Role:           req.Role,
		IsActive:       true,
	}

	if err := s.orgRepo.AddMember(ctx, member); err != nil {
		return nil, err
	}

	member.User = *user

	return s.mapToMemberResponse(member), nil
}

func (s *service) GetMembers(ctx context.Context, userID, orgID uuid.UUID) ([]response.OrganizationMemberResponse, error) {
	isMember, err := s.orgRepo.IsMember(ctx, orgID, userID)
	if err != nil || !isMember {
		return nil, errors.New("unauthorized: organization member required")
	}

	members, err := s.orgRepo.GetMembers(ctx, orgID)
	if err != nil {
		return nil, err
	}

	result := make([]response.OrganizationMemberResponse, len(members))
	for i, m := range members {
		result[i] = *s.mapToMemberResponse(&m)
	}

	return result, nil
}

func (s *service) UpdateMemberRole(ctx context.Context, userID, orgID uuid.UUID, memberID uuid.UUID, role string) error {
	if !s.isAdmin(ctx, orgID, userID) {
		return errors.New("unauthorized: admin role required")
	}

	member, err := s.orgRepo.GetMember(ctx, orgID, userID)
	if err != nil {
		return err
	}
	if member.ID == memberID {
		return errors.New("cannot change your own role")
	}

	return s.orgRepo.UpdateMemberRole(ctx, orgID, memberID, role)
}

func (s *service) RemoveMember(ctx context.Context, userID, orgID uuid.UUID, memberID uuid.UUID) error {
	if !s.isAdmin(ctx, orgID, userID) {
		return errors.New("unauthorized: admin role required")
	}

	member, err := s.orgRepo.GetMember(ctx, orgID, userID)
	if err != nil {
		return err
	}
	if member.ID == memberID {
		return errors.New("cannot remove yourself")
	}

	return s.orgRepo.RemoveMember(ctx, orgID, memberID)
}

func (s *service) GetUserOrganizations(ctx context.Context, userID uuid.UUID) ([]response.OrganizationResponse, error) {
	orgs, err := s.orgRepo.GetUserOrganizations(ctx, userID)
	if err != nil {
		return nil, err
	}

	result := make([]response.OrganizationResponse, len(orgs))
	for i, org := range orgs {
		result[i] = *s.mapToResponse(&org)
	}

	return result, nil
}


func (s *service) isAdmin(ctx context.Context, orgID, userID uuid.UUID) bool {
	member, err := s.orgRepo.GetMember(ctx, orgID, userID)
	if err != nil {
		return false
	}
	return member.Role == model.RoleAdmin && member.IsActive
}

func (s *service) mapToResponse(org *model.Organization) *response.OrganizationResponse {
	memberCount, _ := s.orgRepo.GetMemberCount(context.Background(), org.ID)
	
	return &response.OrganizationResponse{
		ID:          org.ID,
		Name:        org.Name,
		Slug:        org.Slug,
		Description: org.Description,
		LogoURL:     org.LogoURL,
		Website:     org.Website,
		Location:    org.Location,
		CreatedBy:   org.CreatedBy,
		MemberCount: int(memberCount),
		IsActive:    org.IsActive,
		CreatedAt:   org.CreatedAt,
		UpdatedAt:   org.UpdatedAt,
	}
}

func (s *service) mapToDetailResponse(org *model.Organization, members []model.OrganizationMember) *response.OrganizationDetailResponse {
	memberResponses := make([]response.OrganizationMemberResponse, len(members))
	for i, m := range members {
		memberResponses[i] = *s.mapToMemberResponse(&m)
	}

	return &response.OrganizationDetailResponse{
		OrganizationResponse: *s.mapToResponse(org),
		Members:              memberResponses,
	}
}

func (s *service) mapToMemberResponse(member *model.OrganizationMember) *response.OrganizationMemberResponse {
	return &response.OrganizationMemberResponse{
		ID:        member.ID,
		UserID:    member.UserID,
		UserName:  member.User.Name,
		UserEmail: member.User.Email,
		Role:      member.Role,
		JoinedAt:  member.JoinedAt,
	}
}

