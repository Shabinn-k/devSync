package chat

import (
	"context"

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
		Where("id IN (SELECT channel_id FROM chat_members WHERE user_id = ?) "+
			"OR (type = 'org' AND organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = ? AND is_active = true)) "+
			"OR (type = 'project' AND project_id IN (SELECT project_id FROM project_members WHERE user_id = ? AND is_active = true))",
			userID, userID, userID).
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
	var members []model.ChatMember
	err := r.db.WithContext(ctx).
		Preload("User").
		Where("channel_id = ?", channelID).
		Find(&members).Error
	return members, err
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
		if count > 0 { return true, nil }
	}

	if channel.Type == model.ChatTypeProject && channel.ProjectID != nil {
		var count int64
		r.db.WithContext(ctx).Model(&model.ProjectMember{}).
			Where("project_id = ? AND user_id = ? AND is_active = true", *channel.ProjectID, userID).
			Count(&count)
		if count > 0 { return true, nil }
	}
 
	if channel.Type == model.ChatTypeTeam && channel.TeamID != nil {
		var count int64
		r.db.WithContext(ctx).Model(&model.TeamMember{}).
			Where("team_id = ? AND user_id = ? AND is_active = true", *channel.TeamID, userID).
			Count(&count)
		if count > 0 { return true, nil }
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
