package chat

import (
	"context"
	"errors"
	"fmt"

	"devSync/internal/model"
	"gorm.io/gorm"
)

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) CreateChannel(ctx context.Context, channel *model.ChatChannel) error {
	return r.db.WithContext(ctx).Create(channel).Error
}

func (r *repository) GetChannelByID(ctx context.Context, channelID int) (*model.ChatChannel, error) {
	var channel model.ChatChannel
	err := r.db.WithContext(ctx).
		Preload("Creator").
		Preload("Members.User").
		Where("id = ?", channelID).
		First(&channel).Error
	if err != nil {
		return nil, err
	}
	return &channel, nil
}

func (r *repository) GetUserChannels(ctx context.Context, userID int) ([]model.ChatChannel, error) {
	var channels []model.ChatChannel
	err := r.db.WithContext(ctx).
		Preload("Creator").
		Preload("Members.User").
		Where("(type = 'direct' AND id IN (SELECT channel_id FROM chat_members WHERE user_id = ?)) "+
			"OR (type = 'org' AND organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = ? AND is_active = true)) "+
			"OR (type = 'project' AND project_id IN (SELECT project_id FROM project_members WHERE user_id = ? AND is_active = true)) "+
			"OR (type = 'team' AND team_id IN (SELECT team_id FROM team_members WHERE user_id = ? AND is_active = true))",
			userID, userID, userID, userID).
		Order("updated_at DESC").
		Find(&channels).Error
	if err != nil {
		return nil, err
	}
	return channels, nil
}

func (r *repository) GetOrgChannels(ctx context.Context, organizeID int) ([]model.ChatChannel, error) {
	var channels []model.ChatChannel
	err := r.db.WithContext(ctx).
		Preload("Creator").
		Where("organization_id = ? AND type = 'org'", organizeID).
		Order("created_at ASC").
		Find(&channels).Error
	return channels, err
}

func (r *repository) GetProjectChannels(ctx context.Context, projectID int) ([]model.ChatChannel, error) {
	var channels []model.ChatChannel
	err := r.db.WithContext(ctx).
		Preload("Creator").
		Where("project_id = ? AND type = 'project'", projectID).
		Order("created_at ASC").
		Find(&channels).Error
	return channels, err
}

func (r *repository) FindDirectChannel(ctx context.Context, user1ID, user2ID int) (*model.ChatChannel, error) {
	var channel model.ChatChannel
	err := r.db.WithContext(ctx).
		Preload("Creator").
		Preload("Members.User").
		Where("type = 'direct' AND id IN ("+
			"SELECT channel_id FROM chat_members WHERE user_id = ? "+
			"INTERSECT "+
			"SELECT channel_id FROM chat_members WHERE user_id = ?)",
			user1ID, user2ID).
		First(&channel).Error
	if err != nil {
		return nil, err
	}
	return &channel, nil
}

func (r *repository) CanDirectMessage(ctx context.Context, user1ID, user2ID int) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Table("organization_members AS a").
		Joins("JOIN organization_members AS b ON b.organization_id = a.organization_id").
		Joins("JOIN organizations AS o ON o.id = a.organization_id").
		Joins("JOIN users AS ua ON ua.id = a.user_id").
		Joins("JOIN users AS ub ON ub.id = b.user_id").
		Where("a.user_id = ? AND b.user_id = ? AND a.is_active = true AND b.is_active = true AND o.is_active = true AND ua.is_active = true AND ub.is_active = true", user1ID, user2ID).
		Count(&count).Error
	return count > 0, err
}

// CreateDirectChannel serializes creation for a user pair and writes the
// channel and both memberships atomically, preventing duplicate partial DMs.
func (r *repository) CreateDirectChannel(ctx context.Context, user1ID, user2ID int, name string) (*model.ChatChannel, error) {
	var channel model.ChatChannel
	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		lockKey := fmt.Sprintf("devsync-dm:%d:%d", min(user1ID, user2ID), max(user1ID, user2ID))
		if err := tx.Exec("SELECT pg_advisory_xact_lock(hashtext(?))", lockKey).Error; err != nil {
			return err
		}
		var eligible int64
		if err := tx.Table("organization_members AS a").
			Joins("JOIN organization_members AS b ON b.organization_id = a.organization_id").
			Joins("JOIN organizations AS o ON o.id = a.organization_id").
			Joins("JOIN users AS ua ON ua.id = a.user_id").
			Joins("JOIN users AS ub ON ub.id = b.user_id").
			Where("a.user_id = ? AND b.user_id = ? AND a.is_active = true AND b.is_active = true AND o.is_active = true AND ua.is_active = true AND ub.is_active = true", user1ID, user2ID).
			Count(&eligible).Error; err != nil {
			return err
		}
		if eligible == 0 {
			return errors.New("direct messages require active users who share an organization")
		}
		err := tx.Preload("Creator").Preload("Members.User").
			Where("type = 'direct' AND id IN (SELECT channel_id FROM chat_members WHERE user_id = ?) AND id IN (SELECT channel_id FROM chat_members WHERE user_id = ?)", user1ID, user2ID).
			First(&channel).Error
		if err == nil {
			return nil
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		channel = model.ChatChannel{Name: name, Type: model.ChatTypeDirect, CreatedBy: user1ID}
		if err := tx.Create(&channel).Error; err != nil {
			return err
		}
		if err := tx.Create(&model.ChatMember{ChannelID: channel.ID, UserID: user1ID}).Error; err != nil {
			return err
		}
		if err := tx.Create(&model.ChatMember{ChannelID: channel.ID, UserID: user2ID}).Error; err != nil {
			return err
		}
		return tx.Preload("Creator").Preload("Members.User").First(&channel, channel.ID).Error
	})
	if err != nil {
		return nil, err
	}
	return &channel, nil
}

