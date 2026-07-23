package config

import (
	"fmt"
	"log"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"devSync/internal/model"
)

func ConnectDatabase(cfg *AppConfig) *gorm.DB {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s TimeZone=%s",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword,
		cfg.DBName, cfg.DBSSLMode, cfg.DBTimezone,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
	})
	if err != nil {
		log.Fatalf("config: failed to connect to database: %v", err)
	}

	// Auto migrate
	if err := db.AutoMigrate(&model.User{}, &model.RefreshToken{}); err != nil {
		log.Fatalf("config: failed to migrate database: %v", err)
	}

	log.Println("config: database connected and migrated successfully")
	return db
}