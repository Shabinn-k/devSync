import { motion } from 'framer-motion';
import { Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { ProjectDetail } from '../types/project';

interface ProjectStatsProps {
    project: ProjectDetail;
}

export const ProjectStats = ({ project }: ProjectStatsProps) => {
    const stats = [
        {
            label: 'Members',
            value: project.members.length,
            icon: Users,
            color: 'text-blue-400 bg-blue-500/10',
        },
        {
            label: 'Tasks',
            value: project.task_count || 0,
            icon: CheckCircle,
            color: 'text-green-400 bg-green-500/10',
        },
        {
            label: 'Status',
            value: project.status,
            icon: Clock,
            color: 'text-yellow-400 bg-yellow-500/10',
        },
        {
            label: 'Priority',
            value: project.priority,
            icon: AlertCircle,
            color: 'text-red-400 bg-red-500/10',
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-xl border border-white/5 bg-white/5 p-4"
                >
                    <div className="flex items-center gap-3">
                        <div className={`rounded-lg p-2 ${stat.color}`}>
                            <stat.icon className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs text-white/40">{stat.label}</p>
                            <p className="text-sm font-semibold text-white capitalize">
                                {stat.value}
                            </p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};