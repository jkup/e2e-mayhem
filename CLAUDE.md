# E2E Mayhem

## Project Goal
Experiment to test whether Claude Code can autonomously generate comprehensive e2e tests for a complex web app. The full plan is in `TODO.md`.

## Current Status
**Phase 1 (Build Demo App): COMPLETE** — App builds and type-checks cleanly.
Next up: Phase 2 (Install Playwright), then Phase 3 (exploration scripts), then Phase 4 (autonomous test loop).

## Tech Stack
- React 19 + TypeScript + Vite 7
- Tailwind CSS v4 (via `@tailwindcss/vite` plugin)
- React Router v7 (BrowserRouter)
- @dnd-kit for drag-and-drop
- @faker-js/faker for mock data (seeded with `faker.seed(42)` for deterministic data)
- No backend — all state is local/in-memory

## Running the App
```
npm run dev     # Start dev server
npm run build   # Type-check + production build
```

## App Structure

### Pages (src/pages/)
- **LoginPage** — Login/signup toggle, email+password validation, password visibility toggle. Calls `onLogin(email)` on success.
- **DashboardPage** — Stats cards, activity feed (mark-read / mark-all-read), task distribution bar chart, priority breakdown progress bars. Uses `mockNotifications`.
- **UsersPage** — Data table with: text search, multi-select department/role filters, column sorting (click headers), pagination (10/page), bulk checkbox selection + bulk actions dropdown (with nested submenu for role change), per-row action dropdown, click row → slide-over panel with 3 tabs (Profile/Activity/Permissions), delete → confirmation modal. Uses `mockUsers` (50 users).
- **WizardPage** — 4-step form: Personal Info → Company → Plan (with addon checkboxes) → Review & Confirm. Per-step validation, back/next navigation, agree-to-terms checkbox, success screen with restart.
- **KanbanPage** — 4-column drag-and-drop board (To Do, In Progress, Review, Done). Add task inline per column. Click card → modal with details and status change dropdown. Uses `mockTasks` (24 tasks).

### Components (src/components/)
- **Modal** — Overlay + dialog, closes on Escape/backdrop click, optional footer
- **SlideOver** — Right-side slide-in panel with backdrop
- **Dropdown** — Click-to-open dropdown menu with optional nested submenus
- **MultiSelect** — Dropdown with checkboxes, search/filter, tag pills with remove
- **SearchAutocomplete** — Debounced search input with keyboard nav (arrow keys + enter), result list
- **Tabs** — Tab bar with panels, aria roles
- **ToastContainer** — Fixed top-right toast notifications, auto-dismiss after 4s, manual dismiss

### Data (src/data/mock.ts)
- `mockUsers` (50), `mockTasks` (24), `mockNotifications` (10)
- `searchableItems` — combined list for autocomplete (users + departments)
- Types: `User`, `Task`, `Notification`

### Hooks (src/hooks/useToast.ts)
- `useToast()` → `{ toasts, addToast, removeToast }`

### App Shell (src/App.tsx)
- Auth gate: shows LoginPage until logged in, then AppShell
- AppShell: collapsible sidebar nav, top bar with search autocomplete + notifications button + user menu dropdown, main content area with routes
- Routes: `/dashboard`, `/users`, `/wizard`, `/kanban`, `*` → redirect to `/dashboard`

## Key Patterns
- All interactive elements have `data-testid` attributes for test targeting
- Components use `aria-label`, `role`, `aria-selected`, `aria-modal` etc. for accessibility
- Click-outside-to-close pattern on dropdowns, multi-selects, search autocomplete
- Escape key closes modals, slide-overs
- Toast notifications flow through `addToast` prop passed down from AppShell

## File Map
```
src/
├── App.tsx              # Auth gate + AppShell with sidebar, topbar, routing
├── main.tsx             # React root mount
├── index.css            # Tailwind import
├── components/
│   ├── Dropdown.tsx     # Click menu with nested submenus
│   ├── Modal.tsx        # Dialog overlay
│   ├── MultiSelect.tsx  # Checkbox dropdown with search
│   ├── SearchAutocomplete.tsx  # Search with keyboard nav
│   ├── SlideOver.tsx    # Right slide-in panel
│   ├── Tabs.tsx         # Tab bar + panels
│   └── ToastContainer.tsx  # Toast notification stack
├── data/
│   └── mock.ts          # Faker-generated mock data + types
├── hooks/
│   └── useToast.ts      # Toast state management
└── pages/
    ├── DashboardPage.tsx
    ├── KanbanPage.tsx
    ├── LoginPage.tsx
    ├── UsersPage.tsx
    └── WizardPage.tsx
```
