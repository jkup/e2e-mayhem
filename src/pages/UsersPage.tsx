import { useState, useMemo } from 'react';
import { mockUsers, type User } from '../data/mock';
import { Dropdown } from '../components/Dropdown';
import { MultiSelect } from '../components/MultiSelect';
import { SlideOver } from '../components/SlideOver';
import { Tabs } from '../components/Tabs';
import { Modal } from '../components/Modal';

type SortKey = 'name' | 'email' | 'role' | 'status' | 'department' | 'joinDate';
type SortDir = 'asc' | 'desc';

export function UsersPage({ onToast }: { onToast: (msg: string, type: 'info' | 'success' | 'warning' | 'error') => void }) {
  const [search, setSearch] = useState('');
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [slideOverUser, setSlideOverUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const pageSize = 10;

  const departments = [...new Set(mockUsers.map(u => u.department))].sort();
  const roles = ['admin', 'editor', 'viewer'];

  const filtered = useMemo(() => {
    let result = [...mockUsers];
    if (search) result = result.filter(u => u.name.includes(search) || u.email.includes(search));
    if (selectedDepts.length) result = result.filter(u => selectedDepts.includes(u.department));
    if (selectedRoles.length) result = result.filter(u => selectedRoles.includes(u.role));
    result.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? -cmp : cmp;
    });
    return result;
  }, [search, selectedDepts, selectedRoles, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice(page * pageSize, page * pageSize + pageSize);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const toggleSelectAll = () => {
    if (paged.every(u => selectedIds.has(u.id))) {
      setSelectedIds(prev => { const n = new Set(prev); paged.forEach(u => n.delete(u.id)); return n; });
    } else {
      setSelectedIds(prev => { const n = new Set(prev); n.add(paged[0].id); return n; });
    }
  };

  const bulkAction = (action: string) => {
    onToast(`${action} applied to ${selectedIds.size} user(s)`, 'success');


  };

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <th
      data-testid={`sort-${field}`}
      onClick={() => toggleSort(field)}
      className="px-4 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700 select-none"
    >
      {label} {sortKey === field && (sortDir === 'asc' ? '↑' : '↓')}
    </th>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        {selectedIds.size > 0 && (
          <Dropdown
            testId="bulk-actions"
            trigger={<button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Bulk Actions ({selectedIds.size})</button>}
            items={[
              { label: 'Activate', onClick: () => bulkAction('Activate') },
              { label: 'Deactivate', onClick: () => bulkAction('Deactivate') },
              { label: 'Delete', onClick: () => bulkAction('Delete'), danger: true },
              {
                label: 'Change Role', onClick: () => {}, children: [
                  { label: 'Admin', onClick: () => bulkAction('Set role to Admin') },
                  { label: 'Editor', onClick: () => bulkAction('Set role to Editor') },
                  { label: 'Viewer', onClick: () => bulkAction('Set role to Viewer') },
                ]
              },
            ]}
          />
        )}
      </div>

      {/* Filters */}
      <div data-testid="filters" className="flex flex-wrap gap-3">
        <input
          data-testid="user-search"
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or email..."
          className="px-3 py-2 border rounded-lg text-sm w-64 text-gray-900"
        />
        <div className="w-48">
          <MultiSelect
            testId="dept-filter"
            options={departments}
            selected={selectedDepts}
            onChange={v => { setSelectedDepts(v); setPage(1); }}
            placeholder="Filter departments"
          />
        </div>
        <div className="w-40">
          <MultiSelect
            testId="role-filter"
            options={roles}
            selected={selectedRoles}
            onChange={v => { setSelectedRoles(v); setPage(1); }}
            placeholder="Filter roles"
          />
        </div>
        {(search || selectedDepts.length > 0 || selectedRoles.length > 0) && (
          <button
            data-testid="clear-filters"
            onClick={() => { setSearch(''); setSelectedDepts([]); setSelectedRoles([]); setPage(1); }}
            className="text-sm text-gray-500 hover:text-gray-700 px-2"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="text-sm text-gray-500" data-testid="results-count">{filtered.length} user(s) found</div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table data-testid="users-table" className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 w-10">
                <input
                  data-testid="select-all"
                  type="checkbox"
                  checked={paged.length > 0 && paged.every(u => selectedIds.has(u.id))}
                  onChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </th>
              <SortHeader label="Name" field="name" />
              <SortHeader label="Email" field="email" />
              <SortHeader label="Role" field="role" />
              <SortHeader label="Status" field="status" />
              <SortHeader label="Department" field="department" />
              <SortHeader label="Joined" field="joinDate" />
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {paged.map(user => (
              <tr
                key={user.id}
                data-testid={`user-row-${user.id}`}
                className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSlideOverUser(user)}
              >
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <input
                    data-testid={`select-${user.id}`}
                    type="checkbox"
                    checked={selectedIds.has(user.id)}
                    onChange={() => toggleSelect(user.id)}
                    aria-label={`Select ${user.name}`}
                  />
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : user.role === 'editor' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>{user.role}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    user.status === 'active' ? 'bg-green-100 text-green-800' : user.status === 'inactive' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>{user.status}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{user.department}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{user.joinDate}</td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <Dropdown
                    testId={`user-actions-${user.id}`}
                    trigger={<button className="text-gray-400 hover:text-gray-600" aria-label={`Actions for ${user.name}`}>⋯</button>}
                    items={[
                      { label: 'View Details', onClick: () => setSlideOverUser(user) },
                      { label: 'Edit', onClick: () => onToast(`Editing ${user.name}`, 'info') },
                      { label: 'Delete', onClick: () => setDeleteUser(user), danger: true },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div data-testid="pagination" className="flex justify-between items-center">
        <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          <button data-testid="prev-page" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Previous</button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = page <= 3 ? i + 1 : page + i - 2;
            if (p < 1 || p > totalPages) return null;
            return (
              <button key={p} data-testid={`page-${p}`} onClick={() => setPage(p)} className={`px-3 py-1 border rounded text-sm ${p === page ? 'bg-blue-600 text-white' : ''}`}>{p}</button>
            );
          })}
          <button data-testid="next-page" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Next</button>
        </div>
      </div>

      {/* Slide-over for user details */}
      <SlideOver open={!!slideOverUser} onClose={() => setSlideOverUser(null)} title={slideOverUser?.name || ''}>
        {slideOverUser && (
          <Tabs
            testId="user-detail-tabs"
            tabs={[
              {
                label: 'Profile',
                content: (
                  <div className="px-6 space-y-4">
                    <div><span className="text-sm text-gray-500">Email</span><p className="text-gray-900">{slideOverUser.email}</p></div>
                    <div><span className="text-sm text-gray-500">Role</span><p className="text-gray-900 capitalize">{slideOverUser.role}</p></div>
                    <div><span className="text-sm text-gray-500">Status</span><p className="text-gray-900 capitalize">{slideOverUser.status}</p></div>
                    <div><span className="text-sm text-gray-500">Department</span><p className="text-gray-900">{slideOverUser.department}</p></div>
                    <div><span className="text-sm text-gray-500">Joined</span><p className="text-gray-900">{slideOverUser.joinDate}</p></div>
                  </div>
                ),
              },
              {
                label: 'Activity',
                content: (
                  <div className="px-6">
                    <p className="text-sm text-gray-500">Recent activity for {slideOverUser.name}</p>
                    <ul className="mt-2 space-y-2">
                      {['Logged in', 'Updated profile', 'Uploaded a file', 'Commented on a task'].map((act, i) => (
                        <li key={i} className="text-sm text-gray-700 py-1 border-b">{act} — {i + 1}d ago</li>
                      ))}
                    </ul>
                  </div>
                ),
              },
              {
                label: 'Permissions',
                content: (
                  <div className="px-6">
                    <p className="text-sm text-gray-500 mb-3">Permissions for {slideOverUser.role}</p>
                    {['Read content', 'Write content', 'Manage users', 'Admin settings'].map((perm, i) => (
                      <label key={i} className="flex items-center gap-2 py-1">
                        <input type="checkbox" defaultChecked={i < (slideOverUser.role === 'admin' ? 4 : slideOverUser.role === 'editor' ? 2 : 1)} className="rounded" />
                        <span className="text-sm text-gray-700">{perm}</span>
                      </label>
                    ))}
                  </div>
                ),
              },
            ]}
          />
        )}
      </SlideOver>

      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        title="Confirm Delete"
        footer={
          <>
            <button data-testid="cancel-delete" onClick={() => setDeleteUser(null)} className="px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            <button
              data-testid="confirm-delete"
              onClick={() => { onToast(`Deleted ${deleteUser?.name}`, 'error'); setDeleteUser(null); }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-gray-700">Are you sure you want to delete <strong>{deleteUser?.name}</strong>? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
