package main

import (
	"log"

	"devSync/config"
	"devSync/internal/bootstrap"
)

func main() {
	cfg := config.LoadConfig()
	db := config.ConnectDatabase(cfg)
	redisClient := config.ConnectRedis(cfg)

	router := bootstrap.InitRouter(cfg, db, redisClient)

	log.Printf("Server running on port %s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
	