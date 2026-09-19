export type TeamRole = 'admin' | 'member';

export interface TeamMember {
  id: number;
  team_id: number;
  user_id: number;
  user_name: string;
  email: string;
  role: TeamRole;
  joined_at: string;
}

export interface Team {
  id: number;
  organization_id: number;
  name: string;
  lead_id: number;
  lead_name?: string;
  is_active: boolean;
  member_count?: number;
  created_at: string;
  updated_at: string;
  members?: TeamMember[];
}

// NEW — what /teams/:id returns (team + guaranteed members)
export interface TeamDetail extends Team {
  members: TeamMember[];
}

export interface CreateTeamRequest {
  organization_id: number;
  name: string;
  lead_id?: number;
}

export interface UpdateTeamRequest {
  name?: string;
  lead_id?: number;
}

export interface AddTeamMemberRequest {
  user_id: number;
  role?: TeamRole;
}

export interface UpdateTeamMemberRoleRequest {
  role: TeamRole;
}