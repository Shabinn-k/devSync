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
	controller *profile.Controller,
	cfg *config.AppConfig,
	repo authRepo.Repository,
) {
	profileGroup := router.Group("/profile")
	profileGroup.Use(middleware.AuthRequired(cfg, repo))
	{
		profileGroup.GET("/me", controller.GetProfile)
		profileGroup.PUT("/me", controller.UpdateProfile)
		profileGroup.PUT("/password", controller.ChangePassword)
		profileGroup.POST("/avatar", controller.UploadAvatar)
		
		profileGroup.GET("/me/github", controller.GetGitHubContributions)
		profileGroup.GET("/github/contributions", controller.GetGitHubContributions)
	}
}