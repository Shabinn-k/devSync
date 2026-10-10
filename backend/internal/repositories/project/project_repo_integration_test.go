package project

import (
	"fmt"
	"net/url"
	"os"
	"testing"
	"time"

	"devSync/internal/model"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Runs only against an explicitly supplied disposable PostgreSQL database.
func TestIsAdminScopesGlobalRolesToTheirTenant(t *testing.T) {
	dsn := os.Getenv("DEVSYNC_TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("set DEVSYNC_TEST_DATABASE_URL to run isolated PostgreSQL authorization integration tests")
	}
	adminDB, err := gorm.Open(postgres.Open(dsn), &gorm.Config{DisableForeignKeyConstraintWhenMigrating: true})
	if err != nil {
		t.Fatal(err)
	}
	adminSQL, err := adminDB.DB()
	if err != nil {
		t.Fatal(err)
	}
	schema := fmt.Sprintf("devsync_project_test_%x", time.Now().UnixNano())
	if err := adminDB.Exec("CREATE SCHEMA " + schema).Error; err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = adminDB.Exec("DROP SCHEMA IF EXISTS " + schema + " CASCADE").Error; _ = adminSQL.Close() })
	parsed, err := url.Parse(dsn)
	if err != nil {
		t.Fatal(err)
	}
	query := parsed.Query()
	query.Set("search_path", schema)
	parsed.RawQuery = query.Encode()
	db, err := gorm.Open(postgres.Open(parsed.String()), &gorm.Config{DisableForeignKeyConstraintWhenMigrating: true})
	if err != nil {
		t.Fatal(err)
	}
	sqlDB, err := db.DB()
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = sqlDB.Close() })
	if err := db.AutoMigrate(&model.Role{}, &model.User{}, &model.Organization{}, &model.OrganizationMember{}, &model.Project{}, &model.ProjectMember{}, &model.Team{}); err != nil {
		t.Fatal(err)
	}
	users := []model.User{
		{ID: 1, Name: "Platform Admin", Email: "admin@example.test", PasswordHash: "x", RoleID: model.RoleIDAdmin},
		{ID: 2, Name: "Local Lead", Email: "lead@example.test", PasswordHash: "x", RoleID: model.RoleIDTeamLead},
		{ID: 3, Name: "Foreign Lead", Email: "foreign@example.test", PasswordHash: "x", RoleID: model.RoleIDTeamLead},
		{ID: 4, Name: "Member Admin", Email: "pm@example.test", PasswordHash: "x", RoleID: model.RoleIDDeveloper},
		{ID: 5, Name: "Outsider", Email: "out@example.test", PasswordHash: "x", RoleID: model.RoleIDDeveloper},
		{ID: 6, Name: "Creator", Email: "creator@example.test", PasswordHash: "x", RoleID: model.RoleIDDeveloper},
		{ID: 7, Name: "Organization Lead", Email: "orglead@example.test", PasswordHash: "x", RoleID: model.RoleIDDeveloper},
	}
	for i := range users {
		if err := db.Create(&users[i]).Error; err != nil {
			t.Fatal(err)
		}
	}
	org := model.Organization{ID: 11, Name: "Tenant", Slug: "tenant", CreatedBy: 2, IsActive: true}
	if err := db.Create(&org).Error; err != nil {
		t.Fatal(err)
	}
	for _, m := range []model.OrganizationMember{{OrganizationID: 11, UserID: 7, Role: model.OrgRoleTeamLead, IsActive: true}, {OrganizationID: 11, UserID: 4, Role: model.OrgRoleDeveloper, IsActive: true}} {
		if err := db.Create(&m).Error; err != nil {
			t.Fatal(err)
		}
	}
	proj := model.Project{ID: 21, OrganizationID: 11, Name: "Tenant Project", CreatedBy: 6, IsActive: true}
	if err := db.Create(&proj).Error; err != nil {
		t.Fatal(err)
	}
	pm := model.ProjectMember{ProjectID: 21, UserID: 4, Role: model.ProjectRoleAdmin, IsActive: true}
	if err := db.Create(&pm).Error; err != nil {
		t.Fatal(err)
	}
	inactive := model.Project{ID: 22, OrganizationID: 11, Name: "Inactive", CreatedBy: 5, IsActive: false}
	if err := db.Create(&inactive).Error; err != nil {
		t.Fatal(err)
	}
	repo := NewRepository(db)
	for _, tc := range []struct {
		name              string
		projectID, userID int
		want              bool
	}{
		{"platform admin is globally authorized", 21, 1, true}, {"organization owner", 21, 2, true}, {"organization team lead is scoped", 21, 7, true},
		{"cross-tenant team lead denied", 21, 3, false}, {"project administrator", 21, 4, true}, {"ordinary outsider denied", 21, 5, false}, {"project creator", 21, 6, true},
		{"inactive project denied", 22, 1, false},
	} {
		t.Run(tc.name, func(t *testing.T) {
			got, err := repo.IsAdmin(t.Context(), tc.projectID, tc.userID)
			if err != nil {
				t.Fatal(err)
			}
			if got != tc.want {
				t.Fatalf("got=%v want=%v", got, tc.want)
			}
		})
	}
}
