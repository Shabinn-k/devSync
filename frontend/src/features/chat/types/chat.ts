export type ChannelType = 'org' | 'team' | 'project' | 'direct';

export interface ChatMember {
    id: number;
    user_id: number;
    user_name: string;
    email: string;
    joined_at: string;
}

export interface ChatChannel {
    id: number;
    organization_id?: number;
    project_id?: number;
    name: string;
    type: ChannelType;
    created_by: number;
    created_at: string;
    updated_at: string;
    members?: ChatMember[];
}

export interface ChatMessage {
    id: number;
    channel_id: number;
    sender_id: number;
    sender_name: string;
    sender_email: string;
    message: string;
    attachment_url?: string;
    created_at: string;
}

export interface CreateChannelRequest {
    name: string;
    type: ChannelType;
    organization_id?: number;
    project_id?: number;
    team_id?: number;
    recipient_id?: number;
}

export interface SendMessageRequest {
    message: string;
    attachment_url?: string;
}
