import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('App Shell & Routing', () => {
  test.describe('Auth Gate', () => {
    test('should show login page when not logged in', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByTestId('auth-form')).toBeVisible();
      await expect(page.getByTestId('sidebar')).not.toBeVisible();
    });

    test('should show app shell after login', async ({ page }) => {
      await page.goto('/');
      await login(page);
      await expect(page.getByTestId('sidebar')).toBeVisible();
      await expect(page.getByTestId('topbar')).toBeVisible();
    });

    test('page refresh should reset to login (no persistence)', async ({ page }) => {
      await page.goto('/');
      await login(page);
      await expect(page.getByTestId('sidebar')).toBeVisible();

      await page.reload();
      await expect(page.getByTestId('auth-form')).toBeVisible();
    });
  });

  test.describe('Sidebar', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await login(page);
    });

    test('should be expanded by default with w-56 class', async ({ page }) => {
      const sidebar = page.getByTestId('sidebar');
      await expect(sidebar).toHaveClass(/w-56/);
    });

    test('should show brand text "E2E Mayhem" when expanded', async ({ page }) => {
      await expect(page.getByTestId('sidebar')).toContainText('E2E Mayhem');
    });

    test('toggle button should have correct aria-label when expanded', async ({ page }) => {
      const toggleBtn = page.getByTestId('toggle-sidebar');
      await expect(toggleBtn).toHaveAttribute('aria-label', 'Collapse sidebar');
    });

    test('toggle button should show correct text when expanded', async ({ page }) => {
      const toggleBtn = page.getByTestId('toggle-sidebar');
      await expect(toggleBtn).toContainText('◀');
    });

    test('clicking toggle should collapse sidebar', async ({ page }) => {
      await page.getByTestId('toggle-sidebar').click();

      const sidebar = page.getByTestId('sidebar');
      await expect(sidebar).toHaveClass(/w-16/);
    });

    test('collapsed sidebar should hide brand text and nav labels', async ({ page }) => {
      await page.getByTestId('toggle-sidebar').click();

      // Brand text should be hidden
      const sidebar = page.getByTestId('sidebar');
      await expect(sidebar).not.toContainText('E2E Mayhem');
    });

    test('toggle button should update aria-label when collapsed', async ({ page }) => {
      await page.getByTestId('toggle-sidebar').click();

      const toggleBtn = page.getByTestId('toggle-sidebar');
      await expect(toggleBtn).toHaveAttribute('aria-label', 'Expand sidebar');
    });

    test('toggle button should show right arrow when collapsed', async ({ page }) => {
      await page.getByTestId('toggle-sidebar').click();

      const toggleBtn = page.getByTestId('toggle-sidebar');
      await expect(toggleBtn).toContainText('▶');
    });

    test('double toggle should return to expanded state', async ({ page }) => {
      await page.getByTestId('toggle-sidebar').click();
      await page.getByTestId('toggle-sidebar').click();

      const sidebar = page.getByTestId('sidebar');
      await expect(sidebar).toHaveClass(/w-56/);
      await expect(sidebar).toContainText('E2E Mayhem');
    });
  });

  test.describe('Navigation Items', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await login(page);
    });

    test('should show 4 navigation links', async ({ page }) => {
      await expect(page.getByTestId('nav-dashboard')).toBeVisible();
      await expect(page.getByTestId('nav-users')).toBeVisible();
      await expect(page.getByTestId('nav-wizard')).toBeVisible();
      await expect(page.getByTestId('nav-kanban')).toBeVisible();
    });

    test('nav labels should display correct text', async ({ page }) => {
      await expect(page.getByTestId('nav-dashboard')).toContainText('Dashboard');
      await expect(page.getByTestId('nav-users')).toContainText('Users');
      await expect(page.getByTestId('nav-wizard')).toContainText('Wizard');
      await expect(page.getByTestId('nav-kanban')).toContainText('Kanban');
    });

    test('Dashboard should be active link after login', async ({ page }) => {
      const dashNav = page.getByTestId('nav-dashboard');
      await expect(dashNav).toHaveClass(/bg-gray-800/);
      await expect(dashNav).toHaveClass(/text-white/);
    });

    test('clicking Users nav should navigate and become active', async ({ page }) => {
      await page.getByTestId('nav-users').click();

      const usersNav = page.getByTestId('nav-users');
      await expect(usersNav).toHaveClass(/bg-gray-800/);
      await expect(usersNav).toHaveClass(/text-white/);

      // Dashboard should no longer be active
      const dashNav = page.getByTestId('nav-dashboard');
      await expect(dashNav).toHaveClass(/text-gray-400/);
    });

    test('clicking Wizard nav should navigate', async ({ page }) => {
      await page.getByTestId('nav-wizard').click();
      await expect(page.getByTestId('wizard-steps')).toBeVisible();
    });

    test('clicking Kanban nav should navigate', async ({ page }) => {
      await page.getByTestId('nav-kanban').click();
      await expect(page.getByTestId('kanban-board')).toBeVisible();
    });
  });

  test.describe('Routing', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await login(page);
    });

    test('should default to dashboard after login', async ({ page }) => {
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test('unknown routes should redirect to dashboard', async ({ page }) => {
      await page.goto('/nonexistent');
      // After login redirect should go to dashboard
      // But since we're already logged in, need to navigate
      await login(page);
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test('/users route should show users page', async ({ page }) => {
      await page.getByTestId('nav-users').click();
      await expect(page).toHaveURL(/\/users/);
      await expect(page.getByTestId('users-table')).toBeVisible();
    });

    test('/wizard route should show wizard page', async ({ page }) => {
      await page.getByTestId('nav-wizard').click();
      await expect(page).toHaveURL(/\/wizard/);
      await expect(page.getByTestId('wizard-steps')).toBeVisible();
    });

    test('/kanban route should show kanban page', async ({ page }) => {
      await page.getByTestId('nav-kanban').click();
      await expect(page).toHaveURL(/\/kanban/);
      await expect(page.getByTestId('kanban-board')).toBeVisible();
    });
  });

  test.describe('Top Bar', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await login(page);
    });

    test('should display topbar', async ({ page }) => {
      await expect(page.getByTestId('topbar')).toBeVisible();
    });

    test('should show notifications button', async ({ page }) => {
      const notifBtn = page.getByTestId('notifications-btn');
      await expect(notifBtn).toBeVisible();
      await expect(notifBtn).toHaveAttribute('aria-label', 'Notifications');
    });

    test('notifications button badge should show unread count (intended behavior)', async ({ page }) => {
      // INTENDED: Badge should show the actual unread notification count (5)
      // BUG: Currently hardcoded to 0
      const notifBtn = page.getByTestId('notifications-btn');
      await expect(notifBtn).toContainText('5');
    });

    test('clicking notifications button should show toast', async ({ page }) => {
      await page.getByTestId('notifications-btn').click();
      await expect(page.getByTestId('toast-info')).toBeVisible();
      await expect(page.getByTestId('toast-info')).toContainText('You have 3 unread notifications');
    });

    test('should show user menu', async ({ page }) => {
      await expect(page.getByTestId('user-menu')).toBeVisible();
    });

    test('user menu trigger should show JD avatar and John Doe', async ({ page }) => {
      const trigger = page.getByTestId('user-menu-trigger');
      await expect(trigger).toContainText('JD');
      await expect(trigger).toContainText('John Doe');
    });

    test('user menu should show Profile option', async ({ page }) => {
      await page.getByTestId('user-menu-trigger').click();
      await page.getByTestId('user-menu-item-0').click();

      await expect(page.getByTestId('toast-info')).toBeVisible();
      await expect(page.getByTestId('toast-info')).toContainText('Profile clicked');
    });

    test('user menu should show Settings option', async ({ page }) => {
      await page.getByTestId('user-menu-trigger').click();
      await page.getByTestId('user-menu-item-1').click();

      await expect(page.getByTestId('toast-info')).toBeVisible();
      await expect(page.getByTestId('toast-info')).toContainText('Settings clicked');
    });

    test('user menu Theme submenu should work', async ({ page }) => {
      await page.getByTestId('user-menu-trigger').click();
      await page.getByTestId('user-menu-item-2').hover();

      // Submenu should appear
      await expect(page.getByTestId('user-menu-subitem-2-0')).toBeVisible(); // Light
      await expect(page.getByTestId('user-menu-subitem-2-1')).toBeVisible(); // Dark
      await expect(page.getByTestId('user-menu-subitem-2-2')).toBeVisible(); // System

      // Click Light theme
      await page.getByTestId('user-menu-subitem-2-0').click();
      await expect(page.getByTestId('toast-info')).toBeVisible();
      await expect(page.getByTestId('toast-info')).toContainText('Light theme selected');
    });

    test('Sign Out should reload page and return to login', async ({ page }) => {
      await page.getByTestId('user-menu-trigger').click();

      // Item 3 is Sign Out with danger styling
      const signOut = page.getByTestId('user-menu-item-3');
      await expect(signOut).toHaveClass(/text-red-600/);

      await signOut.click();

      // Should return to login page after reload
      await expect(page.getByTestId('auth-form')).toBeVisible();
    });
  });

  test.describe('Search Autocomplete (Top Bar)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await login(page);
    });

    test('should show search input in topbar', async ({ page }) => {
      const searchInput = page.getByTestId('search-autocomplete-input');
      await expect(searchInput).toBeVisible();
      await expect(searchInput).toHaveAttribute('placeholder', 'Search users, departments...');
    });

    test('should show results when typing', async ({ page }) => {
      await page.getByTestId('search-autocomplete-input').fill('Eng');

      await expect(page.getByTestId('search-autocomplete-results')).toBeVisible();
      await expect(page.getByTestId('search-autocomplete-results')).toContainText('Engineering');
    });

    test('selecting a result should show toast', async ({ page }) => {
      await page.getByTestId('search-autocomplete-input').fill('Engineering');

      await page.getByTestId('search-autocomplete-result-0').click();

      await expect(page.getByTestId('toast-info')).toBeVisible();
      await expect(page.getByTestId('toast-info')).toContainText('Selected:');
    });
  });
});
