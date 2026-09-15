import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from '../types/chat';
import { useAuthStore } from '../../../stores/authStore';
import { MessageSquare, Loader2 } from 'lucide-react';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  const { user } = useAuthStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/40" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/30">
          <MessageSquare className="h-6 w-6" />
        </div>
        <h4 className="mt-4 text-sm font-semibold text-white">No messages yet</h4>
        <p className="mt-1 text-xs text-white/40">Say hello and start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => {
        const isMe = user?.id === msg.sender_id;
        const initials = (msg.sender_name || 'U').slice(0, 2).toUpperCase();
        const timeStr = new Date(msg.created_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <div
            key={msg.id}
            className={`flex items-end gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/10 border border-white/10 text-[10px] font-bold text-white uppercase">
              {initials}
            </div>

            <div className={`max-w-[75%] sm:max-w-[60%] space-y-1 ${isMe ? 'items-end text-right' : 'items-start text-left'}`}>
              {!isMe && (
                <p className="text-[11px] font-medium text-white/40 px-1">
                  {msg.sender_name || msg.sender_email}
                </p>
              )}
              <div
                className={`rounded-2xl px-4 py-2.5 text-sm break-words ${
                  isMe
                    ? 'bg-white text-black rounded-br-none'
                    : 'bg-white/10 text-white border border-white/5 rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.message}</p>
              </div>
              <p className="text-[10px] text-white/30 px-1">{timeStr}</p>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};