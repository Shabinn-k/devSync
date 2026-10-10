package routes

import (
	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"

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
	declineLimiter := middleware.NewIPRateLimiter(rate.Limit(1.0/10.0), 4)
	router.POST("/invite/decline", middleware.RateLimitScope(declineLimiter, "decline"), controller.Decline)

	acceptGroup := router.Group("/invite")
	acceptGroup.Use(middleware.AuthRequired(cfg, repo))
	{
		acceptGroup.POST("/accept", controller.Accept)
	}
}
