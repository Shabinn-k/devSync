package chat

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"devSync/internal/dto/request"
	"devSync/internal/response"
	chatService "devSync/internal/services/chat"
)

type Controller struct {
	service chatService.Service
}

func NewController(service chatService.Service) *Controller {
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

func (ctrl *Controller) GetChannels(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	channels, err := ctrl.service.GetUserChannels(c.Request.Context(), userID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, channels)
}

func (ctrl *Controller) CreateChannel(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req request.CreateChannelRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request payload: "+err.Error())
		return
	}

	res, err := ctrl.service.CreateChannel(c.Request.Context(), userID, &req)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Created(c, res)
}

func (ctrl *Controller) DirectChannel(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req request.DirectMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request payload: "+err.Error())
		return
	}

	res, err := ctrl.service.GetDirectChannel(c.Request.Context(), userID, req.RecipientID)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(c, res)
}

func (ctrl *Controller) GetChannel(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	channelID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid channel ID")
		return
	}

	res, err := ctrl.service.GetChannelByID(c.Request.Context(), userID, channelID)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error())
		return
	}

	response.Success(c, res)
}

func (ctrl *Controller) GetMessages(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	channelID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid channel ID")
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	messages, total, err := ctrl.service.GetChannelMessages(c.Request.Context(), userID, channelID, page, limit)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.SuccessWithPagination(c, messages, page, limit, total)
}

func (ctrl *Controller) SendMessage(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	channelID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid channel ID")
		return
	}

	var req request.SendMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid message payload: "+err.Error())
		return
	}

	res, err := ctrl.service.SendMessage(c.Request.Context(), userID, channelID, &req)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Created(c, res)
}
