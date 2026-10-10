package middleware

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

const maxPageSize = 100
const maxPaginationOffset = 10_000_000

// ValidatePagination rejects invalid values before handlers can accidentally
// pass an unbounded limit or overflowing offset to GORM.
func ValidatePagination() gin.HandlerFunc {
	return func(c *gin.Context) {
		page, limit := 1, 100
		if raw, exists := c.GetQuery("page"); exists {
			parsed, err := strconv.Atoi(raw)
			if err != nil || parsed < 1 {
				c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "page must be a positive integer"})
				return
			}
			page = parsed
		}
		if raw, exists := c.GetQuery("limit"); exists {
			parsed, err := strconv.Atoi(raw)
			if err != nil || parsed < 1 || parsed > maxPageSize {
				c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "limit must be an integer from 1 to 100"})
				return
			}
			limit = parsed
		}
		if page-1 > maxPaginationOffset/limit {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "pagination offset is too large"})
			return
		}
		c.Next()
	}
}
