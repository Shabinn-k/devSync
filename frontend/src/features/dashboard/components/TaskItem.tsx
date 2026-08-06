import type { TaskItem as TaskItemType } from '../types/dashboard';

interface TaskItemProps {
  task: TaskItemType;
}

const priorityColors = {
  High: 'text-red-400 bg-red-500/10',
  Medium: 'text-yellow-400 bg-yellow-500/10',
  Low: 'text-green-400 bg-green-500/10',
};

export const TaskItem = ({ task }: TaskItemProps) => {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:border-white/10">
      <div>
        <p className="text-sm text-white">{task.title}</p>
        <p className="mt-0.5 text-xs text-white/30">Due: {task.due_date}</p>
      </div>
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityColors[task.priority]}`}>
        {task.priority}
      </span>
    </div>
  );
};