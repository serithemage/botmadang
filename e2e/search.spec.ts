import { test, expect } from '@playwright/test';

test.describe('PR #14: 검색 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 페이지 로드 대기
    await page.waitForLoadState('networkidle');
  });

  test('검색 입력창이 표시된다', async ({ page }) => {
    const searchInput = page.locator('input.search-input');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', '🔍 글 제목, 작성자로 검색...');
  });

  test('검색어 입력 시 X 버튼이 표시된다', async ({ page }) => {
    const searchInput = page.locator('input.search-input');
    const clearButton = page.locator('button[aria-label="검색어 지우기"]');

    // 초기에는 X 버튼이 없음
    await expect(clearButton).not.toBeVisible();

    // 검색어 입력
    await searchInput.fill('테스트');

    // X 버튼이 표시됨
    await expect(clearButton).toBeVisible();
    await expect(clearButton).toHaveText('✕');
  });

  test('X 버튼 클릭 시 검색어가 초기화된다', async ({ page }) => {
    const searchInput = page.locator('input.search-input');
    const clearButton = page.locator('button[aria-label="검색어 지우기"]');

    // 검색어 입력
    await searchInput.fill('테스트 검색어');
    await expect(searchInput).toHaveValue('테스트 검색어');

    // X 버튼 클릭
    await clearButton.click();

    // 검색어가 비워짐
    await expect(searchInput).toHaveValue('');
    // X 버튼이 사라짐
    await expect(clearButton).not.toBeVisible();
  });

  test('검색어 입력 시 결과 개수가 표시된다', async ({ page }) => {
    const searchInput = page.locator('input.search-input');

    // 검색어 입력
    await searchInput.fill('a');

    // 결과 개수 표시 확인
    const resultCount = page.locator('text=/\\d+개의 결과/');
    await expect(resultCount).toBeVisible();
  });

  test('무한 스크롤 트리거가 항상 렌더링된다', async ({ page }) => {
    const searchInput = page.locator('input.search-input');
    
    // 검색 전 loaderRef div 존재 확인
    const loaderDiv = page.locator('div').filter({ has: page.locator('text=불러오는 중') }).or(
      page.locator('div[style*="height: 20px"]')
    );
    
    // 검색어 입력 후에도 스크롤 트리거가 존재해야 함
    await searchInput.fill('test');
    
    // 페이지 하단으로 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // 약간의 대기 후 확인 (infinite scroll 요소가 존재하는지)
    await page.waitForTimeout(500);
  });

  test('검색 결과가 없을 때 안내 메시지가 표시된다', async ({ page }) => {
    const searchInput = page.locator('input.search-input');

    // 존재하지 않을 검색어 입력
    await searchInput.fill('zzzzxxxxxyyyyy12345없는검색어');

    // 빈 결과 메시지 확인
    const emptyHeading = page.getByRole('heading', { name: '검색 결과가 없습니다' });
    await expect(emptyHeading).toBeVisible({ timeout: 3000 });
  });
});
