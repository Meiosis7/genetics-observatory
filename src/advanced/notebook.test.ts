import { beforeEach, expect, it, vi } from 'vitest'
import { readNotebook, writeNotebook } from './notebook'
import { TOPICS } from './catalog'

beforeEach(() => { localStorage.clear(); vi.restoreAllMocks() })
it('ignores corrupted or incompatible stored records', () => {
  localStorage.setItem('genetics-topic-notebook-v1', '{broken')
  expect(readNotebook()).toEqual([])
  localStorage.setItem('genetics-topic-notebook-v1', JSON.stringify([{ id: 'x', name: 'x', topicId: 'missing', values: {} }]))
  expect(readNotebook()).toEqual([])
})
it('round trips valid conditions and keeps only the newest 30 records', () => {
  const entries = Array.from({ length: 32 }, (_, i) => ({ id: String(i), name: `题 ${i}`, topicId: TOPICS[0].id, values: { ...TOPICS[0].defaults }, createdAt: new Date().toISOString() }))
  writeNotebook(entries)
  expect(readNotebook()).toEqual(entries.slice(0, 30))
})
it('reports storage failure instead of pretending to save', () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
  expect(() => writeNotebook([])).toThrow('本机存储不可用')
})
