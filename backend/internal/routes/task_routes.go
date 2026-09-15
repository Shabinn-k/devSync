package routes

import (
	"github.com/gin-gonic/gin"

	"devSync/config"
	"devSync/internal/controllers/task"
	"devSync/internal/middleware"
	authRepo "devSync/internal/repositories/auth"
)

func RegisterTaskRoutes(
	router *gin.Engine,
	controller *task.Controller,
	cfg *config.AppConfig,
	repo authRepo.Repository,
) {
	taskGroup := router.Group("/tasks")
	taskGroup.Use(middleware.AuthRequired(cfg, repo))
	{
		taskGroup.POST("", controller.Create)
		taskGroup.GET("/my", controller.GetMyTasks)
		taskGroup.GET("/project/:projectId", controller.GetByProject)
		taskGroup.GET("/:id", controller.GetByID)
		taskGroup.PUT("/:id", controller.Update)
		taskGroup.PUT("/:id/status", controller.UpdateStatus)
		taskGroup.DELETE("/:id", controller.Delete)

		taskGroup.POST("/:id/comments", controller.AddComment)
		taskGroup.GET("/:id/comments", controller.GetComments)
		taskGroup.DELETE("/:id/comments/:commentId", controller.DeleteComment)
		taskGroup.DELETE("/comments/:commentId", controller.DeleteComment)
	}
}