import type { Fraction } from './types'

export function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b)
}

export function fraction(numerator: number, denominator: number): Fraction {
  if (denominator === 0) throw new Error('分母不能为 0')
  const divisor = gcd(numerator, denominator)
  const sign = denominator < 0 ? -1 : 1
  return {
    numerator: (sign * numerator) / divisor,
    denominator: (sign * denominator) / divisor,
  }
}

export function addFractions(a: Fraction, b: Fraction): Fraction {
  return fraction(
    a.numerator * b.denominator + b.numerator * a.denominator,
    a.denominator * b.denominator,
  )
}

export function multiplyFractions(a: Fraction, b: Fraction): Fraction {
  return fraction(a.numerator * b.numerator, a.denominator * b.denominator)
}

export function formatFraction(value: Fraction): string {
  return `${value.numerator}/${value.denominator}`
}

export function toPercent(value: Fraction): string {
  return `${Number(((value.numerator / value.denominator) * 100).toFixed(2))}%`
}
