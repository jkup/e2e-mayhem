# E2E Mayhem - Behavioral Specification

This document describes the intended behavior of every page and component in the application, derived entirely from source code analysis. It is designed to serve as the single source of truth for writing e2e tests.

> **Note on bugs:** Several intentional bugs exist in the code. Where the code's behavior diverges from its clearly intended behavior (based on naming, error messages, and API contracts), both the *intended* behavior and the *actual* behavior are documented. Tests should assert the **intended** behavior so they catch these bugs.

---

## Table of Contents

1. [Mock Data Reference](#1-mock-data-reference)
2. [App Shell & Routing](#2-app-shell--routing)
3. [LoginPage](#3-loginpage)
4. [DashboardPage](#4-dashboardpage)
5. [UsersPage](#5-userspage)
6. [WizardPage](#6-wizardpage)
7. [KanbanPage](#7-kanbanpage)
8. [Components](#8-components)
   - [Modal](#81-modal)
   - [SlideOver](#82-slideover)
   - [Dropdown](#83-dropdown)
   - [MultiSelect](#84-multiselect)
   - [SearchAutocomplete](#85-searchautocomplete)
   - [Tabs](#86-tabs)
   - [ToastContainer](#87-toastcontainer)
9. [useToast Hook](#9-usetoast-hook)

---

## 1. Mock Data Reference

All mock data is generated with `@faker-js/faker` v10.3.0, seeded with `faker.seed(42)`. The data is deterministic.

### 1.1 Users (50 total)

| # | Name | Email | Role | Status | Department | Join Date |
|---|------|-------|------|--------|------------|-----------|
| 0 | Traci Schowalter-Haag | Kathleen_Gerlach@yahoo.com | editor | active | Finance | 2025-07-07 |
| 1 | Louvenia Kozey | Ole.Keebler10@yahoo.com | editor | active | Sales | 2025-11-29 |
| 2 | Demetrius Gutkowski | Angel48@gmail.com | admin | pending | HR | 2023-11-27 |
| 3 | Eulah Reinger PhD | Clarence.Altenwerth66@yahoo.com | admin | inactive | Support | 2025-02-22 |
| 4 | Dr. Rozella Howe | Keyon51@hotmail.com | viewer | pending | Support | 2024-04-08 |
| 5 | Dr. Werner Hand | Rocky.Dach@gmail.com | viewer | inactive | Design | 2026-01-20 |
| 6 | Gilberto Koch | Susana9@yahoo.com | admin | active | HR | 2023-04-06 |
| 7 | Kiera Kirlin | Pauline.Kunde@gmail.com | viewer | inactive | Engineering | 2023-08-15 |
| 8 | Edgar Fadel Jr. | Juliet_Lueilwitz@yahoo.com | viewer | inactive | Support | 2024-12-10 |
| 9 | Mr. Leland Wisozk | Sheila94@hotmail.com | admin | inactive | Engineering | 2026-01-19 |
| 10 | Caesar Kulas | Evan.Blanda12@hotmail.com | admin | inactive | Design | 2024-03-24 |
| 11 | Dominick Tremblay | Kristin.Hodkiewicz32@hotmail.com | admin | active | Finance | 2024-12-20 |
| 12 | Clifford Ward | Cicero.Lang@hotmail.com | admin | inactive | Design | 2024-08-19 |
| 13 | Shawn Schumm | Nicole54@hotmail.com | editor | active | Finance | 2025-01-27 |
| 14 | Tracey McGlynn | Tony_Walker@hotmail.com | editor | inactive | HR | 2025-12-28 |
| 15 | Chase Cormier-Johns | Annalise.Treutel19@yahoo.com | editor | inactive | Engineering | 2025-07-08 |
| 16 | Stacy Bogan | Helga.Heaney@gmail.com | admin | inactive | Marketing | 2024-11-05 |
| 17 | Mallory Volkman | Clay.Mitchell38@hotmail.com | editor | pending | Marketing | 2024-11-21 |
| 18 | Mafalda Stanton | Tyree56@hotmail.com | admin | pending | Marketing | 2025-12-18 |
| 19 | Jeff Swift DDS | Davon.Grant23@hotmail.com | admin | pending | Marketing | 2024-05-05 |
| 20 | Darrin Medhurst | Carl_Stoltenberg-Schowalter55@gmail.com | editor | inactive | Design | 2025-05-11 |
| 21 | Joelle Grant | Lyle54@yahoo.com | editor | inactive | Finance | 2023-07-02 |
| 22 | Tyrone Kemmer III | Wanda.Fay@hotmail.com | editor | pending | Sales | 2026-02-03 |
| 23 | Bobbie Yost | Keenan.Larson35@hotmail.com | admin | inactive | Engineering | 2024-11-22 |
| 24 | Mafalda Luettgen | Mable.Bins@gmail.com | viewer | pending | HR | 2024-06-19 |
| 25 | Vickie O'Reilly | Jacinthe33@yahoo.com | editor | active | Support | 2025-04-23 |
| 26 | Faith Douglas | Ines94@yahoo.com | editor | inactive | Finance | 2024-11-25 |
| 27 | Donna Farrell | Jalyn.Leannon@hotmail.com | editor | inactive | Support | 2024-10-16 |
| 28 | Deshaun Kub-Schoen | Leann.Farrell@gmail.com | viewer | pending | Marketing | 2023-11-26 |
| 29 | Bennie Trantow | Audrey54@gmail.com | editor | inactive | Marketing | 2024-03-10 |
| 30 | Alfred Gislason | Elmira_Mills@gmail.com | viewer | pending | Design | 2025-12-24 |
| 31 | Jessie Nitzsche | Armando5@hotmail.com | viewer | active | Engineering | 2023-07-22 |
| 32 | Dr. Brent Kling | Jarrod89@gmail.com | viewer | active | Support | 2024-07-03 |
| 33 | Bertha Grimes-Runte | Lynda96@hotmail.com | admin | pending | Support | 2024-12-08 |
| 34 | Carol Schumm | Karen68@hotmail.com | editor | pending | Design | 2024-07-29 |
| 35 | Loren Schimmel | Aniya67@hotmail.com | admin | pending | Sales | 2023-06-04 |
| 36 | Ms. Destini Swaniawski | Bernice_Kertzmann76@hotmail.com | editor | active | HR | 2025-02-28 |
| 37 | Kenny Witting | Diana11@hotmail.com | viewer | active | Support | 2024-10-27 |
| 38 | Mr. Jesse O'Reilly | Erma39@yahoo.com | editor | active | Support | 2025-07-27 |
| 39 | Kane Haley | Kathleen_Daniel82@yahoo.com | admin | active | Marketing | 2024-07-16 |
| 40 | Dr. Bernita Koelpin | Angelina29@yahoo.com | viewer | pending | Engineering | 2026-01-29 |
| 41 | Betsy Vandervort | Joseph60@yahoo.com | editor | inactive | Support | 2024-12-18 |
| 42 | Jonas Waters | Francisco_Kunde99@gmail.com | admin | inactive | Marketing | 2024-06-03 |
| 43 | Blaze Bergstrom | Esther.Baumbach@gmail.com | viewer | inactive | HR | 2025-04-08 |
| 44 | Jacinto Connelly | Gerardo2@gmail.com | editor | active | Finance | 2023-07-16 |
| 45 | Linda Mraz | Lana_Vandervort-Reichert86@hotmail.com | viewer | active | HR | 2024-01-07 |
| 46 | Aileen Pfeffer | Hannah0@yahoo.com | viewer | pending | Marketing | 2023-03-27 |
| 47 | Tobin Ullrich | Wilfred.OConner@hotmail.com | editor | inactive | Support | 2023-05-29 |
| 48 | Hortense Hodkiewicz Jr. | Mamie66@yahoo.com | viewer | pending | Support | 2024-02-01 |
| 49 | Antoinette Larson | Gertrude.Jerde@yahoo.com | editor | active | Sales | 2026-01-29 |

**Department member counts:**
- Engineering: 6
- Design: 6
- Marketing: 9
- Sales: 4
- Support: 12
- HR: 7
- Finance: 6

### 1.2 Tasks (24 total)

| # | Title | Status | Priority | Assignee |
|---|-------|--------|----------|----------|
| 0 | If we quantify the application, we can get to the OCR system through the multi-byte SSD system! | todo | critical | Maurice Hegmann II |
| 1 | If we hack the transmitter, we can get to the VGA matrix through the optical XSS card! | done | high | Carolyn Raynor |
| 2 | copying the port won't do anything, we need to navigate the online VGA card! | review | low | Clara Grady V |
| 3 | generating the alarm won't do anything, we need to program the digital PNG bandwidth! | done | low | Dianne Rempel I |
| 4 | Use the haptic PCI program, then you can parse the virtual panel! | todo | medium | Russell Reinger |
| 5 | You can't quantify the microchip without connecting the redundant SMS matrix! | in-progress | low | Hugo Hartmann |
| 6 | Use the auxiliary API circuit, then you can navigate the wireless array! | review | medium | Sammie Breitenberg |
| 7 | We need to compress the optical EXE array! | review | low | Quinten Watsica |
| 8 | Try to override the UTF8 port, maybe it will connect the auxiliary feed! | done | critical | Edmund Friesen |
| 9 | If we back up the interface, we can get to the ADP bandwidth through the primary SQL array! | todo | high | Antonio Feest |
| 10 | We need to program the cross-platform SMS alarm! | todo | critical | Ben Schneider I |
| 11 | I'll calculate the redundant SSL port, that should program the RSS interface! | review | high | Lora Krajcik |
| 12 | If we back up the firewall, we can get to the API alarm through the haptic SMTP card! | done | critical | Annamae Zulauf |
| 13 | Try to generate the DRAM system, maybe it will input the online system! | review | high | Mattie Hintz Sr. |
| 14 | I'll override the auxiliary AGP microchip, that should sensor the IP sensor! | in-progress | critical | Stewart Wiza |
| 15 | I'll bypass the back-end DNS driver, that should protocol the TCP bandwidth! | todo | high | Miss Bertha Haag |
| 16 | We need to override the neural DRAM driver! | todo | critical | Waino Conroy |
| 17 | You can't program the microchip without generating the multi-byte COM transmitter! | review | critical | Angel Lubowitz |
| 18 | We need to parse the cross-platform VGA microchip! | in-progress | critical | Meghan Zboncak |
| 19 | Try to copy the IB sensor, maybe it will parse the solid state sensor! | todo | high | Jerome Mertz |
| 20 | Use the virtual GB transmitter, then you can transmit the redundant card! | review | medium | Ron Kreiger |
| 21 | Use the open-source VGA driver, then you can hack the auxiliary matrix! | todo | medium | Rose Johnston |
| 22 | Use the 1080p HDD alarm, then you can transmit the cross-platform transmitter! | done | medium | Leroy Pfeffer |
| 23 | Try to copy the AGP alarm, maybe it will back up the online port! | in-progress | high | Rosie Fahey |

**Task distribution:**
- todo: 8 (33%)
- in-progress: 4 (17%)
- review: 7 (29%)
- done: 5 (21%)

**Priority breakdown:**
- critical: 8 (33%)
- high: 7 (29%)
- medium: 5 (21%)
- low: 4 (17%)

### 1.3 Notifications (10 total)

| # | ID | Message | Type | Read |
|---|----|---------|------|------|
| 0 | de175d13-... | Valde vehemens clibanus calculus cunctatio. | info | false |
| 1 | ad62b5a4-... | Toties adhaero validus. | error | true |
| 2 | c4d12fad-... | Conatus delego abutor aggredior caute acsi quos cursim infit ater. | success | false |
| 3 | 0e998119-... | Iusto conicio appono alius tripudio versus sol amet. | success | false |
| 4 | 10b5408d-... | Statim comburo appello ratione aperiam nesciunt suadeo subseco. | error | true |
| 5 | b920479d-... | Sustineo copia saepe deleniti auditor subvenio iure. | success | true |
| 6 | 50cb5a6c-... | Aduro torqueo vilicus sodalitas virtus argentum demoror pauper. | warning | true |
| 7 | 262b3089-... | Charisma vilicus ante utique voluntarius atqui suppono adhaero cultura. | warning | false |
| 8 | a7cf0f1d-... | Hic pecco bos quidem mollitia audacia adulatio peccatus tenax eos. | info | true |
| 9 | 72236068-... | Antepono anser earum cariosus. | success | false |

**Unread notifications (read=false):** 5 (indices 0, 2, 3, 7, 9)
**Read notifications (read=true):** 5 (indices 1, 4, 5, 6, 8)

### 1.4 Searchable Items

The `searchableItems` array contains:
- 50 entries of type `"user"` with `label=user.name` and `sub=user.email`
- 7 entries of type `"department"` with `label=departmentName` and `sub="N members"`:
  - Engineering: "6 members"
  - Design: "6 members"
  - Marketing: "9 members"
  - Sales: "4 members"
  - Support: "12 members"
  - HR: "7 members"
  - Finance: "6 members"

Total: 57 searchable items.

---

## 2. App Shell & Routing

### 2.1 Auth Gate

- **Initial state:** `loggedIn` is `false`. The app renders `<LoginPage>` inside `<BrowserRouter>`.
- **After login:** When `LoginPage` calls `onLogin(email)`, the app sets `loggedIn=true` and renders `<AppShell>`.
- **No persistence:** Login state is in-memory React state only. Page refresh resets to logged-out.

### 2.2 Sidebar

- **Test ID:** `data-testid="sidebar"`
- **Initial state:** Sidebar is expanded (`sidebarOpen=true`), width class `w-56`.
- **When expanded:** Shows "E2E Mayhem" brand text and navigation labels.
- **When collapsed:** Width class `w-16`. Brand text and nav labels are hidden; only icons are shown.
- **Toggle button:**
  - `data-testid="toggle-sidebar"`
  - `aria-label="Collapse sidebar"` when expanded
  - `aria-label="Expand sidebar"` when collapsed
  - Shows `◀` when expanded, `▶` when collapsed

### 2.3 Navigation Items

Four nav links, each rendered as `<NavLink>`:

| test ID | Path | Label | Icon |
|---------|------|-------|------|
| `nav-dashboard` | `/dashboard` | Dashboard | ▦ |
| `nav-users` | `/users` | Users | 👤 |
| `nav-wizard` | `/wizard` | Wizard | 📝 |
| `nav-kanban` | `/kanban` | Kanban | ☰ |

- **Active link:** Has classes `bg-gray-800 text-white`.
- **Inactive link:** Has classes `text-gray-400 hover:text-white hover:bg-gray-800/50`.

### 2.4 Routing

- `/dashboard` -> DashboardPage
- `/users` -> UsersPage
- `/wizard` -> WizardPage
- `/kanban` -> KanbanPage
- `*` (any other path) -> `<Navigate to="/dashboard" replace />`

**Intended behavior:** After login, the user should land on `/dashboard` (any unknown route redirects there).

### 2.5 Top Bar

- `data-testid="topbar"`
- Contains: SearchAutocomplete, Notifications button, User menu dropdown

#### Notifications Button
- `data-testid="notifications-btn"`
- `aria-label="Notifications"`
- Badge displays `0` (hardcoded, not derived from actual unread count)
- On click: shows toast "You have 3 unread notifications" (type: info)

#### User Menu
- `data-testid="user-menu"` (Dropdown component)
- Trigger: `data-testid="user-menu-trigger"`, shows avatar circle with "JD" and "John Doe" text
- Menu items:
  - Item 0: "Profile" -> toast "Profile clicked" (info)
  - Item 1: "Settings" -> toast "Settings clicked" (info)
  - Item 2: "Theme" -> has submenu:
    - Sub-item 0: "Light" -> toast "Light theme selected" (info)
    - Sub-item 1: "Dark" -> toast "Dark theme selected" (info)
    - Sub-item 2: "System" -> toast "System theme selected" (info)
  - Item 3: "Sign Out" -> `window.location.reload()` (danger styling). This reloads the page, which resets all in-memory state back to login screen.

#### Search Autocomplete (Top Bar)
- Uses the global `searchableItems` list (57 items).
- On select: shows toast "Selected: {item.label}" (type: info).

---

## 3. LoginPage

### 3.1 Structure

- `data-testid="auth-form"` wraps the entire form.
- Heading: "Sign In" (default) or "Create Account" (signup mode).
- Form has `noValidate` attribute (browser validation disabled).

### 3.2 Fields

| Field | Test ID | Type | Placeholder |
|-------|---------|------|-------------|
| Email | `email-input` | email | you@example.com |
| Password | `password-input` | password (toggleable) | (bullet dots) |
| Confirm Password | `confirm-password-input` | password | (bullet dots) |

- **Confirm Password** is only rendered when `isSignup=true`.

### 3.3 Password Visibility Toggle

- `data-testid="toggle-password"`
- **Intended aria-label behavior:** Should be "Hide password" when password is hidden and "Show password" when password is visible.
- **BUG (actual):** The labels are swapped. When `showPassword=false` (password hidden), `aria-label="Show password"` - but the code reads `aria-label={showPassword ? 'Show password' : 'Hide password'}`, so when `showPassword=false`, the label is "Hide password" (wrong). When `showPassword=true`, the label is "Show password" (wrong).
- **Intended behavior:** `aria-label` should say "Hide password" when the password is currently visible (and clicking would hide it), and "Show password" when the password is currently hidden (and clicking would show it).
- Button text: Shows "Show" when password is hidden, "Hide" when password is visible. The *text* is correct.
- When toggled: input type changes between `password` and `text`.

### 3.4 Validation

Validation runs on form submit (not on blur/change).

#### Email validation:
1. Empty -> error "Email is required" (`data-testid="email-error"`)
2. Fails regex `/\S+@\S+\.\S+/` -> error "Invalid email address"
3. Valid examples: "a@b.c" passes, "foo" fails, "@." fails

#### Password validation:
- **Intended behavior:** Password must be at least 6 characters (the error message says "Password must be at least 6 characters").
- **BUG (actual):** The code checks `password.length < 2`, so it actually accepts passwords of 2+ characters. A password of length 2, 3, 4, or 5 will pass validation but should not.
- Empty -> error "Password is required" (`data-testid="password-error"`)
- Too short -> error "Password must be at least 6 characters"

#### Confirm Password validation:
- **No validation is implemented** for the confirm password field. The signup mode renders the field but `validate()` never checks it. A user can submit with mismatched passwords.
- **Intended behavior:** The confirm password field should validate that it matches the password field.

### 3.5 Submit

- `data-testid="submit-btn"`
- Text: "Sign In" (login mode) or "Create Account" (signup mode)
- On valid submit: calls `onLogin(email)` which sets `loggedIn=true` in App.
- **Note:** `onLogin` is typed as `(email: string) => void` in the interface but App calls it as `() => setLoggedIn(true)` (ignoring the email parameter).

### 3.6 Auth Mode Toggle

- `data-testid="toggle-auth-mode"`
- In login mode: text "Don't have an account? Sign up"
- In signup mode: text "Already have an account? Sign in"
- Toggling clears all validation errors.
- Toggling does NOT clear the email/password field values.

### 3.7 Error Display

- Error messages appear below each field.
- Error fields have `border-red-500` class on the input.
- Non-error fields have `border-gray-300`.
- Errors are cleared on next submit attempt (replaced by new validation result).

---

## 4. DashboardPage

### 4.1 Stats Cards

- `data-testid="stats-grid"` contains 4 stat cards.

| Card test ID | Label | Value | Change |
|-------------|-------|-------|--------|
| `stat-card-total-users` | Total Users | 50 | +12% |
| `stat-card-active-tasks` | Active Tasks | 19 | -3% |
| `stat-card-completed` | Completed | 5 | +28% |
| `stat-card-notifications` | Notifications | 5 | (empty string, no change text shown) |

- Stats are computed once at module level from the mock data and do NOT update when notifications are marked as read (the `stats` array captures the initial count).
- Change text format: "{change} from last month" (e.g., "+12% from last month").
- Positive changes (`+`) have class `text-green-600`.
- Negative changes (`-`) have class `text-red-600`.
- The Notifications card has `change: ''`, so no change text is rendered (the `{stat.change && ...}` guard prevents it).

### 4.2 Activity Feed

- `data-testid="activity-feed"` contains 10 notification items.
- Each item: `data-testid="activity-item-{notification.id}"`
- Unread items (`read=false`): no `opacity-60` class, shows "Mark read" button (`data-testid="mark-read-{id}"`)
- Read items (`read=true`): has `opacity-60` class, no "Mark read" button.

#### Mark as Read (single)
- Clicking `mark-read-{id}` sets that notification's `read` to `true`.
- The "Mark read" button disappears for that item.
- The item gains `opacity-60`.

#### Mark All Read
- `data-testid="mark-all-read"` button text: "Mark all as read"
- **Intended behavior:** Should set all notifications to `read=true`.
- **BUG (actual):** The `markAllRead` function sets `read: false` for all notifications (instead of `read: true`). So clicking "Mark all as read" actually marks all as UNREAD. All items lose `opacity-60` and all gain "Mark read" buttons.
- **Code:** `setNotifications(prev => prev.map(n => ({ ...n, read: false })));`

#### Notification type indicators (colored dots):
- `error` -> `bg-red-500`
- `warning` -> `bg-yellow-500`
- `success` -> `bg-green-500`
- `info` -> `bg-blue-500`

### 4.3 Task Distribution Chart

- `data-testid="chart-placeholder"` contains the bar chart.
- Title: "Task Distribution"
- Four bars, one per status:

| Bar test ID | Status | Count | Height % |
|-------------|--------|-------|----------|
| `bar-todo` | todo | 8 | 33.33% |
| `bar-in-progress` | in-progress | 4 | 16.67% |
| `bar-review` | review | 7 | 29.17% |
| `bar-done` | done | 5 | 20.83% |

- Each bar has `title="{status}: {count}"` (e.g., `title="todo: 8"`).
- Bar height is `(count / 24) * 100`%.
- Labels appear below each bar as text.

### 4.4 Priority Breakdown

- `data-testid="priority-breakdown"`
- Title: "Priority Breakdown"
- Four progress bars, in order: critical, high, medium, low.

| Priority | Count | Percentage (rounded) | Color | Progress bar test ID |
|----------|-------|---------------------|-------|---------------------|
| critical | 8 | 33% | `bg-red-500` | `progress-critical` |
| high | 7 | 29% | `bg-orange-500` | `progress-high` |
| medium | 5 | 21% | `bg-yellow-500` | `progress-medium` |
| low | 4 | 17% | `bg-green-500` | `progress-low` |

- Each row shows: priority name (capitalized), count, and percentage in format "{count} ({pct}%)".
- Progress bar width is set to `{pct}%`.

---

## 5. UsersPage

### 5.1 Overview

The Users page displays a filterable, sortable, paginated table of 50 users with bulk actions, per-row actions, a slide-over detail panel, and a delete confirmation modal.

### 5.2 Search

- `data-testid="user-search"`
- Placeholder: "Search by name or email..."
- **Search is case-sensitive** (uses `String.includes()` without case conversion).
- Filters by `user.name` or `user.email` containing the search string.
- Changing search resets page to 1.

### 5.3 Filters

- `data-testid="filters"` wraps all filter controls.
- **Department filter:** `data-testid="dept-filter"` (MultiSelect component)
  - Options: sorted unique departments from mock data: `["Design", "Engineering", "Finance", "HR", "Marketing", "Sales", "Support"]`
  - Placeholder: "Filter departments"
- **Role filter:** `data-testid="role-filter"` (MultiSelect component)
  - Options: `["admin", "editor", "viewer"]`
  - Placeholder: "Filter roles"
- Changing any filter resets page to 1.
- **Clear filters button:** `data-testid="clear-filters"` appears only when any filter is active (search text, department selection, or role selection). Clicking it clears all three and resets page to 1.

### 5.4 Results Count

- `data-testid="results-count"` shows "{N} user(s) found" where N is the count of filtered users.
- Default (no filters): "50 user(s) found".

### 5.5 Sorting

The table has sortable columns. Clicking a column header toggles sort.

#### Sort headers:

| Test ID | Label | Sort Key |
|---------|-------|----------|
| `sort-name` | Name | name |
| `sort-email` | Email | email |
| `sort-role` | Role | role |
| `sort-status` | Status | status |
| `sort-department` | Department | department |
| `sort-joinDate` | Joined | joinDate |

#### Sort behavior:
- Default sort: `sortKey='name'`, `sortDir='asc'`.
- Clicking the current sort column toggles direction (`asc` <-> `desc`).
- Clicking a different column sets that as sort key with `sortDir='asc'`.
- Active sort column shows arrow indicator: `↑` for asc, `↓` for desc.

#### Sort direction BUG:
- **Intended behavior:** `sortDir='asc'` should sort ascending (A->Z, smallest first).
- **BUG (actual):** The sort comparator is inverted. The code does:
  ```
  const cmp = av < bv ? -1 : av > bv ? 1 : 0;
  return sortDir === 'asc' ? -cmp : cmp;
  ```
  This means `'asc'` returns `-cmp` which is actually **descending** order (Z->A). And `'desc'` returns `cmp` which is actually **ascending** order (A->Z).

### 5.6 Pagination

- Page size: 10 rows per page.
- Default page: 1.
- `data-testid="pagination"` wraps pagination controls.
- Text: "Page {page} of {totalPages}".
- `data-testid="prev-page"` - Previous button, disabled when `page === 1`.
- `data-testid="next-page"` - Next button, disabled when `page === totalPages`.
- Page number buttons: `data-testid="page-{n}"`, up to 5 shown. Active page has `bg-blue-600 text-white` classes.
- With 50 users unfiltered: `totalPages = 5`.

#### Pagination BUG:
- **Intended behavior:** Page 1 should show the first 10 results, page 2 the next 10, etc.
- **BUG (actual):** The slice formula is `filtered.slice(page * pageSize, page * pageSize + pageSize)`. Since `page` starts at 1 (not 0), page 1 shows `slice(10, 20)` — the *second* group of 10 results. The first 10 results (indices 0-9) are never visible because no page maps to `slice(0, 10)`.
- Page 1 actually shows items 10-19, page 2 shows items 20-29, etc.
- Page 5 shows items 50-59 (which is nothing since there are only 50 items), so page 5 would be empty.
- Effectively only items at indices 10-49 are visible (40 of 50 users), and the first 10 are inaccessible.

### 5.7 Table

- `data-testid="users-table"`
- Columns: Checkbox, Name, Email, Role, Status, Department, Joined, Actions

#### Row rendering:
- Each row: `data-testid="user-row-{user.id}"`
- Clicking a row opens the slide-over for that user.
- Checkbox click has `stopPropagation()` so it doesn't open the slide-over.
- Actions click has `stopPropagation()` so it doesn't open the slide-over.

#### Role badges:
- `admin` -> `bg-purple-100 text-purple-800`
- `editor` -> `bg-blue-100 text-blue-800`
- `viewer` -> `bg-gray-100 text-gray-800`

#### Status badges:
- `active` -> `bg-green-100 text-green-800`
- `inactive` -> `bg-red-100 text-red-800`
- `pending` -> `bg-yellow-100 text-yellow-800`

### 5.8 Row Selection

#### Individual selection:
- `data-testid="select-{user.id}"` checkbox
- `aria-label="Select {user.name}"`
- Toggles that user's ID in the `selectedIds` set.

#### Select All:
- `data-testid="select-all"` checkbox
- `aria-label="Select all"`
- `checked` is true when all currently paged users are selected.
- **Intended behavior:** Clicking "Select all" when not all are selected should select ALL users on the current page.
- **BUG (actual):** The `toggleSelectAll` function only adds `paged[0].id` (the first user on the page) instead of all users. When deselecting, it correctly removes all paged users.
- **Code:** `n.add(paged[0].id)` instead of `paged.forEach(u => n.add(u.id))`

### 5.9 Bulk Actions

- `data-testid="bulk-actions"` (Dropdown component) - only visible when `selectedIds.size > 0`.
- Trigger button text: "Bulk Actions ({N})" where N is the count of selected users.
- Items:
  - Item 0: "Activate" -> toast "{action} applied to {N} user(s)" (success)
  - Item 1: "Deactivate" -> toast (success)
  - Item 2: "Delete" -> toast (success), danger styling
  - Item 3: "Change Role" -> submenu:
    - Sub-item 0: "Admin" -> toast "Set role to Admin applied to {N} user(s)" (success)
    - Sub-item 1: "Editor" -> toast "Set role to Editor applied to {N} user(s)" (success)
    - Sub-item 2: "Viewer" -> toast "Set role to Viewer applied to {N} user(s)" (success)
- **Note:** Bulk actions only show toasts. They do NOT actually modify user data. The selected IDs are also NOT cleared after a bulk action.

### 5.10 Per-Row Actions

- `data-testid="user-actions-{user.id}"` (Dropdown component)
- Trigger: button with `aria-label="Actions for {user.name}"`, shows "..." (ellipsis).
- Items:
  - Item 0: "View Details" -> opens slide-over for that user
  - Item 1: "Edit" -> toast "Editing {user.name}" (info)
  - Item 2: "Delete" -> opens delete confirmation modal, danger styling

### 5.11 User Detail Slide-Over

- Opens when clicking a row or selecting "View Details" from the row action dropdown.
- Title: the user's name.
- Contains a Tabs component (`data-testid="user-detail-tabs"`) with 3 tabs:

#### Tab 0: Profile
- Shows: Email, Role (capitalized), Status (capitalized), Department, Joined (joinDate)
- Each field has a gray label and a value paragraph.

#### Tab 1: Activity
- Shows text "Recent activity for {user.name}"
- Four hardcoded activity items:
  - "Logged in -- 1d ago"
  - "Updated profile -- 2d ago"
  - "Uploaded a file -- 3d ago"
  - "Commented on a task -- 4d ago"

#### Tab 2: Permissions
- Shows text "Permissions for {user.role}"
- Four permission checkboxes:
  - "Read content" - checked for all roles
  - "Write content" - checked for admin and editor
  - "Manage users" - checked for admin only
  - "Admin settings" - checked for admin only
- Checkbox checked logic: `defaultChecked={i < (role === 'admin' ? 4 : role === 'editor' ? 2 : 1)}`
  - admin: indices 0,1,2,3 checked (all 4)
  - editor: indices 0,1 checked (first 2)
  - viewer: index 0 checked (first 1 only)

### 5.12 Delete Confirmation Modal

- Opens when "Delete" is clicked from a row's action dropdown.
- Title: "Confirm Delete"
- Body: "Are you sure you want to delete **{user.name}**? This action cannot be undone."
- Footer buttons:
  - `data-testid="cancel-delete"` - "Cancel" - closes modal
  - `data-testid="confirm-delete"` - "Delete" - shows toast "Deleted {user.name}" (error type), closes modal
- **Note:** Delete does NOT actually remove the user from the data. It only shows a toast.

---

## 6. WizardPage

### 6.1 Overview

A 4-step registration wizard with validation, review, and submit.

### 6.2 Step Indicator

- `data-testid="wizard-steps"` wraps the step indicators.
- Steps: `["Personal Info", "Company", "Plan", "Review"]` (indices 0-3).
- Each step: `data-testid="wizard-step-{i}"`
- Step styling:
  - **Completed step (i < step - 1):** BUG - see below. Intended: completed steps should show checkmark and have `bg-blue-600 text-white`.
  - **BUG (actual):** The condition is `i < step - 1` instead of `i < step`. This means:
    - At step 0: no steps are completed (correct since none are before step 0).
    - At step 1: `i < 0` is never true, so step 0 does NOT show as completed even though the user passed it.
    - At step 2: only step 0 (i=0, 0 < 1) shows as completed. Step 1 does not.
    - At step 3: steps 0 and 1 show as completed. Step 2 does not.
  - **Current step (i === step):** Has `bg-blue-100 text-blue-700 ring-2 ring-blue-600`. Shows the step number.
  - **Future step:** Has `bg-gray-100 text-gray-400`. Shows the step number.
- Completed steps show checkmark `✓` instead of step number. Future/current steps show `i + 1`.
- Step labels appear next to each circle. Current step label: `text-gray-900 font-medium`. Other steps: `text-gray-400`.

### 6.3 Step 0: Personal Info

- `data-testid="wizard-content"` wraps the step content.
- Heading: "Personal Information"
- Fields:

| Field | Test ID | Type | Required |
|-------|---------|------|----------|
| First Name | `wizard-firstName` | text | Yes |
| Last Name | `wizard-lastName` | text | Yes |
| Email | `wizard-email` | email | Yes |
| Phone | `wizard-phone` | tel | No (label: "Phone (optional)") |

- Validation on "Next":
  - `firstName` empty -> error "Required" (`data-testid="wizard-firstName-error"`)
  - `lastName` empty -> error "Required" (`data-testid="wizard-lastName-error"`)
  - `email` empty -> error "Required" (`data-testid="wizard-email-error"`)
  - `email` fails regex `/\S+@\S+\.\S+/` -> error "Invalid email"
  - `phone` has no validation.
- Errors clear individually when the associated field is changed.

### 6.4 Step 1: Company

- Heading: "Company Details"
- Fields:

| Field | Test ID | Type | Required |
|-------|---------|------|----------|
| Company Name | `wizard-company` | text | Intended yes, actually no (see bug) |
| Job Title | `wizard-jobTitle` | text | No (label: "Job Title (optional)") |

- **Validation BUG:** The company validation checks `step === 99` instead of `step === 1`. This means the company name is **never validated** -- the user can proceed from step 1 with an empty company name.
- **Intended behavior:** Company Name should be required (the validation code exists but is gated on the wrong step number).

### 6.5 Step 2: Plan

- Heading: "Choose Your Plan"
- Three plan options:

| Plan | Test ID | Price |
|------|---------|-------|
| starter | `wizard-plan-starter` | $9/mo |
| pro | `wizard-plan-pro` | $29/mo |
| enterprise | `wizard-plan-enterprise` | $99/mo |

- Default selected plan: `starter`.
- Selected plan has `border-blue-600 bg-blue-50`. Unselected: `border-gray-200`.
- **Add-ons** (checkboxes, none checked by default):

| Add-on | Test ID |
|--------|---------|
| Priority Support | `wizard-addon-priority-support` |
| API Access | `wizard-addon-api-access` |
| Custom Domain | `wizard-addon-custom-domain` |
| Analytics Dashboard | `wizard-addon-analytics-dashboard` |
| SSO Integration | `wizard-addon-sso-integration` |

- Checking an add-on adds it to `form.addons` array. Unchecking removes it.
- No validation on this step (clicking Next always proceeds).

### 6.6 Step 3: Review & Confirm

- Heading: "Review & Confirm"
- `data-testid="wizard-review"` shows a summary of all entered data:
  - Name: displayed as `{lastName} {firstName}` (**Note:** last name comes first -- this may be intentional or a bug depending on cultural convention, but the field order is reversed from typical Western name display)
  - Email
  - Phone (only shown if non-empty)
  - Company
  - Job Title (only shown if non-empty)
  - Plan (capitalized)
  - Add-ons (comma-separated, only shown if any selected)

- **Agree to Terms checkbox:**
  - `data-testid="wizard-agree"`
  - Label: "I agree to the Terms of Service and Privacy Policy"
  - Validation: if unchecked on submit -> error "You must agree to the terms" (`data-testid="wizard-agree-error"`)

### 6.7 Navigation

- `data-testid="wizard-nav"` wraps navigation buttons.
- `data-testid="wizard-prev"` - "Back" button, disabled at step 0 (`disabled:opacity-50`).
- `data-testid="wizard-next"` - "Next" button, shown on steps 0-2.
- `data-testid="wizard-submit"` - "Submit" button, shown only on step 3 (replaces Next).
- "Next" runs validation for the current step. If valid, advances to next step.
- "Back" always goes back one step (no validation).
- "Submit" validates step 3 (agree to terms) and if valid, sets `submitted=true` and shows toast "Registration submitted successfully!" (success).

### 6.8 Success Screen

- `data-testid="wizard-success"`
- Shows checkmark character (&#10003;).
- Heading: "Registration Complete!"
- Text: "Welcome, {firstName}. Your {plan} plan is being set up."
- `data-testid="wizard-restart"` button: "Start Over"
  - Resets: `submitted=false`, `step=0`, form to initial values.

---

## 7. KanbanPage

### 7.1 Overview

A drag-and-drop Kanban board with 4 columns and 24 initial tasks.

### 7.2 Board Layout

- `data-testid="kanban-board"` - grid with 4 columns.
- Columns (in order):

| Column | Test ID | Label | Initial Task Count |
|--------|---------|-------|--------------------|
| todo | `column-todo` | To Do | 8 |
| in-progress | `column-in-progress` | In Progress | 4 |
| review | `column-review` | Review | 7 |
| done | `column-done` | Done | 5 |

- Each column header shows: "{Label} ({count})" where count updates dynamically.

### 7.3 Task Cards

- Each card: `data-testid="task-card-{task.id}"`
- Card displays:
  - Title (full text)
  - Priority badge (colored): critical=`bg-red-100 text-red-800`, high=`bg-orange-100 text-orange-800`, medium=`bg-yellow-100 text-yellow-800`, low=`bg-green-100 text-green-800`
  - Assignee first name only (`assignee.split(' ')[0]`)
- Left border color by priority: critical=`border-l-red-500`, high=`border-l-orange-500`, medium=`border-l-yellow-500`, low=`border-l-green-500`
- Cards have `cursor-grab` class (and `active:cursor-grabbing` during drag).

### 7.4 Add Task

- Each column has an add button: `data-testid="add-task-{col}"` (e.g., `add-task-todo`)
- `aria-label="Add task to {columnLabel}"` (e.g., "Add task to To Do")
- Clicking opens an inline form:
  - `data-testid="new-task-form"`
  - `data-testid="new-task-input"` - text input with placeholder "Task title...", `autoFocus`
  - `data-testid="save-new-task"` - "Add" button
  - `data-testid="cancel-new-task"` - "Cancel" button
- Pressing Enter on the input also submits.
- Only one add form can be open at a time (opening another closes the previous).
- Empty title is rejected (the function returns early if `!newTitle.trim()`).

#### Add Task BUG:
- **Intended behavior:** The `addTask` function receives a `_status` parameter indicating which column the task should be added to.
- **BUG (actual):** The function ignores the `_status` parameter and hardcodes `status: 'todo'` for all new tasks. So adding a task to the "In Progress" column actually creates it in the "To Do" column.
- **Code:** `const task: Task = { ..., status: 'todo', ... };`
- New tasks always have `priority: 'medium'` and `assignee: 'You'`.
- On successful add: toast "Created task: {title}" (success), form closes, input clears.

### 7.5 Drag and Drop

- Uses `@dnd-kit` with `PointerSensor` (activation distance: 5px).
- Collision detection: `closestCenter`.
- When a task is dragged and dropped onto another task in a different column, the dragged task's status changes to match the target column.
- Toast: `Moved "{title (first 30 chars)}..." to {columnLabel}` (info).
- Dragging within the same column: no status change (early return).
- During drag, the dragged card has `opacity: 0.5`.

### 7.6 Task Detail Modal

- Opens on clicking a task card.
- Title: "Task Details"
- `data-testid="task-detail"` wraps the content.
- Shows:
  - Title
  - Description (or "No description" if empty)
  - Status (capitalized)
  - Priority (capitalized)
  - Assignee (full name)
- **Move to dropdown:**
  - `data-testid="task-move-select"` (`<select>`)
  - Options: To Do, In Progress, Review, Done
  - Default value: current task status.
  - Changing updates the task's status in the state.
  - Shows toast "Moved to {columnLabel}" (info).
  - **Note:** The modal does NOT close after moving. The `selectedTask` object is not updated in the modal's local reference, so the displayed status/priority in the modal remains stale until the modal is closed and reopened. However, the dropdown's `value` is bound to `selectedTask.status` which is the old reference.

---

## 8. Components

### 8.1 Modal

**File:** `src/components/Modal.tsx`

- Renders nothing when `open=false`.
- When `open=true`:
  - `data-testid="modal-overlay"` - full-screen overlay with `bg-black/50`, `z-40`.
  - `data-testid="modal"` - dialog container.
    - `role="dialog"`
    - `aria-modal="true"`
    - `aria-label="{title}"`
  - `data-testid="modal-close"` - close button (x), `aria-label="Close modal"`.
  - Optional `footer` rendered in a `bg-gray-50` bar at the bottom.

#### Close behavior:
- Close button click: calls `onClose`.
- **Escape key BUG:**
  - **Intended behavior:** Pressing Escape should close the modal.
  - **BUG (actual):** The keydown handler checks `e.key === 'Esc'` but the correct key value is `'Escape'`. So pressing Escape does NOT close the modal.
- **Backdrop click BUG:**
  - **Intended behavior:** Clicking the backdrop (overlay) should close the modal.
  - **BUG (actual):** The click handler is `if (e.target !== overlayRef.current) onClose()`. This closes the modal when clicking INSIDE the dialog (on children of the overlay), but NOT when clicking the overlay itself. The condition is inverted -- it should be `e.target === overlayRef.current`.

### 8.2 SlideOver

**File:** `src/components/SlideOver.tsx`

- Always renders the slide panel in the DOM (for CSS transition).
- When `open=false`: panel has `translate-x-full` (off-screen right). No backdrop rendered.
- When `open=true`: panel has `translate-x-0` (visible). Backdrop rendered.

**Structure:**
- `data-testid="slideover-backdrop"` - backdrop with `bg-black/30`, `z-30`. Only rendered when open.
- `data-testid="slideover"` - panel.
  - `role="dialog"`
  - `aria-label="{title}"`
  - Max width: `max-w-md`
  - `z-40`
- `data-testid="slideover-close"` - close button, `aria-label="Close panel"`.

**Close behavior:**
- Close button: calls `onClose`.
- Backdrop click: calls `onClose`.
- Escape key: calls `onClose` (correctly checks `e.key === 'Escape'`).

**Note:** The SlideOver does NOT have `aria-modal`. This is a difference from the Modal component.

### 8.3 Dropdown

**File:** `src/components/Dropdown.tsx`

**Structure:**
- `data-testid="{testId}"` - wrapper div (default testId: "dropdown").
- `data-testid="{testId}-trigger"` - trigger wrapper.
- `data-testid="{testId}-menu"` - dropdown menu (only when open).
- `data-testid="{testId}-item-{i}"` - menu item buttons.
- `data-testid="{testId}-submenu-{i}"` - submenu container (when parent item has children and is hovered).
- `data-testid="{testId}-subitem-{i}-{j}"` - submenu item buttons.

**Behavior:**
- Clicking trigger toggles `open` state.
- Clicking an item calls its `onClick` and closes the dropdown.
- Hovering over an item with `children` opens its submenu (`submenuIndex` set to that item's index).
- Hovering over an item without `children` closes any open submenu.
- Click outside (mousedown) closes the dropdown and clears submenu.
- Items with `danger: true` have `text-red-600` class.
- Items with `children` show a `›` arrow.

**Accessibility note:** The dropdown does NOT use `role="menu"` or `role="menuitem"`. No keyboard navigation (arrow keys) is implemented.

### 8.4 MultiSelect

**File:** `src/components/MultiSelect.tsx`

**Structure:**
- `data-testid="{testId}"` - wrapper (default: "multiselect").
- `data-testid="{testId}-trigger"` - trigger area showing selected pills or placeholder.
- `data-testid="{testId}-dropdown"` - dropdown panel (only when open).
- `data-testid="{testId}-search"` - search input inside dropdown.
- `data-testid="{testId}-option-{option}"` - each option label.
- `data-testid="{testId}-remove-{s}"` - remove button on selected pill.

**Behavior:**
- Click trigger toggles open/closed.
- When no items selected: shows placeholder text.
- When items selected: shows tag pills with "x" remove buttons.
  - Remove button `aria-label="Remove {optionName}"`.
  - Remove button click has `stopPropagation()` (doesn't toggle dropdown).
- Dropdown has a search input (autoFocus) that filters options (case-insensitive).
- Each option has a checkbox. Clicking toggles selection.
- If search returns no results: shows "No results" text.
- Click outside closes dropdown.

### 8.5 SearchAutocomplete

**File:** `src/components/SearchAutocomplete.tsx`

**Structure:**
- `data-testid="{testId}"` - wrapper (default: "search-autocomplete").
- `data-testid="{testId}-input"` - search input.
  - `aria-label="Search"`
  - `role="combobox"`
  - `aria-expanded={open && filtered.length > 0}`
  - `aria-autocomplete="list"`
  - Placeholder: "Search users, departments..."
- `data-testid="{testId}-results"` - results list (only when open and results exist).
  - `role="listbox"`
- `data-testid="{testId}-result-{i}"` - individual result items.
  - `role="option"`
  - `aria-selected={i === activeIndex}`

**Filtering:**
- Results appear when query length >= 1.
- Filters by `item.label` or `item.sub` containing the query (case-insensitive).
- Maximum 8 results shown (`slice(0, 8)`).

**Keyboard navigation BUG:**
- **Intended behavior:** ArrowDown should move the selection DOWN the list (increasing index), ArrowUp should move UP (decreasing index).
- **BUG (actual):** The key handlers are swapped:
  - ArrowDown: `setActiveIndex(prev => Math.max(prev - 1, -1))` -- this DECREASES the index (moves UP).
  - ArrowUp: `setActiveIndex(prev => Math.min(prev + 1, filtered.length - 1))` -- this INCREASES the index (moves DOWN).
- Enter (when `activeIndex >= 0`): selects the item at `activeIndex`, clears query, closes dropdown.
- Escape: closes dropdown.

**Mouse interaction:**
- `onMouseEnter` on a result sets `activeIndex` to that index.
- Clicking a result: calls `onSelect`, clears query, closes dropdown.

**Result item display:**
- Line 1: `item.label` (bold)
- Line 2: `{item.type} · {item.sub}`

**Click outside:** Closes dropdown (mousedown handler).

**Focus behavior:** Focusing the input when query >= 1 character reopens the dropdown.

### 8.6 Tabs

**File:** `src/components/Tabs.tsx`

**Structure:**
- `data-testid="{testId}"` - wrapper (default: "tabs").
- Tab bar: `role="tablist"`.
- `data-testid="{testId}-tab-{i}"` - individual tab buttons.
  - `role="tab"`
  - `aria-selected={i === active}` (boolean: `true` or `false`)
- `data-testid="{testId}-panel"` - content panel.
  - `role="tabpanel"`

**Behavior:**
- Initially active tab: index 0.
- Clicking a tab sets it as active.
- Active tab: `border-blue-500 text-blue-600` with `border-b-2`.
- Inactive tab: `border-transparent text-gray-500`.
- Only the active tab's content is rendered in the panel.

**Accessibility:**
- `aria-selected="true"` on the active tab, `aria-selected="false"` on all others.
- No `aria-labelledby` or `aria-controls` linking between tabs and panel.
- No keyboard navigation (arrow keys).

### 8.7 ToastContainer

**File:** `src/components/ToastContainer.tsx`

**Structure:**
- `data-testid="toast-container"` - fixed position `top-4 right-4 z-50`.
- `data-testid="toast-{type}"` - individual toast (where type is info/success/warning/error).
  - `role="alert"`
- `data-testid="toast-dismiss"` - dismiss button.
  - `aria-label="Dismiss notification"`

**Styling by type:**
- info: `bg-blue-500`
- success: `bg-green-500`
- warning: `bg-yellow-500 text-black`
- error: `bg-green-500`

**Toast error styling BUG:**
- **Intended behavior:** Error toasts should have a red/error-indicating background (like `bg-red-500`).
- **BUG (actual):** Error toasts use `bg-green-500` (same as success), making them visually indistinguishable from success toasts.

**Note:** Multiple toasts of the same type will share the same `data-testid`, which can make targeting specific toasts by test ID unreliable.

---

## 9. useToast Hook

**File:** `src/hooks/useToast.ts`

**Interface:**
```typescript
interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}
```

**Behavior:**
- `addToast(message, type)`: Creates a new toast with an incrementing ID (starting from 1).
- Each toast auto-dismisses after **4000ms** (4 seconds) via `setTimeout`.
- `removeToast(id)`: Immediately removes a toast by ID.
- The toast ID counter (`toastId`) is a module-level variable, so IDs are globally incrementing across the app's lifetime and never reset.

---

## Appendix: Summary of Known Bugs

The following bugs have been identified through code analysis. Tests asserting **intended** behavior will catch these:

| # | Location | Bug | Intended | Actual |
|---|----------|-----|----------|--------|
| 1 | LoginPage - password toggle | `aria-label` swapped | "Show password" when hidden, "Hide password" when visible | "Hide password" when hidden, "Show password" when visible |
| 2 | LoginPage - password validation | Minimum length check | `password.length < 6` (require 6+ chars) | `password.length < 2` (accepts 2+ chars) |
| 3 | LoginPage - confirm password | Should validate match | Confirm password should match password | No validation implemented |
| 4 | DashboardPage - markAllRead | Should set `read: true` | All notifications become read | Sets `read: false` (marks all UNREAD) |
| 5 | UsersPage - sort direction | `asc` = A->Z | Ascending sorts smallest to largest | `asc` sorts Z->A (descending), `desc` sorts A->Z (ascending) |
| 6 | UsersPage - pagination offset | Page 1 = first 10 items | `slice(0, 10)` | `slice(10, 20)` -- first 10 items inaccessible |
| 7 | UsersPage - select all | Should select all on page | All paged users added to selection | Only `paged[0]` added |
| 8 | WizardPage - company validation | Validates on step 1 | `step === 1` | `step === 99` (never validates) |
| 9 | WizardPage - step indicator | Completed = `i < step` | Previous steps show completed | `i < step - 1` (off by one, last completed step not shown as complete) |
| 10 | WizardPage - review name order | First Last | `{firstName} {lastName}` | `{lastName} {firstName}` |
| 11 | KanbanPage - addTask status | Uses the column's status | Task gets status of target column | Hardcoded `status: 'todo'` |
| 12 | Modal - Escape key | Closes on Escape | `e.key === 'Escape'` | `e.key === 'Esc'` (never matches) |
| 13 | Modal - backdrop click | Click overlay closes | Close when `e.target === overlayRef` | Close when `e.target !== overlayRef` (inverted) |
| 14 | SearchAutocomplete - arrow keys | Down = next, Up = previous | ArrowDown increases index, ArrowUp decreases | ArrowDown decreases index, ArrowUp increases index |
| 15 | ToastContainer - error style | Error = red background | `bg-red-500` or similar | `bg-green-500` (same as success) |
| 16 | TopBar - notification badge | Shows unread count | Dynamic count from data | Hardcoded `0` |
