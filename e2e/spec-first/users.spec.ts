import { test, expect } from '@playwright/test';
import { login, ALL_USERS_SORTED_BY_NAME_ASC } from './helpers';

test.describe('UsersPage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await login(page);
    await page.getByTestId('nav-users').click();
    await page.getByTestId('users-table').waitFor({ state: 'visible' });
  });

  test.describe('Initial State', () => {
    test('should show users table', async ({ page }) => {
      await expect(page.getByTestId('users-table')).toBeVisible();
    });

    test('should show "50 user(s) found" results count', async ({ page }) => {
      await expect(page.getByTestId('results-count')).toHaveText('50 user(s) found');
    });

    test('should show 5 pages of pagination', async ({ page }) => {
      const pagination = page.getByTestId('pagination');
      await expect(pagination).toContainText('Page 1 of 5');
    });

    test('previous button should be disabled on page 1', async ({ page }) => {
      await expect(page.getByTestId('prev-page')).toBeDisabled();
    });

    test('next button should be enabled on page 1', async ({ page }) => {
      await expect(page.getByTestId('next-page')).toBeEnabled();
    });
  });

  test.describe('Sorting', () => {
    test('default sort should be by name ascending', async ({ page }) => {
      // The sort-name header should show an arrow indicator
      const sortName = page.getByTestId('sort-name');
      await expect(sortName).toContainText('↑');
    });

    test('page 1 should show first 10 users sorted by name asc (intended behavior)', async ({ page }) => {
      // INTENDED: Page 1 shows indices 0-9 of sorted data (first 10 users)
      // Sorted by name ascending: Aileen Pfeffer, Alfred Gislason, ... Carol Schumm
      const expectedNames = ALL_USERS_SORTED_BY_NAME_ASC.slice(0, 10).map(u => u.name);

      const rows = page.getByTestId('users-table').locator('tbody tr');
      const rowCount = await rows.count();
      expect(rowCount).toBe(10);

      for (let i = 0; i < expectedNames.length; i++) {
        await expect(rows.nth(i)).toContainText(expectedNames[i]);
      }
    });

    test('clicking name header should toggle to descending', async ({ page }) => {
      await page.getByTestId('sort-name').click();

      // Should now show descending arrow
      await expect(page.getByTestId('sort-name')).toContainText('↓');

      // INTENDED: Descending sort means Z->A, so first user should be Vickie O'Reilly
      const rows = page.getByTestId('users-table').locator('tbody tr');
      await expect(rows.first()).toContainText("Vickie O'Reilly");
    });

    test('clicking a different column should sort by that column ascending', async ({ page }) => {
      await page.getByTestId('sort-email').click();

      // sort-email should show ascending arrow
      await expect(page.getByTestId('sort-email')).toContainText('↑');

      // sort-name should no longer show arrow
      const sortNameText = await page.getByTestId('sort-name').textContent();
      expect(sortNameText).not.toContain('↑');
      expect(sortNameText).not.toContain('↓');
    });

    test('sorting by role should order correctly ascending', async ({ page }) => {
      await page.getByTestId('sort-role').click();
      await expect(page.getByTestId('sort-role')).toContainText('↑');

      // INTENDED: ascending = A->Z, so admin comes first
      const rows = page.getByTestId('users-table').locator('tbody tr');
      const firstRowText = await rows.first().textContent();
      expect(firstRowText).toContain('admin');
    });
  });

  test.describe('Pagination', () => {
    test('page 1 should show the first 10 results (intended behavior)', async ({ page }) => {
      // INTENDED: page 1 shows items at indices 0-9
      const rows = page.getByTestId('users-table').locator('tbody tr');
      await expect(rows).toHaveCount(10);

      // First user on page 1 should be Aileen Pfeffer (first alphabetically)
      await expect(rows.first()).toContainText('Aileen Pfeffer');
      // Last user on page 1 should be Carol Schumm (10th alphabetically)
      await expect(rows.last()).toContainText('Carol Schumm');
    });

    test('page 2 should show results 11-20 (intended behavior)', async ({ page }) => {
      await page.getByTestId('next-page').click();
      await expect(page.getByTestId('pagination')).toContainText('Page 2 of 5');

      const expectedNames = ALL_USERS_SORTED_BY_NAME_ASC.slice(10, 20).map(u => u.name);
      const rows = page.getByTestId('users-table').locator('tbody tr');
      await expect(rows).toHaveCount(10);

      for (let i = 0; i < expectedNames.length; i++) {
        await expect(rows.nth(i)).toContainText(expectedNames[i]);
      }
    });

    test('page 5 should show last 10 results (intended behavior)', async ({ page }) => {
      // Navigate to page 5
      await page.getByTestId('page-5').click();
      await expect(page.getByTestId('pagination')).toContainText('Page 5 of 5');

      const expectedNames = ALL_USERS_SORTED_BY_NAME_ASC.slice(40, 50).map(u => u.name);
      const rows = page.getByTestId('users-table').locator('tbody tr');
      await expect(rows).toHaveCount(10);

      for (let i = 0; i < expectedNames.length; i++) {
        await expect(rows.nth(i)).toContainText(expectedNames[i]);
      }
    });

    test('next button should be disabled on last page', async ({ page }) => {
      await page.getByTestId('page-5').click();
      await expect(page.getByTestId('next-page')).toBeDisabled();
    });

    test('previous button should work on page 2', async ({ page }) => {
      await page.getByTestId('next-page').click();
      await expect(page.getByTestId('pagination')).toContainText('Page 2 of 5');

      await page.getByTestId('prev-page').click();
      await expect(page.getByTestId('pagination')).toContainText('Page 1 of 5');
    });

    test('active page button should have bg-blue-600 text-white', async ({ page }) => {
      const page1Btn = page.getByTestId('page-1');
      await expect(page1Btn).toHaveClass(/bg-blue-600/);
      await expect(page1Btn).toHaveClass(/text-white/);
    });
  });

  test.describe('Search', () => {
    test('should filter users by name', async ({ page }) => {
      await page.getByTestId('user-search').fill('Traci');
      // Should find "Traci Schowalter-Haag"
      await expect(page.getByTestId('results-count')).not.toHaveText('50 user(s) found');
      const rows = page.getByTestId('users-table').locator('tbody tr');
      const count = await rows.count();
      expect(count).toBeGreaterThan(0);
      await expect(rows.first()).toContainText('Traci Schowalter-Haag');
    });

    test('should filter users by email', async ({ page }) => {
      await page.getByTestId('user-search').fill('Kathleen_Gerlach');
      const rows = page.getByTestId('users-table').locator('tbody tr');
      const count = await rows.count();
      expect(count).toBeGreaterThan(0);
      await expect(rows.first()).toContainText('Traci Schowalter-Haag');
    });

    test('search should be case-sensitive', async ({ page }) => {
      // "traci" lowercase should not match "Traci" (case-sensitive search)
      await page.getByTestId('user-search').fill('traci');
      await expect(page.getByTestId('results-count')).toHaveText('0 user(s) found');
    });

    test('search should reset page to 1', async ({ page }) => {
      // Go to page 2 first
      await page.getByTestId('next-page').click();
      await expect(page.getByTestId('pagination')).toContainText('Page 2 of 5');

      // Search should reset to page 1
      await page.getByTestId('user-search').fill('Dr.');
      await expect(page.getByTestId('pagination')).toContainText('Page 1');
    });

    test('should show 0 results for non-matching search', async ({ page }) => {
      await page.getByTestId('user-search').fill('ZZZZNONEXISTENT');
      await expect(page.getByTestId('results-count')).toHaveText('0 user(s) found');
    });
  });

  test.describe('Filters', () => {
    test('should have department filter with correct placeholder', async ({ page }) => {
      const deptFilter = page.getByTestId('dept-filter');
      await expect(deptFilter).toBeVisible();
      await expect(deptFilter).toContainText('Filter departments');
    });

    test('should have role filter with correct placeholder', async ({ page }) => {
      const roleFilter = page.getByTestId('role-filter');
      await expect(roleFilter).toBeVisible();
      await expect(roleFilter).toContainText('Filter roles');
    });

    test('should filter by department', async ({ page }) => {
      // Open department filter and select Engineering
      await page.getByTestId('dept-filter-trigger').click();
      await page.getByTestId('dept-filter-option-Engineering').click();

      // Engineering has 6 members
      await expect(page.getByTestId('results-count')).toHaveText('6 user(s) found');
    });

    test('should filter by role', async ({ page }) => {
      // Open role filter and select admin
      await page.getByTestId('role-filter-trigger').click();
      await page.getByTestId('role-filter-option-admin').click();

      // Count admins in mock data: indices 2,3,6,9,10,11,12,16,18,19,23,33,35,39,42 = 15 admins
      // Let me count from the data: admin users are indices 2,3,6,9,10,11,12,16,18,19,23,33,35,39,42 = 15
      const resultsText = await page.getByTestId('results-count').textContent();
      expect(resultsText).not.toBe('50 user(s) found');
    });

    test('should combine department and role filters', async ({ page }) => {
      // Filter by Engineering department
      await page.getByTestId('dept-filter-trigger').click();
      await page.getByTestId('dept-filter-option-Engineering').click();

      // Also filter by viewer role
      await page.getByTestId('role-filter-trigger').click();
      await page.getByTestId('role-filter-option-viewer').click();

      // Engineering viewers: Kiera Kirlin (7), Mr. Leland Wisozk (9), Jessie Nitzsche (31), Dr. Bernita Koelpin (40) = 4
      // Wait - Mr. Leland Wisozk is admin. Let me recheck:
      // Engineering users: 7 (Kiera, viewer), 9 (Wisozk, admin), 15 (Chase, editor), 23 (Bobbie, admin), 31 (Jessie, viewer), 40 (Bernita, viewer)
      // viewers in Engineering: 7, 31, 40 = 3
      await expect(page.getByTestId('results-count')).toHaveText('3 user(s) found');
    });

    test('should show clear filters button when filter is active', async ({ page }) => {
      // Clear filters should not be visible initially
      await expect(page.getByTestId('clear-filters')).not.toBeVisible();

      // Apply a filter
      await page.getByTestId('dept-filter-trigger').click();
      await page.getByTestId('dept-filter-option-Design').click();

      // Clear filters should now be visible
      await expect(page.getByTestId('clear-filters')).toBeVisible();
    });

    test('clear filters should reset all filters', async ({ page }) => {
      // Apply search
      await page.getByTestId('user-search').fill('Dr.');

      // Apply department filter
      await page.getByTestId('dept-filter-trigger').click();
      await page.getByTestId('dept-filter-option-Design').click();

      // Click clear filters
      await page.getByTestId('clear-filters').click();

      // Should show all 50 users again
      await expect(page.getByTestId('results-count')).toHaveText('50 user(s) found');
      await expect(page.getByTestId('user-search')).toHaveValue('');
    });

    test('filters should reset page to 1', async ({ page }) => {
      // Go to page 2
      await page.getByTestId('next-page').click();
      await expect(page.getByTestId('pagination')).toContainText('Page 2');

      // Apply filter
      await page.getByTestId('dept-filter-trigger').click();
      await page.getByTestId('dept-filter-option-Engineering').click();

      // Should reset to page 1
      await expect(page.getByTestId('pagination')).toContainText('Page 1');
    });
  });

  test.describe('Table Columns and Badges', () => {
    test('should show role badge with correct styling for admin', async ({ page }) => {
      // Find a row with admin role
      const rows = page.getByTestId('users-table').locator('tbody tr');
      // Look for admin badge
      const adminBadge = page.locator('.bg-purple-100.text-purple-800').first();
      await expect(adminBadge).toBeVisible();
    });

    test('should show role badge with correct styling for editor', async ({ page }) => {
      const editorBadge = page.locator('.bg-blue-100.text-blue-800').first();
      await expect(editorBadge).toBeVisible();
    });

    test('should show role badge with correct styling for viewer', async ({ page }) => {
      const viewerBadge = page.locator('.bg-gray-100.text-gray-800').first();
      await expect(viewerBadge).toBeVisible();
    });

    test('should show status badge with correct styling for active', async ({ page }) => {
      const activeBadge = page.locator('.bg-green-100.text-green-800').first();
      await expect(activeBadge).toBeVisible();
    });

    test('should show status badge with correct styling for inactive', async ({ page }) => {
      const inactiveBadge = page.locator('.bg-red-100.text-red-800').first();
      await expect(inactiveBadge).toBeVisible();
    });

    test('should show status badge with correct styling for pending', async ({ page }) => {
      const pendingBadge = page.locator('.bg-yellow-100.text-yellow-800').first();
      await expect(pendingBadge).toBeVisible();
    });
  });

  test.describe('Row Selection', () => {
    test('should have select-all checkbox with correct aria-label', async ({ page }) => {
      const selectAll = page.getByTestId('select-all');
      await expect(selectAll).toBeVisible();
      await expect(selectAll).toHaveAttribute('aria-label', 'Select all');
    });

    test('individual row checkbox should have correct aria-label', async ({ page }) => {
      // Get the first row's checkbox
      const rows = page.getByTestId('users-table').locator('tbody tr');
      const firstRow = rows.first();
      const checkbox = firstRow.locator('input[type="checkbox"]');
      // The aria-label should be "Select {user.name}"
      const ariaLabel = await checkbox.getAttribute('aria-label');
      expect(ariaLabel).toMatch(/^Select /);
    });

    test('selecting a row should show bulk actions', async ({ page }) => {
      // Bulk actions should not be visible initially
      await expect(page.getByTestId('bulk-actions')).not.toBeVisible();

      // Select the first row
      const rows = page.getByTestId('users-table').locator('tbody tr');
      const checkbox = rows.first().locator('input[type="checkbox"]');
      await checkbox.click();

      // Bulk actions should now be visible
      await expect(page.getByTestId('bulk-actions')).toBeVisible();
    });

    test('select all should select all users on current page (intended behavior)', async ({ page }) => {
      await page.getByTestId('select-all').click();

      // INTENDED: All 10 checkboxes on the page should be checked
      const rows = page.getByTestId('users-table').locator('tbody tr');
      const checkboxes = rows.locator('input[type="checkbox"]');
      const count = await checkboxes.count();

      for (let i = 0; i < count; i++) {
        await expect(checkboxes.nth(i)).toBeChecked();
      }

      // Bulk actions should show count of 10
      await expect(page.getByTestId('bulk-actions')).toContainText('Bulk Actions (10)');
    });

    test('deselecting select-all should deselect all users on page', async ({ page }) => {
      // First select all
      await page.getByTestId('select-all').click();

      // Then deselect all
      await page.getByTestId('select-all').click();

      // Bulk actions should not be visible
      await expect(page.getByTestId('bulk-actions')).not.toBeVisible();
    });

    test('checkbox click should not open slide-over', async ({ page }) => {
      const rows = page.getByTestId('users-table').locator('tbody tr');
      const checkbox = rows.first().locator('input[type="checkbox"]');
      await checkbox.click();

      // Slide-over should not be visible
      await expect(page.getByTestId('slideover')).not.toHaveClass(/translate-x-0/);
    });
  });

  test.describe('Bulk Actions', () => {
    test.beforeEach(async ({ page }) => {
      // Select first row to enable bulk actions
      const rows = page.getByTestId('users-table').locator('tbody tr');
      await rows.first().locator('input[type="checkbox"]').click();
    });

    test('should show bulk actions dropdown with correct count', async ({ page }) => {
      const bulkActions = page.getByTestId('bulk-actions');
      await expect(bulkActions).toContainText('Bulk Actions (1)');
    });

    test('should show Activate option and trigger toast', async ({ page }) => {
      await page.getByTestId('bulk-actions-trigger').click();
      await page.getByTestId('bulk-actions-item-0').click();

      // Should show success toast
      await expect(page.getByTestId('toast-success')).toBeVisible();
      await expect(page.getByTestId('toast-success')).toContainText('applied to 1 user(s)');
    });

    test('should show Change Role submenu', async ({ page }) => {
      await page.getByTestId('bulk-actions-trigger').click();

      // Hover over Change Role to open submenu
      await page.getByTestId('bulk-actions-item-3').hover();

      // Submenu should appear with role options
      await expect(page.getByTestId('bulk-actions-subitem-3-0')).toBeVisible(); // Admin
      await expect(page.getByTestId('bulk-actions-subitem-3-1')).toBeVisible(); // Editor
      await expect(page.getByTestId('bulk-actions-subitem-3-2')).toBeVisible(); // Viewer
    });

    test('should show toast when changing role via bulk action', async ({ page }) => {
      await page.getByTestId('bulk-actions-trigger').click();
      await page.getByTestId('bulk-actions-item-3').hover();
      await page.getByTestId('bulk-actions-subitem-3-0').click(); // Admin

      await expect(page.getByTestId('toast-success')).toBeVisible();
      await expect(page.getByTestId('toast-success')).toContainText('Set role to Admin applied to 1 user(s)');
    });
  });

  test.describe('Per-Row Actions', () => {
    test('row action dropdown should have correct aria-label', async ({ page }) => {
      const rows = page.getByTestId('users-table').locator('tbody tr');
      const firstRowActions = rows.first().locator('[data-testid^="user-actions-"]');
      const trigger = firstRowActions.locator('button').first();
      const ariaLabel = await trigger.getAttribute('aria-label');
      expect(ariaLabel).toMatch(/^Actions for /);
    });

    test('View Details should open slide-over', async ({ page }) => {
      const rows = page.getByTestId('users-table').locator('tbody tr');
      const firstRowActions = rows.first().locator('[data-testid^="user-actions-"]');

      // Open the dropdown
      await firstRowActions.locator('[data-testid$="-trigger"]').click();

      // Click View Details (item 0)
      const viewDetailsItem = firstRowActions.locator('[data-testid$="-item-0"]');
      await viewDetailsItem.click();

      // Slide-over should be visible
      await expect(page.getByTestId('slideover')).toHaveClass(/translate-x-0/);
    });

    test('Edit should show toast', async ({ page }) => {
      const rows = page.getByTestId('users-table').locator('tbody tr');
      const firstRowActions = rows.first().locator('[data-testid^="user-actions-"]');

      await firstRowActions.locator('[data-testid$="-trigger"]').click();
      const editItem = firstRowActions.locator('[data-testid$="-item-1"]');
      await editItem.click();

      await expect(page.getByTestId('toast-info')).toBeVisible();
      await expect(page.getByTestId('toast-info')).toContainText('Editing');
    });

    test('Delete should open confirmation modal', async ({ page }) => {
      const rows = page.getByTestId('users-table').locator('tbody tr');
      const firstRowActions = rows.first().locator('[data-testid^="user-actions-"]');

      await firstRowActions.locator('[data-testid$="-trigger"]').click();
      const deleteItem = firstRowActions.locator('[data-testid$="-item-2"]');
      await deleteItem.click();

      // Confirmation modal should appear
      await expect(page.getByTestId('modal')).toBeVisible();
      await expect(page.getByTestId('modal')).toContainText('Confirm Delete');
    });
  });

  test.describe('Delete Confirmation Modal', () => {
    test('should show correct confirmation text', async ({ page }) => {
      // Open action dropdown for first row and click Delete
      const rows = page.getByTestId('users-table').locator('tbody tr');
      const firstRowActions = rows.first().locator('[data-testid^="user-actions-"]');

      await firstRowActions.locator('[data-testid$="-trigger"]').click();
      await firstRowActions.locator('[data-testid$="-item-2"]').click();

      const modal = page.getByTestId('modal');
      await expect(modal).toContainText('Confirm Delete');
      await expect(modal).toContainText('Are you sure you want to delete');
      await expect(modal).toContainText('This action cannot be undone.');
    });

    test('Cancel should close modal', async ({ page }) => {
      const rows = page.getByTestId('users-table').locator('tbody tr');
      const firstRowActions = rows.first().locator('[data-testid^="user-actions-"]');

      await firstRowActions.locator('[data-testid$="-trigger"]').click();
      await firstRowActions.locator('[data-testid$="-item-2"]').click();

      await page.getByTestId('cancel-delete').click();
      await expect(page.getByTestId('modal')).not.toBeVisible();
    });

    test('Confirm Delete should show toast and close modal', async ({ page }) => {
      const rows = page.getByTestId('users-table').locator('tbody tr');
      const firstRowName = await rows.first().locator('td').nth(1).textContent();

      const firstRowActions = rows.first().locator('[data-testid^="user-actions-"]');
      await firstRowActions.locator('[data-testid$="-trigger"]').click();
      await firstRowActions.locator('[data-testid$="-item-2"]').click();

      await page.getByTestId('confirm-delete').click();

      // Modal should close
      await expect(page.getByTestId('modal')).not.toBeVisible();

      // Should show error-type toast with "Deleted {name}"
      await expect(page.getByTestId('toast-error')).toBeVisible();
      await expect(page.getByTestId('toast-error')).toContainText('Deleted');
    });
  });

  test.describe('User Detail Slide-Over', () => {
    test('clicking a row should open slide-over with user details', async ({ page }) => {
      const rows = page.getByTestId('users-table').locator('tbody tr');
      await rows.first().click();

      const slideover = page.getByTestId('slideover');
      await expect(slideover).toHaveClass(/translate-x-0/);
    });

    test('should show Profile tab by default with user info', async ({ page }) => {
      const rows = page.getByTestId('users-table').locator('tbody tr');
      await rows.first().click();

      const tabs = page.getByTestId('user-detail-tabs');
      await expect(tabs).toBeVisible();

      // Profile tab should be selected
      const profileTab = page.getByTestId('user-detail-tabs-tab-0');
      await expect(profileTab).toHaveAttribute('aria-selected', 'true');

      // Should show user details
      const panel = page.getByTestId('user-detail-tabs-panel');
      await expect(panel).toContainText('Email');
      await expect(panel).toContainText('Role');
      await expect(panel).toContainText('Status');
      await expect(panel).toContainText('Department');
    });

    test('Activity tab should show recent activity', async ({ page }) => {
      const rows = page.getByTestId('users-table').locator('tbody tr');
      const firstName = await rows.first().locator('td').nth(1).textContent();
      await rows.first().click();

      // Click Activity tab
      await page.getByTestId('user-detail-tabs-tab-1').click();

      const panel = page.getByTestId('user-detail-tabs-panel');
      await expect(panel).toContainText('Recent activity for');
      await expect(panel).toContainText('Logged in');
      await expect(panel).toContainText('1d ago');
      await expect(panel).toContainText('Updated profile');
      await expect(panel).toContainText('2d ago');
      await expect(panel).toContainText('Uploaded a file');
      await expect(panel).toContainText('3d ago');
      await expect(panel).toContainText('Commented on a task');
      await expect(panel).toContainText('4d ago');
    });

    test('Permissions tab should show correct permissions for viewer', async ({ page }) => {
      // Find a viewer user to click
      // Filter by viewer role first
      await page.getByTestId('role-filter-trigger').click();
      await page.getByTestId('role-filter-option-viewer').click();

      const rows = page.getByTestId('users-table').locator('tbody tr');
      await rows.first().click();

      // Click Permissions tab
      await page.getByTestId('user-detail-tabs-tab-2').click();

      const panel = page.getByTestId('user-detail-tabs-panel');
      await expect(panel).toContainText('Permissions for viewer');

      // Viewer: only "Read content" checked
      const checkboxes = panel.locator('input[type="checkbox"]');
      await expect(checkboxes.nth(0)).toBeChecked(); // Read content
      await expect(checkboxes.nth(1)).not.toBeChecked(); // Write content
      await expect(checkboxes.nth(2)).not.toBeChecked(); // Manage users
      await expect(checkboxes.nth(3)).not.toBeChecked(); // Admin settings
    });

    test('Permissions tab should show correct permissions for admin', async ({ page }) => {
      // Filter by admin role
      await page.getByTestId('role-filter-trigger').click();
      await page.getByTestId('role-filter-option-admin').click();

      const rows = page.getByTestId('users-table').locator('tbody tr');
      await rows.first().click();

      await page.getByTestId('user-detail-tabs-tab-2').click();

      const panel = page.getByTestId('user-detail-tabs-panel');
      await expect(panel).toContainText('Permissions for admin');

      const checkboxes = panel.locator('input[type="checkbox"]');
      await expect(checkboxes.nth(0)).toBeChecked(); // Read content
      await expect(checkboxes.nth(1)).toBeChecked(); // Write content
      await expect(checkboxes.nth(2)).toBeChecked(); // Manage users
      await expect(checkboxes.nth(3)).toBeChecked(); // Admin settings
    });

    test('Permissions tab should show correct permissions for editor', async ({ page }) => {
      // Filter by editor role
      await page.getByTestId('role-filter-trigger').click();
      await page.getByTestId('role-filter-option-editor').click();

      const rows = page.getByTestId('users-table').locator('tbody tr');
      await rows.first().click();

      await page.getByTestId('user-detail-tabs-tab-2').click();

      const panel = page.getByTestId('user-detail-tabs-panel');
      await expect(panel).toContainText('Permissions for editor');

      const checkboxes = panel.locator('input[type="checkbox"]');
      await expect(checkboxes.nth(0)).toBeChecked(); // Read content
      await expect(checkboxes.nth(1)).toBeChecked(); // Write content
      await expect(checkboxes.nth(2)).not.toBeChecked(); // Manage users
      await expect(checkboxes.nth(3)).not.toBeChecked(); // Admin settings
    });

    test('close button should close slide-over', async ({ page }) => {
      const rows = page.getByTestId('users-table').locator('tbody tr');
      await rows.first().click();

      await expect(page.getByTestId('slideover')).toHaveClass(/translate-x-0/);

      await page.getByTestId('slideover-close').click();

      await expect(page.getByTestId('slideover')).toHaveClass(/translate-x-full/);
    });

    test('Escape key should close slide-over', async ({ page }) => {
      const rows = page.getByTestId('users-table').locator('tbody tr');
      await rows.first().click();

      await expect(page.getByTestId('slideover')).toHaveClass(/translate-x-0/);

      await page.keyboard.press('Escape');

      await expect(page.getByTestId('slideover')).toHaveClass(/translate-x-full/);
    });

    test('backdrop click should close slide-over', async ({ page }) => {
      const rows = page.getByTestId('users-table').locator('tbody tr');
      await rows.first().click();

      await expect(page.getByTestId('slideover')).toHaveClass(/translate-x-0/);

      await page.getByTestId('slideover-backdrop').click();

      await expect(page.getByTestId('slideover')).toHaveClass(/translate-x-full/);
    });
  });

  test.describe('Sort Columns', () => {
    test('should have all sortable column headers', async ({ page }) => {
      await expect(page.getByTestId('sort-name')).toBeVisible();
      await expect(page.getByTestId('sort-email')).toBeVisible();
      await expect(page.getByTestId('sort-role')).toBeVisible();
      await expect(page.getByTestId('sort-status')).toBeVisible();
      await expect(page.getByTestId('sort-department')).toBeVisible();
      await expect(page.getByTestId('sort-joinDate')).toBeVisible();
    });
  });
});
