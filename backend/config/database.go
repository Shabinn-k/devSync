package config

import (
	"crypto/tls"
	"fmt"
	"net/url"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"devSync/internal/model"
)

func ConnectDatabase(cfg *AppConfig) (*gorm.DB, error) {
	dsn := databaseDSN(cfg)
	logLevel := logger.Warn
	if cfg.Env == "development" {
		logLevel = logger.Info
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
	})
	if err != nil {
		return nil, fmt.Errorf("connect to database: %w", err)
	}
	return db, nil
}

func databaseDSN(cfg *AppConfig) string {
	query := url.Values{}
	query.Set("sslmode", cfg.DBSSLMode)
	query.Set("TimeZone", cfg.DBTimezone)
	if cfg.DBSSLRootCert != "" {
		query.Set("sslrootcert", cfg.DBSSLRootCert)
	}
	// GORM's PostgreSQL dialector extracts TimeZone with a regexp before
	// pgx parses the URL. Keep the timezone value unescaped so names such as
	// Asia/Kolkata are not passed to PostgreSQL as Asia%2FKolkata.
	encodedQuery := query.Encode()
	encodedTimezone := "TimeZone=" + url.QueryEscape(cfg.DBTimezone)
	rawTimezone := "TimeZone=" + cfg.DBTimezone
	encodedQuery = strings.Replace(encodedQuery, encodedTimezone, rawTimezone, 1)
	dsn := &url.URL{
		Scheme:   "postgres",
		User:     url.UserPassword(cfg.DBUser, cfg.DBPassword),
		Host:     fmt.Sprintf("%s:%s", cfg.DBHost, cfg.DBPort),
		Path:     "/" + cfg.DBName,
		RawQuery: encodedQuery,
	}
	return dsn.String()
}

func ConnectRedis(cfg *AppConfig) (*redis.Client, error) {
	options := &redis.Options{
		Addr:     cfg.RedisHost + ":" + cfg.RedisPort,
		Password: cfg.RedisPassword,
		DB:       cfg.RedisDB,
	}
	if cfg.RedisTLS {
		options.TLSConfig = &tls.Config{MinVersion: tls.VersionTLS12, ServerName: cfg.RedisHost}
	}
	client := redis.NewClient(options)

	return client, nil
}

func Migrate(db *gorm.DB) error {
    return db.Transaction(func(tx *gorm.DB) error {
        if err := tx.Exec(
            "SELECT pg_advisory_xact_lock(729184302)",
        ).Error; err != nil {
            return fmt.Errorf("acquire migration lock: %w", err)
        }

        if err := tx.AutoMigrate(&schemaMigration{}); err != nil {
            return fmt.Errorf("initialize migration history: %w", err)
        }

        const initialSchema = "001_initial_gorm_schema"

        var applied schemaMigration
        result := tx.Where("version = ?", initialSchema).First(&applied)

        if result.Error == nil {
            return nil
        }
        if result.Error != gorm.ErrRecordNotFound {
            return result.Error
        }

        if err := tx.AutoMigrate(
            &model.Role{},
            &model.User{},
            &model.RefreshToken{},
            &model.UserProfile{},
            &model.Organization{},
            &model.OrganizationMember{},
            &model.OrganizationJoinRequest{},
            &model.Project{},
            &model.ProjectMember{},
            &model.Task{},
            &model.Comment{},
            &model.Team{},
            &model.TeamMember{},
            &model.Notification{},
            &model.OrganizationInvitation{},
            &model.ChatChannel{},
            &model.ChatMember{},
            &model.ChatMessage{},
        ); err != nil {
            return err
        }

        return tx.Create(&schemaMigration{
            Version: initialSchema,
        }).Error
    })
}
type schemaMigration struct {
	Version   string `gorm:"primaryKey;size:100"`
	AppliedAt time.Time
}

func CheckSchema(db *gorm.DB) error {
	models := []any{&model.Role{}, &model.User{}, &model.RefreshToken{}, &model.UserProfile{},
		&model.Organization{}, &model.OrganizationMember{}, &model.OrganizationJoinRequest{},
		&model.Project{}, &model.ProjectMember{}, &model.Task{}, &model.Comment{},
		&model.Team{}, &model.TeamMember{}, &model.Notification{}, &model.OrganizationInvitation{},
		&model.ChatChannel{}, &model.ChatMember{}, &model.ChatMessage{}}
	for _, m := range models {
		if !db.Migrator().HasTable(m) {
			return fmt.Errorf("database schema is incomplete; run the explicit migrate command (missing %T)", m)
		}
	}
	return nil
}
