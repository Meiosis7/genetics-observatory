import { fraction, formatFraction, toPercent } from './fraction'
import type {
  AllelePair,
  CrossResult,
  DistributionItem,
  Gamete,
  OffspringCell,
  PopulationResult,
} from './types'

function canonicalPair(left: string, right: string): string {
  return [left, right].sort((a, b) => {
    if (a === a.toUpperCase() && b === b.toLowerCase()) return -1
    if (a === a.toLowerCase() && b === b.toUpperCase()) return 1
    return a.localeCompare(b)
  }).join('')
}

export function parseGenotype(input: string): AllelePair[] {
  const genotype = input.trim()
  if (!/^(?:[A-Z][a-z]|[A-Z]{2}|[a-z]{2}){1,2}$/.test(genotype)) {
    throw new Error('基因型格式无效，请输入 Aa 或 AaBb 这样的形式')
  }

  const pairs = genotype.match(/../g) ?? []
  const loci = pairs.map((pair) => pair[0].toUpperCase())

  if (pairs.some((pair) => pair[0].toUpperCase() !== pair[1].toUpperCase())) {
    throw new Error('同一位点必须使用相同字母，例如 Aa')
  }

  if (new Set(loci).size !== loci.length) {
    throw new Error('每个基因位点只能出现一次')
  }

  return pairs.map((pair) => ({
    symbol: pair[0].toUpperCase(),
    alleles: [pair[0], pair[1]],
  }))
}

export function generateGametes(genotype: string): Gamete[] {
  const pairs = parseGenotype(genotype)
  const labels = pairs.reduce<string[]>((prefixes, pair) => {
    const alleles = [...new Set(pair.alleles)]
    return prefixes.flatMap((prefix) => alleles.map((allele) => `${prefix}${allele}`))
  }, [''])

  return labels.map((label) => ({
    label,
    probability: fraction(1, labels.length),
  }))
}

export function phenotypeKey(genotype: string): string {
  return parseGenotype(genotype)
    .map((pair) => pair.alleles.some((allele) => allele === allele.toUpperCase())
      ? `${pair.symbol}_`
      : pair.symbol.toLowerCase().repeat(2))
    .join('')
}

function combineCell(maternalGamete: Gamete, paternalGamete: Gamete): OffspringCell {
  const genotype = [...maternalGamete.label]
    .map((allele, index) => canonicalPair(allele, paternalGamete.label[index]))
    .join('')

  return {
    maternalGamete: maternalGamete.label,
    paternalGamete: paternalGamete.label,
    genotype,
    phenotype: phenotypeKey(genotype),
    probability: fraction(
      maternalGamete.probability.numerator * paternalGamete.probability.numerator,
      maternalGamete.probability.denominator * paternalGamete.probability.denominator,
    ),
  }
}

function countBy(cells: OffspringCell[], key: 'genotype' | 'phenotype'): Record<string, number> {
  return cells.reduce<Record<string, number>>((counts, cell) => {
    counts[cell[key]] = (counts[cell[key]] ?? 0) + 1
    return counts
  }, {})
}

function toDistribution(counts: Record<string, number>, total: number): DistributionItem[] {
  return Object.entries(counts).map(([label, count]) => ({
    label,
    count,
    probability: fraction(count, total),
  }))
}

export function calculateCross(parentA: string, parentB: string): CrossResult {
  const parentALoci = parseGenotype(parentA).map((pair) => pair.symbol)
  const parentBLoci = parseGenotype(parentB).map((pair) => pair.symbol)

  if (parentALoci.join('') !== parentBLoci.join('')) {
    throw new Error('两个亲本必须包含相同的基因位点')
  }

  const maternalGametes = generateGametes(parentA)
  const paternalGametes = generateGametes(parentB)
  const cells = maternalGametes.flatMap((maternal) =>
    paternalGametes.map((paternal) => combineCell(maternal, paternal)))
  const genotypeCounts = countBy(cells, 'genotype')
  const phenotypeCounts = countBy(cells, 'phenotype')
  const genotypeDistribution = toDistribution(genotypeCounts, cells.length)
  const phenotypeDistribution = toDistribution(phenotypeCounts, cells.length)
  const summary = phenotypeDistribution
    .map((item) => `${item.label} 为 ${formatFraction(item.probability)}（${toPercent(item.probability)}）`)
    .join('，')

  return {
    parentA,
    parentB,
    loci: parentALoci,
    maternalGametes,
    paternalGametes,
    cells,
    genotypeCounts,
    phenotypeCounts,
    genotypeDistribution,
    phenotypeDistribution,
    totalCells: cells.length,
    summary,
  }
}

function rounded(value: number): number {
  return Number(value.toFixed(12))
}

export function calculateRandomMating(frequencies: Record<string, number>): PopulationResult {
  const loci = Object.keys(frequencies)
    .filter((allele) => allele.length === 1 && allele === allele.toUpperCase())
    .sort()

  if (loci.length === 0 || loci.length > 2) {
    throw new Error('自由交配支持一至两个基因位点')
  }

  const perLocus = loci.map((symbol) => {
    const recessive = symbol.toLowerCase()
    const p = frequencies[symbol]
    const q = frequencies[recessive]
    if (!Number.isFinite(p) || !Number.isFinite(q) || p < 0 || q < 0 || Math.abs(p + q - 1) > 1e-9) {
      throw new Error(`${symbol} 位点的等位基因频率之和必须为 1`)
    }
    return [
      { genotype: symbol.repeat(2), phenotype: `${symbol}_`, frequency: rounded(p * p) },
      { genotype: `${symbol}${recessive}`, phenotype: `${symbol}_`, frequency: rounded(2 * p * q) },
      { genotype: recessive.repeat(2), phenotype: recessive.repeat(2), frequency: rounded(q * q) },
    ]
  })

  const combinations = perLocus.reduce<Array<{ genotype: string; phenotype: string; frequency: number }>>(
    (items, locus) => items.flatMap((item) => locus.map((next) => ({
      genotype: `${item.genotype}${next.genotype}`,
      phenotype: `${item.phenotype}${next.phenotype}`,
      frequency: rounded(item.frequency * next.frequency),
    }))),
    [{ genotype: '', phenotype: '', frequency: 1 }],
  )

  const genotypeFrequencies: Record<string, number> = {}
  const phenotypeFrequencies: Record<string, number> = {}
  combinations.forEach((item) => {
    genotypeFrequencies[item.genotype] = rounded((genotypeFrequencies[item.genotype] ?? 0) + item.frequency)
    phenotypeFrequencies[item.phenotype] = rounded((phenotypeFrequencies[item.phenotype] ?? 0) + item.frequency)
  })

  return { genotypeFrequencies, phenotypeFrequencies }
}
