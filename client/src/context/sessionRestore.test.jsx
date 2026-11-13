import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider } from './AuthContext'
import { CartProvider, useCart } from './CartContext'
import { FavoriteProvider, useFavorites } from './FavoriteContext'
import { getCurrentUser } from '../services/authService'
import { getCart } from '../services/cartService'
import { getMyFavorites } from '../services/favoriteService'

vi.mock('../services/authService', () => ({ getCurrentUser: vi.fn(), logout: vi.fn() }))
vi.mock('../services/cartService', () => ({
  getCart: vi.fn(),
  createCart: vi.fn(),
  addCartItem: vi.fn(),
  removeCartItem: vi.fn(),
  increaseQuantity: vi.fn(),
  decreaseQuantity: vi.fn(),
  resetCart: vi.fn(),
}))
vi.mock('../services/favoriteService', () => ({
  getMyFavorites: vi.fn(),
  addProductToFavorites: vi.fn(),
  removeProductFromFavorites: vi.fn(),
}))

function Probe() {
  const [cart] = useCart()
  const [, favorites, , , favoritesLoading] = useFavorites()
  return (
    <div>
      <span data-testid="cart">{cart.map((i) => i.product.title).join(',')}</span>
      <span data-testid="favorites">{favorites.map((f) => f.title).join(',')}</span>
      <span data-testid="favorites-loading">{String(favoritesLoading)}</span>
    </div>
  )
}

const renderAll = () =>
  render(
    <AuthProvider>
      <CartProvider>
        <FavoriteProvider>
          <Probe />
        </FavoriteProvider>
      </CartProvider>
    </AuthProvider>,
  )

describe('session restored from cookie', () => {
  beforeEach(() => {
    localStorage.setItem('cart', JSON.stringify([{ product: { _id: 'g', title: 'GuestItem' }, quantity: 1 }]))
    localStorage.setItem('favorites', JSON.stringify([{ _id: 'g', title: 'GuestFav' }]))
  })

  it('loads the server cart and favorites', async () => {
    getCurrentUser.mockResolvedValue({ id: 'u1', name: 'ninja' })
    getCart.mockResolvedValue({ _id: 'c1', products: [{ product_id: { _id: 'p1', title: 'Gi' }, size: 'A2', quantity: 1 }] })
    getMyFavorites.mockResolvedValue({ products: [{ _id: 'p2', title: 'Belt' }] })

    renderAll()

    await waitFor(() => expect(screen.getByTestId('cart')).toHaveTextContent('Gi'))
    await waitFor(() => expect(screen.getByTestId('favorites')).toHaveTextContent('Belt'))
    expect(getCart).toHaveBeenCalledTimes(1)
  })

  it('keeps favorites loading until the session check is done', () => {
    getCurrentUser.mockReturnValue(new Promise(() => {}))

    renderAll()

    expect(screen.getByTestId('favorites-loading')).toHaveTextContent('true')
    expect(getCart).not.toHaveBeenCalled()
  })

  it('falls back to the guest cart and favorites without a session', async () => {
    getCurrentUser.mockRejectedValue({ response: { status: 401 } })

    renderAll()

    await waitFor(() => expect(screen.getByTestId('cart')).toHaveTextContent('GuestItem'))
    expect(screen.getByTestId('favorites')).toHaveTextContent('GuestFav')
    expect(getCart).not.toHaveBeenCalled()
  })
})
