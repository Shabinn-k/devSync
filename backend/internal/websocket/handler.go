package websocket

import (
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"

	"devSync/config"
	"devSync/internal/response"
	"devSync/utils/jwt"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true 
	},
}

func ServeWS(hub *Hub, cfg *config.AppConfig) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.Query("token")
		if tokenString == "" {
			authHeader := c.GetHeader("Authorization")
			if strings.HasPrefix(authHeader, "Bearer ") {
				tokenString = strings.TrimPrefix(authHeader, "Bearer ")
			}
		}

		if tokenString == "" {
			wsProtocol := c.GetHeader("Sec-WebSocket-Protocol")
			if wsProtocol != "" {
				parts := strings.Split(wsProtocol, ",")
				for _, p := range parts {
					trimmed := strings.TrimSpace(p)
					if strings.HasPrefix(trimmed, "bearer.") {
						tokenString = strings.TrimPrefix(trimmed, "bearer.")
					} else if strings.HasPrefix(trimmed, "bearer_") {
						tokenString = strings.TrimPrefix(trimmed, "bearer_")
					}
				}
			}
		}

		if tokenString == "" {
			response.Error(c, http.StatusUnauthorized, "Missing WebSocket authentication token")
			return
		}

		claims, err := jwt.ParseToken(tokenString, cfg.JWTAccessSecret)
		if err != nil {
			response.Error(c, http.StatusUnauthorized, "Invalid or expired token")
			return
		}

		if claims.TokenType != "access" {
			response.Error(c, http.StatusUnauthorized, "Invalid token type for WebSocket connection")
			return
		}

		if claims.UserID <= 0 {
			response.Error(c, http.StatusUnauthorized, "Invalid user ID in token claims")
			return
		}

		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Printf("[WebSocket] Upgrade error: %v", err)
			return
		}

		client := NewClient(hub, conn, claims.UserID)
		hub.register <- client

		go client.WritePump()
		go client.ReadPump()
	}
}
