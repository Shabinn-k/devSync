package websocket

import (
	"context"
	"testing"
	"time"
)

func TestHub_RegisterAndUnregister(t *testing.T) {
	hub := NewHub()
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	go hub.Run(ctx)

	userID := 1
	client1 := &Client{hub: hub, userID: userID, send: make(chan []byte, 10)}
	client2 := &Client{hub: hub, userID: userID, send: make(chan []byte, 10)}

	hub.register <- client1
	time.Sleep(20 * time.Millisecond)

	if !hub.IsUserConnected(userID) {
		t.Errorf("expected user %d to be connected", userID)
	}

	hub.register <- client2
	time.Sleep(20 * time.Millisecond)

	hub.mu.RLock()
	conns := len(hub.clients[userID])
	hub.mu.RUnlock()
	if conns != 2 {
		t.Errorf("expected 2 active connections for user, got %d", conns)
	}

	hub.unregister <- client1
	time.Sleep(20 * time.Millisecond)

	if !hub.IsUserConnected(userID) {
		t.Errorf("expected user %d to still be connected via client2", userID)
	}

	hub.unregister <- client2
	time.Sleep(20 * time.Millisecond)

	if hub.IsUserConnected(userID) {
		t.Errorf("expected user %d to be disconnected after all clients unregister", userID)
	}
}

func TestHub_BroadcastToUser(t *testing.T) {
	hub := NewHub()
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	go hub.Run(ctx)

	userID := 1
	client := &Client{hub: hub, userID: userID, send: make(chan []byte, 10)}

	hub.register <- client
	time.Sleep(20 * time.Millisecond)

	hub.BroadcastToUser(userID, "test_event", map[string]string{"foo": "bar"})

	select {
	case msg := <-client.send:
		if len(msg) == 0 {
			t.Errorf("expected non-empty websocket broadcast message")
		}
	case <-time.After(100 * time.Millisecond):
		t.Errorf("timed out waiting for broadcasted websocket payload")
	}
}

func TestHubShutdownClosesActiveConnections(t *testing.T) {
	hub := NewHub()
	ctx, cancel := context.WithCancel(context.Background())
	go hub.Run(ctx)
	client := &Client{hub: hub, userID: 3, send: make(chan []byte, 1), done: make(chan struct{})}
	hub.register <- client
	deadline := time.Now().Add(time.Second)
	for !hub.IsUserConnected(3) && time.Now().Before(deadline) {
		time.Sleep(time.Millisecond)
	}
	cancel()
	select {
	case <-hub.done:
	case <-time.After(time.Second):
		t.Fatal("hub did not stop after cancellation")
	}
	if hub.IsUserConnected(3) {
		t.Fatal("expected hub to remove clients during shutdown")
	}
	select {
	case <-client.done:
	default:
		t.Fatal("expected active client to be stopped during shutdown")
	}
}
