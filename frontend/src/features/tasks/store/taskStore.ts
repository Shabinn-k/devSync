import { create } from 'zustand';
import { taskApi } from '../api/taskApi';
import type {
    Task,
    TaskDetail,
    TaskComment,
    TaskStatus,
    CreateTaskRequest,
    UpdateTaskRequest,
} from '../types/task';

interface TaskState {
    tasks: Task[];
    currentTask: TaskDetail | null;
    comments: TaskComment[];
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
    total: number;

    fetchTasksByProject: (projectId: number) => Promise<void>;
    fetchMyTasks: () => Promise<void>;
    fetchTaskById: (id: number) => Promise<void>;
    createTask: (data: CreateTaskRequest) => Promise<Task>;
    updateTask: (id: number, data: UpdateTaskRequest) => Promise<void>;
    updateTaskStatus: (id: number, status: TaskStatus) => Promise<void>;
    deleteTask: (id: number) => Promise<void>;

    // Comments
    fetchComments: (taskId: number) => Promise<void>;
    addComment: (taskId: number, content: string) => Promise<void>;

    clearError: () => void;
    clearCurrentTask: () => void;
    reset: () => void;
}

const initialState = {
    tasks: [],
    currentTask: null,
    comments: [],
    isLoading: false,
    isSaving: false,
    error: null,
    total: 0,
};

export const useTaskStore = create<TaskState>((set, get) => ({
    ...initialState,

    fetchTasksByProject: async (projectId: number) => {
        set({ isLoading: true, error: null });
        try {
            const { data, total } = await taskApi.getByProject(projectId);
            set({ tasks: data || [], total, isLoading: false });
        } catch (err: any) {
            set({ error: err.message || 'Failed to fetch tasks', isLoading: false });
        }
    },

    fetchMyTasks: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data, total } = await taskApi.getMyTasks();
            set({ tasks: data || [], total, isLoading: false });
        } catch (err: any) {
            set({ error: err.message || 'Failed to fetch tasks', isLoading: false });
        }
    },

    fetchTaskById: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            const data = await taskApi.getById(id);
            set({ currentTask: data || null, comments: data?.comments || [], isLoading: false });
        } catch (err: any) {
            set({ error: err.message || 'Failed to fetch task', isLoading: false });
        }
    },

    createTask: async (data: CreateTaskRequest) => {
        set({ isSaving: true, error: null });
        try {
            const task = await taskApi.create(data);
            set((state) => ({
                tasks: [task, ...state.tasks],
                isSaving: false,
            }));
            return task;
        } catch (err: any) {
            set({ error: err.message || 'Failed to create task', isSaving: false });
            throw err;
        }
    },

    updateTask: async (id: number, data: UpdateTaskRequest) => {
        set({ isSaving: true, error: null });
        try {
            const updated = await taskApi.update(id, data);
            set((state) => ({
                tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
                currentTask: state.currentTask
                    ? { ...state.currentTask, ...updated }
                    : null,
                isSaving: false,
            }));
        } catch (err: any) {
            set({ error: err.message || 'Failed to update task', isSaving: false });
            throw err;
        }
    },

    updateTaskStatus: async (id: number, status: TaskStatus) => {
        set({ isSaving: true, error: null });
        try {
            await taskApi.updateStatus(id, { status });
            const currentTask = get().currentTask;
            set((state) => ({
                tasks: state.tasks.map((t) =>
                    t.id === id ? { ...t, status } : t
                ),
                currentTask: currentTask
                    ? { ...currentTask, status }
                    : null,
                isSaving: false,
            }));
        } catch (err: any) {
            set({ error: err.message || 'Failed to update task status', isSaving: false });
            throw err;
        }
    },

    deleteTask: async (id: number) => {
        set({ isSaving: true, error: null });
        try {
            await taskApi.delete(id);
            set((state) => ({
                tasks: state.tasks.filter((t) => t.id !== id),
                currentTask: state.currentTask?.id === id ? null : state.currentTask,
                isSaving: false,
            }));
        } catch (err: any) {
            set({ error: err.message || 'Failed to delete task', isSaving: false });
            throw err;
        }
    },

    fetchComments: async (taskId: number) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await taskApi.getComments(taskId);
            set({ comments: data || [], isLoading: false });
        } catch (err: any) {
            set({ error: err.message || 'Failed to fetch comments', isLoading: false });
        }
    },

    addComment: async (taskId: number, content: string) => {
        set({ isSaving: true, error: null });
        try {
            const comment = await taskApi.addComment(taskId, { content });
            set((state) => ({
                comments: [...state.comments, comment],
                currentTask: state.currentTask
                    ? {
                        ...state.currentTask,
                        comments: [...state.currentTask.comments, comment],
                    }
                    : null,
                isSaving: false,
            }));
        } catch (err: any) {
            set({ error: err.message || 'Failed to add comment', isSaving: false });
            throw err;
        }
    },

    clearError: () => set({ error: null }),
    clearCurrentTask: () => set({ currentTask: null, comments: [] }),
    reset: () => set(initialState),
}));