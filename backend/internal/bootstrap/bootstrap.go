package bootstrap

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"devSync/config"
	controller "devSync/internal/controllers/auth"
	repository "devSync/internal/repositories/auth"
	"devSync/internal/routes"
	service "devSync/internal/services/auth"
)

// InitRouter wires every layer together and returns a ready-to-run
// Gin engine. Add each new module's wiring here as you build it —
// this stays the single place that knows every concrete type.
func InitRouter(cfg *config.AppConfig, db *gorm.DB) *gin.Engine {
	router := gin.Default()

	authRepo := repository.NewAuthRepository(db)
	authService := service.NewAuthService(authRepo, cfg)
	authController := controller.NewAuthController(authService)

	routes.RegisterAuthRoutes(router, authController, cfg)

	return router
}