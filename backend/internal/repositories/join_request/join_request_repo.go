package join_request

import (
	"context"

	"devSync/internal/model"
)

type ListQuery struct {
	OrganizationID int
	UserID         int
	Status         string
	Page           int
	Limit          int
}

type Repository interface {
	Create(ctx context.Context, req *model.OrganizationJoinRequest) error
	GetByID(ctx context.Context, id int) (*model.OrganizationJoinRequest, error)
	GetPendingByOrgAndUser(ctx context.Context, orgID, userID int) (*model.OrganizationJoinRequest, error)
	List(ctx context.Context, q ListQuery) ([]model.OrganizationJoinRequest, int64, error)
	Update(ctx context.Context, req *model.OrganizationJoinRequest) error
	CountPendingForOrg(ctx context.Context, orgID int) (int64, error)
}