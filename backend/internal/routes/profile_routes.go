package routes

import (
	"github.com/gin-gonic/gin"

	"devSync/config"
	"devSync/internal/controllers/profile"
	"devSync/internal/middleware"
	authRepo "devSync/internal/repositories/auth"
)

func RegisterProfileRoutes(
	router *gin.Engine,
	h *profile.Controller,
	cfg *config.AppConfig,
	authRepo authRepo.Repository,
) {
	profileGroup := router.Group("/profile")
	profileGroup.Use(middleware.AuthRequired(cfg, authRepo))
	{
		profileGroup.GET("/me", h.GetProfile)
		profileGroup.GET("/:username", h.GetProfileByUsername)
		profileGroup.PUT("/me", h.UpdateProfile)
		profileGroup.PUT("/change-password", h.ChangePassword)
		profileGroup.POST("/avatar", h.UploadAvatar)
	}
}