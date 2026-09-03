import { describe, expect, it } from 'vitest'
import {
  addFractions,
  formatFraction,
  fraction,
  multiplyFractions,
  toPercent,
} from './fraction'

describe('fraction', () => {
  it('reduces exact values', () => {
    expect(fraction(8, 16)).toEqual({ numerator: 1, denominator: 2 })
    expect(fraction(-2, -4)).toEqual({ numerator: 1, denominator: 2 })
  })

  it('adds and multiplies exact probabilities', () => {
    expect(addFractions(fraction(1, 4), fraction(1, 4))).toEqual(fraction(1, 2))
    expect(multiplyFractions(fraction(1, 2), fraction(1, 2))).toEqual(fraction(1, 4))
  })

  it('formats fractions and percentages for students', () => {
    expect(formatFraction(fraction(9, 16))).toBe('9/16')
    expect(toPercent(fraction(1, 16))).toBe('6.25%')
    expect(toPercent(fraction(1, 3))).toBe('33.33%')
  })

  it('rejects a zero denominator', () => {
    expect(() => fraction(1, 0)).toThrow('分母不能为 0')
  })
})
