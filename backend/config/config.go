package config

import (
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
)

type AppConfig struct {
	AppName string
	AppEnv  string
	AppPort string
	AppURL  string

	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBSSLMode  string
	DBTimezone string

	JWTAccessSecret  string
	JWTRefreshSecret string
	JWTAccessExpiry  time.Duration
	JWTRefreshExpiry time.Duration

	SMTPHost     string
	SMTPPort     string
	SMTPUsername string
	SMTPPassword string
	SMTPFrom     string
}

func LoadConfig() *AppConfig {
	// Try to load .env from current directory
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️  No .env file found, using system environment variables")
		log.Println("   Make sure you have .env file in the project root")
	}

	return &AppConfig{
		AppName: getEnv("APP_NAME", "DevSync"),
		AppEnv:  getEnv("APP_ENV", "development"),
		AppPort: getEnv("APP_PORT", "8080"),
		AppURL:  getEnv("APP_URL", "http://localhost:8080"),

		DBHost:     mustGetEnv("DB_HOST"),
		DBPort:     mustGetEnv("DB_PORT"),
		DBUser:     mustGetEnv("DB_USER"),
		DBPassword: mustGetEnv("DB_PASSWORD"),
		DBName:     mustGetEnv("DB_NAME"),
		DBSSLMode:  getEnv("DB_SSLMODE", "disable"),
		DBTimezone: getEnv("DB_TIMEZONE", "UTC"),

		JWTAccessSecret:  mustGetEnv("JWT_ACCESS_SECRET"),
		JWTRefreshSecret: mustGetEnv("JWT_REFRESH_SECRET"),
		JWTAccessExpiry:  mustParseDuration("JWT_ACCESS_EXPIRY", 15*time.Minute),
		JWTRefreshExpiry: mustParseDuration("JWT_REFRESH_EXPIRY", 168*time.Hour),

		SMTPHost:     mustGetEnv("SMTP_HOST"),
		SMTPPort:     mustGetEnv("SMTP_PORT"),
		SMTPUsername: mustGetEnv("SMTP_USERNAME"),
		SMTPPassword: mustGetEnv("SMTP_PASSWORD"),
		SMTPFrom:     mustGetEnv("SMTP_FROM"),
	}
}

func getEnv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		return v
	}
	return fallback
}

func mustGetEnv(key string) string {
	v, ok := os.LookupEnv(key)
	if !ok || v == "" {
		log.Fatalf("❌ Required environment variable %s is not set\n   Please set it in .env file or as system variable", key)
	}
	return v
}

func mustParseDuration(key string, fallback time.Duration) time.Duration {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		d, err := time.ParseDuration(v)
		if err != nil {
			log.Fatalf("config: invalid duration for %s: %v", key, err)
		}
		return d
	}
	return fallback
}