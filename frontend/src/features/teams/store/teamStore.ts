import { create } from 'zustand';
import { teamApi } from '../api/teamApi';
import type {
  Team,
  TeamDetail,
  TeamMember,
  TeamRole,
  CreateTeamRequest,
  UpdateTeamRequest,
} from '../types/team';

interface TeamState {
  teams: Team[];
  currentTeam: TeamDetail | null;
  members: TeamMember[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  fetchByOrganization: (organizeId: number) => Promise<void>;
  fetchMyTeams: () => Promise<void>;
  fetchById: (id: number) => Promise<void>;
  createTeam: (data: CreateTeamRequest) => Promise<Team>;
  updateTeam: (id: number, data: UpdateTeamRequest) => Promise<void>;
  deleteTeam: (id: number) => Promise<void>;
  fetchMembers: (teamId: number) => Promise<void>;
  addMember: (teamId: number, userId: number, role?: TeamRole) => Promise<void>;
  updateMemberRole: (teamId: number, memberId: number, role: TeamRole) => Promise<void>;
  removeMember: (teamId: number, memberId: number) => Promise<void>;
  clearCurrent: () => void;
  clearError: () => void;
}

const initial = {
  teams: [],
  currentTeam: null,
  members: [],
  isLoading: false,
  isSaving: false,
  error: null,
};

export const useTeamStore = create<TeamState>((set, _) => ({
  ...initial,

  fetchByOrganization: async (organizeId: number) => {
    set({ isLoading: true, error: null });
    try {
      const teams = await teamApi.getByOrganization(organizeId);
      set({ teams, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load teams', isLoading: false });
    }
  },

  fetchMyTeams: async () => {
    set({ isLoading: true, error: null });
    try {
      const teams = await teamApi.getMyTeams();
      set({ teams, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load teams', isLoading: false });
    }
  },

  fetchById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const team = await teamApi.getById(id);
      set({ currentTeam: team as TeamDetail, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load team', isLoading: false });
    }
  },

  createTeam: async (data: CreateTeamRequest) => {
    set({ isSaving: true, error: null });
    try {
      const team = await teamApi.create(data);
      set((s) => ({ teams: [team, ...s.teams], isSaving: false }));
      return team;
    } catch (err: any) {
      set({ error: err.message || 'Failed to create team', isSaving: false });
      throw err;
    }
  },

  updateTeam: async (id: number, data: UpdateTeamRequest) => {
    set({ isSaving: true, error: null });
    try {
      const updated = await teamApi.update(id, data);
      set((s) => ({
        teams: s.teams.map((t) => (t.id === id ? updated : t)),
        currentTeam:
          s.currentTeam?.id === id
            ? ({ ...updated, members: s.currentTeam.members } as TeamDetail)
            : s.currentTeam,
        isSaving: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to update team', isSaving: false });
      throw err;
    }
  },

  deleteTeam: async (id: number) => {
    set({ isSaving: true, error: null });
    try {
      await teamApi.delete(id);
      set((s) => ({
        teams: s.teams.filter((t) => t.id !== id),
        currentTeam: s.currentTeam?.id === id ? null : s.currentTeam,
        isSaving: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete team', isSaving: false });
      throw err;
    }
  },

  fetchMembers: async (teamId: number) => {
    set({ isLoading: true, error: null });
    try {
      const members = await teamApi.getMembers(teamId);
      set({ members, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load members', isLoading: false });
    }
  },

  addMember: async (teamId: number, userId: number, role: TeamRole = 'member') => {
    set({ isSaving: true, error: null });
    try {
      const member = await teamApi.addMember(teamId, { user_id: userId, role });
      set((s) => ({ members: [...s.members, member], isSaving: false }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to add member', isSaving: false });
      throw err;
    }
  },

  updateMemberRole: async (teamId: number, memberId: number, role: TeamRole) => {
    set({ isSaving: true, error: null });
    try {
      await teamApi.updateMemberRole(teamId, memberId, { role });
      set((s) => ({
        members: s.members.map((m) => (m.id === memberId ? { ...m, role } : m)),
        isSaving: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to update role', isSaving: false });
      throw err;
    }
  },

  removeMember: async (teamId: number, memberId: number) => {
    set({ isSaving: true, error: null });
    try {
      await teamApi.removeMember(teamId, memberId);
      set((s) => ({
        members: s.members.filter((m) => m.id !== memberId),
        isSaving: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to remove member', isSaving: false });
      throw err;
    }
  },

  clearCurrent: () => set({ currentTeam: null, members: [] }),
  clearError: () => set({ error: null }),
}));