package auth

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	authRequest "devSync/internal/dto/request/auth"
	authResponse "devSync/internal/dto/response/auth"
	"devSync/internal/response"
	"devSync/internal/services/auth"
	"devSync/utils/validator"
)

type Controller struct {
	service auth.Service
}

func NewController(s auth.Service) *Controller {
	return &Controller{service: s}
}

func (h *Controller) Register(c *gin.Context) {
	var req authRequest.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	if errs := validator.ValidateStruct(&req); errs != nil {
		response.ValidationError(c, errs)
		return
	}

	result, err := h.service.Register(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, http.StatusConflict, err.Error())
		return
	}
	response.Created(c, gin.H{
		"user":    result,
		"message": "User registered successfully. Please verify your email with the OTP sent.",
	})
}

func (h *Controller) Login(c *gin.Context) {
	var req authRequest.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	if errs := validator.ValidateStruct(&req); errs != nil {
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
	var req authRequest.VerifyEmailRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	if errs := validator.ValidateStruct(&req); errs != nil {
		response.ValidationError(c, errs)
		return
	}

	if err := h.service.VerifyEmail(c.Request.Context(), &req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(c, authResponse.MessageResponse{Message: "Email verified successfully"})
}

func (h *Controller) ResendOTP(c *gin.Context) {
	var req authRequest.ResendOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	if errs := validator.ValidateStruct(&req); errs != nil {
		response.ValidationError(c, errs)
		return
	}

	if err := h.service.ResendOTP(c.Request.Context(), &req); err != nil {
		response.Error(c, http.StatusTooManyRequests, err.Error())
		return
	}
	response.Success(c, authResponse.MessageResponse{Message: "If the account exists, a new OTP has been sent"})
}

func (h *Controller) ForgotPassword(c *gin.Context) {
	var req authRequest.ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	if errs := validator.ValidateStruct(&req); errs != nil {
		response.ValidationError(c, errs)
		return
	}

	if err := h.service.ForgotPassword(c.Request.Context(), &req); err != nil {
		response.Error(c, http.StatusTooManyRequests, err.Error())
		return
	}
	response.Success(c, authResponse.MessageResponse{Message: "If the account exists, a reset code has been sent"})
}

func (h *Controller) ResetPassword(c *gin.Context) {
	var req authRequest.ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	if errs := validator.ValidateStruct(&req); errs != nil {
		response.ValidationError(c, errs)
		return
	}

	if err := h.service.ResetPassword(c.Request.Context(), &req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(c, authResponse.MessageResponse{Message: "Password reset successfully"})
}

func (h *Controller) RefreshToken(c *gin.Context) {
	var req authRequest.RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	if errs := validator.ValidateStruct(&req); errs != nil {
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
	var req authRequest.LogoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	if errs := validator.ValidateStruct(&req); errs != nil {
		response.ValidationError(c, errs)
		return
	}

	if err := h.service.Logout(c.Request.Context(), &req); err != nil {
		response.Error(c, http.StatusUnauthorized, err.Error())
		return
	}
	response.Success(c, authResponse.MessageResponse{Message: "Logged out successfully"})
}

func (h *Controller) Me(c *gin.Context) {
	userIDValue, exists := c.Get("userID")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}
	userID, ok := userIDValue.(uuid.UUID)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	result, err := h.service.GetCurrentUser(c.Request.Context(), userID)
	if err != nil {
		response.Error(c, http.StatusNotFound, "User not found")
		return
	}
	response.Success(c, result)
}