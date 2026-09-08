import { Link } from 'react-router-dom';
import { Calendar, User, MessageCircle, Clock, ChevronRight } from 'lucide-react';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import type { Task } from '../types/task';

interface TaskCardProps {
    task: Task;
}

export const TaskCard = ({ task }: TaskCardProps) => {
    return (
        <Link
            to={`/tasks/${task.id}`}
            className="block rounded-lg border border-white/5 bg-white/5 p-4 transition-all hover:border-white/10 hover:bg-white/10"
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <h4 className="truncate text-sm font-medium text-white group-hover:text-white/90">
                        {task.title}
                    </h4>
                    {task.description && (
                        <p className="mt-1 line-clamp-1 text-xs text-white/30">
                            {task.description}
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
                <TaskStatusBadge status={task.status} size="sm" />
                <TaskPriorityBadge priority={task.priority} size="sm" />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/20">
                {task.assignee && (
                    <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {task.assignee.name}
                    </span>
                )}
                {task.due_date && (
                    <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(task.due_date).toLocaleDateString()}
                    </span>
                )}
                {task.comment_count > 0 && (
                    <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {task.comment_count}
                    </span>
                )}
                <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(task.created_at).toLocaleDateString()}
                </span>
                <span className="ml-auto flex items-center gap-0.5 text-white/10">
                    <ChevronRight className="h-3.5 w-3.5" />
                </span>
            </div>
        </Link>
    );
};