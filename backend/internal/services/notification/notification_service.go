package notification

import (
	"context"
	"encoding/json"
	"log"

	"devSync/config"
	"devSync/internal/model"
	notifRepo "devSync/internal/repositories/notification"
)

const (
	defaultPage  = 1
	defaultLimit = 20
	maxLimit     = 100
)

type Broadcaster interface {
	SendToUser(userID int, event string, data interface{})
}

type Service interface {
	CreateNotification(ctx context.Context, userID int, notifType, title, content, actionURL string, metadata map[string]interface{}) (*model.Notification, error)
	GetNotifications(ctx context.Context, userID int, page, limit int) ([]model.Notification, int64, error)
	GetUnreadCount(ctx context.Context, userID int) (int64, error)
	MarkAsRead(ctx context.Context, notificationID int, userID int) error
	MarkAllAsRead(ctx context.Context, userID int) error
	DeleteNotification(ctx context.Context, notificationID int, userID int) error
	NotifyUser(ctx context.Context, userID int, notificationType, title, content, actionURL string, metadata map[string]interface{}) error
}

type service struct {
	repo        notifRepo.Repository
	broadcaster Broadcaster
	cfg         *config.AppConfig
}

func NewService(repo notifRepo.Repository, broadcaster Broadcaster, cfg *config.AppConfig) Service {
	return &service{
		repo:        repo,
		broadcaster: broadcaster,
		cfg:         cfg,
	}
}

func (s *service) CreateNotification(ctx context.Context, userID int, notifType, title, content, actionURL string, metadata map[string]interface{}) (*model.Notification, error) {
	var metadataStr string
	if metadata != nil {
		if b, err := json.Marshal(metadata); err == nil {
			metadataStr = string(b)
		}
	}

	notification := &model.Notification{
		UserID:    userID,
		Type:      notifType,
		Title:     title,
		Content:   content,
		ActionURL: actionURL,
		Metadata:  metadataStr,
		IsRead:    false,
	}

	if err := s.repo.Create(ctx, notification); err != nil {
		return nil, err
	}

	return notification, nil
}

func (s *service) GetNotifications(ctx context.Context, userID int, page, limit int) ([]model.Notification, int64, error) {
	if page < 1 {
		page = defaultPage
	}
	if limit < 1 {
		limit = defaultLimit
	}
	if limit > maxLimit {
		limit = maxLimit
	}
	offset := (page - 1) * limit
	return s.repo.GetByUserID(ctx, userID, limit, offset)
}

func (s *service) GetUnreadCount(ctx context.Context, userID int) (int64, error) {
	return s.repo.GetUnreadCount(ctx, userID)
}

func (s *service) MarkAsRead(ctx context.Context, notificationID int, userID int) error {
	return s.repo.MarkAsRead(ctx, notificationID, userID)
}

func (s *service) MarkAllAsRead(ctx context.Context, userID int) error {
	return s.repo.MarkAllAsRead(ctx, userID)
}

func (s *service) DeleteNotification(ctx context.Context, notificationID int, userID int) error {
	return s.repo.Delete(ctx, notificationID, userID)
}

func (s *service) NotifyUser(ctx context.Context, userID int, notificationType, title, content, actionURL string, metadata map[string]interface{}) error {
	notification, err := s.CreateNotification(ctx, userID, notificationType, title, content, actionURL, metadata)
	if err != nil {
		log.Printf("notification: failed to persist notification for user %d: %v", userID, err)
		return err
	}

	if s.broadcaster == nil {
		return nil
	}
	
	func() {
		defer func() {
			if r := recover(); r != nil {
				log.Printf("notification: recovered panic broadcasting to user %d: %v", userID, r)
			}
		}()
		s.broadcaster.SendToUser(userID, "notification", notification)
	}()

	return nil
}

