import { test, expect } from '@playwright/test';
import { loginAndNavigate } from './helpers';

test.describe('Users Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, 'users');
  });

  test.describe('Table Display', () => {
    test('displays users table with headers', async ({ page }) => {
      await expect(page.getByTestId('users-table')).toBeVisible();
      await expect(page.getByTestId('sort-name')).toContainText('Name');
      await expect(page.getByTestId('sort-email')).toContainText('Email');
      await expect(page.getByTestId('sort-role')).toContainText('Role');
      await expect(page.getByTestId('sort-status')).toContainText('Status');
      await expect(page.getByTestId('sort-department')).toContainText('Department');
      await expect(page.getByTestId('sort-joinDate')).toContainText('Joined');
    });

    test('shows 10 rows per page', async ({ page }) => {
      const rows = page.getByTestId('users-table').locator('tbody tr');
      await expect(rows).toHaveCount(10);
    });

    test('shows total results count of 50', async ({ page }) => {
      await expect(page.getByTestId('results-count')).toHaveText('50 user(s) found');
    });

    test('first user is Mallory Volkman (default name sort ascending)', async ({ page }) => {
      const firstRow = page.getByTestId('users-table').locator('tbody tr').first();
      await expect(firstRow).toContainText('Mallory Volkman');
    });
  });

  test.describe('Search', () => {
    test('searching filters users by name', async ({ page }) => {
      await page.getByTestId('user-search').fill('Mallory');
      await expect(page.getByTestId('results-count')).not.toHaveText('50 user(s) found');
      const rows = page.getByTestId('users-table').locator('tbody tr');
      const count = await rows.count();
      expect(count).toBeLessThan(10);
    });

    test('search is case-insensitive', async ({ page }) => {
      await page.getByTestId('user-search').fill('mallory');
      // Should find Mallory (case-insensitive match)
      const count = await page.getByTestId('users-table').locator('tbody tr').count();
      expect(count).toBeGreaterThan(0);
    });

    test('searching by email works', async ({ page }) => {
      await page.getByTestId('user-search').fill('hotmail.com');
      const count = await page.getByTestId('users-table').locator('tbody tr').count();
      expect(count).toBeGreaterThan(0);
    });

    test('no results shows empty table', async ({ page }) => {
      await page.getByTestId('user-search').fill('zzzzzzzzzzz');
      await expect(page.getByTestId('results-count')).toHaveText('0 user(s) found');
    });

    test('clear filters button appears when searching', async ({ page }) => {
      await page.getByTestId('user-search').fill('test');
      await expect(page.getByTestId('clear-filters')).toBeVisible();
    });

    test('clear filters resets search and shows all users', async ({ page }) => {
      await page.getByTestId('user-search').fill('test');
      await page.getByTestId('clear-filters').click();
      await expect(page.getByTestId('user-search')).toHaveValue('');
      await expect(page.getByTestId('results-count')).toHaveText('50 user(s) found');
    });
  });

  test.describe('Multi-Select Filters', () => {
    test('department filter opens dropdown with options', async ({ page }) => {
      await page.getByTestId('dept-filter-trigger').click();
      await expect(page.getByTestId('dept-filter-dropdown')).toBeVisible();
      await expect(page.getByTestId('dept-filter-search')).toBeVisible();
    });

    test('selecting a department filters users', async ({ page }) => {
      await page.getByTestId('dept-filter-trigger').click();
      await page.getByTestId('dept-filter-option-Marketing').click();
      // Close dropdown by clicking outside
      await page.locator('main h1').click();
      const countText = await page.getByTestId('results-count').textContent();
      const count = parseInt(countText!);
      expect(count).toBeLessThan(50);
      expect(count).toBeGreaterThan(0);
    });

    test('department filter shows selected tag pill', async ({ page }) => {
      await page.getByTestId('dept-filter-trigger').click();
      await page.getByTestId('dept-filter-option-Marketing').click();
      await page.locator('main h1').click();
      await expect(page.getByTestId('dept-filter-trigger')).toContainText('Marketing');
    });

    test('remove tag pill deselects filter', async ({ page }) => {
      await page.getByTestId('dept-filter-trigger').click();
      await page.getByTestId('dept-filter-option-Marketing').click();
      await page.locator('main h1').click();
      await page.getByTestId('dept-filter-remove-Marketing').click();
      await expect(page.getByTestId('results-count')).toHaveText('50 user(s) found');
    });

    test('role filter works', async ({ page }) => {
      await page.getByTestId('role-filter-trigger').click();
      await page.getByTestId('role-filter-option-admin').click();
      await page.locator('main h1').click();
      const countText = await page.getByTestId('results-count').textContent();
      const count = parseInt(countText!);
      expect(count).toBeLessThan(50);
      expect(count).toBeGreaterThan(0);
    });

    test('multiselect search filters options', async ({ page }) => {
      await page.getByTestId('dept-filter-trigger').click();
      await page.getByTestId('dept-filter-search').fill('Eng');
      await expect(page.getByTestId('dept-filter-option-Engineering')).toBeVisible();
      // Other departments should be hidden
      await expect(page.getByTestId('dept-filter-option-Marketing')).not.toBeVisible();
    });

    test('combining department and role filters', async ({ page }) => {
      await page.getByTestId('dept-filter-trigger').click();
      await page.getByTestId('dept-filter-option-Marketing').click();
      await page.locator('main h1').click();

      await page.getByTestId('role-filter-trigger').click();
      await page.getByTestId('role-filter-option-admin').click();
      await page.locator('main h1').click();

      const countText = await page.getByTestId('results-count').textContent();
      const count = parseInt(countText!);
      expect(count).toBeLessThan(50);
    });
  });

  test.describe('Sorting', () => {
    test('default sort is by name ascending', async ({ page }) => {
      await expect(page.getByTestId('sort-name')).toContainText('↑');
    });

    test('clicking name header toggles sort direction', async ({ page }) => {
      await page.getByTestId('sort-name').click();
      await expect(page.getByTestId('sort-name')).toContainText('↓');
    });

    test('clicking a different column changes sort key', async ({ page }) => {
      await page.getByTestId('sort-email').click();
      await expect(page.getByTestId('sort-email')).toContainText('↑');
      // Name should no longer show sort indicator
      const nameText = await page.getByTestId('sort-name').textContent();
      expect(nameText).not.toContain('↑');
      expect(nameText).not.toContain('↓');
    });

    test('sorting by role groups users', async ({ page }) => {
      await page.getByTestId('sort-role').click();
      const firstRow = page.getByTestId('users-table').locator('tbody tr').first();
      const firstRole = await firstRow.locator('td').nth(3).textContent();
      expect(firstRole).toBeTruthy();
    });

    test('sorting by department works', async ({ page }) => {
      await page.getByTestId('sort-department').click();
      const firstRow = page.getByTestId('users-table').locator('tbody tr').first();
      await expect(firstRow).toBeVisible();
    });
  });

  test.describe('Pagination', () => {
    test('shows pagination with 5 pages', async ({ page }) => {
      await expect(page.getByTestId('pagination')).toContainText('Page 1 of 5');
      await expect(page.getByTestId('page-1')).toBeVisible();
      await expect(page.getByTestId('page-5')).toBeVisible();
    });

    test('Previous button is disabled on page 1', async ({ page }) => {
      await expect(page.getByTestId('prev-page')).toBeDisabled();
    });

    test('clicking Next goes to page 2', async ({ page }) => {
      await page.getByTestId('next-page').click();
      await expect(page.getByTestId('pagination')).toContainText('Page 2 of 5');
    });

    test('clicking a page number navigates to that page', async ({ page }) => {
      await page.getByTestId('page-3').click();
      await expect(page.getByTestId('pagination')).toContainText('Page 3 of 5');
    });

    test('Previous button works after navigating forward', async ({ page }) => {
      await page.getByTestId('next-page').click();
      await expect(page.getByTestId('prev-page')).not.toBeDisabled();
      await page.getByTestId('prev-page').click();
      await expect(page.getByTestId('pagination')).toContainText('Page 1 of 5');
    });

    test('Next button is disabled on last page', async ({ page }) => {
      await page.getByTestId('page-5').click();
      await expect(page.getByTestId('next-page')).toBeDisabled();
    });

    test('different users shown on different pages', async ({ page }) => {
      const firstPageFirstUser = await page.getByTestId('users-table').locator('tbody tr').first().locator('td').nth(1).textContent();
      await page.getByTestId('page-2').click();
      const secondPageFirstUser = await page.getByTestId('users-table').locator('tbody tr').first().locator('td').nth(1).textContent();
      expect(firstPageFirstUser).not.toBe(secondPageFirstUser);
    });
  });

  test.describe('Row Selection', () => {
    test('select all checkbox selects all visible rows', async ({ page }) => {
      await page.getByTestId('select-all').check();
      const checkboxes = page.getByTestId('users-table').locator('tbody input[type="checkbox"]');
      const count = await checkboxes.count();
      for (let i = 0; i < count; i++) {
        await expect(checkboxes.nth(i)).toBeChecked();
      }
    });

    test('selecting rows shows bulk actions button', async ({ page }) => {
      const firstCheckbox = page.getByTestId('users-table').locator('tbody input[type="checkbox"]').first();
      await firstCheckbox.check();
      await expect(page.getByTestId('bulk-actions')).toBeVisible();
    });

    test('individual row checkbox toggles selection', async ({ page }) => {
      const firstCheckbox = page.getByTestId('users-table').locator('tbody input[type="checkbox"]').first();
      await firstCheckbox.check();
      await expect(firstCheckbox).toBeChecked();
      await firstCheckbox.uncheck();
      await expect(firstCheckbox).not.toBeChecked();
    });

    test('unchecking select-all deselects all', async ({ page }) => {
      await page.getByTestId('select-all').check();
      await page.getByTestId('select-all').uncheck();
      const checkboxes = page.getByTestId('users-table').locator('tbody input[type="checkbox"]');
      const count = await checkboxes.count();
      for (let i = 0; i < count; i++) {
        await expect(checkboxes.nth(i)).not.toBeChecked();
      }
    });
  });

  test.describe('Bulk Actions', () => {
    test.beforeEach(async ({ page }) => {
      const firstCheckbox = page.getByTestId('users-table').locator('tbody input[type="checkbox"]').first();
      await firstCheckbox.check();
    });

    test('bulk actions dropdown shows all options', async ({ page }) => {
      await page.getByTestId('bulk-actions-trigger').click();
      await expect(page.getByTestId('bulk-actions-menu')).toBeVisible();
      await expect(page.getByTestId('bulk-actions-item-0')).toHaveText('Activate');
      await expect(page.getByTestId('bulk-actions-item-1')).toHaveText('Deactivate');
      await expect(page.getByTestId('bulk-actions-item-2')).toHaveText('Delete');
      await expect(page.getByTestId('bulk-actions-item-3')).toContainText('Change Role');
    });

    test('Activate bulk action shows toast', async ({ page }) => {
      await page.getByTestId('bulk-actions-trigger').click();
      await page.getByTestId('bulk-actions-item-0').click();
      await expect(page.getByRole('alert')).toContainText('Activate');
    });

    test('Change Role submenu appears', async ({ page }) => {
      await page.getByTestId('bulk-actions-trigger').click();
      await page.getByTestId('bulk-actions-item-3').hover();
      await expect(page.getByTestId('bulk-actions-submenu-3')).toBeVisible();
      await expect(page.getByTestId('bulk-actions-subitem-3-0')).toHaveText('Admin');
      await expect(page.getByTestId('bulk-actions-subitem-3-1')).toHaveText('Editor');
      await expect(page.getByTestId('bulk-actions-subitem-3-2')).toHaveText('Viewer');
    });

    test('Change Role submenu action shows toast', async ({ page }) => {
      await page.getByTestId('bulk-actions-trigger').click();
      await page.getByTestId('bulk-actions-item-3').hover();
      await page.getByTestId('bulk-actions-subitem-3-0').click();
      await expect(page.getByRole('alert')).toContainText('Set role to Admin');
    });

    test('bulk action clears selection', async ({ page }) => {
      await page.getByTestId('bulk-actions-trigger').click();
      await page.getByTestId('bulk-actions-item-0').click();
      // Selection should be cleared, hiding the bulk actions button
      await expect(page.getByTestId('bulk-actions')).not.toBeVisible();
    });
  });

  test.describe('Per-Row Actions', () => {
    test('row actions dropdown shows options', async ({ page }) => {
      const firstRowActions = page.locator('[data-testid$="-trigger"]').filter({ hasText: '⋯' }).first();
      await firstRowActions.click();
      // Should see View Details, Edit, Delete
      await expect(page.locator('[data-testid$="-menu"]').last().locator('button')).toHaveCount(3);
    });

    test('Edit action shows toast', async ({ page }) => {
      const firstRowActions = page.locator('[data-testid$="-trigger"]').filter({ hasText: '⋯' }).first();
      await firstRowActions.click();
      const menu = page.locator('[data-testid$="-menu"]').last();
      await menu.locator('button').nth(1).click(); // Edit
      await expect(page.getByRole('alert')).toContainText('Editing');
    });

    test('Delete action opens confirmation modal', async ({ page }) => {
      const firstRowActions = page.locator('[data-testid$="-trigger"]').filter({ hasText: '⋯' }).first();
      await firstRowActions.click();
      const menu = page.locator('[data-testid$="-menu"]').last();
      await menu.locator('button').nth(2).click(); // Delete
      await expect(page.getByTestId('modal')).toBeVisible();
      await expect(page.getByTestId('modal')).toContainText('Confirm Delete');
      await expect(page.getByTestId('modal')).toContainText('Are you sure you want to delete');
    });

    test('cancel delete closes modal', async ({ page }) => {
      const firstRowActions = page.locator('[data-testid$="-trigger"]').filter({ hasText: '⋯' }).first();
      await firstRowActions.click();
      const menu = page.locator('[data-testid$="-menu"]').last();
      await menu.locator('button').nth(2).click();
      await page.getByTestId('cancel-delete').click();
      await expect(page.getByTestId('modal')).not.toBeVisible();
    });

    test('confirm delete shows toast and closes modal', async ({ page }) => {
      const firstRowActions = page.locator('[data-testid$="-trigger"]').filter({ hasText: '⋯' }).first();
      await firstRowActions.click();
      const menu = page.locator('[data-testid$="-menu"]').last();
      await menu.locator('button').nth(2).click();
      await page.getByTestId('confirm-delete').click();
      await expect(page.getByRole('alert')).toContainText('Deleted');
      await expect(page.getByTestId('modal')).not.toBeVisible();
    });

    test('modal close button closes modal', async ({ page }) => {
      const firstRowActions = page.locator('[data-testid$="-trigger"]').filter({ hasText: '⋯' }).first();
      await firstRowActions.click();
      const menu = page.locator('[data-testid$="-menu"]').last();
      await menu.locator('button').nth(2).click();
      await page.getByTestId('modal-close').click();
      await expect(page.getByTestId('modal')).not.toBeVisible();
    });

    test('pressing Escape closes delete modal', async ({ page }) => {
      const firstRowActions = page.locator('[data-testid$="-trigger"]').filter({ hasText: '⋯' }).first();
      await firstRowActions.click();
      const menu = page.locator('[data-testid$="-menu"]').last();
      await menu.locator('button').nth(2).click();
      await expect(page.getByTestId('modal')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByTestId('modal')).not.toBeVisible();
    });

    test('clicking modal backdrop closes modal', async ({ page }) => {
      const firstRowActions = page.locator('[data-testid$="-trigger"]').filter({ hasText: '⋯' }).first();
      await firstRowActions.click();
      const menu = page.locator('[data-testid$="-menu"]').last();
      await menu.locator('button').nth(2).click();
      await expect(page.getByTestId('modal')).toBeVisible();
      // Click overlay (not the modal dialog itself)
      await page.getByTestId('modal-overlay').click({ position: { x: 10, y: 10 } });
      await expect(page.getByTestId('modal')).not.toBeVisible();
    });
  });

  test.describe('SlideOver Panel', () => {
    test('clicking a row opens slide-over panel', async ({ page }) => {
      const firstRowName = page.getByTestId('users-table').locator('tbody tr').first().locator('td').nth(1);
      await firstRowName.click();
      await expect(page.getByTestId('slideover')).toBeVisible();
    });

    test('slide-over shows user name as title', async ({ page }) => {
      const firstRowName = page.getByTestId('users-table').locator('tbody tr').first().locator('td').nth(1);
      const name = await firstRowName.textContent();
      await firstRowName.click();
      await expect(page.getByTestId('slideover')).toContainText(name!);
    });

    test('slide-over has Profile, Activity, Permissions tabs', async ({ page }) => {
      await page.getByTestId('users-table').locator('tbody tr').first().locator('td').nth(1).click();
      await expect(page.getByTestId('user-detail-tabs-tab-0')).toHaveText('Profile');
      await expect(page.getByTestId('user-detail-tabs-tab-1')).toHaveText('Activity');
      await expect(page.getByTestId('user-detail-tabs-tab-2')).toHaveText('Permissions');
    });

    test('Profile tab shows user details', async ({ page }) => {
      await page.getByTestId('users-table').locator('tbody tr').first().locator('td').nth(1).click();
      const panel = page.getByTestId('user-detail-tabs-panel');
      await expect(panel).toContainText('Email');
      await expect(panel).toContainText('Role');
      await expect(panel).toContainText('Status');
      await expect(panel).toContainText('Department');
      await expect(panel).toContainText('Joined');
    });

    test('Activity tab shows activity list', async ({ page }) => {
      await page.getByTestId('users-table').locator('tbody tr').first().locator('td').nth(1).click();
      await page.getByTestId('user-detail-tabs-tab-1').click();
      const panel = page.getByTestId('user-detail-tabs-panel');
      await expect(panel).toContainText('Logged in');
      await expect(panel).toContainText('Updated profile');
      await expect(panel).toContainText('Uploaded a file');
      await expect(panel).toContainText('Commented on a task');
    });

    test('Permissions tab shows permission checkboxes', async ({ page }) => {
      await page.getByTestId('users-table').locator('tbody tr').first().locator('td').nth(1).click();
      await page.getByTestId('user-detail-tabs-tab-2').click();
      const panel = page.getByTestId('user-detail-tabs-panel');
      await expect(panel).toContainText('Read content');
      await expect(panel).toContainText('Write content');
      await expect(panel).toContainText('Manage users');
      await expect(panel).toContainText('Admin settings');
    });

    test('switching tabs updates panel content', async ({ page }) => {
      await page.getByTestId('users-table').locator('tbody tr').first().locator('td').nth(1).click();
      // Start on Profile
      await expect(page.getByTestId('user-detail-tabs-tab-0')).toHaveAttribute('aria-selected', 'true');
      // Switch to Activity
      await page.getByTestId('user-detail-tabs-tab-1').click();
      await expect(page.getByTestId('user-detail-tabs-tab-1')).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByTestId('user-detail-tabs-tab-0')).toHaveAttribute('aria-selected', 'false');
    });

    test('close button closes slide-over', async ({ page }) => {
      await page.getByTestId('users-table').locator('tbody tr').first().locator('td').nth(1).click();
      await expect(page.getByTestId('slideover')).toHaveClass(/translate-x-0/);
      await page.getByTestId('slideover-close').click();
      await expect(page.getByTestId('slideover')).toHaveClass(/translate-x-full/);
    });

    test('pressing Escape closes slide-over', async ({ page }) => {
      await page.getByTestId('users-table').locator('tbody tr').first().locator('td').nth(1).click();
      await expect(page.getByTestId('slideover')).toHaveClass(/translate-x-0/);
      await page.keyboard.press('Escape');
      await expect(page.getByTestId('slideover')).toHaveClass(/translate-x-full/);
    });

    test('clicking backdrop closes slide-over', async ({ page }) => {
      await page.getByTestId('users-table').locator('tbody tr').first().locator('td').nth(1).click();
      await expect(page.getByTestId('slideover-backdrop')).toBeVisible();
      await page.getByTestId('slideover-backdrop').click();
      await expect(page.getByTestId('slideover')).toHaveClass(/translate-x-full/);
    });

    test('slide-over has correct aria role', async ({ page }) => {
      await page.getByTestId('users-table').locator('tbody tr').first().locator('td').nth(1).click();
      await expect(page.getByTestId('slideover')).toHaveAttribute('role', 'dialog');
    });

    test('slide-over has aria-modal attribute', async ({ page }) => {
      await page.getByTestId('users-table').locator('tbody tr').first().locator('td').nth(1).click();
      await expect(page.getByTestId('slideover')).toHaveAttribute('aria-modal', 'true');
    });
  });
});
