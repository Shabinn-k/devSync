package middleware

import (
	"bytes"
	"context"
	"io"
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

type Chain []gin.HandlerFunc

func (c Chain) Then(handler gin.HandlerFunc) gin.HandlerFunc {
	for i := len(c) - 1; i >= 0; i-- {
		next := handler
		current := c[i]
		handler = func(ctx *gin.Context) {
			current(ctx)
			if !ctx.IsAborted() {
				next(ctx)
			}
		}
	}
	return handler
}

func RequestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		method := c.Request.Method

		var body []byte
		if c.Request.Body != nil {
			body, _ = io.ReadAll(c.Request.Body)
			c.Request.Body = io.NopCloser(bytes.NewReader(body))
		}

		c.Next()

		latency := time.Since(start)
		statusCode := c.Writer.Status()

		log.Printf("[%s] %s %s %d %v", method, path, string(body), statusCode, latency)
	}
}

func CustomRecovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("Panic recovered: %v", err)
				c.JSON(500, gin.H{
					"error": "Internal server error",
				})
				c.Abort()
			}
		}()
		c.Next()
	}
}

func Timeout(timeout time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), timeout)
		defer cancel()

		c.Request = c.Request.WithContext(ctx)

		done := make(chan bool)
		go func() {
			c.Next()
			done <- true
		}()

		select {
		case <-done:
			return
		case <-ctx.Done():
			c.JSON(504, gin.H{
				"error": "Request timeout",
			})
			c.Abort()
		}
	}
}