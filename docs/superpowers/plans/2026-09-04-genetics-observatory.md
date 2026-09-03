# 遗传观察所 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个无需登录、适合学生自学与教师投屏的中文孟德尔遗传交互平台。

**Architecture:** React 单页应用负责实验设置、推导展示和本地历史；独立 TypeScript 纯函数模块负责基因型解析、配子枚举、子代组合和概率统计。所有视图使用同一个 `CrossResult`，避免潘尼特方格、图表和文字结论出现不一致。

**Tech Stack:** React 19、TypeScript、Vite、Vitest、Testing Library、CSS Modules/全局设计令牌、浏览器 localStorage。

## Global Constraints

- 首版只支持完全显性的单基因与双基因常染色体遗传。
- 支持普通杂交、自交、测交、回交和自由交配的教学入口。
- 所有计算在浏览器本地完成，不上传学生数据。
- 视觉采用植物深绿、珊瑚红、芥末金、鼠尾草绿与暖米白的科学杂志编辑风。
- 学生模式提供完整解释，教师模式可逐步揭晓并适配 16:9 投屏。
- 历史记录保存在本机，最多 12 条。

---

### Task 1: 项目骨架与测试环境

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/test/setup.ts`
- Test: `src/App.test.tsx`

**Interfaces:**
- Produces: `App(): JSX.Element`，后续页面与组件的应用入口。

- [ ] **Step 1: 写失败的应用冒烟测试**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the Genetics Observatory brand', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: '遗传观察所' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- --run src/App.test.tsx`
Expected: FAIL，提示找不到 `./App` 或标题。

- [ ] **Step 3: 创建最小 React/Vite 应用**

```json
{
  "name": "genetics-observatory",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest",
    "preview": "vite preview"
  },
  "dependencies": { "@vitejs/plugin-react": "latest", "vite": "latest", "typescript": "latest", "react": "latest", "react-dom": "latest", "lucide-react": "latest" },
  "devDependencies": { "vitest": "latest", "jsdom": "latest", "@testing-library/react": "latest", "@testing-library/jest-dom": "latest", "@types/react": "latest", "@types/react-dom": "latest" }
}
```

```tsx
export default function App() {
  return <main><h1>遗传观察所</h1></main>
}
```

- [ ] **Step 4: 安装依赖并确认测试通过**

Run: `npm install && npm test -- --run src/App.test.tsx`
Expected: 1 test PASS。

- [ ] **Step 5: 提交**

```bash
git add package.json package-lock.json index.html tsconfig.json vite.config.ts src
git commit -m "build: scaffold genetics observatory"
```

### Task 2: 分数工具与遗传数据类型

**Files:**
- Create: `src/genetics/types.ts`
- Create: `src/genetics/fraction.ts`
- Test: `src/genetics/fraction.test.ts`

**Interfaces:**
- Produces: `Fraction`, `AllelePair`, `Gamete`, `OffspringCell`, `CrossResult`。
- Produces: `fraction(numerator, denominator)`, `addFractions`, `multiplyFractions`, `formatFraction`, `toPercent`。

- [ ] **Step 1: 写分数约分和运算测试**

```ts
import { describe, expect, it } from 'vitest'
import { addFractions, formatFraction, fraction, multiplyFractions, toPercent } from './fraction'

describe('fraction', () => {
  it('reduces and calculates exact probabilities', () => {
    expect(fraction(8, 16)).toEqual({ numerator: 1, denominator: 2 })
    expect(addFractions(fraction(1, 4), fraction(1, 4))).toEqual(fraction(1, 2))
    expect(multiplyFractions(fraction(1, 2), fraction(1, 2))).toEqual(fraction(1, 4))
    expect(formatFraction(fraction(9, 16))).toBe('9/16')
    expect(toPercent(fraction(1, 16))).toBe('6.25%')
  })
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- --run src/genetics/fraction.test.ts`
Expected: FAIL，提示找不到 `fraction` 模块。

- [ ] **Step 3: 实现精确分数工具与共享类型**

