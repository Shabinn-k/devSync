package routes

import (
	"github.com/gin-gonic/gin"

	"devSync/config"
	teamCtrl "devSync/internal/controllers/team"
	"devSync/internal/middleware"
	authRepo "devSync/internal/repositories/auth"
)

func RegisterTeamRoutes(router *gin.Engine, ctrl *teamCtrl.Controller, cfg *config.AppConfig, authRepository authRepo.Repository) {
	group := router.Group("/teams")
	group.Use(middleware.AuthRequired(cfg, authRepository))
	{
		group.POST("", ctrl.Create)
		group.GET("/organization/:orgId", ctrl.GetByOrganization)
		group.GET("/my", ctrl.GetMyTeams)
		group.GET("/:id", ctrl.GetByID)
		group.PUT("/:id", ctrl.Update)
		group.DELETE("/:id", ctrl.Delete)
		group.POST("/:id/members", ctrl.AddMember)
		group.GET("/:id/members", ctrl.GetMembers)
		group.PUT("/:id/members/:memberId", ctrl.UpdateMemberRole)
		group.DELETE("/:id/members/:memberId", ctrl.RemoveMember)
	}
}
