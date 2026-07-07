package main

import (
	"log"

	"devSync/config"
	"devSync/internal/bootstrap"
)

func main() {
	cfg := config.LoadConfig()
	db := config.ConnectDatabase(cfg)

	router := bootstrap.InitRouter(cfg, db)

	log.Printf("Server running on port %s", cfg.AppPort)
	if err := router.Run(":" + cfg.AppPort); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}