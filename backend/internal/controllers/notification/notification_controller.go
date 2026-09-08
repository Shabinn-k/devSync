package notification

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	notifRepo "devSync/internal/repositories/notification"
	"devSync/internal/response"
	notifService "devSync/internal/services/notification"
)

type Controller struct {
	service notifService.Service
}

func NewController(service notifService.Service) *Controller {
	return &Controller{service: service}
}

func getUserID(c *gin.Context) (int, bool) {
	raw, exists := c.Get("userID")
	if !exists {
		return 0, false
	}
	userID, ok := raw.(int)
	return userID, ok
}

func clampPagination(page, limit int) (int, int) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}
	return page, limit
}
 
func (ctrl *Controller) GetNotifications(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	pageRaw, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limitRaw, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	page, limit := clampPagination(pageRaw, limitRaw)

	notifications, total, err := ctrl.service.GetNotifications(c.Request.Context(), userID, page, limit)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch notifications")
		return
	}

	hasMore := int64(page*limit) < total

	response.SuccessWithPagination(c, gin.H{
		"notifications": notifications,
		"has_more":      hasMore,
	}, page, limit, total)
}

func (ctrl *Controller) GetUnreadCount(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	count, err := ctrl.service.GetUnreadCount(c.Request.Context(), userID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch unread count")
		return
	}

	response.Success(c, gin.H{
		"count": count,
	})
}

func (ctrl *Controller) MarkAsRead(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		response.Error(c, http.StatusBadRequest, "Invalid notification ID")
		return
	}

	if err := ctrl.service.MarkAsRead(c.Request.Context(), id, userID); err != nil {
		if errors.Is(err, notifRepo.ErrNotFound) {
			response.Error(c, http.StatusNotFound, "Notification not found")
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to mark notification as read")
		return
	}

	response.Success(c, gin.H{"message": "Notification marked as read"})
}

func (ctrl *Controller) MarkAllAsRead(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	if err := ctrl.service.MarkAllAsRead(c.Request.Context(), userID); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to mark all notifications as read")
		return
	}

	response.Success(c, gin.H{"message": "All notifications marked as read"})
}

func (ctrl *Controller) DeleteNotification(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		response.Error(c, http.StatusBadRequest, "Invalid notification ID")
		return
	}

	if err := ctrl.service.DeleteNotification(c.Request.Context(), id, userID); err != nil {
		if errors.Is(err, notifRepo.ErrNotFound) {
			response.Error(c, http.StatusNotFound, "Notification not found")
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to delete notification")
		return
	}

	response.Success(c, gin.H{"message": "Notification deleted"})
}

