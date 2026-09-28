package middleware

import (
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"devSync/config"
	authRepo "devSync/internal/repositories/auth"
	"devSync/internal/response"
	"devSync/utils/jwt"
)

func AuthRequired(cfg *config.AppConfig, repo authRepo.Repository) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			log.Printf("[AuthRequired] missing or invalid Authorization header: %q", authHeader)
			response.Error(c, http.StatusUnauthorized, "Missing or invalid Authorization header")
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := jwt.ParseToken(tokenString, cfg.JWTAccessSecret)
		if err != nil {
			log.Printf("[AuthRequired] jwt.ParseToken error: %v", err)
			response.Error(c, http.StatusUnauthorized, "Invalid or expired token")
			c.Abort()
			return
		}

		if claims.TokenType != "access" {
			log.Printf("[AuthRequired] wrong token_type: %q (expected 'access')", claims.TokenType)
			response.Error(c, http.StatusUnauthorized, "Invalid token type")
			c.Abort()
			return
		}
 
		user, err := repo.GetUserByID(c.Request.Context(), claims.UserID)
		if err != nil {
			log.Printf("[AuthRequired] GetUserByID error for userID %d: %v", claims.UserID, err)
			response.Error(c, http.StatusUnauthorized, "User account is inactive or not found")
			c.Abort()
			return
		}
		if !user.IsActive {
			log.Printf("[AuthRequired] user.IsActive == false for userID %d", claims.UserID)
			response.Error(c, http.StatusUnauthorized, "User account is inactive or not found")
			c.Abort()
			return
		}
 
		c.Set("userID", claims.UserID)
		c.Set("user", user)
		c.Next()
	}
}