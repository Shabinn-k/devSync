import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface MessageInputProps {
    onSendMessage: (content: string) => Promise<void>;
    disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled }) => {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || sending || disabled) return;

        const text = message.trim();
        setMessage('');
        setSending(true);
        try {
            await onSendMessage(text);
        } catch {
            setMessage(text);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="border-t border-white/5 bg-black/60 p-4 backdrop-blur-sm">
            <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-white/5 p-2 focus-within:border-white/30 transition-colors">
                <textarea
                    rows={1}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message... (Enter to send, Shift+Enter for newline)"
                    disabled={disabled}
                    className="max-h-32 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-white placeholder:text-white/20 outline-none"
                />
                <button
                    type="submit"
                    disabled={!message.trim() || sending || disabled}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-black transition-all hover:bg-white/90 disabled:opacity-30 disabled:hover:bg-white"
                >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
            </div>
        </form>
    );
};
