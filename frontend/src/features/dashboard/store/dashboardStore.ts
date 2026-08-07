import { create } from 'zustand';
import { dashboardApi } from '../api/dashboardApi';
import type { DashboardStats, ActivityItem, TaskItem } from '../types/dashboard';

interface DashboardState {
  stats: DashboardStats | null;
  activities: ActivityItem[];
  tasks: TaskItem[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchStats: () => Promise<void>;
  fetchActivities: () => Promise<void>;
  fetchTasks: () => Promise<void>;
  fetchAll: () => Promise<void>;
  clearError: () => void;
}

export const useDashboardStore = create<DashboardState>((set, _get) => ({ 
  stats: null,
  activities: [],
  tasks: [],
  isLoading: false,
  error: null,

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardApi.getStats();
      if (response.success && response.data) {
        set({ stats: response.data, isLoading: false });
      } else {
        throw new Error(response.message || 'Failed to fetch stats');
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch stats', isLoading: false });
    }
  },

  fetchActivities: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardApi.getActivities();
      if (response.success && response.data) {
        set({ activities: response.data, isLoading: false });
      } else {
        throw new Error(response.message || 'Failed to fetch activities');
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch activities', isLoading: false });
    }
  },

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardApi.getTasks();
      if (response.success && response.data) {
        set({ tasks: response.data, isLoading: false });
      } else {
        throw new Error(response.message || 'Failed to fetch tasks');
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch tasks', isLoading: false });
    }
  },

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const [statsRes, activitiesRes, tasksRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getActivities(),
        dashboardApi.getTasks(),
      ]);

      set({
        stats: statsRes.success && statsRes.data ? statsRes.data : null,
        activities: activitiesRes.success && activitiesRes.data ? activitiesRes.data : [],
        tasks: tasksRes.success && tasksRes.data ? tasksRes.data : [],
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch dashboard data', isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));