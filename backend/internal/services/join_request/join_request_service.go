package join_request

import (
	"context"
	"errors"
	"strconv"
	"time"

	"devSync/config"
	joinRequestRequest "devSync/internal/dto/request"
	joinRequestResponse "devSync/internal/dto/response"
	"devSync/internal/model"
	authRepo "devSync/internal/repositories/auth"
	joinRequestRepo "devSync/internal/repositories/join_request"
	orgRepo "devSync/internal/repositories/organization"
	notifService "devSync/internal/services/notification"
)

type Service interface {
	Create(ctx context.Context, userID, orgID int, req *joinRequestRequest.CreateJoinRequestRequest) (*joinRequestResponse.JoinRequestResponse, error)
	MyRequests(ctx context.Context, userID int, page, limit int) ([]joinRequestResponse.JoinRequestResponse, int64, error)
	Cancel(ctx context.Context, userID, requestID int) error

	ListForOrg(ctx context.Context, reviewerID, orgID int, status string, page, limit int) ([]joinRequestResponse.JoinRequestResponse, int64, error)
	Review(ctx context.Context, reviewerID, orgID, requestID int, status string) error
}

type service struct {
	repo     joinRequestRepo.Repository
	orgRepo  orgRepo.Repository
	authRepo authRepo.Repository
	notifSvc notifService.Service
	cfg      *config.AppConfig
}

func NewService(
	repo joinRequestRepo.Repository,
	orgRepo orgRepo.Repository,
	authRepo authRepo.Repository,
	notifSvc notifService.Service,
	cfg *config.AppConfig,
) Service {
	return &service{repo: repo, orgRepo: orgRepo, authRepo: authRepo, notifSvc: notifSvc, cfg: cfg}
}

// ---------- Developer ----------

func (s *service) Create(ctx context.Context, userID, orgID int, req *joinRequestRequest.CreateJoinRequestRequest) (*joinRequestResponse.JoinRequestResponse, error) {
	user, err := s.authRepo.GetUserByID(ctx, userID)
	if err != nil || user == nil {
		return nil, errors.New("user not found")
	}

	org, err := s.orgRepo.GetByID(ctx, orgID)
	if err != nil || org == nil {
		return nil, errors.New("organization not found")
	}

	isMember, err := s.orgRepo.IsMember(ctx, orgID, userID)
	if err != nil {
		return nil, err
	}
	if isMember {
		return nil, errors.New("you are already a member of this organization")
	}

	existing, err := s.repo.GetPendingByOrgAndUser(ctx, orgID, userID)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, errors.New("you already have a pending request for this organization")
	}

	jr := &model.OrganizationJoinRequest{
		OrganizationID: orgID,
		UserID:         userID,
		Message:        req.Message,
		Status:         model.JoinRequestPending,
	}
	if err := s.repo.Create(ctx, jr); err != nil {
		return nil, err
	}

	// Notify all org admins
	if s.notifSvc != nil {
		admins, _ := s.orgRepo.GetMembers(ctx, orgID)
		for _, m := range admins {
			if m.Role != model.OrgRoleAdmin {
				continue
			}
			_ = s.notifSvc.NotifyUser(
				ctx,
				m.UserID,
				"join_request.created",
				"New join request",
				user.Name+" wants to join "+org.Name,
				"/organizations/"+strconv.Itoa(orgID)+"/join-requests",
				map[string]interface{}{"organization_id": orgID, "user_id": userID, "request_id": jr.ID},
			)
		}
	}

	return toResponse(jr, user, org), nil
}

func (s *service) MyRequests(ctx context.Context, userID int, page, limit int) ([]joinRequestResponse.JoinRequestResponse, int64, error) {
	rows, total, err := s.repo.List(ctx, joinRequestRepo.ListQuery{
		UserID: userID,
		Page:   page,
		Limit:  limit,
	})
	if err != nil {
		return nil, 0, err
	}

	out := make([]joinRequestResponse.JoinRequestResponse, len(rows))
	for i, r := range rows {
		out[i] = *toResponse(&r, nil, nil)
	}
	return out, total, nil
}

func (s *service) Cancel(ctx context.Context, userID, requestID int) error {
	jr, err := s.repo.GetByID(ctx, requestID)
	if err != nil || jr == nil {
		return errors.New("request not found")
	}
	if jr.UserID != userID {
		return errors.New("you can only cancel your own requests")
	}
	if jr.Status != model.JoinRequestPending {
		return errors.New("only pending requests can be cancelled")
	}
	jr.Status = model.JoinRequestRejected
	return s.repo.Update(ctx, jr)
}

// ---------- Team lead ----------

