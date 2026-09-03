export type ExperimentMode = 'cross' | 'self' | 'testcross' | 'backcross' | 'random'

export interface LocusDefinition {
  symbol: string
  trait: string
  dominantLabel: string
  recessiveLabel: string
}

export interface Experiment {
  id: string
  title: string
  mode: ExperimentMode
  locusCount: 1 | 2
  parentA: string
  parentB: string
  loci: LocusDefinition[]
  alleleFrequencies?: Record<string, number>
}

export interface ExperimentRecord {
  id: string
  createdAt: string
  title: string
  experiment: Experiment
  summary: string
}
