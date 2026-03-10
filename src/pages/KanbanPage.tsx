import { useState } from 'react';
import { DndContext, closestCenter, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { mockTasks, type Task } from '../data/mock';
import { Modal } from '../components/Modal';

const columns = ['todo', 'in-progress', 'review', 'done'] as const;
const columnLabels: Record<string, string> = { 'todo': 'To Do', 'in-progress': 'In Progress', 'review': 'Review', 'done': 'Done' };
const priorityColors: Record<string, string> = { critical: 'border-l-red-500', high: 'border-l-orange-500', medium: 'border-l-yellow-500', low: 'border-l-green-500' };

function SortableCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-testid={`task-card-${task.id}`}
      className={`bg-white rounded-lg shadow-sm border-l-4 ${priorityColors[task.priority]} p-3 cursor-grab active:cursor-grabbing`}
      onClick={onClick}
    >
      <div className="text-sm font-medium text-gray-900 mb-1">{task.title}</div>
      <div className="flex justify-between items-center">
        <span className={`text-xs px-1.5 py-0.5 rounded ${
          task.priority === 'critical' ? 'bg-red-100 text-red-800' : task.priority === 'high' ? 'bg-orange-100 text-orange-800' : task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
        }`}>{task.priority}</span>
        <span className="text-xs text-gray-500">{task.assignee.split(' ')[0]}</span>
      </div>
    </div>
  );
}

export function KanbanPage({ onToast }: { onToast: (msg: string, type: 'info' | 'success' | 'warning' | 'error') => void }) {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeTask = tasks.find(t => t.id === active.id);
    const overTask = tasks.find(t => t.id === over.id);
    if (!activeTask || !overTask) return;

    if (activeTask.status !== overTask.status) {
      setTasks(prev => prev.map(t => t.id === activeTask.id ? { ...t, status: overTask.status } : t));
      onToast(`Moved "${activeTask.title.slice(0, 30)}..." to ${columnLabels[overTask.status]}`, 'info');
    }
  };

  const addTask = (status: Task['status']) => {
    if (!newTitle.trim()) return;
    const task: Task = {
      id: crypto.randomUUID(),
      title: newTitle,
      description: '',
      status,
      priority: 'medium',
      assignee: 'You',
    };
    setTasks(prev => [...prev, task]);
    setNewTitle('');
    setAddingTo(null);
    onToast(`Created task: ${newTitle}`, 'success');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div data-testid="kanban-board" className="grid grid-cols-4 gap-4 min-h-[500px]">
          {columns.map(col => {
            const colTasks = tasks.filter(t => t.status === col);
            return (
              <div key={col} data-testid={`column-${col}`} className="bg-gray-100 rounded-xl p-3">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-sm font-semibold text-gray-700">{columnLabels[col]} <span className="text-gray-400 font-normal">({colTasks.length})</span></h2>
                  <button
                    data-testid={`add-task-${col}`}
                    onClick={() => { setAddingTo(col); setNewTitle(''); }}
                    className="text-gray-400 hover:text-gray-600 text-lg"
                    aria-label={`Add task to ${columnLabels[col]}`}
                  >+</button>
                </div>

                {addingTo === col && (
                  <div data-testid="new-task-form" className="mb-3 space-y-2">
                    <input
                      data-testid="new-task-input"
                      type="text"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addTask(col)}
                      placeholder="Task title..."
                      className="w-full px-2 py-1 text-sm border rounded text-gray-900"
                      autoFocus
                    />
                    <div className="flex gap-1">
                      <button data-testid="save-new-task" onClick={() => addTask(col)} className="px-2 py-1 bg-blue-600 text-white text-xs rounded">Add</button>
                      <button data-testid="cancel-new-task" onClick={() => setAddingTo(null)} className="px-2 py-1 text-gray-500 text-xs">Cancel</button>
                    </div>
                  </div>
                )}

                <SortableContext items={colTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2 min-h-[100px]">
                    {colTasks.map(task => (
                      <SortableCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />
                    ))}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>
      </DndContext>

      {/* Task detail modal */}
      <Modal open={!!selectedTask} onClose={() => setSelectedTask(null)} title="Task Details">
        {selectedTask && (
          <div data-testid="task-detail" className="space-y-3 text-sm">
            <div><span className="text-gray-500">Title</span><p className="text-gray-900 font-medium">{selectedTask.title}</p></div>
            <div><span className="text-gray-500">Description</span><p className="text-gray-900">{selectedTask.description || 'No description'}</p></div>
            <div className="flex gap-4">
              <div><span className="text-gray-500">Status</span><p className="text-gray-900 capitalize">{selectedTask.status}</p></div>
              <div><span className="text-gray-500">Priority</span><p className="text-gray-900 capitalize">{selectedTask.priority}</p></div>
            </div>
            <div><span className="text-gray-500">Assignee</span><p className="text-gray-900">{selectedTask.assignee}</p></div>
            <div className="pt-2">
              <label className="block text-gray-500 mb-1">Move to</label>
              <select
                data-testid="task-move-select"
                value={selectedTask.status}
                onChange={e => {
                  const newStatus = e.target.value as Task['status'];
                  setTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, status: newStatus } : t));
                  setSelectedTask(prev => prev ? { ...prev, status: newStatus } : null);
                  onToast(`Moved to ${columnLabels[newStatus]}`, 'info');
                }}
                className="w-full px-2 py-1 border rounded text-gray-900"
              >
                {columns.map(c => <option key={c} value={c}>{columnLabels[c]}</option>)}
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
