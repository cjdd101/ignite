# E2E 用户旅程测试设计方案

> **状态**: Draft
> **创建时间**: 2026-04-28
> **更新**: 2026-04-28 - 初始版本

## 1. 背景与目标

### 1.1 项目概述

"点燃"是一个个人探索工具 Web 应用，帮助用户：
- 存一粒火种（记录灵感）
- 燃一团烈焰（执行探索）
- 蔓一片草原（归类整理）

### 1.2 测试目标

使用 Playwright 编写完整的 E2E 用户旅程测试，覆盖所有核心功能模块：
- 真实调用 AI API（无 Mock）
- 验证完整的页面流转
- 确保关键用户路径可正常工作

### 1.3 当前状态

- 无 Playwright 配置
- 无 E2E 测试
- 仅有部分 Vitest 单元测试

---

## 2. 测试环境要求

### 2.1 前置条件

```bash
# 1. 启动开发服务器
npm run dev

# 2. 服务运行在 http://localhost:5173
```

### 2.2 依赖项

```bash
# 需要安装 Playwright
npm install -D @playwright/test
npx playwright install chromium
```

### 2.3 配置

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,           // 串行执行，避免数据库冲突
  forbidOnly: !!process.env.CI,
  retries: 1,                    // 失败重试1次
  workers: 1,                    // 单进程
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
});
```

---

## 3. 文件结构

```
e2e/
├── playwright.config.ts         # Playwright 配置
├── page-objects/               # Page Object Models
│   ├── HearthPage.ts
│   ├── PrairiePage.ts
│   ├── FlameDetailPage.ts
│   ├── CompleteBurningPage.ts
│   ├── RekindlePage.ts
│   ├── ExplorePage.ts
│   ├── OrganizePage.ts
│   └── SettingsPage.ts
├── journeys/                    # 用户旅程测试
│   ├── 01-create-spark.spec.ts
│   ├── 02-kindle-spark.spec.ts
│   ├── 03-view-flame-detail.spec.ts
│   ├── 04-complete-burning.spec.ts
│   ├── 05-rekindle.spec.ts
│   ├── 06-explore.spec.ts
│   ├── 07-organize.spec.ts
│   └── 08-full-cycle.spec.ts
└── utils/
    └── helpers.ts               # 辅助函数
```

---

## 4. 用户旅程详细设计

### Journey 1: 创建火种

**文件**: `e2e/journeys/01-create-spark.spec.ts`

**路径**: 火盆 → 火盆

**步骤**:
1. 导航到火盆页面 (`/#/hearth`)
2. 输入火种内容："测试火种：为什么天空是蓝色的？"
3. 点击"投入火盆"按钮
4. 验证火种出现在列表中
5. 验证显示"已积蓄 1 粒火种"

**预期结果**:
- 火种创建成功
- 列表中显示新创建的火花

---

### Journey 2: 点燃火种

**文件**: `e2e/journeys/02-kindle-spark.spec.ts`

**路径**: 火盆 → 点燃向导 → 草原

**前置**: 需要至少 1 个火种

**步骤**:
1. 在火盆页面点击火种卡片
2. 进入点燃向导 Step 1 - 选择探索视角
3. 点击"获取探索视角"按钮（真实 AI 调用）
4. AI 返回视角建议后，选择至少 1 个视角
5. 点击"下一步"进入 Step 2 - 确认行动
6. 确认烈焰标题和探索口令
7. 点击"下一步"进入 Step 3 - 确认点燃
8. 选择"不归类（野火）"
9. 点击"确认点燃"
10. 验证跳转至草原页面
11. 验证野火数量 +1

**预期结果**:
- 点燃流程完整执行
- AI 返回视角建议（如果 AI 不可用，显示 fallback）
- 草原页面显示新创建的野火

---

### Journey 3: 查看烈焰详情

**文件**: `e2e/journeys/03-view-flame-detail.spec.ts`

**路径**: 草原 → 烈焰详情

**前置**: 需要至少 1 个野火

**步骤**:
1. 在草原页面点击野火卡片（标题为"阅读"）
2. 进入烈焰详情页
3. 验证显示烈焰标题、描述、状态（燃烧中）
4. 验证显示"跳转平台"和"完成燃烧"按钮

**预期结果**:
- 烈焰详情页正常加载
- 显示正确的烈焰信息
- 操作按钮可见

---

### Journey 4: 完成燃烧

**文件**: `e2e/journeys/04-complete-burning.spec.ts`

**路径**: 烈焰详情 → 完成燃烧页 → 取火页

**前置**: 需要至少 1 个燃烧中的野火

**步骤**:
1. 在烈焰详情页点击"完成燃烧"
2. 进入完成燃烧页面
3. 输入探索感想（选填）："这次探索让我了解了光散射的原理"
4. 点击"保存并取火"按钮
5. 验证跳转至取火页面
6. 验证显示火焰标题和取火次数（0/10）

**预期结果**:
- 完成燃烧页面正常加载
- 感想输入正常
- 跳转至取火页成功

---

### Journey 5: 取火

**文件**: `e2e/journeys/05-rekindle.spec.ts`

**路径**: 取火页 → 火盆

