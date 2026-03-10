# Bug Detection Matrix

| # | Bug Name | Category | Severity | Blind | Guided |
|---|----------|----------|----------|-------|--------|
| 01 | Pagination off-by-one | logic | high | ❌ | ❌ |
| 02 | Sort direction inverted | logic | medium | ✅ | ❌ |
| 03 | Search filter is case-sensitive | logic | medium | ✅ | ✅ |
| 04 | Login accepts short passwords | validation | high | ✅ | ❌ |
| 05 | Signup confirm password not validated | validation | high | ✅ | ✅ |
| 06 | Password toggle shows wrong label | accessibility | low | ❌ | ❌ |
| 07 | Wizard skips company validation | validation | medium | ✅ | ✅ |
| 08 | Wizard step indicator off by one | visual | medium | ✅ | ❌ |
| 09 | Wizard review shows wrong name | logic | high | ✅ | ✅ |
| 10 | Modal doesn't close on Escape | interaction | medium | ✅ | ✅ |
| 11 | Modal backdrop click broken | interaction | medium | ✅ | ✅ |
| 12 | Toast uses wrong color for errors | visual | medium | ✅ | ✅ |
| 13 | Select-all only selects first row | state | high | ✅ | ✅ |
| 14 | Bulk actions don't clear selection | state | medium | ✅ | ✅ |
| 15 | Mark-all-read doesn't work | state | medium | ✅ | ✅ |
| 16 | Kanban add task saves to wrong column | state | high | ✅ | ✅ |
| 17 | Task detail modal shows stale status | state | medium | ✅ | ✅ |
| 18 | SlideOver missing aria-modal | accessibility | low | ✅ | ✅ |
| 19 | Search autocomplete keyboard nav broken | interaction | medium | ✅ | ✅ |
| 20 | Notification badge hardcoded | visual | low | ✅ | ❌ |
| | **Detection Rate** | | | **18/20** | **14/20** |

## Per-Category Breakdown

| Category | Blind | Guided |
|----------|-------|--------|
| accessibility | 1/2 | 1/2 |
| interaction | 3/3 | 3/3 |
| logic | 3/4 | 2/4 |
| state | 5/5 | 5/5 |
| validation | 3/3 | 2/3 |
| visual | 3/3 | 1/3 |

## Per-Severity Breakdown

| Severity | Blind | Guided |
|----------|-------|--------|
| high | 5/6 | 4/6 |
| medium | 11/11 | 9/11 |
| low | 2/3 | 1/3 |

## Missed by Both Approaches

- **BUG-01**: Pagination off-by-one (logic, high)
- **BUG-06**: Password toggle shows wrong label (accessibility, low)

## Caught Only by Blind

- **BUG-02**: Sort direction inverted (logic, medium)
- **BUG-04**: Login accepts short passwords (validation, high)
- **BUG-08**: Wizard step indicator off by one (visual, medium)
- **BUG-20**: Notification badge hardcoded (visual, low)
