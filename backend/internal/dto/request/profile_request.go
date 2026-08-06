package request

type UpdateProfileRequest struct {
	Name       string `json:"name" validate:"omitempty,min=2,max=100"`
	Bio            string `json:"bio" validate:"omitempty,max=500"`
	Skills         string `json:"skills"`          // JSON array: ["React","Go"]
	GitHubUsername string `json:"github_username" validate:"omitempty,max=100"`
	PortfolioURL   string `json:"portfolio_url" validate:"omitempty,url"`
	Location       string `json:"location" validate:"omitempty,max=100"`
	SocialLinks    string `json:"social_links"`    // JSON object: {"linkedin":"url"}
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password" validate:"required"`
	NewPassword     string `json:"new_password" validate:"required,min=8,max=72,password_complexity"`
	ConfirmPassword string `json:"confirm_password" validate:"required,eqfield=NewPassword"`
}