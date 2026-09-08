package routes

import (
	"github.com/gin-gonic/gin"

	"devSync/config"
	"devSync/internal/controllers/notification"
	"devSync/internal/middleware"
	authRepo "devSync/internal/repositories/auth"
	ws "devSync/internal/websocket"
)

func RegisterNotificationRoutes(
	router *gin.Engine,
	controller *notification.Controller,
	hub *ws.Hub,
	cfg *config.AppConfig,
	repo authRepo.Repository,
) {
	router.GET("/ws/notifications", ws.ServeWS(hub, cfg))

	notifGroup := router.Group("/notifications")
	notifGroup.Use(middleware.AuthRequired(cfg, repo))
	{
		notifGroup.GET("", controller.GetNotifications)
		notifGroup.GET("/unread-count", controller.GetUnreadCount)
		notifGroup.PUT("/read-all", controller.MarkAllAsRead)
		notifGroup.PUT("/:id/read", controller.MarkAsRead)
		notifGroup.DELETE("/:id", controller.DeleteNotification)
	}
}
