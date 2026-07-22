package routes

import (
	"github.com/gin-gonic/gin"

	"devSync/config"
	controller "devSync/internal/controllers/auth"
	"devSync/internal/middleware"
)

func RegisterAuthRoutes(router *gin.Engine, h *controller.AuthController, cfg *config.AppConfig) {
	auth := router.Group("/auth")
	{
		auth.POST("/register", h.Register)
		auth.POST("/login", h.Login)
		auth.POST("/verify-email", h.VerifyEmail)
		auth.POST("/resend-otp", h.ResendOTP)
		auth.POST("/forgot-password", h.ForgotPassword)
		auth.POST("/reset-password", h.ResetPassword)
		auth.POST("/refresh-token", h.RefreshToken)
		auth.POST("/logout", h.Logout)

		auth.GET("/me", middleware.AuthRequired(cfg), h.Me)
	}
}