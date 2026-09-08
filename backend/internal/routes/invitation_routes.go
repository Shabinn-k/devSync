package routes

import (
	"github.com/gin-gonic/gin"

	"devSync/config"
	"devSync/internal/controllers/invitation"
	"devSync/internal/middleware"
	authRepo "devSync/internal/repositories/auth"
)

func RegisterInvitationRoutes(
	router *gin.Engine,
	controller *invitation.Controller,
	cfg *config.AppConfig,
	repo authRepo.Repository,
) {
	// Protected routes (require auth)
	inviteGroup := router.Group("/organizations")
	inviteGroup.Use(middleware.AuthRequired(cfg, repo))
	{
		inviteGroup.POST("/:id/invite", controller.Invite)
	}

	// Public routes (no auth required)
	router.GET("/invite/accept", controller.Accept)
	router.GET("/invite/decline", controller.Decline)
	router.GET("/invite/info", controller.GetInfo)
}