package bootstrap

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"devSync/config"
	"devSync/internal/controllers/auth"
	authRepo "devSync/internal/repositories/auth"
	"devSync/internal/routes"
	authService "devSync/internal/services/auth"
)

func InitRouter(cfg *config.AppConfig, db *gorm.DB) *gin.Engine {
	router := gin.Default()

	// Auth module
	repo := authRepo.NewRepository(db)
	svc := authService.NewService(repo, cfg)
	ctrl := auth.NewController(svc)
	routes.RegisterAuthRoutes(router, ctrl, repo, cfg)

	return router
}