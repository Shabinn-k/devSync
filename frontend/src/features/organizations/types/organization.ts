export type OrganizationRole = 'admin' | 'member' | 'viewer';

export interface Organization {
  id: number;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  website: string;
  location: string;
  created_by: number;
  member_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  role: OrganizationRole;
  joined_at: string;
}

export interface OrganizationDetail extends Organization {
  members: OrganizationMember[];
}

export interface CreateOrganizationRequest {
  name: string;
  slug: string;
  description?: string;
  website?: string;
  location?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  description?: string;
  website?: string;
  location?: string;
}

export interface AddMemberRequest {
  user_id?: number;
  email?: string;
  role: OrganizationRole;
}

export interface UpdateMemberRoleRequest {
  role: OrganizationRole;
}