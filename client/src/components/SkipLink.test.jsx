import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import MinimalLayout from '../layouts/MinimalLayout'

vi.mock('../context/CartContext', () => ({ useCart: () => [[]] }))
vi.mock('../context/FavoriteContext', () => ({ useFavorites: () => [vi.fn(), []] }))
vi.mock('../context/AuthContext', () => ({ useAuth: () => [null, false, vi.fn(), vi.fn()] }))

const renderIn = (Layout) =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<p>Page body</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )

describe.each([['MainLayout', MainLayout], ['MinimalLayout', MinimalLayout]])('%s landmarks', (_, Layout) => {
  it('starts with a skip link to the main content', () => {
    renderIn(Layout)

    const skip = screen.getByRole('link', { name: 'Skip to main content' })
    expect(skip).toHaveAttribute('href', '#main')
    expect(document.body.querySelector('a, button, input')).toBe(skip)
  })

  it('has a focusable main landmark the skip link targets', () => {
    renderIn(Layout)

    const main = screen.getByRole('main')
    expect(main).toHaveAttribute('id', 'main')
    expect(main).toHaveAttribute('tabindex', '-1')
    expect(main).toHaveTextContent('Page body')
  })

  it('exposes the site header as a banner and the footer as contentinfo', () => {
    renderIn(Layout)

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})

describe('MainLayout hero', () => {
  it('keeps the hero inside a named region', () => {
    renderIn(MainLayout)

    expect(screen.getByRole('region', { name: /Fight\s*Gear/i })).toBeInTheDocument()
  })
})
