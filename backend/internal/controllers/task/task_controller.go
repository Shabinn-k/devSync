package task

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"devSync/internal/dto/request"
	"devSync/internal/response"
	"devSync/internal/services/task"
)

type Controller struct {
	service task.Service
}

func NewController(s task.Service) *Controller {
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

func (c *Controller) Create(ctx *gin.Context) {
	userID, err := getUserID(ctx)
	if err != nil {
		response.Error(ctx, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req request.CreateTaskRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	result, err := c.service.Create(ctx.Request.Context(), userID, &req)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, err.Error())
		return
	}

	response.Created(ctx, result)
}

func (c *Controller) GetMyTasks(ctx *gin.Context) {
	userID, err := getUserID(ctx)
	if err != nil {
		response.Error(ctx, http.StatusUnauthorized, "Unauthorized")
		return
	}

	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "20"))

	result, total, err := c.service.GetMyTasks(ctx.Request.Context(), userID, page, limit)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	response.SuccessWithPagination(ctx, result, page, limit, total)
}

func (c *Controller) GetByProject(ctx *gin.Context) {
	userID, err := getUserID(ctx)
	if err != nil {
		response.Error(ctx, http.StatusUnauthorized, "Unauthorized")
		return
	}

	projectID, err := strconv.Atoi(ctx.Param("projectId"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid project ID")
		return
	}

	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "20"))

	result, total, err := c.service.GetByProject(ctx.Request.Context(), userID, projectID, page, limit)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	response.SuccessWithPagination(ctx, result, page, limit, total)
}

func (c *Controller) GetByID(ctx *gin.Context) {
	userID, err := getUserID(ctx)
	if err != nil {
		response.Error(ctx, http.StatusUnauthorized, "Unauthorized")
		return
	}

	taskID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid task ID")
		return
	}

	result, err := c.service.GetByID(ctx.Request.Context(), userID, taskID)
	if err != nil {
		response.Error(ctx, http.StatusNotFound, err.Error())
		return
	}

	response.Success(ctx, result)
}

func (c *Controller) Update(ctx *gin.Context) {
	userID, err := getUserID(ctx)
	if err != nil {
		response.Error(ctx, http.StatusUnauthorized, "Unauthorized")
		return
	}

	taskID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid task ID")
		return
	}

	var req request.UpdateTaskRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid request body")
		return
	}

	result, err := c.service.Update(ctx.Request.Context(), userID, taskID, &req)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(ctx, result)
}

func (c *Controller) UpdateStatus(ctx *gin.Context) {
	userID, err := getUserID(ctx)
	if err != nil {
		response.Error(ctx, http.StatusUnauthorized, "Unauthorized")
		return
	}

	taskID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid task ID")
		return
	}

	var req request.UpdateTaskStatusRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := c.service.UpdateStatus(ctx.Request.Context(), userID, taskID, &req); err != nil {
		response.Error(ctx, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(ctx, gin.H{"message": "Task status updated successfully"})
}

func (c *Controller) Delete(ctx *gin.Context) {
	userID, err := getUserID(ctx)
	if err != nil {
		response.Error(ctx, http.StatusUnauthorized, "Unauthorized")
		return
	}

	taskID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid task ID")
		return
	}

	if err := c.service.Delete(ctx.Request.Context(), userID, taskID); err != nil {
		response.Error(ctx, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(ctx, gin.H{"message": "Task deleted successfully"})
}

func (c *Controller) AddComment(ctx *gin.Context) {
	userID, err := getUserID(ctx)
	if err != nil {
		response.Error(ctx, http.StatusUnauthorized, "Unauthorized")
		return
	}

	taskID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid task ID")
		return
	}

	var req request.AddCommentRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid request body")
		return
	}

	result, err := c.service.AddComment(ctx.Request.Context(), userID, taskID, &req)
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, err.Error())
		return
	}

	response.Created(ctx, result)
}

func (c *Controller) GetComments(ctx *gin.Context) {
	userID, err := getUserID(ctx)
	if err != nil {
		response.Error(ctx, http.StatusUnauthorized, "Unauthorized")
		return
	}

	taskID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid task ID")
		return
	}

	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "20"))

	result, total, err := c.service.GetComments(ctx.Request.Context(), userID, taskID, page, limit)
	if err != nil {
		response.Error(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	response.SuccessWithPagination(ctx, result, page, limit, total)
}

func (c *Controller) DeleteComment(ctx *gin.Context) {
	userID, err := getUserID(ctx)
	if err != nil {
		response.Error(ctx, http.StatusUnauthorized, "Unauthorized")
		return
	}

	commentID, err := strconv.Atoi(ctx.Param("commentId"))
	if err != nil {
		response.Error(ctx, http.StatusBadRequest, "Invalid comment ID")
		return
	}

	if err := c.service.DeleteComment(ctx.Request.Context(), userID, commentID); err != nil {
		response.Error(ctx, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(ctx, gin.H{"message": "Comment deleted successfully"})
}