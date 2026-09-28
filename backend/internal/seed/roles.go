package seed

import (
	"gorm.io/gorm"
	"devSync/internal/model"
)

func roles(db *gorm.DB) error {
	items := []model.Role{
		{ID: model.RoleIDDeveloper, Name: model.RoleNameDeveloper, Level: 1},
		{ID: model.RoleIDTeamLead,  Name: model.RoleNameTeamLead,  Level: 2},
		{ID: model.RoleIDAdmin,     Name: model.RoleNameAdmin,     Level: 3},
	}
	for _, r := range items {
		if err := db.Where("id = ?", r.ID).Assign(r).FirstOrCreate(&r).Error; err != nil {
			return err
		}
	}
	return nil
}