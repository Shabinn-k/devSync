package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"devSync/internal/model"
)

func RequireMinLevel(minLevel int) gin.HandlerFunc {
	return func(c *gin.Context) {
		v, ok := c.Get("user")
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthenticated"})
			return
		}

		u, ok := v.(*model.User)
		if !ok {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "user context invalid"})
			return
		}

		if u.Role.Level < minLevel {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
			return
		}

		c.Next()
	}
}

func RequireAdmin() gin.HandlerFunc    { return RequireMinLevel(model.RoleIDAdmin) }
func RequireTeamLead() gin.HandlerFunc { return RequireMinLevel(model.RoleIDTeamLead) }