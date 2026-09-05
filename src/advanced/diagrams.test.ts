import { expect, it } from 'vitest'
import { TOPICS } from './catalog'

it('provides one nonempty diagram for every derivation step and example', () => {
  for (const topic of TOPICS) for (const values of [topic.defaults, ...(topic.examples?.map(e => e.values) ?? [])]) {
    const report = topic.calculate(values)
    expect(report.diagrams?.length, topic.id).toBe(report.steps.length)
    report.diagrams?.forEach(d => { expect(d.title.length).toBeGreaterThan(0); expect(d.caption.length).toBeGreaterThan(0) })
  }
})
it('uses weighted linked gametes rather than counting squares', () => {
  const topic = TOPICS.find(t => t.id === 'linkage')!
  const diagrams = topic.calculate(topic.defaults).diagrams!
  const grid = diagrams.find(d => d.kind === 'cross')!
  expect(grid.kind).toBe('cross')
  if (grid.kind === 'cross') expect(grid.cells.map(c => c.probability)).toEqual([.4, .1, .1, .4])
})
it('marks lethal cells without confusing fertilization and survival probabilities', () => {
  const topic = TOPICS[0]
  const report = topic.calculate(topic.defaults)
  const grid = report.diagrams!.find(d => d.kind === 'cross' && d.cells.some(c => c.survival !== undefined))!
  if (grid.kind !== 'cross') throw new Error('missing lethal grid')
  expect(grid.cells.find(c => c.label === 'AA')?.survival).toBe(0)
  expect(grid.cells.reduce((s, c) => s + c.probability, 0)).toBe(1)
  const empty = topic.calculate({ ...topic.defaults, femaleDead: 'A,a' })
  expect(empty.diagrams).toHaveLength(empty.steps.length)
  expect(empty.diagrams!.some(d => d.kind === 'cross')).toBe(false)
})
it('keeps DNA zero and large rounds finite with bounded schematic rows', () => {
  const topic = TOPICS.find(t => t.id === 'dna')!
  for (const rounds of ['0', '1', '30']) {
    const d = topic.calculate({ ...topic.defaults, rounds }).diagrams!.find(d => d.kind === 'dna')!
    if (d.kind !== 'dna') throw new Error('missing DNA')
    expect(d.generations.length).toBeLessThanOrEqual(5)
    expect(d.generations.at(-1)?.total).toBe(2 ** Number(rounds))
    expect(d.generations.at(-1)?.original).toBe(rounds === '0' ? 1 : 0)
    expect(d.generations.at(-1)?.hybrid).toBe(rounds === '0' ? 0 : 2)
  }
})

it('makes each cross sum to one and match the numerical offspring distribution', () => {
  for (const id of ['blood', 'linkage', 'interaction']) {
    const topic = TOPICS.find(t => t.id === id)!
    const variants = id === 'linkage' ? ['0', '20', '50'].map(rA => ({ ...topic.defaults, rA })) : id === 'interaction' ? ['mendel', 'complementary', 'duplicate', 'recessive', 'dominant', 'suppressor', 'additive'].map(model => ({ ...topic.defaults, model })) : [topic.defaults, { mother: 'AA', father: 'OO' }]
    for (const values of variants) {
      const r = topic.calculate(values)
      const d = r.diagrams!.find(d => d.kind === 'cross')!
      if (d.kind !== 'cross') throw new Error('missing grid')
      const actual: Record<string, number> = {}
      d.cells.forEach(cell => { actual[cell.label] = (actual[cell.label] ?? 0) + cell.probability })
      expect(d.cells.reduce((sum, c) => sum + c.probability, 0)).toBeCloseTo(1, 12)
      const genotypes = r.distributions[id === 'linkage' ? 2 : 0].rows
      genotypes.forEach(row => expect(actual[row.label], `${id}:${row.label}`).toBeCloseTo(row.value, 12))
      expect(r.diagrams).toHaveLength(r.steps.length)
    }
  }
})
it('covers sex-linked models and exceptional teaching boundaries', () => {
  const cases: Record<string, Record<string, string>[]> = {
    sex: [{ model: 'y' }, { model: 'xd' }, { mother: 'aa', father: 'a' }],
    selfing: [{ generations: '0' }, { generations: '20', selection: 'dominant' }],
    division: [{ diploid: '2' }, { diploid: '200', division: 'mitosis' }],
    population: [{ AA: '0', Aa: '0', aa: '100' }],
    probability: [{ probability: '0', affected: '0' }, { probability: '100', births: '50', affected: '50' }],
    lethal: [{ penetrance: '50' }, { parentA: 'AA', parentB: 'AA' }],
    interaction: [{ model: 'incomplete', parentA: 'Aa', parentB: 'Aa' }, { model: 'codominance', parentA: 'AA', parentB: 'aa' }],
  }
  for (const [id, variants] of Object.entries(cases)) {
    const topic = TOPICS.find(t => t.id === id)!
    for (const variant of variants) {
      const report = topic.calculate({ ...topic.defaults, ...variant })
      expect(report.diagrams, `${id}:${JSON.stringify(variant)}`).toHaveLength(report.steps.length)
      expect(JSON.stringify(report.diagrams)).not.toMatch(/NaN|Infinity|undefined/)
    }
  }
})
