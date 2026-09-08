import { create } from 'zustand';
import { teamApi } from '../api/teamApi';
import type {
    Team,
    TeamDetail,
    TeamRole,
    CreateTeamRequest,
    UpdateTeamRequest,
    AddTeamMemberRequest,
} from '../types/team';

interface TeamState {
    teams: Team[];
    currentTeam: TeamDetail | null;
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
    total: number;

    fetchTeamsByOrg: (orgId: number, limit?: number, offset?: number) => Promise<void>;
    fetchMyTeams: () => Promise<void>;
    fetchTeamById: (id: number) => Promise<void>;
    createTeam: (data: CreateTeamRequest) => Promise<Team>;
    updateTeam: (id: number, data: UpdateTeamRequest) => Promise<void>;
    deleteTeam: (id: number) => Promise<void>;
    addMember: (teamId: number, data: AddTeamMemberRequest) => Promise<void>;
    updateMemberRole: (teamId: number, memberId: number, role: TeamRole) => Promise<void>;
    removeMember: (teamId: number, memberId: number) => Promise<void>;

    clearError: () => void;
    clearCurrentTeam: () => void;
    reset: () => void;
}

const initialState = {
    teams: [],
    currentTeam: null,
    isLoading: false,
    isSaving: false,
    error: null,
    total: 0,
};

export const useTeamStore = create<TeamState>((set, get) => ({
    ...initialState,

    fetchTeamsByOrg: async (orgId: number, limit = 20, offset = 0) => {
        set({ isLoading: true, error: null });
        try {
            const { data, total } = await teamApi.getByOrganization(orgId, limit, offset);
            set({ teams: data || [], total, isLoading: false });
        } catch (err: any) {
            set({ error: err.message || 'Failed to fetch teams', isLoading: false });
        }
    },

    fetchMyTeams: async () => {
        set({ isLoading: true, error: null });
        try {
            const teams = await teamApi.getMyTeams();
            set({ teams, isLoading: false });
        } catch (err: any) {
            set({ error: err.message || 'Failed to fetch my teams', isLoading: false });
        }
    },

    fetchTeamById: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            const team = await teamApi.getById(id);
            set({ currentTeam: team, isLoading: false });
        } catch (err: any) {
            set({ error: err.message || 'Failed to fetch team details', isLoading: false });
        }
    },

    createTeam: async (data: CreateTeamRequest) => {
        set({ isSaving: true, error: null });
        try {
            const newTeam = await teamApi.create(data);
            set((state) => ({
                teams: [newTeam, ...state.teams],
                isSaving: false,
            }));
            return newTeam;
        } catch (err: any) {
            set({ error: err.message || 'Failed to create team', isSaving: false });
            throw err;
        }
    },

    updateTeam: async (id: number, data: UpdateTeamRequest) => {
        set({ isSaving: true, error: null });
        try {
            const updated = await teamApi.update(id, data);
            set((state) => ({
                teams: state.teams.map((t) => (t.id === id ? { ...t, ...updated } : t)),
                currentTeam: state.currentTeam && state.currentTeam.id === id
                    ? { ...state.currentTeam, ...updated }
                    : state.currentTeam,
                isSaving: false,
            }));
        } catch (err: any) {
            set({ error: err.message || 'Failed to update team', isSaving: false });
            throw err;
        }
    },

    deleteTeam: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            await teamApi.delete(id);
            set((state) => ({
                teams: state.teams.filter((t) => t.id !== id),
                currentTeam: state.currentTeam?.id === id ? null : state.currentTeam,
                isLoading: false,
            }));
        } catch (err: any) {
            set({ error: err.message || 'Failed to delete team', isLoading: false });
            throw err;
        }
    },

    addMember: async (teamId: number, data: AddTeamMemberRequest) => {
        set({ isSaving: true, error: null });
        try {
            const newMember = await teamApi.addMember(teamId, data);
            const { currentTeam } = get();
            if (currentTeam && currentTeam.id === teamId) {
                set({
                    currentTeam: {
                        ...currentTeam,
                        members: [...currentTeam.members, newMember],
                        member_count: currentTeam.member_count + 1,
                    },
                    isSaving: false,
                });
            } else {
                set({ isSaving: false });
            }
        } catch (err: any) {
            set({ error: err.message || 'Failed to add team member', isSaving: false });
            throw err;
        }
    },

    updateMemberRole: async (teamId: number, memberId: number, role: TeamRole) => {
        set({ isSaving: true, error: null });
        try {
            await teamApi.updateMemberRole(teamId, memberId, role);
            const { currentTeam } = get();
            if (currentTeam && currentTeam.id === teamId) {
                set({
                    currentTeam: {
                        ...currentTeam,
                        members: currentTeam.members.map((m) =>
                            m.id === memberId ? { ...m, role } : m
                        ),
                    },
                    isSaving: false,
                });
            } else {
                set({ isSaving: false });
            }
        } catch (err: any) {
            set({ error: err.message || 'Failed to update member role', isSaving: false });
            throw err;
        }
    },

    removeMember: async (teamId: number, memberId: number) => {
        set({ isSaving: true, error: null });
        try {
            await teamApi.removeMember(teamId, memberId);
            const { currentTeam } = get();
            if (currentTeam && currentTeam.id === teamId) {
                set({
                    currentTeam: {
                        ...currentTeam,
                        members: currentTeam.members.filter((m) => m.id !== memberId),
                        member_count: Math.max(0, currentTeam.member_count - 1),
                    },
                    isSaving: false,
                });
            } else {
                set({ isSaving: false });
            }
        } catch (err: any) {
            set({ error: err.message || 'Failed to remove member', isSaving: false });
            throw err;
        }
    },

    clearError: () => set({ error: null }),
    clearCurrentTeam: () => set({ currentTeam: null }),
    reset: () => set(initialState),
}));
