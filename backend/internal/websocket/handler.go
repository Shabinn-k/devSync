package websocket

import (
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"

	"devSync/config"
	"devSync/internal/response"
)

func OriginAllowed(origin, configured string) bool {
	if origin == "" {
		return false
	}
	for _, allowed := range strings.Split(configured, ",") {
		if origin == strings.TrimSpace(allowed) {
			return true
		}
	}
	return false
}

func IssueTicket(tickets *TicketStore) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, ok := c.Get("userID")
		if !ok {
			response.Error(c, http.StatusUnauthorized, "Unauthorized")
			return
		}
		id, ok := userID.(int)
		if !ok || id <= 0 {
			response.Error(c, http.StatusUnauthorized, "Unauthorized")
			return
		}
		tokenExpires, ok := c.Get("tokenExpiresAt")
		if !ok {
			response.Error(c, http.StatusUnauthorized, "Unauthorized")
			return
		}
		expiresAt, ok := tokenExpires.(time.Time)
		if !ok || !expiresAt.After(time.Now()) {
			response.Error(c, http.StatusUnauthorized, "Unauthorized")
			return
		}
		ticket, err := tickets.Issue(id, expiresAt)
		if err != nil {
			response.Error(c, http.StatusInternalServerError, "Unable to create WebSocket ticket")
			return
		}
		ticketTTLSeconds := int(ticketTTL.Seconds())
		if seconds := int(time.Until(expiresAt).Seconds()); seconds < ticketTTLSeconds {
			ticketTTLSeconds = seconds
		}
		response.Success(c, gin.H{"ticket": ticket, "expires_in": ticketTTLSeconds})
	}
}

func ServeWS(hub *Hub, tickets *TicketStore, cfg *config.AppConfig) gin.HandlerFunc {
	return func(c *gin.Context) {
		checkOrigin := func(r *http.Request) bool {
			return OriginAllowed(r.Header.Get("Origin"), cfg.CORSOrigins)
		}
		if !checkOrigin(c.Request) {
			response.Error(c, http.StatusForbidden, "WebSocket origin is not allowed")
			return
		}
		userID, expiresAt, ok := tickets.Consume(c.Query("ticket"))
		if !ok {
			response.Error(c, http.StatusUnauthorized, "Missing, expired, or invalid WebSocket ticket")
			return
		}
		upgrader := websocket.Upgrader{
			ReadBufferSize: 1024, WriteBufferSize: 1024, CheckOrigin: checkOrigin,
		}
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Printf("WebSocket upgrade failed: %v", err)
			return
		}
		client := NewClient(hub, conn, userID, expiresAt)
		select {
		case hub.register <- client:
		case <-hub.done:
			_ = conn.Close()
			return
		}
		go client.WritePump()
		go client.ReadPump()
	}
}
