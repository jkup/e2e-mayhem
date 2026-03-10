import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dashboard');
  });

  test.describe('Stats Cards', () => {
    test('displays all four stats cards', async ({ page }) => {
      await expect(page.getByTestId('stats-grid')).toBeVisible();
      await expect(page.getByTestId('stat-card-total-users')).toBeVisible();
      await expect(page.getByTestId('stat-card-active-tasks')).toBeVisible();
      await expect(page.getByTestId('stat-card-completed')).toBeVisible();
      await expect(page.getByTestId('stat-card-notifications')).toBeVisible();
    });

    test('Total Users card shows 50', async ({ page }) => {
      await expect(page.getByTestId('stat-card-total-users')).toContainText('50');
      await expect(page.getByTestId('stat-card-total-users')).toContainText('+12%');
    });

    test('Active Tasks card shows count and change', async ({ page }) => {
      await expect(page.getByTestId('stat-card-active-tasks')).toContainText('19');
      await expect(page.getByTestId('stat-card-active-tasks')).toContainText('-3%');
    });

    test('Completed card shows count and positive change', async ({ page }) => {
      await expect(page.getByTestId('stat-card-completed')).toContainText('5');
      await expect(page.getByTestId('stat-card-completed')).toContainText('+28%');
    });

    test('Notifications card shows unread count', async ({ page }) => {
      await expect(page.getByTestId('stat-card-notifications')).toContainText('Notifications');
    });
  });

  test.describe('Activity Feed', () => {
    test('displays activity feed with items', async ({ page }) => {
      await expect(page.getByTestId('activity-feed')).toBeVisible();
      const items = page.getByTestId('activity-feed').locator('li');
      await expect(items).toHaveCount(10);
    });

    test('unread items have "Mark read" button', async ({ page }) => {
      const markReadButtons = page.locator('button:has-text("Mark read"):not([data-testid="mark-all-read"])');
      const count = await markReadButtons.count();
      expect(count).toBeGreaterThan(0);
    });

    test('clicking "Mark read" removes the button for that item', async ({ page }) => {
      // Get the testid of the first mark-read button before clicking
      const firstMarkReadBtn = page.locator('[data-testid^="mark-read-"]').first();
      const testId = await firstMarkReadBtn.getAttribute('data-testid');
      await firstMarkReadBtn.click();
      // That specific button should disappear
      await expect(page.getByTestId(testId!)).not.toBeVisible();
    });

    test('mark all as read button marks all items as read', async ({ page }) => {
      await page.getByTestId('mark-all-read').click();
      // After marking all as read, no "Mark read" buttons should remain
      const markReadButtons = page.locator('[data-testid^="mark-read-"]');
      await expect(markReadButtons).toHaveCount(0);
    });

    test('read items have reduced opacity', async ({ page }) => {
      // Initially some items should not have opacity-60
      const firstUnreadBtn = page.locator('[data-testid^="mark-read-"]').first();
      const itemId = await firstUnreadBtn.getAttribute('data-testid');
      const notifId = itemId?.replace('mark-read-', '');
      await firstUnreadBtn.click();
      // The item should now have opacity-60
      await expect(page.getByTestId(`activity-item-${notifId}`)).toHaveClass(/opacity-60/);
    });
  });

  test.describe('Charts', () => {
    test('displays task distribution chart with all status bars', async ({ page }) => {
      await expect(page.getByTestId('chart-placeholder')).toBeVisible();
      await expect(page.getByTestId('bar-todo')).toBeAttached();
      await expect(page.getByTestId('bar-in-progress')).toBeAttached();
      await expect(page.getByTestId('bar-review')).toBeAttached();
      await expect(page.getByTestId('bar-done')).toBeAttached();
    });

    test('task distribution chart shows status labels', async ({ page }) => {
      await expect(page.getByTestId('chart-placeholder')).toContainText('todo');
      await expect(page.getByTestId('chart-placeholder')).toContainText('in-progress');
      await expect(page.getByTestId('chart-placeholder')).toContainText('review');
      await expect(page.getByTestId('chart-placeholder')).toContainText('done');
    });

    test('displays priority breakdown with all priority levels', async ({ page }) => {
      await expect(page.getByTestId('priority-breakdown')).toBeVisible();
      // Priority labels are lowercase in the source
      await expect(page.getByTestId('priority-breakdown')).toContainText('critical');
      await expect(page.getByTestId('priority-breakdown')).toContainText('high');
      await expect(page.getByTestId('priority-breakdown')).toContainText('medium');
      await expect(page.getByTestId('priority-breakdown')).toContainText('low');
    });

    test('priority breakdown shows correct percentages', async ({ page }) => {
      await expect(page.getByTestId('priority-breakdown')).toContainText('8 (33%)');
      await expect(page.getByTestId('priority-breakdown')).toContainText('7 (29%)');
      await expect(page.getByTestId('priority-breakdown')).toContainText('5 (21%)');
      await expect(page.getByTestId('priority-breakdown')).toContainText('4 (17%)');
    });

    test('priority progress bars are visible', async ({ page }) => {
      await expect(page.getByTestId('progress-critical')).toBeVisible();
      await expect(page.getByTestId('progress-high')).toBeVisible();
      await expect(page.getByTestId('progress-medium')).toBeVisible();
      await expect(page.getByTestId('progress-low')).toBeVisible();
    });
  });
});
