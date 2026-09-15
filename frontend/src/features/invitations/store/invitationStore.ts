import { create } from 'zustand';
import { invitationApi } from '../api/invitationApi';
import type { Invitation, CreateInvitationRequest, InvitationInfo } from '../types/invitation';

export interface InvitationState {
    invitations: Invitation[];
    currentInvitation: InvitationInfo | null;
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;

    invite: (organizationId: number, data: CreateInvitationRequest) => Promise<Invitation>;
    getInfo: (token: string) => Promise<InvitationInfo>;
    accept: (token: string) => Promise<{ message: string }>;
    decline: (token: string) => Promise<{ message: string }>;
    clearError: () => void;
    reset: () => void;
}

const initialState = {
    invitations: [],
    currentInvitation: null,
    isLoading: false,
    isSaving: false,
    error: null,
};

export const useInvitationStore = create<InvitationState>((set) => ({
    ...initialState,

    invite: async (organizationId, data) => {
        set({ isSaving: true, error: null });
        try {
            const invitation = await invitationApi.invite(organizationId, data);
            set((state) => ({
                invitations: [invitation, ...state.invitations],
                isSaving: false,
            }));
            return invitation;
        } catch (err: any) {
            set({ error: err.message || 'Failed to send invitation', isSaving: false });
            throw err;
        }
    },

    getInfo: async (token) => {
        set({ isLoading: true, error: null });
        try {
            const info = await invitationApi.getInfo(token);
            set({ currentInvitation: info, isLoading: false });
            return info;
        } catch (err: any) {
            set({ error: err.message || 'Invalid invitation', isLoading: false });
            throw err;
        }
    },

    accept: async (token) => {
        set({ isSaving: true, error: null });
        try {
            const result = await invitationApi.accept(token);
            set({ isSaving: false });
            return result;
        } catch (err: any) {
            set({ error: err.message || 'Failed to accept invitation', isSaving: false });
            throw err;
        }
    },

    decline: async (token) => {
        set({ isSaving: true, error: null });
        try {
            const result = await invitationApi.decline(token);
            set({ isSaving: false });
            return result;
        } catch (err: any) {
            set({ error: err.message || 'Failed to decline invitation', isSaving: false });
            throw err;
        }
    },

    clearError: () => set({ error: null }),
    reset: () => set(initialState),
}));

export default useInvitationStore;