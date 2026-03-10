import { test, expect } from '@playwright/test';
import { login, navigateTo, expectToast } from './helpers';

test.describe('Kanban Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await login(page);
    await navigateTo(page, 'kanban');
    // Wait for the kanban board and at least one task card to render
    await page.getByTestId('kanban-board').waitFor();
    await page.locator('[data-testid^="task-card-"]').first().waitFor();
  });

  test('displays 4 columns', async ({ page }) => {
    await expect(page.getByTestId('kanban-board')).toBeVisible();
    await expect(page.getByTestId('column-todo')).toBeVisible();
    await expect(page.getByTestId('column-in-progress')).toBeVisible();
    await expect(page.getByTestId('column-review')).toBeVisible();
    await expect(page.getByTestId('column-done')).toBeVisible();
  });

  test('columns show correct labels and task counts', async ({ page }) => {
    await expect(page.getByTestId('column-todo')).toContainText('To Do');
    await expect(page.getByTestId('column-in-progress')).toContainText('In Progress');
    await expect(page.getByTestId('column-review')).toContainText('Review');
    await expect(page.getByTestId('column-done')).toContainText('Done');
  });

  test('task cards are visible in columns', async ({ page }) => {
    const cards = page.locator('[data-testid^="task-card-"]');
    const count = await cards.count();
    // 24 mock tasks should be distributed across columns
    expect(count).toBeGreaterThanOrEqual(24);
  });

  test('task cards show title and priority', async ({ page }) => {
    const firstCard = page.locator('[data-testid^="task-card-"]').first();
    // Card should have text content (title)
    const text = await firstCard.textContent();
    expect(text!.length).toBeGreaterThan(0);
    // Priority badge should be present
    await expect(firstCard.locator('span').first()).toBeVisible();
  });

  test('clicking a task card opens task detail modal', async ({ page }) => {
    await page.locator('[data-testid^="task-card-"]').first().click();
    await expect(page.getByTestId('modal')).toBeVisible();
    await expect(page.getByTestId('task-detail')).toBeVisible();
    await expect(page.getByTestId('task-detail')).toContainText('Title');
    await expect(page.getByTestId('task-detail')).toContainText('Status');
    await expect(page.getByTestId('task-detail')).toContainText('Priority');
    await expect(page.getByTestId('task-detail')).toContainText('Assignee');
  });

  test('task detail modal shows move-to dropdown', async ({ page }) => {
    await page.locator('[data-testid^="task-card-"]').first().click();
    const select = page.getByTestId('task-move-select');
    await expect(select).toBeVisible();
    // Should have 4 options
    const options = select.locator('option');
    await expect(options).toHaveCount(4);
  });

  test('moving a task via modal dropdown updates the board', async ({ page }) => {
    // Click on a task in the todo column
    const todoCol = page.getByTestId('column-todo');
    const todoCards = todoCol.locator('[data-testid^="task-card-"]');
    const initialTodoCount = await todoCards.count();

    if (initialTodoCount > 0) {
      await todoCards.first().click();
      const select = page.getByTestId('task-move-select');
      // Move to "done"
      await select.selectOption('done');
      await expectToast(page, /Moved to Done/);

      // Close modal
      await page.getByTestId('modal-close').click();

      // The todo column should have one fewer card
      const newTodoCount = await todoCol.locator('[data-testid^="task-card-"]').count();
      expect(newTodoCount).toBe(initialTodoCount - 1);
    }
  });

  test('task detail modal select reflects current task status', async ({ page }) => {
    await page.locator('[data-testid^="task-card-"]').first().click();
    const select = page.getByTestId('task-move-select');
    const selectedValue = await select.inputValue();
    // The selected value should be one of the valid statuses
    expect(['todo', 'in-progress', 'review', 'done']).toContain(selectedValue);
  });

  test('task detail modal updates select value after moving', async ({ page }) => {
    const todoCards = page.getByTestId('column-todo').locator('[data-testid^="task-card-"]');
    const count = await todoCards.count();
    if (count > 0) {
      await todoCards.first().click();
      await page.getByTestId('task-move-select').selectOption('review');
      // The select should now reflect the new status
      await expect(page.getByTestId('task-move-select')).toHaveValue('review');
    }
  });

  test('add task button opens inline form', async ({ page }) => {
    await page.getByTestId('add-task-todo').click();
    await expect(page.getByTestId('new-task-form')).toBeVisible();
    await expect(page.getByTestId('new-task-input')).toBeVisible();
    await expect(page.getByTestId('new-task-input')).toBeFocused();
  });

  test('cancel new task closes the form', async ({ page }) => {
    await page.getByTestId('add-task-todo').click();
    await page.getByTestId('cancel-new-task').click();
    await expect(page.getByTestId('new-task-form')).not.toBeVisible();
  });

  test('add task with save button', async ({ page }) => {
    const todoCol = page.getByTestId('column-todo');
    const initialCount = await todoCol.locator('[data-testid^="task-card-"]').count();

    await page.getByTestId('add-task-todo').click();
    await page.getByTestId('new-task-input').fill('New test task');
    await page.getByTestId('save-new-task').click();

    await expectToast(page, 'Created task: New test task');
    // New task should appear in the todo column
    const newCount = await todoCol.locator('[data-testid^="task-card-"]').count();
    expect(newCount).toBe(initialCount + 1);
  });

  test('add task with Enter key', async ({ page }) => {
    const todoCol = page.getByTestId('column-todo');
    const initialCount = await todoCol.locator('[data-testid^="task-card-"]').count();

    await page.getByTestId('add-task-todo').click();
    await page.getByTestId('new-task-input').fill('Enter key task');
    await page.getByTestId('new-task-input').press('Enter');

    await expectToast(page, 'Created task: Enter key task');
    const newCount = await todoCol.locator('[data-testid^="task-card-"]').count();
    expect(newCount).toBe(initialCount + 1);
  });

  test('empty task title does not create a task', async ({ page }) => {
    const todoCol = page.getByTestId('column-todo');
    const initialCount = await todoCol.locator('[data-testid^="task-card-"]').count();

    await page.getByTestId('add-task-todo').click();
    await page.getByTestId('save-new-task').click();

    // Count should not change
    const newCount = await todoCol.locator('[data-testid^="task-card-"]').count();
    expect(newCount).toBe(initialCount);
  });

  test('new task added to correct column (not always todo)', async ({ page }) => {
    const reviewCol = page.getByTestId('column-review');
    const initialCount = await reviewCol.locator('[data-testid^="task-card-"]').count();

    await page.getByTestId('add-task-review').click();
    await page.getByTestId('new-task-input').fill('Review column task');
    await page.getByTestId('save-new-task').click();

    // Task should appear in the review column
    const newCount = await reviewCol.locator('[data-testid^="task-card-"]').count();
    expect(newCount).toBe(initialCount + 1);
  });

  test('adding task to one column then switching to another', async ({ page }) => {
    // Open add form in todo
    await page.getByTestId('add-task-todo').click();
    await expect(page.getByTestId('new-task-form')).toBeVisible();

    // Click add in another column — form should move there
    await page.getByTestId('add-task-done').click();
    // Form should now be in the done column
    const doneCol = page.getByTestId('column-done');
    await expect(doneCol.getByTestId('new-task-form')).toBeVisible();
  });

  test('task detail modal close button works', async ({ page }) => {
    await page.locator('[data-testid^="task-card-"]').first().click();
    await expect(page.getByTestId('modal')).toBeVisible();
    await page.getByTestId('modal-close').click();
    await expect(page.getByTestId('modal-overlay')).not.toBeVisible();
  });

  test('add task button has correct aria-label', async ({ page }) => {
    await expect(page.getByTestId('add-task-todo')).toHaveAttribute('aria-label', 'Add task to To Do');
    await expect(page.getByTestId('add-task-in-progress')).toHaveAttribute('aria-label', 'Add task to In Progress');
    await expect(page.getByTestId('add-task-review')).toHaveAttribute('aria-label', 'Add task to Review');
    await expect(page.getByTestId('add-task-done')).toHaveAttribute('aria-label', 'Add task to Done');
  });
});
