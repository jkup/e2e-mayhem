import { test, expect } from '@playwright/test';
import { loginAndNavigate } from './helpers';

test.describe('Wizard Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, 'wizard');
  });

  test.describe('Step Indicator', () => {
    test('shows all 4 steps', async ({ page }) => {
      await expect(page.getByTestId('wizard-steps')).toBeVisible();
      await expect(page.getByTestId('wizard-step-0')).toBeVisible();
      await expect(page.getByTestId('wizard-step-1')).toBeVisible();
      await expect(page.getByTestId('wizard-step-2')).toBeVisible();
      await expect(page.getByTestId('wizard-step-3')).toBeVisible();
    });

    test('step 0 is active initially', async ({ page }) => {
      await expect(page.getByTestId('wizard-step-0')).toHaveClass(/ring-2/);
    });

    test('step labels are correct', async ({ page }) => {
      await expect(page.getByTestId('wizard-steps')).toContainText('Personal Info');
      await expect(page.getByTestId('wizard-steps')).toContainText('Company');
      await expect(page.getByTestId('wizard-steps')).toContainText('Plan');
      await expect(page.getByTestId('wizard-steps')).toContainText('Review');
    });

    test('completed steps show checkmark', async ({ page }) => {
      // Fill step 0 and go to step 1
      await page.getByTestId('wizard-firstName').fill('John');
      await page.getByTestId('wizard-lastName').fill('Doe');
      await page.getByTestId('wizard-email').fill('john@example.com');
      await page.getByTestId('wizard-next').click();
      // Step 0 should show checkmark
      await expect(page.getByTestId('wizard-step-0')).toContainText('✓');
    });
  });

  test.describe('Step 0 - Personal Info', () => {
    test('shows personal info fields', async ({ page }) => {
      await expect(page.getByTestId('wizard-content')).toContainText('Personal Information');
      await expect(page.getByTestId('wizard-firstName')).toBeVisible();
      await expect(page.getByTestId('wizard-lastName')).toBeVisible();
      await expect(page.getByTestId('wizard-email')).toBeVisible();
      await expect(page.getByTestId('wizard-phone')).toBeVisible();
    });

    test('Back button is disabled on step 0', async ({ page }) => {
      await expect(page.getByTestId('wizard-prev')).toBeDisabled();
    });

    test('Next without filling shows validation errors', async ({ page }) => {
      await page.getByTestId('wizard-next').click();
      await expect(page.getByTestId('wizard-firstName-error')).toHaveText('Required');
      await expect(page.getByTestId('wizard-lastName-error')).toHaveText('Required');
      await expect(page.getByTestId('wizard-email-error')).toHaveText('Required');
    });

    test('invalid email shows error', async ({ page }) => {
      await page.getByTestId('wizard-firstName').fill('John');
      await page.getByTestId('wizard-lastName').fill('Doe');
      await page.getByTestId('wizard-email').fill('not-email');
      await page.getByTestId('wizard-next').click();
      await expect(page.getByTestId('wizard-email-error')).toHaveText('Invalid email');
    });

    test('phone is optional', async ({ page }) => {
      await page.getByTestId('wizard-firstName').fill('John');
      await page.getByTestId('wizard-lastName').fill('Doe');
      await page.getByTestId('wizard-email').fill('john@example.com');
      await page.getByTestId('wizard-next').click();
      // Should proceed to step 1 without phone
      await expect(page.getByTestId('wizard-content')).toContainText('Company Details');
    });

    test('filling valid data and clicking Next advances to step 1', async ({ page }) => {
      await page.getByTestId('wizard-firstName').fill('John');
      await page.getByTestId('wizard-lastName').fill('Doe');
      await page.getByTestId('wizard-email').fill('john@example.com');
      await page.getByTestId('wizard-phone').fill('555-1234');
      await page.getByTestId('wizard-next').click();
      await expect(page.getByTestId('wizard-content')).toContainText('Company Details');
    });

    test('typing into error field clears the error', async ({ page }) => {
      await page.getByTestId('wizard-next').click();
      await expect(page.getByTestId('wizard-firstName-error')).toBeVisible();
      await page.getByTestId('wizard-firstName').fill('John');
      await expect(page.getByTestId('wizard-firstName-error')).not.toBeVisible();
    });
  });

  test.describe('Step 1 - Company', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByTestId('wizard-firstName').fill('John');
      await page.getByTestId('wizard-lastName').fill('Doe');
      await page.getByTestId('wizard-email').fill('john@example.com');
      await page.getByTestId('wizard-next').click();
    });

    test('shows company fields', async ({ page }) => {
      await expect(page.getByTestId('wizard-content')).toContainText('Company Details');
      await expect(page.getByTestId('wizard-company')).toBeVisible();
      await expect(page.getByTestId('wizard-jobTitle')).toBeVisible();
    });

    test('Back button goes to step 0', async ({ page }) => {
      await page.getByTestId('wizard-prev').click();
      await expect(page.getByTestId('wizard-content')).toContainText('Personal Information');
    });

    test('company name is required for step 1 validation', async ({ page }) => {
      await page.getByTestId('wizard-next').click();
      // Should show company required error
      await expect(page.getByTestId('wizard-company-error')).toHaveText('Required');
    });

    test('job title is optional', async ({ page }) => {
      await page.getByTestId('wizard-company').fill('Acme Corp');
      await page.getByTestId('wizard-next').click();
      await expect(page.getByTestId('wizard-content')).toContainText('Choose Your Plan');
    });

    test('going back preserves personal info data', async ({ page }) => {
      await page.getByTestId('wizard-prev').click();
      await expect(page.getByTestId('wizard-firstName')).toHaveValue('John');
      await expect(page.getByTestId('wizard-lastName')).toHaveValue('Doe');
      await expect(page.getByTestId('wizard-email')).toHaveValue('john@example.com');
    });
  });

  test.describe('Step 2 - Plan', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByTestId('wizard-firstName').fill('John');
      await page.getByTestId('wizard-lastName').fill('Doe');
      await page.getByTestId('wizard-email').fill('john@example.com');
      await page.getByTestId('wizard-next').click();
      await page.getByTestId('wizard-company').fill('Acme Corp');
      await page.getByTestId('wizard-next').click();
    });

    test('shows plan selection with 3 options', async ({ page }) => {
      await expect(page.getByTestId('wizard-content')).toContainText('Choose Your Plan');
      await expect(page.getByTestId('wizard-plan-starter')).toBeVisible();
      await expect(page.getByTestId('wizard-plan-pro')).toBeVisible();
      await expect(page.getByTestId('wizard-plan-enterprise')).toBeVisible();
    });

    test('plan buttons show prices', async ({ page }) => {
      await expect(page.getByTestId('wizard-plan-starter')).toContainText('$9');
      await expect(page.getByTestId('wizard-plan-pro')).toContainText('$29');
      await expect(page.getByTestId('wizard-plan-enterprise')).toContainText('$99');
    });

    test('starter plan is selected by default', async ({ page }) => {
      await expect(page.getByTestId('wizard-plan-starter')).toHaveClass(/border-blue-600/);
    });

    test('clicking a different plan selects it', async ({ page }) => {
      await page.getByTestId('wizard-plan-pro').click();
      await expect(page.getByTestId('wizard-plan-pro')).toHaveClass(/border-blue-600/);
      await expect(page.getByTestId('wizard-plan-starter')).not.toHaveClass(/border-blue-600/);
    });

    test('addon checkboxes are displayed', async ({ page }) => {
      await expect(page.getByTestId('wizard-addon-priority-support')).toBeVisible();
      await expect(page.getByTestId('wizard-addon-api-access')).toBeVisible();
      await expect(page.getByTestId('wizard-addon-custom-domain')).toBeVisible();
      await expect(page.getByTestId('wizard-addon-analytics-dashboard')).toBeVisible();
      await expect(page.getByTestId('wizard-addon-sso-integration')).toBeVisible();
    });

    test('toggling addon checkboxes', async ({ page }) => {
      const addon = page.getByTestId('wizard-addon-api-access');
      await addon.check();
      await expect(addon).toBeChecked();
      await addon.uncheck();
      await expect(addon).not.toBeChecked();
    });

    test('can select multiple addons', async ({ page }) => {
      await page.getByTestId('wizard-addon-api-access').check();
      await page.getByTestId('wizard-addon-sso-integration').check();
      await expect(page.getByTestId('wizard-addon-api-access')).toBeChecked();
      await expect(page.getByTestId('wizard-addon-sso-integration')).toBeChecked();
    });
  });

  test.describe('Step 3 - Review & Submit', () => {
    async function fillToReview(page: import('@playwright/test').Page) {
      await page.getByTestId('wizard-firstName').fill('John');
      await page.getByTestId('wizard-lastName').fill('Doe');
      await page.getByTestId('wizard-email').fill('john@example.com');
      await page.getByTestId('wizard-phone').fill('555-1234');
      await page.getByTestId('wizard-next').click();
      await page.getByTestId('wizard-company').fill('Acme Corp');
      await page.getByTestId('wizard-jobTitle').fill('Engineer');
      await page.getByTestId('wizard-next').click();
      await page.getByTestId('wizard-plan-pro').click();
      await page.getByTestId('wizard-addon-api-access').check();
      await page.getByTestId('wizard-next').click();
    }

    test('shows review content with all entered data', async ({ page }) => {
      await fillToReview(page);
      const review = page.getByTestId('wizard-review');
      await expect(review).toContainText('John');
      await expect(review).toContainText('Doe');
      await expect(review).toContainText('john@example.com');
      await expect(review).toContainText('555-1234');
      await expect(review).toContainText('Acme Corp');
      await expect(review).toContainText('Engineer');
      await expect(review).toContainText('pro');
      await expect(review).toContainText('API Access');
    });

    test('review shows name in "First Last" format', async ({ page }) => {
      await fillToReview(page);
      const review = page.getByTestId('wizard-review');
      // The Name row should display "John Doe"
      const nameRow = review.locator('div').filter({ hasText: 'Name' }).first();
      await expect(nameRow).toContainText('John Doe');
    });

    test('submit button replaces next button on review step', async ({ page }) => {
      await fillToReview(page);
      await expect(page.getByTestId('wizard-submit')).toBeVisible();
      await expect(page.getByTestId('wizard-next')).not.toBeVisible();
    });

    test('submit without agreeing to terms shows error', async ({ page }) => {
      await fillToReview(page);
      await page.getByTestId('wizard-submit').click();
      await expect(page.getByTestId('wizard-agree-error')).toHaveText('You must agree to the terms');
    });

    test('agree checkbox and submit shows success', async ({ page }) => {
      await fillToReview(page);
      await page.getByTestId('wizard-agree').check();
      await page.getByTestId('wizard-submit').click();
      await expect(page.getByTestId('wizard-success')).toBeVisible();
      await expect(page.getByTestId('wizard-success')).toContainText('Registration Complete!');
      await expect(page.getByTestId('wizard-success')).toContainText('John');
      await expect(page.getByTestId('wizard-success')).toContainText('pro');
    });

    test('success screen has restart button', async ({ page }) => {
      await fillToReview(page);
      await page.getByTestId('wizard-agree').check();
      await page.getByTestId('wizard-submit').click();
      await expect(page.getByTestId('wizard-restart')).toBeVisible();
    });

    test('restart button resets wizard to step 0', async ({ page }) => {
      await fillToReview(page);
      await page.getByTestId('wizard-agree').check();
      await page.getByTestId('wizard-submit').click();
      await page.getByTestId('wizard-restart').click();
      await expect(page.getByTestId('wizard-content')).toContainText('Personal Information');
      await expect(page.getByTestId('wizard-firstName')).toHaveValue('');
    });

    test('submission triggers success toast', async ({ page }) => {
      await fillToReview(page);
      await page.getByTestId('wizard-agree').check();
      await page.getByTestId('wizard-submit').click();
      await expect(page.getByRole('alert')).toContainText('Registration submitted successfully!');
    });
  });

  test.describe('Navigation', () => {
    test('can go back and forth between steps', async ({ page }) => {
      // Fill step 0
      await page.getByTestId('wizard-firstName').fill('John');
      await page.getByTestId('wizard-lastName').fill('Doe');
      await page.getByTestId('wizard-email').fill('john@example.com');
      await page.getByTestId('wizard-next').click();

      // On step 1
      await expect(page.getByTestId('wizard-content')).toContainText('Company Details');
      await page.getByTestId('wizard-prev').click();

      // Back on step 0
      await expect(page.getByTestId('wizard-content')).toContainText('Personal Information');
      await page.getByTestId('wizard-next').click();

      // Step 1 again
      await expect(page.getByTestId('wizard-content')).toContainText('Company Details');
    });
  });
});
