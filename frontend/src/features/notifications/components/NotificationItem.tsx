import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare, CheckCircle2, AlertCircle, FolderPlus, UserPlus,
  UserMinus, Shield, Building2, MessageSquare, AtSign, Bell,
  Trash2, Check,
} from 'lucide-react';
import type { Notification } from '../types/notification';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onDelete?: (id: number) => void;
}

const getNotificationIcon = (type: string) => {
  const cls = 'w-4 h-4';
  switch (type) {
    case 'task.assigned':       return <CheckSquare className={`${cls} text-white/70`} />;
    case 'task.completed':      return <CheckCircle2 className={`${cls} text-green-400`} />;
    case 'task.overdue':        return <AlertCircle className={`${cls} text-red-400`} />;
    case 'project.created':
    case 'project.completed':   return <FolderPlus className={`${cls} text-white/70`} />;
    case 'member.added':        return <UserPlus className={`${cls} text-green-400`} />;
    case 'member.removed':      return <UserMinus className={`${cls} text-red-400`} />;
    case 'role.changed':        return <Shield className={`${cls} text-yellow-400`} />;
    case 'organization.created':return <Building2 className={`${cls} text-white/70`} />;
    case 'comment.added':       return <MessageSquare className={`${cls} text-white/70`} />;
    case 'mention':             return <AtSign className={`${cls} text-white/70`} />;
    default:                    return <Bell className={`${cls} text-white/60`} />;
  }
};

const formatTimeAgo = (raw: string | undefined | null): string => {
  if (!raw) return '';
  const date = new Date(raw);
  if (isNaN(date.getTime())) return '';

  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return 'just now';
  const min = Math.floor(diffSec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return date.toLocaleDateString();
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  const navigate = useNavigate();
 
  const rawDate =
    (notification as any).created_at ??
    (notification as any).createdAt ??
    null;
  const time = formatTimeAgo(rawDate);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.is_read) onMarkAsRead(notification.id);
    if (notification.action_url) navigate(notification.action_url);
  };

  const handleMarkReadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(notification.id);
  };

  const isUnread = !notification.is_read;

  return (
    <div
      onClick={handleClick}
      className={`group relative flex cursor-pointer items-start gap-3 border-b border-white/5 px-4 py-3 transition-colors hover:bg-white/[0.03] ${
        isUnread ? 'bg-white/[0.02]' : ''
      }`}
    >
      {/* Icon */}
      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
        {getNotificationIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pr-10">
        <div className="flex items-baseline justify-between gap-2">
          <p
            className={`truncate text-sm ${
              isUnread ? 'font-medium text-white' : 'text-white/70'
            }`}
          >
            {notification.title}
          </p>
          {time && (
            <span className="flex-shrink-0 text-[10px] text-white/30">
              {time}
            </span>
          )}
        </div>
        {notification.content && (
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-white/50">
            {notification.content}
          </p>
        )}
      </div>

      {/* Hover actions */}
      <div className="absolute right-2 top-3 flex items-center gap-1 rounded-md bg-black/90 p-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        {isUnread && (
          <button
            onClick={handleMarkReadClick}
            title="Mark as read"
            className="rounded p-1 text-white/40 hover:bg-white/10 hover:text-white"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={handleDeleteClick}
            title="Delete"
            className="rounded p-1 text-white/40 hover:bg-red-500/20 hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Unread dot */}
      {isUnread && (
        <span className="absolute left-1.5 top-3.5 h-1.5 w-1.5 rounded-full bg-green-400" />
      )}
    </div>
  );
};

export default NotificationItem;