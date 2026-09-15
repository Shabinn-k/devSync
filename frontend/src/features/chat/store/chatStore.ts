import { create } from 'zustand';
import { chatApi } from '../api/chatApi';
import type {
  ChatChannel,
  ChatMessage,
  CreateChannelRequest,
} from '../types/chat';

interface ChatState {
  channels: ChatChannel[];
  activeChannel: ChatChannel | null;
  messages: Record<number, ChatMessage[]>;
  isLoadingChannels: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  error: string | null;

  fetchChannels: () => Promise<void>;
  selectChannel: (channel: ChatChannel) => Promise<void>;
  fetchMessages: (channelId: number) => Promise<void>;
  sendMessage: (channelId: number, message: string, attachmentUrl?: string) => Promise<void>;
  createChannel: (data: CreateChannelRequest) => Promise<ChatChannel>;
  openDirectChat: (recipientId: number) => Promise<ChatChannel>;
  addIncomingMessage: (message: ChatMessage) => void;
  clearError: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  channels: [],
  activeChannel: null,
  messages: {},
  isLoadingChannels: false,
  isLoadingMessages: false,
  isSending: false,
  error: null,

  fetchChannels: async () => {
    set({ isLoadingChannels: true, error: null });
    try {
      const channels = await chatApi.getChannels();
      set({ channels, isLoadingChannels: false });
      if (!get().activeChannel && channels.length > 0) {
        get().selectChannel(channels[0]);
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to load channels', isLoadingChannels: false });
    }
  },

  selectChannel: async (channel: ChatChannel) => {
    set({ activeChannel: channel });
    await get().fetchMessages(channel.id);
  },

  fetchMessages: async (channelId: number) => {
    set({ isLoadingMessages: true });
    try {
      const { messages } = await chatApi.getMessages(channelId, 1, 100);
      if (get().activeChannel?.id === channelId) {
        set((state) => ({
          messages: { ...state.messages, [channelId]: messages },
          isLoadingMessages: false,
        }));
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to load messages', isLoadingMessages: false });
    }
  },

  sendMessage: async (channelId: number, message: string, attachmentUrl?: string) => {
    if (!message.trim()) return;
    set({ isSending: true, error: null });
    try {
      const sent = await chatApi.sendMessage(channelId, {
        message: message.trim(),
        attachment_url: attachmentUrl,
      });
      set((state) => {
        const current = state.messages[channelId] || [];
        const exists = current.some((m) => m.id === sent.id);
        return {
          messages: {
            ...state.messages,
            [channelId]: exists ? current : [...current, sent],
          },
          isSending: false,
        };
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to send message', isSending: false });
      throw err;
    }
  },

  createChannel: async (data: CreateChannelRequest) => {
    set({ error: null });
    try {
      const channel = await chatApi.createChannel(data);
      set((state) => ({
        channels: [channel, ...state.channels],
        activeChannel: channel,
      }));
      await get().fetchMessages(channel.id);
      return channel;
    } catch (err: any) {
      set({ error: err.message || 'Failed to create channel' });
      throw err;
    }
  },

  openDirectChat: async (recipientId: number) => {
    set({ error: null });
    try {
      const channel = await chatApi.getDirectChannel(recipientId);
      set((state) => {
        const exists = state.channels.some((c) => c.id === channel.id);
        return {
          channels: exists ? state.channels : [channel, ...state.channels],
          activeChannel: channel,
        };
      });
      await get().fetchMessages(channel.id);
      return channel;
    } catch (err: any) {
      set({ error: err.message || 'Failed to open direct chat' });
      throw err;
    }
  },

  addIncomingMessage: (message: ChatMessage) => {
    set((state) => {
      const channelId = message.channel_id;
      const current = state.messages[channelId] || [];
      if (current.some((m) => m.id === message.id)) {
        return state;
      }
      return {
        messages: {
          ...state.messages,
          [channelId]: [...current, message],
        },
      };
    });
  },

  clearError: () => set({ error: null }),
}));