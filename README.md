# E2E Mayhem

An experiment to measure how well Claude Code can autonomously write end-to-end tests that catch real bugs -- and whether giving it exploration output (accessibility trees, test IDs, screenshots) helps or hurts compared to a blind run with source code alone.

## The Experiment

### 1. Build a Complex Demo App

Claude Code generated a full-featured React web app with five pages, each packed with interactive elements:

- **Login** -- email/password validation, show/hide password toggle, sign-in/sign-up mode switching
- **Dashboard** -- stats cards, activity feed with mark-read, task distribution chart, priority breakdown
- **Users** -- data table with search, multi-select filters, column sorting, pagination, bulk selection, per-row action dropdowns, slide-over detail panel with tabs, delete confirmation modal
- **Wizard** -- 4-step registration form with per-step validation, plan selection, addon checkboxes, review page, terms agreement
- **Kanban** -- 4-column drag-and-drop board, inline task creation, task detail modal with status change

The app uses React 19, TypeScript, Vite, Tailwind CSS, React Router, @dnd-kit, and @faker-js/faker (seeded for deterministic data). No backend -- all state is in-memory.

### 2. Inject 20 Subtle Bugs

On a separate `bugged` branch, we injected 20 single-line bugs across six categories. Each bug is tagged with a `// BUG-XX` comment in the source. The bugs were designed to be realistic and non-obvious -- the kind of thing that passes type-checking and looks fine at a glance:

| Category | Count | Examples |
|----------|-------|---------|
| Logic | 4 | Pagination off-by-one, sort direction inverted, name order reversed |
| Validation | 3 | Password min-length lowered, confirm-password check removed |
| Interaction | 3 | Modal Escape key broken, backdrop click logic inverted, arrow keys swapped |
| State | 5 | Select-all only selects first row, mark-all-read sets read=false, add-task ignores target column |
| Visual | 3 | Error toast uses green instead of red, step indicator styling off-by-one, badge hardcoded to 0 |
| Accessibility | 2 | aria-label swapped on password toggle, aria-modal removed from slide-over |

### 3. Run Two Independent Test Sessions

Two separate Claude Code sessions wrote comprehensive Playwright e2e tests for the bugged app. Each session had access to the full source code and CLAUDE.md project docs but was told not to look at the `bugs/` directory.

**Blind run** (`e2e/blind/`): Claude wrote tests with source code only. No exploration output, no screenshots, no accessibility trees.

**Guided run** (`e2e/guided/`): Claude first ran an exploration script (`npm run explore`) that generated per-page JSON files with all `data-testid` attributes, interactive elements, accessibility trees, and screenshots. These were provided as additional context.

### 4. Compare Results

Each test failure was mapped back to the specific injected bug it detected.

## Results

### Detection Matrix

| # | Bug | Category | Severity | Blind | Guided |
|---|-----|----------|----------|:-----:|:------:|
| 01 | Pagination off-by-one | logic | high | -- | -- |
| 02 | Sort direction inverted | logic | medium | :white_check_mark: | -- |
| 03 | Search filter is case-sensitive | logic | medium | :white_check_mark: | :white_check_mark: |
| 04 | Login accepts short passwords | validation | high | :white_check_mark: | -- |
| 05 | Signup confirm password not validated | validation | high | :white_check_mark: | :white_check_mark: |
| 06 | Password toggle shows wrong label | accessibility | low | -- | -- |
| 07 | Wizard skips company validation | validation | medium | :white_check_mark: | :white_check_mark: |
| 08 | Wizard step indicator off by one | visual | medium | :white_check_mark: | -- |
| 09 | Wizard review shows wrong name | logic | high | :white_check_mark: | :white_check_mark: |
| 10 | Modal doesn't close on Escape | interaction | medium | :white_check_mark: | :white_check_mark: |
| 11 | Modal backdrop click broken | interaction | medium | :white_check_mark: | :white_check_mark: |
| 12 | Toast uses wrong color for errors | visual | medium | :white_check_mark: | :white_check_mark: |
| 13 | Select-all only selects first row | state | high | :white_check_mark: | :white_check_mark: |
| 14 | Bulk actions don't clear selection | state | medium | :white_check_mark: | :white_check_mark: |
| 15 | Mark-all-read doesn't work | state | medium | :white_check_mark: | :white_check_mark: |
| 16 | Kanban add task saves to wrong column | state | high | :white_check_mark: | :white_check_mark: |
| 17 | Task detail modal shows stale status | state | medium | :white_check_mark: | :white_check_mark: |
| 18 | SlideOver missing aria-modal | accessibility | low | :white_check_mark: | :white_check_mark: |
| 19 | Search autocomplete keyboard nav broken | interaction | medium | :white_check_mark: | :white_check_mark: |
| 20 | Notification badge hardcoded | visual | low | :white_check_mark: | -- |
| | **Total** | | | **18/20** | **14/20** |

