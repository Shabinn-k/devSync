package chat

import (
	"context"

	"devSync/internal/model"
)

type Repository interface {
	CreateChannel(ctx context.Context, channel *model.ChatChannel) error
	GetChannelByID(ctx context.Context, channelID int) (*model.ChatChannel, error)
	GetUserChannels(ctx context.Context, userID int) ([]model.ChatChannel, error)
	GetOrgChannels(ctx context.Context, organizeID int) ([]model.ChatChannel, error)
	GetProjectChannels(ctx context.Context, projectID int) ([]model.ChatChannel, error)
	FindDirectChannel(ctx context.Context, user1ID, user2ID int) (*model.ChatChannel, error)
	AddMember(ctx context.Context, member *model.ChatMember) error
	GetChannelMembers(ctx context.Context, channelID int) ([]model.ChatMember, error)
	IsChannelMember(ctx context.Context, channelID, userID int) (bool, error)
	CreateMessage(ctx context.Context, msg *model.ChatMessage) error
	GetChannelMessages(ctx context.Context, channelID, limit, offset int) ([]model.ChatMessage, int64, error)
}
