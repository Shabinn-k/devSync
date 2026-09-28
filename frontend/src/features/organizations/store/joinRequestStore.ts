import { create } from 'zustand';
import { joinRequestApi } from '../api/joinRequestApi';
import type { JoinRequest } from '../types/joinRequest';

interface JoinRequestState {
  myRequests: JoinRequest[];
  myLoading: boolean;

  orgRequests: JoinRequest[];
  orgLoading: boolean;

  error: string | null;

  fetchMy: () => Promise<void>;
  create: (orgId: number, message: string) => Promise<JoinRequest>;
  cancel: (requestId: number) => Promise<void>;
  fetchForOrg: (orgId: number, status?: string) => Promise<void>;
  review: (orgId: number, requestId: number, status: 'approved' | 'rejected') => Promise<void>;
  clearError: () => void;
}

export const useJoinRequestStore = create<JoinRequestState>((set) => ({
  myRequests: [],
  myLoading: false,
  orgRequests: [],
  orgLoading: false,
  error: null,

  fetchMy: async () => {
    set({ myLoading: true, error: null });
    try {
      const res = await joinRequestApi.myRequests();
      set({ myRequests: res.data, myLoading: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load requests';
      set({ error: msg, myLoading: false });
    }
  },

  create: async (orgId, message) => {
    const r = await joinRequestApi.create(orgId, message);
    set((s) => ({ myRequests: [r, ...s.myRequests] }));
    return r;
  },

  cancel: async (requestId) => {
    await joinRequestApi.cancel(requestId);
    set((s) => ({ myRequests: s.myRequests.filter((r) => r.id !== requestId) }));
  },

  fetchForOrg: async (orgId, status = 'pending') => {
    set({ orgLoading: true, error: null });
    try {
      const res = await joinRequestApi.listForOrg(orgId, status);
      set({ orgRequests: res.data, orgLoading: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load requests';
      set({ error: msg, orgLoading: false });
    }
  },

  review: async (orgId, requestId, status) => {
    await joinRequestApi.review(orgId, requestId, status);
    set((s) => ({
      orgRequests: s.orgRequests.map((r) => (r.id === requestId ? { ...r, status } : r)),
    }));
  },

  clearError: () => set({ error: null }),
}));