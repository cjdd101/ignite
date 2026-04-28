# E2E 用户旅程测试实现计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 使用 Playwright 编写完整的 E2E 用户旅程测试，覆盖所有核心功能模块

**Architecture:** Playwright E2E 测试，使用 Page Object Model 模式组织代码，每个用户旅程独立为单个测试文件

**Tech Stack:** Playwright, TypeScript

---

## Chunk 1: 环境搭建

### Task 1.1: 创建 Playwright 配置文件

**Files:**
- Create: `e2e/playwright.config.ts`

- [ ] **Step 1: 创建配置文件**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/journeys',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
```

- [ ] **Step 2: 提交**

```bash
git add e2e/playwright.config.ts
git commit -m "feat(e2e): add Playwright configuration"
```

---

### Task 1.2: 创建辅助函数

**Files:**
- Create: `e2e/utils/helpers.ts`

- [ ] **Step 1: 创建辅助函数**

```typescript
import { Page } from '@playwright/test';

/**
 * 清除 IndexedDB 中的所有数据
 */
export async function clearAllData(page: Page): Promise<void> {
  await page.evaluate(() => {
    const databases = indexedDB.databases();
    databases.then((dbs) => {
      dbs.forEach((db) => {
        if (db.name) {
          indexedDB.deleteDatabase(db.name);
        }
      });
    });
  });
  await page.reload();
}

/**
 * 等待元素可见
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout = 10000
): Promise<void> {
  await page.waitForSelector(selector, { state: 'visible', timeout });
}

/**
 * 创建测试火种
 */
export async function createTestSpark(
  page: Page,
  content: string
): Promise<void> {
  await page.goto('/#/hearth');
  await page.locator('textarea').fill(content);
  await page.locator('button:has-text("投入火盆")').click();
  await page.waitForTimeout(500);
}
```

- [ ] **Step 2: 提交**

```bash
git add e2e/utils/helpers.ts
git commit -m "feat(e2e): add test helper utilities"
```

---

## Chunk 2: Page Objects

### Task 2.1: HearthPage Page Object

**Files:**
- Create: `e2e/page-objects/HearthPage.ts`

- [ ] **Step 1: 创建 HearthPage Page Object**

```typescript
import { Page, Locator } from '@playwright/test';

