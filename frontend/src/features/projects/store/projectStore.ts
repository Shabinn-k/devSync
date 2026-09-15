import { create } from 'zustand';
import { projectApi } from '../api/projectApi';
import type {
    Project,
    ProjectDetail,
    ProjectMember,
    ProjectRole,
    CreateProjectRequest,
    UpdateProjectRequest,
    AddProjectMemberRequest,
} from '../types/project';

interface ProjectState {
    projects: Project[];
    currentProject: ProjectDetail | null;
    members: ProjectMember[];
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
    total: number;

    fetchProjectsByOrganization: (organizeId: number, page?: number, limit?: number) => Promise<void>;
    fetchMyProjects: (page?: number, limit?: number) => Promise<void>;
    fetchProjectById: (id: number) => Promise<void>;
    createProject: (data: CreateProjectRequest) => Promise<Project>;
    updateProject: (id: number, data: UpdateProjectRequest) => Promise<void>;
    deleteProject: (id: number) => Promise<void>;
    fetchMembers: (projectId: number) => Promise<void>;
    addMember: (projectId: number, data: AddProjectMemberRequest) => Promise<void>;
    updateMemberRole: (projectId: number, memberId: number, role: ProjectRole) => Promise<void>;
    removeMember: (projectId: number, memberId: number) => Promise<void>;
    clearError: () => void;
    clearCurrentProject: () => void;
    reset: () => void;
}

const initialState = {
    projects: [],
    currentProject: null,
    members: [],
    isLoading: false,
    isSaving: false,
    error: null,
    total: 0,
};

export const useProjectStore = create<ProjectState>((set) => ({
    ...initialState,

    fetchProjectsByOrganization: async (organizeId: number, page = 1, limit = 20) => {
        set({ isLoading: true, error: null });
        try {
            const { data, total } = await projectApi.getByOrganization(organizeId, page, limit);
            set({ projects: data || [], total: total || data?.length || 0, isLoading: false });
        } catch (err: any) {
            set({ error: err.message || 'Failed to fetch projects', isLoading: false });
        }
    },

    fetchMyProjects: async (page = 1, limit = 20) => {
        set({ isLoading: true, error: null });
        try {
            const { data, total } = await projectApi.getMyProjects(page, limit);
            set({ projects: data || [], total: total || data?.length || 0, isLoading: false });
        } catch (err: any) {
            set({ error: err.message || 'Failed to fetch projects', isLoading: false });
        }
    },
    fetchProjectById: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
            const data = await projectApi.getById(id);
            set({ currentProject: data || null, members: data?.members || [], isLoading: false });
        } catch (err: any) {
            set({ error: err.message || 'Failed to fetch project', isLoading: false });
        }
    },

    createProject: async (data: CreateProjectRequest) => {
        set({ isSaving: true, error: null });
        try {
            const project = await projectApi.create(data);
            set((state) => ({
                projects: [project, ...state.projects],
                isSaving: false,
            }));
            return project;
        } catch (err: any) {
            set({ error: err.message || 'Failed to create project', isSaving: false });
            throw err;
        }
    },

    updateProject: async (id: number, data: UpdateProjectRequest) => {
        set({ isSaving: true, error: null });
        try {
            const updated = await projectApi.update(id, data);
            set((state) => ({
                projects: state.projects.map((p) => (p.id === id ? updated : p)),
                currentProject: state.currentProject
                    ? { ...state.currentProject, ...updated }
                    : null,
                isSaving: false,
            }));
        } catch (err: any) {
            set({ error: err.message || 'Failed to update project', isSaving: false });
            throw err;
        }
    },

    deleteProject: async (id: number) => {
        set({ isSaving: true, error: null });
        try {
            await projectApi.delete(id);
            set((state) => ({
                projects: state.projects.filter((p) => p.id !== id),
                currentProject: state.currentProject?.id === id ? null : state.currentProject,
                isSaving: false,
            }));
        } catch (err: any) {
            set({ error: err.message || 'Failed to delete project', isSaving: false });
            throw err;
        }
    },

    fetchMembers: async (projectId: number) => {
        set({ isLoading: true, error: null });
        try {
            const data = await projectApi.getMembers(projectId);
            set({ members: data || [], isLoading: false });
        } catch (err: any) {
            set({ error: err.message || 'Failed to fetch members', isLoading: false });
        }
    },

    addMember: async (projectId: number, data: AddProjectMemberRequest) => {
        set({ isSaving: true, error: null });
        try {
            const member = await projectApi.addMember(projectId, data);
            set((state) => ({
                members: [...state.members, member],
                currentProject: state.currentProject
                    ? {
                        ...state.currentProject,
                        members: [...state.currentProject.members, member],
                    }
                    : null,
                isSaving: false,
            }));
        } catch (err: any) {
            set({ error: err.message || 'Failed to add member', isSaving: false });
            throw err;
        }
    },

    updateMemberRole: async (projectId: number, memberId: number, role: ProjectRole) => {
        set({ isSaving: true, error: null });
        try {
            await projectApi.updateMemberRole(projectId, memberId, role);
            set((state) => ({
                members: state.members.map((m) =>
                    m.id === memberId ? { ...m, role } : m
                ),
                currentProject: state.currentProject
                    ? {
                        ...state.currentProject,
                        members: state.currentProject.members.map((m) =>
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

    removeMember: async (projectId: number, memberId: number) => {
        set({ isSaving: true, error: null });
        try {
            await projectApi.removeMember(projectId, memberId);
            set((state) => ({
                members: state.members.filter((m) => m.id !== memberId),
                currentProject: state.currentProject
                    ? {
                        ...state.currentProject,
                        members: state.currentProject.members.filter((m) => m.id !== memberId),
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
    clearCurrentProject: () => set({ currentProject: null, members: [] }),
    reset: () => set(initialState),
}));