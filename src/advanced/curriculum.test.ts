import { describe, expect, it } from 'vitest'
import {
  selfingReport,
  populationReport,
  dnaReport,
  divisionReport,
  probabilityReport,
} from './curriculum'
const value = (r: ReturnType<typeof dnaReport>, label: string) =>
  r.metrics.find((x) => x.label === label)?.value
describe('curriculum engines', () => {
  it('uses Chinese field names in validation errors', () => {
    expect(() => selfingReport({ generations: '', selection: 'none' })).toThrow(
      '自交代数',
    )
    expect(() => populationReport({ AA: '', Aa: '0', aa: '0' })).toThrow(
      'AA 个体数',
    )
    expect(() => dnaReport({ pairs: '', gc: '0', rounds: '0' })).toThrow(
      '碱基对数',
    )
    expect(() => divisionReport({ diploid: '', division: 'mitosis' })).toThrow(
      '二倍体染色体数',
    )
    expect(() =>
      probabilityReport({ probability: '', births: '1', affected: '0' }),
    ).toThrow('单次事件概率')
    expect(() =>
      probabilityReport({ probability: '50', births: '', affected: '0' }),
    ).toThrow('重复次数')
  })
  it('rounds displayed percentages to four decimal places', () => {
    expect(
      value(
        populationReport({ AA: '1', Aa: '0', aa: '2' }),
        'A 等位基因频率 p',
      ),
    ).toBe('33.3333%')
  })
  it('covers selfing at both generation bounds', () => {
    expect(
      selfingReport({
        generations: '0',
        selection: 'dominant',
      }).distributions[0].rows.map((x) => x.value),
    ).toEqual([0, 1, 0])
    expect(
      selfingReport({ generations: '20', selection: 'none' }).distributions[0]
        .rows[1].value,
    ).toBe(2 ** -20)
    const selected = selfingReport({ generations: '20', selection: 'dominant' })
    expect(selected.table!.rows).toHaveLength(21)
    expect(selected.distributions[0].rows[2].value).toBe(0)
    expect(() =>
      selfingReport({ generations: '21', selection: 'none' }),
    ).toThrow()
  })
  it('covers replication zero and first round explicitly', () => {
    const zero = dnaReport({ pairs: '1000', gc: '40', rounds: '0' })
    expect(value(zero, 'DNA 分子数')).toBe('1')
    expect(value(zero, '累计新合成核苷酸')).toBe('0')
    expect(value(zero, '最后一轮消耗核苷酸')).toBe('0')
    const first = dnaReport({ pairs: '1000', gc: '40', rounds: '1' })
    expect(value(first, '含原始链的分子数')).toBe('2')
    expect(value(first, '全新链分子数')).toBe('0')
    expect(value(first, '累计新合成核苷酸')).toBe('2000')
    expect(value(first, '原始链占全部链的比例')).toBe('50%')
  })
  it('lists every division stage at 2n=46', () => {
    expect(
      divisionReport({ diploid: '46', division: 'mitosis' }).table!.rows.map(
        (r) => r.slice(1),
      ),
    ).toEqual([
      ['46', '46', '0'],
      ['46', '92', '92'],
      ['92', '92', '0'],
      ['46', '46', '0'],
    ])
    expect(
      divisionReport({ diploid: '46', division: 'meiosis' }).table!.rows.map(
        (r) => r.slice(1),
      ),
    ).toEqual([
      ['46', '46', '0'],
      ['46', '92', '92'],
      ['46', '92', '92'],
      ['23', '46', '46'],
      ['23', '46', '46'],
      ['46', '46', '0'],
      ['23', '23', '0'],
    ])
    expect(() => divisionReport({ diploid: '46', division: '' })).toThrow()
  })
  it('handles 50 trials at both probability endpoints', () => {
    for (const p of ['0', '100']) {
      const r = probabilityReport({
        probability: p,
        births: '50',
        affected: p === '0' ? '0' : '50',
      })
      expect(value(r, '恰好 k 次')).toBe('100%')
      expect(r.distributions[0].rows).toHaveLength(51)
      expect(
        r.distributions[0].rows.reduce((sum, row) => sum + row.value, 0),
      ).toBe(1)
    }
    expect(() =>
      probabilityReport({ probability: '101', births: '50', affected: '0' }),
    ).toThrow()
    expect(() => populationReport({ AA: '-1', Aa: '0', aa: '1' })).toThrow()
  })
  it('selfs each genotype across generations, selecting after every reproduction', () => {
    expect(
      selfingReport({
        generations: '3',
        selection: 'none',
      }).distributions[0].rows.map((x) => x.value),
    ).toEqual([7 / 16, 1 / 8, 7 / 16])
    selfingReport({
      generations: '2',
      selection: 'dominant',
    }).distributions[0].rows.forEach((x, i) =>
      expect(x.value).toBeCloseTo([0.6, 0.4, 0][i], 12),
    )
    expect(
      selfingReport({ generations: '0', selection: 'none' }).table?.rows,
    ).toHaveLength(1)
  })
  it('separates observed population from theoretical equilibrium', () => {
    const r = populationReport({ AA: '36', Aa: '48', aa: '16' })
    expect(value(r, 'A 等位基因频率 p')).toBe('60%')
    const h = populationReport({ AA: '0', Aa: '100', aa: '0' })
    expect(h.distributions.map((x) => x.rows[1].value)).toEqual([1, 0.5])
  })
  it('counts DNA and semiconservative replication', () => {
    const r = dnaReport({ pairs: '1000', gc: '40', rounds: '3' })
    for (const [k, v] of Object.entries({
      'A = T': '600',
      'G = C': '400',
      氢键数: '2400',
      'DNA 分子数': '8',
      含原始链的分子数: '2',
      全新链分子数: '6',
      累计新合成核苷酸: '14000',
    }))
      expect(value(r, k)).toBe(v)
    expect(
      value(
        dnaReport({ pairs: '1', gc: '0', rounds: '0' }),
        '含原始链的分子数',
      ),
    ).toBe('1')
    expect(
      value(
        dnaReport({ pairs: '1000000', gc: '100', rounds: '30' }),
        '累计新合成核苷酸',
      ),
    ).toBe('2147483646000000')
  })
  it('counts whole cells at meiosis stages', () => {
    const rows = divisionReport({ diploid: '46', division: 'meiosis' }).table!
      .rows
    expect(rows).toContainEqual(['减数Ⅰ分裂后子细胞', '23', '46', '46'])
    expect(rows).toContainEqual(['减数Ⅱ后期', '46', '46', '0'])
    expect(rows).toContainEqual(['配子', '23', '23', '0'])
    expect(
      divisionReport({ diploid: '46', division: 'mitosis' }).table!.rows,
    ).toContainEqual(['有丝分裂后期', '92', '92', '0'])
  })
  it('uses binomial probabilities including endpoints', () => {
    const r = probabilityReport({
      probability: '25',
      births: '2',
      affected: '1',
    })
    expect(value(r, '恰好 k 次')).toBe('37.5%')
    expect(value(r, '至少一次')).toBe('43.75%')
    for (const p of ['0', '100'])
      expect(
        probabilityReport({
          probability: p,
          births: '2',
          affected: '2',
        }).distributions[0].rows.reduce((a, b) => a + b.value, 0),
      ).toBe(1)
  })
  it('rejects empty, invalid and out of bounds inputs', () => {
    for (const run of [
      () => selfingReport({ generations: '1.5', selection: 'none' }),
      () => selfingReport({ generations: '1', selection: 'bad' }),
      () => populationReport({ AA: '', Aa: '1', aa: '0' }),
      () => populationReport({ AA: '0', Aa: '0', aa: '0' }),
      () => dnaReport({ pairs: '3', gc: '50', rounds: '2' }),
      () => dnaReport({ pairs: '1', gc: '0', rounds: '31' }),
      () => divisionReport({ diploid: '3', division: 'mitosis' }),
      () =>
        probabilityReport({ probability: 'NaN', births: '2', affected: '1' }),
      () =>
        probabilityReport({ probability: '50', births: '2', affected: '3' }),
    ])
      expect(run).toThrow()
  })
})
