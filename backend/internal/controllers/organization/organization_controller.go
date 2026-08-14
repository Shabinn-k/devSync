package organization

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"devSync/internal/dto/request"
	"devSync/internal/response"
	"devSync/internal/services/organization"
	"devSync/utils/validator"
)

type Controller struct {
	service organization.Service
}

func NewController(s organization.Service) *Controller {
	return &Controller{service: s}
}

func (h *Controller) Create(c *gin.Context) {
	userUUID, err := getUserUUID(c)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req request.CreateOrganizationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	if errs := validator.ValidateStruct(&req); errs != nil {
		response.ValidationError(c, errs)
		return
	}

	result, err := h.service.Create(c.Request.Context(), userUUID, &req)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Created(c, result)
}

func (h *Controller) GetByID(c *gin.Context) {
	userUUID, err := getUserUUID(c)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	id := c.Param("id")
	orgID, err := uuid.Parse(id)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid organization ID")
		return
	}

	result, err := h.service.GetByID(c.Request.Context(), userUUID, orgID)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error())
		return
	}
	response.Success(c, result)
}

func (h *Controller) GetBySlug(c *gin.Context) {
	slug := c.Param("slug")
	if slug == "" {
		response.Error(c, http.StatusBadRequest, "Slug is required")
		return
	}

	result, err := h.service.GetBySlug(c.Request.Context(), slug)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error())
		return
	}
	response.Success(c, result)
}

func (h *Controller) Update(c *gin.Context) {
	userUUID, err := getUserUUID(c)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	id := c.Param("id")
	orgID, err := uuid.Parse(id)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid organization ID")
		return
	}

	var req request.UpdateOrganizationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	if errs := validator.ValidateStruct(&req); errs != nil {
		response.ValidationError(c, errs)
		return
	}

	result, err := h.service.Update(c.Request.Context(), userUUID, orgID, &req)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(c, result)
}

func (h *Controller) Delete(c *gin.Context) {
	userUUID, err := getUserUUID(c)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	id := c.Param("id")
	orgID, err := uuid.Parse(id)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid organization ID")
		return
	}

	if err := h.service.Delete(c.Request.Context(), userUUID, orgID); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(c, gin.H{"message": "Organization deleted successfully"})
}

func (h *Controller) List(c *gin.Context) {
	userUUID, err := getUserUUID(c)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	result, total, err := h.service.List(c.Request.Context(), userUUID, page, limit)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.SuccessWithPagination(c, result, page, limit, total)
}

func (h *Controller) AddMember(c *gin.Context) {
	userUUID, err := getUserUUID(c)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	id := c.Param("id")
	orgID, err := uuid.Parse(id)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid organization ID")
		return
	}

	var req request.AddMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	if errs := validator.ValidateStruct(&req); errs != nil {
		response.ValidationError(c, errs)
		return
	}

	result, err := h.service.AddMember(c.Request.Context(), userUUID, orgID, &req)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Created(c, result)
}

func (h *Controller) GetMembers(c *gin.Context) {
	userUUID, err := getUserUUID(c)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	id := c.Param("id")
	orgID, err := uuid.Parse(id)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid organization ID")
		return
	}

	result, err := h.service.GetMembers(c.Request.Context(), userUUID, orgID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, result)
}

func (h *Controller) UpdateMemberRole(c *gin.Context) {
	userUUID, err := getUserUUID(c)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	id := c.Param("id")
	orgID, err := uuid.Parse(id)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid organization ID")
		return
	}

	memberID, err := uuid.Parse(c.Param("memberId"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid member ID")
		return
	}

	var req request.UpdateMemberRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	if errs := validator.ValidateStruct(&req); errs != nil {
		response.ValidationError(c, errs)
		return
	}

	if err := h.service.UpdateMemberRole(c.Request.Context(), userUUID, orgID, memberID, req.Role); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(c, gin.H{"message": "Member role updated successfully"})
}

func (h *Controller) RemoveMember(c *gin.Context) {
	userUUID, err := getUserUUID(c)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	id := c.Param("id")
	orgID, err := uuid.Parse(id)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid organization ID")
		return
	}

	memberID, err := uuid.Parse(c.Param("memberId"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid member ID")
		return
	}

	if err := h.service.RemoveMember(c.Request.Context(), userUUID, orgID, memberID); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(c, gin.H{"message": "Member removed successfully"})
}

func (h *Controller) GetUserOrganizations(c *gin.Context) {
	userUUID, err := getUserUUID(c)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	result, err := h.service.GetUserOrganizations(c.Request.Context(), userUUID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, result)
}

func getUserUUID(c *gin.Context) (uuid.UUID, error) {
	val, exists := c.Get("userID")
	if !exists {
		return uuid.Nil, http.ErrNoCookie
	}
	if id, ok := val.(uuid.UUID); ok {
		return id, nil
	}
	if idStr, ok := val.(string); ok {
		return uuid.Parse(idStr)
	}
	return uuid.Nil, http.ErrNoCookie
}