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

// GetStats returns dashboard statistics
func (h *Controller) GetStats(c *gin.Context) {
	userID := c.GetString("userID")
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	result, err := h.service.GetStats(c.Request.Context(), userUUID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, result)
}

// GetActivities returns recent activities
func (h *Controller) GetActivities(c *gin.Context) {
	userID := c.GetString("userID")
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	limit := 10
	result, err := h.service.GetActivities(c.Request.Context(), userUUID, limit)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, result)
}

// GetTasks returns upcoming tasks
func (h *Controller) GetTasks(c *gin.Context) {
	userID := c.GetString("userID")
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	limit := 5
	result, err := h.service.GetTasks(c.Request.Context(), userUUID, limit)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, result)
}