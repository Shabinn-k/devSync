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
        if (id) fetchTaskById(Number(id));
    }, [id]);

    if (isLoading) return <Loader />;
    if (error || !currentTask) return <ErrorView error={error || 'Task not found'} />;

    return (
        <div className="min-h-screen bg-black px-4 py-6">
            <div className="mx-auto max-w-3xl">
                {/* Back Button */}
                <button 
                    onClick={() => navigate(`/projects/${currentTask.project_id}/tasks`)}
                    className="flex items-center gap-2 text-sm text-white/40 hover:text-white mb-6"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Tasks
                </button>

                {/* Task Header */}
                <TaskDetailHeader task={currentTask} />

                {/* Comments */}
                <TaskComments taskId={currentTask.id} />
            </div>
        </div>
    );
};

const Loader = () => (
    <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/40" />
    </div>
);

const ErrorView = ({ error }: { error: string }) => (
    <div className="flex h-64 flex-col items-center justify-center text-center">
        <p className="text-red-400">{error}</p>
    </div>
);