package websocket

import (
	"net/http/httptest"
	"testing"

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
