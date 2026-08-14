package bootstrap

import (
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"

	"devSync/config"
	"devSync/internal/cache"
	"devSync/internal/controllers/auth"
	"devSync/internal/controllers/dashboard"
	"devSync/internal/controllers/organization"
	"devSync/internal/controllers/profile"
	"devSync/internal/middleware"
	authRepo "devSync/internal/repositories/auth"
	dashboardRepo "devSync/internal/repositories/dashboard"
	orgRepo "devSync/internal/repositories/organization"
	profileRepo "devSync/internal/repositories/profile"
	"devSync/internal/routes"
	authService "devSync/internal/services/auth"
	dashboardService "devSync/internal/services/dashboard"
	orgService "devSync/internal/services/organization"
	profileService "devSync/internal/services/profile"
)

func InitRouter(cfg *config.AppConfig, db *gorm.DB, redisClient *redis.Client) *gin.Engine {
	router := gin.Default()

	router.Use(middleware.CORSMiddleware())
	router.Static("/uploads", "./uploads")

	cache := cache.NewRedisCache(redisClient)

	authRepo := authRepo.NewRepository(db)
	authSvc := authService.NewService(authRepo, cfg, cache)
	authCtrl := auth.NewController(authSvc)
	routes.RegisterAuthRoutes(router, authCtrl, authRepo, cfg)

	
	profileRepo := profileRepo.NewRepository(db)
	profileSvc := profileService.NewService(profileRepo, cfg)
	profileCtrl := profile.NewController(profileSvc)
	routes.RegisterProfileRoutes(router, profileCtrl, cfg, authRepo)

	dashboardRepo := dashboardRepo.NewRepository(db)
	dashboardSvc := dashboardService.NewService(dashboardRepo, cfg)
	dashboardCtrl := dashboard.NewController(dashboardSvc)
	routes.RegisterDashboardRoutes(router, dashboardCtrl, cfg, authRepo)

	orgRepo := orgRepo.NewRepository(db)
	orgSvc := orgService.NewService(orgRepo, authRepo, cfg) 
	orgCtrl := organization.NewController(orgSvc)
	routes.RegisterOrganizationRoutes(router, orgCtrl, cfg, authRepo)

	return router
}