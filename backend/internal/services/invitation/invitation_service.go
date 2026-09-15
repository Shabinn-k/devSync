package invitation

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"log"
	"time"

	"gorm.io/gorm"

	"devSync/config"
	"devSync/internal/model"
	"devSync/internal/repositories/auth"
	"devSync/internal/repositories/invitations"
	"devSync/internal/repositories/organization"
	ws "devSync/internal/websocket"
	"devSync/utils/smtp"
)

type Service interface {
	CreateInvitation(ctx context.Context, userID, organizeID int, email, role string) (*model.OrganizationInvitation, error)
	AcceptInvitation(ctx context.Context, token string, userID int) error  
	DeclineInvitation(ctx context.Context, token string) error
	GetInvitation(ctx context.Context, token string) (*model.OrganizationInvitation, error)
	IsAdmin(ctx context.Context, organizeID, userID int) (bool, error)
}

type service struct {
	db             *gorm.DB
	invitationRepo invitation.Repository
	orgRepo        organization.Repository
	authRepo       auth.Repository
	cfg            *config.AppConfig
}

func NewService(
	db *gorm.DB,
	invitationRepo invitation.Repository,
	orgRepo organization.Repository,
	authRepo auth.Repository,
	cfg *config.AppConfig,
) Service {
	return &service{
		db:             db,
		invitationRepo: invitationRepo,
		orgRepo:        orgRepo,
		authRepo:       authRepo,
		cfg:            cfg,
	}
}

func (s *service) IsAdmin(ctx context.Context, organizeID, userID int) (bool, error) {
	member, err := s.orgRepo.GetMember(ctx, organizeID, userID)
	if err != nil {
		return false, err
	}
	return (member.Role == model.RoleAdmin || member.Role == model.RoleTeamLead) && member.IsActive, nil
}

