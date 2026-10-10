package auth

import (
	"context"
	"testing"
	"time"

	"devSync/config"
	"devSync/internal/dto/request"
	"devSync/internal/model"
	authRepo "devSync/internal/repositories/auth"
)

type logoutRepositoryStub struct {
	authRepo.Repository
	token   *model.RefreshToken
	revoked int
}

func (s *logoutRepositoryStub) GetRefreshTokenByHash(context.Context, string) (*model.RefreshToken, error) {
	return s.token, nil
}
func (s *logoutRepositoryStub) RevokeRefreshToken(context.Context, int) error {
	s.revoked++
	return nil
}

func TestLogoutRequiresRefreshTokenOwnership(t *testing.T) {
	refresh := "secret-refresh-token"
	tests := []struct {
		name        string
		userID      int
		token       *model.RefreshToken
		wantError   bool
		wantRevoked int
	}{
		{"owner", 7, &model.RefreshToken{ID: 2, UserID: 7, ExpiresAt: time.Now().Add(time.Hour)}, false, 1},
		{"other user", 8, &model.RefreshToken{ID: 2, UserID: 7, ExpiresAt: time.Now().Add(time.Hour)}, true, 0},
		{"revoked", 7, &model.RefreshToken{ID: 2, UserID: 7, IsRevoked: true, ExpiresAt: time.Now().Add(time.Hour)}, true, 0},
		{"expired", 7, &model.RefreshToken{ID: 2, UserID: 7, ExpiresAt: time.Now().Add(-time.Minute)}, true, 0},
		{"invalid", 7, nil, true, 0},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			repo := &logoutRepositoryStub{token: tc.token}
			svc := NewService(repo, &config.AppConfig{}, nil)
			err := svc.Logout(context.Background(), tc.userID, &request.LogoutRequest{RefreshToken: refresh})
			if (err != nil) != tc.wantError {
				t.Fatalf("error=%v wantError=%v", err, tc.wantError)
			}
			if repo.revoked != tc.wantRevoked {
				t.Fatalf("revoked=%d want=%d", repo.revoked, tc.wantRevoked)
			}
		})
	}
}
