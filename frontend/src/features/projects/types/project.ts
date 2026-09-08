export type ProjectStatus = 'active' | 'inactive' | 'completed' | 'archived';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ProjectRole = 'admin' | 'member' | 'viewer';

export interface Project {
    id: number;
    organization_id: number;
    name: string;
    description: string;
    status: ProjectStatus;
    priority: ProjectPriority;
    start_date: string | null;
    end_date: string | null;
    created_by: number;
    member_count: number;
    task_count: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ProjectMember {
    id: number;
    project_id: number;
    user_id: number;
    user_name: string;
    user_email: string;
    role: ProjectRole;
    joined_at: string;
}

export interface ProjectDetail extends Project {
    members: ProjectMember[];
}

export interface CreateProjectRequest {
    organization_id: number;
    name: string;
    description?: string;
    priority?: ProjectPriority;
    start_date?: string | null;
    end_date?: string | null;
}

export interface UpdateProjectRequest {
    name?: string;
    description?: string;
    status?: ProjectStatus;
    priority?: ProjectPriority;
    start_date?: string | null;
    end_date?: string | null;
}

export interface AddProjectMemberRequest {
    user_id: number;
    role: ProjectRole;
}