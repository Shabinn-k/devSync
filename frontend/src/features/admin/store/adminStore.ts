import { create } from 'zustand';
import { adminApi, extractApiError } from '../api/adminApi';
import type {
  AdminUser,
  AdminOrganization,
  AdminStats,
  Pagination,
  AdminUsersFilters,
  AdminOrgsFilters,
} from '../types/admin';

interface AdminState {
  users: AdminUser[];
  usersPagination: Pagination | null;
  usersLoading: boolean;
  usersFilters: AdminUsersFilters;

  orgs: AdminOrganization[];
  orgsPagination: Pagination | null;
  orgsLoading: boolean;
  orgsFilters: AdminOrgsFilters;

  stats: AdminStats | null;
  statsLoading: boolean;

  error: string | null;

  fetchUsers: (override?: Partial<AdminUsersFilters>) => Promise<void>;
  setUsersFilters: (patch: Partial<AdminUsersFilters>) => void;
  updateUserRole: (id: number, roleId: number) => Promise<void>;
  updateUserStatus: (id: number, isActive: boolean) => Promise<void>;
  forcePasswordReset: (id: number) => Promise<string>;
  deleteUser: (id: number) => Promise<void>;

  fetchOrgs: (override?: Partial<AdminOrgsFilters>) => Promise<void>;
  setOrgsFilters: (patch: Partial<AdminOrgsFilters>) => void;
  updateOrgStatus: (id: number, isActive: boolean) => Promise<void>;
  transferOwnership: (id: number, newOwnerId: number) => Promise<void>;
  deleteOrg: (id: number) => Promise<void>;

  fetchStats: () => Promise<void>;

  clearError: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  users: [],
  usersPagination: null,
  usersLoading: false,
  usersFilters: { page: 1, limit: 20, search: '' },

  orgs: [],
  orgsPagination: null,
  orgsLoading: false,
  orgsFilters: { page: 1, limit: 20, search: '' },

  stats: null,
  statsLoading: false,

  error: null,

  setUsersFilters: (patch) => {
    set((s) => ({ usersFilters: { ...s.usersFilters, ...patch } }));
    void get().fetchUsers();
  },

  fetchUsers: async (override) => {
    const filters = { ...get().usersFilters, ...(override || {}) };
    set({ usersLoading: true, usersFilters: filters, error: null });
    try {
      const res = await adminApi.listUsers(filters);
      set({ users: res.data, usersPagination: res.pagination, usersLoading: false });
    } catch (err) {
      const msg = extractApiError(err, 'Failed to load users');
      set({ error: msg, usersLoading: false });
    }
  },

  updateUserRole: async (id, roleId) => {
    await adminApi.updateUserRole(id, roleId); 
    const roleName = roleId === 3 ? 'admin' : roleId === 2 ? 'team_lead' : 'developer';
    set((s) => ({
      users: s.users.map((u) => (u.id === id ? { ...u, role_id: roleId, role: roleName } : u)),
    }));
  },

  updateUserStatus: async (id, isActive) => {
    await adminApi.updateUserStatus(id, isActive);
    set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, is_active: isActive } : u)) }));
  },

  forcePasswordReset: async (id) => adminApi.forcePasswordReset(id),

  deleteUser: async (id) => {
    await adminApi.deleteUser(id);
    set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, is_active: false } : u)) }));
  },

  setOrgsFilters: (patch) => {
    set((s) => ({ orgsFilters: { ...s.orgsFilters, ...patch } }));
    void get().fetchOrgs();
  },

  fetchOrgs: async (override) => {
    const filters = { ...get().orgsFilters, ...(override || {}) };
    set({ orgsLoading: true, orgsFilters: filters, error: null });
    try {
      const res = await adminApi.listOrgs(filters);
      set({ orgs: res.data, orgsPagination: res.pagination, orgsLoading: false });
    } catch (err) {
      const msg = extractApiError(err, 'Failed to load organizations');
      set({ error: msg, orgsLoading: false });
    }
  },

  updateOrgStatus: async (id, isActive) => {
    await adminApi.updateOrgStatus(id, isActive);
    set((s) => ({ orgs: s.orgs.map((o) => (o.id === id ? { ...o, is_active: isActive } : o)) }));
  },

  transferOwnership: async (id, newOwnerId) => {
    await adminApi.transferOwnership(id, newOwnerId);
    void get().fetchOrgs();
  },

  deleteOrg: async (id) => {
    await adminApi.deleteOrg(id);
    set((s) => ({ orgs: s.orgs.map((o) => (o.id === id ? { ...o, is_active: false } : o)) }));
  },

  fetchStats: async () => {
    set({ statsLoading: true, error: null });
    try {
      const stats = await adminApi.getStats();
      set({ stats, statsLoading: false });
    } catch (err) {
      const msg = extractApiError(err, 'Failed to load stats');
      set({ error: msg, statsLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));