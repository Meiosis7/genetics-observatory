import { expect, it } from 'vitest'
import { bloodReport, pedigreeReport, sexLinkedReport } from './inheritance'
it('labels Y inheritance as trait expression, not disease risk', () => {
  expect(
    sexLinkedReport({ model: 'y', father: 'a' }).metrics.every((x) =>
      x.label.includes('性状表现概率'),
    ),
  ).toBe(true)
})
it('covers zero and certain conditional risks across all sex-linked models', () => {
  for (const model of ['xr', 'xd']) {
    const healthy =
      model === 'xr'
        ? { mother: 'AA', father: 'A' }
        : { mother: 'aa', father: 'a' }
    const affected =
      model === 'xr'
        ? { mother: 'aa', father: 'a' }
        : { mother: 'AA', father: 'A' }
    expect(
      sexLinkedReport({ model, ...healthy }).metrics.map((x) => x.value),
    ).toEqual(['0%', '0%', '0%'])
    expect(
      sexLinkedReport({ model, ...affected }).metrics.map((x) => x.value),
    ).toEqual(['100%', '100%', '100%'])
  }
  expect(
    sexLinkedReport({ model: 'y', father: 'A' }).metrics.map((x) => x.value),
  ).toEqual(['0%', '0%', '0%'])
})
it('rejects empty fields and invalid options in each inheritance calculator', () => {
  for (const run of [
    () => bloodReport({ mother: '', father: 'OO' }),
    () => bloodReport({ mother: 'OO', father: 'bad' }),
    () => sexLinkedReport({ model: '', mother: 'AA', father: 'A' }),
    () => sexLinkedReport({ model: 'y', father: '' }),
    () => sexLinkedReport({ model: 'xd', mother: '', father: 'A' }),
    () =>
      pedigreeReport({
        mother: 'healthy',
        father: '',
        childSex: 'female',
        child: 'healthy',
      }),
    () =>
      pedigreeReport({
        mother: 'healthy',
        father: 'healthy',
        childSex: '',
        child: 'healthy',
      }),
    () =>
      pedigreeReport({
        mother: 'healthy',
        father: 'healthy',
        childSex: 'male',
        child: '',
      }),
  ])
    expect(run).toThrow()
})
it('computes ABO genotype and phenotype crosses', () => {
  expect(
    bloodReport({ mother: 'AO', father: 'BO' }).distributions[1].rows.map(
      (x) => x.value,
    ),
  ).toEqual([0.25, 0.25, 0.25, 0.25])
  expect(
    bloodReport({ mother: 'AB', father: 'OO' }).distributions[1].rows.map(
      (x) => x.value,
    ),
  ).toEqual([0.5, 0.5, 0, 0])
  expect(() => bloodReport({ mother: 'A', father: 'OO' })).toThrow()
})
it('distinguishes sex conditional risk from total and XR carriers', () => {
  const r = sexLinkedReport({ model: 'xr', mother: 'Aa', father: 'A' })
  expect(r.metrics.map((x) => x.value)).toEqual(['25%', '0%', '50%'])
  expect(r.distributions[0].rows.some((x) => x.label.includes('携带者'))).toBe(
    true,
  )
  expect(
    sexLinkedReport({ model: 'xd', mother: 'aa', father: 'A' }).metrics.map(
      (x) => x.value,
    ),
  ).toEqual(['50%', '100%', '0%'])
  expect(
    sexLinkedReport({ model: 'y', father: 'a' }).metrics.map((x) => x.value),
  ).toEqual(['50%', '0%', '100%'])
  expect(() =>
    sexLinkedReport({ model: 'xr', mother: 'bad', father: 'A' }),
  ).toThrow()
})
it('screens candidate pedigree models without assigning relative probabilities', () => {
  const candidates = (
    mother: string,
    father: string,
    childSex: string,
    child: string,
  ) =>
    pedigreeReport({ mother, father, childSex, child }).table!.rows.map(
      (x) => x[0],
    )
  expect(candidates('healthy', 'healthy', 'female', 'affected')).toEqual(['AR'])
  expect(candidates('healthy', 'healthy', 'male', 'affected')).toEqual([
    'AR',
    'XR',
  ])
  expect(candidates('healthy', 'affected', 'male', 'healthy')).not.toContain(
    'Y',
  )
  expect(candidates('healthy', 'healthy', 'male', 'healthy')).toEqual([
    'AR',
    'AD',
    'XR',
    'XD',
    'Y',
  ])
  expect(() =>
    pedigreeReport({
      mother: 'bad',
      father: 'healthy',
      childSex: 'male',
      child: 'healthy',
    }),
  ).toThrow()
})