```ts
export interface Fraction { numerator: number; denominator: number }
export const gcd = (a: number, b: number): number => b === 0 ? Math.abs(a) : gcd(b, a % b)
export const fraction = (numerator: number, denominator: number): Fraction => {
  if (denominator === 0) throw new Error('分母不能为 0')
  const divisor = gcd(numerator, denominator)
  const sign = denominator < 0 ? -1 : 1
  return { numerator: sign * numerator / divisor, denominator: sign * denominator / divisor }
}
export const addFractions = (a: Fraction, b: Fraction) => fraction(a.numerator * b.denominator + b.numerator * a.denominator, a.denominator * b.denominator)
export const multiplyFractions = (a: Fraction, b: Fraction) => fraction(a.numerator * b.numerator, a.denominator * b.denominator)
export const formatFraction = (value: Fraction) => `${value.numerator}/${value.denominator}`
export const toPercent = (value: Fraction) => `${Number((value.numerator / value.denominator * 100).toFixed(2))}%`
```

- [ ] **Step 4: 运行测试并确认通过**

Run: `npm test -- --run src/genetics/fraction.test.ts`
Expected: 1 test PASS。

- [ ] **Step 5: 提交**

```bash
git add src/genetics
git commit -m "feat: add exact probability primitives"
```

### Task 3: 孟德尔杂交计算引擎

**Files:**
- Create: `src/genetics/engine.ts`
- Test: `src/genetics/engine.test.ts`

**Interfaces:**
- Consumes: `Fraction`, `Gamete`, `CrossResult` from `src/genetics/types.ts`。
- Produces: `parseGenotype(input: string): AllelePair[]`。
- Produces: `generateGametes(genotype: string): Gamete[]`。
- Produces: `calculateCross(parentA: string, parentB: string): CrossResult`。
- Produces: `phenotypeKey(genotype: string): string`。

- [ ] **Step 1: 写经典比例测试**

```ts
import { describe, expect, it } from 'vitest'
import { calculateCross, generateGametes } from './engine'

describe('Mendelian cross engine', () => {
  it('generates two equally likely gametes for Aa', () => {
    expect(generateGametes('Aa')).toEqual([{ label: 'A', probability: { numerator: 1, denominator: 2 } }, { label: 'a', probability: { numerator: 1, denominator: 2 } }])
  })
  it('calculates Aa × Aa as 1:2:1 and 3:1', () => {
    const result = calculateCross('Aa', 'Aa')
    expect(result.genotypeCounts).toEqual({ AA: 1, Aa: 2, aa: 1 })
    expect(result.phenotypeCounts).toEqual({ 'A_': 3, aa: 1 })
  })
  it('calculates AaBb × AaBb as 9:3:3:1', () => {
    const result = calculateCross('AaBb', 'AaBb')
    expect(result.phenotypeCounts).toEqual({ 'A_B_': 9, 'A_bb': 3, 'aaB_': 3, aabb: 1 })
    expect(result.cells).toHaveLength(16)
  })
  it('rejects malformed genotypes', () => {
    expect(() => calculateCross('Aab', 'Aa')).toThrow('基因型格式')
  })
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- --run src/genetics/engine.test.ts`
Expected: FAIL，提示找不到 `engine` 模块。

- [ ] **Step 3: 实现解析、配子和组合算法**

```ts
export function parseGenotype(input: string): AllelePair[] {
  if (!/^(?:[A-Z][a-z]|[A-Z]{2}|[a-z]{2}){1,2}$/.test(input)) throw new Error('基因型格式无效')
  const pairs = input.match(/../g) ?? []
  if (pairs.some(pair => pair[0].toUpperCase() !== pair[1].toUpperCase())) throw new Error('同一位点必须使用相同字母')
  return pairs.map(pair => ({ symbol: pair[0].toUpperCase(), alleles: [pair[0], pair[1]] }))
}

export function generateGametes(genotype: string): Gamete[] {
  const pairs = parseGenotype(genotype)
  const labels = pairs.reduce<string[]>((items, pair) => items.flatMap(prefix => [...new Set(pair.alleles)].map(allele => prefix + allele)), [''])
  return labels.map(label => ({ label, probability: fraction(1, labels.length) }))
}

export function calculateCross(parentA: string, parentB: string): CrossResult {
  const maternalGametes = generateGametes(parentA)
  const paternalGametes = generateGametes(parentB)
  const cells = maternalGametes.flatMap(maternal => paternalGametes.map(paternal => combineCell(maternal, paternal)))
  return aggregateResult(parentA, parentB, maternalGametes, paternalGametes, cells)
}
```

