import type { TaskPriority } from '../types/task';

interface TaskPriorityBadgeProps {
    priority: TaskPriority;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const TaskPriorityBadge = ({ priority, size = 'md', className = '' }: TaskPriorityBadgeProps) => {
    const getPriorityDetails = (p: TaskPriority) => {
        switch (p) {
            case 'urgent':
                return {
                    label: 'Urgent',
                    color: 'text-red-400 bg-red-500/10 border-red-500/30',
                };
            case 'high':
                return {
                    label: 'High',
                    color: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
                };
            case 'medium':
                return {
                    label: 'Medium',
                    color: 'text-white/70 bg-white/5 border-white/15',
                };
            case 'low':
            default:
                return {
                    label: 'Low',
                    color: 'text-white/50 bg-white/5 border-white/10',
                };
        }
    };

    const sizeStyles = {
        sm: 'px-2 py-0.5 text-[11px]',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm font-medium',
    };

    const details = getPriorityDetails(priority);

    return (
        <span
            className={`inline-flex items-center rounded-full border font-mono uppercase tracking-wider transition-all duration-200 ${sizeStyles[size]} ${details.color} ${className}`}
        >
            {details.label}
        </span>
    );
};

export default TaskPriorityBadge;
