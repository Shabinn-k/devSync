package cache

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type Cache interface {
	SetOTP(ctx context.Context, email, otp string, expiration time.Duration) error
	GetOTP(ctx context.Context, email string) (string, error)
	DeleteOTP(ctx context.Context, email string) error
	MarkOTPVerified(ctx context.Context, email string) error
	IsOTPVerified(ctx context.Context, email string) (bool, error)
	DeleteOTPVerified(ctx context.Context, email string) error
}

type redisCache struct {
	client *redis.Client
}

func NewRedisCache(client *redis.Client) Cache {
	return &redisCache{client: client}
}

func (r *redisCache) SetOTP(ctx context.Context, email, otp string, expiration time.Duration) error {
	key := fmt.Sprintf("otp:%s", email)
	return r.client.Set(ctx, key, otp, expiration).Err()
}

func (r *redisCache) GetOTP(ctx context.Context, email string) (string, error) {
	key := fmt.Sprintf("otp:%s", email)
	return r.client.Get(ctx, key).Result()
}

func (r *redisCache) DeleteOTP(ctx context.Context, email string) error {
	key := fmt.Sprintf("otp:%s", email)
	return r.client.Del(ctx, key).Err()
}

func (r *redisCache) MarkOTPVerified(ctx context.Context, email string) error {
	key := fmt.Sprintf("otp:verified:%s", email)
	return r.client.Set(ctx, key, "true", 10*time.Minute).Err()
}

func (r *redisCache) IsOTPVerified(ctx context.Context, email string) (bool, error) {
	key := fmt.Sprintf("otp:verified:%s", email)
	val, err := r.client.Get(ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			return false, nil
		}
		return false, err
	}
	return val == "true", nil
}

func (r *redisCache) DeleteOTPVerified(ctx context.Context, email string) error {
	key := fmt.Sprintf("otp:verified:%s", email)
	return r.client.Del(ctx, key).Err()
}