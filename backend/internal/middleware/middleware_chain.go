package middleware

import (
	"context"
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

		c.Next()

		latency := time.Since(start)
		statusCode := c.Writer.Status()
	
		log.Printf("[%s] %s %d %v", method, path, statusCode, latency)
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
		c.Next()
	}
}