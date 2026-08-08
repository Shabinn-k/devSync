package dashboard

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"devSync/internal/response"
	"devSync/internal/services/dashboard"
)

type Controller struct {
	service dashboard.Service
}

func NewController(s dashboard.Service) *Controller {
	return &Controller{service: s}
}

// GetDashboard returns all dashboard data in one call
func (h *Controller) GetDashboard(c *gin.Context) {
	val, exists := c.Get("userID")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	userUUID, ok := val.(uuid.UUID)
	if !ok {
		var err error
		if idStr, ok := val.(string); ok {
			userUUID, err = uuid.Parse(idStr)
			if err != nil {
				response.Error(c, http.StatusUnauthorized, "Unauthorized")
				return
			}
		} else {
			response.Error(c, http.StatusUnauthorized, "Unauthorized")
			return
		}
	}

	result, err := h.service.GetDashboard(c.Request.Context(), userUUID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, result)
}