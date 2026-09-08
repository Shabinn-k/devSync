import type { User } from '../../../types/api';

export type TeamRole = 'admin' | 'member';

export interface Team {
    id: number;
    organization_id: number;
    name: string;
    description: string;
    lead_id: number;
    lead?: User;
    member_count: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface TeamMember {
    id: number;
    team_id: number;
    user_id: number;
    user?: User;
    role: TeamRole;
    joined_at: string;
}

export interface TeamDetail extends Team {
    members: TeamMember[];
}

export interface CreateTeamRequest {
    organization_id: number;
    name: string;
    description?: string;
    lead_id: number;
}

export interface UpdateTeamRequest {
    name?: string;
    description?: string;
    lead_id?: number;
    is_active?: boolean;
}

export interface AddTeamMemberRequest {
    user_id: number;
    role: TeamRole;
}

export interface UpdateTeamMemberRoleRequest {
    role: TeamRole;
}
