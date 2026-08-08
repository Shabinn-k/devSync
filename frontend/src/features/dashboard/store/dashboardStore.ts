import { create } from 'zustand';
import { dashboardApi } from '../api/dashboardApi';
import type { DashboardStats, ActivityItem, TaskItem } from '../types/dashboard';

interface DashboardState {
  stats: DashboardStats | null;
  activities: ActivityItem[];
  tasks: TaskItem[];
  isLoading: boolean;
  error: string | null;

  fetchDashboard: () => Promise<void>;
  clearError: () => void;
}

export const useDashboardStore = create<DashboardState>((set, _get) => ({
  stats: null,
  activities: [],
  tasks: [],
  isLoading: false,
  error: null,

  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardApi.getDashboard();
      if (response.success && response.data) {
        set({
          stats: response.data.stats,
          activities: response.data.activities,
          tasks: response.data.tasks,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.message || 'Failed to fetch dashboard');
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch dashboard', isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));