import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import type { TaskStatus, TaskPriority } from '../types/task';

interface TaskFiltersProps {
    onFilterChange?: (filters: TaskFilters) => void;
    onClearFilters?: () => void;
}

export interface TaskFilters {
    search?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assignee?: string;
}

export const TaskFilters = ({ onFilterChange, onClearFilters }: TaskFiltersProps) => {
    const [filters, setFilters] = useState<TaskFilters>({});
    const [showFilters, setShowFilters] = useState(false);

    const handleChange = (key: keyof TaskFilters, value: string) => {
        const newFilters = { ...filters, [key]: value || undefined };
        setFilters(newFilters);
        onFilterChange?.(newFilters);
    };

    const handleClear = () => {
        setFilters({});
        onClearFilters?.();
        onFilterChange?.({});
    };

    const hasFilters = Object.values(filters).some((v) => v !== undefined && v !== '');

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={filters.search || ''}
                        onChange={(e) => handleChange('search', e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30"
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                        showFilters || hasFilters
                            ? 'border-white/30 bg-white/10 text-white'
                            : 'border-white/10 text-white/40 hover:text-white'
                    }`}
                >
                    <Filter className="h-4 w-4" />
                </button>
                {hasFilters && (
                    <button
                        onClick={handleClear}
                        className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/40 hover:text-white transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {showFilters && (
                <div className="grid grid-cols-2 gap-3 rounded-lg border border-white/10 bg-white/5 p-4 sm:grid-cols-3 lg:grid-cols-4">
                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-white/40">
                            Status
                        </label>
                        <select
                            value={filters.status || ''}
                            onChange={(e) => handleChange('status', e.target.value)}
                            className="mt-1 w-full rounded border border-white/10 bg-black px-3 py-1.5 text-sm text-white outline-none focus:border-white/30"
                        >
                            <option value="">All</option>
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="done">Done</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wider text-white/40">
                            Priority
                        </label>
                        <select
                            value={filters.priority || ''}
                            onChange={(e) => handleChange('priority', e.target.value)}
                            className="mt-1 w-full rounded border border-white/10 bg-black px-3 py-1.5 text-sm text-white outline-none focus:border-white/30"
                        >
                            <option value="">All</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};