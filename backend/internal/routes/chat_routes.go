package routes

import (
	"github.com/gin-gonic/gin"

	"devSync/config"
	chatCtrl "devSync/internal/controllers/chat"
	"devSync/internal/middleware"
	authRepo "devSync/internal/repositories/auth"
)

func RegisterChatRoutes(router *gin.Engine, ctrl *chatCtrl.Controller, cfg *config.AppConfig, authRepository authRepo.Repository) {
	group := router.Group("/chat")
	group.Use(middleware.AuthRequired(cfg, authRepository))
	{
		group.GET("/channels", ctrl.GetChannels)
		group.POST("/channels", ctrl.CreateChannel)
		group.POST("/direct", ctrl.DirectChannel)
		group.GET("/channels/:id", ctrl.GetChannel)
		group.GET("/channels/:id/messages", ctrl.GetMessages)
		group.POST("/channels/:id/messages", ctrl.SendMessage)
	}
}
