export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  bio?: string | null;
  location?: string | null;
  is_verified: boolean;
  github_username?: string | null;
  portfolio_url?: string | null;
  skills?: string[];
  social_links?: Record<string, string>;
  created_at: string;
  updated_at?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  bio?: string;
  skills?: string[];
  github_username?: string;
  portfolio_url?: string;
  location?: string;
  social_links?: Record<string, string>;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ProfileStats {
  projects: number;
  tasks: number;
  teams: number;
  completed_tasks: number;
}

export interface GitHubContribution {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface GitHubContributionsResponse {
  username: string;
  total: number;
  contributions: GitHubContribution[];
  average_per_day: number;
}
