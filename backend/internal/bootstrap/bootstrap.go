package bootstrap

import (
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"

	"devSync/config"
	"devSync/internal/cache"
	"devSync/internal/controllers/auth"
	"devSync/internal/middleware"
	authRepo "devSync/internal/repositories/auth"
	"devSync/internal/routes"
	authService "devSync/internal/services/auth"
)

func InitRouter(cfg *config.AppConfig, db *gorm.DB, redisClient *redis.Client) *gin.Engine {
	router := gin.Default()

	router.Use(middleware.CORSMiddleware())
 
	cache := cache.NewRedisCache(redisClient)
 
	repo := authRepo.NewRepository(db)
	svc := authService.NewService(repo, cfg, cache)
	ctrl := auth.NewController(svc)
	routes.RegisterAuthRoutes(router, ctrl, repo, cfg)

	return router
}