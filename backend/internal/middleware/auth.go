package middleware

import (
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
			response.Error(c, http.StatusUnauthorized, "Missing or invalid Authorization header")
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := jwt.ParseToken(tokenString, cfg.JWTAccessSecret)
		if err != nil {
			response.Error(c, http.StatusUnauthorized, "Invalid or expired token")
			c.Abort()
			return
		}

		if claims.TokenType != "access" {
			response.Error(c, http.StatusUnauthorized, "Invalid token type")
			c.Abort()
			return
		}

		user, err := repo.GetUserByID(c.Request.Context(), claims.UserID)
		if err != nil || !user.IsActive {
			response.Error(c, http.StatusUnauthorized, "User account is inactive or not found")
			c.Abort()
			return
		}

		c.Set("userID", claims.UserID)
		c.Next()
	}
}