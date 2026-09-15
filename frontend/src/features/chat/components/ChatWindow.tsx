import React from 'react';
import type { ChatChannel, ChatMessage } from '../types/chat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Hash, Users, User } from 'lucide-react';

interface ChatWindowProps {
    channel: ChatChannel | null;
    messages: ChatMessage[];
    isLoading: boolean;
    onSendMessage: (text: string) => Promise<void>;
}

const channelLabel = (type: string): string => {
    switch (type) {
        case 'org':      return 'Organization Channel';
        case 'team':     return 'Team Channel';
        case 'project':  return 'Project Channel';
        case 'direct':   return 'Direct Conversation';
        default:         return 'Channel';
    }
};

export const ChatWindow: React.FC<ChatWindowProps> = ({
    channel,
    messages,
    isLoading,
    onSendMessage,
}) => {
    if (!channel) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center bg-black/40 text-center p-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-white/30 mb-4">
                    <Hash className="h-8 w-8" />
                </div>
                <h3 className="text-base font-semibold text-white">Select a channel</h3>
                <p className="mt-1 max-w-sm text-xs text-white/40">
                    Choose a channel or direct message from the sidebar to begin.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col bg-black/50 overflow-hidden">
            {/* Header */}
            <div className="flex h-14 items-center justify-between border-b border-white/5 px-6 bg-black/40 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70">
                        {channel.type === 'direct' ? (
                            <User className="h-4 w-4" />
                        ) : (
                            <Hash className="h-4 w-4" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                            {channel.name}
                        </h2>
                        <p className="text-[11px] text-white/40">
                            {channelLabel(channel.type)}
                        </p>
                    </div>
                </div>

                {channel.members && channel.members.length > 0 && (
                    <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                        <Users className="h-3 w-3" />
                        <span>{channel.members.length}</span>
                    </div>
                )}
            </div>

            <MessageList messages={messages} isLoading={isLoading} />

            <MessageInput onSendMessage={onSendMessage} />
        </div>
    );
};