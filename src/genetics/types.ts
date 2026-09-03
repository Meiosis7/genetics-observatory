export interface Fraction {
  numerator: number
  denominator: number
}

export interface AllelePair {
  symbol: string
  alleles: [string, string]
}

export interface Gamete {
  label: string
  probability: Fraction
}

export interface OffspringCell {
  maternalGamete: string
  paternalGamete: string
  genotype: string
  phenotype: string
  probability: Fraction
}

export interface DistributionItem {
  label: string
  count: number
  probability: Fraction
}

export interface CrossResult {
  parentA: string
  parentB: string
  loci: string[]
  maternalGametes: Gamete[]
  paternalGametes: Gamete[]
  cells: OffspringCell[]
  genotypeCounts: Record<string, number>
  phenotypeCounts: Record<string, number>
  genotypeDistribution: DistributionItem[]
  phenotypeDistribution: DistributionItem[]
  totalCells: number
  summary: string
}

export interface PopulationResult {
  genotypeFrequencies: Record<string, number>
  phenotypeFrequencies: Record<string, number>
}
