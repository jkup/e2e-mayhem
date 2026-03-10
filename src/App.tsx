import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { WizardPage } from './pages/WizardPage';
import { KanbanPage } from './pages/KanbanPage';
import { LoginPage } from './pages/LoginPage';
import { SearchAutocomplete } from './components/SearchAutocomplete';
import { Dropdown } from './components/Dropdown';
import { ToastContainer } from './components/ToastContainer';
import { useToast } from './hooks/useToast';
import { searchableItems } from './data/mock';

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toasts, addToast, removeToast } = useToast();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: '▦' },
    { to: '/users', label: 'Users', icon: '👤' },
    { to: '/wizard', label: 'Wizard', icon: '📝' },
    { to: '/kanban', label: 'Kanban', icon: '☰' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Sidebar */}
      <aside
        data-testid="sidebar"
        className={`bg-gray-900 text-white flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-56' : 'w-16'}`}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          {sidebarOpen && <span className="font-bold text-lg">E2E Mayhem</span>}
          <button
            data-testid="toggle-sidebar"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              data-testid={`nav-${item.label.toLowerCase()}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm ${isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`
              }
            >
              <span>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header data-testid="topbar" className="bg-white shadow-sm border-b px-6 py-3 flex items-center justify-between">
          <div className="w-80">
            <SearchAutocomplete
              items={searchableItems}
              onSelect={(item) => addToast(`Selected: ${item.label}`, 'info')}
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              data-testid="notifications-btn"
              onClick={() => addToast('You have 3 unread notifications', 'info')}
              className="relative text-gray-500 hover:text-gray-700"
              aria-label="Notifications"
            >
              🔔
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
            </button>
            <Dropdown
              testId="user-menu"
              trigger={
                <button data-testid="user-menu-trigger" className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">JD</div>
                  <span>John Doe</span>
                </button>
              }
              items={[
                { label: 'Profile', onClick: () => addToast('Profile clicked', 'info') },
                { label: 'Settings', onClick: () => addToast('Settings clicked', 'info') },
                {
                  label: 'Theme', onClick: () => {}, children: [
                    { label: 'Light', onClick: () => addToast('Light theme selected', 'info') },
                    { label: 'Dark', onClick: () => addToast('Dark theme selected', 'info') },
                    { label: 'System', onClick: () => addToast('System theme selected', 'info') },
                  ]
                },
                { label: 'Sign Out', onClick: () => window.location.reload(), danger: true },
              ]}
            />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage onToast={addToast} />} />
            <Route path="/wizard" element={<WizardPage onToast={addToast} />} />
            <Route path="/kanban" element={<KanbanPage onToast={addToast} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  if (!loggedIn) {
    return (
      <BrowserRouter>
        <LoginPage onLogin={() => setLoggedIn(true)} />
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
