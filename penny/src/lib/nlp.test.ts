import { describe, it, expect } from 'vitest'
import { parseTransaction } from './nlp'

describe('parseTransaction', () => {
  it('"$6" → amount: 6, category: Other, confidence: 0.7', () => {
    const r = parseTransaction('$6')
    expect(r.amount).toBe(6)
    expect(r.category).toBe('Other')
    expect(r.emoji).toBe('➕')
    expect(r.confidence).toBe(0.7)
  })

  it('"6 dollars" → amount: 6', () => {
    expect(parseTransaction('6 dollars').amount).toBe(6)
  })

  it('"spent 6" → amount: 6', () => {
    expect(parseTransaction('spent 6').amount).toBe(6)
  })

  it('"bubble tea $6" → Drinks, 🧋, confidence: 0.9', () => {
    const r = parseTransaction('bubble tea $6')
    expect(r.amount).toBe(6)
    expect(r.category).toBe('Drinks')
    expect(r.emoji).toBe('🧋')
    expect(r.confidence).toBe(0.9)
  })

  it('"lunch $12" → Food, 🍟, confidence: 0.9', () => {
    const r = parseTransaction('lunch $12')
    expect(r.amount).toBe(12)
    expect(r.category).toBe('Food')
    expect(r.emoji).toBe('🍟')
    expect(r.confidence).toBe(0.9)
  })

  it('"sneakers $80" → Shopping, 👟, confidence: 0.9', () => {
    const r = parseTransaction('sneakers $80')
    expect(r.amount).toBe(80)
    expect(r.category).toBe('Shopping')
    expect(r.emoji).toBe('👟')
    expect(r.confidence).toBe(0.9)
  })

  it('"game $15" → Fun, 🎮, confidence: 0.9', () => {
    const r = parseTransaction('game $15')
    expect(r.amount).toBe(15)
    expect(r.category).toBe('Fun')
    expect(r.emoji).toBe('🎮')
    expect(r.confidence).toBe(0.9)
  })

  it('"xyz abc" → amount: null, confidence: 0', () => {
    const r = parseTransaction('xyz abc')
    expect(r.amount).toBeNull()
    expect(r.confidence).toBe(0)
  })

  it('is a pure function — same input always same output', () => {
    const input = 'coffee $4.50'
    expect(parseTransaction(input)).toEqual(parseTransaction(input))
    expect(parseTransaction(input).category).toBe('Drinks')
    expect(parseTransaction(input).amount).toBe(4.5)
  })
})
