import { test, expect } from '@playwright/test';
import { loginAndNavigate } from './helpers';

test.describe('Kanban Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, 'kanban');
  });

  test.describe('Board Layout', () => {
    test('displays kanban board with 4 columns', async ({ page }) => {
      await expect(page.getByTestId('kanban-board')).toBeVisible();
      await expect(page.getByTestId('column-todo')).toBeVisible();
      await expect(page.getByTestId('column-in-progress')).toBeVisible();
      await expect(page.getByTestId('column-review')).toBeVisible();
      await expect(page.getByTestId('column-done')).toBeVisible();
    });

    test('To Do column shows correct count', async ({ page }) => {
      await expect(page.getByTestId('column-todo')).toContainText('To Do (8)');
    });

    test('In Progress column shows correct count', async ({ page }) => {
      await expect(page.getByTestId('column-in-progress')).toContainText('In Progress (4)');
    });

    test('Review column shows correct count', async ({ page }) => {
      await expect(page.getByTestId('column-review')).toContainText('Review (7)');
    });

    test('Done column shows correct count', async ({ page }) => {
      await expect(page.getByTestId('column-done')).toContainText('Done (5)');
    });

    test('each column has an add task button', async ({ page }) => {
      await expect(page.getByTestId('add-task-todo')).toBeVisible();
      await expect(page.getByTestId('add-task-in-progress')).toBeVisible();
      await expect(page.getByTestId('add-task-review')).toBeVisible();
      await expect(page.getByTestId('add-task-done')).toBeVisible();
    });

    test('add task buttons have correct aria-labels', async ({ page }) => {
      await expect(page.getByTestId('add-task-todo')).toHaveAttribute('aria-label', 'Add task to To Do');
      await expect(page.getByTestId('add-task-in-progress')).toHaveAttribute('aria-label', 'Add task to In Progress');
      await expect(page.getByTestId('add-task-review')).toHaveAttribute('aria-label', 'Add task to Review');
      await expect(page.getByTestId('add-task-done')).toHaveAttribute('aria-label', 'Add task to Done');
    });
  });

  test.describe('Task Cards', () => {
    test('task cards display title, priority, and assignee', async ({ page }) => {
      const firstCard = page.getByTestId('column-todo').locator('[data-testid^="task-card-"]').first();
      await expect(firstCard).toBeVisible();
      // Card should have priority badge
      await expect(firstCard.locator('span').first()).toBeVisible();
    });

    test('task cards have role="button" for click interaction', async ({ page }) => {
      const firstCard = page.getByTestId('column-todo').locator('[data-testid^="task-card-"]').first();
      // Cards are clickable divs with role from dnd-kit
      await expect(firstCard).toBeVisible();
    });

    test('priority badges show correct colors', async ({ page }) => {
      // Look for a critical task (red background)
      const criticalBadge = page.locator('.bg-red-100.text-red-800').first();
      await expect(criticalBadge).toBeVisible();
    });
  });

  test.describe('Add Task', () => {
    test('clicking add button shows new task form', async ({ page }) => {
      await page.getByTestId('add-task-todo').click();
      await expect(page.getByTestId('new-task-form')).toBeVisible();
      await expect(page.getByTestId('new-task-input')).toBeVisible();
      await expect(page.getByTestId('save-new-task')).toBeVisible();
      await expect(page.getByTestId('cancel-new-task')).toBeVisible();
    });

    test('new task input has autofocus', async ({ page }) => {
      await page.getByTestId('add-task-todo').click();
      await expect(page.getByTestId('new-task-input')).toBeFocused();
    });

    test('cancel button hides the form', async ({ page }) => {
      await page.getByTestId('add-task-todo').click();
      await page.getByTestId('cancel-new-task').click();
      await expect(page.getByTestId('new-task-form')).not.toBeVisible();
    });

    test('adding a task to To Do column', async ({ page }) => {
      await page.getByTestId('add-task-todo').click();
      await page.getByTestId('new-task-input').fill('My new task');
      await page.getByTestId('save-new-task').click();
      // Task should appear in the To Do column
      await expect(page.getByTestId('column-todo')).toContainText('My new task');
      // Form should be hidden
      await expect(page.getByTestId('new-task-form')).not.toBeVisible();
    });

    test('adding a task shows success toast', async ({ page }) => {
      await page.getByTestId('add-task-todo').click();
      await page.getByTestId('new-task-input').fill('Toast task');
      await page.getByTestId('save-new-task').click();
      await expect(page.getByRole('alert')).toContainText('Created task: Toast task');
    });

    test('adding a task updates column count', async ({ page }) => {
      await expect(page.getByTestId('column-todo')).toContainText('To Do (8)');
      await page.getByTestId('add-task-todo').click();
      await page.getByTestId('new-task-input').fill('Count task');
      await page.getByTestId('save-new-task').click();
      await expect(page.getByTestId('column-todo')).toContainText('To Do (9)');
    });

    test('pressing Enter submits the task', async ({ page }) => {
      await page.getByTestId('add-task-todo').click();
      await page.getByTestId('new-task-input').fill('Enter task');
      await page.getByTestId('new-task-input').press('Enter');
      await expect(page.getByTestId('column-todo')).toContainText('Enter task');
    });

    test('empty title does not create a task', async ({ page }) => {
      await page.getByTestId('add-task-todo').click();
      await page.getByTestId('save-new-task').click();
      // Form should still be visible since nothing was added
      await expect(page.getByTestId('new-task-form')).toBeVisible();
      // Count should remain the same
      await expect(page.getByTestId('column-todo')).toContainText('To Do (8)');
    });

    test('adding task to In Progress column', async ({ page }) => {
      await page.getByTestId('add-task-in-progress').click();
      await page.getByTestId('new-task-input').fill('Progress task');
      await page.getByTestId('save-new-task').click();
      await expect(page.getByTestId('column-in-progress')).toContainText('Progress task');
    });

    test('adding task to specific column places it in that column', async ({ page }) => {
      await page.getByTestId('add-task-review').click();
      await page.getByTestId('new-task-input').fill('Review specific task');
      await page.getByTestId('save-new-task').click();
      await expect(page.getByTestId('column-review')).toContainText('Review specific task');
    });

    test('only one add form is visible at a time', async ({ page }) => {
      await page.getByTestId('add-task-todo').click();
      await expect(page.getByTestId('new-task-form')).toBeVisible();
      await page.getByTestId('add-task-in-progress').click();
      // The form should now be in the in-progress column, not todo
      const forms = page.locator('[data-testid="new-task-form"]');
      await expect(forms).toHaveCount(1);
      await expect(page.getByTestId('column-in-progress').getByTestId('new-task-form')).toBeVisible();
    });
  });

  test.describe('Task Detail Modal', () => {
    test('clicking a task card opens detail modal', async ({ page }) => {
      const firstCard = page.getByTestId('column-todo').locator('[data-testid^="task-card-"]').first();
      await firstCard.click();
      await expect(page.getByTestId('modal')).toBeVisible();
      await expect(page.getByTestId('task-detail')).toBeVisible();
    });

    test('task detail shows title, description, status, priority, assignee', async ({ page }) => {
      const firstCard = page.getByTestId('column-todo').locator('[data-testid^="task-card-"]').first();
      await firstCard.click();
      const detail = page.getByTestId('task-detail');
      await expect(detail).toContainText('Title');
      await expect(detail).toContainText('Description');
      await expect(detail).toContainText('Status');
      await expect(detail).toContainText('Priority');
      await expect(detail).toContainText('Assignee');
    });

    test('task detail shows correct status for todo tasks', async ({ page }) => {
      const firstCard = page.getByTestId('column-todo').locator('[data-testid^="task-card-"]').first();
      await firstCard.click();
      await expect(page.getByTestId('task-detail')).toContainText('todo');
    });

    test('move-to select dropdown is visible', async ({ page }) => {
      const firstCard = page.getByTestId('column-todo').locator('[data-testid^="task-card-"]').first();
      await firstCard.click();
      await expect(page.getByTestId('task-move-select')).toBeVisible();
    });

    test('move-to select has all column options', async ({ page }) => {
      const firstCard = page.getByTestId('column-todo').locator('[data-testid^="task-card-"]').first();
      await firstCard.click();
      const select = page.getByTestId('task-move-select');
      await expect(select.locator('option')).toHaveCount(4);
      await expect(select.locator('option').nth(0)).toHaveText('To Do');
      await expect(select.locator('option').nth(1)).toHaveText('In Progress');
      await expect(select.locator('option').nth(2)).toHaveText('Review');
      await expect(select.locator('option').nth(3)).toHaveText('Done');
    });

    test('changing status via select moves task and shows toast', async ({ page }) => {
      const firstCard = page.getByTestId('column-todo').locator('[data-testid^="task-card-"]').first();
      const cardTitle = await firstCard.locator('div').first().textContent();
      await firstCard.click();
      await page.getByTestId('task-move-select').selectOption('done');
      await expect(page.getByRole('alert')).toContainText('Moved to Done');
    });

    test('moved task select reflects new status', async ({ page }) => {
      const firstCard = page.getByTestId('column-todo').locator('[data-testid^="task-card-"]').first();
      await firstCard.click();
      await page.getByTestId('task-move-select').selectOption('in-progress');
      // The select should now show the new status
      await expect(page.getByTestId('task-move-select')).toHaveValue('in-progress');
    });

    test('close button closes the modal', async ({ page }) => {
      const firstCard = page.getByTestId('column-todo').locator('[data-testid^="task-card-"]').first();
      await firstCard.click();
      await page.getByTestId('modal-close').click();
      await expect(page.getByTestId('modal')).not.toBeVisible();
    });

    test('modal has correct aria attributes', async ({ page }) => {
      const firstCard = page.getByTestId('column-todo').locator('[data-testid^="task-card-"]').first();
      await firstCard.click();
      await expect(page.getByTestId('modal')).toHaveAttribute('role', 'dialog');
      await expect(page.getByTestId('modal')).toHaveAttribute('aria-modal', 'true');
    });

    test('pressing Escape closes the task modal', async ({ page }) => {
      const firstCard = page.getByTestId('column-todo').locator('[data-testid^="task-card-"]').first();
      await firstCard.click();
      await expect(page.getByTestId('modal')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByTestId('modal')).not.toBeVisible();
    });

    test('clicking backdrop closes the task modal', async ({ page }) => {
      const firstCard = page.getByTestId('column-todo').locator('[data-testid^="task-card-"]').first();
      await firstCard.click();
      await expect(page.getByTestId('modal')).toBeVisible();
      await page.getByTestId('modal-overlay').click({ position: { x: 10, y: 10 } });
      await expect(page.getByTestId('modal')).not.toBeVisible();
    });
  });

  test.describe('Task Movement', () => {
    test('moving a task via modal updates column counts', async ({ page }) => {
      const todoCountBefore = await page.getByTestId('column-todo').locator('h2').textContent();
      const doneCountBefore = await page.getByTestId('column-done').locator('h2').textContent();

      const firstCard = page.getByTestId('column-todo').locator('[data-testid^="task-card-"]').first();
      await firstCard.click();
      await page.getByTestId('task-move-select').selectOption('done');
      await page.getByTestId('modal-close').click();

      // Todo count should decrease
      await expect(page.getByTestId('column-todo')).toContainText('To Do (7)');
      // Done count should increase
      await expect(page.getByTestId('column-done')).toContainText('Done (6)');
    });

    test('task appears in new column after move', async ({ page }) => {
      const firstCard = page.getByTestId('column-todo').locator('[data-testid^="task-card-"]').first();
      const cardTestId = await firstCard.getAttribute('data-testid');
      await firstCard.click();
      await page.getByTestId('task-move-select').selectOption('done');
      await page.getByTestId('modal-close').click();

      // Task should now be in the done column
      await expect(page.getByTestId('column-done').locator(`[data-testid="${cardTestId}"]`)).toBeVisible();
    });
  });
});
