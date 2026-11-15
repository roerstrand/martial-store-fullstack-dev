import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const css = readFileSync(join(here, 'apex-glass.css'), 'utf8')
const rootBlock = css.slice(css.indexOf(':root'), css.indexOf('}', css.indexOf(':root')))

const token = (name) => {
  const match = rootBlock.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`))
  if (!match) throw new Error(`--${name} is missing or not a solid hex colour`)
  return match[1]
}

const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const lightSurfaces = ['ac-bone', 'ac-bone-2', 'ac-surface-white']
const darkSurfaces = ['ac-black', 'ac-ink']

describe('colour tokens meet WCAG 2.2 AA', () => {
  it.each(['ac-text', 'ac-text-2', 'ac-text-3', 'ac-red-text', 'ac-ok', 'ac-warn'])(
    '%s is readable as body text on every light surface',
    (fg) => {
      for (const bg of lightSurfaces) expect(contrast(token(fg), token(bg))).toBeGreaterThanOrEqual(4.5)
    },
  )

  it.each(['ac-on-dark', 'ac-red-on-dark', 'ac-ok-on-dark', 'ac-text-3-on-dark'])(
    '%s is readable as body text on every dark surface',
    (fg) => {
      for (const bg of darkSurfaces) expect(contrast(token(fg), token(bg))).toBeGreaterThanOrEqual(4.5)
    },
  )

  it('keeps white text readable on the red brand buttons', () => {
    expect(contrast('#ffffff', token('ac-red'))).toBeGreaterThanOrEqual(4.5)
    expect(contrast('#ffffff', token('ac-red-deep'))).toBeGreaterThanOrEqual(4.5)
  })

  it('makes rating stars and focus rings stand out from light and dark surfaces', () => {
    for (const bg of lightSurfaces) {
      expect(contrast(token('ac-star'), token(bg))).toBeGreaterThanOrEqual(3)
      expect(contrast(token('ac-focus'), token(bg))).toBeGreaterThanOrEqual(3)
    }
    for (const bg of darkSurfaces) {
      expect(contrast(token('ac-star-on-dark'), token(bg))).toBeGreaterThanOrEqual(3)
      expect(contrast(token('ac-focus-on-dark'), token(bg))).toBeGreaterThanOrEqual(3)
    }
  })
})
