import { useState } from 'react';
import { mockUsers, mockTasks, mockNotifications } from '../data/mock';

const stats = [
  { label: 'Total Users', value: mockUsers.length, change: '+12%' },
  { label: 'Active Tasks', value: mockTasks.filter(t => t.status !== 'done').length, change: '-3%' },
  { label: 'Completed', value: mockTasks.filter(t => t.status === 'done').length, change: '+28%' },
  { label: 'Notifications', value: mockNotifications.filter(n => !n.read).length, change: '' },
];

export function DashboardPage() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats cards */}
      <div data-testid="stats-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} data-testid={`stat-card-${stat.label.toLowerCase().replace(/\s/g, '-')}`} className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-sm text-gray-500">{stat.label}</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</div>
            {stat.change && (
              <div className={`text-sm mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{stat.change} from last month</div>
            )}
          </div>
        ))}
      </div>

      {/* Recent activity / notifications */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <button
            data-testid="mark-all-read"
            onClick={markAllRead}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Mark all as read
          </button>
        </div>
        <ul data-testid="activity-feed">
          {notifications.map(n => (
            <li
              key={n.id}
              data-testid={`activity-item-${n.id}`}
              className={`px-6 py-3 border-b last:border-b-0 flex justify-between items-center ${n.read ? 'opacity-60' : ''}`}
            >
              <div>
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  n.type === 'error' ? 'bg-red-500' : n.type === 'warning' ? 'bg-yellow-500' : n.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                }`} />
                <span className="text-sm text-gray-700">{n.message}</span>
              </div>
              {!n.read && (
                <button
                  data-testid={`mark-read-${n.id}`}
                  onClick={() => markAsRead(n.id)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Mark read
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Quick chart placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div data-testid="chart-placeholder" className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Task Distribution</h3>
          <div className="flex items-end gap-2 h-32">
            {['todo', 'in-progress', 'review', 'done'].map(status => {
              const count = mockTasks.filter(t => t.status === status).length;
              const height = (count / mockTasks.length) * 100;
              return (
                <div key={status} className="flex-1 flex flex-col items-center">
                  <div
                    data-testid={`bar-${status}`}
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${height}%` }}
                    title={`${status}: ${count}`}
                  />
                  <span className="text-xs text-gray-500 mt-1">{status}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div data-testid="priority-breakdown" className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Priority Breakdown</h3>
          {(['critical', 'high', 'medium', 'low'] as const).map(priority => {
            const count = mockTasks.filter(t => t.priority === priority).length;
            const pct = Math.round((count / mockTasks.length) * 100);
            const colors = { critical: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-yellow-500', low: 'bg-green-500' };
            return (
              <div key={priority} className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span className="capitalize">{priority}</span>
                  <span>{count} ({pct}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div data-testid={`progress-${priority}`} className={`${colors[priority]} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
