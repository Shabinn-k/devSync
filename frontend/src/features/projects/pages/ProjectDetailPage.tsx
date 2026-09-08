import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { useAuthStore } from '../../../stores/authStore';

export const ProjectDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { currentProject, isLoading, error, fetchProjectById } = useProjectStore();
    const isLead = user?.role === 'team_lead' || user?.role === 'admin';

    useEffect(() => {
        if (id) {
            const projectId = Number(id);
            if (!isNaN(projectId) && projectId > 0) {
                fetchProjectById(projectId);
            } else {
                navigate('/projects');
            }
        }
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white/40" />
            </div>
        );
    }

    if (error || !currentProject) {
        return (
            <div className="flex h-64 flex-col items-center justify-center text-center">
                <p className="text-red-400">{error || 'Project not found'}</p>
                <button
                    onClick={() => id && fetchProjectById(Number(id))}
                    className="mt-4 rounded-full border border-white/10 px-6 py-2 text-sm text-white hover:bg-white/10"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black p-6">
            <div className="mx-auto max-w-4xl">
                <button
                    onClick={() => navigate('/projects')}
                    className="group mb-6 flex items-center gap-2 text-sm text-white/40 transition-all hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to Projects
                </button>

                <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
                    <h1 className="text-2xl font-bold text-white">{currentProject.name}</h1>
                    <p className="mt-1 text-sm text-white/40">
                        {currentProject.status} • {currentProject.priority} priority
                    </p>
                    {currentProject.description && (
                        <p className="mt-4 text-sm text-white/60">{currentProject.description}</p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/40">
                        <span>Members: {currentProject.member_count || 0}</span>
                        <span>Tasks: {currentProject.task_count || 0}</span>
                    </div>
                    {isLead && (
                        <div className="mt-4 flex gap-2">
                            <button className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90">
                                Create Task
                            </button>
                            <button className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/10">
                                Manage Members
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailPage;