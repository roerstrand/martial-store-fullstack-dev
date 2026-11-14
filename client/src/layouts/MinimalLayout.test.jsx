import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import MinimalLayout from './MinimalLayout'

vi.mock('../context/CartContext', () => ({
  useCart: () => [[{ product: { _id: 'p1', price: 10 }, quantity: 2, size: 'M' }]],
}))
vi.mock('../context/FavoriteContext', () => ({ useFavorites: () => [vi.fn(), [{ _id: 'p1' }]] }))
vi.mock('../context/AuthContext', () => ({ useAuth: () => [null, false, vi.fn(), vi.fn()] }))

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<MinimalLayout />}>
          <Route path="/products" element={<p>Catalog</p>} />
          <Route path="/products/:productId" element={<p>Product</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )

describe('MinimalLayout', () => {
  it.each(['/products', '/products/p1'])('does not pin a cart bar on %s', (path) => {
    renderAt(path)

    expect(screen.queryByRole('link', { name: /View Cart/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Checkout/ })).not.toBeInTheDocument()
  })
})
