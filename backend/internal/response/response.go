package response

import (
	"net/http"
	"github.com/gin-gonic/gin"
)

type ErrorResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Errors  interface{} `json:"errors,omitempty"`
}

func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    data,
	})
}

func Created(c *gin.Context, data interface{}) {
	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    data,
	})
}

func Error(c *gin.Context, status int, message string) {
	c.JSON(status, ErrorResponse{
		Success: false,
		Message: message,
	})
}

func ValidationError(c *gin.Context, errors map[string]string) {
	c.JSON(http.StatusUnprocessableEntity, ErrorResponse{
		Success: false,
		Message: "Validation failed",
		Errors:  errors,
	})
}