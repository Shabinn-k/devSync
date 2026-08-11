package request

type UpdateProfileRequest struct {
    Name           string `json:"name"`
    Bio            string `json:"bio"`
    Skills         string `json:"skills"`         
    GitHubUsername string `json:"github_username"`
    PortfolioURL   string `json:"portfolio_url"`
    Location       string `json:"location"`
    SocialLinks    string `json:"social_links"`
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password"`
}