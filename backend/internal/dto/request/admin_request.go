package request

type AdminUpdateUserRoleRequest struct {
	RoleID int `json:"role_id" validate:"required,oneof=1 2 3"`
}

type AdminUpdateUserStatusRequest struct {
	IsActive bool `json:"is_active"`
}

type AdminUpdateOrgStatusRequest struct {
	IsActive bool `json:"is_active"`
}

type AdminTransferOwnershipRequest struct {
	NewOwnerID int `json:"new_owner_id" validate:"required"`
}
 
type AdminListUsersQuery struct {
	Page     int
	Limit    int
	Search   string
	RoleID   int 
	IsActive *bool
}
 
type AdminListOrgsQuery struct {
	Page     int
	Limit    int
	Search   string
	IsActive *bool
}