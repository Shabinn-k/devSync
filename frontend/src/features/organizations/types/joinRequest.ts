export interface JoinRequestUser {
  id: number;
  name: string;
  email: string;
}

export interface JoinRequestOrg {
  id: number;
  name: string;
  slug: string;
  description: string;
  member_count: number;
}

export interface JoinRequest {
  id: number;
  organization_id: number;
  user_id: number;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: number | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  user?: JoinRequestUser;
  organization?: JoinRequestOrg;
}

export interface PaginatedJoinRequests {
  data: JoinRequest[];
  pagination: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
}