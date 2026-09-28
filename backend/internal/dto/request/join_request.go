package request

type CreateJoinRequestRequest struct {
	Message string `json:"message" validate:"omitempty,max=500"`
}

type ReviewJoinRequestRequest struct {
	Status string `json:"status" validate:"required,oneof=approved rejected"`
}

type ListJoinRequestsQuery struct {
	Page   int
	Limit  int
	Status string
}