package health

import (
	"context"
	"errors"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
)

func TestRunPerformsInitialReadinessCheck(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := NewHealthService()
	service.AddCheck("database", func(context.Context) error { return nil }, time.Second)
	service.CheckNow(context.Background())

	request := httptest.NewRequest("GET", "/ready", nil)
	response := httptest.NewRecorder()
	context, _ := gin.CreateTestContext(response)
	context.Request = request
	service.HealthHandler(context)
	if response.Code != 200 {
		t.Fatalf("initial readiness check returned %d: %s", response.Code, response.Body.String())
	}
}

func TestReadinessReportsUnavailableDependency(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := NewHealthService()
	service.AddCheck("database", func(context.Context) error { return errors.New("unavailable") }, time.Second)
	service.CheckNow(context.Background())
	request := httptest.NewRequest("GET", "/ready", nil)
	response := httptest.NewRecorder()
	context, _ := gin.CreateTestContext(response)
	context.Request = request
	service.HealthHandler(context)
	if response.Code != 503 {
		t.Fatalf("readiness with a failed dependency returned %d", response.Code)
	}
}
