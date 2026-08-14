package routes

import (
	"github.com/gin-gonic/gin"

	"devSync/config"
	"devSync/internal/controllers/auth"
	"devSync/internal/middleware"
	authRepo "devSync/internal/repositories/auth"
)

func RegisterAuthRoutes(
	router *gin.Engine,
	controller *auth.Controller,
	repo authRepo.Repository,
	cfg *config.AppConfig,
) {
	authGroup := router.Group("/auth")
	{
		authGroup.POST("/register", controller.Register)
		authGroup.POST("/login", controller.Login)
		authGroup.POST("/logout", controller.Logout)

		authGroup.POST("/verify-email", controller.VerifyEmail)
		authGroup.POST("/resend-otp", controller.ResendOTP)

		authGroup.POST("/forgot-password", controller.ForgotPassword)
		authGroup.POST("/verify-otp", controller.VerifyOTP)
		authGroup.POST("/reset-password", controller.ResetPassword)

		authGroup.POST("/refresh-token", controller.RefreshToken)

		authGroup.GET("/me", middleware.AuthRequired(cfg, repo), controller.Me)
	}
}
