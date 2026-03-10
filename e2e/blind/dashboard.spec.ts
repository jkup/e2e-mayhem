import { test, expect } from '@playwright/test';
import { login, navigateTo, expectToast } from './helpers';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await login(page);
    await navigateTo(page, 'dashboard');
  });

  test('displays stats cards', async ({ page }) => {
    const grid = page.getByTestId('stats-grid');
    await expect(grid).toBeVisible();
    await expect(page.getByTestId('stat-card-total-users')).toBeVisible();
    await expect(page.getByTestId('stat-card-active-tasks')).toBeVisible();
    await expect(page.getByTestId('stat-card-completed')).toBeVisible();
    await expect(page.getByTestId('stat-card-notifications')).toBeVisible();
  });

  test('stats cards show numeric values', async ({ page }) => {
    // Total Users should show 50
    const totalUsers = page.getByTestId('stat-card-total-users');
    await expect(totalUsers.locator('.text-3xl')).toHaveText('50');
  });

  test('displays activity feed with notifications', async ({ page }) => {
    const feed = page.getByTestId('activity-feed');
    await expect(feed).toBeVisible();
    const items = feed.locator('li');
    await expect(items).toHaveCount(10);
  });

  test('can mark individual notification as read', async ({ page }) => {
    const feed = page.getByTestId('activity-feed');
    const markReadBtns = feed.locator('button[data-testid^="mark-read-"]');
    const initialCount = await markReadBtns.count();

    if (initialCount > 0) {
      // Get the specific testid of the first mark-read button
      const firstBtnTestId = await markReadBtns.first().getAttribute('data-testid');
      await markReadBtns.first().click();
      // That specific button should now be gone
      await expect(page.getByTestId(firstBtnTestId!)).not.toBeVisible();
      // Total mark-read buttons should decrease by 1
      await expect(markReadBtns).toHaveCount(initialCount - 1);
    }
  });

  test('mark all as read makes all notifications read', async ({ page }) => {
    await page.getByTestId('mark-all-read').click();
    // After marking all as read, no "Mark read" buttons should remain
    const markReadBtns = page.locator('button[data-testid^="mark-read-"]');
    await expect(markReadBtns).toHaveCount(0);
  });

  test('displays task distribution chart', async ({ page }) => {
    await expect(page.getByTestId('chart-placeholder')).toBeVisible();
    // Bar elements are styled with percentage heights; verify they exist with correct titles
    await expect(page.getByTestId('bar-todo')).toBeAttached();
    await expect(page.getByTestId('bar-in-progress')).toBeAttached();
    await expect(page.getByTestId('bar-review')).toBeAttached();
    await expect(page.getByTestId('bar-done')).toBeAttached();
    // Each bar should have a title attribute showing its count
    const todoTitle = await page.getByTestId('bar-todo').getAttribute('title');
    expect(todoTitle).toMatch(/todo: \d+/);
  });

  test('displays priority breakdown with progress bars', async ({ page }) => {
    await expect(page.getByTestId('priority-breakdown')).toBeVisible();
    await expect(page.getByTestId('progress-critical')).toBeVisible();
    await expect(page.getByTestId('progress-high')).toBeVisible();
    await expect(page.getByTestId('progress-medium')).toBeVisible();
    await expect(page.getByTestId('progress-low')).toBeVisible();
  });
});
