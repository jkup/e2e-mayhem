/**
 * Exploration script that uses Playwright to introspect the running app.
 * Outputs accessibility trees, interactive elements, and data-testid attributes
 * for each route so Claude can understand the app and write tests.
 *
 * Usage: npm run explore
 */
import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, '..', 'exploration-output');

async function login(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByTestId('auth-form').waitFor({ state: 'visible' });
  await page.getByTestId('email-input').fill('test@example.com');
  await page.getByTestId('password-input').fill('password123');
  await page.getByTestId('submit-btn').click();
  await page.getByTestId('sidebar').waitFor({ state: 'visible', timeout: 10000 });
}

async function getTestIds(page: import('@playwright/test').Page): Promise<string[]> {
  return page.evaluate(() => {
    const elements = document.querySelectorAll('[data-testid]');
    return Array.from(elements).map(el => {
      const tag = el.tagName.toLowerCase();
      const testId = el.getAttribute('data-testid')!;
      const type = el.getAttribute('type') || '';
      const role = el.getAttribute('role') || '';
      const ariaLabel = el.getAttribute('aria-label') || '';
      const text = (el as HTMLElement).innerText?.slice(0, 80).replace(/\n/g, ' ') || '';
      return [testId, tag, type, role, ariaLabel, text].filter(Boolean).join(' | ');
    });
  });
}

async function getInteractiveElements(page: import('@playwright/test').Page): Promise<string[]> {
  return page.evaluate(() => {
    const selector = 'button, a, input, select, textarea, [role="button"], [role="tab"], [role="checkbox"], [role="menuitem"], [tabindex]';
    const elements = document.querySelectorAll(selector);
    return Array.from(elements).map(el => {
      const tag = el.tagName.toLowerCase();
      const testId = el.getAttribute('data-testid') || '';
      const type = el.getAttribute('type') || '';
      const role = el.getAttribute('role') || '';
      const ariaLabel = el.getAttribute('aria-label') || '';
      const name = el.getAttribute('name') || '';
      const href = el.getAttribute('href') || '';
      const text = (el as HTMLElement).innerText?.slice(0, 80).replace(/\n/g, ' ') || '';
      const disabled = (el as HTMLButtonElement).disabled ? 'DISABLED' : '';
      return [tag, testId && `testid="${testId}"`, type && `type="${type}"`, role && `role="${role}"`, ariaLabel && `aria="${ariaLabel}"`, name && `name="${name}"`, href && `href="${href}"`, disabled, text && `"${text}"`].filter(Boolean).join(' ');
    });
  });
}

async function explorePage(page: import('@playwright/test').Page, routeName: string, routePath: string) {
  await page.waitForTimeout(500);

  const [testIds, interactiveElements, ariaSnapshot] = await Promise.all([
    getTestIds(page),
    getInteractiveElements(page),
    page.locator('body').ariaSnapshot(),
  ]);

  await page.screenshot({
    path: path.join(OUTPUT_DIR, `${routeName}.png`),
    fullPage: true,
  });

  const output = {
    route: routeName,
    path: routePath,
    url: page.url(),
    timestamp: new Date().toISOString(),
    testIds,
    interactiveElements,
    ariaSnapshot,
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, `${routeName}.json`),
    JSON.stringify(output, null, 2)
  );
}

// Each page gets its own test with fresh login to avoid Vite HMR state resets

test.beforeAll(() => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
});

test('explore login', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('auth-form').waitFor({ state: 'visible' });
  await explorePage(page, 'login', '/');
});

test('explore dashboard', async ({ page }) => {
  await login(page);
  // Already on dashboard after login
  await explorePage(page, 'dashboard', '/dashboard');
});

test('explore users', async ({ page }) => {
  await login(page);
  await page.getByTestId('nav-users').click();
  await page.getByTestId('users-table').waitFor({ state: 'visible' });
  await explorePage(page, 'users', '/users');
});

test('explore wizard', async ({ page }) => {
  await login(page);
  await page.getByTestId('nav-wizard').click();
  await page.getByTestId('wizard-steps').waitFor({ state: 'visible' });
  await explorePage(page, 'wizard', '/wizard');
});

test('explore kanban', async ({ page }) => {
  await login(page);
  await page.getByTestId('nav-kanban').click();
  await page.getByTestId('kanban-board').waitFor({ state: 'visible' });
  await explorePage(page, 'kanban', '/kanban');
});

test('generate summary', async () => {
  const ROUTES = ['login', 'dashboard', 'users', 'wizard', 'kanban'];
  const summaryParts: string[] = [];
  summaryParts.push('# App Exploration Summary\n');
  summaryParts.push(`Generated: ${new Date().toISOString()}\n`);

  for (const routeName of ROUTES) {
    const filePath = path.join(OUTPUT_DIR, `${routeName}.json`);
    if (!fs.existsSync(filePath)) continue;

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    summaryParts.push(`\n## ${data.route} (${data.path})\n`);
    summaryParts.push(`### data-testid attributes (${data.testIds.length}):\n`);
    for (const id of data.testIds) {
      summaryParts.push(`- ${id}`);
    }
    summaryParts.push(`\n### Interactive elements (${data.interactiveElements.length}):\n`);
    for (const el of data.interactiveElements) {
      summaryParts.push(`- ${el}`);
    }
    summaryParts.push(`\n### Accessibility tree:\n\`\`\`\n${data.ariaSnapshot}\n\`\`\`\n`);
  }

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'SUMMARY.md'),
    summaryParts.join('\n')
  );
});
