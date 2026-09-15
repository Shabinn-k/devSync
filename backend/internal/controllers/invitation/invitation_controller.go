package invitation

import (
	"log"
	"net/http"
	"strconv"

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

func (c *Controller) Invite(ctx *gin.Context) {
	userID, err := getUserID(ctx)
	if err != nil {
		response.Error(ctx, http.StatusUnauthorized, "Unauthorized")
		return
	}

	organizeID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid organization ID")
		return
	}

	var req struct {
		Email string `json:"email" binding:"required,email"`
		Role  string `json:"role" binding:"required,oneof=admin member viewer"`
	}

	log.Printf("📥 Invite request: user=%d, org=%d", userID, organizeID)

	if err := ctx.ShouldBindJSON(&req); err != nil {
		log.Printf("Binding error: %v", err)
		response.Error(ctx, http.StatusBadRequest, "Invalid request: "+err.Error())
		return
	}

	log.Printf("📤 Email: %s, Role: %s", req.Email, req.Role)

	result, err := c.service.CreateInvitation(ctx.Request.Context(), userID, organizeID, req.Email, req.Role)
	if err != nil {
		log.Printf("Service error: %v", err)
		response.Error(ctx, http.StatusBadRequest, err.Error())
		return
	}

	response.Created(ctx, gin.H{
		"message":    "Invitation sent successfully to " + req.Email,
		"invitation": result,
	})
}

func (c *Controller) Accept(ctx *gin.Context) {
	token := ctx.Query("token")
	if token == "" {
		response.Error(ctx, http.StatusBadRequest, "Token is required")
		return
	}

	userID, err := getUserID(ctx)
	if err != nil {
		ctx.Redirect(http.StatusFound, "/login?redirect=/invite/accept?token="+token)
		return
	}

	if err := c.service.AcceptInvitation(ctx.Request.Context(), token, userID); err != nil {
		response.Error(ctx, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(ctx, gin.H{
		"message":  "You have successfully joined the organization!",
		"redirect": "/dashboard",
	})
}

func (c *Controller) Decline(ctx *gin.Context) {
	token := ctx.Query("token")
	if token == "" {
		response.Error(ctx, http.StatusBadRequest, "Token is required")
		return
	}

	if err := c.service.DeclineInvitation(ctx.Request.Context(), token); err != nil {
		response.Error(ctx, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(ctx, gin.H{
		"message":  "You have declined the invitation.",
		"redirect": "/",
	})
}

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
		"organization_name": func() string {
			if invitation.Organization.ID != 0 {
				return invitation.Organization.Name
			}
			return ""
		}(),
		"email":      invitation.Email,
		"role":       invitation.Role,
		"status":     invitation.Status,
		"expires_at": invitation.ExpiresAt,
	})
}