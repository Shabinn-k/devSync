package routes

import (
	"github.com/gin-gonic/gin"

	"devSync/config"
	joinRequestCtrl "devSync/internal/controllers/join_request"
	"devSync/internal/middleware"
	authRepo "devSync/internal/repositories/auth"
)

func RegisterJoinRequestRoutes(
	r *gin.Engine,
	ctrl *joinRequestCtrl.Controller,
	cfg *config.AppConfig,
	repo authRepo.Repository,
) {
	auth := middleware.AuthRequired(cfg, repo)

	g := r.Group("/organizations", auth)
	{
		g.POST("/:id/join-request", ctrl.Create)
		g.GET("/me/join-requests", ctrl.MyRequests)
		g.DELETE("/join-requests/:requestId", ctrl.Cancel)

		g.GET("/:id/join-requests", ctrl.ListForOrg)
		g.PUT("/:id/join-requests/:requestId", ctrl.Review)
	}
}