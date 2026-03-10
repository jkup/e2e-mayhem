import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('WizardPage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await login(page);
    await page.getByTestId('nav-wizard').click();
    await page.getByTestId('wizard-steps').waitFor({ state: 'visible' });
  });

  test.describe('Step Indicator', () => {
    test('should show 4 step indicators', async ({ page }) => {
      await expect(page.getByTestId('wizard-step-0')).toBeVisible();
      await expect(page.getByTestId('wizard-step-1')).toBeVisible();
      await expect(page.getByTestId('wizard-step-2')).toBeVisible();
      await expect(page.getByTestId('wizard-step-3')).toBeVisible();
    });

    test('step 0 should be current on initial load', async ({ page }) => {
      const step0 = page.getByTestId('wizard-step-0');
      await expect(step0).toHaveClass(/bg-blue-100/);
      await expect(step0).toHaveClass(/ring-2/);
    });

    test('step labels should be displayed', async ({ page }) => {
      const steps = page.getByTestId('wizard-steps');
      await expect(steps).toContainText('Personal Info');
      await expect(steps).toContainText('Company');
      await expect(steps).toContainText('Plan');
      await expect(steps).toContainText('Review');
    });

    test('current step label should have text-gray-900 font-medium', async ({ page }) => {
      // Current step (0) label should have the active styling
      const step0 = page.getByTestId('wizard-step-0');
      // The label is next to the step circle
      const label = step0.locator('..').locator('text=Personal Info');
      await expect(label).toHaveClass(/text-gray-900/);
      await expect(label).toHaveClass(/font-medium/);
    });

    test('completed steps should show checkmark (intended behavior)', async ({ page }) => {
      // Fill step 0 and advance
      await page.getByTestId('wizard-firstName').fill('John');
      await page.getByTestId('wizard-lastName').fill('Doe');
      await page.getByTestId('wizard-email').fill('john@example.com');
      await page.getByTestId('wizard-next').click();

      // INTENDED: At step 1, step 0 should be completed and show checkmark
      const step0 = page.getByTestId('wizard-step-0');
      await expect(step0).toHaveClass(/bg-blue-600/);
      await expect(step0).toContainText('✓');
    });
  });

  test.describe('Step 0: Personal Info', () => {
    test('should show Personal Information heading', async ({ page }) => {
      await expect(page.getByTestId('wizard-content')).toContainText('Personal Information');
    });

    test('should have all required fields', async ({ page }) => {
      await expect(page.getByTestId('wizard-firstName')).toBeVisible();
      await expect(page.getByTestId('wizard-lastName')).toBeVisible();
      await expect(page.getByTestId('wizard-email')).toBeVisible();
      await expect(page.getByTestId('wizard-phone')).toBeVisible();
    });

    test('phone field should be optional (label contains "optional")', async ({ page }) => {
      const content = page.getByTestId('wizard-content');
      await expect(content).toContainText('Phone (optional)');
    });

    test('should show required error for empty first name', async ({ page }) => {
      await page.getByTestId('wizard-next').click();
      await expect(page.getByTestId('wizard-firstName-error')).toHaveText('Required');
    });

    test('should show required error for empty last name', async ({ page }) => {
      await page.getByTestId('wizard-next').click();
      await expect(page.getByTestId('wizard-lastName-error')).toHaveText('Required');
    });

    test('should show required error for empty email', async ({ page }) => {
      await page.getByTestId('wizard-next').click();
      await expect(page.getByTestId('wizard-email-error')).toHaveText('Required');
    });

    test('should show invalid email error for bad email', async ({ page }) => {
      await page.getByTestId('wizard-firstName').fill('John');
      await page.getByTestId('wizard-lastName').fill('Doe');
      await page.getByTestId('wizard-email').fill('notvalid');
      await page.getByTestId('wizard-next').click();

      await expect(page.getByTestId('wizard-email-error')).toHaveText('Invalid email');
    });

    test('should not validate phone field', async ({ page }) => {
      await page.getByTestId('wizard-firstName').fill('John');
      await page.getByTestId('wizard-lastName').fill('Doe');
      await page.getByTestId('wizard-email').fill('john@example.com');
      // Leave phone empty
      await page.getByTestId('wizard-next').click();

      // Should advance to step 1
      await expect(page.getByTestId('wizard-content')).toContainText('Company Details');
    });

    test('errors should clear when field is changed', async ({ page }) => {
      // Trigger errors
      await page.getByTestId('wizard-next').click();
      await expect(page.getByTestId('wizard-firstName-error')).toBeVisible();

      // Type in first name - error should clear
      await page.getByTestId('wizard-firstName').fill('John');
      await expect(page.getByTestId('wizard-firstName-error')).not.toBeVisible();
    });

    test('should advance to step 1 with valid data', async ({ page }) => {
      await page.getByTestId('wizard-firstName').fill('John');
      await page.getByTestId('wizard-lastName').fill('Doe');
      await page.getByTestId('wizard-email').fill('john@example.com');
      await page.getByTestId('wizard-next').click();

      await expect(page.getByTestId('wizard-content')).toContainText('Company Details');
    });
  });

  test.describe('Step 1: Company', () => {
    test.beforeEach(async ({ page }) => {
      // Fill step 0 and advance
      await page.getByTestId('wizard-firstName').fill('John');
      await page.getByTestId('wizard-lastName').fill('Doe');
      await page.getByTestId('wizard-email').fill('john@example.com');
      await page.getByTestId('wizard-next').click();
    });

    test('should show Company Details heading', async ({ page }) => {
      await expect(page.getByTestId('wizard-content')).toContainText('Company Details');
    });

    test('should have company and job title fields', async ({ page }) => {
      await expect(page.getByTestId('wizard-company')).toBeVisible();
      await expect(page.getByTestId('wizard-jobTitle')).toBeVisible();
    });

    test('job title should be optional', async ({ page }) => {
      await expect(page.getByTestId('wizard-content')).toContainText('Job Title (optional)');
    });

    test('company name should be required (intended behavior)', async ({ page }) => {
      // INTENDED: Company name should be validated as required
      // Leave company empty and click next
      await page.getByTestId('wizard-next').click();

      // INTENDED: Should show validation error for company
      // The bug is that step === 99 check means this never validates
      await expect(page.getByTestId('wizard-company-error')).toBeVisible();
    });

    test('should advance to step 2 with valid data', async ({ page }) => {
      await page.getByTestId('wizard-company').fill('Acme Inc');
      await page.getByTestId('wizard-next').click();

      await expect(page.getByTestId('wizard-content')).toContainText('Choose Your Plan');
    });
  });

  test.describe('Step 2: Plan', () => {
    test.beforeEach(async ({ page }) => {
      // Fill steps 0 and 1, advance to step 2
      await page.getByTestId('wizard-firstName').fill('John');
      await page.getByTestId('wizard-lastName').fill('Doe');
      await page.getByTestId('wizard-email').fill('john@example.com');
      await page.getByTestId('wizard-next').click();
      await page.getByTestId('wizard-company').fill('Acme Inc');
      await page.getByTestId('wizard-next').click();
    });

    test('should show Choose Your Plan heading', async ({ page }) => {
      await expect(page.getByTestId('wizard-content')).toContainText('Choose Your Plan');
    });

    test('should show three plan options', async ({ page }) => {
      await expect(page.getByTestId('wizard-plan-starter')).toBeVisible();
      await expect(page.getByTestId('wizard-plan-pro')).toBeVisible();
      await expect(page.getByTestId('wizard-plan-enterprise')).toBeVisible();
    });

    test('starter plan should be selected by default', async ({ page }) => {
      await expect(page.getByTestId('wizard-plan-starter')).toHaveClass(/border-blue-600/);
      await expect(page.getByTestId('wizard-plan-starter')).toHaveClass(/bg-blue-50/);
    });

    test('unselected plans should have border-gray-200', async ({ page }) => {
      await expect(page.getByTestId('wizard-plan-pro')).toHaveClass(/border-gray-200/);
      await expect(page.getByTestId('wizard-plan-enterprise')).toHaveClass(/border-gray-200/);
    });

    test('should show plan prices', async ({ page }) => {
      await expect(page.getByTestId('wizard-plan-starter')).toContainText('$9/mo');
      await expect(page.getByTestId('wizard-plan-pro')).toContainText('$29/mo');
      await expect(page.getByTestId('wizard-plan-enterprise')).toContainText('$99/mo');
    });

    test('clicking a plan should select it', async ({ page }) => {
      await page.getByTestId('wizard-plan-pro').click();
      await expect(page.getByTestId('wizard-plan-pro')).toHaveClass(/border-blue-600/);
      await expect(page.getByTestId('wizard-plan-starter')).toHaveClass(/border-gray-200/);
    });

    test('should show 5 add-on checkboxes', async ({ page }) => {
      await expect(page.getByTestId('wizard-addon-priority-support')).toBeVisible();
      await expect(page.getByTestId('wizard-addon-api-access')).toBeVisible();
      await expect(page.getByTestId('wizard-addon-custom-domain')).toBeVisible();
      await expect(page.getByTestId('wizard-addon-analytics-dashboard')).toBeVisible();
      await expect(page.getByTestId('wizard-addon-sso-integration')).toBeVisible();
    });

    test('add-ons should be unchecked by default', async ({ page }) => {
      await expect(page.getByTestId('wizard-addon-priority-support')).not.toBeChecked();
      await expect(page.getByTestId('wizard-addon-api-access')).not.toBeChecked();
      await expect(page.getByTestId('wizard-addon-custom-domain')).not.toBeChecked();
      await expect(page.getByTestId('wizard-addon-analytics-dashboard')).not.toBeChecked();
      await expect(page.getByTestId('wizard-addon-sso-integration')).not.toBeChecked();
    });

    test('should be able to check and uncheck add-ons', async ({ page }) => {
      await page.getByTestId('wizard-addon-api-access').check();
      await expect(page.getByTestId('wizard-addon-api-access')).toBeChecked();

      await page.getByTestId('wizard-addon-api-access').uncheck();
      await expect(page.getByTestId('wizard-addon-api-access')).not.toBeChecked();
    });

    test('should always advance to step 3 (no validation on this step)', async ({ page }) => {
      await page.getByTestId('wizard-next').click();
      await expect(page.getByTestId('wizard-content')).toContainText('Review & Confirm');
    });
  });

  test.describe('Step 3: Review & Confirm', () => {
    test.beforeEach(async ({ page }) => {
      // Fill all steps and advance to review
      await page.getByTestId('wizard-firstName').fill('John');
      await page.getByTestId('wizard-lastName').fill('Doe');
      await page.getByTestId('wizard-email').fill('john@example.com');
      await page.getByTestId('wizard-phone').fill('555-1234');
      await page.getByTestId('wizard-next').click();
      await page.getByTestId('wizard-company').fill('Acme Inc');
      await page.getByTestId('wizard-jobTitle').fill('Developer');
      await page.getByTestId('wizard-next').click();
      await page.getByTestId('wizard-plan-pro').click();
      await page.getByTestId('wizard-addon-api-access').check();
      await page.getByTestId('wizard-next').click();
    });

    test('should show Review & Confirm heading', async ({ page }) => {
      await expect(page.getByTestId('wizard-content')).toContainText('Review & Confirm');
    });

    test('should display review summary with correct data', async ({ page }) => {
      const review = page.getByTestId('wizard-review');
      await expect(review).toBeVisible();
      await expect(review).toContainText('john@example.com');
      await expect(review).toContainText('555-1234');
      await expect(review).toContainText('Acme Inc');
      await expect(review).toContainText('Developer');
      await expect(review).toContainText('Pro'); // capitalized plan name
      await expect(review).toContainText('API Access');
    });

    test('should show name as firstName lastName (intended behavior)', async ({ page }) => {
      const review = page.getByTestId('wizard-review');
      // INTENDED: Name should display as "John Doe" (firstName lastName)
      // BUG: Actually displays as "Doe John" (lastName firstName)
      await expect(review).toContainText('John Doe');
    });

    test('should show agree to terms checkbox', async ({ page }) => {
      await expect(page.getByTestId('wizard-agree')).toBeVisible();
      await expect(page.getByTestId('wizard-content')).toContainText('I agree to the Terms of Service and Privacy Policy');
    });

    test('should show submit button instead of next', async ({ page }) => {
      await expect(page.getByTestId('wizard-submit')).toBeVisible();
      await expect(page.getByTestId('wizard-next')).not.toBeVisible();
    });

    test('submit without agreeing should show error', async ({ page }) => {
      await page.getByTestId('wizard-submit').click();
      await expect(page.getByTestId('wizard-agree-error')).toHaveText('You must agree to the terms');
    });

    test('submit with agreement should show success screen', async ({ page }) => {
      await page.getByTestId('wizard-agree').check();
      await page.getByTestId('wizard-submit').click();

      await expect(page.getByTestId('wizard-success')).toBeVisible();
    });

    test('should not show phone if not entered', async ({ page }) => {
      // Go back, clear phone, come back
      await page.getByTestId('wizard-prev').click(); // step 2
      await page.getByTestId('wizard-prev').click(); // step 1
      await page.getByTestId('wizard-prev').click(); // step 0

      await page.getByTestId('wizard-phone').fill('');
      await page.getByTestId('wizard-next').click(); // step 1
      await page.getByTestId('wizard-next').click(); // step 2
      await page.getByTestId('wizard-next').click(); // step 3

      const review = page.getByTestId('wizard-review');
      // Phone should not be shown when empty
      // We can't check for absence of "Phone" label since it may not be labeled
      // but at minimum it should not show the empty phone value
      await expect(review).not.toContainText('555-1234');
    });
  });

  test.describe('Navigation', () => {
    test('Back button should be disabled on step 0', async ({ page }) => {
      const prevBtn = page.getByTestId('wizard-prev');
      await expect(prevBtn).toBeVisible();
      await expect(prevBtn).toBeDisabled();
    });

    test('Next button should be visible on steps 0-2', async ({ page }) => {
      await expect(page.getByTestId('wizard-next')).toBeVisible();

      // Fill and advance
      await page.getByTestId('wizard-firstName').fill('John');
      await page.getByTestId('wizard-lastName').fill('Doe');
      await page.getByTestId('wizard-email').fill('john@example.com');
      await page.getByTestId('wizard-next').click();

      await expect(page.getByTestId('wizard-next')).toBeVisible();

      await page.getByTestId('wizard-company').fill('Acme');
      await page.getByTestId('wizard-next').click();

      await expect(page.getByTestId('wizard-next')).toBeVisible();
    });

    test('Back should go back without validation', async ({ page }) => {
      // Fill step 0 and advance
      await page.getByTestId('wizard-firstName').fill('John');
      await page.getByTestId('wizard-lastName').fill('Doe');
      await page.getByTestId('wizard-email').fill('john@example.com');
      await page.getByTestId('wizard-next').click();

      // Go back
      await page.getByTestId('wizard-prev').click();
      await expect(page.getByTestId('wizard-content')).toContainText('Personal Information');

      // Data should still be there
      await expect(page.getByTestId('wizard-firstName')).toHaveValue('John');
    });
  });

  test.describe('Success Screen', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByTestId('wizard-firstName').fill('John');
      await page.getByTestId('wizard-lastName').fill('Doe');
      await page.getByTestId('wizard-email').fill('john@example.com');
      await page.getByTestId('wizard-next').click();
      await page.getByTestId('wizard-company').fill('Acme Inc');
      await page.getByTestId('wizard-next').click();
      await page.getByTestId('wizard-plan-pro').click();
      await page.getByTestId('wizard-next').click();
      await page.getByTestId('wizard-agree').check();
      await page.getByTestId('wizard-submit').click();
    });

    test('should show success screen', async ({ page }) => {
      const success = page.getByTestId('wizard-success');
      await expect(success).toBeVisible();
      await expect(success).toContainText('Registration Complete!');
    });

    test('should show welcome message with first name and plan', async ({ page }) => {
      const success = page.getByTestId('wizard-success');
      await expect(success).toContainText('Welcome, John');
      await expect(success).toContainText('pro plan is being set up');
    });

    test('should show toast on successful submit', async ({ page }) => {
      await expect(page.getByTestId('toast-success')).toBeVisible();
      await expect(page.getByTestId('toast-success')).toContainText('Registration submitted successfully!');
    });

    test('Start Over should reset wizard to step 0', async ({ page }) => {
      await page.getByTestId('wizard-restart').click();

      // Should be back at step 0
      await expect(page.getByTestId('wizard-content')).toContainText('Personal Information');

      // Fields should be cleared
      await expect(page.getByTestId('wizard-firstName')).toHaveValue('');
      await expect(page.getByTestId('wizard-lastName')).toHaveValue('');
      await expect(page.getByTestId('wizard-email')).toHaveValue('');
    });

    test('should show checkmark character on success screen', async ({ page }) => {
      const success = page.getByTestId('wizard-success');
      await expect(success).toContainText('✓');
    });
  });
});
