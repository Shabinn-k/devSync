package websocket

import (
	"testing"
	"time"
)

func TestTicketIsOneUseAndExpires(t *testing.T) {
	store := NewTicketStore()
	ticket, err := store.Issue(42, time.Now().Add(time.Minute))
	if err != nil {
		t.Fatal(err)
	}
	if userID, _, ok := store.Consume(ticket); !ok || userID != 42 {
		t.Fatalf("ticket was not accepted: userID=%d ok=%t", userID, ok)
	}
	if _, _, ok := store.Consume(ticket); ok {
		t.Fatal("ticket was accepted more than once")
	}
	expired, _ := store.Issue(7, time.Now().Add(time.Minute))
	store.mu.Lock()
	item := store.tickets[expired]
	item.expires = time.Now().Add(-time.Second)
	store.tickets[expired] = item
	store.mu.Unlock()
	if _, _, ok := store.Consume(expired); ok {
		t.Fatal("expired ticket was accepted")
	}
}

func TestOriginAllowedRequiresExactConfiguredOrigin(t *testing.T) {
	configured := "https://app.example.com, https://admin.example.com"
	for _, origin := range []string{"https://app.example.com", "https://admin.example.com"} {
		if !OriginAllowed(origin, configured) {
			t.Errorf("expected %q to be allowed", origin)
		}
	}
	for _, origin := range []string{"", "https://app.example.com.evil", "http://app.example.com"} {
		if OriginAllowed(origin, configured) {
			t.Errorf("expected %q to be rejected", origin)
		}
	}
}
