import { useState, useEffect } from 'react';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';

interface TaskCommentsProps {
    taskId: number;
}

export const TaskComments = ({ taskId }: TaskCommentsProps) => {
    const { comments, fetchComments, addComment } = useTaskStore();
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchComments(taskId);
    }, [taskId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            await addComment(taskId, content.trim());
            setContent('');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-6 rounded-2xl border border-white/5 bg-white/5 p-6">
            <h3 className="text-sm font-medium text-white/60 flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Comments ({comments.length})
            </h3>

            <div className="mt-4 space-y-4 max-h-96 overflow-y-auto">
                {comments.map((comment) => (
                    <div key={comment.id} className="border-t border-white/5 pt-4">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-white">
                                {comment.user?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <span className="text-sm text-white">{comment.user?.name}</span>
                            <span className="text-xs text-white/30">
                                {new Date(comment.created_at).toLocaleString()}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-white/60 ml-8">{comment.content}</p>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
                <input
                    type="text"
                    placeholder="Write a comment..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30"
                />
                <button
                    type="submit"
                    disabled={!content.trim() || isSubmitting}
                    className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-50"
                >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
            </form>
        </div>
    );
};