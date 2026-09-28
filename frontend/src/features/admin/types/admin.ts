export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

export interface AdminUserDetail extends AdminUser {
  org_count: number;
  team_count: number;
  project_count: number;
  task_count: number;
}

export interface AdminOrganization {
  id: number;
  name: string;
  slug: string;
  description: string;
  created_by: number;
  owner_name: string;
  owner_email: string;
  member_count: number;
  team_count: number;
  project_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminStats {
  users: { total: number; active: number; new_this_week: number };
  organizations: { total: number; active: number };
  teams: { total: number };
  projects: { total: number };
  tasks: { total: number; completed: number; in_progress: number };
  recent_activity: AdminActivityItem[];
}

export interface AdminActivityItem {
  type: 'user_created' | 'org_created' | 'project_created' | 'task_created';
  description: string;
  timestamp: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface AdminUsersFilters {
  page: number;
  limit: number;
  search: string;
  role_id?: number;
  is_active?: boolean;
}

export interface AdminOrgsFilters {
  page: number;
  limit: number;
  search: string;
  is_active?: boolean;
}   