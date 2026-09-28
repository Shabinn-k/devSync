package join_request

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	joinRequestReq "devSync/internal/dto/request"
	"devSync/internal/model"
	joinRequestService "devSync/internal/services/join_request"
)

type Controller struct {
	svc joinRequestService.Service
}

func NewController(svc joinRequestService.Service) *Controller {
	return &Controller{svc: svc}
}

func (c *Controller) Create(ctx *gin.Context) {
	orgID, ok := parseID(ctx, "id")
	if !ok {
		return
	}
	userID := currentUserID(ctx)

	var body joinRequestReq.CreateJoinRequestRequest
	_ = ctx.ShouldBindJSON(&body)

	out, err := c.svc.Create(ctx.Request.Context(), userID, orgID, &body)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	ctx.JSON(http.StatusCreated, gin.H{"success": true, "data": out})
}

func (c *Controller) MyRequests(ctx *gin.Context) {
	userID := currentUserID(ctx)
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "20"))

	rows, total, err := c.svc.MyRequests(ctx.Request.Context(), userID, page, limit)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    rows,
		"pagination": gin.H{"page": page, "limit": limit, "total_items": total},
	})
}

func (c *Controller) Cancel(ctx *gin.Context) {
	id, ok := parseID(ctx, "requestId")
	if !ok {
		return
	}
	userID := currentUserID(ctx)

	if err := c.svc.Cancel(ctx.Request.Context(), userID, id); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"success": true, "message": "request cancelled"})
}

func (c *Controller) ListForOrg(ctx *gin.Context) {
	orgID, ok := parseID(ctx, "id")
	if !ok {
		return
	}
	userID := currentUserID(ctx)
	status := ctx.Query("status")
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "20"))

	rows, total, err := c.svc.ListForOrg(ctx.Request.Context(), userID, orgID, status, page, limit)
	if err != nil {
		ctx.JSON(http.StatusForbidden, gin.H{"success": false, "message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    rows,
		"pagination": gin.H{"page": page, "limit": limit, "total_items": total},
	})
}

func (c *Controller) Review(ctx *gin.Context) {
	orgID, ok := parseID(ctx, "id")
	if !ok {
		return
	}
	reqID, ok := parseID(ctx, "requestId")
	if !ok {
		return
	}
	userID := currentUserID(ctx)

	var body joinRequestReq.ReviewJoinRequestRequest
	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	if err := c.svc.Review(ctx.Request.Context(), userID, orgID, reqID, body.Status); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"success": true, "message": "request " + body.Status})
}

func parseID(ctx *gin.Context, key string) (int, bool) {
	id, err := strconv.Atoi(ctx.Param(key))
	if err != nil || id <= 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid " + key})
		return 0, false
	}
	return id, true
}

func currentUserID(ctx *gin.Context) int {
	v, ok := ctx.Get("user")
	if !ok {
		return 0
	}
	u, ok := v.(*model.User)
	if !ok {
		return 0
	}
	return u.ID
}