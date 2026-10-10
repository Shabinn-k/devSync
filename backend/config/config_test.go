package config

import (
	"strings"
	"testing"
	"time"
)

func TestValidateRequiresJWTSecrets(t *testing.T) {
	cfg := &AppConfig{Env: "development", DBPassword: "local"}
	if err := cfg.Validate(); err == nil {
		t.Fatal("expected missing JWT secrets to be rejected")
	}
}

func TestDatabaseDSNLeavesTimezoneDecodedForGORM(t *testing.T) {
	config := &AppConfig{
		DBHost: "localhost", DBPort: "5432", DBUser: "postgres", DBPassword: "local",
		DBName: "devsync", DBSSLMode: "disable", DBTimezone: "Asia/Kolkata",
	}
	dsn := databaseDSN(config)
	if !strings.Contains(dsn, "TimeZone=Asia/Kolkata") {
		t.Fatalf("DSN does not contain decoded timezone: %s", dsn)
	}
	if strings.Contains(dsn, "Asia%2FKolkata") {
		t.Fatalf("DSN contains an encoded timezone that GORM passes through: %s", dsn)
	}
}

func TestValidateProductionRejectsInsecureConfiguration(t *testing.T) {
	cfg := &AppConfig{Env: "production", DBHost: "db.internal", DBUser: "app", DBPassword: "db-password", DBSSLMode: "disable", JWTAccessSecret: "long-enough-secret-value-xxxxxxxx", JWTRefreshSecret: "another-long-secret-value-yyyyyyyy"}
	if err := cfg.Validate(); err == nil {
		t.Fatal("expected insecure production configuration to be rejected")
	}
}

func TestValidateProductionRejectsUnrestrictedProxyTrust(t *testing.T) {
	cfg := &AppConfig{
		Env: "production", DBHost: "db.internal", DBUser: "app", DBPassword: "database-password-longer-than-16",
		DBSSLMode: "verify-full", DBSSLRootCert: "/run/secrets/rds-ca.pem",
		RedisHost: "redis.internal", RedisPassword: "redis-password-longer-than-32-characters", RedisTLS: true,
		JWTAccessSecret: "long-enough-secret-value-xxxxxxxx", JWTRefreshSecret: "another-long-secret-value-yyyyyyyy",
		JWTAccessExpiry: 15 * time.Minute, JWTRefreshExpiry: 7 * 24 * time.Hour,
		FrontendURL: "https://app.example.com", CORSOrigins: "https://app.example.com",
		TrustedProxies: "0.0.0.0/0",
	}
	if err := cfg.Validate(); err == nil {
		t.Fatal("expected unrestricted trusted proxy configuration to be rejected")
	}
}

func TestValidateAcceptsSecureProductionConfiguration(t *testing.T) {
	cfg := &AppConfig{
		Env: "production", DBHost: "db.internal", DBUser: "app", DBPassword: "database-password-longer-than-16",
		DBSSLMode: "verify-full", DBSSLRootCert: "/run/secrets/rds-ca.pem",
		RedisHost: "redis.internal", RedisPassword: "redis-password-longer-than-32-characters", RedisTLS: true,
		JWTAccessSecret: "long-enough-secret-value-xxxxxxxx", JWTRefreshSecret: "another-long-secret-value-yyyyyyyy",
		JWTAccessExpiry: 15 * time.Minute, JWTRefreshExpiry: 7 * 24 * time.Hour,
		FrontendURL: "https://app.example.com", CORSOrigins: "https://app.example.com",
		TrustedProxies: "172.17.0.1",
	}
	if err := cfg.Validate(); err != nil {
		t.Fatalf("expected secure configuration to pass: %v", err)
	}
}
