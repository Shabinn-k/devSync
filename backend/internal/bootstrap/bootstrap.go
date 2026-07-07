package bootstrap

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"devSync/config"
	"devSync/internal/controllers/auth"
	"devSync/internal/repositories/auth"
	"devSync/internal/routes"
	authService "devSync/internal/services/auth"
)

func InitRouter(cfg *config.AppConfig, db *gorm.DB) *gin.Engine {
	router := gin.Default()

	// Auth module
	authRepo := auth.NewRepository(db)
	authSvc := authService.NewService(authRepo, cfg)
	authCtrl := auth.NewController(authSvc)
	routes.RegisterAuthRoutes(router, authCtrl, cfg)

	return router
}