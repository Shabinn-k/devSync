package response

import "time"

type AdminUserResponse struct {
	ID          int        `json:"id"`
	Name        string     `json:"name"`
	Email       string     `json:"email"`
	RoleID      int        `json:"role_id"`
	Role        string     `json:"role"`
	IsVerified  bool       `json:"is_verified"`
	IsActive    bool       `json:"is_active"`
	LastLoginAt *time.Time `json:"last_login_at"`
	CreatedAt   time.Time  `json:"created_at"`
}

type AdminUserDetailResponse struct {
	AdminUserResponse
	OrgCount     int `json:"org_count"`
	TeamCount    int `json:"team_count"`
	ProjectCount int `json:"project_count"`
	TaskCount    int `json:"task_count"`
}

type AdminOrganizationResponse struct {
	ID           int       `json:"id"`
	Name         string    `json:"name"`
	Slug         string    `json:"slug"`
	Description  string    `json:"description"`
	CreatedBy    int       `json:"created_by"`
	OwnerName    string    `json:"owner_name"`
	OwnerEmail   string    `json:"owner_email"`
	MemberCount  int       `json:"member_count"`
	TeamCount    int       `json:"team_count"`
	ProjectCount int       `json:"project_count"`
	IsActive     bool      `json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type AdminStatsUsers struct {
	Total       int64 `json:"total"`
	Active      int64 `json:"active"`
	NewThisWeek int64 `json:"new_this_week"`
}

type AdminStatsOrganizations struct {
	Total  int64 `json:"total"`
	Active int64 `json:"active"`
}

type AdminStatsTeams struct {
	Total int64 `json:"total"`
}

type AdminStatsProjects struct {
	Total int64 `json:"total"`
}

type AdminStatsTasks struct {
	Total      int64 `json:"total"`
	Completed  int64 `json:"completed"`
	InProgress int64 `json:"in_progress"`
}

type AdminActivityItem struct {
	Type        string    `json:"type"`
	Description string    `json:"description"`
	Timestamp   time.Time `json:"timestamp"`
}

type AdminStatsResponse struct {
	Users         AdminStatsUsers         `json:"users"`
	Organizations AdminStatsOrganizations `json:"organizations"`
	Teams         AdminStatsTeams         `json:"teams"`
	Projects      AdminStatsProjects      `json:"projects"`
	Tasks         AdminStatsTasks         `json:"tasks"`
	RecentActivity []AdminActivityItem    `json:"recent_activity"`
}