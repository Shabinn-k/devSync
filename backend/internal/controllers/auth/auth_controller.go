package auth

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"devSync/internal/dto/request"
	"devSync/internal/dto/response"
	"devSync/internal/services/auth"
	"devSync/internal/validators"
	"devSync/internal/response"
)

type Controller struct {
	service auth.Service
}

func NewController(s auth.Service) *Controller {
	return &Controller{service: s}
}

func (h *Controller) Register(c *gin.Context) {
	var req request.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	if errs := validators.ValidateStruct(&req); errs != nil {
		response.ValidationError(c, errs)
		return
	}

	result, err := h.service.Register(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, http.StatusConflict, err.Error())
		return
	}
	response.Created(c, result)
}

func (h *Controller) Login(c *gin.Context) {
	var req request.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	if errs := validators.ValidateStruct(&req); errs != nil {
		response.ValidationError(c, errs)
		return
	}

	result, err := h.service.Login(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, err.Error())
		return
	}
	response.Success(c, result)
}

func (h *Controller) VerifyEmail(c *gin.Context) {
	var req request.VerifyEmailRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	if errs := validators.ValidateStruct(&req); errs != nil {
		response.ValidationError(c, errs)
		return
	}

	if err := h.service.VerifyEmail(c.Request.Context(), &req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(c, response.MessageResponse{Message: "Email verified successfully"})
}

func (h *Controller) ResendOTP(c *gin.Context) {
	var req request.ResendOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	if errs := validators.ValidateStruct(&req); errs != nil {
		response.ValidationError(c, errs)
		return
	}

	_ = h.service.ResendOTP(c.Request.Context(), &req)
	response.Success(c, response.MessageResponse{Message: "If the account exists, a new OTP has been sent"})
}

func (h *Controller) ForgotPassword(c *gin.Context) {
	var req request.ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	if errs := validators.ValidateStruct(&req); errs != nil {
		response.ValidationError(c, errs)
		return
	}

	_ = h.service.ForgotPassword(c.Request.Context(), &req)
	response.Success(c, response.MessageResponse{Message: "If the account exists, a reset code has been sent"})
}

func (h *Controller) ResetPassword(c *gin.Context) {
	var req request.ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	if errs := validators.ValidateStruct(&req); errs != nil {
		response.ValidationError(c, errs)
		return
	}

	if err := h.service.ResetPassword(c.Request.Context(), &req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(c, response.MessageResponse{Message: "Password reset successfully"})
}

func (h *Controller) RefreshToken(c *gin.Context) {
	var req request.RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	if errs := validators.ValidateStruct(&req); errs != nil {
		response.ValidationError(c, errs)
		return
	}

	result, err := h.service.RefreshToken(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, err.Error())
		return
	}
	response.Success(c, result)
}

func (h *Controller) Logout(c *gin.Context) {
	var req request.LogoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	if errs := validators.ValidateStruct(&req); errs != nil {
		response.ValidationError(c, errs)
		return
	}

	_ = h.service.Logout(c.Request.Context(), &req)
	response.Success(c, response.MessageResponse{Message: "Logged out successfully"})
}

func (h *Controller) Me(c *gin.Context) {
	userIDValue, exists := c.Get("userID")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}
	userID := userIDValue.(uuid.UUID)

	result, err := h.service.GetCurrentUser(c.Request.Context(), userID)
	if err != nil {
		response.Error(c, http.StatusNotFound, "User not found")
		return
	}
	response.Success(c, result)
}