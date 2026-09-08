package health

import (
	"context"
	"database/sql"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

// Checker represents a health check
type Checker struct {
	Name    string
	Check   func(ctx context.Context) error
	Timeout time.Duration
}

// HealthService manages health checks
type HealthService struct {
	checks   []Checker
	mu       sync.RWMutex
	status   map[string]bool
	lastCheck time.Time
}

// NewHealthService creates a new health service
func NewHealthService() *HealthService {
	return &HealthService{
		checks: make([]Checker, 0),
		status: make(map[string]bool),
	}
}

// AddCheck adds a health check
func (hs *HealthService) AddCheck(name string, check func(ctx context.Context) error, timeout time.Duration) {
	hs.checks = append(hs.checks, Checker{
		Name:    name,
		Check:   check,
		Timeout: timeout,
	})
}

// Run runs all health checks
func (hs *HealthService) Run(ctx context.Context) {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			hs.runChecks(ctx)
		case <-ctx.Done():
			return
		}
	}
}

// runChecks runs all registered checks
func (hs *HealthService) runChecks(ctx context.Context) {
	hs.mu.Lock()
	defer hs.mu.Unlock()

	hs.lastCheck = time.Now()
	allHealthy := true

	for _, check := range hs.checks {
		checkCtx, cancel := context.WithTimeout(ctx, check.Timeout)
		defer cancel()

		err := check.Check(checkCtx)
		hs.status[check.Name] = err == nil
		if err != nil {
			allHealthy = false
		}
	}

	hs.status["overall"] = allHealthy
}

// HealthHandler handles health check requests
func (hs *HealthService) HealthHandler(c *gin.Context) {
	hs.mu.RLock()
	defer hs.mu.RUnlock()

	status := hs.status["overall"]
	statusCode := http.StatusOK
	if !status {
		statusCode = http.StatusServiceUnavailable
	}

	c.JSON(statusCode, gin.H{
		"status":     status,
		"checks":     hs.status,
		"last_check": hs.lastCheck,
	})
}

// DatabaseCheck creates a database health check
func DatabaseCheck(db *sql.DB) func(ctx context.Context) error {
	return func(ctx context.Context) error {
		return db.PingContext(ctx)
	}
}

// RedisCheck creates a Redis health check
func RedisCheck(client *redis.Client) func(ctx context.Context) error {
	return func(ctx context.Context) error {
		return client.Ping(ctx).Err()
	}
}