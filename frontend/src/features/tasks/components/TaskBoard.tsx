import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { TaskCard } from './TaskCard';
import { TaskStatusBadge } from './TaskStatusBadge';
import type { Task, TaskStatus } from '../types/task';

interface TaskBoardProps {
    tasks: Task[];
    onStatusChange: (taskId: number, newStatus: TaskStatus) => void;
}

const columns: { id: TaskStatus; label: string }[] = [
    { id: 'todo', label: 'To Do' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'review', label: 'Review' },
    { id: 'done', label: 'Done' },
];

export const TaskBoard = ({ tasks, onStatusChange }: TaskBoardProps) => {
    const getTasksByStatus = (status: TaskStatus) => {
        return tasks.filter((task) => task.status === status);
    };

    const handleDragEnd = (result: any) => {
        if (!result.destination) return;

        const { draggableId, destination } = result;
        const taskId = parseInt(draggableId);
        const newStatus = destination.droppableId as TaskStatus;

        const task = tasks.find((t) => t.id === taskId);
        if (task && task.status !== newStatus) {
            onStatusChange(taskId, newStatus);
        }
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {columns.map((column) => {
                    const columnTasks = getTasksByStatus(column.id);
                    return (
                        <div key={column.id} className="space-y-3">
                            {/* Column Header */}
                            <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                                <TaskStatusBadge status={column.id} size="lg" />
                                <span className="text-xs text-white/30">
                                    {columnTasks.length}
                                </span>
                            </div>

                            {/* Column Content */}
                            <Droppable droppableId={column.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`min-h-[200px] rounded-xl border border-dashed p-2 transition-colors ${
                                            snapshot.isDraggingOver
                                                ? 'border-white/30 bg-white/5'
                                                : 'border-white/5'
                                        }`}
                                    >
                                        {columnTasks.length === 0 ? (
                                            <div className="flex h-32 items-center justify-center text-sm text-white/20">
                                                Empty
                                            </div>
                                        ) : (
                                            columnTasks.map((task, index) => (
                                                <Draggable
                                                    key={task.id}
                                                    draggableId={String(task.id)}
                                                    index={index}
                                                >
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`mb-2 transition-opacity ${
                                                                snapshot.isDragging ? 'opacity-50' : ''
                                                            }`}
                                                        >
                                                            <TaskCard task={task} />
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))
                                        )}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    );
                })}
            </div>
        </DragDropContext>
    );
};