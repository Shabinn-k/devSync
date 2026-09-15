package circuit

import (
	"errors"
	"sync"
	"time"
)

type State int

const (
	StateClosed State = iota
	StateOpen
	StateHalfOpen
)

type CircuitBreaker struct {
	state           State
	failureCount    int
	successCount    int
	maxFailures     int
	timeout         time.Duration
	lastFailureTime time.Time
	mu              sync.RWMutex
}

func NewCircuitBreaker(maxFailures int, timeout time.Duration) *CircuitBreaker {
	return &CircuitBreaker{
		state:       StateClosed,
		maxFailures: maxFailures,
		timeout:     timeout,
	}
}

func (cb *CircuitBreaker) Execute(fn func() error) error {
	if cb.isOpen() {
		return errors.New("circuit breaker is open")
	}

	err := fn()
	cb.recordResult(err)
	return err
}

func (cb *CircuitBreaker) isOpen() bool {
	cb.mu.RLock()
	defer cb.mu.RUnlock()

	if cb.state == StateOpen {
		if time.Since(cb.lastFailureTime) > cb.timeout {
			cb.state = StateHalfOpen
			return false
		}
		return true
	}
	return false
}

func (cb *CircuitBreaker) recordResult(err error) {
	cb.mu.Lock()
	defer cb.mu.Unlock()

	if err == nil {
		cb.successCount++
		if cb.state == StateHalfOpen && cb.successCount >= cb.maxFailures/2 {
			cb.state = StateClosed
			cb.failureCount = 0
			cb.successCount = 0
		}
		return
	}

	cb.failureCount++
	cb.lastFailureTime = time.Now()

	if cb.state == StateHalfOpen || cb.failureCount >= cb.maxFailures {
		cb.state = StateOpen
		cb.failureCount = 0
		cb.successCount = 0
	}
}
