package mapper

import (
	authResponse "devSync/internal/dto/response/auth"
	"devSync/internal/model"
)

func ToUserResponse(user *model.User) authResponse.UserResponse {
	return authResponse.UserResponse{
		ID:         user.ID,
		Name:  		user.Name,
		Email:      user.Email,
		IsVerified: user.IsVerified,
		IsActive:   user.IsActive,
		CreatedAt:  user.CreatedAt,
	}
}

func ToTokenResponse(accessToken, refreshToken string, expiresIn int64) authResponse.TokenResponse {
	return authResponse.TokenResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		TokenType:    "Bearer",
		ExpiresIn:    expiresIn,
	}
}

func ToAuthResponse(user *model.User, accessToken, refreshToken string, expiresIn int64) authResponse.AuthResponse {
	return authResponse.AuthResponse{
		User:  ToUserResponse(user),
		Token: ToTokenResponse(accessToken, refreshToken, expiresIn),
	}
}