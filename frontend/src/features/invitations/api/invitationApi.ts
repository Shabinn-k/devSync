import { apiClient } from '../../../lib/axios';
import type { ApiResponse } from '../../../types/api';
import type { Invitation, CreateInvitationRequest, InvitationInfo } from '../types/invitation';

export const invitationApi = {
    invite: (organizationId: number, data: CreateInvitationRequest): Promise<Invitation> =>
        apiClient.post<ApiResponse<Invitation>>(`/organizations/${organizationId}/invite`, data)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Failed to send invitation');
            }),

    getInfo: (token: string): Promise<InvitationInfo> =>
        apiClient.get<ApiResponse<InvitationInfo>>(`/invite/info?token=${token}`)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Invalid invitation');
            }),

    accept: (token: string): Promise<{ message: string }> =>
        apiClient.post<ApiResponse<{ message: string }>>(`/invite/accept?token=${token}`)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Failed to accept invitation');
            }),

    decline: (token: string): Promise<{ message: string }> =>
        apiClient.post<ApiResponse<{ message: string }>>(`/invite/decline?token=${token}`)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    return res.data.data;
                }
                throw new Error(res.data.message || 'Failed to decline invitation');
            }),
};