package websocket

import (
	"encoding/json"
	"log"
	"sync"
)

var (
	globalHub   *Hub
	globalHubMu sync.RWMutex
)

type EventMessage struct {
	Event string      `json:"event"`
	Data  interface{} `json:"data"`
}

type Hub struct {
	clients map[int]map[*Client]bool
	mu      sync.RWMutex

	register   chan *Client
	unregister chan *Client
}

func NewHub() *Hub {
	h := &Hub{
		clients:    make(map[int]map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}

	globalHubMu.Lock()
	globalHub = h
	globalHubMu.Unlock()

	return h
}

func GetGlobalHub() *Hub {
	globalHubMu.RLock()
	defer globalHubMu.RUnlock()
	return globalHub
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			if h.clients[client.userID] == nil {
				h.clients[client.userID] = make(map[*Client]bool)
			}
			h.clients[client.userID][client] = true
			h.mu.Unlock()
			log.Printf("[WebSocket Hub] Client registered for user_id: %d (Total connections: %d)", client.userID, len(h.clients[client.userID]))

		case client := <-h.unregister:
			h.mu.Lock()
			if userClients, ok := h.clients[client.userID]; ok {
				if _, exists := userClients[client]; exists {
					delete(userClients, client)
					close(client.send)
					if len(userClients) == 0 {
						delete(h.clients, client.userID)
					}
				}
			}
			h.mu.Unlock()
			log.Printf("[WebSocket Hub] Client unregistered for user_id: %d", client.userID)
		}
	}
}

func (h *Hub) SendToUser(userID int, event string, data interface{}) {
	h.BroadcastToUser(userID, event, data)
}

func (h *Hub) BroadcastToUser(userID int, event string, data interface{}) {
	payload, err := json.Marshal(EventMessage{
		Event: event,
		Data:  data,
	})
	if err != nil {
		log.Printf("[WebSocket Hub] Failed to marshal broadcast event: %v", err)
		return
	}

	h.mu.RLock()
	userClients, ok := h.clients[userID]
	if !ok || len(userClients) == 0 {
		h.mu.RUnlock()
		log.Printf("[WebSocket Hub] No active WS clients found for user_id: %d", userID)
		return
	}

	clientsSnapshot := make([]*Client, 0, len(userClients))
	for client := range userClients {
		clientsSnapshot = append(clientsSnapshot, client)
	}
	h.mu.RUnlock()

	for _, client := range clientsSnapshot {
		select {
		case client.send <- payload:
		default:
			select {
			case h.unregister <- client:
			default:
			}
		}
	}
	log.Printf("[WebSocket Hub] Broadcasted '%s' event to active clients for user_id: %d", event, userID)
}

func (h *Hub) IsUserConnected(userID int) bool {
	h.mu.RLock()
	defer h.mu.RUnlock()
	userClients, ok := h.clients[userID]
	return ok && len(userClients) > 0
}
