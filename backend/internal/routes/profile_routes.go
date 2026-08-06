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
		// Current User
		profileGroup.GET("/me", controller.GetProfile)
		profileGroup.PUT("/me", controller.UpdateProfile)

		// Password
		profileGroup.PUT("/password", controller.ChangePassword)

		// Avatar
		profileGroup.POST("/avatar", controller.UploadAvatar) 
 
	}
}