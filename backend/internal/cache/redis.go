package cache

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

// Purpose namespaces OTP keys so email-verification and password-reset don't collide.
type Purpose string

const (
	PurposeVerify Purpose = "verify"
	PurposeReset  Purpose = "reset"
)

var (
	ErrOTPNotFound       = errors.New("otp not found or expired")
	ErrOTPCooldown       = errors.New("please wait before requesting another otp")
	ErrOTPAttemptsExceed = errors.New("too many attempts, request a new otp")
)

type Cache interface {
	SetOTP(ctx context.Context, purpose Purpose, email, otp string, ttl time.Duration) error
	GetOTP(ctx context.Context, purpose Purpose, email string) (string, error)
	DeleteOTP(ctx context.Context, purpose Purpose, email string) error

	IncrOTPAttempts(ctx context.Context, purpose Purpose, email string, ttl time.Duration) (int64, error)
	DeleteOTPAttempts(ctx context.Context, purpose Purpose, email string) error

	SetOTPCooldown(ctx context.Context, purpose Purpose, email string, ttl time.Duration) error
	IsOTPCooldown(ctx context.Context, purpose Purpose, email string) (bool, error)

	MarkOTPVerified(ctx context.Context, purpose Purpose, email string, ttl time.Duration) error
	IsOTPVerified(ctx context.Context, purpose Purpose, email string) (bool, error)
	DeleteOTPVerified(ctx context.Context, purpose Purpose, email string) error
}

type redisCache struct {
	client *redis.Client
}

func NewRedisCache(client *redis.Client) Cache {
	return &redisCache{client: client}
}

// --- OTP ---

func (r *redisCache) SetOTP(ctx context.Context, p Purpose, email, otp string, ttl time.Duration) error {
	return r.client.Set(ctx, otpKey(p, email), otp, ttl).Err()
}

func (r *redisCache) GetOTP(ctx context.Context, p Purpose, email string) (string, error) {
	val, err := r.client.Get(ctx, otpKey(p, email)).Result()
	if err == redis.Nil {
		return "", ErrOTPNotFound
	}
	return val, err
}

func (r *redisCache) DeleteOTP(ctx context.Context, p Purpose, email string) error {
	return r.client.Del(ctx, otpKey(p, email)).Err()
}

// --- Attempts ---

func (r *redisCache) IncrOTPAttempts(ctx context.Context, p Purpose, email string, ttl time.Duration) (int64, error) {
	key := attemptsKey(p, email)
	n, err := r.client.Incr(ctx, key).Result()
	if err != nil {
		return 0, err
	}
	if n == 1 {
		// set TTL only on first increment so it doesn't slide on every attempt
		_ = r.client.Expire(ctx, key, ttl).Err()
	}
	return n, nil
}

func (r *redisCache) DeleteOTPAttempts(ctx context.Context, p Purpose, email string) error {
	return r.client.Del(ctx, attemptsKey(p, email)).Err()
}

// --- Cooldown ---

func (r *redisCache) SetOTPCooldown(ctx context.Context, p Purpose, email string, ttl time.Duration) error {
	return r.client.Set(ctx, cooldownKey(p, email), "1", ttl).Err()
}

func (r *redisCache) IsOTPCooldown(ctx context.Context, p Purpose, email string) (bool, error) {
	n, err := r.client.Exists(ctx, cooldownKey(p, email)).Result()
	if err != nil {
		return false, err
	}
	return n > 0, nil
}
 

func (r *redisCache) MarkOTPVerified(ctx context.Context, p Purpose, email string, ttl time.Duration) error {
	return r.client.Set(ctx, verifiedKey(p, email), "true", ttl).Err()
}

func (r *redisCache) IsOTPVerified(ctx context.Context, p Purpose, email string) (bool, error) {
	val, err := r.client.Get(ctx, verifiedKey(p, email)).Result()
	if err == redis.Nil {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	return val == "true", nil
}

func (r *redisCache) DeleteOTPVerified(ctx context.Context, p Purpose, email string) error {
	return r.client.Del(ctx, verifiedKey(p, email)).Err()
}

// --- key builders ---

func otpKey(p Purpose, email string) string      { return fmt.Sprintf("otp:%s:%s", p, email) }
func attemptsKey(p Purpose, email string) string { return fmt.Sprintf("otp:attempts:%s:%s", p, email) }
func cooldownKey(p Purpose, email string) string { return fmt.Sprintf("otp:cooldown:%s:%s", p, email) }
func verifiedKey(p Purpose, email string) string { return fmt.Sprintf("otp:verified:%s:%s", p, email) }