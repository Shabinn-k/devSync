package dashboard

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"devSync/internal/response"
	"devSync/internal/services/dashboard"
)

type Controller struct {
	service dashboard.Service
}

func NewController(s dashboard.Service) *Controller {
	return &Controller{service: s}
}

func (h *Controller) GetDashboard(c *gin.Context) {
	val, exists := c.Get("userID")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	userID, ok := val.(int)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	result, err := h.service.GetDashboard(c.Request.Context(), userID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, result)
}

