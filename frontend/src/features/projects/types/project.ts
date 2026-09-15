export type ProjectStatus = 'active' | 'inactive' | 'completed' | 'archived';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ProjectRole = 'admin' | 'member' | 'viewer';

export interface Project {
  id: number;
  organization_id: number;
  team_id?: number;
  team_name?: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date?: string | null;
  end_date?: string | null;
  created_by: number;
  is_active: boolean;
  task_count?: number;
  member_count?: number;
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
  team_id?: number;
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