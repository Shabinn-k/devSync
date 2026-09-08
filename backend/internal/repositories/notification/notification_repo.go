package notification

import (
	"context"
	"errors"

	"devSync/internal/model"
)

var ErrNotFound = errors.New("notification not found")

type Repository interface {
	Create(ctx context.Context, notification *model.Notification) error
	GetByUserID(ctx context.Context, userID int, limit, offset int) ([]model.Notification, int64, error)
	GetUnreadCount(ctx context.Context, userID int) (int64, error)
	MarkAsRead(ctx context.Context, notificationID int, userID int) error
	MarkAllAsRead(ctx context.Context, userID int) error
	Delete(ctx context.Context, notificationID int, userID int) error
	DeleteOlderThan(ctx context.Context, days int) error
}

