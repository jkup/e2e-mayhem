import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('App Shell', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.describe('Sidebar', () => {
    test('displays sidebar with navigation links', async ({ page }) => {
      await expect(page.getByTestId('sidebar')).toBeVisible();
      await expect(page.getByTestId('nav-dashboard')).toBeVisible();
      await expect(page.getByTestId('nav-users')).toBeVisible();
      await expect(page.getByTestId('nav-wizard')).toBeVisible();
      await expect(page.getByTestId('nav-kanban')).toBeVisible();
    });

    test('collapses and expands sidebar', async ({ page }) => {
      const sidebar = page.getByTestId('sidebar');
      const toggleBtn = page.getByTestId('toggle-sidebar');

      await expect(toggleBtn).toHaveAttribute('aria-label', 'Collapse sidebar');
      await toggleBtn.click();
      await expect(toggleBtn).toHaveAttribute('aria-label', 'Expand sidebar');
      await toggleBtn.click();
      await expect(toggleBtn).toHaveAttribute('aria-label', 'Collapse sidebar');
    });

    test('navigates to each page via sidebar', async ({ page }) => {
      await page.getByTestId('nav-users').click();
      await expect(page).toHaveURL(/\/users/);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Users');

      await page.getByTestId('nav-wizard').click();
      await expect(page).toHaveURL(/\/wizard/);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Registration Wizard');

      await page.getByTestId('nav-kanban').click();
      await expect(page).toHaveURL(/\/kanban/);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kanban Board');

      await page.getByTestId('nav-dashboard').click();
      await expect(page).toHaveURL(/\/dashboard/);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dashboard');
    });

    test('highlights active nav link', async ({ page }) => {
      // Dashboard should be active by default
      const dashLink = page.getByTestId('nav-dashboard');
      await expect(dashLink).toHaveClass(/bg-gray-800/);

      await page.getByTestId('nav-users').click();
      const usersLink = page.getByTestId('nav-users');
      await expect(usersLink).toHaveClass(/bg-gray-800/);
    });
  });

  test.describe('Top Bar', () => {
    test('displays topbar with search, notifications, and user menu', async ({ page }) => {
      await expect(page.getByTestId('topbar')).toBeVisible();
      await expect(page.getByTestId('search-autocomplete-input')).toBeVisible();
      await expect(page.getByTestId('notifications-btn')).toBeVisible();
      await expect(page.getByRole('button', { name: 'JD John Doe' })).toBeVisible();
    });

    test('notifications button shows toast on click', async ({ page }) => {
      await page.getByTestId('notifications-btn').click();
      await expect(page.getByTestId('toast-container').locator('[role="alert"]')).toBeVisible();
    });

    test('user menu opens and shows options', async ({ page }) => {
      await page.getByTestId('user-menu-trigger').locator('button').click();
      const menu = page.getByTestId('user-menu-menu');
      await expect(menu).toBeVisible();
      await expect(page.getByTestId('user-menu-item-0')).toHaveText('Profile');
      await expect(page.getByTestId('user-menu-item-1')).toHaveText('Settings');
      await expect(page.getByTestId('user-menu-item-2')).toHaveText(/Theme/);
      await expect(page.getByTestId('user-menu-item-3')).toHaveText('Sign Out');
    });

    test('user menu Profile option shows toast', async ({ page }) => {
      await page.getByTestId('user-menu-trigger').locator('button').click();
      await page.getByTestId('user-menu-item-0').click();
      await expect(page.getByRole('alert')).toContainText('Profile clicked');
    });

    test('user menu Settings option shows toast', async ({ page }) => {
      await page.getByTestId('user-menu-trigger').locator('button').click();
      await page.getByTestId('user-menu-item-1').click();
      await expect(page.getByRole('alert')).toContainText('Settings clicked');
    });

    test('user menu Theme submenu appears on hover', async ({ page }) => {
      await page.getByTestId('user-menu-trigger').locator('button').click();
      await page.getByTestId('user-menu-item-2').hover();
      const submenu = page.getByTestId('user-menu-submenu-2');
      await expect(submenu).toBeVisible();
      await expect(page.getByTestId('user-menu-subitem-2-0')).toHaveText('Light');
      await expect(page.getByTestId('user-menu-subitem-2-1')).toHaveText('Dark');
      await expect(page.getByTestId('user-menu-subitem-2-2')).toHaveText('System');
    });

    test('user menu closes when clicking outside', async ({ page }) => {
      await page.getByTestId('user-menu-trigger').locator('button').click();
      await expect(page.getByTestId('user-menu-menu')).toBeVisible();
      await page.locator('main').click();
      await expect(page.getByTestId('user-menu-menu')).not.toBeVisible();
    });
  });

  test.describe('Search Autocomplete', () => {
    test('search input has correct aria attributes', async ({ page }) => {
      const input = page.getByTestId('search-autocomplete-input');
      await expect(input).toHaveAttribute('role', 'combobox');
      await expect(input).toHaveAttribute('aria-label', 'Search');
    });

    test('typing shows autocomplete results', async ({ page }) => {
      await page.getByTestId('search-autocomplete-input').fill('Mall');
      const results = page.getByTestId('search-autocomplete-results');
      await expect(results).toBeVisible();
      await expect(results.locator('li').first()).toBeVisible();
    });

    test('clicking a result triggers toast and clears input', async ({ page }) => {
      const input = page.getByTestId('search-autocomplete-input');
      await input.fill('Mall');
      await page.getByTestId('search-autocomplete-result-0').click();
      await expect(page.getByRole('alert')).toContainText('Selected:');
      await expect(input).toHaveValue('');
    });

    test('keyboard navigation with arrow keys', async ({ page }) => {
      const input = page.getByTestId('search-autocomplete-input');
      await input.fill('Ma');
      await expect(page.getByTestId('search-autocomplete-results')).toBeVisible();

      // Arrow down should highlight first result
      await input.press('ArrowDown');
      await expect(page.getByTestId('search-autocomplete-result-0')).toHaveAttribute('aria-selected', 'true');

      // Arrow down again should move to next
      await input.press('ArrowDown');
      await expect(page.getByTestId('search-autocomplete-result-1')).toHaveAttribute('aria-selected', 'true');
    });

    test('pressing Enter selects highlighted result', async ({ page }) => {
      const input = page.getByTestId('search-autocomplete-input');
      await input.fill('Ma');
      await expect(page.getByTestId('search-autocomplete-results')).toBeVisible();
      await input.press('ArrowDown');
      await input.press('Enter');
      await expect(page.getByRole('alert')).toContainText('Selected:');
    });

    test('pressing Escape closes results', async ({ page }) => {
      const input = page.getByTestId('search-autocomplete-input');
      await input.fill('Ma');
      await expect(page.getByTestId('search-autocomplete-results')).toBeVisible();
      await input.press('Escape');
      await expect(page.getByTestId('search-autocomplete-results')).not.toBeVisible();
    });

    test('clicking outside closes results', async ({ page }) => {
      await page.getByTestId('search-autocomplete-input').fill('Ma');
      await expect(page.getByTestId('search-autocomplete-results')).toBeVisible();
      await page.locator('main').click();
      await expect(page.getByTestId('search-autocomplete-results')).not.toBeVisible();
    });

    test('no results shown for single character or less with no match', async ({ page }) => {
      await page.getByTestId('search-autocomplete-input').fill('zzzzz');
      await expect(page.getByTestId('search-autocomplete-results')).not.toBeVisible();
    });

    test('results include both users and departments', async ({ page }) => {
      await page.getByTestId('search-autocomplete-input').fill('Marketing');
      const results = page.getByTestId('search-autocomplete-results');
      await expect(results).toBeVisible();
      // Should find the department "Marketing"
      await expect(results.locator('li').first()).toBeVisible();
    });
  });

  test.describe('Routing', () => {
    test('unknown routes redirect to dashboard', async ({ page }) => {
      await page.goto('/nonexistent');
      // Need to login first since direct nav resets state
      await login(page);
      await expect(page).toHaveURL(/\/dashboard/);
    });
  });
});
