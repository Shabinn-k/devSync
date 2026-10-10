package websocket

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"sync"
	"time"
)

const ticketTTL = 30 * time.Second
const maxOutstandingTickets = 10000

type wsTicket struct {
	userID       int
	expires      time.Time
	tokenExpires time.Time
}

// TicketStore holds short-lived, one-use WebSocket credentials in process.
// This is appropriate for the current single-instance deployment topology.
type TicketStore struct {
	mu      sync.Mutex
	tickets map[string]wsTicket
}

func NewTicketStore() *TicketStore { return &TicketStore{tickets: make(map[string]wsTicket)} }

func (s *TicketStore) Issue(userID int, tokenExpires time.Time) (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	ticket := base64.RawURLEncoding.EncodeToString(bytes)
	s.mu.Lock()
	now := time.Now()
	for key, value := range s.tickets {
		if now.After(value.expires) {
			delete(s.tickets, key)
		}
	}
	if len(s.tickets) >= maxOutstandingTickets {
		s.mu.Unlock()
		return "", errors.New("WebSocket ticket capacity reached")
	}
	shortExpiry := now.Add(ticketTTL)
	if tokenExpires.Before(shortExpiry) {
		shortExpiry = tokenExpires
	}
	s.tickets[ticket] = wsTicket{userID: userID, expires: shortExpiry, tokenExpires: tokenExpires}
	s.mu.Unlock()
	return ticket, nil
}

func (s *TicketStore) Consume(ticket string) (int, time.Time, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	value, ok := s.tickets[ticket]
	delete(s.tickets, ticket)
	if !ok || time.Now().After(value.expires) {
		return 0, time.Time{}, false
	}
	return value.userID, value.tokenExpires, true
}
