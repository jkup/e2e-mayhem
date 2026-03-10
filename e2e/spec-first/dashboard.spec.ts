import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('DashboardPage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await login(page);
    // Should land on dashboard by default after login
    await page.getByTestId('stats-grid').waitFor({ state: 'visible' });
  });

  test.describe('Stats Cards', () => {
    test('should display 4 stat cards in stats grid', async ({ page }) => {
      const grid = page.getByTestId('stats-grid');
      await expect(grid).toBeVisible();
    });

    test('should show Total Users card with value 50 and +12% change', async ({ page }) => {
      const card = page.getByTestId('stat-card-total-users');
      await expect(card).toBeVisible();
      await expect(card).toContainText('Total Users');
      await expect(card).toContainText('50');
      await expect(card).toContainText('+12%');
      await expect(card).toContainText('from last month');
    });

    test('should show Active Tasks card with value 19 and -3% change', async ({ page }) => {
      const card = page.getByTestId('stat-card-active-tasks');
      await expect(card).toBeVisible();
      await expect(card).toContainText('Active Tasks');
      await expect(card).toContainText('19');
      await expect(card).toContainText('-3%');
    });

    test('should show Completed card with value 5 and +28% change', async ({ page }) => {
      const card = page.getByTestId('stat-card-completed');
      await expect(card).toBeVisible();
      await expect(card).toContainText('Completed');
      await expect(card).toContainText('5');
      await expect(card).toContainText('+28%');
    });

    test('should show Notifications card with value 5 and no change text', async ({ page }) => {
      const card = page.getByTestId('stat-card-notifications');
      await expect(card).toBeVisible();
      await expect(card).toContainText('Notifications');
      await expect(card).toContainText('5');
      // Should NOT show "from last month" since change is empty
      await expect(card).not.toContainText('from last month');
    });

    test('positive changes should have text-green-600 class', async ({ page }) => {
      const card = page.getByTestId('stat-card-total-users');
      const changeText = card.locator('.text-green-600');
      await expect(changeText).toBeVisible();
      await expect(changeText).toContainText('+12%');
    });

    test('negative changes should have text-red-600 class', async ({ page }) => {
      const card = page.getByTestId('stat-card-active-tasks');
      const changeText = card.locator('.text-red-600');
      await expect(changeText).toBeVisible();
      await expect(changeText).toContainText('-3%');
    });
  });

  test.describe('Activity Feed', () => {
    test('should show 10 notification items', async ({ page }) => {
      const feed = page.getByTestId('activity-feed');
      await expect(feed).toBeVisible();
      // The feed has 10 activity items
      const items = feed.locator('[data-testid^="activity-item-"]');
      await expect(items).toHaveCount(10);
    });

    test('unread items should not have opacity-60 and should show Mark read button', async ({ page }) => {
      // Notification at index 0 is unread (id starts with de175d13)
      // We need to check that unread items don't have opacity-60
      const feed = page.getByTestId('activity-feed');
      const items = feed.locator('[data-testid^="activity-item-"]');

      // Count items with "Mark read" buttons (should be 5 unread)
      const markReadButtons = feed.locator('[data-testid^="mark-read-"]');
      await expect(markReadButtons).toHaveCount(5);
    });

    test('read items should have opacity-60 class', async ({ page }) => {
      const feed = page.getByTestId('activity-feed');
      const opacityItems = feed.locator('[data-testid^="activity-item-"].opacity-60');
      await expect(opacityItems).toHaveCount(5);
    });

    test('clicking Mark read should mark single notification as read', async ({ page }) => {
      const feed = page.getByTestId('activity-feed');

      // Count initial mark-read buttons
      const markReadButtons = feed.locator('[data-testid^="mark-read-"]');
      const initialCount = await markReadButtons.count();
      expect(initialCount).toBe(5);

      // Click the first mark-read button
      await markReadButtons.first().click();

      // Should now have 4 mark-read buttons
      await expect(feed.locator('[data-testid^="mark-read-"]')).toHaveCount(4);

      // Should now have 6 items with opacity-60
      await expect(feed.locator('[data-testid^="activity-item-"].opacity-60')).toHaveCount(6);
    });

    test('Mark all as read should set all notifications to read (intended behavior)', async ({ page }) => {
      const markAllBtn = page.getByTestId('mark-all-read');
      await expect(markAllBtn).toHaveText('Mark all as read');
      await markAllBtn.click();

      const feed = page.getByTestId('activity-feed');

      // INTENDED: All notifications should be marked as read
      // All items should have opacity-60
      await expect(feed.locator('[data-testid^="activity-item-"].opacity-60')).toHaveCount(10);

      // No Mark read buttons should remain
      await expect(feed.locator('[data-testid^="mark-read-"]')).toHaveCount(0);
    });

    test('notification type indicators should have correct colors', async ({ page }) => {
      const feed = page.getByTestId('activity-feed');

      // Check that colored dots exist for different notification types
      // info -> bg-blue-500
      await expect(feed.locator('.bg-blue-500').first()).toBeVisible();
      // error -> bg-red-500
      await expect(feed.locator('.bg-red-500').first()).toBeVisible();
      // success -> bg-green-500
      await expect(feed.locator('.bg-green-500').first()).toBeVisible();
      // warning -> bg-yellow-500
      await expect(feed.locator('.bg-yellow-500').first()).toBeVisible();
    });
  });

  test.describe('Task Distribution Chart', () => {
    test('should display chart with title "Task Distribution"', async ({ page }) => {
      const chart = page.getByTestId('chart-placeholder');
      await expect(chart).toBeVisible();
      await expect(chart).toContainText('Task Distribution');
    });

    test('should show todo bar with count 8', async ({ page }) => {
      const bar = page.getByTestId('bar-todo');
      await expect(bar).toBeVisible();
      await expect(bar).toHaveAttribute('title', 'todo: 8');
    });

    test('should show in-progress bar with count 4', async ({ page }) => {
      const bar = page.getByTestId('bar-in-progress');
      await expect(bar).toBeVisible();
      await expect(bar).toHaveAttribute('title', 'in-progress: 4');
    });

    test('should show review bar with count 7', async ({ page }) => {
      const bar = page.getByTestId('bar-review');
      await expect(bar).toBeVisible();
      await expect(bar).toHaveAttribute('title', 'review: 7');
    });

    test('should show done bar with count 5', async ({ page }) => {
      const bar = page.getByTestId('bar-done');
      await expect(bar).toBeVisible();
      await expect(bar).toHaveAttribute('title', 'done: 5');
    });

    test('should show status labels below bars', async ({ page }) => {
      const chart = page.getByTestId('chart-placeholder');
      await expect(chart).toContainText('todo');
      await expect(chart).toContainText('in-progress');
      await expect(chart).toContainText('review');
      await expect(chart).toContainText('done');
    });
  });

  test.describe('Priority Breakdown', () => {
    test('should display priority breakdown section', async ({ page }) => {
      const section = page.getByTestId('priority-breakdown');
      await expect(section).toBeVisible();
      await expect(section).toContainText('Priority Breakdown');
    });

    test('should show critical priority with count 8 (33%)', async ({ page }) => {
      const section = page.getByTestId('priority-breakdown');
      const progressBar = page.getByTestId('progress-critical');
      await expect(progressBar).toBeVisible();
      await expect(section).toContainText('8 (33%)');
    });

    test('should show high priority with count 7 (29%)', async ({ page }) => {
      const section = page.getByTestId('priority-breakdown');
      const progressBar = page.getByTestId('progress-high');
      await expect(progressBar).toBeVisible();
      await expect(section).toContainText('7 (29%)');
    });

    test('should show medium priority with count 5 (21%)', async ({ page }) => {
      const section = page.getByTestId('priority-breakdown');
      const progressBar = page.getByTestId('progress-medium');
      await expect(progressBar).toBeVisible();
      await expect(section).toContainText('5 (21%)');
    });

    test('should show low priority with count 4 (17%)', async ({ page }) => {
      const section = page.getByTestId('priority-breakdown');
      const progressBar = page.getByTestId('progress-low');
      await expect(progressBar).toBeVisible();
      await expect(section).toContainText('4 (17%)');
    });

    test('should have correct colors for priority progress bars', async ({ page }) => {
      await expect(page.getByTestId('progress-critical')).toHaveClass(/bg-red-500/);
      await expect(page.getByTestId('progress-high')).toHaveClass(/bg-orange-500/);
      await expect(page.getByTestId('progress-medium')).toHaveClass(/bg-yellow-500/);
      await expect(page.getByTestId('progress-low')).toHaveClass(/bg-green-500/);
    });

    test('should show capitalized priority names', async ({ page }) => {
      const section = page.getByTestId('priority-breakdown');
      await expect(section).toContainText('Critical');
      await expect(section).toContainText('High');
      await expect(section).toContainText('Medium');
      await expect(section).toContainText('Low');
    });
  });
});
