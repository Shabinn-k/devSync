package chat

import (
	"context"
	"strings"
	"testing"

	"devSync/config"
	"devSync/internal/dto/request"
	"devSync/internal/model"
	authRepo "devSync/internal/repositories/auth"
	chatRepo "devSync/internal/repositories/chat"
	orgRepo "devSync/internal/repositories/organization"
	projectRepo "devSync/internal/repositories/project"
	teamRepo "devSync/internal/repositories/team"
)

type chatRepositoryStub struct {
	chatRepo.Repository
	created bool
	canDM   bool
}

func (s *chatRepositoryStub) CreateChannel(_ context.Context, c *model.ChatChannel) error {
	s.created = true
	c.ID = 1
	return nil
}
func (s *chatRepositoryStub) CanDirectMessage(context.Context, int, int) (bool, error) {
	return s.canDM, nil
}

type orgRepositoryStub struct {
	orgRepo.Repository
	org    *model.Organization
	member bool
}

func (s *orgRepositoryStub) GetByID(context.Context, int) (*model.Organization, error) {
	return s.org, nil
}
func (s *orgRepositoryStub) IsMember(context.Context, int, int) (bool, error) { return s.member, nil }

type projectRepositoryStub struct {
	projectRepo.Repository
	project *model.Project
	member  bool
}

func (s *projectRepositoryStub) GetByID(context.Context, int) (*model.Project, error) {
	return s.project, nil
}
func (s *projectRepositoryStub) IsMember(context.Context, int, int) (bool, error) {
	return s.member, nil
}

type teamRepositoryStub struct {
	teamRepo.Repository
	team   *model.Team
	member bool
}

func (s *teamRepositoryStub) GetByID(context.Context, int) (*model.Team, error) { return s.team, nil }
func (s *teamRepositoryStub) IsMember(context.Context, int, int) (bool, error)  { return s.member, nil }

type authRepositoryStub struct{ authRepo.Repository }

func TestCreateChannelRequiresActiveResourceMembership(t *testing.T) {
	ctx := context.Background()
	tests := []struct {
		name      string
		req       request.CreateChannelRequest
		org       *orgRepositoryStub
		project   *projectRepositoryStub
		team      *teamRepositoryStub
		wantError string
	}{
		{"foreign organization", request.CreateChannelRequest{Type: model.ChatTypeOrg, Name: "general", OrganizationID: intPtr(7)}, &orgRepositoryStub{org: &model.Organization{ID: 7, IsActive: true}, member: false}, &projectRepositoryStub{}, &teamRepositoryStub{}, "membership"},
		{"inactive organization", request.CreateChannelRequest{Type: model.ChatTypeOrg, Name: "general", OrganizationID: intPtr(7)}, &orgRepositoryStub{org: &model.Organization{ID: 7, IsActive: false}, member: true}, &projectRepositoryStub{}, &teamRepositoryStub{}, "not found"},
		{"non-member project", request.CreateChannelRequest{Type: model.ChatTypeProject, Name: "build", ProjectID: intPtr(3)}, &orgRepositoryStub{}, &projectRepositoryStub{project: &model.Project{ID: 3, IsActive: true}, member: false}, &teamRepositoryStub{}, "membership"},
		{"non-member team", request.CreateChannelRequest{Type: model.ChatTypeTeam, Name: "ops", TeamID: intPtr(4)}, &orgRepositoryStub{}, &projectRepositoryStub{}, &teamRepositoryStub{team: &model.Team{ID: 4, IsActive: true}, member: false}, "membership"},
		{"unsupported type", request.CreateChannelRequest{Type: "other", Name: "x"}, &orgRepositoryStub{}, &projectRepositoryStub{}, &teamRepositoryStub{}, "unsupported"},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			repo := &chatRepositoryStub{}
			svc := NewService(repo, &authRepositoryStub{}, tc.org, tc.project, tc.team, nil, &config.AppConfig{})
			_, err := svc.CreateChannel(ctx, 10, &tc.req)
			if err == nil || !strings.Contains(err.Error(), tc.wantError) {
				t.Fatalf("error=%v want substring=%q", err, tc.wantError)
			}
			if repo.created {
				t.Fatal("unauthorized channel was persisted")
			}
		})
	}
}

func TestDirectMessageRequiresSharedOrganization(t *testing.T) {
	repo := &chatRepositoryStub{canDM: false}
	svc := NewService(repo, &authRepositoryStub{}, &orgRepositoryStub{}, &projectRepositoryStub{}, &teamRepositoryStub{}, nil, &config.AppConfig{})
	if _, err := svc.GetDirectChannel(context.Background(), 1, 99); err == nil {
		t.Fatal("expected arbitrary user DM to be rejected")
	}
}

func intPtr(v int) *int { return &v }