- [ ] **Step 4: 运行引擎测试并确认通过**

Run: `npm test -- --run src/genetics/engine.test.ts`
Expected: 4 tests PASS，概率总和为 1。

- [ ] **Step 5: 提交**

```bash
git add src/genetics
git commit -m "feat: implement Mendelian cross engine"
```

### Task 4: 实验模型、案例与本地记录

**Files:**
- Create: `src/experiments/types.ts`
- Create: `src/experiments/presets.ts`
- Create: `src/experiments/history.ts`
- Test: `src/experiments/history.test.ts`

**Interfaces:**
- Produces: `Experiment`, `ExperimentMode`, `EXPERIMENT_PRESETS`。
- Produces: `loadHistory(): ExperimentRecord[]`, `saveExperiment(experiment, result): ExperimentRecord[]`, `deleteExperiment(id)`, `clearHistory()`。

- [ ] **Step 1: 写记录上限和恢复测试**

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { clearHistory, loadHistory, saveExperiment } from './history'

describe('experiment history', () => {
  beforeEach(() => localStorage.clear())
  it('stores only the latest 12 experiments', () => {
    for (let index = 0; index < 13; index += 1) saveExperiment({ ...sampleExperiment, title: `实验 ${index}` }, sampleResult)
    expect(loadHistory()).toHaveLength(12)
    expect(loadHistory()[0].title).toBe('实验 12')
  })
  it('clears history', () => {
    saveExperiment(sampleExperiment, sampleResult)
    clearHistory()
    expect(loadHistory()).toEqual([])
  })
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- --run src/experiments/history.test.ts`
Expected: FAIL，提示找不到 `history`。

- [ ] **Step 3: 实现案例与记录仓库**

```ts
const STORAGE_KEY = 'genetics-observatory:history:v1'
export function loadHistory(): ExperimentRecord[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}
export function saveExperiment(experiment: Experiment, result: CrossResult): ExperimentRecord[] {
  const record = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), title: experiment.title, experiment, summary: result.summary }
  const next = [record, ...loadHistory()].slice(0, 12)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}
