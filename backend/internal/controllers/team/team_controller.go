package team

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"devSync/internal/dto/request"
	"devSync/internal/response"
	"devSync/internal/services/team"
)

type Controller struct {
	service team.Service
}

func NewController(service team.Service) *Controller {
	return &Controller{service: service}
}

func getUserID(c *gin.Context) (int, error) {
	val, exists := c.Get("userID")
	if !exists {
		return 0, errors.New("unauthorized")
	}
	userID, ok := val.(int)
	if !ok {
		return 0, errors.New("invalid user ID")
	}
	return userID, nil
}

func handleServiceError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, team.ErrForbidden),
		errors.Is(err, team.ErrCannotChangeOwnRole),
		errors.Is(err, team.ErrCannotRemoveSelf),
		errors.Is(err, team.ErrNotOrganizeMember):
		response.Error(c, http.StatusForbidden, err.Error())
	case errors.Is(err, team.ErrNotFound):
		response.Error(c, http.StatusNotFound, err.Error())
	default:
		response.Error(c, http.StatusInternalServerError, "Something went wrong")
	}
}

func (ctrl *Controller) Create(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, err.Error())
		return
	}

	var req request.CreateTeamRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	result, err := ctrl.service.Create(c.Request.Context(), userID, req)
	if err != nil {
		handleServiceError(c, err)
		return
	}

	response.Created(c, result)
}

func (ctrl *Controller) GetByOrganization(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, err.Error())
		return
	}

	organizeID, err := strconv.Atoi(c.Param("organizeId"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid organization ID")
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit

	result, total, err := ctrl.service.GetByOrganization(c.Request.Context(), userID, organizeID, limit, offset)
	if err != nil {
		handleServiceError(c, err)
		return
	}

	response.SuccessWithPagination(c, result, page, limit, total)
}

func (ctrl *Controller) GetMyTeams(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, err.Error())
		return
	}

	result, err := ctrl.service.GetMyTeams(c.Request.Context(), userID)
	if err != nil {
		handleServiceError(c, err)
		return
	}

	response.Success(c, result)
}

func (ctrl *Controller) GetByID(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, err.Error())
		return
	}

	teamID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid team ID")
		return
	}

	result, err := ctrl.service.GetByID(c.Request.Context(), userID, teamID)
	if err != nil {
		handleServiceError(c, err)
		return
	}

	response.Success(c, result)
}

func (ctrl *Controller) Update(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, err.Error())
		return
	}

	teamID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid team ID")
		return
	}

	var req request.UpdateTeamRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	result, err := ctrl.service.Update(c.Request.Context(), userID, teamID, req)
	if err != nil {
		handleServiceError(c, err)
		return
	}

	response.Success(c, result)
}

func (ctrl *Controller) Delete(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, err.Error())
		return
	}

	teamID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid team ID")
		return
	}

	if err := ctrl.service.Delete(c.Request.Context(), userID, teamID); err != nil {
		handleServiceError(c, err)
		return
	}

	response.Success(c, gin.H{"message": "Team deleted successfully"})
}

func (ctrl *Controller) AddMember(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, err.Error())
		return
	}

	teamID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid team ID")
		return
	}

	var req request.AddTeamMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	result, err := ctrl.service.AddMember(c.Request.Context(), userID, teamID, req)
	if err != nil {
		handleServiceError(c, err)
		return
	}

	response.Created(c, result)
}

func (ctrl *Controller) GetMembers(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, err.Error())
		return
	}

	teamID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid team ID")
		return
	}

	result, err := ctrl.service.GetMembers(c.Request.Context(), userID, teamID)
	if err != nil {
		handleServiceError(c, err)
		return
	}

	response.Success(c, result)
}

func (ctrl *Controller) UpdateMemberRole(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, err.Error())
		return
	}

	teamID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid team ID")
		return
	}

	memberID, err := strconv.Atoi(c.Param("memberId"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid member ID")
		return
	}

	var req request.UpdateTeamMemberRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := ctrl.service.UpdateMemberRole(c.Request.Context(), userID, teamID, memberID, req); err != nil {
		handleServiceError(c, err)
		return
	}

	response.Success(c, gin.H{"message": "Member role updated successfully"})
}

func (ctrl *Controller) RemoveMember(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, err.Error())
		return
	}

	teamID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid team ID")
		return
	}

	memberID, err := strconv.Atoi(c.Param("memberId"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid member ID")
		return
	}

	if err := ctrl.service.RemoveMember(c.Request.Context(), userID, teamID, memberID); err != nil {
		handleServiceError(c, err)
		return
	}

	response.Success(c, gin.H{"message": "Member removed successfully"})
}