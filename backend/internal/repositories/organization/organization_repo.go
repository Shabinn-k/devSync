package organization

import (
	"context"
	"errors"

	"github.com/google/uuid"

	"devSync/internal/model"
)

var (
	ErrNotFound          = errors.New("organization not found")
	ErrMemberNotFound    = errors.New("member not found")
	ErrDuplicateSlug     = errors.New("slug already taken")
	ErrUserAlreadyMember = errors.New("user is already a member")
)

type Repository interface {
	Create(ctx context.Context, org *model.Organization) error
	GetByID(ctx context.Context, id uuid.UUID) (*model.Organization, error)
	GetBySlug(ctx context.Context, slug string) (*model.Organization, error)
	Update(ctx context.Context, org *model.Organization) error
	Delete(ctx context.Context, id uuid.UUID) error
	List(ctx context.Context, userID uuid.UUID, limit, offset int) ([]model.Organization, int64, error)
	GetMemberCount(ctx context.Context, orgID uuid.UUID) (int64, error)

	AddMember(ctx context.Context, member *model.OrganizationMember) error
	GetMember(ctx context.Context, orgID, userID uuid.UUID) (*model.OrganizationMember, error)
	GetMemberByID(ctx context.Context, orgID, memberID uuid.UUID) (*model.OrganizationMember, error)
	GetMembers(ctx context.Context, orgID uuid.UUID) ([]model.OrganizationMember, error)
	UpdateMemberRole(ctx context.Context, orgID, memberID uuid.UUID, role string) error
	RemoveMember(ctx context.Context, orgID, memberID uuid.UUID) error
	IsMember(ctx context.Context, orgID, userID uuid.UUID) (bool, error)
	GetUserOrganizations(ctx context.Context, userID uuid.UUID) ([]model.Organization, error)
}
