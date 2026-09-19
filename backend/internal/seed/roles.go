package seed

import (
	"gorm.io/gorm"
	"devSync/internal/model"
)

func roles(db *gorm.DB) error {
	items := []model.Role{
		{ID: model.RoleIDTeamLead,  Name: model.RoleNameTeamLead,  Level: 1},
		{ID: model.RoleIDDeveloper, Name: model.RoleNameDeveloper, Level: 2},
		{ID: model.RoleIDAdmin,     Name: model.RoleNameAdmin,     Level: 3},
	}
	for _, r := range items {
		if err := db.Where("id = ?", r.ID).FirstOrCreate(&r).Error; err != nil {
			return err
		}
	}
	return nil
}