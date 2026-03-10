import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('KanbanPage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await login(page);
    await page.getByTestId('nav-kanban').click();
    await page.getByTestId('kanban-board').waitFor({ state: 'visible' });
  });

  test.describe('Board Layout', () => {
    test('should show kanban board with 4 columns', async ({ page }) => {
      await expect(page.getByTestId('kanban-board')).toBeVisible();
      await expect(page.getByTestId('column-todo')).toBeVisible();
      await expect(page.getByTestId('column-in-progress')).toBeVisible();
      await expect(page.getByTestId('column-review')).toBeVisible();
      await expect(page.getByTestId('column-done')).toBeVisible();
    });

    test('To Do column should show 8 tasks', async ({ page }) => {
      const column = page.getByTestId('column-todo');
      await expect(column).toContainText('To Do (8)');
    });

    test('In Progress column should show 4 tasks', async ({ page }) => {
      const column = page.getByTestId('column-in-progress');
      await expect(column).toContainText('In Progress (4)');
    });

    test('Review column should show 7 tasks', async ({ page }) => {
      const column = page.getByTestId('column-review');
      await expect(column).toContainText('Review (7)');
    });

    test('Done column should show 5 tasks', async ({ page }) => {
      const column = page.getByTestId('column-done');
      await expect(column).toContainText('Done (5)');
    });
  });

  test.describe('Task Cards', () => {
    test('should display task cards with title and priority badge', async ({ page }) => {
      // Check first todo task
      const firstCard = page.locator('[data-testid^="task-card-"]').first();
      await expect(firstCard).toBeVisible();
    });

    test('critical priority cards should have red styling', async ({ page }) => {
      // Task 0 is critical priority in todo column
      const todoColumn = page.getByTestId('column-todo');
      // Look for red priority badges
      const criticalBadge = todoColumn.locator('.bg-red-100.text-red-800').first();
      await expect(criticalBadge).toBeVisible();
    });

    test('cards should have cursor-grab class', async ({ page }) => {
      const firstCard = page.locator('[data-testid^="task-card-"]').first();
      await expect(firstCard).toHaveClass(/cursor-grab/);
    });

    test('should show assignee first name only on cards', async ({ page }) => {
      // Task 0 has assignee "Maurice Hegmann II" - should show "Maurice"
      const todoColumn = page.getByTestId('column-todo');
      await expect(todoColumn).toContainText('Maurice');
    });

    test('high priority cards should have orange styling', async ({ page }) => {
      const board = page.getByTestId('kanban-board');
      const highBadge = board.locator('.bg-orange-100.text-orange-800').first();
      await expect(highBadge).toBeVisible();
    });

    test('medium priority cards should have yellow styling', async ({ page }) => {
      const board = page.getByTestId('kanban-board');
      const mediumBadge = board.locator('.bg-yellow-100.text-yellow-800').first();
      await expect(mediumBadge).toBeVisible();
    });

    test('low priority cards should have green styling', async ({ page }) => {
      const board = page.getByTestId('kanban-board');
      const lowBadge = board.locator('.bg-green-100.text-green-800').first();
      await expect(lowBadge).toBeVisible();
    });

    test('critical priority cards should have red left border', async ({ page }) => {
      const board = page.getByTestId('kanban-board');
      const criticalBorder = board.locator('.border-l-red-500').first();
      await expect(criticalBorder).toBeVisible();
    });
  });

  test.describe('Add Task', () => {
    test('each column should have an add task button', async ({ page }) => {
      await expect(page.getByTestId('add-task-todo')).toBeVisible();
      await expect(page.getByTestId('add-task-in-progress')).toBeVisible();
      await expect(page.getByTestId('add-task-review')).toBeVisible();
      await expect(page.getByTestId('add-task-done')).toBeVisible();
    });

    test('add task buttons should have correct aria-labels', async ({ page }) => {
      await expect(page.getByTestId('add-task-todo')).toHaveAttribute('aria-label', 'Add task to To Do');
      await expect(page.getByTestId('add-task-in-progress')).toHaveAttribute('aria-label', 'Add task to In Progress');
      await expect(page.getByTestId('add-task-review')).toHaveAttribute('aria-label', 'Add task to Review');
      await expect(page.getByTestId('add-task-done')).toHaveAttribute('aria-label', 'Add task to Done');
    });

    test('clicking add button should show inline form', async ({ page }) => {
      await page.getByTestId('add-task-todo').click();

      await expect(page.getByTestId('new-task-form')).toBeVisible();
      await expect(page.getByTestId('new-task-input')).toBeVisible();
      await expect(page.getByTestId('save-new-task')).toBeVisible();
      await expect(page.getByTestId('cancel-new-task')).toBeVisible();
    });

    test('new task input should have autofocus', async ({ page }) => {
      await page.getByTestId('add-task-todo').click();
      await expect(page.getByTestId('new-task-input')).toBeFocused();
    });

    test('new task input should have correct placeholder', async ({ page }) => {
      await page.getByTestId('add-task-todo').click();
      await expect(page.getByTestId('new-task-input')).toHaveAttribute('placeholder', 'Task title...');
    });

    test('cancel button should close the form', async ({ page }) => {
      await page.getByTestId('add-task-todo').click();
      await page.getByTestId('cancel-new-task').click();
      await expect(page.getByTestId('new-task-form')).not.toBeVisible();
    });

    test('adding a task should create it in the correct column (intended behavior)', async ({ page }) => {
      // Add task to In Progress column
      await page.getByTestId('add-task-in-progress').click();
      await page.getByTestId('new-task-input').fill('My new task');
      await page.getByTestId('save-new-task').click();

      // INTENDED: Task should appear in the In Progress column
      const inProgressColumn = page.getByTestId('column-in-progress');
      await expect(inProgressColumn).toContainText('My new task');
      await expect(inProgressColumn).toContainText('In Progress (5)'); // was 4, now 5
    });

    test('adding a task should show success toast', async ({ page }) => {
      await page.getByTestId('add-task-todo').click();
      await page.getByTestId('new-task-input').fill('Test task');
      await page.getByTestId('save-new-task').click();

      await expect(page.getByTestId('toast-success')).toBeVisible();
      await expect(page.getByTestId('toast-success')).toContainText('Created task: Test task');
    });

    test('pressing Enter should submit the form', async ({ page }) => {
      await page.getByTestId('add-task-todo').click();
      await page.getByTestId('new-task-input').fill('Enter task');
      await page.getByTestId('new-task-input').press('Enter');

      await expect(page.getByTestId('toast-success')).toBeVisible();
      await expect(page.getByTestId('toast-success')).toContainText('Created task: Enter task');
    });

    test('empty title should not create a task', async ({ page }) => {
      await page.getByTestId('add-task-todo').click();
      await page.getByTestId('save-new-task').click();

      // Form should still be visible (not submitted)
      await expect(page.getByTestId('new-task-form')).toBeVisible();
      // No toast should appear
      await expect(page.getByTestId('toast-success')).not.toBeVisible();
    });

    test('whitespace-only title should not create a task', async ({ page }) => {
      await page.getByTestId('add-task-todo').click();
      await page.getByTestId('new-task-input').fill('   ');
      await page.getByTestId('save-new-task').click();

      await expect(page.getByTestId('new-task-form')).toBeVisible();
    });

    test('only one add form should be open at a time', async ({ page }) => {
      // Open form in todo column
      await page.getByTestId('add-task-todo').click();
      await expect(page.getByTestId('new-task-form')).toBeVisible();

      // Open form in review column - should close todo form
      await page.getByTestId('add-task-review').click();
      const forms = page.locator('[data-testid="new-task-form"]');
      await expect(forms).toHaveCount(1);
    });

    test('new tasks should have medium priority and assignee "You"', async ({ page }) => {
      await page.getByTestId('add-task-todo').click();
      await page.getByTestId('new-task-input').fill('New test task');
      await page.getByTestId('save-new-task').click();

      // The new task should show "You" as assignee and medium priority
      // Find the new card in todo column
      const todoColumn = page.getByTestId('column-todo');
      await expect(todoColumn).toContainText('New test task');
      await expect(todoColumn).toContainText('You');
    });
  });

  test.describe('Task Detail Modal', () => {
    test('clicking a task card should open detail modal', async ({ page }) => {
      const firstCard = page.locator('[data-testid^="task-card-"]').first();
      await firstCard.click();

      await expect(page.getByTestId('modal')).toBeVisible();
      await expect(page.getByTestId('task-detail')).toBeVisible();
    });

    test('modal should show task title', async ({ page }) => {
      const firstCard = page.locator('[data-testid^="task-card-"]').first();
      await firstCard.click();

      const detail = page.getByTestId('task-detail');
      // Should contain the title text
      await expect(detail).toContainText('Title');
    });

    test('modal title should be "Task Details"', async ({ page }) => {
      const firstCard = page.locator('[data-testid^="task-card-"]').first();
      await firstCard.click();

      const modal = page.getByTestId('modal');
      await expect(modal).toHaveAttribute('aria-label', 'Task Details');
    });

    test('modal should show task status, priority, and assignee', async ({ page }) => {
      const firstCard = page.locator('[data-testid^="task-card-"]').first();
      await firstCard.click();

      const detail = page.getByTestId('task-detail');
      await expect(detail).toContainText('Status');
      await expect(detail).toContainText('Priority');
      await expect(detail).toContainText('Assignee');
    });

    test('should have move-to dropdown', async ({ page }) => {
      const firstCard = page.locator('[data-testid^="task-card-"]').first();
      await firstCard.click();

      await expect(page.getByTestId('task-move-select')).toBeVisible();
    });

    test('move-to dropdown should have 4 options', async ({ page }) => {
      const firstCard = page.locator('[data-testid^="task-card-"]').first();
      await firstCard.click();

      const select = page.getByTestId('task-move-select');
      const options = select.locator('option');
      await expect(options).toHaveCount(4);
    });

    test('changing move-to should show toast', async ({ page }) => {
      // Click a todo task card
      const todoColumn = page.getByTestId('column-todo');
      const firstTodoCard = todoColumn.locator('[data-testid^="task-card-"]').first();
      await firstTodoCard.click();

      // Change status to done
      await page.getByTestId('task-move-select').selectOption('done');

      await expect(page.getByTestId('toast-info')).toBeVisible();
      await expect(page.getByTestId('toast-info')).toContainText('Moved to Done');
    });

    test('moving task should update column counts', async ({ page }) => {
      // Initial: todo 8, done 5
      await expect(page.getByTestId('column-todo')).toContainText('To Do (8)');
      await expect(page.getByTestId('column-done')).toContainText('Done (5)');

      // Click a todo task
      const todoColumn = page.getByTestId('column-todo');
      const firstTodoCard = todoColumn.locator('[data-testid^="task-card-"]').first();
      await firstTodoCard.click();

      // Move to done
      await page.getByTestId('task-move-select').selectOption('done');

      // Close modal
      await page.getByTestId('modal-close').click();

      // Counts should update
      await expect(page.getByTestId('column-todo')).toContainText('To Do (7)');
      await expect(page.getByTestId('column-done')).toContainText('Done (6)');
    });

    test('close button should close the modal', async ({ page }) => {
      const firstCard = page.locator('[data-testid^="task-card-"]').first();
      await firstCard.click();

      await expect(page.getByTestId('modal')).toBeVisible();
      await page.getByTestId('modal-close').click();
      await expect(page.getByTestId('modal')).not.toBeVisible();
    });
  });

  test.describe('Specific Tasks in Columns', () => {
    test('todo column should contain known todo tasks', async ({ page }) => {
      const todoColumn = page.getByTestId('column-todo');
      // Task 0: "If we quantify the application..."
      await expect(todoColumn).toContainText('If we quantify the application');
      // Task 4: "Use the haptic PCI program..."
      await expect(todoColumn).toContainText('Use the haptic PCI program');
    });

    test('in-progress column should contain known in-progress tasks', async ({ page }) => {
      const column = page.getByTestId('column-in-progress');
      // Task 5: "You can't quantify the microchip..."
      await expect(column).toContainText("You can't quantify the microchip");
      // Task 14: "I'll override the auxiliary AGP..."
      await expect(column).toContainText("I'll override the auxiliary AGP");
    });

    test('review column should contain known review tasks', async ({ page }) => {
      const column = page.getByTestId('column-review');
      // Task 2: "copying the port won't do anything..."
      await expect(column).toContainText("copying the port won't do anything");
    });

    test('done column should contain known done tasks', async ({ page }) => {
      const column = page.getByTestId('column-done');
      // Task 1: "If we hack the transmitter..."
      await expect(column).toContainText('If we hack the transmitter');
    });
  });
});
