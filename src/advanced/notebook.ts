import { TOPICS } from './catalog'
import type { Values } from './types'

export interface NotebookEntry {
  id: string
  name: string
  topicId: string
  values: Values
  createdAt: string
}
const KEY = 'genetics-topic-notebook-v1'

export function readNotebook(): NotebookEntry[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.filter((entry): entry is NotebookEntry => {
      if (!entry || typeof entry !== 'object' || typeof entry.id !== 'string' || typeof entry.name !== 'string' || typeof entry.createdAt !== 'string') return false
      const topic = TOPICS.find(t => t.id === entry.topicId)
      if (!topic || !entry.values || typeof entry.values !== 'object' || Array.isArray(entry.values)) return false
      if (!Object.values(entry.values).every(v => typeof v === 'string')) return false
      if (!Object.keys(topic.defaults).every(key => typeof entry.values[key] === 'string')) return false
      try { topic.calculate(entry.values); return true } catch { return false }
    }).slice(0, 30)
  } catch { return [] }
}

export function writeNotebook(entries: NotebookEntry[]): void {
  try { localStorage.setItem(KEY, JSON.stringify(entries.slice(0, 30))) }
  catch { throw new Error('本机存储不可用，未能保存更改。请复制结果保留。') }
}
