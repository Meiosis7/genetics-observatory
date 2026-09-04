export type Values = Record<string, string>

export interface Report {
  summary: string
  metrics: { label: string; value: string; hint?: string }[]
  distributions: { title: string; rows: { label: string; value: number }[] }[]
  steps: string[]
  notes: string[]
  table?: { headers: string[]; rows: string[][] }
}

export interface Field {
  key: string
  label: string
  type?: 'number' | 'text'
  options?: { value: string; label: string }[]
  min?: number
  max?: number
  step?: number
  hint?: string
  when?: (values: Values) => boolean
}

export interface Topic {
  id: string
  title: string
  tag: string
  intro: string
  defaults: Values
  fields: Field[]
  calculate: (values: Values) => Report
  examples?: { label: string; values: Values }[]
}
