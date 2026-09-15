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
                    color: 'text-white/60 bg-white/5 border-white/10',
                    dot: 'bg-white/40',
                };
            case 'in_progress':
                return {
                    label: 'In Progress',
                    color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
                    dot: 'bg-yellow-400',
                };
            case 'review':
                return {
                    label: 'Review',
                    color: 'text-white/70 bg-white/5 border-white/15',
                    dot: 'bg-white/50',
                };
            case 'done':
                return {
                    label: 'Done',
                    color: 'text-green-400 bg-green-500/10 border-green-500/30',
                    dot: 'bg-green-400',
                };
            default:
                return {
                    label: String(s),
                    color: 'text-white/40 bg-white/5 border-white/10',
                    dot: 'bg-white/30',
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
            className={`inline-flex items-center gap-1.5 rounded-full border font-mono transition-all duration-200 ${sizeStyles[size]} ${details.color} ${className}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${details.dot}`} />
            {details.label}
        </span>
    );
};

export default TaskStatusBadge;
