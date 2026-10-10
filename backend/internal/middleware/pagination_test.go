package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestValidatePagination(t *testing.T) {
	gin.SetMode(gin.TestMode)
	tests := []struct {
		query string
		want  int
	}{
		{"", http.StatusOK}, {"page=1&limit=1", http.StatusOK}, {"page=2&limit=100", http.StatusOK},
		{"page=0", http.StatusBadRequest}, {"page=-1", http.StatusBadRequest}, {"page=x", http.StatusBadRequest},
		{"limit=0", http.StatusBadRequest}, {"limit=101", http.StatusBadRequest}, {"limit=x", http.StatusBadRequest},
		{"page=2147483647&limit=100", http.StatusBadRequest},
	}
	for _, test := range tests {
		t.Run(test.query, func(t *testing.T) {
			router := gin.New()
			router.Use(ValidatePagination())
			router.GET("/", func(c *gin.Context) { c.Status(http.StatusOK) })
			req := httptest.NewRequest(http.MethodGet, "/?"+test.query, nil)
			rec := httptest.NewRecorder()
			router.ServeHTTP(rec, req)
			if rec.Code != test.want {
				t.Fatalf("status=%d want=%d", rec.Code, test.want)
			}
		})
	}
}
