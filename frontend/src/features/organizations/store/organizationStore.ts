import { create } from 'zustand';
import { organizationApi } from '../api/organizationApi';
import type {
  Organization,
  OrganizationDetail,
  OrganizationMember,
  OrganizationRole,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  AddMemberRequest,
} from '../types/organization';

interface OrganizationState {
  organizations: Organization[];
  currentOrganization: OrganizationDetail | null;
  members: OrganizationMember[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  fetchOrganizations: () => Promise<void>;
  fetchMyOrganizations: () => Promise<void>;
  fetchOrganizationById: (id: string) => Promise<void>;
  createOrganization: (data: CreateOrganizationRequest) => Promise<Organization>;
  updateOrganization: (id: string, data: UpdateOrganizationRequest) => Promise<void>;
  deleteOrganization: (id: string) => Promise<void>;

  fetchMembers: (organizationId: string) => Promise<void>;
  addMember: (organizationId: string, data: AddMemberRequest) => Promise<void>;
  updateMemberRole: (organizationId: string, memberId: string, role: OrganizationRole) => Promise<void>;
  removeMember: (organizationId: string, memberId: string) => Promise<void>;

  clearError: () => void;
  clearCurrentOrganization: () => void;
}

export const useOrganizationStore = create<OrganizationState>((set) => ({
  organizations: [],
  currentOrganization: null,
  members: [],
  isLoading: false,
  isSaving: false,
  error: null,

  fetchOrganizations: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await organizationApi.list();
      // ✅ Fix: Ensure we always return an array
      set({ organizations: data || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch organizations', isLoading: false });
    }
  },

  fetchMyOrganizations: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await organizationApi.getMyOrganizations();
      // ✅ Fix: Ensure we always return an array
      set({ organizations: data || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch organizations', isLoading: false });
    }
  },

  fetchOrganizationById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await organizationApi.getById(id);
      // ✅ Fix: Ensure we handle null/undefined
      set({ currentOrganization: data || null, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch organization', isLoading: false });
    }
  },

  createOrganization: async (data: CreateOrganizationRequest): Promise<Organization> => {
    set({ isSaving: true, error: null });
    try {
      const org = await organizationApi.create(data);
      // ✅ Fix: Ensure org exists before adding
      if (org) {
        set((state) => ({
          organizations: [org, ...state.organizations],
          isSaving: false,
        }));
        return org;
      } else {
        throw new Error('Failed to create organization: No data returned');
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to create organization', isSaving: false });
      throw err;
    }
  },

  updateOrganization: async (id: string, data: UpdateOrganizationRequest) => {
    set({ isSaving: true, error: null });
    try {
      const updated = await organizationApi.update(id, data);
      // ✅ Fix: Only update if we got data back
      if (updated) {
        set((state) => ({
          organizations: state.organizations.map((org) => (org.id === id ? updated : org)),
          currentOrganization: state.currentOrganization
            ? { ...state.currentOrganization, ...updated }
            : null,
          isSaving: false,
        }));
      } else {
        throw new Error('Failed to update organization: No data returned');
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to update organization', isSaving: false });
      throw err;
    }
  },

  deleteOrganization: async (id: string) => {
    set({ isSaving: true, error: null });
    try {
      await organizationApi.delete(id);
      set((state) => ({
        organizations: state.organizations.filter((org) => org.id !== id),
        currentOrganization: state.currentOrganization?.id === id ? null : state.currentOrganization,
        isSaving: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete organization', isSaving: false });
      throw err;
    }
  },

  fetchMembers: async (organizationId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await organizationApi.getMembers(organizationId);
      // ✅ Fix: Ensure we always return an array
      set({ members: data || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch members', isLoading: false });
    }
  },

  addMember: async (organizationId: string, data: AddMemberRequest) => {
    set({ isSaving: true, error: null });
    try {
      const member = await organizationApi.addMember(organizationId, data);
      // ✅ Fix: Only update if we got data back
      if (member) {
        set((state) => ({
          members: [...state.members, member],
          currentOrganization: state.currentOrganization
            ? {
                ...state.currentOrganization,
                members: [...state.currentOrganization.members, member],
              }
            : null,
          isSaving: false,
        }));
      } else {
        throw new Error('Failed to add member: No data returned');
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to add member', isSaving: false });
      throw err;
    }
  },

  updateMemberRole: async (organizationId: string, memberId: string, role: OrganizationRole) => {
    set({ isSaving: true, error: null });
    try {
      await organizationApi.updateMemberRole(organizationId, memberId, { role });
      set((state) => ({
        members: state.members.map((m) =>
          m.id === memberId ? { ...m, role } : m
        ),
        currentOrganization: state.currentOrganization
          ? {
              ...state.currentOrganization,
              members: state.currentOrganization.members.map((m) =>
                m.id === memberId ? { ...m, role } : m
              ),
            }
          : null,
        isSaving: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to update member role', isSaving: false });
      throw err;
    }
  },

  removeMember: async (organizationId: string, memberId: string) => {
    set({ isSaving: true, error: null });
    try {
      await organizationApi.removeMember(organizationId, memberId);
      set((state) => ({
        members: state.members.filter((m) => m.id !== memberId),
        currentOrganization: state.currentOrganization
          ? {
              ...state.currentOrganization,
              members: state.currentOrganization.members.filter((m) => m.id !== memberId),
            }
          : null,
        isSaving: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to remove member', isSaving: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentOrganization: () => set({ currentOrganization: null, members: [] }),
}));