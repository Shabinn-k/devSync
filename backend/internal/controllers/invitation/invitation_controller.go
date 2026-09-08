package invitation

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"devSync/internal/response"
	"devSync/internal/services/invitation"
)

type Controller struct {
	service invitation.Service
}

func NewController(s invitation.Service) *Controller {
	return &Controller{service: s}
}

// POST /organizations/:id/invite
func (c *Controller) Invite(ctx *gin.Context) {
	userID, err := getUserID(ctx)
	if err != nil {
		response.Error(ctx, http.StatusUnauthorized, "Unauthorized")
		return
	}

	orgID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid organization ID")
		return
	}

	var req struct {
		Email string `json:"email" validate:"required,email"`
		Role  string `json:"role" validate:"required,oneof=admin member viewer"`
	}
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid request body")
		return
	}

	result, err := c.service.CreateInvitation(ctx.Request.Context(), userID, orgID, req.Email, req.Role)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, err.Error())
		return
	}

	response.Created(ctx, gin.H{
		"message":    "Invitation sent successfully",
		"invitation": result,
	})
}

// GET /invite/accept?token=xxx
func (c *Controller) Accept(ctx *gin.Context) {
	token := ctx.Query("token")
	if token == "" {
		ctx.HTML(http.StatusBadRequest, "error.html", gin.H{"error": "Token is required"})
		return
	}

	userID, err := getUserID(ctx)
	if err != nil {
		ctx.Redirect(http.StatusFound, "/login")
		return
	}

	if err := c.service.AcceptInvitation(ctx.Request.Context(), token, userID); err != nil {
		ctx.HTML(http.StatusBadRequest, "error.html", gin.H{"error": err.Error()})
		return
	}

	ctx.HTML(http.StatusOK, "success.html", gin.H{
		"message": "You have successfully joined the organization!",
		"redirect": "/dashboard",
	})
}

// GET /invite/decline?token=xxx
func (c *Controller) Decline(ctx *gin.Context) {
	token := ctx.Query("token")
	if token == "" {
		ctx.HTML(http.StatusBadRequest, "error.html", gin.H{"error": "Token is required"})
		return
	}

	if err := c.service.DeclineInvitation(ctx.Request.Context(), token); err != nil {
		ctx.HTML(http.StatusBadRequest, "error.html", gin.H{"error": err.Error()})
		return
	}

	ctx.HTML(http.StatusOK, "success.html", gin.H{
		"message": "You have declined the invitation.",
		"redirect": "/",
	})
}

// GET /invite/info?token=xxx
func (c *Controller) GetInfo(ctx *gin.Context) {
	token := ctx.Query("token")
	if token == "" {
		response.Error(ctx, http.StatusBadRequest, "Token is required")
		return
	}

	invitation, err := c.service.GetInvitation(ctx.Request.Context(), token)
	if err != nil {
		response.Error(ctx, http.StatusNotFound, err.Error())
		return
	}

	response.Success(ctx, gin.H{
		"organization_id": invitation.OrganizationID,
		"email":          invitation.Email,
		"role":           invitation.Role,
		"status":         invitation.Status,
		"expires_at":     invitation.ExpiresAt,
	})
}

func getUserID(c *gin.Context) (int, error) {
	val, exists := c.Get("userID")
	if !exists {
		return 0, http.ErrNoCookie
	}
	if id, ok := val.(int); ok {
		return id, nil
	}
	return 0, http.ErrNoCookie
}