**前置**: 需要已完成燃烧但未取火的野火

**步骤**:
1. 在取火页面点击"重新点燃"按钮
2. 等待 AI 返回结果（真实 AI 调用）
3. 验证显示 AI 生成的新火种列表
4. 选择保留部分火种（点击"保留"）
5. 可以跳过不想要的火种（点击"丢弃"）
6. 点击"保存火种"按钮
7. 验证跳转至火盆页面
8. 验证保留的火种出现在火盆中

**预期结果**:
- 取火流程完整执行
- AI 返回新火种（如果 AI 不可用，显示错误提示）
- 保存的火种出现在火盆

---

### Journey 6: 探索功能

**文件**: `e2e/journeys/06-explore.spec.ts`

**路径**: 探索页 → 火盆或草原

**前置**: 无

**步骤**:
1. 导航到探索页面
2. 在搜索框输入探索词："什么是量子计算？"
3. 点击"探索"按钮
4. 等待 AI 返回探索结果（真实 AI 调用）
5. 验证显示探索结果列表
6. 选择一个结果点击"加入火盆"
7. 验证跳转至火盆页面
8. 验证新火种出现在列表中

**备选路径**:
- 也可以点击"点燃"进入点燃向导

**预期结果**:
- 探索功能完整执行
- AI 返回探索结果
- 火种成功加入火盆

---

### Journey 7: 整理功能

**文件**: `e2e/journeys/07-organize.spec.ts`

**路径**: 整理页 → 草原

**前置**: 需要至少 1 个野火

**步骤**:
1. 导航到整理页面
2. 验证显示野火数量（至少 1 朵）
3. 点击"开始 AI 整理"按钮
4. 等待 AI 分析结果（真实 AI 调用）
5. 如果 AI 可用：验证显示归类建议列表
6. 点击第一个建议进入详情
7. 点击"确认归入"
8. 验证返回总览页面
9. 如果 AI 不可用：验证显示错误提示

**预期结果**:
- 整理页面正常加载
- AI 分析执行（成功或失败都有预期处理）
- 归类操作正常执行

---

### Journey 8: 完整闭环

**文件**: `e2e/journeys/08-full-cycle.spec.ts`

**路径**: 火盆 → 取火后回火盆

**前置**: 需要已完成燃烧的野火

**步骤**:
1. 在火盆输入新火种："测试完整闭环"
2. 点击"投入火盆"
3. 点击火种卡片进入点燃向导
4. 点击"跳过"快速通过视角选择
5. 直接进入确认点燃
6. 点击"确认点燃"
7. 在草原页面点击新创建的野火
8. 点击"完成燃烧"
9. 输入感想
10. 点击"保存并取火"
11. 在取火页面点击"重新点燃"
12. 选择保留火种
13. 点击"保存火种"
14. 验证回到火盆页面
15. 验证有新的火种出现

**预期结果**:
- 完整用户旅程成功执行
- 所有页面流转正常
- 数据正确保存

---

## 5. Page Objects 设计

每个 Page Object 包含：

```typescript
// 示例：HearthPage.ts
export class HearthPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/#/hearth');
  }

  async createSpark(content: string) {
    await this.page.locator('textarea').fill(content);
    await this.page.locator('button:has-text("投入火盆")').click();
  }

  async getSparkCount() {
    const text = await this.page.locator('text=/已积蓄.*粒火种/').textContent();
    // parse count...
  }
}
```

---

## 6. 辅助函数

```typescript
// utils/helpers.ts

export async function clearAllData(page: Page) {
  // 清除 IndexedDB 中的所有数据
  await page.evaluate(() => {
    indexedDB.deleteDatabase('kindling');
  });
  await page.reload();
}

export async function waitForAI(timeout = 10000) {
  // 等待 AI 响应，最多 timeout ms
}

export async function createTestSpark(page: Page, content: string) {
  // 创建测试火种的快捷方法
}
```

---

## 7. 测试执行

### 7.1 运行所有测试

```bash
npx playwright test
```

### 7.2 运行单个旅程

```bash
npx playwright test e2e/journeys/01-create-spark.spec.ts
```

### 7.3 查看测试报告

```bash
npx playwright show-report
```

---

## 8. 已知限制

### 8.1 AI API 依赖

- 点燃向导、探索、整理由真实 AI 驱动
- 如果 AI 服务不可用，部分测试会失败或显示 fallback
- CORS 配置可能需要调整

### 8.2 数据隔离

- 测试使用真实的 IndexedDB 数据库
- 测试之间可能存在数据污染
- 建议：每个测试前清除数据库

---

## 9. 实现清单

- [ ] 创建 `playwright.config.ts`
- [ ] 安装 Playwright 依赖
- [ ] 创建 Page Objects
- [ ] 实现 Journey 1: 创建火种
- [ ] 实现 Journey 2: 点燃火种
- [ ] 实现 Journey 3: 查看烈焰详情
- [ ] 实现 Journey 4: 完成燃烧
- [ ] 实现 Journey 5: 取火
- [ ] 实现 Journey 6: 探索功能
- [ ] 实现 Journey 7: 整理功能
- [ ] 实现 Journey 8: 完整闭环
- [ ] 验证所有测试可运行
