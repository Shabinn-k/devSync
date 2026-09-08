package project

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"devSync/internal/dto/request"
	"devSync/internal/repositories/project"
	"devSync/internal/response"
	projectService "devSync/internal/services/project"
)

type Controller struct {
	service projectService.Service
}

func NewController(service projectService.Service) *Controller {
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

func (ctrl *Controller) Create(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req request.CreateProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request payload")
		return
	}

	res, err := ctrl.service.Create(c.Request.Context(), userID, &req)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Created(c, res)
}

func (ctrl *Controller) GetUserProjects(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	pageRaw, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limitRaw, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	page, limit := clampPagination(pageRaw, limitRaw)

	projects, total, err := ctrl.service.GetByUser(c.Request.Context(), userID, page, limit)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch user projects")
		return
	}

	response.SuccessWithPagination(c, projects, page, limit, total)
}

func (ctrl *Controller) GetMyProjects(c *gin.Context) {
	ctrl.GetUserProjects(c)
}

func (ctrl *Controller) GetOrgProjects(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	orgID, err := strconv.Atoi(c.Param("orgId"))
	if err != nil || orgID <= 0 {
		response.Error(c, http.StatusBadRequest, "Invalid organization ID")
		return
	}

	pageRaw, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limitRaw, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	page, limit := clampPagination(pageRaw, limitRaw)

	projects, total, err := ctrl.service.GetByOrganization(c.Request.Context(), userID, orgID, page, limit)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.SuccessWithPagination(c, projects, page, limit, total)
}

func (ctrl *Controller) GetByID(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		response.Error(c, http.StatusBadRequest, "Invalid project ID")
		return
	}

	res, err := ctrl.service.GetByID(c.Request.Context(), userID, id)
	if err != nil {
		if errors.Is(err, project.ErrProjectNotFound) {
			response.Error(c, http.StatusNotFound, "Project not found")
			return
		}
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(c, res)
}

func (ctrl *Controller) Update(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		response.Error(c, http.StatusBadRequest, "Invalid project ID")
		return
	}

	var req request.UpdateProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request payload")
		return
	}

	res, err := ctrl.service.Update(c.Request.Context(), userID, id, &req)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(c, res)
}

func (ctrl *Controller) Delete(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		response.Error(c, http.StatusBadRequest, "Invalid project ID")
		return
	}

	if err := ctrl.service.Delete(c.Request.Context(), userID, id); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(c, gin.H{"message": "Project deleted successfully"})
}

func (ctrl *Controller) AddMember(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		response.Error(c, http.StatusBadRequest, "Invalid project ID")
		return
	}

	var req request.AddProjectMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request payload")
		return
	}

	res, err := ctrl.service.AddMember(c.Request.Context(), userID, id, &req)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Created(c, res)
}

func (ctrl *Controller) GetMembers(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		response.Error(c, http.StatusBadRequest, "Invalid project ID")
		return
	}

	members, err := ctrl.service.GetMembers(c.Request.Context(), userID, id)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(c, members)
}

func (ctrl *Controller) UpdateMemberRole(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		response.Error(c, http.StatusBadRequest, "Invalid project ID")
		return
	}

	memberID, err := strconv.Atoi(c.Param("memberId"))
	if err != nil || memberID <= 0 {
		response.Error(c, http.StatusBadRequest, "Invalid member ID")
		return
	}

	var req request.UpdateProjectMemberRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if err := ctrl.service.UpdateMemberRole(c.Request.Context(), userID, id, memberID, req.Role); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(c, gin.H{"message": "Member role updated successfully"})
}

func (ctrl *Controller) RemoveMember(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		response.Error(c, http.StatusBadRequest, "Invalid project ID")
		return
	}

	memberID, err := strconv.Atoi(c.Param("memberId"))
	if err != nil || memberID <= 0 {
		response.Error(c, http.StatusBadRequest, "Invalid member ID")
		return
	}

	if err := ctrl.service.RemoveMember(c.Request.Context(), userID, id, memberID); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(c, gin.H{"message": "Member removed successfully"})
}

