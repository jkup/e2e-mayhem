import { test, expect } from '@playwright/test';

test.describe('LoginPage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Structure', () => {
    test('should show Sign In heading by default', async ({ page }) => {
      await expect(page.getByTestId('auth-form')).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    });

    test('should have email input with correct placeholder', async ({ page }) => {
      const emailInput = page.getByTestId('email-input');
      await expect(emailInput).toBeVisible();
      await expect(emailInput).toHaveAttribute('type', 'email');
      await expect(emailInput).toHaveAttribute('placeholder', 'you@example.com');
    });

    test('should have password input with password type', async ({ page }) => {
      const passwordInput = page.getByTestId('password-input');
      await expect(passwordInput).toBeVisible();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('should have submit button with Sign In text', async ({ page }) => {
      await expect(page.getByTestId('submit-btn')).toHaveText('Sign In');
    });

    test('should not show confirm password in login mode', async ({ page }) => {
      await expect(page.getByTestId('confirm-password-input')).not.toBeVisible();
    });

    test('form should have noValidate attribute', async ({ page }) => {
      const form = page.getByTestId('auth-form').locator('form');
      await expect(form).toHaveAttribute('novalidate', '');
    });
  });

  test.describe('Password Visibility Toggle', () => {
    test('should toggle password input type between password and text', async ({ page }) => {
      const passwordInput = page.getByTestId('password-input');
      const toggleBtn = page.getByTestId('toggle-password');

      // Initially password is hidden (type=password)
      await expect(passwordInput).toHaveAttribute('type', 'password');

      // Click to show password
      await toggleBtn.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');

      // Click again to hide
      await toggleBtn.click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('should show correct button text', async ({ page }) => {
      const toggleBtn = page.getByTestId('toggle-password');

      // When password is hidden, text says "Show"
      await expect(toggleBtn).toContainText('Show');

      // After toggle, text says "Hide"
      await toggleBtn.click();
      await expect(toggleBtn).toContainText('Hide');
    });

    test('should have correct aria-label (intended behavior)', async ({ page }) => {
      const toggleBtn = page.getByTestId('toggle-password');

      // INTENDED: When password is hidden, aria-label should be "Show password"
      await expect(toggleBtn).toHaveAttribute('aria-label', 'Show password');

      // Click to show password
      await toggleBtn.click();

      // INTENDED: When password is visible, aria-label should be "Hide password"
      await expect(toggleBtn).toHaveAttribute('aria-label', 'Hide password');
    });
  });

  test.describe('Email Validation', () => {
    test('should show "Email is required" when email is empty', async ({ page }) => {
      await page.getByTestId('password-input').fill('password123');
      await page.getByTestId('submit-btn').click();

      await expect(page.getByTestId('email-error')).toHaveText('Email is required');
    });

    test('should show "Invalid email address" for invalid email', async ({ page }) => {
      await page.getByTestId('email-input').fill('notanemail');
      await page.getByTestId('password-input').fill('password123');
      await page.getByTestId('submit-btn').click();

      await expect(page.getByTestId('email-error')).toHaveText('Invalid email address');
    });

    test('should accept valid email format like a@b.c', async ({ page }) => {
      await page.getByTestId('email-input').fill('a@b.c');
      await page.getByTestId('password-input').fill('password123');
      await page.getByTestId('submit-btn').click();

      await expect(page.getByTestId('email-error')).not.toBeVisible();
    });

    test('should add border-red-500 class to invalid email input', async ({ page }) => {
      await page.getByTestId('submit-btn').click();
      await expect(page.getByTestId('email-input')).toHaveClass(/border-red-500/);
    });
  });

  test.describe('Password Validation', () => {
    test('should show "Password is required" when password is empty', async ({ page }) => {
      await page.getByTestId('email-input').fill('test@example.com');
      await page.getByTestId('submit-btn').click();

      await expect(page.getByTestId('password-error')).toHaveText('Password is required');
    });

    test('should require at least 6 characters (intended behavior)', async ({ page }) => {
      await page.getByTestId('email-input').fill('test@example.com');
      await page.getByTestId('password-input').fill('12345'); // 5 chars - should fail
      await page.getByTestId('submit-btn').click();

      await expect(page.getByTestId('password-error')).toHaveText('Password must be at least 6 characters');
    });

    test('should accept password of exactly 6 characters', async ({ page }) => {
      await page.getByTestId('email-input').fill('test@example.com');
      await page.getByTestId('password-input').fill('123456');
      await page.getByTestId('submit-btn').click();

      await expect(page.getByTestId('password-error')).not.toBeVisible();
    });

    test('should reject password of 2-5 characters (intended behavior)', async ({ page }) => {
      await page.getByTestId('email-input').fill('test@example.com');
      await page.getByTestId('password-input').fill('ab'); // 2 chars
      await page.getByTestId('submit-btn').click();

      await expect(page.getByTestId('password-error')).toHaveText('Password must be at least 6 characters');
    });

    test('should add border-red-500 class to invalid password input', async ({ page }) => {
      await page.getByTestId('email-input').fill('test@example.com');
      await page.getByTestId('submit-btn').click();
      await expect(page.getByTestId('password-input')).toHaveClass(/border-red-500/);
    });
  });

  test.describe('Form Submit', () => {
    test('should navigate to app shell on valid login', async ({ page }) => {
      await page.getByTestId('email-input').fill('test@example.com');
      await page.getByTestId('password-input').fill('password123');
      await page.getByTestId('submit-btn').click();

      await expect(page.getByTestId('sidebar')).toBeVisible();
    });

    test('should not submit when validation fails', async ({ page }) => {
      await page.getByTestId('submit-btn').click();

      // Should still show login form
      await expect(page.getByTestId('auth-form')).toBeVisible();
      await expect(page.getByTestId('sidebar')).not.toBeVisible();
    });

    test('errors should clear on next submit attempt', async ({ page }) => {
      // First submit with empty fields - get errors
      await page.getByTestId('submit-btn').click();
      await expect(page.getByTestId('email-error')).toBeVisible();

      // Fill valid data and submit again
      await page.getByTestId('email-input').fill('test@example.com');
      await page.getByTestId('password-input').fill('password123');
      await page.getByTestId('submit-btn').click();

      // Should succeed, no errors
      await expect(page.getByTestId('sidebar')).toBeVisible();
    });
  });

  test.describe('Auth Mode Toggle', () => {
    test('should toggle between Sign In and Create Account', async ({ page }) => {
      // Default: Sign In mode
      await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
      await expect(page.getByTestId('submit-btn')).toHaveText('Sign In');

      // Toggle to signup
      await page.getByTestId('toggle-auth-mode').click();
      await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
      await expect(page.getByTestId('submit-btn')).toHaveText('Create Account');

      // Toggle back to login
      await page.getByTestId('toggle-auth-mode').click();
      await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    });

    test('should show toggle text correctly', async ({ page }) => {
      // Login mode
      await expect(page.getByTestId('toggle-auth-mode')).toContainText("Don't have an account? Sign up");

      // Signup mode
      await page.getByTestId('toggle-auth-mode').click();
      await expect(page.getByTestId('toggle-auth-mode')).toContainText('Already have an account? Sign in');
    });

    test('should show confirm password field in signup mode', async ({ page }) => {
      await page.getByTestId('toggle-auth-mode').click();
      await expect(page.getByTestId('confirm-password-input')).toBeVisible();
    });

    test('should clear validation errors when toggling mode', async ({ page }) => {
      // Trigger validation errors
      await page.getByTestId('submit-btn').click();
      await expect(page.getByTestId('email-error')).toBeVisible();

      // Toggle mode - errors should clear
      await page.getByTestId('toggle-auth-mode').click();
      await expect(page.getByTestId('email-error')).not.toBeVisible();
    });

    test('should NOT clear field values when toggling mode', async ({ page }) => {
      await page.getByTestId('email-input').fill('test@example.com');
      await page.getByTestId('password-input').fill('mypassword');

      await page.getByTestId('toggle-auth-mode').click();

      await expect(page.getByTestId('email-input')).toHaveValue('test@example.com');
      await expect(page.getByTestId('password-input')).toHaveValue('mypassword');
    });
  });

  test.describe('Confirm Password Validation (intended behavior)', () => {
    test('should validate that confirm password matches password', async ({ page }) => {
      // Switch to signup mode
      await page.getByTestId('toggle-auth-mode').click();

      await page.getByTestId('email-input').fill('test@example.com');
      await page.getByTestId('password-input').fill('password123');
      await page.getByTestId('confirm-password-input').fill('differentpassword');
      await page.getByTestId('submit-btn').click();

      // INTENDED: Should show an error about password mismatch
      // The confirm password should be validated to match the password
      // This test asserts the intended behavior - it should NOT allow mismatched passwords
      // We check that either the app stays on login (validation error) or shows an error
      // Since the spec says no validation is implemented, this test will fail (which is the point)
      const confirmError = page.getByTestId('confirm-password-error');
      await expect(confirmError).toBeVisible();
    });
  });
});
