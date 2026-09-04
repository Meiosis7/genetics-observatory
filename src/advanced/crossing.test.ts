import { describe, expect, it } from 'vitest'
import { lethalReport, linkageReport, interactionReport } from './crossing'

const base = { parentA: 'Aa', parentB: 'Aa', femaleDead: '', maleDead: '', lethalA: 'AA', lethalB: 'none', penetrance: '100' }
const rows = (report: ReturnType<typeof lethalReport>, title: string) => Object.fromEntries(report.distributions.find(d => d.title === title)!.rows.map(r => [r.label, r.value]))

describe('lethal selection', () => {
  it('renormalizes surviving zygotes and keeps pre-selection frequencies', () => {
    const result = lethalReport(base)
    expect(rows(result, '受精后 · 致死前基因型')).toEqual({ AA: .25, Aa: .5, aa: .25 })
    expect(rows(result, '存活子代 · 基因型')).toEqual({ Aa: 2 / 3, aa: 1 / 3 })
    expect(result.metrics.find(m => m.label === '合子存活率')?.value).toBe('75%')
  })
  it('removes only male a gametes', () => {
    const result = lethalReport({ ...base, lethalA: 'none', maleDead: 'a' })
    expect(rows(result, '存活子代 · 基因型')).toEqual({ AA: .5, Aa: .5 })
    expect(result.metrics.find(m => m.label === '雄配子存活率')?.value).toBe('50%')
  })
  it('handles an empty gamete pool and all dead offspring without NaN', () => {
    const empty = lethalReport({ ...base, maleDead: 'A,a' })
    expect(empty.summary).toContain('无法形成合子')
    expect(empty.distributions).toHaveLength(0)
    const dead = lethalReport({ ...base, parentA: 'AA', parentB: 'AA' })
    expect(rows(dead, '存活子代 · 基因型')).toEqual({})
    expect(dead.summary).toContain('无存活子代')
  })
  it('supports partial penetrance and two independent lethal rules', () => {
    expect(rows(lethalReport({ ...base, penetrance: '50' }), '存活子代 · 基因型').AA).toBeCloseTo(1 / 7)
    const result = lethalReport({ ...base, parentA: 'AaBb', parentB: 'AaBb', lethalB: 'bb' })
    expect(result.metrics.find(m => m.label === '合子存活率')?.value).toBe('56.25%')
  })
  it('rejects invalid rules and mismatched loci', () => {
    expect(() => lethalReport({ ...base, penetrance: '' })).toThrow()
    expect(() => lethalReport({ ...base, penetrance: '101' })).toThrow()
    expect(() => lethalReport({ ...base, maleDead: 'B' })).toThrow()
    expect(() => lethalReport({ ...base, parentB: 'AaBb' })).toThrow()
  })
})

describe('linked crosses', () => {
  const linked = { phaseA: 'AB/ab', phaseB: 'ab/ab', rA: '20', rB: '0' }
  it('uses recombination weights, not cell counts', () => {
    expect(rows(linkageReport(linked), '子代基因型')).toEqual({ AaBb: .4, Aabb: .1, aaBb: .1, aabb: .4 })
  })
  it('handles repulsion and 50% recombination', () => {
    expect(rows(linkageReport({ ...linked, phaseA: 'Ab/aB' }), '子代基因型').AaBb).toBeCloseTo(.1)
    expect(Object.values(rows(linkageReport({ ...linked, rA: '50' }), '子代基因型'))).toEqual([.25, .25, .25, .25])
  })
  it('rejects recombination above 50 percent', () => {
    expect(() => linkageReport({ ...linked, rA: '51' })).toThrow()
  })
})

describe('nonstandard phenotype ratios', () => {
  it('summarizes actual homozygous crosses and labels the classic ratio as an example', () => {
    for (const [parent, phenotype] of [['AABB', '两种显性基因同时存在'], ['aabb', '缺少至少一种显性基因']]) {
      const report = interactionReport({ parentA: parent, parentB: parent, model: 'complementary' })
      expect(report.summary).toContain(`${parent} × ${parent}`)
      expect(report.summary).toContain(`${phenotype} 100%`)
      expect(report.summary).not.toContain('9:7')
      expect(rows(report, '表现型分布')).toEqual({ [phenotype]: 1 })
      expect(report.steps.some(step => step.includes('AaBb × AaBb 示例比例') && step.includes('9:7'))).toBe(true)
    }
  })
  it('derives complementary 9:7 and duplicate dominant 15:1', () => {
    const common = { parentA: 'AaBb', parentB: 'AaBb' }
    expect(Object.values(rows(interactionReport({ ...common, model: 'complementary' }), '表现型分布'))).toEqual([9 / 16, 7 / 16])
    expect(Object.values(rows(interactionReport({ ...common, model: 'duplicate' }), '表现型分布'))).toEqual([15 / 16, 1 / 16])
  })
  it('keeps heterozygotes distinct for incomplete dominance', () => {
    expect(Object.values(rows(interactionReport({ parentA: 'Aa', parentB: 'Aa', model: 'incomplete' }), '表现型分布'))).toEqual([.25, .5, .25])
  })
})
