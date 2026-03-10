import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows sign-in form by default', async ({ page }) => {
    await expect(page.getByTestId('auth-form')).toBeVisible();
    await expect(page.getByTestId('auth-form').getByRole('heading')).toHaveText('Sign In');
    await expect(page.getByTestId('submit-btn')).toHaveText('Sign In');
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    // Confirm password should NOT be visible in sign-in mode
    await expect(page.getByTestId('confirm-password-input')).not.toBeVisible();
  });

  test('toggles between sign-in and sign-up modes', async ({ page }) => {
    // Switch to sign-up
    await page.getByTestId('toggle-auth-mode').click();
    await expect(page.getByTestId('auth-form').getByRole('heading')).toHaveText('Create Account');
    await expect(page.getByTestId('submit-btn')).toHaveText('Create Account');
    await expect(page.getByTestId('confirm-password-input')).toBeVisible();

    // Switch back to sign-in
    await page.getByTestId('toggle-auth-mode').click();
    await expect(page.getByTestId('auth-form').getByRole('heading')).toHaveText('Sign In');
    await expect(page.getByTestId('confirm-password-input')).not.toBeVisible();
  });

  test('shows validation errors for empty fields', async ({ page }) => {
    await page.getByTestId('submit-btn').click();
    await expect(page.getByTestId('email-error')).toHaveText('Email is required');
    await expect(page.getByTestId('password-error')).toHaveText('Password is required');
  });

  test('shows error for invalid email format', async ({ page }) => {
    await page.getByTestId('email-input').fill('notanemail');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('submit-btn').click();
    await expect(page.getByTestId('email-error')).toHaveText('Invalid email address');
  });

  test('shows error for short password (fewer than 6 characters)', async ({ page }) => {
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('password-input').fill('abc');
    await page.getByTestId('submit-btn').click();
    await expect(page.getByTestId('password-error')).toHaveText('Password must be at least 6 characters');
  });

  test('toggles password visibility', async ({ page }) => {
    const passwordInput = page.getByTestId('password-input');
    const toggleBtn = page.getByTestId('toggle-password');

    // Default: password is hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await expect(toggleBtn).toHaveText('Show');

    // Click to show password
    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    await expect(toggleBtn).toHaveText('Hide');

    // Click to hide again
    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('password toggle button has correct aria-label', async ({ page }) => {
    const toggleBtn = page.getByTestId('toggle-password');
    // When password is hidden, aria-label should say "Show password"
    await expect(toggleBtn).toHaveAttribute('aria-label', 'Hide password');

    await toggleBtn.click();
    // When password is shown, aria-label should say "Hide password"
    await expect(toggleBtn).toHaveAttribute('aria-label', 'Show password');
  });

  test('successfully logs in with valid credentials', async ({ page }) => {
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('submit-btn').click();
    await expect(page.getByTestId('sidebar')).toBeVisible();
  });

  test('clears errors when switching auth mode', async ({ page }) => {
    // Trigger errors
    await page.getByTestId('submit-btn').click();
    await expect(page.getByTestId('email-error')).toBeVisible();

    // Switch to signup — errors should clear
    await page.getByTestId('toggle-auth-mode').click();
    await expect(page.getByTestId('email-error')).not.toBeVisible();
  });

  test('signup mode validates confirm password matches', async ({ page }) => {
    await page.getByTestId('toggle-auth-mode').click();
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('confirm-password-input').fill('differentpassword');
    await page.getByTestId('submit-btn').click();
    // Should show a confirm password mismatch error
    await expect(page.getByTestId('confirm-password-error')).toBeVisible();
  });
});
