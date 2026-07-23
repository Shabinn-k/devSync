package routes

import (
	"github.com/gin-gonic/gin"

	"devSync/config"
	"devSync/internal/controllers/auth"
	"devSync/internal/middleware"
	authRepo "devSync/internal/repositories/auth"
)

func RegisterAuthRoutes(router *gin.Engine, h *auth.Controller, repo authRepo.Repository, cfg *config.AppConfig) {
	authGroup := router.Group("/auth")
	{
		authGroup.POST("/register", h.Register)
		authGroup.POST("/login", h.Login)
		authGroup.POST("/verify-email", h.VerifyEmail)
		authGroup.POST("/resend-otp", h.ResendOTP)
		authGroup.POST("/forgot-password", h.ForgotPassword)
		authGroup.POST("/reset-password", h.ResetPassword)
		authGroup.POST("/refresh-token", h.RefreshToken)
		authGroup.POST("/logout", h.Logout)

		authGroup.GET("/me", middleware.AuthRequired(cfg, repo), h.Me)
	}
}