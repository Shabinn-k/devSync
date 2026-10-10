package middleware

import (
	"fmt"
	"sync"
	"testing"
	"time"

	"golang.org/x/time/rate"
)

func TestRateLimiterEnforcesBurstAndRefills(t *testing.T) {
	rl := NewIPRateLimiter(rate.Limit(100), 2)
	limiter := rl.GetLimiter("test")
	if !limiter.Allow() || !limiter.Allow() {
		t.Fatal("initial burst should be allowed")
	}
	if limiter.Allow() {
		t.Fatal("request beyond burst should be rejected")
	}
	time.Sleep(20 * time.Millisecond)
	if !limiter.Allow() {
		t.Fatal("limiter should refill")
	}
}

func TestRateLimiterBoundsTrackedAddresses(t *testing.T) {
	rl := NewIPRateLimiter(rate.Limit(1), 1)
	rl.mu.Lock()
	for n := 0; n < maxTrackedIPs; n++ {
		rl.ips[fmt.Sprint(n)] = &clientEntry{limiter: rate.NewLimiter(1, 1), lastSeen: time.Now()}
	}
	rl.mu.Unlock()
	got := rl.GetLimiter("new-address")
	if got != rl.unknown {
		t.Fatal("saturated limiter should use shared overflow bucket")
	}
	if len(rl.ips) != maxTrackedIPs {
		t.Fatalf("tracked addresses = %d, want %d", len(rl.ips), maxTrackedIPs)
	}
}

func TestRateLimiterConcurrentAccess(t *testing.T) {
	rl := NewIPRateLimiter(rate.Limit(100), 10)
	var wg sync.WaitGroup
	for n := 0; n < 100; n++ {
		wg.Add(1)
		go func(n int) { defer wg.Done(); rl.GetLimiter(fmt.Sprint(n % 20)).Allow() }(n)
	}
	wg.Wait()
}

func TestRateLimiterReclaimsExpiredEntries(t *testing.T) {
	rl := NewIPRateLimiter(rate.Limit(1), 1)
	rl.GetLimiter("stale")
	rl.mu.Lock()
	rl.ips["stale"].lastSeen = time.Now().Add(-11 * time.Minute)
	rl.mu.Unlock()
	rl.cleanup(10 * time.Minute)
	rl.mu.Lock()
	defer rl.mu.Unlock()
	if _, exists := rl.ips["stale"]; exists {
		t.Fatal("expired limiter entry was not reclaimed")
	}
}
