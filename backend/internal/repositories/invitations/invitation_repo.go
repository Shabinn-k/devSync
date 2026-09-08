package invitation

import (
	"context"
	"errors"

	"gorm.io/gorm"
	"devSync/internal/model"
)

var (
	ErrInvitationNotFound = errors.New("invitation not found")
	ErrInvitationExpired  = errors.New("invitation expired")
)

type Repository interface {
	Create(ctx context.Context, invitation *model.OrganizationInvitation) error
	GetByToken(ctx context.Context, token string) (*model.OrganizationInvitation, error)
	Update(ctx context.Context, invitation *model.OrganizationInvitation) error
	Delete(ctx context.Context, id int) error
	DeleteExpired(ctx context.Context) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}