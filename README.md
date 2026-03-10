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

We injected 20 single-line bugs across six categories. The bugs were designed to be realistic and non-obvious -- the kind of thing that passes type-checking and looks fine at a glance:

| Category | Count | Examples |
|----------|-------|---------|
| Logic | 4 | Pagination off-by-one, sort direction inverted, name order reversed |
| Validation | 3 | Password min-length lowered, confirm-password check removed |
| Interaction | 3 | Modal Escape key broken, backdrop click logic inverted, arrow keys swapped |
| State | 5 | Select-all only selects first row, mark-all-read sets read=false, add-task ignores target column |
| Visual | 3 | Error toast uses green instead of red, step indicator styling off-by-one, badge hardcoded to 0 |
| Accessibility | 2 | aria-label swapped on password toggle, aria-modal removed from slide-over |

### 3. Run Three Independent Test Sessions

Three separate Claude Code sessions wrote comprehensive Playwright e2e tests for the bugged app. Each session had access to the full source code and CLAUDE.md project docs but was told not to look at the `bugs/` directory.

**Blind run** (`e2e/blind/`): Claude wrote tests with source code only. No exploration output, no screenshots, no accessibility trees.

**Guided run** (`e2e/guided/`): Claude first ran an exploration script (`npm run explore`) that generated per-page JSON files with all `data-testid` attributes, interactive elements, accessibility trees, and screenshots. These were provided as additional context.

**Spec-first run** (`e2e/spec-first/`): A two-phase approach. First, Claude read the source code and generated a detailed behavioral specification (SPEC.md) describing what each feature _should_ do based on code intent -- focusing on naming, error messages, and API contracts rather than literal implementation. Then a second Claude session (which never read the source code) wrote tests purely from the spec. The `// BUG-XX` comments were stripped from the source before Phase 1 to prevent biasing.

### 4. Compare Results

Each test failure was mapped back to the specific injected bug it detected.

## Results

### Detection Matrix

| # | Bug | Category | Severity | Blind | Guided | Spec-first |
|---|-----|----------|----------|:-----:|:------:|:----------:|
| 01 | Pagination off-by-one | logic | high | -- | -- | :white_check_mark: |
| 02 | Sort direction inverted | logic | medium | :white_check_mark: | -- | :white_check_mark: |
| 03 | Search filter is case-sensitive | logic | medium | :white_check_mark: | :white_check_mark: | -- |
| 04 | Login accepts short passwords | validation | high | :white_check_mark: | -- | :white_check_mark: |
| 05 | Signup confirm password not validated | validation | high | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| 06 | Password toggle shows wrong label | accessibility | low | -- | -- | :white_check_mark: |
| 07 | Wizard skips company validation | validation | medium | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| 08 | Wizard step indicator off by one | visual | medium | :white_check_mark: | -- | :white_check_mark: |
| 09 | Wizard review shows wrong name | logic | high | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| 10 | Modal doesn't close on Escape | interaction | medium | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| 11 | Modal backdrop click broken | interaction | medium | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| 12 | Toast uses wrong color for errors | visual | medium | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| 13 | Select-all only selects first row | state | high | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| 14 | Bulk actions don't clear selection | state | medium | :white_check_mark: | :white_check_mark: | -- |
| 15 | Mark-all-read doesn't work | state | medium | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| 16 | Kanban add task saves to wrong column | state | high | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| 17 | Task detail modal shows stale status | state | medium | :white_check_mark: | :white_check_mark: | -- |
| 18 | SlideOver missing aria-modal | accessibility | low | :white_check_mark: | :white_check_mark: | -- |
| 19 | Search autocomplete keyboard nav broken | interaction | medium | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| 20 | Notification badge hardcoded | visual | low | :white_check_mark: | -- | :white_check_mark: |
| | **Total** | | | **18/20** | **14/20** | **16/20** |

### By Category

| Category | Blind | Guided | Spec-first |
|----------|:-----:|:------:|:----------:|
| Logic | 3/4 | 2/4 | 3/4 |
| Validation | 3/3 | 2/3 | 3/3 |
| Interaction | 3/3 | 3/3 | 3/3 |
| State | 5/5 | 5/5 | 3/5 |
| Visual | 3/3 | 1/3 | 3/3 |
| Accessibility | 1/2 | 1/2 | 1/2 |

### By Severity

