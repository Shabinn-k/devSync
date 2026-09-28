package bootstrap

import (
	"context"
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"golang.org/x/time/rate"
	"gorm.io/gorm"

	"devSync/config"
	"devSync/internal/cache"
	adminCtrl "devSync/internal/controllers/admin"
	"devSync/internal/controllers/auth"
	chatCtrl "devSync/internal/controllers/chat"
	"devSync/internal/controllers/dashboard"
	invitationCtrl "devSync/internal/controllers/invitation"
	joinRequestCtrl "devSync/internal/controllers/join_request"
	"devSync/internal/controllers/notification"
	"devSync/internal/controllers/organization"
	"devSync/internal/controllers/profile"
	"devSync/internal/controllers/project"
	taskCtrl "devSync/internal/controllers/task"
	teamCtrl "devSync/internal/controllers/team"
	"devSync/internal/health"
	"devSync/internal/middleware"
	adminRepo "devSync/internal/repositories/admin"
	authRepo "devSync/internal/repositories/auth"
	chatRepo "devSync/internal/repositories/chat"
	dashboardRepo "devSync/internal/repositories/dashboard"
	invitationRepo "devSync/internal/repositories/invitations"
	joinRequestRepo "devSync/internal/repositories/join_request"
	notifRepo "devSync/internal/repositories/notification"
	orgRepo "devSync/internal/repositories/organization"
	profileRepo "devSync/internal/repositories/profile"
	projectRepo "devSync/internal/repositories/project"
	taskRepo "devSync/internal/repositories/task"
	teamRepo "devSync/internal/repositories/team"
	"devSync/internal/routes"
	adminService "devSync/internal/services/admin"
	authService "devSync/internal/services/auth"
	chatService "devSync/internal/services/chat"
	dashboardService "devSync/internal/services/dashboard"
	invitationService "devSync/internal/services/invitation"
	joinRequestService "devSync/internal/services/join_request"
	notifService "devSync/internal/services/notification"
	orgService "devSync/internal/services/organization"
	profileService "devSync/internal/services/profile"
	projectService "devSync/internal/services/project"
	taskService "devSync/internal/services/task"
	teamService "devSync/internal/services/team"
	ws "devSync/internal/websocket"
)

func InitRouter(ctx context.Context, cfg *config.AppConfig, db *gorm.DB, redisClient *redis.Client) *gin.Engine {
	router := gin.Default()

	router.Use(middleware.CORSMiddleware(cfg.CORSOrigins))
	router.Use(middleware.RequestLogger())
	router.Use(middleware.CustomRecovery())

	rl := rate.Limit(100)
	burst := 200
	if cfg.Env == "production" {
		rl = rate.Limit(10)
		burst = 20
	}
	router.Use(middleware.RateLimit(middleware.NewIPRateLimiter(rl, burst)))
	router.Use(middleware.Timeout(30 * time.Second))

	router.Static("/uploads", "./uploads")

	// ---- Health ----
	sqlDB, _ := db.DB()
	healthService := health.NewHealthService()
	healthService.AddCheck("database", health.DatabaseCheck(sqlDB), 5*time.Second)
	healthService.AddCheck("redis", health.RedisCheck(redisClient), 5*time.Second)
	router.GET("/health", healthService.HealthHandler)

	go healthService.Run(ctx)

	// ---- Cache & WebSocket hub ----
	cacheLayer := cache.NewRedisCache(redisClient)

	wsHub := ws.NewHub()
	go wsHub.Run()

	// ---- Repositories ----
	authRepository := authRepo.NewRepository(db)
	profileRepository := profileRepo.NewRepository(db)
	dashboardRepository := dashboardRepo.NewRepository(db)
	notifRepository := notifRepo.NewRepository(db)
	orgRepository := orgRepo.NewRepository(db)
	projRepository := projectRepo.NewRepository(db)
	taskRepository := taskRepo.NewRepository(db)
	teamRepository := teamRepo.NewRepository(db)
	chatRepository := chatRepo.NewRepository(db)
	invitationRepository := invitationRepo.NewRepository(db)
	adminRepository := adminRepo.NewRepository(db)
	joinRequestRepository := joinRequestRepo.NewRepository(db)

	// ---- Auth ----
	authSvc := authService.NewService(authRepository, cfg, cacheLayer)
	authController := auth.NewController(authSvc)
	routes.RegisterAuthRoutes(router, authController, cfg, authRepository)

	// ---- Profile ----
	profileSvc := profileService.NewService(profileRepository, cfg)
	profileController := profile.NewController(profileSvc)
	routes.RegisterProfileRoutes(router, profileController, cfg, authRepository)

	// ---- Dashboard ----
	dashboardSvc := dashboardService.NewService(dashboardRepository, cfg, redisClient)
	dashboardController := dashboard.NewController(dashboardSvc)
	routes.RegisterDashboardRoutes(router, dashboardController, cfg, authRepository)

	// ---- Notifications ----
	notifSvc := notifService.NewService(notifRepository, wsHub, cfg)
	notifController := notification.NewController(notifSvc)
	routes.RegisterNotificationRoutes(router, notifController, wsHub, cfg, authRepository)

	// ---- Organizations ----
	orgSvc := orgService.NewService(orgRepository, authRepository, cfg)
	orgController := organization.NewController(orgSvc)
	routes.RegisterOrganizationRoutes(router, orgController, cfg, authRepository)

	// ---- Projects ----
	projSvc := projectService.NewService(projRepository, orgRepository, teamRepository, authRepository, cfg, notifSvc)
	projController := project.NewController(projSvc)
	routes.RegisterProjectRoutes(router, projController, cfg, authRepository)

	// ---- Tasks ----
	taskSvc := taskService.NewService(taskRepository, projRepository, authRepository, cfg, notifSvc)
	taskController := taskCtrl.NewController(taskSvc)
	routes.RegisterTaskRoutes(router, taskController, cfg, authRepository)

	// ---- Teams ----
	teamSvc := teamService.NewService(teamRepository, orgRepository, authRepository, cfg, notifSvc)
	teamController := teamCtrl.NewController(teamSvc)
	routes.RegisterTeamRoutes(router, teamController, cfg, authRepository)

	// ---- Invitations ----
	invitationSvc := invitationService.NewService(db, invitationRepository, orgRepository, authRepository, cfg)
	invitationController := invitationCtrl.NewController(invitationSvc)
	routes.RegisterInvitationRoutes(router, invitationController, cfg, authRepository)

	// ---- Chat ----
	chatSvc := chatService.NewService(chatRepository, authRepository, orgRepository, projRepository, wsHub, cfg)
	chatController := chatCtrl.NewController(chatSvc)
	routes.RegisterChatRoutes(router, chatController, cfg, authRepository)

	// ---- Admin ----
	adminSvc := adminService.NewService(adminRepository, authRepository, redisClient, cfg)
	adminController := adminCtrl.NewController(adminSvc)
	routes.RegisterAdminRoutes(
		router,
		adminController,
		middleware.AuthRequired(cfg, authRepository),
		middleware.RequireAdmin(),
	)

	// ---- Join Requests ----
	joinRequestSvc := joinRequestService.NewService(joinRequestRepository, orgRepository, authRepository, notifSvc, cfg)
	joinRequestController := joinRequestCtrl.NewController(joinRequestSvc)
	routes.RegisterJoinRequestRoutes(router, joinRequestController, cfg, authRepository)

	log.Println("All services initialized successfully")
	log.Println("Server is ready to handle requests")

	return router
}
