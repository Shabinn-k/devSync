package routes

import (
	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"

	"devSync/config"
	"devSync/internal/controllers/auth"
	"devSync/internal/middleware"
	authRepo "devSync/internal/repositories/auth"
)

func RegisterAuthRoutes(
	router *gin.Engine,
	controller *auth.Controller,
	cfg *config.AppConfig,
	repo authRepo.Repository,
) {
	authGroup := router.Group("/auth")
	strictLimiter := middleware.NewIPRateLimiter(rate.Limit(1.0/12.0), 4)
	{
		// Public routes
		authGroup.POST("/register", middleware.RateLimitScope(strictLimiter, "register"), controller.Register)
		authGroup.POST("/login", middleware.RateLimitScope(strictLimiter, "login"), controller.Login)
		authGroup.POST("/verify-email", middleware.RateLimitScope(strictLimiter, "verify-email"), controller.VerifyEmail)
		authGroup.POST("/resend-otp", middleware.RateLimitScope(strictLimiter, "resend-otp"), controller.ResendOTP)
		authGroup.POST("/forgot-password", middleware.RateLimitScope(strictLimiter, "forgot-password"), controller.ForgotPassword)
		authGroup.POST("/verify-otp", middleware.RateLimitScope(strictLimiter, "verify-otp"), controller.VerifyOTP)
		authGroup.POST("/reset-password", middleware.RateLimitScope(strictLimiter, "reset-password"), controller.ResetPassword)
		authGroup.POST("/refresh-token", middleware.RateLimitScope(strictLimiter, "refresh-token"), controller.RefreshToken)

		// Protected routes
		authGroup.POST("/logout", middleware.AuthRequired(cfg, repo), controller.Logout)
		authGroup.GET("/me", middleware.AuthRequired(cfg, repo), controller.Me)
	}
}
