import { render, screen, within, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HomePage from './HomePage'

const products = Array.from({ length: 8 }, (_, i) => ({
  _id: `p${i}`, title: `Product ${i}`, price: 10 + i, rating: 4, image: 'x.jpg', category: 'bjj',
}))

vi.mock('../services/productService', () => ({
  getProducts: vi.fn(() => Promise.resolve(products)),
  getNewArrivals: vi.fn(() => Promise.resolve([])),
  getLimitedSale: vi.fn(() => Promise.resolve([])),
}))
vi.mock('../services/articleService', () => ({ getArticles: vi.fn(() => Promise.resolve([])) }))
vi.mock('../context/FavoriteContext', () => ({ useFavorites: () => [vi.fn(), []] }))
vi.mock('../context/CartContext', () => ({ useCart: () => [[], vi.fn()] }))
vi.mock('../hooks/useRecentlyViewed', () => ({ useRecentlyViewed: () => ({ items: [] }) }))

const mockReducedMotion = (matches) => {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: query.includes('prefers-reduced-motion') ? matches : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
}

const renderHome = () => render(<MemoryRouter><HomePage /></MemoryRouter>)

describe('HomePage carousel', () => {
  it('pauses the slideshow while keyboard focus is inside the cards', async () => {
    mockReducedMotion(false)
    renderHome()

    const toggle = await screen.findByRole('button', { name: 'Pause slideshow' })
    const carousel = toggle.closest('section')
    const addButton = within(carousel).getAllByRole('button', { name: /^Add to cart/ })[0]
    act(() => addButton.focus())

    expect(screen.getByRole('button', { name: 'Play slideshow' })).toBeInTheDocument()
  })

  it('does not start sliding when the user prefers reduced motion', async () => {
    mockReducedMotion(true)
    renderHome()

    expect(await screen.findByRole('button', { name: 'Play slideshow' })).toBeInTheDocument()
  })
})
