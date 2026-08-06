package profile

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

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
	userID := c.GetString("userID")
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	result, err := h.service.GetProfile(c.Request.Context(), userUUID)
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

	userID := c.GetString("userID")
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	result, err := h.service.UpdateProfile(c.Request.Context(), userUUID, &req)
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

	userID := c.GetString("userID")
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	if err := h.service.ChangePassword(c.Request.Context(), userUUID, &req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(c, gin.H{"message": "Password changed successfully"})
}

func (h *Controller) UploadAvatar(c *gin.Context) {
	userID := c.GetString("userID")
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	file, err := c.FormFile("avatar")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Avatar file is required")
		return
	}

	// Validate file type
	allowedTypes := []string{"image/jpeg", "image/png", "image/webp", "image/gif"}
	fileType := file.Header.Get("Content-Type")
	allowed := false
	for _, t := range allowedTypes {
		if t == fileType {
			allowed = true
			break
		}
	}
	if !allowed {
		response.Error(c, http.StatusBadRequest, "File type not supported. Use JPEG, PNG, WEBP, or GIF")
		return
	}

	// Validate file size (max 2MB)
	if file.Size > 2*1024*1024 {
		response.Error(c, http.StatusBadRequest, "File size too large. Max 2MB")
		return
	}

	// TODO: Upload to S3 or local storage
	avatarURL := "/uploads/avatars/" + userID + ".png"

	if err := h.service.UpdateAvatar(c.Request.Context(), userUUID, avatarURL); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update avatar")
		return
	}

	response.Success(c, gin.H{
		"message":    "Avatar uploaded successfully",
		"avatar_url": avatarURL,
	})
}