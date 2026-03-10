import { test, expect } from '@playwright/test';
import { login, expectToast } from './helpers';

test.describe('Search Autocomplete', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await login(page);
  });

  test('search input is visible in the topbar', async ({ page }) => {
    await expect(page.getByTestId('search-autocomplete-input')).toBeVisible();
  });

  test('typing shows filtered results', async ({ page }) => {
    const input = page.getByTestId('search-autocomplete-input');
    await input.fill('Eng');
    const results = page.getByTestId('search-autocomplete-results');
    await expect(results).toBeVisible();
    // Should include "Engineering" department
    await expect(results).toContainText('Engineering');
  });

  test('clicking a result triggers a toast and clears input', async ({ page }) => {
    const input = page.getByTestId('search-autocomplete-input');
    await input.fill('Eng');
    await page.getByTestId('search-autocomplete-result-0').click();
    await expectToast(page, /Selected:/);
    await expect(input).toHaveValue('');
  });

  test('keyboard navigation with ArrowDown selects next item', async ({ page }) => {
    const input = page.getByTestId('search-autocomplete-input');
    await input.fill('Eng');
    await expect(page.getByTestId('search-autocomplete-results')).toBeVisible();

    // Press ArrowDown — first result should become active
    await input.press('ArrowDown');
    const firstResult = page.getByTestId('search-autocomplete-result-0');
    await expect(firstResult).toHaveAttribute('aria-selected', 'true');

    // Press ArrowDown again — second result should become active
    await input.press('ArrowDown');
    const secondResult = page.getByTestId('search-autocomplete-result-1');
    await expect(secondResult).toHaveAttribute('aria-selected', 'true');
    await expect(firstResult).toHaveAttribute('aria-selected', 'false');
  });

  test('keyboard ArrowUp moves selection up', async ({ page }) => {
    const input = page.getByTestId('search-autocomplete-input');
    await input.fill('Eng');
    await expect(page.getByTestId('search-autocomplete-results')).toBeVisible();

    // Move down twice
    await input.press('ArrowDown');
    await input.press('ArrowDown');
    // Now move up
    await input.press('ArrowUp');
    const firstResult = page.getByTestId('search-autocomplete-result-0');
    await expect(firstResult).toHaveAttribute('aria-selected', 'true');
  });

  test('Enter key selects the active item', async ({ page }) => {
    const input = page.getByTestId('search-autocomplete-input');
    await input.fill('Eng');
    await input.press('ArrowDown');
    await input.press('Enter');
    await expectToast(page, /Selected:/);
    await expect(input).toHaveValue('');
  });

  test('Escape key closes the dropdown', async ({ page }) => {
    const input = page.getByTestId('search-autocomplete-input');
    await input.fill('Eng');
    await expect(page.getByTestId('search-autocomplete-results')).toBeVisible();
    await input.press('Escape');
    await expect(page.getByTestId('search-autocomplete-results')).not.toBeVisible();
  });

  test('clicking outside closes the dropdown', async ({ page }) => {
    const input = page.getByTestId('search-autocomplete-input');
    await input.fill('Eng');
    await expect(page.getByTestId('search-autocomplete-results')).toBeVisible();
    await page.locator('main').click();
    await expect(page.getByTestId('search-autocomplete-results')).not.toBeVisible();
  });

  test('no results shown when query is empty', async ({ page }) => {
    const input = page.getByTestId('search-autocomplete-input');
    await input.fill('');
    await expect(page.getByTestId('search-autocomplete-results')).not.toBeVisible();
  });

  test('no results for non-matching query', async ({ page }) => {
    const input = page.getByTestId('search-autocomplete-input');
    await input.fill('zzzzzzzznoexist');
    await expect(page.getByTestId('search-autocomplete-results')).not.toBeVisible();
  });

  test('combobox has correct aria attributes', async ({ page }) => {
    const input = page.getByTestId('search-autocomplete-input');
    await expect(input).toHaveAttribute('role', 'combobox');
    await expect(input).toHaveAttribute('aria-autocomplete', 'list');
    await expect(input).toHaveAttribute('aria-expanded', 'false');

    await input.fill('Eng');
    await expect(input).toHaveAttribute('aria-expanded', 'true');
  });
});
