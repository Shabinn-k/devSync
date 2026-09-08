import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, User, Calendar, MessageCircle, Clock} from 'lucide-react';
import { useTaskStore } from '../store/taskStore'; 

export const TaskDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate(); 
    const { currentTask, isLoading, error, fetchTaskById, updateTaskStatus, addComment } = useTaskStore();
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            fetchTaskById(Number(id));
        }
    }, [id]);

    const handleStatusChange = async (status: string) => {
        await updateTaskStatus(Number(id), status as any);
    };

    const handleAddComment = async () => {
        if (!comment.trim() || !id) return;
        setIsSubmitting(true);
        try {
            await addComment(Number(id), comment.trim());
            setComment('');
            fetchTaskById(Number(id));
        } catch {
            // error handled in store
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white/40" />
            </div>
        );
    }

    if (error || !currentTask) {
        return (
            <div className="flex h-64 flex-col items-center justify-center text-center">
                <p className="text-red-400">{error || 'Task not found'}</p>
                <button
                    onClick={() => id && fetchTaskById(Number(id))}
                    className="mt-4 rounded-full border border-white/10 px-6 py-2 text-sm text-white hover:bg-white/10"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
                <button
                    onClick={() => navigate(`/projects/${currentTask.project_id}`)}
                    className="group mb-6 flex items-center gap-2 text-sm text-white/40 transition-all hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to Project
                </button>

                {/* Task Header */}
                <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white">{currentTask.title}</h1>
                            <div className="mt-2 flex flex-wrap gap-2">
                                <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(currentTask.status)}`}>
                                    {currentTask.status.replace('_', ' ')}
                                </span>
                                <span className={`rounded-full px-3 py-1 text-xs font-medium ${getPriorityColor(currentTask.priority)}`}>
                                    {currentTask.priority}
                                </span>
                            </div>
                        </div>
                        <select
                            value={currentTask.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                        >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="done">Done</option>
                        </select>
                    </div>

                    {currentTask.description && (
                        <p className="mt-4 text-sm text-white/60">{currentTask.description}</p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-6 text-sm text-white/40">
                        {currentTask.assignee && (
                            <span className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Assignee: {currentTask.assignee.name}
                            </span>
                        )}
                        {currentTask.due_date && (
                            <span className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Due: {new Date(currentTask.due_date).toLocaleDateString()}
                            </span>
                        )}
                        <span className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Created: {new Date(currentTask.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                {/* Comments */}
                <div className="mt-6 rounded-2xl border border-white/5 bg-white/5 p-6">
                    <h3 className="text-sm font-medium text-white/60 flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Comments ({currentTask.comments?.length || 0})
                    </h3>

                    <div className="mt-4 space-y-4">
                        {currentTask.comments?.map((comment) => (
                            <div key={comment.id} className="border-t border-white/5 pt-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-white/10 text-xs flex items-center justify-center text-white">
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

                        {/* Add Comment */}
                        <div className="flex gap-2 mt-4">
                            <input
                                type="text"
                                placeholder="Write a comment..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30"
                            />
                            <button
                                onClick={handleAddComment}
                                disabled={!comment.trim() || isSubmitting}
                                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper functions
const getStatusColor = (status: string) => {
    switch (status) {
        case 'todo': return 'text-gray-400 bg-gray-500/10';
        case 'in_progress': return 'text-yellow-400 bg-yellow-500/10';
        case 'review': return 'text-purple-400 bg-purple-500/10';
        case 'done': return 'text-green-400 bg-green-500/10';
        default: return 'text-gray-400 bg-gray-500/10';
    }
};

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'urgent': return 'text-red-400 bg-red-500/10';
        case 'high': return 'text-orange-400 bg-orange-500/10';
        case 'medium': return 'text-yellow-400 bg-yellow-500/10';
        default: return 'text-blue-400 bg-blue-500/10';
    }
};