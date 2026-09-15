import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { TaskDetailHeader } from '../components/TaskDetailHeader';
import { TaskComments } from '../components/TaskComments';

export const TaskDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentTask, isLoading, error, fetchTaskById } = useTaskStore();

    useEffect(() => {
        if (id) {
            const taskId = Number(id);
            if (!isNaN(taskId) && taskId > 0) {
                fetchTaskById(taskId);
            }
        }
    }, [id, fetchTaskById]);

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center bg-black">
                <Loader2 className="h-8 w-8 animate-spin text-white/40" />
            </div>
        );
    }

    if (error || !currentTask) {
        return (
            <div className="flex h-64 flex-col items-center justify-center text-center bg-black p-6">
                <p className="text-red-400 text-sm">{error || 'Task not found'}</p>
                <button
                    onClick={() => id && fetchTaskById(Number(id))}
                    className="mt-4 rounded-lg border border-white/10 bg-black px-4 py-2 text-sm text-white hover:bg-white/10 transition-all duration-200"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black px-4 py-6">
            <div className="mx-auto max-w-3xl">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm text-white/40 hover:text-white mb-6 transition-all duration-200"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Tasks
                </button>

                {/* Task Header */}
                <TaskDetailHeader task={currentTask} />

                {/* Comments */}
                <div className="mt-6">
                    <TaskComments taskId={currentTask.id} />
                </div>
            </div>
        </div>
    );
};

export default TaskDetailPage;