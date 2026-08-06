export interface DashboardStats {
  projects: number;
  tasks: number;
  teams: number;
  completed_tasks: number;
  active_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  completion_rate: number;
}

export interface ActivityItem {
  id: string;
  type: 'task' | 'project' | 'comment' | 'team';
  action: string;
  title: string;
  time: string;
  user: string;
  user_avatar?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  due_date: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  assignee?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  path: string;
}