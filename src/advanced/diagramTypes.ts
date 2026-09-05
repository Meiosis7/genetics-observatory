export type DiagramTone = 'normal' | 'accent' | 'muted' | 'dead'
interface BaseDiagram { title: string; caption: string }
export interface DiagramItem { label: string; detail?: string; tone?: DiagramTone }
export interface CrossDiagram extends BaseDiagram {
  kind: 'cross'
  female: { label: string; value: number }[]
  male: { label: string; value: number }[]
  cells: { label: string; probability: number; survival?: number; note?: string }[]
}
export type TeachingDiagram =
  | CrossDiagram
  | (BaseDiagram & { kind: 'flow'; stages: { label: string; items: DiagramItem[] }[] })
  | (BaseDiagram & { kind: 'chart'; connect?: boolean; labels: string[]; series: { label: string; values: number[] }[]; unit: string })
  | (BaseDiagram & { kind: 'dna'; generations: { generation: number; total: number; original: number; hybrid: number; fresh: number }[] })
  | (BaseDiagram & { kind: 'bases'; at: number; gc: number; bonds: boolean })
  | (BaseDiagram & { kind: 'pedigree'; mother: boolean; father: boolean; child: boolean; sex: string })
  | (BaseDiagram & { kind: 'chromosomes'; stages: { label: string; chromosomes: number; dna: number; chromatids: number }[] })
