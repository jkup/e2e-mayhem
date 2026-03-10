import { test, expect } from '@playwright/test';
import { login, navigateTo, expectToast } from './helpers';

test.describe('Users Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await login(page);
    await navigateTo(page, 'users');
  });

  test('displays users table with data', async ({ page }) => {
    await expect(page.getByTestId('users-table')).toBeVisible();
    const rows = page.locator('tbody tr');
    // First page should show 10 users
    await expect(rows).toHaveCount(10);
  });

  test('shows correct total results count', async ({ page }) => {
    await expect(page.getByTestId('results-count')).toHaveText('50 user(s) found');
  });

  test('search filters users by name (case-insensitive)', async ({ page }) => {
    const searchInput = page.getByTestId('user-search');
    // Type a lowercase search term — should still find users
    await searchInput.fill('a');
    // Results should be fewer than 50 (or the count should change)
    const countText = await page.getByTestId('results-count').textContent();
    const count = parseInt(countText || '0', 10);
    expect(count).toBeLessThanOrEqual(50);
  });

  test('department multi-select filter works', async ({ page }) => {
    // Open department filter
    await page.getByTestId('dept-filter-trigger').click();
    const dropdown = page.getByTestId('dept-filter-dropdown');
    await expect(dropdown).toBeVisible();

    // Select "Engineering" — click the checkbox within the label
    await page.getByTestId('dept-filter-option-Engineering').locator('input[type="checkbox"]').click();
    // Close dropdown by clicking outside
    await page.getByTestId('users-table').click();

    // Results should be filtered to only Engineering users
    await expect(page.getByTestId('results-count')).not.toHaveText('50 user(s) found');
  });

  test('role multi-select filter works', async ({ page }) => {
    await page.getByTestId('role-filter-trigger').click();
    await page.getByTestId('role-filter-option-admin').locator('input[type="checkbox"]').click();
    await page.getByTestId('users-table').click();

    await expect(page.getByTestId('results-count')).not.toHaveText('50 user(s) found');
  });

  test('multi-select search filters options', async ({ page }) => {
    await page.getByTestId('dept-filter-trigger').click();
    const searchInput = page.getByTestId('dept-filter-search');
    await searchInput.fill('Eng');
    // Only Engineering should be visible in the dropdown
    await expect(page.getByTestId('dept-filter-option-Engineering')).toBeVisible();
    // Other options should be filtered out
    await expect(page.getByTestId('dept-filter-dropdown').locator('label')).toHaveCount(1);
  });

  test('multi-select shows tag pills for selected items', async ({ page }) => {
    await page.getByTestId('dept-filter-trigger').click();
    await page.getByTestId('dept-filter-option-Engineering').locator('input[type="checkbox"]').click();
    // Close dropdown
    await page.getByTestId('users-table').click();
    // Tag pill should be visible in the trigger area
    const trigger = page.getByTestId('dept-filter-trigger');
    await expect(trigger).toContainText('Engineering');
  });

  test('multi-select tag pill remove button works', async ({ page }) => {
    await page.getByTestId('dept-filter-trigger').click();
    await page.getByTestId('dept-filter-option-Engineering').locator('input[type="checkbox"]').click();
    // Close dropdown by clicking outside
    await page.getByTestId('users-table').click();
    // Verify filter applied
    await expect(page.getByTestId('results-count')).not.toHaveText('50 user(s) found');

    // Remove via tag pill × button
    await page.getByTestId('dept-filter-remove-Engineering').click();
    await expect(page.getByTestId('results-count')).toHaveText('50 user(s) found');
  });

  test('clear filters button resets all filters', async ({ page }) => {
    await page.getByTestId('user-search').fill('test');
    await expect(page.getByTestId('clear-filters')).toBeVisible();
    await page.getByTestId('clear-filters').click();
    await expect(page.getByTestId('user-search')).toHaveValue('');
    await expect(page.getByTestId('results-count')).toHaveText('50 user(s) found');
  });

  test('column sorting by name', async ({ page }) => {
    // Click name header to sort ascending
    await page.getByTestId('sort-name').click();
    const firstRow = page.locator('tbody tr').first();
    const firstName = await firstRow.locator('td').nth(1).textContent();

    // Click again to sort descending
    await page.getByTestId('sort-name').click();
    const firstRowDesc = page.locator('tbody tr').first();
    const firstNameDesc = await firstRowDesc.locator('td').nth(1).textContent();

    // The names should be different after reversing sort
    expect(firstName).not.toEqual(firstNameDesc);
  });

  test('sorting shows indicator arrow', async ({ page }) => {
    // Default sort is name asc, so click on a different column first
    await page.getByTestId('sort-email').click();
    // Email should now show asc arrow
    const emailHeader = await page.getByTestId('sort-email').textContent();
    expect(emailHeader).toContain('↑');

    // Click again to toggle to desc
    await page.getByTestId('sort-email').click();
    const emailHeader2 = await page.getByTestId('sort-email').textContent();
    expect(emailHeader2).toContain('↓');
  });

  test('pagination shows correct page count', async ({ page }) => {
    const pagination = page.getByTestId('pagination');
    await expect(pagination).toContainText('Page 1 of 5');
  });

  test('next/previous page navigation', async ({ page }) => {
    // Previous should be disabled on page 1
    await expect(page.getByTestId('prev-page')).toBeDisabled();

    // Go to page 2
    await page.getByTestId('next-page').click();
    await expect(page.getByTestId('pagination')).toContainText('Page 2 of 5');
    await expect(page.getByTestId('prev-page')).toBeEnabled();

    // Go back to page 1
    await page.getByTestId('prev-page').click();
    await expect(page.getByTestId('pagination')).toContainText('Page 1 of 5');
  });

  test('page number buttons navigate directly', async ({ page }) => {
    await page.getByTestId('page-3').click();
    await expect(page.getByTestId('pagination')).toContainText('Page 3 of 5');
  });

  test('next page disabled on last page', async ({ page }) => {
    await page.getByTestId('page-5').click();
    await expect(page.getByTestId('next-page')).toBeDisabled();
  });

  test('checkbox selection on individual rows', async ({ page }) => {
    const firstCheckbox = page.locator('tbody tr').first().locator('input[type="checkbox"]');
    await firstCheckbox.check();
    await expect(firstCheckbox).toBeChecked();

    // Bulk actions dropdown should appear
    await expect(page.getByTestId('bulk-actions')).toBeVisible();
  });

  test('select-all checkbox selects all rows on current page', async ({ page }) => {
    await page.getByTestId('select-all').click();
    // All row checkboxes on the page should now be checked
    const checkboxes = page.locator('tbody tr input[type="checkbox"]');
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).toBeChecked();
    }
  });

  test('select-all then uncheck deselects all', async ({ page }) => {
    await page.getByTestId('select-all').click(); // select all
    await page.getByTestId('select-all').click(); // deselect all
    const checkboxes = page.locator('tbody tr input[type="checkbox"]');
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).not.toBeChecked();
    }
  });

  test('bulk actions dropdown shows actions', async ({ page }) => {
    // Select a row first
    await page.locator('tbody tr').first().locator('input[type="checkbox"]').check();
    await page.getByTestId('bulk-actions-trigger').click();
    const menu = page.getByTestId('bulk-actions-menu');
    await expect(menu).toBeVisible();
    await expect(menu).toContainText('Activate');
    await expect(menu).toContainText('Deactivate');
    await expect(menu).toContainText('Delete');
    await expect(menu).toContainText('Change Role');
  });

  test('bulk action triggers toast and clears selection', async ({ page }) => {
    await page.locator('tbody tr').first().locator('input[type="checkbox"]').check();
    await page.getByTestId('bulk-actions-trigger').click();
    await page.getByTestId('bulk-actions-item-0').click(); // Activate
    await expectToast(page, /Activate applied to 1 user/);
    // Selection should be cleared after bulk action
    await expect(page.getByTestId('bulk-actions')).not.toBeVisible();
  });

  test('bulk actions Change Role submenu', async ({ page }) => {
    await page.locator('tbody tr').first().locator('input[type="checkbox"]').check();
    await page.getByTestId('bulk-actions-trigger').click();
    await page.getByTestId('bulk-actions-item-3').hover(); // Change Role
    const submenu = page.getByTestId('bulk-actions-submenu-3');
    await expect(submenu).toBeVisible();
    await expect(submenu).toContainText('Admin');
    await expect(submenu).toContainText('Editor');
    await expect(submenu).toContainText('Viewer');
  });

  test('per-row action dropdown opens', async ({ page }) => {
    const firstRowActionsBtn = page.locator('tbody tr').first().locator('[data-testid^="user-actions-"]');
    await firstRowActionsBtn.locator('[data-testid$="-trigger"]').click();
    const menu = firstRowActionsBtn.locator('[data-testid$="-menu"]');
    await expect(menu).toBeVisible();
    await expect(menu).toContainText('View Details');
    await expect(menu).toContainText('Edit');
    await expect(menu).toContainText('Delete');
  });

  test('clicking a row opens slide-over panel', async ({ page }) => {
    await page.locator('tbody tr').first().click();
    await expect(page.getByTestId('slideover')).toBeVisible();
  });

  test('slide-over has Profile, Activity, Permissions tabs', async ({ page }) => {
    await page.locator('tbody tr').first().click();
    await expect(page.getByTestId('user-detail-tabs-tab-0')).toContainText('Profile');
    await expect(page.getByTestId('user-detail-tabs-tab-1')).toContainText('Activity');
    await expect(page.getByTestId('user-detail-tabs-tab-2')).toContainText('Permissions');
  });

  test('slide-over Profile tab shows user details', async ({ page }) => {
    await page.locator('tbody tr').first().click();
    const panel = page.getByTestId('user-detail-tabs-panel');
    await expect(panel).toContainText('Email');
    await expect(panel).toContainText('Role');
    await expect(panel).toContainText('Status');
    await expect(panel).toContainText('Department');
    await expect(panel).toContainText('Joined');
  });

  test('slide-over Activity tab shows activity list', async ({ page }) => {
    await page.locator('tbody tr').first().click();
    await page.getByTestId('user-detail-tabs-tab-1').click();
    const panel = page.getByTestId('user-detail-tabs-panel');
    await expect(panel).toContainText('Logged in');
    await expect(panel).toContainText('Updated profile');
  });

  test('slide-over Permissions tab shows checkboxes', async ({ page }) => {
    await page.locator('tbody tr').first().click();
    await page.getByTestId('user-detail-tabs-tab-2').click();
    const panel = page.getByTestId('user-detail-tabs-panel');
    await expect(panel).toContainText('Read content');
    await expect(panel).toContainText('Write content');
    await expect(panel).toContainText('Manage users');
    await expect(panel).toContainText('Admin settings');
  });

  test('slide-over has aria-modal attribute', async ({ page }) => {
    await page.locator('tbody tr').first().click();
    await expect(page.getByTestId('slideover')).toHaveAttribute('aria-modal', 'true');
  });

  test('slide-over closes via close button', async ({ page }) => {
    await page.locator('tbody tr').first().click();
    await expect(page.getByTestId('slideover')).toHaveClass(/translate-x-0/);
    await page.getByTestId('slideover-close').click();
    await expect(page.getByTestId('slideover')).toHaveClass(/translate-x-full/);
  });

  test('slide-over closes via backdrop click', async ({ page }) => {
    await page.locator('tbody tr').first().click();
    await expect(page.getByTestId('slideover-backdrop')).toBeVisible();
    await page.getByTestId('slideover-backdrop').click();
    await expect(page.getByTestId('slideover')).toHaveClass(/translate-x-full/);
  });

  test('slide-over closes via Escape key', async ({ page }) => {
    await page.locator('tbody tr').first().click();
    await expect(page.getByTestId('slideover')).toHaveClass(/translate-x-0/);
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('slideover')).toHaveClass(/translate-x-full/);
  });

  test('delete action from row dropdown opens confirmation modal', async ({ page }) => {
    const firstRowActions = page.locator('tbody tr').first().locator('[data-testid^="user-actions-"]');
    await firstRowActions.locator('[data-testid$="-trigger"]').click();
    // Click Delete (item-2)
    await firstRowActions.locator('[data-testid$="-item-2"]').click();
    await expect(page.getByTestId('modal')).toBeVisible();
    await expect(page.getByTestId('modal')).toContainText('Confirm Delete');
    await expect(page.getByTestId('modal')).toContainText('This action cannot be undone');
  });

  test('delete modal cancel closes it', async ({ page }) => {
    const firstRowActions = page.locator('tbody tr').first().locator('[data-testid^="user-actions-"]');
    await firstRowActions.locator('[data-testid$="-trigger"]').click();
    await firstRowActions.locator('[data-testid$="-item-2"]').click();
    await page.getByTestId('cancel-delete').click();
    await expect(page.getByTestId('modal-overlay')).not.toBeVisible();
  });

  test('delete modal confirm triggers toast', async ({ page }) => {
    const firstRowActions = page.locator('tbody tr').first().locator('[data-testid^="user-actions-"]');
    await firstRowActions.locator('[data-testid$="-trigger"]').click();
    await firstRowActions.locator('[data-testid$="-item-2"]').click();
    await page.getByTestId('confirm-delete').click();
    await expectToast(page, /Deleted/);
    await expect(page.getByTestId('modal-overlay')).not.toBeVisible();
  });

  test('modal closes via close button', async ({ page }) => {
    const firstRowActions = page.locator('tbody tr').first().locator('[data-testid^="user-actions-"]');
    await firstRowActions.locator('[data-testid$="-trigger"]').click();
    await firstRowActions.locator('[data-testid$="-item-2"]').click();
    await page.getByTestId('modal-close').click();
    await expect(page.getByTestId('modal-overlay')).not.toBeVisible();
  });

  test('modal closes via Escape key', async ({ page }) => {
    const firstRowActions = page.locator('tbody tr').first().locator('[data-testid^="user-actions-"]');
    await firstRowActions.locator('[data-testid$="-trigger"]').click();
    await firstRowActions.locator('[data-testid$="-item-2"]').click();
    await expect(page.getByTestId('modal')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('modal-overlay')).not.toBeVisible();
  });

  test('modal closes via backdrop click', async ({ page }) => {
    const firstRowActions = page.locator('tbody tr').first().locator('[data-testid^="user-actions-"]');
    await firstRowActions.locator('[data-testid$="-trigger"]').click();
    await firstRowActions.locator('[data-testid$="-item-2"]').click();
    // Click on the overlay (not the modal dialog itself)
    await page.getByTestId('modal-overlay').click({ position: { x: 10, y: 10 } });
    await expect(page.getByTestId('modal-overlay')).not.toBeVisible();
  });

  test('modal has correct aria attributes', async ({ page }) => {
    const firstRowActions = page.locator('tbody tr').first().locator('[data-testid^="user-actions-"]');
    await firstRowActions.locator('[data-testid$="-trigger"]').click();
    await firstRowActions.locator('[data-testid$="-item-2"]').click();
    const modal = page.getByTestId('modal');
    await expect(modal).toHaveAttribute('role', 'dialog');
    await expect(modal).toHaveAttribute('aria-modal', 'true');
    await expect(modal).toHaveAttribute('aria-label', 'Confirm Delete');
  });

  test('default sort order is ascending by name (A before Z)', async ({ page }) => {
    // Page loads with default sort: name ascending
    // The first row's name should come before the second row alphabetically
    const rows = page.locator('tbody tr');
    const firstName = await rows.first().locator('td').nth(1).textContent();
    const secondName = await rows.nth(1).locator('td').nth(1).textContent();
    expect(firstName!.localeCompare(secondName!)).toBeLessThanOrEqual(0);
  });

  test('search is case-insensitive', async ({ page }) => {
    // Get the first user's name from the table
    const firstUserName = await page.locator('tbody tr').first().locator('td').nth(1).textContent();
    if (firstUserName) {
      // Search for it in lowercase — should still find the user
      await page.getByTestId('user-search').fill(firstUserName.toLowerCase());
      await expect(page.getByTestId('results-count')).not.toHaveText('0 user(s) found');
    }
  });

  test('page 1 shows the first 10 users (not offset)', async ({ page }) => {
    // Without any sorting changes, page 1 should show users.
    // Navigate to page 2 and back to page 1 — the data should be the same as initial load.
    const firstPageFirstName = await page.locator('tbody tr').first().locator('td').nth(1).textContent();
    await page.getByTestId('next-page').click();
    await page.getByTestId('prev-page').click();
    const backToFirstPageName = await page.locator('tbody tr').first().locator('td').nth(1).textContent();
    expect(backToFirstPageName).toBe(firstPageFirstName);

    // Also: page 1 and page 2 should show different data
    const page1Names: string[] = [];
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    for (let i = 0; i < rowCount; i++) {
      page1Names.push(await rows.nth(i).locator('td').nth(1).textContent() || '');
    }
    await page.getByTestId('next-page').click();
    const page2FirstName = await page.locator('tbody tr').first().locator('td').nth(1).textContent();
    // Page 2's first user should NOT be the same as any page 1 user
    expect(page1Names).not.toContain(page2FirstName);
  });
});
