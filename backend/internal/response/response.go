package validators

import (
	"fmt"
	"strings"
	"unicode"

	"github.com/go-playground/validator/v10"
)

var validate = validator.New()

func init() {
	validate.RegisterValidation("username_format", usernameFormat)
	validate.RegisterValidation("password_complexity", passwordComplexity)
}

func ValidateStruct(s interface{}) map[string]string {
	if err := validate.Struct(s); err != nil {
		return formatErrors(err)
	}
	return nil
}

func usernameFormat(fl validator.FieldLevel) bool {
	for _, ch := range fl.Field().String() {
		if !unicode.IsLetter(ch) && !unicode.IsDigit(ch) && ch != '_' && ch != '.' {
			return false
		}
	}
	return true
}

func passwordComplexity(fl validator.FieldLevel) bool {
	password := fl.Field().String()
	var hasUpper, hasLower, hasNumber, hasSpecial bool
	for _, ch := range password {
		switch {
		case unicode.IsUpper(ch):
			hasUpper = true
		case unicode.IsLower(ch):
			hasLower = true
		case unicode.IsDigit(ch):
			hasNumber = true
		case unicode.IsPunct(ch), unicode.IsSymbol(ch):
			hasSpecial = true
		}
	}
	return hasUpper && hasLower && hasNumber && hasSpecial
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
	case "username_format":
		return "Username may only contain letters, numbers, underscores, and periods."
	case "password_complexity":
		return "Password must contain an uppercase, lowercase, number, and special character."
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