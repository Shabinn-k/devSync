export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  bio: string;
  skills: string[];
  github_username: string;
  portfolio_url: string;
  location: string;
  social_links: Record<string, string>;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfilePayload {
  name?: string;
  bio?: string;
  skills?: string[];
  github_username?: string;
  portfolio_url?: string;
  location?: string;
  social_links?: Record<string, string>;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ProfileStats {
  projects: number;
  tasks: number;
  teams: number;
  completed_tasks: number;
  active_tasks: number;
}

export interface ActivityItem {
  id: string;
  type: 'task' | 'project' | 'team' | 'profile';
  action: string;
  title: string;
  time: string;
}