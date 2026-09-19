export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';
export type InvitationRole = 'admin' | 'member';

export interface Invitation {
    id: number;
    organization_id: number;
    email: string;
    token: string;
    role: InvitationRole;
    status: InvitationStatus;
    expires_at: string;
    created_by: number;
    created_at: string;
    updated_at: string;
    organization?: {
        id: number;
        name: string;
        slug: string;
    };
}

export interface CreateInvitationRequest {
    email: string;
    role: InvitationRole;
}

export interface InvitationInfo {
    organization_id: number;
    organization_name?: string;
    email: string;
    role: InvitationRole;
    status: InvitationStatus;
    expires_at: string;
}