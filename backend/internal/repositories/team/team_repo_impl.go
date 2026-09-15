package team

import (
	"context"
	"errors"
	"time"

	"gorm.io/gorm"
	"devSync/internal/model"
)

func (r *repository) Create(ctx context.Context, team *model.Team) error {
	return r.db.WithContext(ctx).Create(team).Error
}

func (r *repository) GetByID(ctx context.Context, id int) (*model.Team, error) {
	var team model.Team
	err := r.db.WithContext(ctx).
		Where("id = ? AND is_active = ?", id, true).
		Preload("Lead").
		Preload("Organization").
		First(&team).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &team, err
}

func (r *repository) GetByOrganization(ctx context.Context, organizeID int, limit, offset int) ([]model.Team, int64, error) {
	var teams []model.Team
	var total int64

	query := r.db.WithContext(ctx).Model(&model.Team{}).
		Where("organization_id = ? AND is_active = ?", organizeID, true)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.
		Preload("Lead").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&teams).Error

	return teams, total, err
}

func (r *repository) GetUserTeams(ctx context.Context, userID int) ([]model.Team, error) {
	var teams []model.Team
	err := r.db.WithContext(ctx).
		Table("teams").
		Joins("JOIN team_members ON team_members.team_id = teams.id").
		Where("team_members.user_id = ? AND team_members.is_active = ? AND teams.is_active = ?", userID, true, true).
		Preload("Lead").
		Order("teams.created_at DESC").
		Find(&teams).Error
	return teams, err
}

func (r *repository) Update(ctx context.Context, team *model.Team) error {
	team.UpdatedAt = time.Now()
	return r.db.WithContext(ctx).Save(team).Error
}

func (r *repository) Delete(ctx context.Context, id int) error {
	return r.db.WithContext(ctx).
		Model(&model.Team{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"is_active":  false,
			"updated_at": time.Now(),
		}).Error
}

func (r *repository) GetMemberCount(ctx context.Context, teamID int) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&model.TeamMember{}).
		Where("team_id = ? AND is_active = ?", teamID, true).
		Count(&count).Error
	return count, err
}

func (r *repository) AddMember(ctx context.Context, member *model.TeamMember) error {
	var existing model.TeamMember
	err := r.db.WithContext(ctx).
		Where("team_id = ? AND user_id = ? AND is_active = ?", member.TeamID, member.UserID, true).
		First(&existing).Error
	if err == nil {
		return ErrAlreadyMember
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}
	return r.db.WithContext(ctx).Create(member).Error
}

func (r *repository) GetMember(ctx context.Context, teamID, userID int) (*model.TeamMember, error) {
	var member model.TeamMember
	err := r.db.WithContext(ctx).
		Where("team_id = ? AND user_id = ? AND is_active = ?", teamID, userID, true).
		First(&member).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrMemberNotFound
	}
	return &member, err
}

func (r *repository) GetMemberByID(ctx context.Context, teamID, memberID int) (*model.TeamMember, error) {
	var member model.TeamMember
	err := r.db.WithContext(ctx).
		Where("team_id = ? AND id = ? AND is_active = ?", teamID, memberID, true).
		First(&member).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrMemberNotFound
	}
	return &member, err
}

func (r *repository) GetMembers(ctx context.Context, teamID int) ([]model.TeamMember, error) {
	var members []model.TeamMember
	err := r.db.WithContext(ctx).
		Where("team_id = ? AND is_active = ?", teamID, true).
		Preload("User").
		Order("joined_at ASC").
		Find(&members).Error
	return members, err
}

func (r *repository) UpdateMemberRole(ctx context.Context, teamID, memberID int, role string) error {
	return r.db.WithContext(ctx).
		Model(&model.TeamMember{}).
		Where("team_id = ? AND id = ?", teamID, memberID).
		Updates(map[string]interface{}{
			"role":       role,
			"updated_at": time.Now(),
		}).Error
}

func (r *repository) RemoveMember(ctx context.Context, teamID, memberID int) error {
	return r.db.WithContext(ctx).
		Model(&model.TeamMember{}).
		Where("team_id = ? AND id = ?", teamID, memberID).
		Updates(map[string]interface{}{
			"is_active":  false,
			"updated_at": time.Now(),
		}).Error
}

func (r *repository) IsMember(ctx context.Context, teamID, userID int) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&model.TeamMember{}).
		Where("team_id = ? AND user_id = ? AND is_active = ?", teamID, userID, true).
		Count(&count).Error
	return count > 0, err
}

func (r *repository) IsAdmin(ctx context.Context, teamID, userID int) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&model.TeamMember{}).
		Where("team_id = ? AND user_id = ? AND role = ? AND is_active = ?", teamID, userID, model.TeamRoleAdmin, true).
		Count(&count).Error
	return count > 0, err
}