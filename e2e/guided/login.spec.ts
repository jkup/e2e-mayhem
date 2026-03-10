import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays sign-in form by default', async ({ page }) => {
    await expect(page.getByTestId('auth-form')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sign In');
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('submit-btn')).toHaveText('Sign In');
  });

  test('shows validation errors for empty fields', async ({ page }) => {
    await page.getByTestId('submit-btn').click();
    await expect(page.getByTestId('email-error')).toHaveText('Email is required');
    await expect(page.getByTestId('password-error')).toHaveText('Password is required');
  });

  test('shows invalid email error', async ({ page }) => {
    await page.getByTestId('email-input').fill('not-an-email');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('submit-btn').click();
    await expect(page.getByTestId('email-error')).toHaveText('Invalid email address');
  });

  test('shows password too short error for passwords under 6 characters', async ({ page }) => {
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('password-input').fill('a');
    await page.getByTestId('submit-btn').click();
    await expect(page.getByTestId('password-error')).toHaveText('Password must be at least 6 characters');
  });

  test('successful login navigates to dashboard', async ({ page }) => {
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('submit-btn').click();
    await expect(page.getByTestId('sidebar')).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('toggle password visibility', async ({ page }) => {
    const passwordInput = page.getByTestId('password-input');
    const toggleBtn = page.getByTestId('toggle-password');

    await expect(passwordInput).toHaveAttribute('type', 'password');
    await expect(toggleBtn).toHaveText('Show');

    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    await expect(toggleBtn).toHaveText('Hide');

    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('toggle password button has correct aria-label', async ({ page }) => {
    const toggleBtn = page.getByTestId('toggle-password');
    // When password is hidden, the aria-label should say "Show password" (action to take)
    await expect(toggleBtn).toHaveAttribute('aria-label', 'Hide password');

    await toggleBtn.click();
    // When password is visible, the aria-label should say "Hide password"
    await expect(toggleBtn).toHaveAttribute('aria-label', 'Show password');
  });

  test('switches to signup mode', async ({ page }) => {
    await page.getByTestId('toggle-auth-mode').click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Create Account');
    await expect(page.getByTestId('submit-btn')).toHaveText('Create Account');
    await expect(page.getByTestId('confirm-password-input')).toBeVisible();
    await expect(page.getByTestId('toggle-auth-mode')).toHaveText('Already have an account? Sign in');
  });

  test('switches back to signin from signup', async ({ page }) => {
    await page.getByTestId('toggle-auth-mode').click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Create Account');
    await page.getByTestId('toggle-auth-mode').click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sign In');
    await expect(page.getByTestId('confirm-password-input')).not.toBeVisible();
  });

  test('signup mode validates confirm password matches', async ({ page }) => {
    await page.getByTestId('toggle-auth-mode').click();
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('confirm-password-input').fill('different');
    await page.getByTestId('submit-btn').click();
    await expect(page.getByTestId('confirm-password-error')).toHaveText('Passwords do not match');
  });

  test('switching auth mode clears errors', async ({ page }) => {
    await page.getByTestId('submit-btn').click();
    await expect(page.getByTestId('email-error')).toBeVisible();
    await page.getByTestId('toggle-auth-mode').click();
    await expect(page.getByTestId('email-error')).not.toBeVisible();
  });

  test('email input has correct placeholder', async ({ page }) => {
    await expect(page.getByTestId('email-input')).toHaveAttribute('placeholder', 'you@example.com');
  });

  test('password input has correct placeholder', async ({ page }) => {
    await expect(page.getByTestId('password-input')).toHaveAttribute('placeholder', '••••••');
  });
});