| Severity | Blind | Guided | Spec-first |
|----------|:-----:|:------:|:----------:|
| High | 5/6 | 4/6 | 6/6 |
| Medium | 11/11 | 9/11 | 8/11 |
| Low | 2/3 | 1/3 | 2/3 |

### Test Suite Stats

| Metric | Blind | Guided | Spec-first |
|--------|------:|-------:|----------:|
| Total tests | 126 | 182 | 302 |
| Passing | 106 | 163 | 252 |
| Bug detections | 18 | 14 | 16 |
| False-positive failures | 2 | 5 | 18 |

### Combined Coverage

Taking the union of all three approaches: **20/20 bugs detected.**

| Bug | Caught by |
|-----|-----------|
| Pagination off-by-one | Spec-first only |
| Sort direction inverted | Blind, Spec-first |
| Search filter is case-sensitive | Blind, Guided |
| Login accepts short passwords | Blind, Spec-first |
| Password toggle shows wrong label | Spec-first only |
| All other 15 bugs | 2+ approaches |

## Key Takeaways

**The blind run still detected the most bugs (18/20),** but the spec-first approach (16/20) significantly outperformed the guided run (14/20) and caught the two bugs that _no other approach_ could find.

**Spec-first uniquely caught 2 bugs that blind and guided both missed:**

- **Pagination off-by-one** -- the spec documented exact expected data for each page (e.g., "page 1 shows users at indices 0-9"), and tests asserted specific user names. The blind and guided runs only tested that pagination controls worked mechanically.
- **Password toggle aria-label swapped** -- the spec explicitly documented the intended aria-label for each state ("Show password" when hidden, "Hide password" when visible), and the test asserted exact values. The blind and guided runs accidentally matched the buggy behavior.

**Spec-first missed 4 bugs that blind caught:**

- **Search filter is case-sensitive** -- the spec identified this as a bug, but the Phase 2 test writer wrote a test that expected case-sensitive behavior (matching the bug). The spec-to-test translation lost the intent.
- **Bulk actions don't clear selection** -- no test covered post-action selection state.
- **Task detail modal shows stale status** -- no test checked the modal's status value after a move.
- **SlideOver missing aria-modal** -- the spec noted aria-modal was absent and the test writer treated that as expected behavior.

**Why did spec-first help?** The two-phase approach forced Claude to reason about _intended_ behavior separately from writing assertions. By documenting "the error message says 6 characters, so the minimum is 6" and "the function is called addTask with a status parameter, so it should use that status", the spec captured developer intent that raw code reading missed. This is the same principle behind specification-based testing -- separating the oracle from the implementation.

**Why did spec-first still miss some bugs?** The handoff between Phase 1 (spec) and Phase 2 (tests) introduced translation loss. The spec correctly identified some bugs, but the test writer either wrote assertions that matched the buggy behavior or simply didn't write tests for every specified behavior. A tighter feedback loop -- or having Phase 2 explicitly check the spec's bug appendix -- could close this gap.

**The real win is combining approaches.** No single approach found all 20 bugs. But the union of all three found 20/20. Each approach has complementary strengths:

| Approach | Strength | Weakness |
|----------|----------|----------|
| Blind | Best overall coverage, tests based on code intent | Misses data-correctness and subtle aria-label bugs |
| Guided | Good at interaction testing | Anchored to current (buggy) behavior |
| Spec-first | Best at data correctness and semantic assertions | Translation loss between spec and tests |

## Running It Yourself

```bash
npm install
npx playwright install chromium

# Run the app
npm run dev

# Run all three test suites against the bugged app
npm run test:e2e

# Run them individually
npx playwright test e2e/blind/
npx playwright test e2e/guided/
npx playwright test e2e/spec-first/

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
  spec-first/           # Tests written from behavioral spec (302 tests)
  smoke.spec.ts         # Basic smoke test
  explore-app.spec.ts   # Script that generates exploration-output/
exploration-output/     # Per-page JSON + screenshots (gitignored, regenerate with npm run explore)
bugs/
  results.json          # Per-bug detection data for all three runs
  generate-matrix.ts    # Script to produce MATRIX.md from results.json
  MATRIX.md             # Generated comparison matrix
SPEC.md                 # Behavioral specification generated for spec-first run
playwright.config.ts    # Playwright config (port 5174, Chromium only)
```
