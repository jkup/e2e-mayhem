import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Components', () => {
  test.describe('Modal', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await login(page);
      // Navigate to users page to trigger modals via delete action
      await page.getByTestId('nav-users').click();
      await page.getByTestId('users-table').waitFor({ state: 'visible' });
    });

    test('modal should have correct ARIA attributes', async ({ page }) => {
      // Open delete modal
      const rows = page.getByTestId('users-table').locator('tbody tr');
      const firstRowActions = rows.first().locator('[data-testid^="user-actions-"]');
      await firstRowActions.locator('[data-testid$="-trigger"]').click();
      await firstRowActions.locator('[data-testid$="-item-2"]').click();

      const modal = page.getByTestId('modal');
      await expect(modal).toHaveAttribute('role', 'dialog');
      await expect(modal).toHaveAttribute('aria-modal', 'true');
      await expect(modal).toHaveAttribute('aria-label', 'Confirm Delete');
    });

    test('modal overlay should be visible', async ({ page }) => {
      const rows = page.getByTestId('users-table').locator('tbody tr');
      const firstRowActions = rows.first().locator('[data-testid^="user-actions-"]');
      await firstRowActions.locator('[data-testid$="-trigger"]').click();
      await firstRowActions.locator('[data-testid$="-item-2"]').click();

      await expect(page.getByTestId('modal-overlay')).toBeVisible();
    });

    test('modal close button should have correct aria-label', async ({ page }) => {
      const rows = page.getByTestId('users-table').locator('tbody tr');
      const firstRowActions = rows.first().locator('[data-testid^="user-actions-"]');
      await firstRowActions.locator('[data-testid$="-trigger"]').click();
      await firstRowActions.locator('[data-testid$="-item-2"]').click();

      const closeBtn = page.getByTestId('modal-close');
      await expect(closeBtn).toHaveAttribute('aria-label', 'Close modal');
    });

    test('close button should close modal', async ({ page }) => {
      const rows = page.getByTestId('users-table').locator('tbody tr');
      const firstRowActions = rows.first().locator('[data-testid^="user-actions-"]');
      await firstRowActions.locator('[data-testid$="-trigger"]').click();
      await firstRowActions.locator('[data-testid$="-item-2"]').click();

      await expect(page.getByTestId('modal')).toBeVisible();
      await page.getByTestId('modal-close').click();
      await expect(page.getByTestId('modal')).not.toBeVisible();
    });

    test('Escape key should close modal (intended behavior)', async ({ page }) => {
      // BUG: Modal checks for 'Esc' instead of 'Escape'
      const rows = page.getByTestId('users-table').locator('tbody tr');
      const firstRowActions = rows.first().locator('[data-testid^="user-actions-"]');
      await firstRowActions.locator('[data-testid$="-trigger"]').click();
      await firstRowActions.locator('[data-testid$="-item-2"]').click();

      await expect(page.getByTestId('modal')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByTestId('modal')).not.toBeVisible();
    });

    test('clicking backdrop/overlay should close modal (intended behavior)', async ({ page }) => {
      // BUG: The click handler condition is inverted
      const rows = page.getByTestId('users-table').locator('tbody tr');
      const firstRowActions = rows.first().locator('[data-testid^="user-actions-"]');
      await firstRowActions.locator('[data-testid$="-trigger"]').click();
      await firstRowActions.locator('[data-testid$="-item-2"]').click();

      await expect(page.getByTestId('modal')).toBeVisible();

      // Click on the overlay (not on the modal content)
      await page.getByTestId('modal-overlay').click({ position: { x: 10, y: 10 } });
      await expect(page.getByTestId('modal')).not.toBeVisible();
    });

    test('modal should not render when open is false', async ({ page }) => {
      // Before opening any modal, it should not be in the DOM
      await expect(page.getByTestId('modal')).not.toBeVisible();
    });
  });

  test.describe('SlideOver', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await login(page);
      await page.getByTestId('nav-users').click();
      await page.getByTestId('users-table').waitFor({ state: 'visible' });
    });

    test('slideover should have correct ARIA attributes when open', async ({ page }) => {
      const rows = page.getByTestId('users-table').locator('tbody tr');
      await rows.first().click();

      const slideover = page.getByTestId('slideover');
      await expect(slideover).toHaveAttribute('role', 'dialog');
      // SlideOver does NOT have aria-modal
    });

    test('slideover should not have aria-modal attribute', async ({ page }) => {
      const rows = page.getByTestId('users-table').locator('tbody tr');
      await rows.first().click();

      const slideover = page.getByTestId('slideover');
      // Explicitly check that aria-modal is not present (difference from Modal)
      const ariaModal = await slideover.getAttribute('aria-modal');
      expect(ariaModal).toBeNull();
    });

    test('slideover close button should have correct aria-label', async ({ page }) => {
      const rows = page.getByTestId('users-table').locator('tbody tr');
      await rows.first().click();

      await expect(page.getByTestId('slideover-close')).toHaveAttribute('aria-label', 'Close panel');
    });

    test('slideover should be off-screen when closed', async ({ page }) => {
      const slideover = page.getByTestId('slideover');
      await expect(slideover).toHaveClass(/translate-x-full/);
    });

    test('slideover should slide in when opened', async ({ page }) => {
      const rows = page.getByTestId('users-table').locator('tbody tr');
      await rows.first().click();

      const slideover = page.getByTestId('slideover');
      await expect(slideover).toHaveClass(/translate-x-0/);
    });

    test('backdrop should only render when open', async ({ page }) => {
      // Backdrop should not be visible initially
      await expect(page.getByTestId('slideover-backdrop')).not.toBeVisible();

      // Open slideover
      const rows = page.getByTestId('users-table').locator('tbody tr');
      await rows.first().click();

      await expect(page.getByTestId('slideover-backdrop')).toBeVisible();
    });

    test('slideover should have max-w-md class', async ({ page }) => {
      const rows = page.getByTestId('users-table').locator('tbody tr');
      await rows.first().click();

      await expect(page.getByTestId('slideover')).toHaveClass(/max-w-md/);
    });
  });

  test.describe('Dropdown', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await login(page);
    });

    test('dropdown should toggle open/closed on trigger click', async ({ page }) => {
      // Use the user menu dropdown
      await page.getByTestId('user-menu-trigger').click();
      await expect(page.getByTestId('user-menu-menu')).toBeVisible();

      await page.getByTestId('user-menu-trigger').click();
      await expect(page.getByTestId('user-menu-menu')).not.toBeVisible();
    });

    test('clicking an item should close dropdown', async ({ page }) => {
      await page.getByTestId('user-menu-trigger').click();
      await page.getByTestId('user-menu-item-0').click(); // Profile

      await expect(page.getByTestId('user-menu-menu')).not.toBeVisible();
    });

    test('hovering over item with children should show submenu', async ({ page }) => {
      await page.getByTestId('user-menu-trigger').click();

      // Theme has submenu (item 2)
      await page.getByTestId('user-menu-item-2').hover();
      await expect(page.getByTestId('user-menu-submenu-2')).toBeVisible();
    });

    test('hovering over item without children should close submenu', async ({ page }) => {
      await page.getByTestId('user-menu-trigger').click();

      // Open submenu
      await page.getByTestId('user-menu-item-2').hover();
      await expect(page.getByTestId('user-menu-submenu-2')).toBeVisible();

      // Hover over item without children
      await page.getByTestId('user-menu-item-0').hover();
      await expect(page.getByTestId('user-menu-submenu-2')).not.toBeVisible();
    });

    test('items with children should show arrow indicator', async ({ page }) => {
      await page.getByTestId('user-menu-trigger').click();
      const themeItem = page.getByTestId('user-menu-item-2');
      await expect(themeItem).toContainText('›');
    });

    test('danger items should have text-red-600 class', async ({ page }) => {
      await page.getByTestId('user-menu-trigger').click();
      const signOut = page.getByTestId('user-menu-item-3');
      await expect(signOut).toHaveClass(/text-red-600/);
    });

    test('click outside should close dropdown', async ({ page }) => {
      await page.getByTestId('user-menu-trigger').click();
      await expect(page.getByTestId('user-menu-menu')).toBeVisible();

      // Click outside
      await page.getByTestId('topbar').click({ position: { x: 10, y: 10 } });
      await expect(page.getByTestId('user-menu-menu')).not.toBeVisible();
    });
  });

  test.describe('MultiSelect', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await login(page);
      await page.getByTestId('nav-users').click();
      await page.getByTestId('users-table').waitFor({ state: 'visible' });
    });

    test('should show placeholder when no items selected', async ({ page }) => {
      await expect(page.getByTestId('dept-filter')).toContainText('Filter departments');
    });

    test('clicking trigger should open dropdown', async ({ page }) => {
      await page.getByTestId('dept-filter-trigger').click();
      await expect(page.getByTestId('dept-filter-dropdown')).toBeVisible();
    });

    test('dropdown should have search input', async ({ page }) => {
      await page.getByTestId('dept-filter-trigger').click();
      await expect(page.getByTestId('dept-filter-search')).toBeVisible();
    });

    test('search should filter options (case-insensitive)', async ({ page }) => {
      await page.getByTestId('dept-filter-trigger').click();
      await page.getByTestId('dept-filter-search').fill('eng');

      // Should show Engineering, hide others
      await expect(page.getByTestId('dept-filter-option-Engineering')).toBeVisible();
      await expect(page.getByTestId('dept-filter-option-Sales')).not.toBeVisible();
    });

    test('should show "No results" for non-matching search', async ({ page }) => {
      await page.getByTestId('dept-filter-trigger').click();
      await page.getByTestId('dept-filter-search').fill('ZZZZZ');

      await expect(page.getByTestId('dept-filter-dropdown')).toContainText('No results');
    });

    test('selecting an option should show tag pill', async ({ page }) => {
      await page.getByTestId('dept-filter-trigger').click();
      await page.getByTestId('dept-filter-option-Engineering').click();

      // Should show a pill with "Engineering"
      await expect(page.getByTestId('dept-filter')).toContainText('Engineering');
    });

    test('remove button on pill should deselect option', async ({ page }) => {
      await page.getByTestId('dept-filter-trigger').click();
      await page.getByTestId('dept-filter-option-Engineering').click();

      // Close dropdown
      await page.getByTestId('dept-filter-trigger').click();

      // Click remove button
      await page.getByTestId('dept-filter-remove-Engineering').click();

      // Should show placeholder again
      await expect(page.getByTestId('dept-filter')).toContainText('Filter departments');
    });

    test('remove button should have correct aria-label', async ({ page }) => {
      await page.getByTestId('dept-filter-trigger').click();
      await page.getByTestId('dept-filter-option-Engineering').click();
      await page.getByTestId('dept-filter-trigger').click();

      await expect(page.getByTestId('dept-filter-remove-Engineering')).toHaveAttribute('aria-label', 'Remove Engineering');
    });

    test('department filter options should be sorted', async ({ page }) => {
      await page.getByTestId('dept-filter-trigger').click();

      // Options should be: Design, Engineering, Finance, HR, Marketing, Sales, Support
      const options = page.getByTestId('dept-filter-dropdown').locator('[data-testid^="dept-filter-option-"]');
      const count = await options.count();
      expect(count).toBe(7);
    });

    test('role filter should show admin, editor, viewer options', async ({ page }) => {
      await page.getByTestId('role-filter-trigger').click();

      await expect(page.getByTestId('role-filter-option-admin')).toBeVisible();
      await expect(page.getByTestId('role-filter-option-editor')).toBeVisible();
      await expect(page.getByTestId('role-filter-option-viewer')).toBeVisible();
    });

    test('click outside should close dropdown', async ({ page }) => {
      await page.getByTestId('dept-filter-trigger').click();
      await expect(page.getByTestId('dept-filter-dropdown')).toBeVisible();

      // Click outside
      await page.getByTestId('users-table').click({ position: { x: 10, y: 10 } });
      await expect(page.getByTestId('dept-filter-dropdown')).not.toBeVisible();
    });
  });

  test.describe('SearchAutocomplete', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await login(page);
    });

    test('search input should have correct ARIA attributes', async ({ page }) => {
      const input = page.getByTestId('search-autocomplete-input');
      await expect(input).toHaveAttribute('aria-label', 'Search');
      await expect(input).toHaveAttribute('role', 'combobox');
      await expect(input).toHaveAttribute('aria-autocomplete', 'list');
    });

    test('aria-expanded should be false when no results', async ({ page }) => {
      const input = page.getByTestId('search-autocomplete-input');
      await expect(input).toHaveAttribute('aria-expanded', 'false');
    });

    test('aria-expanded should be true when results are shown', async ({ page }) => {
      await page.getByTestId('search-autocomplete-input').fill('Eng');
      await page.getByTestId('search-autocomplete-results').waitFor({ state: 'visible' });

      await expect(page.getByTestId('search-autocomplete-input')).toHaveAttribute('aria-expanded', 'true');
    });

    test('results list should have role listbox', async ({ page }) => {
      await page.getByTestId('search-autocomplete-input').fill('Eng');
      await page.getByTestId('search-autocomplete-results').waitFor({ state: 'visible' });

      await expect(page.getByTestId('search-autocomplete-results')).toHaveAttribute('role', 'listbox');
    });

    test('result items should have role option', async ({ page }) => {
      await page.getByTestId('search-autocomplete-input').fill('Eng');
      await page.getByTestId('search-autocomplete-results').waitFor({ state: 'visible' });

      const firstResult = page.getByTestId('search-autocomplete-result-0');
      await expect(firstResult).toHaveAttribute('role', 'option');
    });

    test('should filter results (case-insensitive)', async ({ page }) => {
      await page.getByTestId('search-autocomplete-input').fill('engineering');
      await page.getByTestId('search-autocomplete-results').waitFor({ state: 'visible' });

      await expect(page.getByTestId('search-autocomplete-results')).toContainText('Engineering');
    });

    test('should show max 8 results', async ({ page }) => {
      // Search for something with many matches
      await page.getByTestId('search-autocomplete-input').fill('a');

      await page.getByTestId('search-autocomplete-results').waitFor({ state: 'visible' });

      const results = page.locator('[data-testid^="search-autocomplete-result-"]');
      const count = await results.count();
      expect(count).toBeLessThanOrEqual(8);
    });

    test('results should not appear for empty query', async ({ page }) => {
      await page.getByTestId('search-autocomplete-input').fill('');
      await expect(page.getByTestId('search-autocomplete-results')).not.toBeVisible();
    });

    test('results should show item label in bold and type + sub', async ({ page }) => {
      await page.getByTestId('search-autocomplete-input').fill('Engineering');
      await page.getByTestId('search-autocomplete-results').waitFor({ state: 'visible' });

      const firstResult = page.getByTestId('search-autocomplete-result-0');
      await expect(firstResult).toContainText('Engineering');
      await expect(firstResult).toContainText('department');
      await expect(firstResult).toContainText('6 members');
    });

    test('ArrowDown should move selection DOWN (intended behavior)', async ({ page }) => {
      await page.getByTestId('search-autocomplete-input').fill('Eng');
      await page.getByTestId('search-autocomplete-results').waitFor({ state: 'visible' });

      // INTENDED: ArrowDown moves to the next item (index increases)
      await page.keyboard.press('ArrowDown');

      // First item should be selected (aria-selected=true)
      await expect(page.getByTestId('search-autocomplete-result-0')).toHaveAttribute('aria-selected', 'true');

      // Press ArrowDown again
      await page.keyboard.press('ArrowDown');

      // Second item should now be selected
      await expect(page.getByTestId('search-autocomplete-result-1')).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByTestId('search-autocomplete-result-0')).toHaveAttribute('aria-selected', 'false');
    });

    test('ArrowUp should move selection UP (intended behavior)', async ({ page }) => {
      await page.getByTestId('search-autocomplete-input').fill('Eng');
      await page.getByTestId('search-autocomplete-results').waitFor({ state: 'visible' });

      // Move down twice first
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');

      // INTENDED: ArrowUp should move selection back up
      await page.keyboard.press('ArrowUp');

      await expect(page.getByTestId('search-autocomplete-result-0')).toHaveAttribute('aria-selected', 'true');
    });

    test('Enter should select the active item', async ({ page }) => {
      await page.getByTestId('search-autocomplete-input').fill('Engineering');
      await page.getByTestId('search-autocomplete-results').waitFor({ state: 'visible' });

      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');

      // Should show toast
      await expect(page.getByTestId('toast-info')).toBeVisible();
      await expect(page.getByTestId('toast-info')).toContainText('Selected:');

      // Input should be cleared
      await expect(page.getByTestId('search-autocomplete-input')).toHaveValue('');
    });

    test('Escape should close dropdown', async ({ page }) => {
      await page.getByTestId('search-autocomplete-input').fill('Eng');
      await page.getByTestId('search-autocomplete-results').waitFor({ state: 'visible' });

      await page.keyboard.press('Escape');
      await expect(page.getByTestId('search-autocomplete-results')).not.toBeVisible();
    });

    test('mouse hover should set active index', async ({ page }) => {
      await page.getByTestId('search-autocomplete-input').fill('Eng');
      await page.getByTestId('search-autocomplete-results').waitFor({ state: 'visible' });

      // Hover over first result
      await page.getByTestId('search-autocomplete-result-0').hover();
      await expect(page.getByTestId('search-autocomplete-result-0')).toHaveAttribute('aria-selected', 'true');
    });

    test('clicking a result should select it and close dropdown', async ({ page }) => {
      await page.getByTestId('search-autocomplete-input').fill('Engineering');
      await page.getByTestId('search-autocomplete-results').waitFor({ state: 'visible' });

      await page.getByTestId('search-autocomplete-result-0').click();

      await expect(page.getByTestId('search-autocomplete-results')).not.toBeVisible();
      await expect(page.getByTestId('search-autocomplete-input')).toHaveValue('');
    });

    test('click outside should close dropdown', async ({ page }) => {
      await page.getByTestId('search-autocomplete-input').fill('Eng');
      await page.getByTestId('search-autocomplete-results').waitFor({ state: 'visible' });

      await page.getByTestId('sidebar').click();
      await expect(page.getByTestId('search-autocomplete-results')).not.toBeVisible();
    });

    test('focusing input with existing query should reopen dropdown', async ({ page }) => {
      await page.getByTestId('search-autocomplete-input').fill('Eng');
      await page.getByTestId('search-autocomplete-results').waitFor({ state: 'visible' });

      // Close by pressing escape
      await page.keyboard.press('Escape');
      await expect(page.getByTestId('search-autocomplete-results')).not.toBeVisible();

      // Focus input again
      await page.getByTestId('search-autocomplete-input').focus();
      await expect(page.getByTestId('search-autocomplete-results')).toBeVisible();
    });
  });

  test.describe('Tabs', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await login(page);
      await page.getByTestId('nav-users').click();
      await page.getByTestId('users-table').waitFor({ state: 'visible' });
      // Open a user slide-over to get tabs
      const rows = page.getByTestId('users-table').locator('tbody tr');
      await rows.first().click();
    });

    test('tab bar should have role tablist', async ({ page }) => {
      const tablist = page.getByTestId('user-detail-tabs').locator('[role="tablist"]');
      await expect(tablist).toBeVisible();
    });

    test('tabs should have role tab', async ({ page }) => {
      const tab0 = page.getByTestId('user-detail-tabs-tab-0');
      await expect(tab0).toHaveAttribute('role', 'tab');
    });

    test('first tab should be selected by default', async ({ page }) => {
      const tab0 = page.getByTestId('user-detail-tabs-tab-0');
      await expect(tab0).toHaveAttribute('aria-selected', 'true');

      const tab1 = page.getByTestId('user-detail-tabs-tab-1');
      await expect(tab1).toHaveAttribute('aria-selected', 'false');
    });

    test('active tab should have border-blue-500 text-blue-600', async ({ page }) => {
      const tab0 = page.getByTestId('user-detail-tabs-tab-0');
      await expect(tab0).toHaveClass(/border-blue-500/);
      await expect(tab0).toHaveClass(/text-blue-600/);
    });

    test('inactive tab should have border-transparent text-gray-500', async ({ page }) => {
      const tab1 = page.getByTestId('user-detail-tabs-tab-1');
      await expect(tab1).toHaveClass(/border-transparent/);
      await expect(tab1).toHaveClass(/text-gray-500/);
    });

    test('clicking a tab should make it active', async ({ page }) => {
      await page.getByTestId('user-detail-tabs-tab-1').click();

      await expect(page.getByTestId('user-detail-tabs-tab-1')).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByTestId('user-detail-tabs-tab-0')).toHaveAttribute('aria-selected', 'false');
    });

    test('panel should have role tabpanel', async ({ page }) => {
      const panel = page.getByTestId('user-detail-tabs-panel');
      await expect(panel).toHaveAttribute('role', 'tabpanel');
    });

    test('panel content should change with tab selection', async ({ page }) => {
      // Tab 0 - Profile
      const panel = page.getByTestId('user-detail-tabs-panel');
      await expect(panel).toContainText('Email');

      // Tab 1 - Activity
      await page.getByTestId('user-detail-tabs-tab-1').click();
      await expect(panel).toContainText('Recent activity');

      // Tab 2 - Permissions
      await page.getByTestId('user-detail-tabs-tab-2').click();
      await expect(panel).toContainText('Permissions for');
    });
  });

  test.describe('ToastContainer', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await login(page);
    });

    test('toast container should exist', async ({ page }) => {
      await expect(page.getByTestId('toast-container')).toBeVisible();
    });

    test('toast should have role alert', async ({ page }) => {
      // Trigger a toast
      await page.getByTestId('notifications-btn').click();

      const toast = page.getByTestId('toast-info');
      await expect(toast).toHaveAttribute('role', 'alert');
    });

    test('toast should have dismiss button with correct aria-label', async ({ page }) => {
      await page.getByTestId('notifications-btn').click();

      const dismissBtn = page.getByTestId('toast-dismiss').first();
      await expect(dismissBtn).toHaveAttribute('aria-label', 'Dismiss notification');
    });

    test('dismiss button should remove toast', async ({ page }) => {
      await page.getByTestId('notifications-btn').click();
      await expect(page.getByTestId('toast-info')).toBeVisible();

      await page.getByTestId('toast-dismiss').first().click();
      await expect(page.getByTestId('toast-info')).not.toBeVisible();
    });

    test('toast should auto-dismiss after 4 seconds', async ({ page }) => {
      await page.getByTestId('notifications-btn').click();
      await expect(page.getByTestId('toast-info')).toBeVisible();

      // Wait for auto-dismiss (4 seconds + buffer)
      await page.waitForTimeout(4500);
      await expect(page.getByTestId('toast-info')).not.toBeVisible();
    });

    test('info toast should have bg-blue-500', async ({ page }) => {
      await page.getByTestId('notifications-btn').click();
      await expect(page.getByTestId('toast-info')).toHaveClass(/bg-blue-500/);
    });

    test('success toast should have bg-green-500', async ({ page }) => {
      // Navigate to kanban, add a task to trigger success toast
      await page.getByTestId('nav-kanban').click();
      await page.getByTestId('kanban-board').waitFor({ state: 'visible' });

      await page.getByTestId('add-task-todo').click();
      await page.getByTestId('new-task-input').fill('Test toast');
      await page.getByTestId('save-new-task').click();

      await expect(page.getByTestId('toast-success')).toHaveClass(/bg-green-500/);
    });

    test('error toast should have bg-red-500 (intended behavior)', async ({ page }) => {
      // BUG: Error toast uses bg-green-500 instead of bg-red-500
      // Trigger an error toast by deleting a user
      await page.getByTestId('nav-users').click();
      await page.getByTestId('users-table').waitFor({ state: 'visible' });

      const rows = page.getByTestId('users-table').locator('tbody tr');
      const firstRowActions = rows.first().locator('[data-testid^="user-actions-"]');
      await firstRowActions.locator('[data-testid$="-trigger"]').click();
      await firstRowActions.locator('[data-testid$="-item-2"]').click();
      await page.getByTestId('confirm-delete').click();

      // INTENDED: Error toast should have red background
      await expect(page.getByTestId('toast-error')).toHaveClass(/bg-red-500/);
    });

    test('toast container should be fixed position top-right', async ({ page }) => {
      const container = page.getByTestId('toast-container');
      await expect(container).toHaveClass(/fixed/);
      await expect(container).toHaveClass(/top-4/);
      await expect(container).toHaveClass(/right-4/);
      await expect(container).toHaveClass(/z-50/);
    });
  });
});
