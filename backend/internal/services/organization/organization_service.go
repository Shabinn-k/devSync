package organization

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"log"

	"devSync/config"
	"devSync/internal/dto/request"
	"devSync/internal/dto/response"
	"devSync/internal/model"
	"devSync/internal/repositories/auth"
	"devSync/internal/repositories/organization"
)

type Service interface {
	Create(ctx context.Context, userID int, req *request.CreateOrganizationRequest) (*response.OrganizationResponse, error)
	GetByID(ctx context.Context, userID, id int) (*response.OrganizationDetailResponse, error)
	GetBySlug(ctx context.Context, slug string) (*response.OrganizationResponse, error)
	Update(ctx context.Context, userID, organizeID int, req *request.UpdateOrganizationRequest) (*response.OrganizationResponse, error)
	Delete(ctx context.Context, userID, organizeID int) error
	List(ctx context.Context, userID int, page, limit int) ([]response.OrganizationResponse, int64, error)

	AddMember(ctx context.Context, userID, organizeID int, req *request.AddMemberRequest) (*response.OrganizationMemberResponse, error)
	GetMembers(ctx context.Context, userID, organizeID int) ([]response.OrganizationMemberResponse, error)
	UpdateMemberRole(ctx context.Context, userID, organizeID int, memberID int, role string) error
	RemoveMember(ctx context.Context, userID, organizeID int, memberID int) error
	GetUserOrganizations(ctx context.Context, userID int) ([]response.OrganizationResponse, error)
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

func (s *service) Create(ctx context.Context, userID int, req *request.CreateOrganizationRequest) (*response.OrganizationResponse, error) {
	user, err := s.authRepo.GetUserByID(ctx, userID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	if user.RoleID != model.RoleIDTeamLead && user.RoleID != model.RoleIDAdmin {
	return nil, errors.New("only team leads and admins can create organizations")
}

	slug := strings.TrimSpace(req.Slug)
	if slug == "" {
		slug = strings.ToLower(strings.ReplaceAll(strings.TrimSpace(req.Name), " ", "-"))
		var cleanSlug strings.Builder
		for _, r := range slug {
			if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-' {
				cleanSlug.WriteRune(r)
			}
		}
		slug = cleanSlug.String()
		if slug == "" {
			slug = fmt.Sprintf("org-%d", userID)
		}
	} else {
		slug = strings.ToLower(slug)
	}

	existing, _ := s.orgRepo.GetBySlug(ctx, slug)
	if existing != nil {
		return nil, errors.New("slug already taken")
	}

	org := &model.Organization{
		Name:        req.Name,
		Slug:        slug,
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
	Role:           model.OrgRoleAdmin,
	IsActive:       true,
}
	if err := s.orgRepo.AddMember(ctx, member); err != nil {
		s.orgRepo.Delete(ctx, org.ID)
		return nil, errors.New("failed to add creator as admin")
	}

	return s.mapToResponse(ctx, org), nil
}

func (s *service) GetByID(ctx context.Context, userID, id int) (*response.OrganizationDetailResponse, error) {
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

	return s.mapToDetailResponse(ctx, org, members), nil
}

func (s *service) GetBySlug(ctx context.Context, slug string) (*response.OrganizationResponse, error) {
	org, err := s.orgRepo.GetBySlug(ctx, slug)
	if err != nil {
		return nil, err
	}
	return s.mapToResponse(ctx, org), nil
}

func (s *service) Update(ctx context.Context, userID, organizeID int, req *request.UpdateOrganizationRequest) (*response.OrganizationResponse, error) {
	if !s.isAdmin(ctx, organizeID, userID) {
		return nil, errors.New("unauthorized: admin role required")
	}

	org, err := s.orgRepo.GetByID(ctx, organizeID)
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

	return s.mapToResponse(ctx, org), nil
}

func (s *service) Delete(ctx context.Context, userID, organizeID int) error {
	if !s.isAdmin(ctx, organizeID, userID) {
		return errors.New("unauthorized: admin role required")
	}
	return s.orgRepo.Delete(ctx, organizeID)
}

func (s *service) List(ctx context.Context, userID int, page, limit int) ([]response.OrganizationResponse, int64, error) {
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
		result[i] = *s.mapToResponse(ctx, &org)
	}

	return result, total, nil
}

