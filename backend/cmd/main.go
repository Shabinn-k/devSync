package main

import (
	"bytes"
	"context"
	"errors"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"gorm.io/gorm"

	"devSync/config"
	"devSync/internal/bootstrap"
	"devSync/internal/seed"
	"devSync/utils/smtp"
)

func main() {
	if err := run(); err != nil {
		log.Print(err)
		os.Exit(1)
	}
}

func run() error {
	cfg := config.LoadConfig()
	if err := cfg.Validate(); err != nil {
		return fmt.Errorf("invalid configuration: %w", err)
	}

	if len(os.Args) > 1 && (os.Args[1] == "migrate" || os.Args[1] == "provision-admin") {
		db, err := config.ConnectDatabase(cfg)
		if err != nil {
			return err
		}
		sqlDB, err := db.DB()
		if err != nil {
			return err
		}
		defer sqlDB.Close()
		if os.Args[1] == "migrate" {
			if err := config.Migrate(db); err != nil {
				return fmt.Errorf("migration failed: %w", err)
			}
			return seed.Run(db)
		}
		return provisionAdmin(db, os.Args[2:])
	}
	if len(os.Args) > 1 {
		return fmt.Errorf("unknown command %q (supported commands: migrate, provision-admin)", os.Args[1])
	}

	db, err := config.ConnectDatabase(cfg)
	if err != nil {
		return err
	}
	sqlDB, err := db.DB()
	if err != nil {
		return err
	}
	defer sqlDB.Close()
	redisClient, err := config.ConnectRedis(cfg)
	if err != nil {
		return err
	}
	defer redisClient.Close()
	smtp.Init(cfg)

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	router := bootstrap.InitRouter(ctx, cfg, db, redisClient)
	server := &http.Server{Addr: ":" + cfg.Port, Handler: router, ReadHeaderTimeout: 10 * time.Second}
	serverErr := make(chan error, 1)
	go func() {
		log.Printf("API listening on port %s", cfg.Port)
		if err := server.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
			serverErr <- err
		}
	}()

	select {
	case <-ctx.Done():
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()
		return server.Shutdown(shutdownCtx)
	case err := <-serverErr:
		return fmt.Errorf("HTTP server failed: %w", err)
	}
}

func provisionAdmin(db *gorm.DB, args []string) error {
	flags := flag.NewFlagSet("provision-admin", flag.ContinueOnError)
	email := flags.String("email", "", "administrator email")
	name := flags.String("name", "", "administrator display name")
	passwordFile := flags.String("password-file", "", "path to a private file containing the initial password")
	if err := flags.Parse(args); err != nil {
		return err
	}
	if *email == "" || *name == "" || *passwordFile == "" {
		return errors.New("provision-admin requires --email, --name, and --password-file")
	}
	info, err := os.Stat(*passwordFile)
	if err != nil {
		return fmt.Errorf("read password file metadata: %w", err)
	}
	if info.Mode().IsRegular() && info.Mode().Perm()&0077 != 0 {
		return errors.New("password file must be private (permissions 0600 or stricter)")
	}
	passwordBytes, err := os.ReadFile(filepath.Clean(*passwordFile))
	if err != nil {
		return fmt.Errorf("read password file: %w", err)
	}
	password := bytes.TrimRight(passwordBytes, "\r\n")
	defer func() {
		for i := range passwordBytes {
			passwordBytes[i] = 0
		}
	}()
	if err := config.CheckSchema(db); err != nil {
		return err
	}
	if err := seed.ProvisionAdmin(db, *name, *email, password); err != nil {
		return fmt.Errorf("provision administrator: %w", err)
	}
	log.Printf("Initial administrator provisioned for %s", *email)
	return nil
}
