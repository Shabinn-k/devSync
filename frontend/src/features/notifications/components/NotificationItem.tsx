import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  CheckCircle2,
  AlertCircle,
  FolderPlus,
  UserPlus,
  UserMinus,
  Shield,
  Building2,
  MessageSquare,
  AtSign,
  Bell,
  Trash2,
  Check,
} from 'lucide-react';
import type { Notification } from '../types/notification';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onDelete?: (id: number) => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'task.assigned':
      return <CheckSquare className="w-4 h-4 text-blue-500" />;
    case 'task.completed':
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'task.overdue':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    case 'project.created':
    case 'project.completed':
      return <FolderPlus className="w-4 h-4 text-purple-500" />;
    case 'member.added':
      return <UserPlus className="w-4 h-4 text-emerald-500" />;
    case 'member.removed':
      return <UserMinus className="w-4 h-4 text-orange-500" />;
    case 'role.changed':
      return <Shield className="w-4 h-4 text-amber-500" />;
    case 'organization.created':
      return <Building2 className="w-4 h-4 text-indigo-500" />;
    case 'comment.added':
      return <MessageSquare className="w-4 h-4 text-teal-500" />;
    case 'mention':
      return <AtSign className="w-4 h-4 text-pink-500" />;
    default:
      return <Bell className="w-4 h-4 text-gray-500" />;
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const handleMarkReadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(notification.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative flex items-start gap-3 p-3 text-sm transition-colors border-b border-gray-100 cursor-pointer hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50 ${
        !notification.is_read
          ? 'bg-blue-50/50 dark:bg-blue-950/20 font-medium'
          : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400'
      }`}
    >
      <div className="flex-shrink-0 mt-0.5 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {getNotificationIcon(notification.type)}
      </div>

      <div className="flex-1 min-w-0 pr-12">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {notification.title}
          </p>
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {formatTimeAgo(notification.created_at)}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
          {notification.content}
        </p>
      </div>

      {/* Quick Action Overlay Buttons */}
      <div className="absolute right-2 top-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-gray-900/90 rounded-md p-0.5 shadow-sm">
        {!notification.is_read && (
          <button
            onClick={handleMarkReadClick}
            title="Mark as read"
            className="p-1 text-gray-400 hover:text-blue-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={handleDeleteClick}
            title="Delete notification"
            className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {!notification.is_read && (
        <span className="absolute left-1.5 top-1.5 w-2 h-2 bg-blue-600 rounded-full" />
      )}
    </div>
  );
};

export default NotificationItem;
