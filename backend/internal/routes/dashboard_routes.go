package routes

import (
	"github.com/gin-gonic/gin"

	"devSync/config"
	"devSync/internal/controllers/dashboard"
	"devSync/internal/middleware"
	authRepo "devSync/internal/repositories/auth"
)

func RegisterDashboardRoutes(
	router *gin.Engine,
	controller *dashboard.Controller,
	cfg *config.AppConfig,
	repo authRepo.Repository,
) {
	dashboardGroup := router.Group("/dashboard")
	dashboardGroup.Use(middleware.AuthRequired(cfg, repo))
	{
		dashboardGroup.GET("/", controller.GetDashboard)   
	}
}