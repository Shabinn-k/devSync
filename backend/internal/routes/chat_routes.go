package routes

import (
	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"

	"devSync/config"
	chatCtrl "devSync/internal/controllers/chat"
	"devSync/internal/middleware"
	authRepo "devSync/internal/repositories/auth"
)

func RegisterChatRoutes(router *gin.Engine, ctrl *chatCtrl.Controller, cfg *config.AppConfig, authRepository authRepo.Repository) {
	group := router.Group("/chat")
	group.Use(middleware.AuthRequired(cfg, authRepository))
	createLimiter := middleware.NewIPRateLimiter(rate.Limit(1.0/10.0), 4)
	{
		group.GET("/channels", ctrl.GetChannels)
		group.GET("/dm-candidates", ctrl.ListDMCandidates)
		group.POST("/channels", middleware.RateLimitScope(createLimiter, "channel-create"), ctrl.CreateChannel)
		group.POST("/direct", middleware.RateLimitScope(createLimiter, "dm-create"), ctrl.DirectChannel)
		group.GET("/channels/:id", ctrl.GetChannel)
		group.GET("/channels/:id/messages", ctrl.GetMessages)
		group.POST("/channels/:id/messages", ctrl.SendMessage)
	}
}
