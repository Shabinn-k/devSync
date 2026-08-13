package validator

import (
	"fmt"
	"regexp"
	"strings"
	"unicode"

	"github.com/go-playground/validator/v10"
)

var validate = validator.New()

var slugRegex = regexp.MustCompile(`^[a-z0-9]+(-[a-z0-9]+)*$`)

func init() {
	validate.RegisterValidation("password_complexity", passwordComplexity)
	validate.RegisterValidation("slug_format", slugFormat)
}

func ValidateStruct(s interface{}) map[string]string {
	if err := validate.Struct(s); err != nil {
		return formatErrors(err)
	}
	return nil
}

func passwordComplexity(fl validator.FieldLevel) bool {
	password := fl.Field().String()
	var hasUpper, hasLower, hasNumber bool
	for _, ch := range password {
		switch {
		case unicode.IsUpper(ch):
			hasUpper = true
		case unicode.IsLower(ch):
			hasLower = true
		case unicode.IsDigit(ch):
			hasNumber = true
		}
	}
	return hasUpper && hasLower && hasNumber
}

// slugFormat validates that a slug is lowercase letters, numbers, and
// single hyphens between segments only — e.g. "acme-corp", "team-42".
// No leading/trailing hyphens, no consecutive hyphens, no uppercase,
// no spaces or special characters.
func slugFormat(fl validator.FieldLevel) bool {
	slug := fl.Field().String()
	if slug == "" {
		return true // let `required` handle emptiness
	}
	return slugRegex.MatchString(slug)
}

func formatErrors(err error) map[string]string {
	messages := make(map[string]string)
	validationErrors, ok := err.(validator.ValidationErrors)
	if !ok {
		messages["error"] = err.Error()
		return messages
	}

	for _, fe := range validationErrors {
		messages[toSnakeCase(fe.Field())] = messageFor(fe)
	}
	return messages
}

func messageFor(fe validator.FieldError) string {
	field := humanize(fe.Field())
	switch fe.Tag() {
	case "required":
		return fmt.Sprintf("%s is required.", field)
	case "email":
		return "Must be a valid email address."
	case "min":
		return fmt.Sprintf("%s must be at least %s characters.", field, fe.Param())
	case "max":
		return fmt.Sprintf("%s must be at most %s characters.", field, fe.Param())
	case "len":
		return fmt.Sprintf("%s must be exactly %s characters.", field, fe.Param())
	case "numeric":
		return fmt.Sprintf("%s must contain numbers only.", field)
	case "eqfield":
		return fmt.Sprintf("%s must match %s.", field, humanize(fe.Param()))
	case "password_complexity":
		return "Password must contain an uppercase, lowercase, number."
	case "slug_format":
		return fmt.Sprintf("%s can only contain lowercase letters, numbers, and hyphens (e.g. acme-corp).", field)
	case "url":
		return fmt.Sprintf("%s must be a valid URL.", field)
	case "oneof":
		return fmt.Sprintf("%s must be one of: %s.", field, fe.Param())
	default:
		return fmt.Sprintf("%s is invalid.", field)
	}
}

func humanize(field string) string {
	var out strings.Builder
	for i, r := range field {
		if i > 0 && unicode.IsUpper(r) {
			out.WriteRune(' ')
		}
		out.WriteRune(r)
	}
	s := out.String()
	return strings.ToUpper(s[:1]) + strings.ToLower(s[1:])
}

func toSnakeCase(field string) string {
	var out strings.Builder
	for i, r := range field {
		if i > 0 && unicode.IsUpper(r) {
			out.WriteRune('_')
		}
		out.WriteRune(unicode.ToLower(r))
	}
	return out.String()
}