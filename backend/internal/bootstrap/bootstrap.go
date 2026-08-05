package bootstrap

import (
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"

	"devSync/config"
	"devSync/internal/cache"
	"devSync/internal/controllers/auth"
	"devSync/internal/controllers/profile"
	"devSync/internal/middleware"
	authRepo "devSync/internal/repositories/auth"
	profileRepo "devSync/internal/repositories/profile"
	"devSync/internal/routes"
	authService "devSync/internal/services/auth"
	profileService "devSync/internal/services/profile"
)

func InitRouter(cfg *config.AppConfig, db *gorm.DB, redisClient *redis.Client) *gin.Engine {
	router := gin.Default()

	// Middleware
	router.Use(middleware.CORSMiddleware())

	// Initialize cache
	cache := cache.NewRedisCache(redisClient)

	// Auth module
	authRepo := authRepo.NewRepository(db)
	authSvc := authService.NewService(authRepo, cfg, cache)  // ✅ Pass cache here
	authCtrl := auth.NewController(authSvc)
	routes.RegisterAuthRoutes(router, authCtrl, authRepo, cfg)

	// Profile module
	profileRepo := profileRepo.NewRepository(db)
	profileSvc := profileService.NewService(profileRepo, cfg)
	profileCtrl := profile.NewController(profileSvc)
	routes.RegisterProfileRoutes(router, profileCtrl, cfg, authRepo)

	return router
}