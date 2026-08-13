export type OrganizationRole = 'admin' | 'member' | 'viewer';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  website: string;
  location: string;
  created_by: string;
  member_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  user_id: string;
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
  user_id?: string;  
  email?: string;   
  role: OrganizationRole;
}

export interface UpdateMemberRoleRequest {
  role: OrganizationRole;
}