func (s *service) ListForOrg(ctx context.Context, reviewerID, orgID int, status string, page, limit int) ([]joinRequestResponse.JoinRequestResponse, int64, error) {
	if !s.isOrgAdmin(ctx, orgID, reviewerID) {
		return nil, 0, errors.New("unauthorized: only org admins can review requests")
	}

	rows, total, err := s.repo.List(ctx, joinRequestRepo.ListQuery{
		OrganizationID: orgID,
		Status:         status,
		Page:           page,
		Limit:          limit,
	})
	if err != nil {
		return nil, 0, err
	}

	out := make([]joinRequestResponse.JoinRequestResponse, len(rows))
	for i, r := range rows {
		out[i] = *toResponse(&r, nil, nil)
	}
	return out, total, nil
}

func (s *service) Review(ctx context.Context, reviewerID, orgID, requestID int, status string) error {
	if !s.isOrgAdmin(ctx, orgID, reviewerID) {
		return errors.New("unauthorized: only org admins can review requests")
	}
	if status != model.JoinRequestApproved && status != model.JoinRequestRejected {
		return errors.New("invalid status")
	}

	jr, err := s.repo.GetByID(ctx, requestID)
	if err != nil || jr == nil {
		return errors.New("request not found")
	}
	if jr.OrganizationID != orgID {
		return errors.New("request does not belong to this organization")
	}
	if jr.Status != model.JoinRequestPending {
		return errors.New("this request has already been reviewed")
	}

	if status == model.JoinRequestApproved {
		member := &model.OrganizationMember{
			OrganizationID: orgID,
			UserID:         jr.UserID,
			Role:           model.OrgRoleDeveloper,
			IsActive:       true,
		}
		if err := s.orgRepo.AddMember(ctx, member); err != nil {
			return err
		}
	}

	jr.Status = status
	jr.ReviewedBy = &reviewerID
	now := time.Now()
	jr.ReviewedAt = &now
	if err := s.repo.Update(ctx, jr); err != nil {
		return err
	}

	if s.notifSvc != nil {
		title := "Join request approved"
		content := "Your request to join " + jr.Organization.Name + " was approved"
		if status == model.JoinRequestRejected {
			title = "Join request rejected"
			content = "Your request to join " + jr.Organization.Name + " was rejected"
		}
		_ = s.notifSvc.NotifyUser(
			ctx,
			jr.UserID,
			"join_request."+status,
			title,
			content,
			"/organizations",
			map[string]interface{}{"organization_id": orgID, "status": status},
		)
	}

	return nil
}

// ---------- helpers ----------

func (s *service) isOrgAdmin(ctx context.Context, orgID, userID int) bool {
	member, err := s.orgRepo.GetMember(ctx, orgID, userID)
	if err == nil && member != nil && member.IsActive && member.Role == model.OrgRoleAdmin {
		return true
	}

	// Global team leads and admins manage join requests across organizations,
	// even when they do not hold a membership in the target organization.
	user, err := s.authRepo.GetUserByID(ctx, userID)
	if err != nil || user == nil {
		return false
	}
	return user.RoleID == model.RoleIDTeamLead || user.RoleID == model.RoleIDAdmin
}

func toResponse(jr *model.OrganizationJoinRequest, u *model.User, o *model.Organization) *joinRequestResponse.JoinRequestResponse {
	resp := &joinRequestResponse.JoinRequestResponse{
		ID:             jr.ID,
		OrganizationID: jr.OrganizationID,
		UserID:         jr.UserID,
		Message:        jr.Message,
		Status:         jr.Status,
		ReviewedBy:     jr.ReviewedBy,
		ReviewedAt:     jr.ReviewedAt,
		CreatedAt:      jr.CreatedAt,
		UpdatedAt:      jr.UpdatedAt,
	}
	if u != nil {
		resp.User = &joinRequestResponse.JoinRequestUserSummary{ID: u.ID, Name: u.Name, Email: u.Email}
	} else if jr.User.ID != 0 {
		resp.User = &joinRequestResponse.JoinRequestUserSummary{ID: jr.User.ID, Name: jr.User.Name, Email: jr.User.Email}
	}
	if o != nil {
		resp.Organization = &joinRequestResponse.JoinRequestOrgSummary{
			ID: o.ID, Name: o.Name, Slug: o.Slug, Description: o.Description,
		}
	} else if jr.Organization.ID != 0 {
		resp.Organization = &joinRequestResponse.JoinRequestOrgSummary{
			ID: jr.Organization.ID, Name: jr.Organization.Name, Slug: jr.Organization.Slug,
			Description: jr.Organization.Description,
		}
	}
	return resp
}
