import React from 'react';

interface NotificationBadgeProps {
  count: number;   
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count, className = '' }) => {
  if (count <= 0) return null;

  return (
    <span className={`flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white ${className}`}>
      {count > 9 ? '9+' : count}
    </span>
  );
};