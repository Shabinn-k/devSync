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
	inviteGroup := router.Group("/organizations")
	inviteGroup.Use(middleware.AuthRequired(cfg, repo))
	{
		inviteGroup.POST("/:id/invite", controller.Invite)
	}
 
	router.GET("/invite/info", controller.GetInfo)
	router.POST("/invite/decline", controller.Decline)
	router.GET("/invite/decline", controller.Decline)
 
	acceptGroup := router.Group("/invite")
	acceptGroup.Use(middleware.AuthRequired(cfg, repo))
	{
		acceptGroup.POST("/accept", controller.Accept)
		acceptGroup.GET("/accept", controller.Accept)
	}
}