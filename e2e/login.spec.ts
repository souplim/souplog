import { expect, test, type Locator, type Page } from '@playwright/test';

// The login form never depends on post/menu data, so it's the one page that
// renders the same whether or not a real Supabase project is wired up —
// everything else needs seeded content, see README's e2e checklist. The header
// and footer do read the site title and menus, so screenshots mask them.

const MAX_TAB_STOPS = 20;

test('로그인 페이지가 렌더링된다', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible();
  await expect(page.getByLabel('이메일')).toBeVisible();
  await expect(page.getByLabel('비밀번호')).toBeVisible();
});

test('테마 토글이 data-theme 속성을 바꾼다', async ({ page }) => {
  await page.goto('/login');
  const toggle = page.getByRole('button', { name: /모드로 전환/ });
  await expect(toggle).toBeVisible();

  const before = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  await toggle.click();
  await expect.poll(() => page.evaluate(() => document.documentElement.getAttribute('data-theme'))).not.toBe(before);
});

test('탭 키로 테마 토글과 로그인 링크에 접근할 수 있다', async ({ page }) => {
  await page.goto('/login');
  const toggle = page.getByRole('button', { name: /모드로 전환/ });
  // Start from the site title (its text comes from settings) and walk forward —
  // how many menu links sit in between depends on the menus in the database.
  await page.getByRole('banner').getByRole('link').first().focus();
  for (let i = 0; i < MAX_TAB_STOPS && !(await toggle.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press('Tab');
  }
  await expect(toggle).toBeFocused();
});

// Baselines are only committed for the desktop chromium project — other
// engines (and the Pixel viewport) render fonts differently, so comparing them
// against chromium images would always fail.
const VISUAL_PROJECT = 'chromium';

function siteChrome(page: Page): Locator[] {
  return [page.getByRole('banner'), page.getByRole('contentinfo')];
}

test.describe('시각 회귀', () => {
  test.beforeEach(() => {
    test.skip(test.info().project.name !== VISUAL_PROJECT, `시각 회귀는 ${VISUAL_PROJECT} 에서만 비교한다`);
  });

  for (const width of [320, 768, 1024, 1440]) {
    test(`로그인 페이지 라이트 테마 @ ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto('/login');
      await expect(page).toHaveScreenshot(`login-light-${width}.png`, { fullPage: true, mask: siteChrome(page) });
    });

    test(`로그인 페이지 다크 테마 @ ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('/login');
      await expect(page).toHaveScreenshot(`login-dark-${width}.png`, { fullPage: true, mask: siteChrome(page) });
    });
  }
});
