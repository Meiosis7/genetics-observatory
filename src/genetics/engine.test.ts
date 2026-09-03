import { describe, expect, it } from 'vitest'
import {
  calculateCross,
  calculateRandomMating,
  generateGametes,
  parseGenotype,
  phenotypeKey,
} from './engine'

describe('Mendelian cross engine', () => {
  it('parses one or two valid loci', () => {
    expect(parseGenotype('AaBb')).toEqual([
      { symbol: 'A', alleles: ['A', 'a'] },
      { symbol: 'B', alleles: ['B', 'b'] },
    ])
    expect(parseGenotype('aa')).toEqual([{ symbol: 'A', alleles: ['a', 'a'] }])
  })

  it('rejects malformed and repeated loci', () => {
    expect(() => parseGenotype('Aab')).toThrow('基因型格式')
    expect(() => parseGenotype('AaAa')).toThrow('每个基因位点')
    expect(() => parseGenotype('Ab')).toThrow('同一位点')
  })

  it('generates equally likely gametes', () => {
    expect(generateGametes('Aa')).toEqual([
      { label: 'A', probability: { numerator: 1, denominator: 2 } },
      { label: 'a', probability: { numerator: 1, denominator: 2 } },
    ])
    expect(generateGametes('AaBb').map((gamete) => gamete.label)).toEqual(['AB', 'Ab', 'aB', 'ab'])
    expect(generateGametes('AAbb')).toEqual([
      { label: 'Ab', probability: { numerator: 1, denominator: 1 } },
    ])
  })

  it('converts genotypes to complete-dominance phenotype labels', () => {
    expect(phenotypeKey('AaBb')).toBe('A_B_')
    expect(phenotypeKey('Aabb')).toBe('A_bb')
    expect(phenotypeKey('aaBb')).toBe('aaB_')
    expect(phenotypeKey('aabb')).toBe('aabb')
  })

  it('calculates Aa × Aa as 1:2:1 and 3:1', () => {
    const result = calculateCross('Aa', 'Aa')
    expect(result.genotypeCounts).toEqual({ AA: 1, Aa: 2, aa: 1 })
    expect(result.phenotypeCounts).toEqual({ A_: 3, aa: 1 })
    expect(result.cells).toHaveLength(4)
  })

  it('calculates AaBb × AaBb as 9:3:3:1', () => {
    const result = calculateCross('AaBb', 'AaBb')
    expect(result.phenotypeCounts).toEqual({ A_B_: 9, A_bb: 3, aaB_: 3, aabb: 1 })
    expect(result.cells).toHaveLength(16)
    expect(result.phenotypeDistribution.map((item) => item.probability.numerator)).toEqual([9, 3, 3, 1])
  })

  it('rejects crosses with mismatched loci', () => {
    expect(() => calculateCross('Aa', 'Bb')).toThrow('相同的基因位点')
  })

  it('calculates random mating from allele frequencies', () => {
    expect(calculateRandomMating({ A: 0.6, a: 0.4 })).toEqual({
      genotypeFrequencies: { AA: 0.36, Aa: 0.48, aa: 0.16 },
      phenotypeFrequencies: { A_: 0.84, aa: 0.16 },
    })
  })
})