func (s *service) AddMember(ctx context.Context, userID, organizeID int, req *request.AddMemberRequest) (*response.OrganizationMemberResponse, error) {
	if !s.isAdmin(ctx, organizeID, userID) {
		return nil, errors.New("unauthorized: admin role required")
	}

	var targetUserID int

	if req.UserID > 0 {
		targetUserID = req.UserID
	} else if req.Email != "" {
		user, err := s.authRepo.GetUserByEmail(ctx, req.Email)
		if err != nil {
			if err := s.sendInvitationEmail(ctx, req.Email, organizeID); err != nil {
				log.Printf("Failed to send invitation: %v", err)
				return nil, errors.New("user not found and invitation failed")
			}
			return nil, errors.New("invitation sent to email")
		}
		targetUserID = user.ID
	}

	if targetUserID <= 0 {
		return nil, errors.New("valid user ID or email is required")
	}

	user, err := s.authRepo.GetUserByID(ctx, targetUserID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	isMember, err := s.orgRepo.IsMember(ctx, organizeID, targetUserID)
	if err != nil {
		return nil, err
	}
	if isMember {
		return nil, errors.New("user is already a member")
	}

	member := &model.OrganizationMember{
		OrganizationID: organizeID,
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

func (s *service) sendInvitationEmail(ctx context.Context, email string, organizeID int) error {
	org, err := s.orgRepo.GetByID(ctx, organizeID)
	if err != nil {
		return err
	}

	invitationLink := fmt.Sprintf("%s/register?email=%s&org=%d", s.cfg.FrontendURL, email, organizeID)
	
	subject := fmt.Sprintf("Invitation to join %s on DevSync", org.Name)
	body := fmt.Sprintf(`
		<h2>You've been invited to join %s on DevSync!</h2>
		<p>Click the link below to create your account and join:</p>
		<a href="%s">%s</a>
		<p>This invitation will expire in 7 days.</p>
		<br>
		<p>Best regards,<br>The DevSync Team</p>
	`, org.Name, invitationLink, invitationLink)

	log.Printf("Sending invitation email to %s for org %d", email, organizeID)
	log.Printf("Subject: %s", subject)
	log.Printf("Body: %s", body)

	
	return nil
}
func (s *service) GetMembers(ctx context.Context, userID, organizeID int) ([]response.OrganizationMemberResponse, error) {
	isMember, err := s.orgRepo.IsMember(ctx, organizeID, userID)
	if err != nil || !isMember {
		return nil, errors.New("unauthorized: organization member required")
	}

	members, err := s.orgRepo.GetMembers(ctx, organizeID)
	if err != nil {
		return nil, err
	}

	result := make([]response.OrganizationMemberResponse, len(members))
	for i, m := range members {
		result[i] = *s.mapToMemberResponse(&m)
	}

	return result, nil
}

func (s *service) UpdateMemberRole(ctx context.Context, userID, organizeID int, memberID int, role string) error {
	if !s.isAdmin(ctx, organizeID, userID) {
		return errors.New("unauthorized: admin role required")
	}

	targetMember, err := s.orgRepo.GetMemberByID(ctx, organizeID, memberID)
	if err != nil {
		return err
	}

	if targetMember.UserID == userID {
		return errors.New("cannot change your own role")
	}

	return s.orgRepo.UpdateMemberRole(ctx, organizeID, memberID, role)
}

func (s *service) RemoveMember(ctx context.Context, userID, organizeID int, memberID int) error {
	if !s.isAdmin(ctx, organizeID, userID) {
		return errors.New("unauthorized: admin role required")
	}

	targetMember, err := s.orgRepo.GetMemberByID(ctx, organizeID, memberID)
	if err != nil {
		return err
	}

	if targetMember.UserID == userID {
		return errors.New("cannot remove yourself")
	}

	return s.orgRepo.RemoveMember(ctx, organizeID, memberID)
}

func (s *service) GetUserOrganizations(ctx context.Context, userID int) ([]response.OrganizationResponse, error) {
	orgs, err := s.orgRepo.GetUserOrganizations(ctx, userID)
	if err != nil {
		return nil, err
	}

	result := make([]response.OrganizationResponse, len(orgs))
	for i, org := range orgs {
		result[i] = *s.mapToResponse(ctx, &org)
	}

	return result, nil
}

func (s *service) isAdmin(ctx context.Context, organizeID, userID int) bool {
	isAdmin, err := s.orgRepo.IsAdmin(ctx, organizeID, userID)
	if err == nil && isAdmin {
		return true
	}
	member, err := s.orgRepo.GetMember(ctx, organizeID, userID)
	if err != nil {
		return false
	}
return (member.Role == model.OrgRoleAdmin || member.Role == model.OrgRoleTeamLead) && member.IsActive
}

func (s *service) mapToResponse(ctx context.Context, org *model.Organization) *response.OrganizationResponse {
	memberCount, _ := s.orgRepo.GetMemberCount(ctx, org.ID)

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

func (s *service) mapToDetailResponse(ctx context.Context, org *model.Organization, members []model.OrganizationMember) *response.OrganizationDetailResponse {
	memberResponses := make([]response.OrganizationMemberResponse, len(members))
	for i, m := range members {
		memberResponses[i] = *s.mapToMemberResponse(&m)
	}

	return &response.OrganizationDetailResponse{
		OrganizationResponse: *s.mapToResponse(ctx, org),
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