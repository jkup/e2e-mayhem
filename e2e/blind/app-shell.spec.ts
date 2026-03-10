import { test, expect } from '@playwright/test';
import { login, expectToast } from './helpers';

test.describe('App Shell', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await login(page);
  });

  test('sidebar is visible and shows navigation links', async ({ page }) => {
    const sidebar = page.getByTestId('sidebar');
    await expect(sidebar).toBeVisible();
    await expect(page.getByTestId('nav-dashboard')).toBeVisible();
    await expect(page.getByTestId('nav-users')).toBeVisible();
    await expect(page.getByTestId('nav-wizard')).toBeVisible();
    await expect(page.getByTestId('nav-kanban')).toBeVisible();
  });

  test('sidebar collapse and expand toggle', async ({ page }) => {
    const sidebar = page.getByTestId('sidebar');
    const toggleBtn = page.getByTestId('toggle-sidebar');

    // Sidebar starts expanded (w-56)
    await expect(sidebar).toHaveClass(/w-56/);
    await expect(toggleBtn).toHaveAttribute('aria-label', 'Collapse sidebar');

    // Collapse
    await toggleBtn.click();
    await expect(sidebar).toHaveClass(/w-16/);
    await expect(toggleBtn).toHaveAttribute('aria-label', 'Expand sidebar');

    // Expand again
    await toggleBtn.click();
    await expect(sidebar).toHaveClass(/w-56/);
  });

  test('navigating between pages via sidebar', async ({ page }) => {
    // Default route should be dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Navigate to Users
    await page.getByTestId('nav-users').click();
    await expect(page).toHaveURL(/\/users/);

    // Navigate to Wizard
    await page.getByTestId('nav-wizard').click();
    await expect(page).toHaveURL(/\/wizard/);

    // Navigate to Kanban
    await page.getByTestId('nav-kanban').click();
    await expect(page).toHaveURL(/\/kanban/);

    // Back to Dashboard
    await page.getByTestId('nav-dashboard').click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('topbar is visible', async ({ page }) => {
    await expect(page.getByTestId('topbar')).toBeVisible();
  });

  test('notifications button shows toast', async ({ page }) => {
    await page.getByTestId('notifications-btn').click();
    await expectToast(page, /unread notifications/);
  });

  test('notification badge shows correct unread count', async ({ page }) => {
    // The badge should show a count reflecting actual unread notifications (non-zero)
    const badge = page.getByTestId('notifications-btn').locator('span');
    const badgeText = await badge.textContent();
    const count = parseInt(badgeText || '0', 10);
    // With 10 mock notifications, some should be unread — badge should not be 0
    expect(count).toBeGreaterThan(0);
  });

  test('user menu dropdown opens and shows items', async ({ page }) => {
    await page.getByRole('button', { name: 'JD John Doe' }).click();
    const menu = page.getByTestId('user-menu-menu');
    await expect(menu).toBeVisible();
    await expect(menu).toContainText('Profile');
    await expect(menu).toContainText('Settings');
    await expect(menu).toContainText('Theme');
    await expect(menu).toContainText('Sign Out');
  });

  test('user menu Profile item triggers toast', async ({ page }) => {
    await page.getByRole('button', { name: 'JD John Doe' }).click();
    await page.getByTestId('user-menu-item-0').click(); // Profile
    await expectToast(page, 'Profile clicked');
  });

  test('user menu Theme submenu appears on hover', async ({ page }) => {
    await page.getByRole('button', { name: 'JD John Doe' }).click();
    // Hover over Theme item to open submenu
    await page.getByTestId('user-menu-item-2').hover();
    const submenu = page.getByTestId('user-menu-submenu-2');
    await expect(submenu).toBeVisible();
    await expect(submenu).toContainText('Light');
    await expect(submenu).toContainText('Dark');
    await expect(submenu).toContainText('System');
  });

  test('user menu Theme submenu item triggers toast', async ({ page }) => {
    await page.getByRole('button', { name: 'JD John Doe' }).click();
    await page.getByTestId('user-menu-item-2').hover();
    await page.getByTestId('user-menu-subitem-2-0').click(); // Light
    await expectToast(page, 'Light theme selected');
  });

  test('dropdown closes when clicking outside', async ({ page }) => {
    await page.getByRole('button', { name: 'JD John Doe' }).click();
    await expect(page.getByTestId('user-menu-menu')).toBeVisible();
    // Click outside
    await page.locator('main').click();
    await expect(page.getByTestId('user-menu-menu')).not.toBeVisible();
  });

  test('unknown routes redirect to dashboard', async ({ page }) => {
    await page.goto('/nonexistent');
    await login(page);
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
