package seed

import (
	"errors"
	"strings"

	"gorm.io/gorm"

	"devSync/internal/model"
	"devSync/utils/bcrypt"
)

// ProvisionAdmin creates the first administrator only. It will not change an
// existing account or promote an existing non-admin account.
func ProvisionAdmin(db *gorm.DB, name, email string, password []byte) error {
	name, email = strings.TrimSpace(name), strings.TrimSpace(strings.ToLower(email))
	if name == "" || email == "" || len(password) < 12 || len(password) > 72 {
		return errors.New("name, email, and a password between 12 and 72 bytes are required")
	}
	return db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Exec("SELECT pg_advisory_xact_lock(729184303)").Error; err != nil {
			return err
		}
		var count int64
		if err := tx.Model(&model.User{}).Count(&count).Error; err != nil {
			return err
		}
		if count != 0 {
			return errors.New("admin provisioning is only allowed before any user account exists")
		}
		hashed, err := bcrypt.HashBytes(password)
		if err != nil {
			return err
		}
		admin := &model.User{
			Name: name, Email: email, PasswordHash: hashed,
			RoleID: model.RoleIDAdmin, IsVerified: true, IsActive: true,
		}
		return tx.Create(admin).Error
	})
}
