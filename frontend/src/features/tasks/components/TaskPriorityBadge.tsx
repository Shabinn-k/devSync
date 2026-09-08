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
                    color: 'text-red-400 bg-red-500/15 border-red-500/30',
                };
            case 'high':
                return {
                    label: 'High',
                    color: 'text-orange-400 bg-orange-500/15 border-orange-500/30',
                };
            case 'medium':
                return {
                    label: 'Medium',
                    color: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30',
                };
            case 'low':
            default:
                return {
                    label: 'Low',
                    color: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
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
            className={`inline-flex items-center rounded-full border font-medium uppercase tracking-wider ${sizeStyles[size]} ${details.color} ${className}`}
        >
            {details.label}
        </span>
    );
};
