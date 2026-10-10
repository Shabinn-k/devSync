package chat

import (
	"context"
	"errors"
	"fmt"

	"devSync/config"
	"devSync/internal/dto/request"
	"devSync/internal/dto/response"
	"devSync/internal/model"
	"devSync/internal/repositories/auth"
	"devSync/internal/repositories/chat"
	"devSync/internal/repositories/organization"
	"devSync/internal/repositories/project"
	teamRepo "devSync/internal/repositories/team"
	"gorm.io/gorm"
)

type Broadcaster interface {
	SendToUser(userID int, event string, data interface{})
}

type Service interface {
	ListDMCandidates(ctx context.Context, currentUserID int) ([]response.UserSummary, error)
	CreateChannel(ctx context.Context, userID int, req *request.CreateChannelRequest) (*response.ChatChannelResponse, error)
	GetDirectChannel(ctx context.Context, userID, recipientID int) (*response.ChatChannelResponse, error)
	GetUserChannels(ctx context.Context, userID int) ([]response.ChatChannelResponse, error)
	GetChannelByID(ctx context.Context, userID, channelID int) (*response.ChatChannelResponse, error)
	SendMessage(ctx context.Context, userID, channelID int, req *request.SendMessageRequest) (*response.ChatMessageResponse, error)
	GetChannelMessages(ctx context.Context, userID, channelID, page, limit int) ([]response.ChatMessageResponse, int64, error)
}

type service struct {
	chatRepo    chat.Repository
	authRepo    auth.Repository
	orgRepo     organization.Repository
	projRepo    project.Repository
	teamRepo    teamRepo.Repository
	broadcaster Broadcaster
	cfg         *config.AppConfig
}

func NewService(
	chatRepo chat.Repository,
	authRepo auth.Repository,
	orgRepo organization.Repository,
	projRepo project.Repository,
	teams teamRepo.Repository,
	broadcaster Broadcaster,
	cfg *config.AppConfig,
) Service {
	return &service{
		chatRepo:    chatRepo,
		authRepo:    authRepo,
		orgRepo:     orgRepo,
		projRepo:    projRepo,
		teamRepo:    teams,
		broadcaster: broadcaster,
		cfg:         cfg,
	}
}

func (s *service) CreateChannel(ctx context.Context, userID int, req *request.CreateChannelRequest) (*response.ChatChannelResponse, error) {
	if req.Type == model.ChatTypeDirect {
		if req.RecipientID == nil || *req.RecipientID == userID {
			return nil, errors.New("invalid direct chat recipient")
		}
		return s.GetDirectChannel(ctx, userID, *req.RecipientID)
	}
	if req.Name == "" || len([]rune(req.Name)) > 100 {
		return nil, errors.New("channel name must contain 1 to 100 characters")
	}
	switch req.Type {
	case model.ChatTypeOrg:
		if req.OrganizationID == nil || req.ProjectID != nil || req.TeamID != nil {
			return nil, errors.New("an organization channel requires only organization_id")
		}
		org, err := s.orgRepo.GetByID(ctx, *req.OrganizationID)
		if err != nil || org == nil || !org.IsActive {
			return nil, errors.New("organization not found")
		}
		member, err := s.orgRepo.IsMember(ctx, org.ID, userID)
		if err != nil || !member {
			return nil, errors.New("organization membership required")
		}
	case model.ChatTypeProject:
		if req.ProjectID == nil || req.OrganizationID != nil || req.TeamID != nil {
			return nil, errors.New("a project channel requires only project_id")
		}
		proj, err := s.projRepo.GetByID(ctx, *req.ProjectID)
		if err != nil || proj == nil {
			return nil, errors.New("project not found")
		}
		member, err := s.projRepo.IsMember(ctx, proj.ID, userID)
		if err != nil || !member {
			return nil, errors.New("project membership required")
		}
	case model.ChatTypeTeam:
		if req.TeamID == nil || req.OrganizationID != nil || req.ProjectID != nil {
			return nil, errors.New("a team channel requires only team_id")
		}
		team, err := s.teamRepo.GetByID(ctx, *req.TeamID)
		if err != nil || team == nil || !team.IsActive {
			return nil, errors.New("team not found")
		}
		member, err := s.teamRepo.IsMember(ctx, team.ID, userID)
		if err != nil || !member {
			return nil, errors.New("team membership required")
		}
	default:
		return nil, errors.New("unsupported channel type")
	}

	channel := &model.ChatChannel{
		OrganizationID: req.OrganizationID,
		ProjectID:      req.ProjectID,
		TeamID:         req.TeamID,
		Name:           req.Name,
		Type:           req.Type,
		CreatedBy:      userID,
	}

	if err := s.chatRepo.CreateChannel(ctx, channel); err != nil {
		return nil, err
	}

	return s.mapChannelToResponse(channel), nil
}

