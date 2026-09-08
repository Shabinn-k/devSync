import type { TaskStatus } from '../types/task';

interface TaskStatusBadgeProps {
    status: TaskStatus;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const TaskStatusBadge = ({ status, size = 'md', className = '' }: TaskStatusBadgeProps) => {
    const getStatusDetails = (s: TaskStatus) => {
        switch (s) {
            case 'todo':
                return {
                    label: 'To Do',
                    color: 'text-gray-300 bg-gray-500/15 border-gray-500/30',
                    dot: 'bg-gray-400',
                };
            case 'in_progress':
                return {
                    label: 'In Progress',
                    color: 'text-amber-300 bg-amber-500/15 border-amber-500/30',
                    dot: 'bg-amber-400',
                };
            case 'review':
                return {
                    label: 'In Review',
                    color: 'text-purple-300 bg-purple-500/15 border-purple-500/30',
                    dot: 'bg-purple-400',
                };
            case 'done':
                return {
                    label: 'Done',
                    color: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
                    dot: 'bg-emerald-400',
                };
            default:
                return {
                    label: String(s),
                    color: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
                    dot: 'bg-gray-400',
                };
        }
    };

    const sizeStyles = {
        sm: 'px-2 py-0.5 text-[11px]',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm font-medium',
    };

    const details = getStatusDetails(status);

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors ${sizeStyles[size]} ${details.color} ${className}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${details.dot}`} />
            {details.label}
        </span>
    );
};
