package admin

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"

	adminRequest "devSync/internal/dto/request"
	"devSync/internal/model"
	adminService "devSync/internal/services/admin"
)

type Controller struct {
	svc adminService.Service
}

func NewController(svc adminService.Service) *Controller {
	return &Controller{svc: svc}
}


func (c *Controller) ListUsers(ctx *gin.Context) {
	limit := parseIntDefault(ctx.Query("limit"), 20)
	if limit < 1 {
		limit = 20
	} else if limit > 100 {
		limit = 100
	}

	q := adminRequest.AdminListUsersQuery{
		Page:   parseIntDefault(ctx.Query("page"), 1),
		Limit:  limit,
		Search: ctx.Query("search"),
		RoleID: parseIntDefault(ctx.Query("role_id"), 0),
	}
	if v := ctx.Query("is_active"); v != "" {
		b, err := strconv.ParseBool(v)
		if err == nil {
			q.IsActive = &b
		}
	}

	users, total, err := c.svc.ListUsers(ctx.Request.Context(), q)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Success",
		"data":    users,
		"pagination": gin.H{
			"page":        q.Page,
			"limit":       q.Limit,
			"total_items": total,
			"total_pages": pages(total, q.Limit),
		},
	})
}

func (c *Controller) GetUser(ctx *gin.Context) {
	id, ok := parseID(ctx)
	if !ok {
		return
	}
	u, err := c.svc.GetUser(ctx.Request.Context(), id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"success": false, "message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"success": true, "message": "Success", "data": u})
}

func (c *Controller) UpdateUserRole(ctx *gin.Context) {
	id, ok := parseID(ctx)
	if !ok {
		return
	}
	var body adminRequest.AdminUpdateUserRoleRequest
	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	adminID := currentAdminID(ctx)
	if adminID <= 0 {
		ctx.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "unauthorized"})
		return
	}
	if err := c.svc.UpdateUserRole(ctx.Request.Context(), adminID, id, body.RoleID); err != nil {
		handleServiceError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"success": true, "message": "role updated"})
}

func (c *Controller) UpdateUserStatus(ctx *gin.Context) {
	id, ok := parseID(ctx)
	if !ok {
		return
	}
	var body adminRequest.AdminUpdateUserStatusRequest
	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	adminID := currentAdminID(ctx)
	if adminID <= 0 {
		ctx.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "unauthorized"})
		return
	}
	if err := c.svc.UpdateUserStatus(ctx.Request.Context(), adminID, id, body.IsActive); err != nil {
		handleServiceError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"success": true, "message": "status updated"})
}

func (c *Controller) DeleteUser(ctx *gin.Context) {
	id, ok := parseID(ctx)
	if !ok {
		return
	}
	adminID := currentAdminID(ctx)
	if adminID <= 0 {
		ctx.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "unauthorized"})
		return
	}
	if err := c.svc.DeleteUser(ctx.Request.Context(), adminID, id); err != nil {
		handleServiceError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"success": true, "message": "user deactivated"})
}


func (c *Controller) ListOrganizations(ctx *gin.Context) {
	limit := parseIntDefault(ctx.Query("limit"), 20)
	if limit < 1 {
		limit = 20
	} else if limit > 100 {
		limit = 100
	}

	q := adminRequest.AdminListOrgsQuery{
		Page:   parseIntDefault(ctx.Query("page"), 1),
		Limit:  limit,
		Search: ctx.Query("search"),
	}
	if v := ctx.Query("is_active"); v != "" {
		b, err := strconv.ParseBool(v)
		if err == nil {
			q.IsActive = &b
		}
	}

	orgs, total, err := c.svc.ListOrganizations(ctx.Request.Context(), q)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Success",
		"data":    orgs,
		"pagination": gin.H{
			"page":        q.Page,
			"limit":       q.Limit,
			"total_items": total,
			"total_pages": pages(total, q.Limit),
		},
	})
}

func (c *Controller) GetOrganization(ctx *gin.Context) {
	id, ok := parseID(ctx)
	if !ok {
		return
	}
	org, err := c.svc.GetOrganization(ctx.Request.Context(), id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"success": false, "message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"success": true, "message": "Success", "data": org})
}

func (c *Controller) UpdateOrgStatus(ctx *gin.Context) {
	id, ok := parseID(ctx)
	if !ok {
		return
	}
	var body adminRequest.AdminUpdateOrgStatusRequest
	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	if err := c.svc.UpdateOrgStatus(ctx.Request.Context(), id, body.IsActive); err != nil {
		handleServiceError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"success": true, "message": "organization status updated"})
}

func (c *Controller) TransferOwnership(ctx *gin.Context) {
	id, ok := parseID(ctx)
	if !ok {
		return
	}
	var body adminRequest.AdminTransferOwnershipRequest
	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	if err := c.svc.TransferOwnership(ctx.Request.Context(), id, body.NewOwnerID); err != nil {
		handleServiceError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"success": true, "message": "ownership transferred"})
}

func (c *Controller) DeleteOrg(ctx *gin.Context) {
	id, ok := parseID(ctx)
	if !ok {
		return
	}
	if err := c.svc.DeleteOrg(ctx.Request.Context(), id); err != nil {
		handleServiceError(ctx, err)
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"success": true, "message": "organization deactivated"})
}


func (c *Controller) GetStats(ctx *gin.Context) {
	stats, err := c.svc.GetStats(ctx.Request.Context())
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"success": true, "message": "Success", "data": stats})
}


func handleServiceError(ctx *gin.Context, err error) {
	msg := err.Error()
	if strings.Contains(msg, "not found") {
		ctx.JSON(http.StatusNotFound, gin.H{"success": false, "message": msg})
		return
	}
	ctx.JSON(http.StatusBadRequest, gin.H{"success": false, "message": msg})
}

func parseID(ctx *gin.Context) (int, bool) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil || id <= 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid id"})
		return 0, false
	}
	return id, true
}

func parseIntDefault(s string, def int) int {
	if s == "" {
		return def
	}
	n, err := strconv.Atoi(s)
	if err != nil {
		return def
	}
	return n
}

func pages(total int64, limit int) int {
	if limit <= 0 {
		return 0
	}
	p := int(total) / limit
	if int(total)%limit != 0 {
		p++
	}
	return p
}

func currentAdminID(ctx *gin.Context) int {
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