export function deleteExperiment(id: string) { localStorage.setItem(STORAGE_KEY, JSON.stringify(loadHistory().filter(item => item.id !== id))) }
export function clearHistory() { localStorage.removeItem(STORAGE_KEY) }
```

- [ ] **Step 4: 运行测试并确认通过**

Run: `npm test -- --run src/experiments/history.test.ts`
Expected: 2 tests PASS。

- [ ] **Step 5: 提交**

```bash
git add src/experiments
git commit -m "feat: add experiment presets and local history"
```

### Task 5: 科学杂志风应用外壳与首页

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `src/components/AppHeader.tsx`
- Create: `src/components/EditorialCard.tsx`
- Create: `src/pages/HomePage.tsx`
- Modify: `src/App.tsx`
- Test: `src/pages/HomePage.test.tsx`

**Interfaces:**
- Consumes: `EXPERIMENT_PRESETS`。
- Produces: `HomePage({ onStart, onOpenHistory })`，将所选预设传给实验台。

- [ ] **Step 1: 写首页入口测试**

```tsx
it('starts a classic dihybrid experiment', async () => {
  const onStart = vi.fn()
  render(<HomePage onStart={onStart} onOpenHistory={() => undefined} />)
  await userEvent.click(screen.getByRole('button', { name: /双因子经典杂交/ }))
  expect(onStart).toHaveBeenCalledWith(expect.objectContaining({ parentA: 'AaBb', parentB: 'AaBb' }))
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- --run src/pages/HomePage.test.tsx`
Expected: FAIL，提示找不到 `HomePage`。

- [ ] **Step 3: 实现设计令牌、页眉、实验模块和最近记录区**

```css
:root {
  --ink: #17382d;
  --coral: #e76f51;
  --mustard: #e1b950;
  --sage: #d7e1cf;
  --paper: #fffaf0;
  --canvas: #f2eddf;
  --line: #d8cebd;
  --shadow-offset: 4px 5px 0 var(--ink);
  font-family: Inter, "Noto Sans SC", system-ui, sans-serif;
}
```

```tsx
export function HomePage({ onStart, onOpenHistory }: HomePageProps) {
  return <main className="home"><section className="hero"><p className="eyebrow">INTERACTIVE GENETICS LAB</p><h1>把遗传规律，放到眼前。</h1><p>设置亲本、观察配子、推演子代。每一步都有证据。</p><button onClick={() => onStart(EXPERIMENT_PRESETS[0])}>开始一次实验</button></section><section aria-labelledby="modules-title"><h2 id="modules-title">选择实验方式</h2><ExperimentGrid presets={EXPERIMENT_PRESETS} onStart={onStart} /></section><RecentHistory onOpen={onOpenHistory} /></main>
}
```

- [ ] **Step 4: 运行测试并确认通过**

Run: `npm test -- --run src/pages/HomePage.test.tsx`
Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add src
git commit -m "feat: build editorial home experience"
```

### Task 6: 混合实验台与结果可视化

**Files:**
- Create: `src/pages/LabPage.tsx`
- Create: `src/components/ExperimentForm.tsx`
- Create: `src/components/GameteFlow.tsx`
- Create: `src/components/PunnettGrid.tsx`
- Create: `src/components/DistributionBars.tsx`
- Create: `src/components/ResultSummary.tsx`
- Modify: `src/App.tsx`
- Test: `src/pages/LabPage.test.tsx`

**Interfaces:**
- Consumes: `calculateCross(parentA, parentB)` and `saveExperiment(experiment, result)`。
- Produces: `LabPage({ initialExperiment, onBack })`。

- [ ] **Step 1: 写交互式计算测试**

```tsx
it('updates the Punnett result when parents change', async () => {
  render(<LabPage initialExperiment={singleGenePreset} onBack={() => undefined} />)
  await userEvent.clear(screen.getByLabelText('亲本 P₁ 基因型'))
  await userEvent.type(screen.getByLabelText('亲本 P₁ 基因型'), 'AA')
  expect(screen.getByText('显性表现型')).toHaveTextContent('100%')
  expect(screen.getAllByTestId('punnett-cell')).toHaveLength(4)
})

it('shows inline validation for malformed genotypes', async () => {
  render(<LabPage initialExperiment={singleGenePreset} onBack={() => undefined} />)
  await userEvent.clear(screen.getByLabelText('亲本 P₁ 基因型'))
  await userEvent.type(screen.getByLabelText('亲本 P₁ 基因型'), 'Ab')
  expect(screen.getByRole('alert')).toHaveTextContent('同一位点')
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- --run src/pages/LabPage.test.tsx`
Expected: FAIL，提示找不到 `LabPage`。

- [ ] **Step 3: 实现左右分栏实验台**

```tsx
export function LabPage({ initialExperiment, onBack }: LabPageProps) {
  const [experiment, setExperiment] = useState(initialExperiment)
  const outcome = useMemo(() => {
    try { return { result: calculateCross(experiment.parentA, experiment.parentB), error: '' } }
    catch (error) { return { result: null, error: error instanceof Error ? error.message : '无法计算' } }
  }, [experiment.parentA, experiment.parentB])
  return <main className="lab-layout"><ExperimentForm experiment={experiment} error={outcome.error} onChange={setExperiment} onBack={onBack} />{outcome.result ? <section className="result-panel"><GameteFlow result={outcome.result} /><PunnettGrid result={outcome.result} /><DistributionBars result={outcome.result} /><ResultSummary result={outcome.result} /></section> : <EmptyResult message={outcome.error} />}</main>
}
```

- [ ] **Step 4: 运行测试并确认通过**

Run: `npm test -- --run src/pages/LabPage.test.tsx`
Expected: 2 tests PASS。

- [ ] **Step 5: 提交**

```bash
git add src
git commit -m "feat: add interactive hybrid genetics lab"
```

### Task 7: 教师演示、历史管理与无障碍适配

**Files:**
- Create: `src/components/PresentationMode.tsx`
- Create: `src/components/HistoryDrawer.tsx`
- Create: `src/hooks/useReducedMotion.ts`
- Modify: `src/pages/LabPage.tsx`
- Modify: `src/styles/global.css`
- Test: `src/components/PresentationMode.test.tsx`
- Test: `src/components/HistoryDrawer.test.tsx`

**Interfaces:**
- Consumes: `CrossResult`, `loadHistory`, `deleteExperiment`, `clearHistory`。
- Produces: `PresentationMode({ experiment, result, onExit })` and `HistoryDrawer({ onLoad, onClose })`。

- [ ] **Step 1: 写逐步揭晓与历史删除测试**

```tsx
it('reveals one teaching step at a time', async () => {
  render(<PresentationMode experiment={sampleExperiment} result={sampleResult} onExit={() => undefined} />)
  expect(screen.getByText('亲本')).toBeVisible()
  expect(screen.queryByText('表现型结论')).not.toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: '下一步' }))
  expect(screen.getByText('配子')).toBeVisible()
})

it('asks before clearing all history', async () => {
  render(<HistoryDrawer onLoad={() => undefined} onClose={() => undefined} />)
  await userEvent.click(screen.getByRole('button', { name: '清空记录' }))
  expect(screen.getByRole('dialog', { name: '确认清空全部记录' })).toBeVisible()
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- --run src/components/PresentationMode.test.tsx src/components/HistoryDrawer.test.tsx`
Expected: FAIL，组件尚不存在。

- [ ] **Step 3: 实现演示步骤、记录抽屉和响应式样式**

```tsx
const teachingSteps = ['parents', 'gametes', 'grid', 'distribution', 'summary'] as const
export function PresentationMode({ experiment, result, onExit }: PresentationModeProps) {
  const [stepIndex, setStepIndex] = useState(0)
  return <div className="presentation" role="dialog" aria-label="教师演示模式"><header><button onClick={onExit}>退出演示</button><span>{stepIndex + 1} / {teachingSteps.length}</span></header><TeachingStage step={teachingSteps[stepIndex]} experiment={experiment} result={result} /><footer><button disabled={stepIndex === 0} onClick={() => setStepIndex(value => value - 1)}>上一步</button><button disabled={stepIndex === teachingSteps.length - 1} onClick={() => setStepIndex(value => value + 1)}>下一步</button></footer></div>
}
```

```css
@media (max-width: 840px) { .lab-layout { grid-template-columns: 1fr; } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; } }
.presentation { position: fixed; inset: 0; z-index: 100; background: var(--paper); font-size: clamp(18px, 2vw, 34px); }
```

- [ ] **Step 4: 运行测试并确认通过**

Run: `npm test -- --run src/components/PresentationMode.test.tsx src/components/HistoryDrawer.test.tsx`
Expected: 2 tests PASS。

- [ ] **Step 5: 提交**

```bash
git add src
git commit -m "feat: add teaching mode and local history controls"
```

### Task 8: 最终验收与发布构建

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/plans/2026-09-04-genetics-observatory.md`

**Interfaces:**
- Consumes: 完整应用与全部测试。
- Produces: 可部署的 `dist/` 静态站点。

- [ ] **Step 1: 运行完整自动化测试**

Run: `npm test -- --run`
Expected: 所有测试 PASS，无未处理异常。

- [ ] **Step 2: 运行 TypeScript 与生产构建**

Run: `npm run build`
Expected: 命令退出码 0，并生成 `dist/index.html` 和静态资源。

- [ ] **Step 3: 在浏览器检查核心路径**

Run: `npm run dev -- --host 127.0.0.1`
Expected: 首页、双因子经典案例、实验台、教师演示与历史记录均可打开；桌面和窄屏无横向溢出。

- [ ] **Step 4: 添加使用文档**

```md
# 遗传观察所

运行 `npm install && npm run dev` 启动本地开发环境。运行 `npm test -- --run` 验证遗传计算，运行 `npm run build` 生成可部署静态文件。
```

- [ ] **Step 5: 提交最终验收结果**

```bash
git add README.md docs/superpowers/plans/2026-09-04-genetics-observatory.md
git commit -m "docs: finish genetics observatory handoff"
```
