	package handler

	import (
		"net/http"

		"github.com/gin-gonic/gin"
		"github.com/google/uuid"

		"devsync/dto/request"
		"devsync/dto/response"
		"devsync/service"
		"devsync/validator"
	)

	type AuthHandler struct {
		service service.AuthService
	}

	func NewAuthHandler(s service.AuthService) *AuthHandler {
		return &AuthHandler{service: s}
	}

	func (h *AuthHandler) Register(c *gin.Context) {
		var req request.RegisterRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			badRequest(c, "Invalid request body")
			return
		}
		if errs := validator.ValidateStruct(&req); errs != nil {
			validationFailed(c, errs)
			return
		}

		result, err := h.service.Register(&req)
		if err != nil {
			conflict(c, err.Error())
			return
		}
		c.JSON(http.StatusCreated, result)
	}

	func (h *AuthHandler) Login(c *gin.Context) {
		var req request.LoginRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			badRequest(c, "Invalid request body")
			return
		}
		if errs := validator.ValidateStruct(&req); errs != nil {
			validationFailed(c, errs)
			return
		}

		result, err := h.service.Login(&req)
		if err != nil {
			unauthorized(c, err.Error())
			return
		}
		c.JSON(http.StatusOK, result)
	}

	func (h *AuthHandler) VerifyEmail(c *gin.Context) {
		var req request.VerifyEmailRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			badRequest(c, "Invalid request body")
			return
		}
		if errs := validator.ValidateStruct(&req); errs != nil {
			validationFailed(c, errs)
			return
		}

		if err := h.service.VerifyEmail(&req); err != nil {
			badRequestErr(c, err)
			return
		}
		c.JSON(http.StatusOK, response.MessageResponse{Message: "Email verified successfully"})
	}

	func (h *AuthHandler) ResendOTP(c *gin.Context) {
		var req request.ResendOTPRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			badRequest(c, "Invalid request body")
			return
		}
		if errs := validator.ValidateStruct(&req); errs != nil {
			validationFailed(c, errs)
			return
		}

		_ = h.service.ResendOTP(&req)
		c.JSON(http.StatusOK, response.MessageResponse{Message: "If the account exists, a new OTP has been sent"})
	}

	func (h *AuthHandler) ForgotPassword(c *gin.Context) {
		var req request.ForgotPasswordRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			badRequest(c, "Invalid request body")
			return
		}
		if errs := validator.ValidateStruct(&req); errs != nil {
			validationFailed(c, errs)
			return
		}

		_ = h.service.ForgotPassword(&req)
		c.JSON(http.StatusOK, response.MessageResponse{Message: "If the account exists, a reset code has been sent"})
	}

	func (h *AuthHandler) ResetPassword(c *gin.Context) {
		var req request.ResetPasswordRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			badRequest(c, "Invalid request body")
			return
		}
		if errs := validator.ValidateStruct(&req); errs != nil {
			validationFailed(c, errs)
			return
		}

		if err := h.service.ResetPassword(&req); err != nil {
			badRequestErr(c, err)
			return
		}
		c.JSON(http.StatusOK, response.MessageResponse{Message: "Password reset successfully"})
	}

	func (h *AuthHandler) RefreshToken(c *gin.Context) {
		var req request.RefreshTokenRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			badRequest(c, "Invalid request body")
			return
		}
		if errs := validator.ValidateStruct(&req); errs != nil {
			validationFailed(c, errs)
			return
		}

		result, err := h.service.RefreshAccessToken(&req)
		if err != nil {
			unauthorized(c, err.Error())
			return
		}
		c.JSON(http.StatusOK, result)
	}

	func (h *AuthHandler) Logout(c *gin.Context) {
		var req request.LogoutRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			badRequest(c, "Invalid request body")
			return
		}
		if errs := validator.ValidateStruct(&req); errs != nil {
			validationFailed(c, errs)
			return
		}

		_ = h.service.Logout(&req)
		c.JSON(http.StatusOK, response.MessageResponse{Message: "Logged out successfully"})
	}

	func (h *AuthHandler) Me(c *gin.Context) {
		userIDValue, exists := c.Get("userID")
		if !exists {
			unauthorized(c, "Unauthorized")
			return
		}
		userID := userIDValue.(uuid.UUID)

		result, err := h.service.GetCurrentUser(userID)
		if err != nil {
			notFound(c, "User not found")
			return
		}
		c.JSON(http.StatusOK, result)
	}

	// ---- small local response helpers ----

	func badRequest(c *gin.Context, msg string) {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: msg})
	}

	func badRequestErr(c *gin.Context, err error) {
		c.JSON(http.StatusBadRequest, response.ErrorResponse{Success: false, Message: err.Error()})
	}

	func unauthorized(c *gin.Context, msg string) {
		c.JSON(http.StatusUnauthorized, response.ErrorResponse{Success: false, Message: msg})
	}

	func conflict(c *gin.Context, msg string) {
		c.JSON(http.StatusConflict, response.ErrorResponse{Success: false, Message: msg})
	}

	func notFound(c *gin.Context, msg string) {
		c.JSON(http.StatusNotFound, response.ErrorResponse{Success: false, Message: msg})
	}

	func validationFailed(c *gin.Context, errs map[string]string) {
		c.JSON(http.StatusUnprocessableEntity, response.ErrorResponse{
			Success: false,
			Message: "Validation failed",
			Errors:  errs,
		})
	}