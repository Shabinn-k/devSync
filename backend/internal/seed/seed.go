package seed

import "gorm.io/gorm"

func Run(db *gorm.DB) error {
	return roles(db)
}
