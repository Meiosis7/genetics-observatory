import type { CrossResult } from '../genetics/types'
import type { Experiment, ExperimentRecord } from './types'

const STORAGE_KEY = 'genetics-observatory:history:v1'
const MAX_RECORDS = 12

export function loadHistory(): ExperimentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) as ExperimentRecord[] : []
  } catch {
    return []
  }
}

function recordId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `experiment-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function writeHistory(records: ExperimentRecord[]): ExperimentRecord[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {
    // Calculation remains available when browser storage is disabled.
  }
  return records
}

export function saveExperiment(experiment: Experiment, result: CrossResult): ExperimentRecord[] {
  const record: ExperimentRecord = {
    id: recordId(),
    createdAt: new Date().toISOString(),
    title: experiment.title,
    experiment,
    summary: result.summary,
  }
  return writeHistory([record, ...loadHistory()].slice(0, MAX_RECORDS))
}

export function deleteExperiment(id: string): ExperimentRecord[] {
  return writeHistory(loadHistory().filter((item) => item.id !== id))
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // No-op: a restricted browser may reject storage access.
  }
}
