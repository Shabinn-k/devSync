package mapper

import (
	"devSync/internal/dto/response"
	"devSync/internal/models"
)

func ToUserResponse(user *models.User) response.UserResponse {
	return response.UserResponse{
		ID:         user.ID,
		FullName:   user.FullName,
		Username:   user.Username,
		Email:      user.Email,
		IsVerified: user.IsVerified,
		IsActive:   user.IsActive,
		CreatedAt:  user.CreatedAt,
	}
}

func ToTokenResponse(accessToken, refreshToken string, expiresIn int64) response.TokenResponse {
	return response.TokenResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		TokenType:    "Bearer",
		ExpiresIn:    expiresIn,
	}
}

func ToAuthResponse(user *models.User, accessToken, refreshToken string, expiresIn int64) response.AuthResponse {
	return response.AuthResponse{
		User:  ToUserResponse(user),
		Token: ToTokenResponse(accessToken, refreshToken, expiresIn),
	}
}