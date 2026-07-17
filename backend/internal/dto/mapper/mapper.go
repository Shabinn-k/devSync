package mapper

// import (
// 	// "devSync/auth/model"
// 	"devSync/internal/dto/reponse/auth"
// 	"devSync/internal/model"
// )

// // ToUserResponse converts a model.User into its public-safe
// // response representation. This is the single point of translation
// // between persistence and API contract — never return model.User
// // directly from a handler.
// func ToUserResponse(user *model.User) response.UserResponse {
// 	if user == nil {
// 		return response.UserResponse{}
// 	}

// 	return response.UserResponse{
// 		ID:              user.ID,
// 		Name:            user.Name,
// 		Email:           user.Email,
// 		IsEmailVerified: user.IsEmailVerified,
// 		AvatarURL:       user.AvatarURL,
// 		CreatedAt:       user.CreatedAt,
// 	}
// }

// // ToUserResponseList converts a slice of model.User into a slice of
// // UserResponse. Useful for list/admin endpoints outside this module
// // that reuse the same mapper.
// func ToUserResponseList(users []model.User) []response.UserResponse {
// 	result := make([]response.UserResponse, 0, len(users))
// 	for i := range users {
// 		result = append(result, ToUserResponse(&users[i]))
// 	}
// 	return result
// }

// // ToTokenResponse builds a TokenResponse from raw token values.
// // Kept separate from user data so it can be reused standalone
// // (e.g. RefreshAccessToken, which returns tokens without a user).
// func ToTokenResponse(accessToken, refreshToken, tokenType string, expiresIn int64) response.TokenResponse {
// 	return response.TokenResponse{
// 		AccessToken:  accessToken,
// 		RefreshToken: refreshToken,
// 		TokenType:    tokenType,
// 		ExpiresIn:    expiresIn,
// 	}
// }

// // ToRegisterResponse builds the response returned after successful
// // registration (pre-verification, no tokens issued).
// func ToRegisterResponse(user *model.User, message string) response.RegisterResponse {
// 	return response.RegisterResponse{
// 		User:    ToUserResponse(user),
// 		Message: message,
// 	}
// }

// // ToLoginResponse builds the full login response, combining the
// // user's public profile with an issued token pair.
// func ToLoginResponse(user *model.User, accessToken, refreshToken, tokenType string, expiresIn int64) response.LoginResponse {
// 	return response.LoginResponse{
// 		User:  ToUserResponse(user),
// 		Token: ToTokenResponse(accessToken, refreshToken, tokenType, expiresIn),
// 	}
// }