func (s *service) GetDirectChannel(ctx context.Context, userID, recipientID int) (*response.ChatChannelResponse, error) {
	if recipientID <= 0 || recipientID == userID {
		return nil, errors.New("invalid direct chat recipient")
	}
	allowed, err := s.chatRepo.CanDirectMessage(ctx, userID, recipientID)
	if err != nil || !allowed {
		return nil, errors.New("direct messages are limited to active users who share an organization")
	}
	existing, err := s.chatRepo.FindDirectChannel(ctx, userID, recipientID)
	if err == nil && existing != nil {
		return s.mapChannelToResponse(existing), nil
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	recipient, err := s.authRepo.GetUserByID(ctx, recipientID)
	if err != nil {
		return nil, errors.New("recipient user not found")
	}

	currentUser, err := s.authRepo.GetUserByID(ctx, userID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	channelName := fmt.Sprintf("%s & %s", currentUser.Name, recipient.Name)
	channel, err := s.chatRepo.CreateDirectChannel(ctx, userID, recipientID, channelName)
	if err != nil {
		return nil, err
	}
	return s.mapChannelToResponse(channel), nil
}

func (s *service) ListDMCandidates(ctx context.Context, currentUserID int) ([]response.UserSummary, error) {
	users, err := s.chatRepo.ListDMCandidates(ctx, currentUserID)
	if err != nil {
		return nil, err
	}
	candidates := make([]response.UserSummary, 0, len(users))
	for _, user := range users {
		candidates = append(candidates, response.UserSummary{ID: user.ID, Name: user.Name, Email: user.Email})
	}
	return candidates, nil
}

func (s *service) GetUserChannels(ctx context.Context, userID int) ([]response.ChatChannelResponse, error) {
	channels, err := s.chatRepo.GetUserChannels(ctx, userID)
	if err != nil {
		return nil, err
	}

	res := make([]response.ChatChannelResponse, len(channels))
	for i := range channels {
		res[i] = *s.mapChannelToResponse(&channels[i])
	}
	return res, nil
}

func (s *service) GetChannelByID(ctx context.Context, userID, channelID int) (*response.ChatChannelResponse, error) {
	isMember, err := s.chatRepo.IsChannelMember(ctx, channelID, userID)
	if err != nil || !isMember {
		return nil, errors.New("unauthorized: not a channel member")
	}

	channel, err := s.chatRepo.GetChannelByID(ctx, channelID)
	if err != nil {
		return nil, err
	}

	return s.mapChannelToResponse(channel), nil
}

func (s *service) SendMessage(ctx context.Context, userID, channelID int, req *request.SendMessageRequest) (*response.ChatMessageResponse, error) {
	isMember, err := s.chatRepo.IsChannelMember(ctx, channelID, userID)
	if err != nil || !isMember {
		return nil, errors.New("unauthorized: not a member of this channel")
	}

	msg := &model.ChatMessage{
		ChannelID:     channelID,
		SenderID:      userID,
		Message:       req.Message,
		AttachmentURL: req.AttachmentURL,
	}

	if err := s.chatRepo.CreateMessage(ctx, msg); err != nil {
		return nil, err
	}
	if msg.Sender.ID == 0 {
		if user, err := s.authRepo.GetUserByID(ctx, userID); err == nil && user != nil {
			msg.Sender = *user
		}
	}

	msgRes := s.mapMessageToResponse(msg)

	if s.broadcaster != nil {
		payload := msgRes
		go func() {
			members, err := s.chatRepo.GetChannelMembers(context.Background(), channelID)
			if err == nil {
				for _, m := range members {
					s.broadcaster.SendToUser(m.UserID, "chat:message", payload)
				}
			}
		}()
	}

	return msgRes, nil
}

func (s *service) GetChannelMessages(ctx context.Context, userID, channelID, page, limit int) ([]response.ChatMessageResponse, int64, error) {
	isMember, err := s.chatRepo.IsChannelMember(ctx, channelID, userID)
	if err != nil || !isMember {
		return nil, 0, errors.New("unauthorized: not a member of this channel")
	}

	if limit <= 0 {
		limit = 50
	}
	if page <= 0 {
		page = 1
	}
	offset := (page - 1) * limit

	messages, total, err := s.chatRepo.GetChannelMessages(ctx, channelID, limit, offset)
	if err != nil {
		return nil, 0, err
	}

	res := make([]response.ChatMessageResponse, len(messages))
	for i := range messages {
		res[i] = *s.mapMessageToResponse(&messages[i])
	}
	return res, total, nil
}

func (s *service) mapChannelToResponse(c *model.ChatChannel) *response.ChatChannelResponse {
	memberResponses := make([]response.ChatMemberResponse, len(c.Members))
	for i, m := range c.Members {
		memberResponses[i] = response.ChatMemberResponse{
			ID:       m.ID,
			UserID:   m.UserID,
			UserName: m.User.Name,
			Email:    m.User.Email,
			JoinedAt: m.JoinedAt,
		}
	}

	return &response.ChatChannelResponse{
		ID:             c.ID,
		OrganizationID: c.OrganizationID,
		ProjectID:      c.ProjectID,
		Name:           c.Name,
		Type:           c.Type,
		CreatedBy:      c.CreatedBy,
		CreatedAt:      c.CreatedAt,
		UpdatedAt:      c.UpdatedAt,
		Members:        memberResponses,
	}
}

func (s *service) mapMessageToResponse(m *model.ChatMessage) *response.ChatMessageResponse {
	return &response.ChatMessageResponse{
		ID:            m.ID,
		ChannelID:     m.ChannelID,
		SenderID:      m.SenderID,
		SenderName:    m.Sender.Name,
		SenderEmail:   m.Sender.Email,
		Message:       m.Message,
		AttachmentURL: m.AttachmentURL,
		CreatedAt:     m.CreatedAt,
	}
}
