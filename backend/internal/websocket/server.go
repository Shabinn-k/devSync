package websocket

import (
	"github.com/gin-gonic/gin"

	"devSync/config"
)

type Server struct {
	Hub *Hub
	Cfg *config.AppConfig
}

func NewServer(hub *Hub, cfg *config.AppConfig) *Server {
	return &Server{
		Hub: hub,
		Cfg: cfg,
	}
}

func (s *Server) Handler() gin.HandlerFunc {
	return ServeWS(s.Hub, s.Cfg)
}
