package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"devSync/config"
	"devSync/internal/bootstrap"
	"devSync/internal/seed"
	"devSync/utils/smtp"
)

func main() {
	cfg := config.LoadConfig()
	db := config.ConnectDatabase(cfg)
	redisClient := config.ConnectRedis(cfg)
	smtp.Init(cfg)

	if err := seed.Run(db); err != nil {
		log.Fatalf("seed failed: %v", err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go func() {
		sig := make(chan os.Signal, 1)
		signal.Notify(sig, os.Interrupt, syscall.SIGTERM)
		<-sig
		log.Println("shutdown signal received")
		cancel()
	}()

	router := bootstrap.InitRouter(ctx, cfg, db, redisClient)

	log.Printf("Server running on port %s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}