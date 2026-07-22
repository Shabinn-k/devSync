package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"devSync/internal/dto/request"
	"devSync/internal/dto/response"
	"devSync/internal/validators"
	"devSync/pkg/response"
	service "devSync/internal/services/auth"
)

type AuthController struct {
	service service.AuthService
}

func NewAuthController(s service.AuthService) *AuthController {
	return &AuthController{service: s}
}

func (h *AuthController) Register(c *gin.Context) {
	var req request.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	if errs := validators.ValidateStruct(&req); errs != nil {
		response.ValidationError(c, errs)
		return
	}

	result, err := h.service.Register(&req)
	if err != nil {
		response.Error(c, http.StatusConflict, err.Error())
		return
	}
	response.Success(c, http.StatusCreated, result)
}

func (h *AuthController) Login(c *gin.Context) {
	var req request.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	if errs := validators.ValidateStruct(&req); errs != nil {
		response.ValidationError(c, errs)
		return
	}

	result, err := h.service.Login(&req)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, err.Error())
		return
	}
	response.Success(c, http.StatusOK, result)
}

func (h *AuthController) VerifyEmail(c *gin.Context) {
	var req request.VerifyEmailRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	if errs := validators.ValidateStruct(&req); errs != nil {
		response.ValidationError(c, errs)
		return
	}

	if err := h.service.VerifyEmail(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(c, http.StatusOK, dtoresponse.MessageResponse{Message: "Email verified successfully"})
}

func (h *AuthController) ResendOTP(c *gin.Context) {
	var req request.ResendOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	if errs := validators.ValidateStruct(&req); errs != nil {
		response.ValidationError(c, errs)
		return
	}

	_ = h.service.ResendOTP(&req)
	response.Success(c, http.StatusOK, dtoresponse.MessageResponse{Message: "If the account exists, a new OTP has been sent"})
}

func (h *AuthController) ForgotPassword(c *gin.Context) {
	var req request.ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	if errs := validators.ValidateStruct(&req); errs != nil {
		response.ValidationError(c, errs)
		return
	}

	_ = h.service.ForgotPassword(&req)
	response.Success(c, http.StatusOK, dtoresponse.MessageResponse{Message: "If the account exists, a reset code has been sent"})
}

func (h *AuthController) ResetPassword(c *gin.Context) {
	var req request.ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	if errs := validators.ValidateStruct(&req); errs != nil {
		response.ValidationError(c, errs)
		return
	}

	if err := h.service.ResetPassword(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(c, http.StatusOK, dtoresponse.MessageResponse{Message: "Password reset successfully"})
}

func (h *AuthController) RefreshToken(c *gin.Context) {
	var req request.RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	if errs := validators.ValidateStruct(&req); errs != nil {
		response.ValidationError(c, errs)
		return
	}

	result, err := h.service.RefreshAccessToken(&req)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, err.Error())
		return
	}
	response.Success(c, http.StatusOK, result)
}

func (h *AuthController) Logout(c *gin.Context) {
	var req request.LogoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	if errs := validators.ValidateStruct(&req); errs != nil {
		response.ValidationError(c, errs)
		return
	}

	_ = h.service.Logout(&req)
	response.Success(c, http.StatusOK, dtoresponse.MessageResponse{Message: "Logged out successfully"})
}

func (h *AuthController) Me(c *gin.Context) {
	userIDValue, exists := c.Get("userID")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}
	userID := userIDValue.(uuid.UUID)

	result, err := h.service.GetCurrentUser(userID)
	if err != nil {
		response.Error(c, http.StatusNotFound, "User not found")
		return
	}
	response.Success(c, http.StatusOK, result)
}