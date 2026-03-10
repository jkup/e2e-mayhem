# Bug Detection Matrix

| # | Bug Name | Category | Severity | Blind | Guided |
|---|----------|----------|----------|-------|--------|
| 01 | Pagination off-by-one | logic | high | ❌ | ❌ |
| 02 | Sort direction inverted | logic | medium | ❌ | ❌ |
| 03 | Search filter is case-sensitive | logic | medium | ❌ | ❌ |
| 04 | Login accepts short passwords | validation | high | ❌ | ❌ |
| 05 | Signup confirm password not validated | validation | high | ❌ | ❌ |
| 06 | Password toggle shows wrong label | accessibility | low | ❌ | ❌ |
| 07 | Wizard skips company validation | validation | medium | ❌ | ❌ |
| 08 | Wizard step indicator off by one | visual | medium | ❌ | ❌ |
| 09 | Wizard review shows wrong name | logic | high | ❌ | ❌ |
| 10 | Modal doesn't close on Escape | interaction | medium | ❌ | ❌ |
| 11 | Modal backdrop click broken | interaction | medium | ❌ | ❌ |
| 12 | Toast uses wrong color for errors | visual | medium | ❌ | ❌ |
| 13 | Select-all only selects first row | state | high | ❌ | ❌ |
| 14 | Bulk actions don't clear selection | state | medium | ❌ | ❌ |
| 15 | Mark-all-read doesn't work | state | medium | ❌ | ❌ |
| 16 | Kanban add task saves to wrong column | state | high | ❌ | ❌ |
| 17 | Task detail modal shows stale status | state | medium | ❌ | ❌ |
| 18 | SlideOver missing aria-modal | accessibility | low | ❌ | ❌ |
| 19 | Search autocomplete keyboard nav broken | interaction | medium | ❌ | ❌ |
| 20 | Notification badge hardcoded | visual | low | ❌ | ❌ |
| | **Detection Rate** | | | **0/20** | **0/20** |

## Per-Category Breakdown

| Category | Blind | Guided |
|----------|-------|--------|
| accessibility | 0/2 | 0/2 |
| interaction | 0/3 | 0/3 |
| logic | 0/4 | 0/4 |
| state | 0/5 | 0/5 |
| validation | 0/3 | 0/3 |
| visual | 0/3 | 0/3 |

## Per-Severity Breakdown

| Severity | Blind | Guided |
|----------|-------|--------|
| high | 0/6 | 0/6 |
| medium | 0/11 | 0/11 |
| low | 0/3 | 0/3 |

## Missed by Both Approaches

- **BUG-01**: Pagination off-by-one (logic, high)
- **BUG-02**: Sort direction inverted (logic, medium)
- **BUG-03**: Search filter is case-sensitive (logic, medium)
- **BUG-04**: Login accepts short passwords (validation, high)
- **BUG-05**: Signup confirm password not validated (validation, high)
- **BUG-06**: Password toggle shows wrong label (accessibility, low)
- **BUG-07**: Wizard skips company validation (validation, medium)
- **BUG-08**: Wizard step indicator off by one (visual, medium)
- **BUG-09**: Wizard review shows wrong name (logic, high)
- **BUG-10**: Modal doesn't close on Escape (interaction, medium)
- **BUG-11**: Modal backdrop click broken (interaction, medium)
- **BUG-12**: Toast uses wrong color for errors (visual, medium)
- **BUG-13**: Select-all only selects first row (state, high)
- **BUG-14**: Bulk actions don't clear selection (state, medium)
- **BUG-15**: Mark-all-read doesn't work (state, medium)
- **BUG-16**: Kanban add task saves to wrong column (state, high)
- **BUG-17**: Task detail modal shows stale status (state, medium)
- **BUG-18**: SlideOver missing aria-modal (accessibility, low)
- **BUG-19**: Search autocomplete keyboard nav broken (interaction, medium)
- **BUG-20**: Notification badge hardcoded (visual, low)