func (s *service) CreateInvitation(ctx context.Context, userID, organizeID int, email, role string) (*model.OrganizationInvitation, error) {
	log.Printf("📨 Creating invitation for %s to org %d", email, organizeID)

	isAdmin, err := s.IsAdmin(ctx, organizeID, userID)
	if err != nil {
		log.Printf("Admin check failed: %v", err)
		return nil, errors.New("failed to verify permissions")
	}
	if !isAdmin {
		log.Printf("User %d is not admin/team_lead of org %d", userID, organizeID)
		return nil, errors.New("only admins and team leads can invite members")
	}

	existingUser, _ := s.authRepo.GetUserByEmail(ctx, email)
	if existingUser != nil {
		isMember, _ := s.orgRepo.IsMember(ctx, organizeID, existingUser.ID)
		if isMember {
			return nil, errors.New("user is already a member")
		}
	}

	token, err := generateToken()
	if err != nil {
		return nil, err
	}

	invitation := &model.OrganizationInvitation{
		OrganizationID: organizeID,
		Email:          email,
		Token:          token,
		Role:           role,
		Status:         model.InvitationStatusPending,
		ExpiresAt:      time.Now().Add(7 * 24 * time.Hour),
		CreatedBy:      userID,
	}

	if err := s.invitationRepo.Create(ctx, invitation); err != nil {
		log.Printf("Failed to create invitation in DB: %v", err)
		return nil, err
	}

	log.Printf("Invitation created with token: %s", token)

	if existingUser != nil {
		org, _ := s.orgRepo.GetByID(ctx, organizeID)
		orgName := "an organization"
		if org != nil && org.Name != "" {
			orgName = org.Name
		}

		actionURL := fmt.Sprintf("/invite?token=%s", token)
		notif := &model.Notification{
			UserID:    existingUser.ID,
			Type:      "organization.invitation",
			Title:     fmt.Sprintf("Invitation to %s", orgName),
			Content:   fmt.Sprintf("You have been invited to join %s as a %s", orgName, role),
			ActionURL: actionURL,
			IsRead:    false,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		if s.db != nil {
			if err := s.db.WithContext(ctx).Create(notif).Error; err != nil {
				log.Printf("Failed to insert notification into DB: %v", err)
			} else {
				log.Printf("Notification created for user %d (id: %d)", existingUser.ID, notif.ID)
			}
		}

		if hub := ws.GetGlobalHub(); hub != nil {
			hub.SendToUser(existingUser.ID, "notification", notif)
			log.Printf("Notification broadcasted over WebSocket to user %d", existingUser.ID)
		}
	}

	go s.sendInvitationEmail(context.Background(), invitation)

	return invitation, nil
}

func (s *service) AcceptInvitation(ctx context.Context, token string, userID int) error {
	log.Printf("User %d accepting invitation with token %s", userID, token)

	inv, err := s.invitationRepo.GetByToken(ctx, token)
	if err != nil {
		log.Printf("Failed to get invitation: %v", err)
		return err
	}

	if inv.Status != model.InvitationStatusPending {
		return errors.New("invitation already " + inv.Status)
	}

	user, err := s.authRepo.GetUserByID(ctx, userID)
	if err != nil {
		return errors.New("user not found")
	}

	if user.Email != inv.Email {
		return errors.New("invitation email does not match user email")
	}

	isMember, err := s.orgRepo.IsMember(ctx, inv.OrganizationID, userID)
	if err != nil {
		return err
	}
	if isMember {
		return errors.New("you are already a member of this organization")
	}

	member := &model.OrganizationMember{
		OrganizationID: inv.OrganizationID,
		UserID:         userID,
		Role:           inv.Role,
		IsActive:       true,
	}
	if err := s.orgRepo.AddMember(ctx, member); err != nil {
		log.Printf("Failed to add member: %v", err)
		return err
	}

	inv.Status = model.InvitationStatusAccepted
	now := time.Now()
	inv.UpdatedAt = now
	if err := s.invitationRepo.Update(ctx, inv); err != nil {
		log.Printf("Failed to update invitation: %v", err)
		return err
	}

	log.Printf("User %d successfully joined organization %d", userID, inv.OrganizationID)
	return nil
}

func (s *service) DeclineInvitation(ctx context.Context, token string) error {
	log.Printf("Declining invitation with token %s", token)

	inv, err := s.invitationRepo.GetByToken(ctx, token)
	if err != nil {
		return err
	}

	if inv.Status != model.InvitationStatusPending {
		return errors.New("invitation already " + inv.Status)
	}

	inv.Status = model.InvitationStatusDeclined
	inv.UpdatedAt = time.Now()
	return s.invitationRepo.Update(ctx, inv)
}

func (s *service) GetInvitation(ctx context.Context, token string) (*model.OrganizationInvitation, error) {
	inv, err := s.invitationRepo.GetByToken(ctx, token)
	if err != nil {
		return nil, err
	}
	return inv, nil
}

func (s *service) sendInvitationEmail(ctx context.Context, invitation *model.OrganizationInvitation) error {
	log.Printf("📧 Preparing invitation email for %s", invitation.Email)

	org, err := s.orgRepo.GetByID(ctx, invitation.OrganizationID)
	if err != nil || org == nil {
		log.Printf("❌ Failed to get organization: %v", err)
		return fmt.Errorf("organization not found: %v", err)
	}

	invitationLink := fmt.Sprintf("%s/invite?token=%s", s.cfg.FrontendURL, invitation.Token)
	log.Printf("🔗 Invitation link: %s", invitationLink)

subject := fmt.Sprintf("You've been invited to join %s", org.Name)

body := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Invitation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f5; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px 0 40px;">
              <div style="font-family: 'SF Mono', Consolas, monospace; font-size: 13px; font-weight: 600; color: #111; letter-spacing: 1.5px; text-transform: uppercase;">
                &lt;&gt; DevSync
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 24px 40px 8px 40px;">
              <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 600; color: #111; line-height: 1.3; letter-spacing: -0.01em;">
                You've been invited to join %s
              </h1>
              <p style="margin: 0 0 8px 0; font-size: 15px; line-height: 1.6; color: #52525b;">
                Hi there,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #52525b;">
                <strong style="color: #111;">%s</strong> has invited you to collaborate on DevSync. You'll be joining as a <strong style="color: #111;">%s</strong>.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 0 40px 8px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-radius: 8px; background-color: #111;">
                    <a href="%s"
                       style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                      Accept invitation
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Fallback text -->
          <tr>
            <td style="padding: 24px 40px 0 40px;">
              <p style="margin: 0 0 24px 0; font-size: 13px; line-height: 1.6; color: #71717a;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <div style="padding: 12px 16px; background-color: #f4f4f5; border-radius: 8px; font-family: 'SF Mono', Consolas, monospace; font-size: 12px; color: #3f3f46; word-break: break-all; line-height: 1.5;">
                %s
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="border-top: 1px solid #e4e4e7;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 32px 40px;">
              <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #a1a1aa;">
                If you didn't expect this email, you can safely ignore it.
              </p>
            </td>
          </tr>

        </table>

        <!-- Below-card footer -->
        <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="max-width: 520px;">
          <tr>
            <td style="padding: 24px 8px 0 8px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                Sent by DevSync &middot; The workspace for modern teams
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`, org.Name, org.Name, invitation.Role, invitationLink, invitationLink)

	if err := smtp.SendEmail(invitation.Email, subject, body); err != nil {
		log.Printf("Failed to send email: %v", err)
		return err
	}

	log.Printf("Invitation email sent to %s", invitation.Email)
	return nil
}

func generateToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}