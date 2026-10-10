package invitation

import (
	"fmt"
	"net/url"
	"os"
	"sync"
	"testing"
	"time"

	"devSync/internal/model"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// This exercises row locking and transaction behavior only when an explicit,
// disposable PostgreSQL test database is supplied.
func TestInvitationAcceptanceIsAtomicAndSingleUse(t *testing.T) {
	dsn := os.Getenv("DEVSYNC_TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("set DEVSYNC_TEST_DATABASE_URL to run isolated PostgreSQL invitation tests")
	}
	adminDB, err := gorm.Open(postgres.Open(dsn), &gorm.Config{DisableForeignKeyConstraintWhenMigrating: true})
	if err != nil {
		t.Fatal(err)
	}
	adminSQL, err := adminDB.DB()
	if err != nil {
		t.Fatal(err)
	}
	schema := fmt.Sprintf("devsync_invite_test_%x", time.Now().UnixNano())
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
	if err := db.AutoMigrate(&model.OrganizationInvitation{}, &model.OrganizationMember{}); err != nil {
		t.Fatal(err)
	}
	entries := []model.OrganizationInvitation{
		{OrganizationID: 1, Email: "member@example.test", Token: "valid-token", Role: model.OrgRoleDeveloper, Status: model.InvitationStatusPending, ExpiresAt: time.Now().Add(time.Hour), CreatedBy: 1},
		{OrganizationID: 2, Email: "expired@example.test", Token: "expired-token", Role: model.OrgRoleDeveloper, Status: model.InvitationStatusPending, ExpiresAt: time.Now().Add(-time.Minute), CreatedBy: 1},
		{OrganizationID: 3, Email: "revoked@example.test", Token: "revoked-token", Role: model.OrgRoleDeveloper, Status: "revoked", ExpiresAt: time.Now().Add(time.Hour), CreatedBy: 1},
	}
	if err := db.Create(&entries).Error; err != nil {
		t.Fatal(err)
	}
	repo := NewRepository(db)
	if err := repo.SetPendingStatus(t.Context(), "expired-token", model.InvitationStatusDeclined); err != ErrInvitationExpired {
		t.Fatalf("expired decline error=%v", err)
	}
	if err := repo.AcceptPending(t.Context(), "revoked-token", "revoked@example.test", 12); err == nil {
		t.Fatal("revoked invitation was accepted")
	}

	var wg sync.WaitGroup
	errs := make(chan error, 2)
	for range 2 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			errs <- repo.AcceptPending(t.Context(), "valid-token", "MEMBER@example.test", 12)
		}()
	}
	wg.Wait()
	close(errs)
	successes := 0
	for err := range errs {
		if err == nil {
			successes++
		}
	}
	if successes != 1 {
		t.Fatalf("successful concurrent acceptances=%d want=1", successes)
	}
	var count int64
	if err := db.Model(&model.OrganizationMember{}).Where("organization_id = ? AND user_id = ? AND is_active = true", 1, 12).Count(&count).Error; err != nil {
		t.Fatal(err)
	}
	if count != 1 {
		t.Fatalf("active membership count=%d want=1", count)
	}
	if err := repo.SetPendingStatus(t.Context(), "valid-token", model.InvitationStatusDeclined); err == nil {
		t.Fatal("accepted invitation was reused")
	}
}
