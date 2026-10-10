package validator

import (
	"encoding/json"
	"fmt"

	"github.com/gin-gonic/gin"
)

// BindAndValidateJSON is the shared request boundary for DTOs whose rules use
// the project's custom `validate` tags.
func BindAndValidateJSON(c *gin.Context, destination any) error {
	if err := c.ShouldBindJSON(destination); err != nil {
		return err
	}
	if errs := ValidateStruct(destination); errs != nil {
		encoded, _ := json.Marshal(errs)
		return fmt.Errorf("validation failed: %s", encoded)
	}
	return nil
}
