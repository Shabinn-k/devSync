package invitation

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"time"

	"devSync/config"
	"devSync/internal/model"
	"devSync/internal/repositories/auth"
	"devSync/internal/repositories/invitation"
	"devSync/internal/repositories/organization"
	"devSync/utils/smtp"
)

type Service interface {
	CreateInvitation(ctx context.Context, userID, orgID int, email, role string) (*model.OrganizationInvitation, error)
	AcceptInvitation(ctx context.Context, token string, userID int) error
	DeclineInvitation(ctx context.Context, token string) error
	GetInvitation(ctx context.Context, token string) (*model.OrganizationInvitation, error)
}

type service struct {
	invitationRepo invitation.Repository
	orgRepo        organization.Repository
	authRepo       auth.Repository
	cfg            *config.AppConfig
}

func NewService(
	invitationRepo invitation.Repository,
	orgRepo organization.Repository,
	authRepo auth.Repository,
	cfg *config.AppConfig,
) Service {
	return &service{
		invitationRepo: invitationRepo,
		orgRepo:        orgRepo,
		authRepo:       authRepo,
		cfg:            cfg,
	}
}

func (s *service) CreateInvitation(ctx context.Context, userID, orgID int, email, role string) (*model.OrganizationInvitation, error) {
	// Check if user is admin
	isAdmin, err := s.orgRepo.IsAdmin(ctx, orgID, userID)
	if err != nil || !isAdmin {
		return nil, errors.New("unauthorized: admin role required")
	}

	// Check if user already exists
	existingUser, _ := s.authRepo.GetUserByEmail(ctx, email)
	if existingUser != nil {
		// Check if already a member
		isMember, _ := s.orgRepo.IsMember(ctx, orgID, existingUser.ID)
		if isMember {
			return nil, errors.New("user is already a member")
		}
	}

	// Generate unique token
	token, err := generateToken()
	if err != nil {
		return nil, err
	}

	invitation := &model.OrganizationInvitation{
		OrganizationID: orgID,
		Email:          email,
		Token:          token,
		Role:           role,
		Status:         model.InvitationStatusPending,
		ExpiresAt:      time.Now().Add(7 * 24 * time.Hour), // 7 days
		CreatedBy:      userID,
	}

	if err := s.invitationRepo.Create(ctx, invitation); err != nil {
		return nil, err
	}

	// Send invitation email
	go s.sendInvitationEmail(ctx, invitation)

	return invitation, nil
}

func (s *service) AcceptInvitation(ctx context.Context, token string, userID int) error {
	invitation, err := s.invitationRepo.GetByToken(ctx, token)
	if err != nil {
		return err
	}

	if invitation.Status != model.InvitationStatusPending {
		return errors.New("invitation already " + invitation.Status)
	}

	// Check if user email matches
	user, err := s.authRepo.GetUserByID(ctx, userID)
	if err != nil {
		return errors.New("user not found")
	}
	if user.Email != invitation.Email {
		return errors.New("invitation email does not match user email")
	}

	// Add user to organization
	member := &model.OrganizationMember{
		OrganizationID: invitation.OrganizationID,
		UserID:         userID,
		Role:           invitation.Role,
		IsActive:       true,
	}
	if err := s.orgRepo.AddMember(ctx, member); err != nil {
		return err
	}

	// Update invitation status
	invitation.Status = model.InvitationStatusAccepted
	return s.invitationRepo.Update(ctx, invitation)
}

func (s *service) DeclineInvitation(ctx context.Context, token string) error {
	invitation, err := s.invitationRepo.GetByToken(ctx, token)
	if err != nil {
		return err
	}

	if invitation.Status != model.InvitationStatusPending {
		return errors.New("invitation already " + invitation.Status)
	}

	invitation.Status = model.InvitationStatusDeclined
	return s.invitationRepo.Update(ctx, invitation)
}

func (s *service) GetInvitation(ctx context.Context, token string) (*model.OrganizationInvitation, error) {
	return s.invitationRepo.GetByToken(ctx, token)
}

func (s *service) sendInvitationEmail(ctx context.Context, invitation *model.OrganizationInvitation) {
	org, _ := s.orgRepo.GetByID(ctx, invitation.OrganizationID)
	if org == nil {
		return
	}

	acceptLink := fmt.Sprintf("%s/invite/accept?token=%s", s.cfg.FrontendURL, invitation.Token)
	declineLink := fmt.Sprintf("%s/invite/decline?token=%s", s.cfg.FrontendURL, invitation.Token)

	subject := fmt.Sprintf("Invitation to join %s on DevSync", org.Name)
	body := fmt.Sprintf(`
		<h2>You've been invited to join <strong>%s</strong> on DevSync!</h2>
		<p><strong>Role:</strong> %s</p>
		<p>Click the button below to accept or decline:</p>
		<a href="%s" style="background: #4F46E5; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-block; margin: 10px 0;">
			✅ Accept Invitation
		</a>
		<br>
		<a href="%s" style="color: #EF4444; text-decoration: underline;">
			❌ Decline Invitation
		</a>
		<p>This invitation expires in 7 days.</p>
	`, org.Name, invitation.Role, acceptLink, declineLink)

	_ = smtp.SendEmail(invitation.Email, subject, body)
}

func generateToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}