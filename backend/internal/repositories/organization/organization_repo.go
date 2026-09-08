package organization

import (
	"context"
	"errors"

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
	GetByID(ctx context.Context, id int) (*model.Organization, error)
	GetBySlug(ctx context.Context, slug string) (*model.Organization, error)
	Update(ctx context.Context, org *model.Organization) error
	Delete(ctx context.Context, id int) error
	List(ctx context.Context, userID int, limit, offset int) ([]model.Organization, int64, error)
	GetMemberCount(ctx context.Context, orgID int) (int64, error)

	AddMember(ctx context.Context, member *model.OrganizationMember) error
	GetMember(ctx context.Context, orgID, userID int) (*model.OrganizationMember, error)
	GetMemberByID(ctx context.Context, orgID, memberID int) (*model.OrganizationMember, error)
	GetMembers(ctx context.Context, orgID int) ([]model.OrganizationMember, error)
	UpdateMemberRole(ctx context.Context, orgID, memberID int, role string) error
	RemoveMember(ctx context.Context, orgID, memberID int) error
	IsMember(ctx context.Context, orgID, userID int) (bool, error)
	GetUserOrganizations(ctx context.Context, userID int) ([]model.Organization, error)
}

