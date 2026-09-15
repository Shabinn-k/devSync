import { apiClient } from '../../../lib/axios';
import type { ApiResponse } from '../../../types/api';
import type {
    ChatChannel,
    ChatMessage,
    CreateChannelRequest,
    SendMessageRequest,
} from '../types/chat';

export const chatApi = {
    getChannels: (): Promise<ChatChannel[]> =>
        apiClient.get<ApiResponse<ChatChannel[]>>('/chat/channels')
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                return [];
            }),

    createChannel: (data: CreateChannelRequest): Promise<ChatChannel> =>
        apiClient.post<ApiResponse<ChatChannel>>('/chat/channels', data)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Failed to create channel');
            }),

    getDirectChannel: (recipientId: number): Promise<ChatChannel> =>
        apiClient.post<ApiResponse<ChatChannel>>('/chat/direct', { recipient_id: recipientId })
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Failed to get direct chat');
            }),

    getChannel: (channelId: number): Promise<ChatChannel> =>
        apiClient.get<ApiResponse<ChatChannel>>(`/chat/channels/${channelId}`)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Channel not found');
            }),

    getMessages: (channelId: number, page = 1, limit = 50): Promise<{ messages: ChatMessage[]; total: number }> =>
        apiClient.get<ApiResponse<ChatMessage[]>>(`/chat/channels/${channelId}/messages?page=${page}&limit=${limit}`)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return {
                        messages: res.data.data,
                        total: res.data.pagination?.total_items || res.data.total || res.data.data.length || 0,
                    };
                }
                return { messages: [], total: 0 };
            }),

    sendMessage: (channelId: number, data: SendMessageRequest): Promise<ChatMessage> =>
        apiClient.post<ApiResponse<ChatMessage>>(`/chat/channels/${channelId}/messages`, data)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Failed to send message');
            }),
};
