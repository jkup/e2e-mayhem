import { test, expect } from '@playwright/test';
import { login, navigateTo, expectToast } from './helpers';

test.describe('Wizard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await login(page);
    await navigateTo(page, 'wizard');
  });

  test('displays step indicator with 4 steps', async ({ page }) => {
    await expect(page.getByTestId('wizard-steps')).toBeVisible();
    await expect(page.getByTestId('wizard-step-0')).toBeVisible();
    await expect(page.getByTestId('wizard-step-1')).toBeVisible();
    await expect(page.getByTestId('wizard-step-2')).toBeVisible();
    await expect(page.getByTestId('wizard-step-3')).toBeVisible();
  });

  test('starts on step 1 (Personal Info)', async ({ page }) => {
    await expect(page.getByTestId('wizard-content')).toContainText('Personal Information');
    // Current step should be highlighted
    const step0 = page.getByTestId('wizard-step-0');
    await expect(step0).toHaveClass(/ring-2/);
    await expect(step0).toHaveClass(/ring-blue-600/);
  });

  test('back button disabled on first step', async ({ page }) => {
    await expect(page.getByTestId('wizard-prev')).toBeDisabled();
  });

  test('step 1 validation: required fields', async ({ page }) => {
    await page.getByTestId('wizard-next').click();
    await expect(page.getByTestId('wizard-firstName-error')).toHaveText('Required');
    await expect(page.getByTestId('wizard-lastName-error')).toHaveText('Required');
    await expect(page.getByTestId('wizard-email-error')).toHaveText('Required');
  });

  test('step 1 validation: invalid email', async ({ page }) => {
    await page.getByTestId('wizard-firstName').fill('John');
    await page.getByTestId('wizard-lastName').fill('Doe');
    await page.getByTestId('wizard-email').fill('notanemail');
    await page.getByTestId('wizard-next').click();
    await expect(page.getByTestId('wizard-email-error')).toHaveText('Invalid email');
  });

  test('step 1 to step 2 navigation', async ({ page }) => {
    await page.getByTestId('wizard-firstName').fill('John');
    await page.getByTestId('wizard-lastName').fill('Doe');
    await page.getByTestId('wizard-email').fill('john@example.com');
    await page.getByTestId('wizard-next').click();
    await expect(page.getByTestId('wizard-content')).toContainText('Company Details');
  });

  test('completed steps show checkmark', async ({ page }) => {
    await page.getByTestId('wizard-firstName').fill('John');
    await page.getByTestId('wizard-lastName').fill('Doe');
    await page.getByTestId('wizard-email').fill('john@example.com');
    await page.getByTestId('wizard-next').click();
    // Step 0 should now show a checkmark (✓)
    await expect(page.getByTestId('wizard-step-0')).toContainText('✓');
    // And step 0 should have completed styling (bg-blue-600)
    await expect(page.getByTestId('wizard-step-0')).toHaveClass(/bg-blue-600/);
  });

  test('step 2 validation: company name required', async ({ page }) => {
    // Fill step 1 and proceed
    await page.getByTestId('wizard-firstName').fill('John');
    await page.getByTestId('wizard-lastName').fill('Doe');
    await page.getByTestId('wizard-email').fill('john@example.com');
    await page.getByTestId('wizard-next').click();

    // Try to proceed without company name
    await page.getByTestId('wizard-next').click();
    await expect(page.getByTestId('wizard-company-error')).toHaveText('Required');
  });

  test('step 2 to step 3 navigation', async ({ page }) => {
    await page.getByTestId('wizard-firstName').fill('John');
    await page.getByTestId('wizard-lastName').fill('Doe');
    await page.getByTestId('wizard-email').fill('john@example.com');
    await page.getByTestId('wizard-next').click();

    await page.getByTestId('wizard-company').fill('Acme Corp');
    await page.getByTestId('wizard-next').click();
    await expect(page.getByTestId('wizard-content')).toContainText('Choose Your Plan');
  });

  test('step 3: plan selection', async ({ page }) => {
    // Navigate to step 3
    await page.getByTestId('wizard-firstName').fill('John');
    await page.getByTestId('wizard-lastName').fill('Doe');
    await page.getByTestId('wizard-email').fill('john@example.com');
    await page.getByTestId('wizard-next').click();
    await page.getByTestId('wizard-company').fill('Acme Corp');
    await page.getByTestId('wizard-next').click();

    // Default is starter
    await expect(page.getByTestId('wizard-plan-starter')).toHaveClass(/border-blue-600/);

    // Select pro
    await page.getByTestId('wizard-plan-pro').click();
    await expect(page.getByTestId('wizard-plan-pro')).toHaveClass(/border-blue-600/);
    await expect(page.getByTestId('wizard-plan-starter')).not.toHaveClass(/border-blue-600/);

    // Select enterprise
    await page.getByTestId('wizard-plan-enterprise').click();
    await expect(page.getByTestId('wizard-plan-enterprise')).toHaveClass(/border-blue-600/);
  });

  test('step 3: addon checkboxes toggle', async ({ page }) => {
    await page.getByTestId('wizard-firstName').fill('John');
    await page.getByTestId('wizard-lastName').fill('Doe');
    await page.getByTestId('wizard-email').fill('john@example.com');
    await page.getByTestId('wizard-next').click();
    await page.getByTestId('wizard-company').fill('Acme Corp');
    await page.getByTestId('wizard-next').click();

    const apiAccess = page.getByTestId('wizard-addon-api-access');
    await expect(apiAccess).not.toBeChecked();
    await apiAccess.check();
    await expect(apiAccess).toBeChecked();
    await apiAccess.uncheck();
    await expect(apiAccess).not.toBeChecked();
  });

  test('step 4: review page shows entered data', async ({ page }) => {
    await page.getByTestId('wizard-firstName').fill('John');
    await page.getByTestId('wizard-lastName').fill('Doe');
    await page.getByTestId('wizard-email').fill('john@example.com');
    await page.getByTestId('wizard-phone').fill('555-1234');
    await page.getByTestId('wizard-next').click();

    await page.getByTestId('wizard-company').fill('Acme Corp');
    await page.getByTestId('wizard-jobTitle').fill('Developer');
    await page.getByTestId('wizard-next').click();

    await page.getByTestId('wizard-plan-pro').click();
    await page.getByTestId('wizard-addon-api-access').check();
    await page.getByTestId('wizard-next').click();

    // Now on review page
    await expect(page.getByTestId('wizard-content')).toContainText('Review & Confirm');
    const review = page.getByTestId('wizard-review');
    // Name should be displayed as "FirstName LastName" (first then last)
    await expect(review).toContainText('John Doe');
    await expect(review).toContainText('john@example.com');
    await expect(review).toContainText('555-1234');
    await expect(review).toContainText('Acme Corp');
    await expect(review).toContainText('Developer');
    await expect(review).toContainText('pro');
    await expect(review).toContainText('API Access');
  });

  test('step 4: submit button visible instead of next', async ({ page }) => {
    await page.getByTestId('wizard-firstName').fill('John');
    await page.getByTestId('wizard-lastName').fill('Doe');
    await page.getByTestId('wizard-email').fill('john@example.com');
    await page.getByTestId('wizard-next').click();
    await page.getByTestId('wizard-company').fill('Acme Corp');
    await page.getByTestId('wizard-next').click();
    await page.getByTestId('wizard-next').click();

    await expect(page.getByTestId('wizard-submit')).toBeVisible();
    await expect(page.getByTestId('wizard-next')).not.toBeVisible();
  });

  test('step 4: must agree to terms before submitting', async ({ page }) => {
    await page.getByTestId('wizard-firstName').fill('John');
    await page.getByTestId('wizard-lastName').fill('Doe');
    await page.getByTestId('wizard-email').fill('john@example.com');
    await page.getByTestId('wizard-next').click();
    await page.getByTestId('wizard-company').fill('Acme Corp');
    await page.getByTestId('wizard-next').click();
    await page.getByTestId('wizard-next').click();

    // Try submit without agreeing
    await page.getByTestId('wizard-submit').click();
    await expect(page.getByTestId('wizard-agree-error')).toHaveText('You must agree to the terms');
  });

  test('successful wizard submission shows success screen', async ({ page }) => {
    await page.getByTestId('wizard-firstName').fill('John');
    await page.getByTestId('wizard-lastName').fill('Doe');
    await page.getByTestId('wizard-email').fill('john@example.com');
    await page.getByTestId('wizard-next').click();
    await page.getByTestId('wizard-company').fill('Acme Corp');
    await page.getByTestId('wizard-next').click();
    await page.getByTestId('wizard-next').click();

    await page.getByTestId('wizard-agree').check();
    await page.getByTestId('wizard-submit').click();

    await expect(page.getByTestId('wizard-success')).toBeVisible();
    await expect(page.getByTestId('wizard-success')).toContainText('Registration Complete');
    await expect(page.getByTestId('wizard-success')).toContainText('John');
    await expectToast(page, 'Registration submitted successfully!');
  });

  test('success screen restart button resets wizard', async ({ page }) => {
    await page.getByTestId('wizard-firstName').fill('John');
    await page.getByTestId('wizard-lastName').fill('Doe');
    await page.getByTestId('wizard-email').fill('john@example.com');
    await page.getByTestId('wizard-next').click();
    await page.getByTestId('wizard-company').fill('Acme Corp');
    await page.getByTestId('wizard-next').click();
    await page.getByTestId('wizard-next').click();
    await page.getByTestId('wizard-agree').check();
    await page.getByTestId('wizard-submit').click();

    await page.getByTestId('wizard-restart').click();
    await expect(page.getByTestId('wizard-content')).toContainText('Personal Information');
    await expect(page.getByTestId('wizard-firstName')).toHaveValue('');
  });

  test('back button navigates to previous step', async ({ page }) => {
    await page.getByTestId('wizard-firstName').fill('John');
    await page.getByTestId('wizard-lastName').fill('Doe');
    await page.getByTestId('wizard-email').fill('john@example.com');
    await page.getByTestId('wizard-next').click();
    await expect(page.getByTestId('wizard-content')).toContainText('Company Details');

    await page.getByTestId('wizard-prev').click();
    await expect(page.getByTestId('wizard-content')).toContainText('Personal Information');
    // Data should be preserved
    await expect(page.getByTestId('wizard-firstName')).toHaveValue('John');
  });

  test('phone is optional on step 1', async ({ page }) => {
    await page.getByTestId('wizard-firstName').fill('John');
    await page.getByTestId('wizard-lastName').fill('Doe');
    await page.getByTestId('wizard-email').fill('john@example.com');
    // Don't fill phone
    await page.getByTestId('wizard-next').click();
    // Should proceed without error
    await expect(page.getByTestId('wizard-content')).toContainText('Company Details');
  });

  test('error clears when field is filled', async ({ page }) => {
    await page.getByTestId('wizard-next').click();
    await expect(page.getByTestId('wizard-firstName-error')).toBeVisible();

    await page.getByTestId('wizard-firstName').fill('John');
    await expect(page.getByTestId('wizard-firstName-error')).not.toBeVisible();
  });
});
