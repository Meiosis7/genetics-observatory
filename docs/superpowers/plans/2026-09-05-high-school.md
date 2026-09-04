# High-school Genetics Implementation Plan

> **For agentic workers:** Use subagent-driven-development for the independent calculator task and review. Follow test-driven-development for all source changes.

**Goal:** Extend the existing teaching platform with usable high-school genetics calculators, including lethal selection.

**Architecture:** Pure numeric engines return a shared report. A schema-driven topic workbench renders input fields, distributions, metrics and derivations. Existing Mendelian UI remains compatible.

**Tech Stack:** Existing React, TypeScript, Vitest and CSS. No new dependencies.

## Global Constraints

- 全部纯函数，本地运行；百分比显示四舍五入，内部保留数值精度。
- 参数无效时隐藏旧结果、展示中文错误；不存在的条件分母显示无定义，而非 0%。
- 不做真实遗传病诊断、全家系概率诊断或任意生物过程模拟。
- Preserve the existing warm-paper / forest-green editorial style and existing basic experiments.

## Shared interface

```ts
type Values = Record<string, string>
interface Report {
  summary: string
  metrics: { label: string; value: string; hint?: string }[]
  distributions: { title: string; rows: { label: string; value: number }[] }[]
  steps: string[]
  notes: string[]
  table?: { headers: string[]; rows: string[][] }
}
```

### Task 1: Weighted crossing and lethal rules (owner)

- [x] Add failing tests for Aa×Aa AA lethal (0.75 survival, 2/3 Aa), sex-specific gamete death, all-dead pools, partial penetrance, dihybrid locus rules, linked testcross and interaction ratios.
- [x] Run `npm test -- --run src/advanced/crossing.test.ts` and confirm missing exports fail.
- [x] Implement `lethalReport(v: Values)`, `linkageReport(v: Values)`, `interactionReport(v: Values)` in `src/advanced/crossing.ts`. Generate weighted gametes from the existing parser, remove gametes per sex, multiply surviving gamete probabilities and zygote viability. Validate all ranges and locus rules.
- [x] Rerun tests, check normalization and zero-population cases.

### Task 2: Curriculum calculators (delegated)

- [x] Read task requirements in `docs/superpowers/plans/high-school-task-2.md`; add failing tests first.
- [x] Implement sex-linked, blood, nuclear-family, selfing, population, DNA, division, and probability calculators as pure report functions.
- [x] Run focused tests and review mathematical assumptions, invalid inputs and boundary cases.
- [x] Supply a task report with test evidence. An independent reviewer checks spec and quality.

### Task 3: Topic workbench and integration (owner)

- [x] Add failing interaction tests for navigation, lethal rule changes, invalid numeric input, topic reset and copy failure.
- [x] Add `catalog.ts`, `AdvancedPage.tsx`, `ReportView.tsx` and `advanced.css`; use labeled inputs and semantic tables, responsive split layout, live errors and topic-specific presets.
- [x] Add entry buttons to HomePage and AppHeader, preserve basic flow, remount saved experiments correctly.
- [x] Run focused UI tests and regression suite.

### Task 4: Verification and delivery

- [x] Review all topic defaults, correct errors, run `npm test -- --run`, `npm run build`, `git diff --check`.
- [ ] Update README with supported models and assumptions. Obtain independent review and resolve important issues.
- [ ] Show the running platform and attempt supported hosting without exposing private files or secrets. Report any deployment blocker accurately.
