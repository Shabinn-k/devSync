import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, FolderKanban } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { useAuthStore } from '../../../stores/authStore';
import { ProjectCard } from '../components/ProjectCard';

export const ProjectsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { projects, isLoading, error, fetchMyProjects } = useProjectStore();
    const isLead = user?.role === 'team_lead' || user?.role === 'admin';

    useEffect(() => {
        fetchMyProjects();
    }, [fetchMyProjects]);

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center bg-black">
                <Loader2 className="h-8 w-8 animate-spin text-white/40" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black p-6">
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Projects</h1>
                        <p className="text-sm text-white/40">
                            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
                        </p>
                    </div>
                    {isLead && (
                        <button
                            onClick={() => navigate('/projects/create')}
                            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-green-600 hover:border-green-500"
                        >
                            <Plus className="h-4 w-4" />
                            New Project
                        </button>
                    )}
                </div>

                {/* Error State */}
                {error && (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center text-red-400">
                        <p>{error}</p>
                        <button
                            onClick={() => fetchMyProjects()}
                            className="mt-2 rounded-lg border border-red-500/20 px-4 py-1.5 text-sm text-red-400 hover:bg-red-500/10 transition-all duration-200"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!error && projects.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-black p-12 text-center">
                        <FolderKanban className="h-12 w-12 text-white/20 mb-4" />
                        <h3 className="text-lg font-medium text-white">No projects yet</h3>
                        <p className="mt-1 text-sm text-white/40">
                            Create your first project to start organizing work
                        </p>
                        {isLead && (
                            <button
                                onClick={() => navigate('/projects/create')}
                                className="mt-6 rounded-lg border border-white/10 bg-black px-6 py-2.5 text-sm text-white hover:bg-green-600 hover:border-green-500 transition-all duration-200"
                            >
                                Create Project
                            </button>
                        )}
                    </div>
                )}

                {/* Projects Grid */}
                {!error && projects.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectsPage;