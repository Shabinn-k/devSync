package auth

import (
	"net/http"

	"github.com/gin-gonic/gin"

	authRequest "devSync/internal/dto/request"
	authResponse "devSync/internal/dto/response"
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

// POST /auth/register
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

// POST /auth/login
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

// POST /auth/verify-email
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

// POST /auth/resend-otp
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
	response.Success(c, authResponse.MessageResponse{Message: "A new OTP has been sent to your email"})
}

// POST /auth/verify-otp
func (h *Controller) VerifyOTP(c *gin.Context) {
	var req authRequest.VerifyOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}
	if errs := validator.ValidateStruct(&req); errs != nil {
		response.ValidationError(c, errs)
		return
	}

	if err := h.service.VerifyOTP(c.Request.Context(), req.Email, req.OTP); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(c, authResponse.MessageResponse{Message: "OTP verified successfully"})
}

// POST /auth/forgot-password
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

// POST /auth/reset-password
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

// POST /auth/refresh-token
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

// POST /auth/logout
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

// GET /auth/me
func (h *Controller) Me(c *gin.Context) {
	// ✅ Get user ID from context (set by AuthRequired middleware)
	userIDValue, exists := c.Get("userID")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	// ✅ Type assertion to int (we use integer IDs)
	userID, ok := userIDValue.(int)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "Invalid user ID format")
		return
	}

	result, err := h.service.GetCurrentUser(c.Request.Context(), userID)
	if err != nil {
		response.Error(c, http.StatusNotFound, "User not found")
		return
	}
	response.Success(c, result)
}