package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

const maxTrackedIPs = 20000

type clientEntry struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

type IPRateLimiter struct {
	ips     map[string]*clientEntry
	mu      sync.Mutex
	r       rate.Limit
	b       int
	unknown *rate.Limiter
}

func NewIPRateLimiter(r rate.Limit, b int) *IPRateLimiter {
	return &IPRateLimiter{ips: make(map[string]*clientEntry), r: r, b: b, unknown: rate.NewLimiter(r, b)}
}

func (i *IPRateLimiter) cleanupLocked(now time.Time, ttl time.Duration) {
	for ip, entry := range i.ips {
		if now.Sub(entry.lastSeen) > ttl {
			delete(i.ips, ip)
		}
	}
}

func (i *IPRateLimiter) cleanup(ttl time.Duration) {
	i.mu.Lock()
	i.cleanupLocked(time.Now(), ttl)
	i.mu.Unlock()
}

func (i *IPRateLimiter) GetLimiter(ip string) *rate.Limiter {
	i.mu.Lock()
	defer i.mu.Unlock()
	now := time.Now()
	if entry, ok := i.ips[ip]; ok {
		entry.lastSeen = now
		return entry.limiter
	}
	if len(i.ips) >= maxTrackedIPs {
		i.cleanupLocked(now, 10*time.Minute)
		if len(i.ips) >= maxTrackedIPs {
			// New keys share a bounded overflow bucket instead of causing memory
			// growth or gaining fresh per-key bursts during address churn.
			return i.unknown
		}
	}
	entry := &clientEntry{limiter: rate.NewLimiter(i.r, i.b), lastSeen: now}
	i.ips[ip] = entry
	return entry.limiter
}

func RateLimit(rl *IPRateLimiter) gin.HandlerFunc { return RateLimitScope(rl, "api") }

func RateLimitScope(rl *IPRateLimiter, scope string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if !rl.GetLimiter(scope + ":" + c.ClientIP()).Allow() {
			c.JSON(http.StatusTooManyRequests, gin.H{"error": "Too many requests. Please try again later."})
			c.Abort()
			return
		}
		c.Next()
	}
}
