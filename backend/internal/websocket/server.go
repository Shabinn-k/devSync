package websocket

import (
	"github.com/gin-gonic/gin"

	"devSync/config"
)

type Server struct {
	Hub     *Hub
	Cfg     *config.AppConfig
	Tickets *TicketStore
}

func NewServer(hub *Hub, cfg *config.AppConfig, stores ...*TicketStore) *Server {
	tickets := NewTicketStore()
	if len(stores) > 0 && stores[0] != nil {
		tickets = stores[0]
	}
	return &Server{
		Hub: hub, Cfg: cfg, Tickets: tickets,
	}
}

func (s *Server) Handler() gin.HandlerFunc {
	return ServeWS(s.Hub, s.Tickets, s.Cfg)
}

func (s *Server) TicketHandler() gin.HandlerFunc {
	return IssueTicket(s.Tickets)
}
