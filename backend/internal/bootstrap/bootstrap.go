package bootstrap

import (
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"

	"devSync/config"
	"devSync/internal/cache"
	"devSync/internal/controllers/auth"
	"devSync/internal/controllers/dashboard"
	"devSync/internal/controllers/profile"
	"devSync/internal/middleware"
	authRepo "devSync/internal/repositories/auth"
	dashboardRepo "devSync/internal/repositories/dashboard"
	profileRepo "devSync/internal/repositories/profile"
	"devSync/internal/routes"
	authService "devSync/internal/services/auth"
	dashboardService "devSync/internal/services/dashboard"
	profileService "devSync/internal/services/profile"
)

func InitRouter(cfg *config.AppConfig, db *gorm.DB, redisClient *redis.Client) *gin.Engine {
	router := gin.Default()

	router.Use(middleware.CORSMiddleware())

	// Static files route for uploads (avatars, attachments)
	router.Static("/uploads", "./uploads")

	cache := cache.NewRedisCache(redisClient)

	// Auth module
	authRepo := authRepo.NewRepository(db)
	authSvc := authService.NewService(authRepo, cfg, cache)
	authCtrl := auth.NewController(authSvc)
	routes.RegisterAuthRoutes(router, authCtrl, authRepo, cfg)

	// Profile module - with GitHub contributions
	profileRepo := profileRepo.NewRepository(db)
	profileSvc := profileService.NewService(profileRepo, cfg)
	profileCtrl := profile.NewController(profileSvc)
	routes.RegisterProfileRoutes(router, profileCtrl, cfg, authRepo)

	// Dashboard module
	dashboardRepo := dashboardRepo.NewRepository(db)
	dashboardSvc := dashboardService.NewService(dashboardRepo, cfg)
	dashboardCtrl := dashboard.NewController(dashboardSvc)
	routes.RegisterDashboardRoutes(router, dashboardCtrl, cfg, authRepo)

	return router
}