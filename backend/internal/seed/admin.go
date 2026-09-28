package seed

import (
	"log"

	"gorm.io/gorm"

	"devSync/internal/model"
	"devSync/utils/bcrypt"
)

func adminUser(db *gorm.DB) error {
	const (
		email    = "admin@devsync.local"
		password = "AdminPass123!"
	)

	var count int64
	if err := db.Model(&model.User{}).Where("email = ?", email).Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return nil 
	}

	hashed, err := bcrypt.Hash(password)
	if err != nil {
		return err
	}

	admin := &model.User{
		Name:         "DevSync Admin",
		Email:        email,
		PasswordHash: hashed,
		RoleID:       model.RoleIDAdmin,
		IsVerified:   true,
		IsActive:     true,
	}
	if err := db.Create(admin).Error; err != nil {
		return err
	}

	log.Printf("seed: default admin created → email=%s password=%s", email, password)
	return nil
}