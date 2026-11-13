import { categoryLabel, salePriceOf } from './productFormat'

describe('categoryLabel', () => {
  it.each([
    ['bjj', 'BJJ'],
    ['boxing', 'Boxing'],
    ['muaythai', 'Muay Thai'],
    ['karate', 'Karate'],
  ])('maps %s to %s', (category, label) => {
    expect(categoryLabel(category)).toBe(label)
  })

  it('falls back to the raw value', () => {
    expect(categoryLabel('judo')).toBe('judo')
  })
})

describe('salePriceOf', () => {
  it('returns null without a sale', () => {
    expect(salePriceOf({ price: 1000, sale: 0 })).toBeNull()
  })

  it('applies the discount and rounds', () => {
    expect(salePriceOf({ price: 999, sale: 15 })).toBe(849)
  })
})
