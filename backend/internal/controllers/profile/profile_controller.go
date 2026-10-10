package profile

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"

	"devSync/internal/dto/request"
	"devSync/internal/response"
	"devSync/internal/services/profile"
	"devSync/utils/validator"
)

type Controller struct {
	service profile.Service
}

func NewController(s profile.Service) *Controller {
	return &Controller{service: s}
}

func (h *Controller) GetProfile(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	result, err := h.service.GetProfile(c.Request.Context(), userID)
	if err != nil {
		response.Error(c, http.StatusNotFound, "User not found")
		return
	}
	response.Success(c, result)
}

func (h *Controller) UpdateProfile(c *gin.Context) {
	var req request.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	if errs := validator.ValidateStruct(&req); errs != nil {
		response.ValidationError(c, errs)
		return
	}

	userID, err := getUserID(c)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	result, err := h.service.UpdateProfile(c.Request.Context(), userID, &req)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(c, result)
}

func (h *Controller) ChangePassword(c *gin.Context) {
	var req request.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	if errs := validator.ValidateStruct(&req); errs != nil {
		response.ValidationError(c, errs)
		return
	}

	userID, err := getUserID(c)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	if err := h.service.ChangePassword(c.Request.Context(), userID, &req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(c, gin.H{"message": "Password changed successfully"})
}

func (h *Controller) UploadAvatar(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, 2*1024*1024+64*1024)
	file, err := c.FormFile("avatar")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Avatar file is required")
		return
	}

	if file.Size > 2*1024*1024 {
		response.Error(c, http.StatusBadRequest, "File size too large. Max 2MB")
		return
	}
	opened, err := file.Open()
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Unable to read avatar")
		return
	}
	header := make([]byte, 512)
	n, readErr := opened.Read(header)
	_ = opened.Close()
	if readErr != nil && readErr != io.EOF {
		response.Error(c, http.StatusBadRequest, "Unable to read avatar")
		return
	}
	mimeType := http.DetectContentType(header[:n])
	extensions := map[string]string{"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif"}
	ext, allowed := extensions[mimeType]
	if !allowed {
		response.Error(c, http.StatusBadRequest, "File type not supported. Use JPEG, PNG, WEBP, or GIF")
		return
	}

	uploadDir := "./uploads/avatars"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create upload directory")
		return
	}

	filename := fmt.Sprintf("%d%s", userID, ext)
	filePath := filepath.Join(uploadDir, filename)

	if err := c.SaveUploadedFile(file, filePath); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to save avatar")
		return
	}

	avatarURL := "/uploads/avatars/" + filename

	if err := h.service.UpdateAvatar(c.Request.Context(), userID, avatarURL); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update avatar")
		return
	}

	response.Success(c, gin.H{
		"message":    "Avatar uploaded successfully",
		"avatar_url": avatarURL,
	})
}

func (h *Controller) GetGitHubContributions(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	result, err := h.service.GetGitHubContributions(c.Request.Context(), userID)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(c, result)
}

func getUserID(c *gin.Context) (int, error) {
	val, exists := c.Get("userID")
	if !exists {
		return 0, errors.New("unauthorized")
	}
	if id, ok := val.(int); ok {
		return id, nil
	}
	return 0, errors.New("unauthorized")
}