export class HearthPage {
  readonly page: Page;
  readonly textarea: Locator;
  readonly submitButton: Locator;
  readonly sparkList: Locator;
  readonly swapButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.textarea = page.locator('textarea');
    this.submitButton = page.locator('button:has-text("投入火盆")');
    this.sparkList = page.locator('main');
    this.swapButton = page.locator('button:has-text("换一批")');
  }

  async goto(): Promise<void> {
    await this.page.goto('/#/hearth');
    await this.page.waitForLoadState('networkidle');
  }

  async createSpark(content: string): Promise<void> {
    await this.textarea.fill(content);
    await this.submitButton.click();
    await this.page.waitForTimeout(1000);
  }

  async getSparkCount(): Promise<number> {
    const text = await this.page.locator('text=/已积蓄.*粒火种/').textContent();
    const match = text?.match(/已积蓄 (\d+) 粒火种/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async clickFirstSpark(): Promise<void> {
    const firstSpark = this.page.locator('main > div').first();
    await firstSpark.click();
    await this.page.waitForTimeout(1000);
  }

  async getFirstSparkContent(): Promise<string | null> {
    return this.page.locator('main p:text-matches("^[^🌱]')).first().textContent();
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add e2e/page-objects/HearthPage.ts
git commit -m "feat(e2e): add HearthPage Page Object"
```

---

### Task 2.2: PrairiePage Page Object

**Files:**
- Create: `e2e/page-objects/PrairiePage.ts`

- [ ] **Step 1: 创建 PrairiePage Page Object**

```typescript
import { Page, Locator } from '@playwright/test';

export class PrairiePage {
  readonly page: Page;
  readonly wildFlameTab: Locator;
  readonly myPrairieTab: Locator;
  readonly createButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.wildFlameTab = this.page.locator('button:has-text("野火")');
    this.myPrairieTab = this.page.locator('button:has-text("我的草原")');
    this.createButton = this.page.locator('button:has-text("创建新烈焰")');
  }

  async goto(): Promise<void> {
    await this.page.goto('/#/prairie');
    await this.page.waitForLoadState('networkidle');
  }

  async getWildFlameCount(): Promise<number> {
    const text = await this.wildFlameTab.textContent();
    const match = text?.match(/野火 \((\d+)\)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async clickFirstWildFlame(): Promise<void> {
    const firstFlame = this.page.locator('text=阅读').first();
    await firstFlame.click();
    await this.page.waitForTimeout(1000);
  }

  async switchToMyPrairie(): Promise<void> {
    await this.myPrairieTab.click();
    await this.page.waitForTimeout(500);
  }
}
```

- [ ] **Step 3: 提交**

```bash
git add e2e/page-objects/PrairiePage.ts
git commit -m "feat(e2e): add PrairiePage Page Object"
```

---

### Task 2.3: FlameDetailPage Page Object

**Files:**
- Create: `e2e/page-objects/FlameDetailPage.ts`

- [ ] **Step 1: 创建 FlameDetailPage Page Object**

```typescript
import { Page, Locator } from '@playwright/test';

export class FlameDetailPage {
  readonly page: Page;
  readonly completeButton: Locator;
  readonly jumpButton: Locator;
  readonly title: Locator;
  readonly status: Locator;

  constructor(page: Page) {
    this.page = page;
    this.completeButton = this.page.locator('button:has-text("完成燃烧")');
    this.jumpButton = this.page.locator('button:has-text("跳转平台")');
    this.title = this.page.locator('h2');
    this.status = this.page.locator('span:text-matches("燃烧中|已燃尽")');
  }

  async getTitle(): Promise<string> {
    return this.title.textContent() || '';
  }

  async getStatus(): Promise<string> {
    return this.status.textContent() || '';
  }

  async clickComplete(): Promise<void> {
    await this.completeButton.click();
    await this.page.waitForTimeout(1000);
  }

  async clickJump(): Promise<void> {
    await this.jumpButton.click();
    await this.page.waitForTimeout(500);
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add e2e/page-objects/FlameDetailPage.ts
git commit -m "feat(e2e): add FlameDetailPage Page Object"
```

---

### Task 2.4: CompleteBurningPage Page Object

**Files:**
- Create: `e2e/page-objects/CompleteBurningPage.ts`

- [ ] **Step 1: 创建 CompleteBurningPage Page Object**

```typescript
import { Page, Locator } from '@playwright/test';

export class CompleteBurningPage {
  readonly page: Page;
  readonly textarea: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.textarea = this.page.locator('textarea');
    this.saveButton = this.page.locator('button:has-text("保存并取火")');
  }

  async fillReflection(content: string): Promise<void> {
    await this.textarea.fill(content);
  }

  async clickSave(): Promise<void> {
    await this.saveButton.click();
    await this.page.waitForTimeout(2000);
  }

  async skipReflection(): Promise<void> {
    await this.saveButton.click();
    await this.page.waitForTimeout(2000);
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add e2e/page-objects/CompleteBurningPage.ts
git commit -m "feat(e2e): add CompleteBurningPage Page Object"
```

---

### Task 2.5: RekindlePage Page Object

**Files:**
- Create: `e2e/page-objects/RekindlePage.ts`

- [ ] **Step 1: 创建 RekindlePage Page Object**

```typescript
import { Page, Locator } from '@playwright/test';

export class RekindlePage {
  readonly page: Page;
  readonly rekindleButton: Locator;
  readonly rekindleCount: Locator;
  readonly sparks: Locator;
  readonly saveButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.rekindleButton = this.page.locator('button:has-text("重新点燃")');
    this.rekindleCount = this.page.locator('text=/已取火 \\d+ \\/ 10 次/');
    this.sparks = this.page.locator('button:has-text("保留")');
    this.saveButton = this.page.locator('button:has-text("保存火种")');
    this.backButton = this.page.locator('button:has-text("重新取火")');
  }

  async clickRekindle(): Promise<void> {
    await this.rekindleButton.click();
    // 等待 AI 响应
    await this.page.waitForTimeout(5000);
  }

  async retainFirstSpark(): Promise<void> {
    const retainButtons = this.page.locator('button:has-text("保留")');
    await retainButtons.first().click();
    await this.page.waitForTimeout(300);
  }

  async discardFirstSpark(): Promise<void> {
    const discardButtons = this.page.locator('button:has-text("丢弃")');
    await discardButtons.first().click();
    await this.page.waitForTimeout(300);
  }

  async clickSave(): Promise<void> {
    await this.saveButton.click();
    await this.page.waitForTimeout(2000);
  }

  async getRekindleCount(): Promise<number> {
    const text = await this.rekindleCount.textContent();
    const match = text?.match(/已取火 (\d+) \/ 10 次/);
    return match ? parseInt(match[1], 10) : 0;
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add e2e/page-objects/RekindlePage.ts
git commit -m "feat(e2e): add RekindlePage Page Object"
```

---

### Task 2.6: ExplorePage Page Object

**Files:**
- Create: `e2e/page-objects/ExplorePage.ts`

- [ ] **Step 1: 创建 ExplorePage Page Object**

```typescript
import { Page, Locator } from '@playwright/test';

export class ExplorePage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly recommendations: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = this.page.locator('input[placeholder*="探索"]');
    this.searchButton = this.page.locator('button:has-text("探索")');
    this.recommendations = this.page.locator('text=推荐探索');
  }

  async goto(): Promise<void> {
    await this.page.goto('/#/explore');
    await this.page.waitForLoadState('networkidle');
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchButton.click();
    // 等待 AI 响应
    await this.page.waitForTimeout(5000);
  }

  async addFirstToHearth(): Promise<void> {
    const addButton = this.page.locator('button:has-text("加入火盆")').first();
    await addButton.click();
    await this.page.waitForTimeout(2000);
  }

  async kindleFirst(): Promise<void> {
    const kindleButton = this.page.locator('button:has-text("点燃")').first();
    await kindleButton.click();
    await this.page.waitForTimeout(2000);
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add e2e/page-objects/ExplorePage.ts
git commit -m "feat(e2e): add ExplorePage Page Object"
```

---

### Task 2.7: OrganizePage Page Object

**Files:**
- Create: `e2e/page-objects/OrganizePage.ts`

- [ ] **Step 1: 创建 OrganizePage Page Object**

```typescript
import { Page, Locator } from '@playwright/test';

export class OrganizePage {
  readonly page: Page;
  readonly analyzeButton: Locator;
  readonly wildFlameCount: Locator;

  constructor(page: Page) {
    this.page = page;
    this.analyzeButton = this.page.locator('button:has-text("开始 AI 整理")');
    this.wildFlameCount = this.page.locator('text=/\\d+ 朵野火待整理/');
  }

  async goto(): Promise<void> {
    await this.page.goto('/#/organize');
    await this.page.waitForLoadState('networkidle');
  }

  async clickAnalyze(): Promise<void> {
    await this.analyzeButton.click();
    // 等待 AI 响应
    await this.page.waitForTimeout(5000);
  }

  async getWildFlameCount(): Promise<number> {
    const text = await this.wildFlameCount.textContent();
    const match = text?.match(/(\d+) 朵野火待整理/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async confirmFirstSuggestion(): Promise<void> {
    const firstSuggestion = this.page.locator('button:has-text("归入草原"), button:has-text("创建新草原")').first();
    await firstSuggestion.click();
    await this.page.waitForTimeout(1000);

    const confirmButton = this.page.locator('button:has-text("确认归入")');
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
      await this.page.waitForTimeout(1000);
    }
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add e2e/page-objects/OrganizePage.ts
git commit -m "feat(e2e): add OrganizePage Page Object"
```

---

### Task 2.8: KindleWizardPage Object

**Files:**
- Create: `e2e/page-objects/KindleWizardPage.ts`

- [ ] **Step 1: 创建 KindleWizardPage Page Object**

```typescript
import { Page, Locator } from '@playwright/test';

export class KindleWizardPage {
  readonly page: Page;
  readonly getPerspectivesButton: Locator;
  readonly nextButton: Locator;
  readonly skipButton: Locator;
  readonly cancelButton: Locator;
  readonly confirmButton: Locator;
  readonly perspectiveCards: Locator;
  readonly flameTitleInputs: Locator;
  readonly searchPhraseInputs: Locator;

  constructor(page: Page) {
    this.page = page;
    this.getPerspectivesButton = this.page.locator('button:has-text("获取探索视角")');
    this.nextButton = this.page.locator('button:has-text("下一步")');
    this.skipButton = this.page.locator('button:has-text("跳过")');
    this.cancelButton = this.page.locator('button:has-text("取消")');
    this.confirmButton = this.page.locator('button:has-text("确认点燃")');
    this.perspectiveCards = this.page.locator('button:has-text("阅读"), button:has-text("观看"), button:has-text("实践"), button:has-text("思考")');
    this.flameTitleInputs = this.page.locator('input').first();
    this.searchPhraseInputs = this.page.locator('text=探索口令').locator('..').locator('input');
  }

  async clickGetPerspectives(): Promise<void> {
    await this.getPerspectivesButton.click();
    // 等待 AI 响应
    await this.page.waitForTimeout(5000);
  }

  async selectFirstPerspective(): Promise<void> {
    const firstCard = this.page.locator('button:has-text("阅读")').first();
    await firstCard.click();
    await this.page.waitForTimeout(300);
  }

  async clickNext(): Promise<void> {
    await this.nextButton.click();
    await this.page.waitForTimeout(1000);
  }

  async clickSkip(): Promise<void> {
    await this.skipButton.click();
    await this.page.waitForTimeout(1000);
  }

  async clickConfirm(): Promise<void> {
    await this.confirmButton.click();
    await this.page.waitForTimeout(2000);
  }

  async selectWildFireOption(): Promise<void> {
    const select = this.page.locator('select');
    await select.selectOption({ label: '不归类（野火）' });
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add e2e/page-objects/KindleWizardPage.ts
git commit -m "feat(e2e): add KindleWizardPage Page Object"
```

---

## Chunk 3: 用户旅程测试

### Task 3.1: Journey 1 - 创建火种

**Files:**
- Create: `e2e/journeys/01-create-spark.spec.ts`

- [ ] **Step 1: 编写测试**

```typescript
import { test, expect } from '@playwright/test';
import { HearthPage } from '../page-objects/HearthPage';
import { clearAllData } from '../utils/helpers';

test.describe('Journey 1: 创建火种', () => {
  test.beforeEach(async ({ page }) => {
    await clearAllData(page);
  });

  test('应该能够创建火种并显示在列表中', async ({ page }) => {
    const hearthPage = new HearthPage(page);

    // 1. 导航到火盆页面
    await hearthPage.goto();

    // 2. 验证初始状态
    await expect(page.locator('text=火盆空空如也')).toBeVisible();

    // 3. 创建火种
    const sparkContent = '测试火种：为什么天空是蓝色的？';
    await hearthPage.createSpark(sparkContent);

    // 4. 验证火种出现在列表
    await expect(page.locator(`text=${sparkContent}`)).toBeVisible();

    // 5. 验证计数更新
    const count = await hearthPage.getSparkCount();
    expect(count).toBe(1);
  });

  test('应该能够创建多个火种', async ({ page }) => {
    const hearthPage = new HearthPage(page);
    await hearthPage.goto();

    await hearthPage.createSpark('火种1');
    await hearthPage.createSpark('火种2');

    const count = await hearthPage.getSparkCount();
    expect(count).toBe(2);
  });
});
```

- [ ] **Step 2: 运行测试验证**

```bash
npx playwright test e2e/journeys/01-create-spark.spec.ts --reporter=line
```

- [ ] **Step 3: 提交**

```bash
git add e2e/journeys/01-create-spark.spec.ts
git commit -m "test(e2e): add journey 1 - create spark"
```

---

### Task 3.2: Journey 2 - 点燃火种

**Files:**
- Create: `e2e/journeys/02-kindle-spark.spec.ts`

- [ ] **Step 1: 编写测试**

```typescript
import { test, expect } from '@playwright/test';
import { HearthPage } from '../page-objects/HearthPage';
import { PrairiePage } from '../page-objects/PrairiePage';
import { KindleWizardPage } from '../page-objects/KindleWizardPage';
import { clearAllData } from '../utils/helpers';

test.describe('Journey 2: 点燃火种', () => {
  test.beforeEach(async ({ page }) => {
    await clearAllData(page);
  });

  test('完整点燃流程', async ({ page }) => {
    const hearthPage = new HearthPage(page);
    const prairiePage = new PrairiePage(page);
    const kindlePage = new KindleWizardPage(page);

    // 1. 创建火种
    await hearthPage.goto();
    const sparkContent = '测试点燃流程';
    await hearthPage.createSpark(sparkContent);

    // 2. 点击火种进入点燃向导
    await hearthPage.clickFirstSpark();
    await expect(page).toHaveURL(/\/kindle/);

    // 3. 获取探索视角（真实 AI 调用）
    await kindlePage.clickGetPerspectives();

    // 4. 选择第一个视角
    await kindlePage.selectFirstPerspective();
    await kindlePage.clickNext();

    // 5. 确认行动步骤
    await expect(page.locator('text=确认行动')).toBeVisible();
    await kindlePage.clickNext();

    // 6. 确认点燃
    await expect(page.locator('text=确认点燃')).toBeVisible();
    await kindlePage.selectWildFireOption();
    await kindlePage.clickConfirm();

    // 7. 验证跳转至草原页面
    await expect(page).toHaveURL('/#/prairie');

    // 8. 验证野火数量 +1
    const count = await prairiePage.getWildFlameCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('跳过视角选择快速点燃', async ({ page }) => {
    const hearthPage = new HearthPage(page);
    const kindlePage = new KindleWizardPage(page);

    await hearthPage.goto();
    await hearthPage.createSpark('快速点燃测试');
    await hearthPage.clickFirstSpark();

    // 直接跳过
    await kindlePage.clickSkip();
    await kindlePage.clickNext();
    await kindlePage.selectWildFireOption();
    await kindlePage.clickConfirm();

    await expect(page).toHaveURL('/#/prairie');
  });
});
```

- [ ] **Step 2: 运行测试验证**

```bash
npx playwright test e2e/journeys/02-kindle-spark.spec.ts --reporter=line
```

- [ ] **Step 3: 提交**

```bash
git add e2e/journeys/02-kindle-spark.spec.ts
git commit -m "test(e2e): add journey 2 - kindle spark"
```

---

### Task 3.3: Journey 3 - 查看烈焰详情

**Files:**
- Create: `e2e/journeys/03-view-flame-detail.spec.ts`

- [ ] **Step 1: 编写测试**

```typescript
import { test, expect } from '@playwright/test';
import { HearthPage } from '../page-objects/HearthPage';
import { PrairiePage } from '../page-objects/PrairiePage';
import { FlameDetailPage } from '../page-objects/FlameDetailPage';
import { KindleWizardPage } from '../page-objects/KindleWizardPage';
import { clearAllData } from '../utils/helpers';

test.describe('Journey 3: 查看烈焰详情', () => {
  test.beforeEach(async ({ page }) => {
    await clearAllData(page);
  });

  test('应该能够查看野火详情', async ({ page }) => {
    const hearthPage = new HearthPage(page);
    const prairiePage = new PrairiePage(page);
    const flameDetailPage = new FlameDetailPage(page);
    const kindlePage = new KindleWizardPage(page);

    // 1. 创建火种并点燃
    await hearthPage.goto();
    await hearthPage.createSpark('查看详情测试');
    await hearthPage.clickFirstSpark();
    await kindlePage.clickSkip();
    await kindlePage.clickNext();
    await kindlePage.selectWildFireOption();
    await kindlePage.clickConfirm();

    // 2. 在草原页面点击野火
    await prairiePage.clickFirstWildFlame();

    // 3. 验证进入烈焰详情页
    await expect(page).toHaveURL(/\/prairie\/flame\//);

    // 4. 验证显示详情
    await expect(flameDetailPage.title).toBeVisible();
    await expect(flameDetailPage.completeButton).toBeVisible();
    await expect(page.locator('text=燃烧中')).toBeVisible();
  });
});
```

- [ ] **Step 2: 运行测试验证**

```bash
npx playwright test e2e/journeys/03-view-flame-detail.spec.ts --reporter=line
```

- [ ] **Step 3: 提交**

```bash
git add e2e/journeys/03-view-flame-detail.spec.ts
git commit -m "test(e2e): add journey 3 - view flame detail"
```

---

### Task 3.4: Journey 4 - 完成燃烧

**Files:**
- Create: `e2e/journeys/04-complete-burning.spec.ts`

- [ ] **Step 1: 编写测试**

```typescript
import { test, expect } from '@playwright/test';
import { HearthPage } from '../page-objects/HearthPage';
import { KindleWizardPage } from '../page-objects/KindleWizardPage';
import { FlameDetailPage } from '../page-objects/FlameDetailPage';
import { CompleteBurningPage } from '../page-objects/CompleteBurningPage';
import { RekindlePage } from '../page-objects/RekindlePage';
import { clearAllData } from '../utils/helpers';

test.describe('Journey 4: 完成燃烧', () => {
  test.beforeEach(async ({ page }) => {
    await clearAllData(page);
  });

  test('完成燃烧并跳转至取火页', async ({ page }) => {
    const hearthPage = new HearthPage(page);
    const kindlePage = new KindleWizardPage(page);
    const flameDetailPage = new FlameDetailPage(page);
    const completeBurningPage = new CompleteBurningPage(page);
    const rekindlePage = new RekindlePage(page);

    // 1. 创建火种并点燃
    await hearthPage.goto();
    await hearthPage.createSpark('完成燃烧测试');
    await hearthPage.clickFirstSpark();
    await kindlePage.clickSkip();
    await kindlePage.clickNext();
    await kindlePage.selectWildFireOption();
    await kindlePage.clickConfirm();

    // 2. 进入烈焰详情
    await flameDetailPage.clickComplete();

    // 3. 验证进入完成燃烧页面
    await expect(page).toHaveURL(/\/complete/);
    await expect(page.locator('text=完成燃烧')).toBeVisible();

    // 4. 填写感想并保存
    await completeBurningPage.fillReflection('这次探索让我了解了科学原理');
    await completeBurningPage.clickSave();

    // 5. 验证跳转至取火页
    await expect(page).toHaveURL(/\/rekindle/);
    await expect(rekindlePage.rekindleButton).toBeVisible();
  });

  test('跳过感想直接保存', async ({ page }) => {
    const hearthPage = new HearthPage(page);
    const kindlePage = new KindleWizardPage(page);
    const flameDetailPage = new FlameDetailPage(page);
    const completeBurningPage = new CompleteBurningPage(page);

    await hearthPage.goto();
    await hearthPage.createSpark('无感想测试');
    await hearthPage.clickFirstSpark();
    await kindlePage.clickSkip();
    await kindlePage.clickNext();
    await kindlePage.selectWildFireOption();
    await kindlePage.clickConfirm();

    await flameDetailPage.clickComplete();
    await completeBurningPage.skipReflection();

    await expect(page).toHaveURL(/\/rekindle/);
  });
});
```

- [ ] **Step 2: 运行测试验证**

```bash
npx playwright test e2e/journeys/04-complete-burning.spec.ts --reporter=line
```

- [ ] **Step 3: 提交**

```bash
git add e2e/journeys/04-complete-burning.spec.ts
git commit -m "test(e2e): add journey 4 - complete burning"
```

---

### Task 3.5: Journey 5 - 取火

**Files:**
- Create: `e2e/journeys/05-rekindle.spec.ts`

- [ ] **Step 1: 编写测试**

```typescript
import { test, expect } from '@playwright/test';
import { HearthPage } from '../page-objects/HearthPage';
import { KindleWizardPage } from '../page-objects/KindleWizardPage';
import { FlameDetailPage } from '../page-objects/FlameDetailPage';
import { CompleteBurningPage } from '../page-objects/CompleteBurningPage';
import { RekindlePage } from '../page-objects/RekindlePage';
import { clearAllData } from '../utils/helpers';

test.describe('Journey 5: 取火', () => {
  test.beforeEach(async ({ page }) => {
    await clearAllData(page);
  });

  test('取火并保存火种到火盆', async ({ page }) => {
    const hearthPage = new HearthPage(page);
    const kindlePage = new KindleWizardPage(page);
    const flameDetailPage = new FlameDetailPage(page);
    const completeBurningPage = new CompleteBurningPage(page);
    const rekindlePage = new RekindlePage(page);

    // 1. 创建火种 -> 点燃 -> 完成燃烧
    await hearthPage.goto();
    await hearthPage.createSpark('取火测试');
    await hearthPage.clickFirstSpark();
    await kindlePage.clickSkip();
    await kindlePage.clickNext();
    await kindlePage.selectWildFireOption();
    await kindlePage.clickConfirm();

    await flameDetailPage.clickComplete();
    await completeBurningPage.skipReflection();

    // 2. 验证进入取火页
    await expect(page).toHaveURL(/\/rekindle/);

    // 3. 点击重新点燃（真实 AI 调用）
    await rekindlePage.clickRekindle();

    // 4. 等待结果出现
    await expect(page.locator('button:has-text("保留")').first()).toBeVisible({ timeout: 15000 });

    // 5. 保留至少一个火种
    await rekindlePage.retainFirstSpark();
    await rekindlePage.clickSave();

    // 6. 验证跳转至草原页
    await expect(page).toHaveURL('/#/prairie');
  });
});
```

- [ ] **Step 2: 运行测试验证**

```bash
npx playwright test e2e/journeys/05-rekindle.spec.ts --reporter=line
```

- [ ] **Step 3: 提交**

```bash
git add e2e/journeys/05-rekindle.spec.ts
git commit -m "test(e2e): add journey 5 - rekindle"
```

---

### Task 3.6: Journey 6 - 探索功能

**Files:**
- Create: `e2e/journeys/06-explore.spec.ts`

- [ ] **Step 1: 编写测试**

```typescript
import { test, expect } from '@playwright/test';
import { ExplorePage } from '../page-objects/ExplorePage';
import { HearthPage } from '../page-objects/HearthPage';
import { clearAllData } from '../utils/helpers';

test.describe('Journey 6: 探索功能', () => {
  test.beforeEach(async ({ page }) => {
    await clearAllData(page);
  });

  test('探索并加入火盆', async ({ page }) => {
    const explorePage = new ExplorePage(page);
    const hearthPage = new HearthPage(page);

    // 1. 导航到探索页
    await explorePage.goto();

    // 2. 验证推荐内容可见
    await expect(explorePage.recommendations).toBeVisible();

    // 3. 输入探索词
    const query = '什么是量子计算？';
    await explorePage.search(query);

    // 4. 等待结果
    await expect(page.locator('button:has-text("加入火盆")').first()).toBeVisible({ timeout: 15000 });

    // 5. 加入火盆
    await explorePage.addFirstToHearth();

    // 6. 验证跳转至火盆页
    await expect(page).toHaveURL('/#/hearth');

    // 7. 验证火种出现
    const count = await hearthPage.getSparkCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
```

- [ ] **Step 2: 运行测试验证**

```bash
npx playwright test e2e/journeys/06-explore.spec.ts --reporter=line
```

- [ ] **Step 3: 提交**

```bash
git add e2e/journeys/06-explore.spec.ts
git commit -m "test(e2e): add journey 6 - explore"
```

---

### Task 3.7: Journey 7 - 整理功能

**Files:**
- Create: `e2e/journeys/07-organize.spec.ts`

- [ ] **Step 1: 编写测试**

```typescript
import { test, expect } from '@playwright/test';
import { HearthPage } from '../page-objects/HearthPage';
import { KindleWizardPage } from '../page-objects/KindleWizardPage';
import { OrganizePage } from '../page-objects/OrganizePage';
import { clearAllData } from '../utils/helpers';

test.describe('Journey 7: 整理功能', () => {
  test.beforeEach(async ({ page }) => {
    await clearAllData(page);
  });

  test('AI 整理野火', async ({ page }) => {
    const hearthPage = new HearthPage(page);
    const kindlePage = new KindleWizardPage(page);
    const organizePage = new OrganizePage(page);

    // 1. 创建多个火种并点燃为野火
    await hearthPage.goto();
    await hearthPage.createSpark('野火1');
    await hearthPage.clickFirstSpark();
    await kindlePage.clickSkip();
    await kindlePage.clickNext();
    await kindlePage.selectWildFireOption();
    await kindlePage.clickConfirm();

    // 2. 再创建一个
    await hearthPage.goto();
    await hearthPage.createSpark('野火2');
    await hearthPage.clickFirstSpark();
    await kindlePage.clickSkip();
    await kindlePage.clickNext();
    await kindlePage.selectWildFireOption();
    await kindlePage.clickConfirm();

    // 3. 导航到整理页
    await organizePage.goto();

    // 4. 验证野火数量
    const count = await organizePage.getWildFlameCount();
    expect(count).toBeGreaterThanOrEqual(2);

    // 5. 点击分析
    await organizePage.clickAnalyze();

    // 6. 等待 AI 结果或错误提示
    const hasSuggestions = await page.locator('button:has-text("归入草原"), button:has-text("创建新草原")').isVisible({ timeout: 15000 }).catch(() => false);
    const hasError = await page.locator('text=暂时不可用').isVisible().catch(() => false);

    // 两种结果都是可接受的
    expect(hasSuggestions || hasError).toBeTruthy();
  });
});
```

- [ ] **Step 2: 运行测试验证**

```bash
npx playwright test e2e/journeys/07-organize.spec.ts --reporter=line
```

- [ ] **Step 3: 提交**

```bash
git add e2e/journeys/07-organize.spec.ts
git commit -m "test(e2e): add journey 7 - organize"
```

---

### Task 3.8: Journey 8 - 完整闭环

**Files:**
- Create: `e2e/journeys/08-full-cycle.spec.ts`

- [ ] **Step 1: 编写测试**

```typescript
import { test, expect } from '@playwright/test';
import { HearthPage } from '../page-objects/HearthPage';
import { KindleWizardPage } from '../page-objects/KindleWizardPage';
import { FlameDetailPage } from '../page-objects/FlameDetailPage';
import { CompleteBurningPage } from '../page-objects/CompleteBurningPage';
import { RekindlePage } from '../page-objects/RekindlePage';
import { clearAllData } from '../utils/helpers';

test.describe('Journey 8: 完整闭环', () => {
  test.beforeEach(async ({ page }) => {
    await clearAllData(page);
  });

  test('完整用户旅程：火种 -> 烈焰 -> 完成燃烧 -> 取火 -> 新火种', async ({ page }) => {
    const hearthPage = new HearthPage(page);
    const kindlePage = new KindleWizardPage(page);
    const flameDetailPage = new FlameDetailPage(page);
    const completeBurningPage = new CompleteBurningPage(page);
    const rekindlePage = new RekindlePage(page);

    // 1. 创建火种
    await hearthPage.goto();
    const initialCount = await hearthPage.getSparkCount();
    await hearthPage.createSpark('完整闭环测试');
    await expect(await hearthPage.getSparkCount()).toBe(initialCount + 1);

    // 2. 点燃
    await hearthPage.clickFirstSpark();
    await kindlePage.clickSkip();
    await kindlePage.clickNext();
    await kindlePage.selectWildFireOption();
    await kindlePage.clickConfirm();

    // 3. 完成燃烧
    await flameDetailPage.clickComplete();
    await completeBurningPage.fillReflection('完整旅程测试感想');
    await completeBurningPage.clickSave();

    // 4. 取火
    await expect(page).toHaveURL(/\/rekindle/);
    await rekindlePage.clickRekindle();
    await expect(page.locator('button:has-text("保留")').first()).toBeVisible({ timeout: 15000 });
    await rekindlePage.retainFirstSpark();
    await rekindlePage.clickSave();

    // 5. 验证回到火盆页且有新火种
    await expect(page).toHaveURL('/#/hearth');
    const finalCount = await hearthPage.getSparkCount();
    expect(finalCount).toBeGreaterThan(initialCount);
  });
});
```

- [ ] **Step 2: 运行测试验证**

```bash
npx playwright test e2e/journeys/08-full-cycle.spec.ts --reporter=line
```

- [ ] **Step 3: 提交**

```bash
git add e2e/journeys/08-full-cycle.spec.ts
git commit -m "test(e2e): add journey 8 - full cycle"
```

---

## 验证清单

完成所有任务后，验证：

- [ ] Playwright 配置正确
- [ ] 所有 Page Objects 可正常工作
- [ ] 8 个用户旅程测试全部通过
- [ ] AI 调用正常（或有正确的 fallback 处理）

---

## 执行顺序

1. Chunk 1: 环境搭建
2. Chunk 2: Page Objects (按顺序 2.1-2.8)
3. Chunk 3: 用户旅程测试 (按顺序 3.1-3.8)
