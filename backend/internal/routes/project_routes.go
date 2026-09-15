package routes

import (
	"github.com/gin-gonic/gin"

	"devSync/config"
	"devSync/internal/controllers/project"
	"devSync/internal/middleware"
	authRepo "devSync/internal/repositories/auth"
)

func RegisterProjectRoutes(
	router *gin.Engine,
	controller *project.Controller,
	cfg *config.AppConfig,
	repo authRepo.Repository,
) {
	projectGroup := router.Group("/projects")
	projectGroup.Use(middleware.AuthRequired(cfg, repo))
	{
		projectGroup.GET("/organization/:organizeId", controller.GetOrgProjects)
		projectGroup.POST("", controller.Create)
		projectGroup.GET("", controller.GetUserProjects)
		projectGroup.GET("/my", controller.GetMyProjects)
		projectGroup.GET("/:id", controller.GetByID)
		projectGroup.PUT("/:id", controller.Update)
		projectGroup.DELETE("/:id", controller.Delete)

		projectGroup.POST("/:id/members", controller.AddMember)
		projectGroup.GET("/:id/members", controller.GetMembers)
		projectGroup.PUT("/:id/members/:memberId", controller.UpdateMemberRole)
		projectGroup.DELETE("/:id/members/:memberId", controller.RemoveMember)
	}
}