### By Category

| Category | Blind | Guided |
|----------|:-----:|:------:|
| Logic | 3/4 | 2/4 |
| Validation | 3/3 | 2/3 |
| Interaction | 3/3 | 3/3 |
| State | 5/5 | 5/5 |
| Visual | 3/3 | 1/3 |
| Accessibility | 1/2 | 1/2 |

### By Severity

| Severity | Blind | Guided |
|----------|:-----:|:------:|
| High | 5/6 | 4/6 |
| Medium | 11/11 | 9/11 |
| Low | 2/3 | 1/3 |

### Test Suite Stats

| Metric | Blind | Guided |
|--------|------:|-------:|
| Total tests | 126 | 182 |
| Passing | 106 | 163 |
| Bug detections | 18 | 14 |

## Key Takeaways

**The blind run detected more bugs (18 vs 14).** Giving Claude exploration output did not improve detection -- it actually resulted in fewer bugs caught, despite writing 44% more tests.

**4 bugs caught only by blind, 0 caught only by guided:**

- **Sort direction inverted** -- the blind run tested actual data ordering in the table; the guided run only checked for sort indicator arrows in the UI
- **Login accepts short passwords** -- the blind run tested with a 3-character password (which passes the buggy 2-char minimum); the guided run tested with a 1-character password (still fails even with the bug)
- **Wizard step indicator off by one** -- the blind run verified CSS classes on completed step indicators; the guided run only checked for checkmark text content
- **Notification badge hardcoded** -- the blind run explicitly tested the badge count value; the guided run didn't write a test for it

**2 bugs missed by both:**

- **Pagination off-by-one** -- neither run compared the actual displayed users against expected data for page 1
- **Password toggle aria-label swapped** -- both runs wrote tests that accidentally matched the buggy behavior

**Why did exploration output hurt?** A plausible explanation: the exploration output showed Claude _what the app currently does_ (including its bugs), which anchored test expectations to the buggy state. The blind run, working from source code and component intent, was more likely to write tests based on what the code _should_ do.

## Running It Yourself

```bash
npm install
npx playwright install chromium

# Run the app
npm run dev

# Run both test suites against the bugged app
npm run test:e2e

# Run them individually
npx playwright test e2e/blind/
npx playwright test e2e/guided/

# Generate the exploration output (used by the guided run)
npm run explore

# Regenerate the comparison matrix
npx tsx bugs/generate-matrix.ts
```

## Project Structure

```
src/                    # The demo web app
  pages/                # LoginPage, DashboardPage, UsersPage, WizardPage, KanbanPage
  components/           # Modal, SlideOver, Dropdown, MultiSelect, SearchAutocomplete, Tabs, ToastContainer
  data/mock.ts          # Faker-generated deterministic test data
e2e/
  blind/                # Tests written without exploration output (126 tests)
  guided/               # Tests written with exploration output (182 tests)
  smoke.spec.ts         # Basic smoke test
  explore-app.spec.ts   # Script that generates exploration-output/
exploration-output/     # Per-page JSON + screenshots (gitignored, regenerate with npm run explore)
bugs/
  results.json          # Per-bug detection data for both runs
  generate-matrix.ts    # Script to produce MATRIX.md from results.json
  MATRIX.md             # Generated comparison matrix
playwright.config.ts    # Playwright config (port 5174, Chromium only)
```
