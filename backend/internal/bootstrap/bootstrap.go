package bootstrap

import (
	"context"
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
	"golang.org/x/time/rate"

	"devSync/config"
	"devSync/internal/cache"
	"devSync/internal/controllers/auth"
	"devSync/internal/controllers/dashboard"
	"devSync/internal/controllers/notification"
	"devSync/internal/controllers/organization"
	"devSync/internal/controllers/profile"
	"devSync/internal/controllers/project"
	taskCtrl "devSync/internal/controllers/task"
	teamCtrl "devSync/internal/controllers/team"
	"devSync/internal/health"
	"devSync/internal/middleware"
	authRepo "devSync/internal/repositories/auth"
	dashboardRepo "devSync/internal/repositories/dashboard"
	notifRepo "devSync/internal/repositories/notification"
	orgRepo "devSync/internal/repositories/organization"
	profileRepo "devSync/internal/repositories/profile"
	projectRepo "devSync/internal/repositories/project"
	taskRepo "devSync/internal/repositories/task"
	teamRepo "devSync/internal/repositories/team"
	"devSync/internal/routes"
	authService "devSync/internal/services/auth"
	dashboardService "devSync/internal/services/dashboard"
	notifService "devSync/internal/services/notification"
	orgService "devSync/internal/services/organization"
	profileService "devSync/internal/services/profile"
	projectService "devSync/internal/services/project"
	taskService "devSync/internal/services/task"
	teamService "devSync/internal/services/team"
	ws "devSync/internal/websocket"
	"devSync/internal/workers"
)

func InitRouter(cfg *config.AppConfig, db *gorm.DB, redisClient *redis.Client) *gin.Engine {
	router := gin.Default()

	// ============ ✅ CORS MUST BE FIRST ============
	router.Use(middleware.CORSMiddleware())

	// ============ OTHER MIDDLEWARE ============
	router.Use(middleware.RequestLogger())
	router.Use(middleware.CustomRecovery())
	router.Use(middleware.RateLimit(middleware.NewIPRateLimiter(rate.Limit(10), 20)))
	router.Use(middleware.Timeout(30 * time.Second))

	// ============ STATIC FILES ============
	router.Static("/uploads", "./uploads")

	// ============ HEALTH CHECK ============
	sqlDB, _ := db.DB()
	healthService := health.NewHealthService()
	healthService.AddCheck("database", health.DatabaseCheck(sqlDB), 5*time.Second)
	healthService.AddCheck("redis", health.RedisCheck(redisClient), 5*time.Second)
	router.GET("/health", healthService.HealthHandler)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	go healthService.Run(ctx)

	// ============ CACHE ============
	cache := cache.NewRedisCache(redisClient)

	// ============ WEB SOCKET HUB ============
	wsHub := ws.NewHub()
	go wsHub.Run()

	// ============ WORKER POOL ============
	workerPool := workers.NewWorkerPool(10, 100)
	workerPool.Start()
	defer workerPool.Stop()

	// ============ REPOSITORIES ============
	authRepo := authRepo.NewRepository(db)
	profileRepo := profileRepo.NewRepository(db)
	dashboardRepo := dashboardRepo.NewRepository(db)
	notifRepo := notifRepo.NewRepository(db)
	orgRepo := orgRepo.NewRepository(db)
	projRepo := projectRepo.NewRepository(db)
	taskRepo := taskRepo.NewRepository(db)
	teamRepo := teamRepo.NewRepository(db)

	// ============ SERVICES & CONTROLLERS ============

	// 1. AUTH SERVICE
	authSvc := authService.NewService(authRepo, cfg, cache)
	authCtrl := auth.NewController(authSvc)
	routes.RegisterAuthRoutes(router, authCtrl, cfg, authRepo)

	// 2. PROFILE SERVICE
	profileSvc := profileService.NewService(profileRepo, cfg)
	profileCtrl := profile.NewController(profileSvc)
	routes.RegisterProfileRoutes(router, profileCtrl, cfg, authRepo)

	// 3. DASHBOARD SERVICE
	dashboardSvc := dashboardService.NewService(dashboardRepo, cfg, redisClient)
	dashboardCtrl := dashboard.NewController(dashboardSvc)
	routes.RegisterDashboardRoutes(router, dashboardCtrl, cfg, authRepo)

	// 4. NOTIFICATION SERVICE
	notifSvc := notifService.NewService(notifRepo, wsHub, cfg)
	notifCtrl := notification.NewController(notifSvc)
	routes.RegisterNotificationRoutes(router, notifCtrl, wsHub, cfg, authRepo)

	// 5. ORGANIZATION SERVICE
	orgSvc := orgService.NewService(orgRepo, authRepo, cfg)
	orgCtrl := organization.NewController(orgSvc)
	routes.RegisterOrganizationRoutes(router, orgCtrl, cfg, authRepo)

	// 6. PROJECT SERVICE
	projSvc := projectService.NewService(projRepo, orgRepo, authRepo, cfg, notifSvc)
	projCtrl := project.NewController(projSvc)
	routes.RegisterProjectRoutes(router, projCtrl, cfg, authRepo)

	// 7. TASK SERVICE
	taskSvc := taskService.NewService(taskRepo, projRepo, authRepo, cfg, notifSvc)
	taskCtrl := taskCtrl.NewController(taskSvc)
	routes.RegisterTaskRoutes(router, taskCtrl, cfg, authRepo)

	// 8. TEAM SERVICE
	teamSvc := teamService.NewService(teamRepo, orgRepo, authRepo, cfg, notifSvc)
	teamCtrl := teamCtrl.NewController(teamSvc)
	routes.RegisterTeamRoutes(router, teamCtrl, cfg, authRepo)

	log.Println("✅ All services initialized successfully")
	log.Println("🚀 Server is ready to handle requests")

	return router
}