export interface Notification {
    id: number;
    user_id: number;
    type: string;
    title: string;
    content: string;
    action_url: string;
    metadata: Record<string, any>;
    is_read: boolean;
    created_at: string;
    updated_at: string;
}
 
export const NotificationTypes = {
    TASK_ASSIGNED: 'task.assigned',
    TASK_COMPLETED: 'task.completed',
    TASK_OVERDUE: 'task.overdue',
    PROJECT_CREATED: 'project.created',
    PROJECT_COMPLETED: 'project.completed',
    MEMBER_ADDED: 'member.added',
    MEMBER_REMOVED: 'member.removed',
    ROLE_CHANGED: 'role.changed',
    ORGANIZATION_CREATED: 'organization.created',
    COMMENT_ADDED: 'comment.added',
    MENTION: 'mention',
    SYSTEM: 'system',
     
    INVITATION_ACCEPTED: 'invitation.accepted',
    INVITATION_DECLINED: 'invitation.declined',
} as const;