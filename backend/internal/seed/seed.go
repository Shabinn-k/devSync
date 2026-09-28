package seed

import "gorm.io/gorm"

func Run(db *gorm.DB) error {
	if err := roles(db); err != nil {
		return err
	}

	if err:=adminUser(db);err!=nil{
		return err
	}
	
return nil
}