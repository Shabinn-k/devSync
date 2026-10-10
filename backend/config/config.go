package config

import (
	"errors"
	"fmt"
	"net"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type AppConfig struct {
	// Server
	Port string

	// Database
	DBHost        string
	DBPort        string
	DBUser        string
	DBPassword    string
	DBName        string
	DBSSLMode     string
	DBSSLRootCert string
	DBTimezone    string

	// Redis
	RedisHost     string
	RedisPort     string
	RedisPassword string
	RedisDB       int
	RedisTLS      bool

	// JWT
	JWTAccessSecret  string
	JWTRefreshSecret string
	JWTAccessExpiry  time.Duration
	JWTRefreshExpiry time.Duration

	// Email
	SMTPHost     string
	SMTPPort     string
	SMTPUsername string
	SMTPPassword string
	SMTPFrom     string

	// Frontend URL
	FrontendURL    string
	CORSOrigins    string
	TrustedProxies string

	// Environment
	Env string
}

func LoadConfig() *AppConfig {
	_ = godotenv.Load(".env", "backend/.env", "../.env")

	return &AppConfig{
		Port: getEnv("PORT", "8080"),

		DBHost:        getEnv("DB_HOST", "localhost"),
		DBPort:        getEnv("DB_PORT", "5432"),
		DBUser:        getEnv("DB_USER", "postgres"),
		DBPassword:    getEnv("DB_PASSWORD", "postgres"),
		DBName:        getEnv("DB_NAME", "devsync"),
		DBSSLMode:     getEnv("DB_SSLMODE", "disable"),
		DBSSLRootCert: getEnv("DB_SSLROOTCERT", ""),
		DBTimezone:    getEnv("DB_TIMEZONE", "UTC"),

		RedisHost:     getEnv("REDIS_HOST", "localhost"),
		RedisPort:     getEnv("REDIS_PORT", "6379"),
		RedisPassword: getEnv("REDIS_PASSWORD", ""),
		RedisDB:       getEnvAsInt("REDIS_DB", 0),
		RedisTLS:      getEnvAsBool("REDIS_TLS", false),

		JWTAccessSecret:  getEnv("JWT_ACCESS_SECRET", ""),
		JWTRefreshSecret: getEnv("JWT_REFRESH_SECRET", ""),
		JWTAccessExpiry:  time.Duration(getEnvAsInt("JWT_ACCESS_EXPIRY", 900)) * time.Second,
		JWTRefreshExpiry: time.Duration(getEnvAsInt("JWT_REFRESH_EXPIRY", 604800)) * time.Second,

		SMTPHost:     getEnv("SMTP_HOST", "smtp.gmail.com"),
		SMTPPort:     getEnv("SMTP_PORT", "587"),
		SMTPUsername: getEnv("SMTP_USERNAME", ""),
		SMTPPassword: getEnv("SMTP_PASSWORD", ""),
		SMTPFrom:     getEnv("SMTP_FROM", "noreply@devsync.com"),

		FrontendURL:    getEnv("FRONTEND_URL", "http://localhost:5173"),
		CORSOrigins:    getEnv("CORS_ORIGINS", getEnv("FRONTEND_URL", "http://localhost:5173")),
		TrustedProxies: getEnv("TRUSTED_PROXIES", ""),

		Env: getEnv("ENV", "development"),
	}
}

// Validate rejects unsafe or incomplete production configuration before any
// network connection is attempted. Development retains local DB defaults.
func (c *AppConfig) Validate() error {
	if c.Env != "development" && c.Env != "production" {
		return fmt.Errorf("ENV must be development or production")
	}
	if strings.TrimSpace(c.DBPassword) == "" {
		return errors.New("DB_PASSWORD is required")
	}
	if c.JWTAccessSecret == "" || c.JWTRefreshSecret == "" {
		return errors.New("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET are required")
	}
	if c.JWTAccessSecret == c.JWTRefreshSecret {
		return errors.New("JWT access and refresh secrets must be different")
	}
	if c.JWTAccessExpiry <= 0 || c.JWTRefreshExpiry <= 0 {
		return errors.New("JWT access and refresh expiries must be positive")
	}
	if c.Env == "production" {
		if c.JWTAccessExpiry > 15*time.Minute {
			return errors.New("production JWT_ACCESS_EXPIRY must not exceed 15 minutes")
		}
		if c.DBHost == "" || c.DBHost == "localhost" || c.DBHost == "127.0.0.1" || c.DBUser == "postgres" || c.DBPassword == "postgres" {
			return errors.New("production database settings must explicitly configure a private host and non-default credentials")
		}
		if len(c.DBPassword) < 16 {
			return errors.New("production DB_PASSWORD must be at least 16 characters")
		}
		for name, value := range map[string]string{
			"JWT_ACCESS_SECRET":  c.JWTAccessSecret,
			"JWT_REFRESH_SECRET": c.JWTRefreshSecret,
		} {
			if len(value) < 32 || strings.Contains(strings.ToLower(value), "replace") || strings.Contains(strings.ToLower(value), "change-this") || strings.Contains(strings.ToLower(value), "devsync") {
				return fmt.Errorf("%s must be at least 32 characters and not a development placeholder", name)
			}
		}
		if c.DBSSLMode != "verify-full" {
			return errors.New("production DB_SSLMODE must be verify-full")
		}
		if c.DBSSLRootCert == "" {
			return errors.New("production DB_SSLROOTCERT must point to the trusted PostgreSQL CA bundle")
		}
		if c.RedisHost == "" || c.RedisHost == "localhost" || c.RedisHost == "127.0.0.1" || c.RedisPassword == "" {
			return errors.New("production REDIS_PASSWORD is required")
		}
		if len(c.RedisPassword) < 32 {
			return errors.New("production REDIS_PASSWORD must be at least 32 characters")
		}
		if !c.RedisTLS {
			return errors.New("production REDIS_TLS must be true")
		}
		if c.CORSOrigins == "" || strings.Contains(c.CORSOrigins, "*") {
			return errors.New("production CORS_ORIGINS must list explicit trusted origins")
		}
		if strings.TrimSpace(c.TrustedProxies) == "" {
			return errors.New("production TRUSTED_PROXIES must specify the reverse proxy address or CIDR")
		}
		for _, proxy := range strings.Split(c.TrustedProxies, ",") {
			proxy = strings.TrimSpace(proxy)
			if proxy == "0.0.0.0/0" || proxy == "::/0" || (net.ParseIP(proxy) == nil && !validCIDR(proxy)) {
				return errors.New("TRUSTED_PROXIES must contain valid, restricted IP addresses or CIDRs")
			}
		}
		for _, origin := range strings.Split(c.CORSOrigins, ",") {
			parsed, err := url.Parse(strings.TrimSpace(origin))
			if err != nil || parsed.Scheme != "https" || parsed.Host == "" || parsed.Path != "" {
				return errors.New("production CORS_ORIGINS must contain only HTTPS origins without paths")
			}
		}
		frontend, err := url.Parse(c.FrontendURL)
		if err != nil || frontend.Scheme != "https" || frontend.Host == "" {
			return errors.New("production FRONTEND_URL must be an HTTPS URL")
		}
	}
	return nil
}

func validCIDR(value string) bool {
	_, _, err := net.ParseCIDR(value)
	return err == nil
}

func getEnvAsBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if parsed, err := strconv.ParseBool(value); err == nil {
			return parsed
		}
	}
	return defaultValue
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}
