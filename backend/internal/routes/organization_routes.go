package routes

import (
	"github.com/gin-gonic/gin"

	"devSync/config"
	"devSync/internal/controllers/organization"
	"devSync/internal/middleware"
	authRepo "devSync/internal/repositories/auth"
)

func RegisterOrganizationRoutes(
	router *gin.Engine,
	controller *organization.Controller,
	cfg *config.AppConfig,
	repo authRepo.Repository,
) {
	orgGroup := router.Group("/organizations")
	orgGroup.Use(middleware.AuthRequired(cfg, repo))
	{

		orgGroup.POST("", controller.Create)
		orgGroup.GET("", controller.List)
		orgGroup.GET("/me", controller.GetUserOrganizations)
		orgGroup.GET("/:id", controller.GetByID)
		orgGroup.GET("/slug/:slug", controller.GetBySlug)
		orgGroup.PUT("/:id", controller.Update)
		orgGroup.DELETE("/:id", controller.Delete)

		orgGroup.POST("/:id/members", controller.AddMember)
		orgGroup.GET("/:id/members", controller.GetMembers)
		orgGroup.PUT("/:id/members/:memberId", controller.UpdateMemberRole)
		orgGroup.DELETE("/:id/members/:memberId", controller.RemoveMember)
	}
}
