import api from '../../../lib/axios';
import type { JoinRequest, PaginatedJoinRequests } from '../types/joinRequest';

export const joinRequestApi = {
  create: async (orgId: number, message: string): Promise<JoinRequest> => {
    const res = await api.post(`/organizations/${orgId}/join-request`, { message });
    return res.data.data;
  },

  myRequests: async (page = 1, limit = 20): Promise<PaginatedJoinRequests> => {
    const res = await api.get('/organizations/me/join-requests', {
      params: { page, limit },
    });
    return { data: res.data.data, pagination: res.data.pagination };
  },

  cancel: async (requestId: number): Promise<void> => {
    await api.delete(`/organizations/join-requests/${requestId}`);
  },

  listForOrg: async (
    orgId: number,
    status = 'pending',
    page = 1,
    limit = 20
  ): Promise<PaginatedJoinRequests> => {
    const res = await api.get(`/organizations/${orgId}/join-requests`, {
      params: { status, page, limit },
    });
    return { data: res.data.data, pagination: res.data.pagination };
  },

  review: async (
    orgId: number,
    requestId: number,
    status: 'approved' | 'rejected'
  ): Promise<void> => {
    await api.put(`/organizations/${orgId}/join-requests/${requestId}`, { status });
  },
};