import { Link } from 'react-router-dom';
import { Users, Calendar, CheckCircle, ArrowRight } from 'lucide-react';
import type { Project } from '../types/project';

interface ProjectCardProps {
    project: Project;
}

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'urgent': return 'border-red-500/30 text-red-400';
        case 'high': return 'border-orange-500/30 text-orange-400';
        case 'medium': return 'border-yellow-500/30 text-yellow-400';
        default: return 'border-green-500/30 text-green-400';
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'active': return 'bg-green-500/20 text-green-400';
        case 'completed': return 'bg-blue-500/20 text-blue-400';
        case 'archived': return 'bg-gray-500/20 text-gray-400';
        default: return 'bg-yellow-500/20 text-yellow-400';
    }
};

export const ProjectCard = ({ project }: ProjectCardProps) => {
    return (
        <Link
            to={`/projects/${project.id}`}
            className="group block rounded-2xl border border-white/5 bg-white/5 p-5 transition-all hover:border-white/10 hover:bg-white/10"
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <h3 className="truncate text-lg font-semibold text-white group-hover:text-white/90">
                        {project.name}
                    </h3>
                    {project.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-white/40">
                            {project.description}
                        </p>
                    )}
                </div>
                <span className={`ml-3 flex-shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-white/30">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                </span>
                <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    {project.member_count || 0}
                </span>
                <span className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5" />
                    {project.task_count || 0}
                </span>
                {project.start_date && (
                    <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(project.start_date).toLocaleDateString()}
                    </span>
                )}
            </div>

            <div className="mt-4 flex items-center justify-end">
                <span className="flex items-center gap-1 text-sm text-white/20 group-hover:text-white/40 transition-colors">
                    View Details
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
            </div>
        </Link>
    );
};