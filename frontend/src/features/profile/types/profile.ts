// RECONSTRUCTED FILE — not shown to me in the original conversation.
// Built strictly from how `profile.*` fields are actually used across
// ProfileHeader.tsx, ProfileInfo.tsx, EditProfileForm.tsx, ProfileAvatar.tsx,
// and the original ProfilePage.tsx you pasted. If your real types/profile.ts
// differs from this, YOUR file is the source of truth — replace this one.

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
  // Generic platform -> url map, e.g. { linkedin: "https://...", twitter: "https://..." }
  social_links?: Record<string, string>;
  created_at: string;
  updated_at?: string;
}

// Matches the fields actually sent in EditProfileForm.tsx's handleSubmit.
// All optional — PUT /profile/me should only update fields that are present.
export interface UpdateProfileRequest {
  name?: string;
  bio?: string;
  skills?: string[];
  github_username?: string;
  portfolio_url?: string;
  location?: string;
  social_links?: Record<string, string>;
}

// Matches ChangePasswordForm.tsx's handleSubmit payload exactly.
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// Consumed by ProfileStats.tsx. No fetch path exists for this yet anywhere
// in the shown code — kept here so the component's prop type has a home,
// but nothing currently populates it. Wire this up once a stats endpoint
// exists (e.g. GET /profile/me/stats or a dashboard aggregate).
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
