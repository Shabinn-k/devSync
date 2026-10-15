package websocket

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"

	"devSync/config"
)

func TestServeWSRejectsOriginAndMissingTicket(t *testing.T) {
	gin.SetMode(gin.TestMode)
	configuration := &config.AppConfig{CORSOrigins: "https://app.example.com"}
	handler := ServeWS(NewHub(), NewTicketStore(), configuration)

	for _, test := range []struct {
		origin string
		status int
	}{
		{origin: "https://evil.example", status: 403},
		{origin: "https://app.example.com", status: 401},
	} {
		request := httptest.NewRequest("GET", "/ws/notifications", nil)
		request.Header.Set("Origin", test.origin)
		response := httptest.NewRecorder()
		context, _ := gin.CreateTestContext(response)
		context.Request = request
		handler(context)
		if response.Code != test.status {
			t.Errorf("origin %q: expected %d, got %d", test.origin, test.status, response.Code)
		}
	}
}

func TestServeWSReturnsBadRequestForInvalidUpgradeHeaders(t *testing.T) {
	gin.SetMode(gin.TestMode)
	configuration := &config.AppConfig{CORSOrigins: "https://app.example.com"}
	tickets := NewTicketStore()
	ticket, err := tickets.Issue(42, time.Now().Add(time.Minute))
	if err != nil {
		t.Fatal(err)
	}
	handler := ServeWS(NewHub(), tickets, configuration)

	request := httptest.NewRequest("GET", "/ws/notifications?ticket="+ticket, nil)
	request.Header.Set("Origin", "https://app.example.com")
	response := httptest.NewRecorder()
	context, _ := gin.CreateTestContext(response)
	context.Request = request
	handler(context)
	if response.Code != http.StatusBadRequest {
		t.Fatalf("expected invalid WebSocket handshake to return 400, got %d", response.Code)
	}
	if _, _, ok := tickets.Consume(ticket); ok {
		t.Fatal("ticket should be consumed after an authorized upgrade attempt")
	}
}