func (r *repository) ListDMCandidates(ctx context.Context, currentUserID int) ([]model.User, error) {
	var users []model.User
	subquery := r.db.WithContext(ctx).
		Table("organization_members").
		Select("organization_id").
		Where("user_id = ? AND is_active = ?", currentUserID, true)
	err := r.db.WithContext(ctx).
		Table("users AS u").
		Select("DISTINCT u.id, u.name, u.email").
		Joins("JOIN organization_members AS om ON om.user_id = u.id").
		Where("om.organization_id IN (?) AND om.is_active = ? AND u.is_active = ? AND u.id <> ?", subquery, true, true, currentUserID).
		Order("u.name ASC").
		Scan(&users).Error
	return users, err
}

func (r *repository) AddMember(ctx context.Context, member *model.ChatMember) error {
	var count int64
	r.db.WithContext(ctx).Model(&model.ChatMember{}).
		Where("channel_id = ? AND user_id = ?", member.ChannelID, member.UserID).
		Count(&count)
	if count > 0 {
		return nil
	}
	return r.db.WithContext(ctx).Create(member).Error
}

func (r *repository) GetChannelMembers(ctx context.Context, channelID int) ([]model.ChatMember, error) {
	db := r.db.WithContext(ctx)
	var channel model.ChatChannel
	if err := db.Select("id", "type", "organization_id", "project_id", "team_id").First(&channel, channelID).Error; err != nil {
		return nil, err
	}

	// Resolve recipients from the same active membership tables used by channel access checks.
	var userIDs []int
	switch channel.Type {
	case model.ChatTypeOrg:
		if channel.OrganizationID != nil {
			if err := db.Model(&model.OrganizationMember{}).Where("organization_id = ? AND is_active = true", *channel.OrganizationID).Pluck("user_id", &userIDs).Error; err != nil {
				return nil, err
			}
		}
	case model.ChatTypeProject:
		if channel.ProjectID != nil {
			if err := db.Model(&model.ProjectMember{}).Where("project_id = ? AND is_active = true", *channel.ProjectID).Pluck("user_id", &userIDs).Error; err != nil {
				return nil, err
			}
		}
	case model.ChatTypeTeam:
		if channel.TeamID != nil {
			if err := db.Model(&model.TeamMember{}).Where("team_id = ? AND is_active = true", *channel.TeamID).Pluck("user_id", &userIDs).Error; err != nil {
				return nil, err
			}
		}
	}

	var explicitMembers []model.ChatMember
	if channel.Type == model.ChatTypeDirect {
		if err := db.Where("channel_id = ?", channelID).Find(&explicitMembers).Error; err != nil {
			return nil, err
		}
	}
	seen := make(map[int]bool, len(userIDs)+len(explicitMembers))
	members := make([]model.ChatMember, 0, len(userIDs)+len(explicitMembers))
	for _, userID := range userIDs {
		if !seen[userID] {
			seen[userID] = true
			members = append(members, model.ChatMember{ChannelID: channelID, UserID: userID})
		}
	}
	for _, member := range explicitMembers {
		if !seen[member.UserID] {
			seen[member.UserID] = true
			members = append(members, member)
		}
	}
	return members, nil
}

func (r *repository) IsChannelMember(ctx context.Context, channelID, userID int) (bool, error) {
	var channel model.ChatChannel
	if err := r.db.WithContext(ctx).Where("id = ?", channelID).First(&channel).Error; err != nil {
		return false, err
	}

	if channel.Type == model.ChatTypeOrg && channel.OrganizationID != nil {
		var count int64
		r.db.WithContext(ctx).Model(&model.OrganizationMember{}).
			Where("organization_id = ? AND user_id = ? AND is_active = true", *channel.OrganizationID, userID).
			Count(&count)
		return count > 0, nil
	}

	if channel.Type == model.ChatTypeProject && channel.ProjectID != nil {
		var count int64
		r.db.WithContext(ctx).Model(&model.ProjectMember{}).
			Where("project_id = ? AND user_id = ? AND is_active = true", *channel.ProjectID, userID).
			Count(&count)
		return count > 0, nil
	}

	if channel.Type == model.ChatTypeTeam && channel.TeamID != nil {
		var count int64
		r.db.WithContext(ctx).Model(&model.TeamMember{}).
			Where("team_id = ? AND user_id = ? AND is_active = true", *channel.TeamID, userID).
			Count(&count)
		return count > 0, nil
	}
	if channel.Type != model.ChatTypeDirect {
		return false, nil
	}

	var count int64
	err := r.db.WithContext(ctx).Model(&model.ChatMember{}).
		Where("channel_id = ? AND user_id = ?", channelID, userID).
		Count(&count).Error
	return count > 0, err
}

func (r *repository) CreateMessage(ctx context.Context, msg *model.ChatMessage) error {
	if err := r.db.WithContext(ctx).Create(msg).Error; err != nil {
		return err
	}
	return r.db.WithContext(ctx).
		Preload("Sender").
		Where("id = ?", msg.ID).
		First(msg).Error
}

func (r *repository) GetChannelMessages(ctx context.Context, channelID, limit, offset int) ([]model.ChatMessage, int64, error) {
	var total int64
	r.db.WithContext(ctx).Model(&model.ChatMessage{}).Where("channel_id = ?", channelID).Count(&total)

	var messages []model.ChatMessage
	err := r.db.WithContext(ctx).
		Preload("Sender").
		Where("channel_id = ?", channelID).
		Order("created_at ASC").
		Limit(limit).
		Offset(offset).
		Find(&messages).Error
	return messages, total, err
}
