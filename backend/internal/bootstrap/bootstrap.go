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
		"devSync/internal/controllers/auth"
		"devSync/internal/controllers/dashboard"
		chatCtrl "devSync/internal/controllers/chat"
		invitationCtrl "devSync/internal/controllers/invitation"
		"devSync/internal/controllers/notification"
		"devSync/internal/controllers/organization"
		"devSync/internal/controllers/profile"
		"devSync/internal/controllers/project"
		taskCtrl "devSync/internal/controllers/task"
		teamCtrl "devSync/internal/controllers/team"
		"devSync/internal/health"
		"devSync/internal/middleware"
		authRepo "devSync/internal/repositories/auth"
		chatRepo "devSync/internal/repositories/chat"
		dashboardRepo "devSync/internal/repositories/dashboard" 
		notifRepo "devSync/internal/repositories/notification"
		orgRepo "devSync/internal/repositories/organization"
		profileRepo "devSync/internal/repositories/profile"
		projectRepo "devSync/internal/repositories/project"
		taskRepo "devSync/internal/repositories/task"
		teamRepo "devSync/internal/repositories/team"
		invitationRepo "devSync/internal/repositories/invitations" 
		"devSync/internal/routes"
		authService "devSync/internal/services/auth"
		chatService "devSync/internal/services/chat"
		dashboardService "devSync/internal/services/dashboard"
		invitationService "devSync/internal/services/invitation"
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

		router.Use(middleware.CORSMiddleware())

		router.Use(middleware.RequestLogger())
		router.Use(middleware.CustomRecovery())
		router.Use(middleware.RateLimit(middleware.NewIPRateLimiter(rate.Limit(10), 20)))
		router.Use(middleware.Timeout(30 * time.Second))

		router.Static("/uploads", "./uploads")

		sqlDB, _ := db.DB()
		healthService := health.NewHealthService()
		healthService.AddCheck("database", health.DatabaseCheck(sqlDB), 5*time.Second)
		healthService.AddCheck("redis", health.RedisCheck(redisClient), 5*time.Second)
		router.GET("/health", healthService.HealthHandler)

		ctx, cancel := context.WithCancel(context.Background())
		defer cancel()
		go healthService.Run(ctx)

		cache := cache.NewRedisCache(redisClient)

		wsHub := ws.NewHub()
		go wsHub.Run()

		workerPool := workers.NewWorkerPool(10, 100)
		workerPool.Start()
		defer workerPool.Stop()

		authRepo := authRepo.NewRepository(db)
		profileRepo := profileRepo.NewRepository(db)
		dashboardRepo := dashboardRepo.NewRepository(db)
		notifRepo := notifRepo.NewRepository(db)
		orgRepo := orgRepo.NewRepository(db)
		projRepo := projectRepo.NewRepository(db)
		taskRepo := taskRepo.NewRepository(db)
		teamRepo := teamRepo.NewRepository(db)
		chatRepo := chatRepo.NewRepository(db)


		authSvc := authService.NewService(authRepo, cfg, cache)
		authCtrl := auth.NewController(authSvc)
		routes.RegisterAuthRoutes(router, authCtrl, cfg, authRepo)

		profileSvc := profileService.NewService(profileRepo, cfg)
		profileCtrl := profile.NewController(profileSvc)
		routes.RegisterProfileRoutes(router, profileCtrl, cfg, authRepo)

		dashboardSvc := dashboardService.NewService(dashboardRepo, cfg, redisClient)
		dashboardCtrl := dashboard.NewController(dashboardSvc)
		routes.RegisterDashboardRoutes(router, dashboardCtrl, cfg, authRepo)

		notifSvc := notifService.NewService(notifRepo, wsHub, cfg)
		notifCtrl := notification.NewController(notifSvc)
		routes.RegisterNotificationRoutes(router, notifCtrl, wsHub, cfg, authRepo)

		orgSvc := orgService.NewService(orgRepo, authRepo, cfg)
		orgCtrl := organization.NewController(orgSvc)
		routes.RegisterOrganizationRoutes(router, orgCtrl, cfg, authRepo)

		projSvc := projectService.NewService(projRepo, orgRepo, teamRepo, authRepo, cfg, notifSvc)
		projCtrl := project.NewController(projSvc)
		routes.RegisterProjectRoutes(router, projCtrl, cfg, authRepo)

		taskSvc := taskService.NewService(taskRepo, projRepo, authRepo, cfg, notifSvc)
		taskCtrl := taskCtrl.NewController(taskSvc)
		routes.RegisterTaskRoutes(router, taskCtrl, cfg, authRepo)

		teamSvc := teamService.NewService(teamRepo, orgRepo, authRepo, cfg, notifSvc)
		teamCtrl := teamCtrl.NewController(teamSvc)
		routes.RegisterTeamRoutes(router, teamCtrl, cfg, authRepo)

		invitationRepo := invitationRepo.NewRepository(db)
		invitationSvc := invitationService.NewService(db, invitationRepo, orgRepo, authRepo, cfg)
		invitationCtrl := invitationCtrl.NewController(invitationSvc)
		routes.RegisterInvitationRoutes(router, invitationCtrl, cfg, authRepo)

		chatSvc := chatService.NewService(chatRepo, authRepo, orgRepo, projRepo, wsHub, cfg)
		chatCtrl := chatCtrl.NewController(chatSvc)
		routes.RegisterChatRoutes(router, chatCtrl, cfg, authRepo)

		log.Println(" All services initialized successfully")
		log.Println(" Server is ready to handle requests")

		return router
	}
