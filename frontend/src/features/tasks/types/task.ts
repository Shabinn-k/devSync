import type { User } from '../../../types/api';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
    id: number;
    project_id: number;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignee_id: number | null;
    assignee?: User;
    created_by: number;
    creator?: User;
    due_date: string | null;
    completed_at: string | null;
    comment_count: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface TaskComment {
    id: number;
    task_id: number;
    user_id: number;
    user?: User;
    content: string;
    created_at: string;
    updated_at: string;
}

export interface TaskDetail extends Task {
    comments: TaskComment[];
}

export interface CreateTaskRequest {
    project_id: number;
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assignee_id?: number | null;
    due_date?: string | null;
}

export interface UpdateTaskRequest {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assignee_id?: number | null;
    due_date?: string | null;
}

export interface UpdateTaskStatusRequest {
    status: TaskStatus;
}

export interface AddCommentRequest {
    content: string;
}