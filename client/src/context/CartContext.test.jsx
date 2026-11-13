import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider } from './AuthContext'
import { CartProvider, useCart } from './CartContext'
import { getCurrentUser } from '../services/authService'
import * as cartApi from '../services/cartService'

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

const gi = { _id: 'p1', title: 'Gi' }
const belt = { _id: 'p2', title: 'Belt' }

let ctx
const actions = {
  add: (...args) => ctx[1](...args),
  remove: (...args) => ctx[2](...args),
  clear: () => ctx[3](),
  increase: (id) => ctx[5](id),
  decrease: (id) => ctx[6](id),
  updateSize: (...args) => ctx[8](...args),
}

function Capture({ onValue }) {
  const value = useCart()
  onValue(value)
  const [cart, , , , , , , toast, , loading] = value
  return (
    <div>
      <span data-testid="items">{cart.map((i) => `${i.product.title}:${i.size ?? '-'}:${i.quantity}`).join('|')}</span>
      <span data-testid="toast">{toast ? `${toast.title}${toast.error ? '!' : ''}` : ''}</span>
      <span data-testid="loading">{String(loading)}</span>
    </div>
  )
}

const renderCart = async () => {
  render(
    <AuthProvider>
      <CartProvider>
        <Capture onValue={(value) => { ctx = value }} />
      </CartProvider>
    </AuthProvider>,
  )
  await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
}

const items = () => screen.getByTestId('items').textContent
const stored = () => JSON.parse(localStorage.getItem('cart') || '[]')

describe('CartProvider as guest', () => {
  beforeEach(() => {
    getCurrentUser.mockRejectedValue({ response: { status: 401 } })
  })

  it('adds items to localStorage and shows a toast', async () => {
    await renderCart()

    await act(() => actions.add(gi, 'A2'))

    expect(items()).toBe('Gi:A2:1')
    expect(stored()).toHaveLength(1)
    expect(screen.getByTestId('toast')).toHaveTextContent('Gi')
  })

  it('does not toast when silent', async () => {
    await renderCart()
    await act(() => actions.add(gi, 'A2', true))
    expect(screen.getByTestId('toast')).toBeEmptyDOMElement()
  })

  it('increments the same product and size and separates other sizes', async () => {
    await renderCart()

    await act(() => actions.add(gi, 'A2'))
    await act(() => actions.add(gi, 'A2'))
    await act(() => actions.add(gi, 'A3'))

    expect(items()).toBe('Gi:A2:2|Gi:A3:1')
  })

  it('increases, decreases and drops items at zero', async () => {
    await renderCart()
    await act(() => actions.add(belt))

    await act(() => actions.increase('p2'))
    expect(items()).toBe('Belt:-:2')

    await act(() => actions.decrease('p2'))
    await act(() => actions.decrease('p2'))
    expect(items()).toBe('')
    expect(stored()).toEqual([])
  })

  it('removes only the given size', async () => {
    await renderCart()
    await act(() => actions.add(gi, 'A2'))
    await act(() => actions.add(gi, 'A3'))

    await act(() => actions.remove('p1', 'A2'))

    expect(items()).toBe('Gi:A3:1')
  })

  it('changes the size of a line', async () => {
    await renderCart()
    await act(() => actions.add(gi, 'A2'))

    await act(() => actions.updateSize(gi, 'A2', 'A4'))

    expect(items()).toBe('Gi:A4:1')
  })

  it('clears the cart', async () => {
    await renderCart()
    await act(() => actions.add(gi, 'A2'))

    await act(() => actions.clear())

    expect(items()).toBe('')
    expect(localStorage.getItem('cart')).toBeNull()
    expect(cartApi.resetCart).not.toHaveBeenCalled()
  })
})

describe('CartProvider when logged in', () => {
  const serverCart = (products) => ({ _id: 'c1', products })
  const line = (product, size, quantity = 1) => ({ product_id: product, size, quantity })

  beforeEach(() => {
    getCurrentUser.mockResolvedValue({ id: 'u1', name: 'ninja' })
    cartApi.getCart.mockResolvedValue(serverCart([line(gi, 'A2')]))
  })

  it('creates a cart when the user has none', async () => {
    cartApi.getCart.mockRejectedValue({ response: { status: 404 } })
    cartApi.createCart.mockResolvedValue({ _id: 'new', products: [] })

    await renderCart()

    expect(cartApi.createCart).toHaveBeenCalled()
    expect(items()).toBe('')
  })

  it('adds through the api using the cart id', async () => {
    cartApi.addCartItem.mockResolvedValue(serverCart([line(gi, 'A2'), line(belt, undefined)]))
    await renderCart()

    await act(() => actions.add(belt))

    expect(cartApi.addCartItem).toHaveBeenCalledWith('c1', 'p2', undefined)
    expect(items()).toBe('Gi:A2:1|Belt:-:1')
  })

  it('shows an error toast when adding fails', async () => {
    cartApi.addCartItem.mockRejectedValue(new Error('down'))
    await renderCart()

    await act(() => actions.add(belt))

    expect(screen.getByTestId('toast')).toHaveTextContent('Failed to add item to cart!')
  })

  it('removes the line instead of decreasing below one', async () => {
    cartApi.removeCartItem.mockResolvedValue(serverCart([]))
    await renderCart()

    await act(() => actions.decrease('p1'))

    expect(cartApi.removeCartItem).toHaveBeenCalledWith('c1', 'p1')
    expect(cartApi.decreaseQuantity).not.toHaveBeenCalled()
    expect(items()).toBe('')
  })

  it('increases and decreases through the api', async () => {
    cartApi.getCart.mockResolvedValue(serverCart([line(gi, 'A2', 2)]))
    cartApi.increaseQuantity.mockResolvedValue(serverCart([line(gi, 'A2', 3)]))
    cartApi.decreaseQuantity.mockResolvedValue(serverCart([line(gi, 'A2', 2)]))
    await renderCart()

    await act(() => actions.increase('p1'))
    expect(items()).toBe('Gi:A2:3')

    await act(() => actions.decrease('p1'))
    expect(cartApi.decreaseQuantity).toHaveBeenCalledWith('c1', 'p1')
    expect(items()).toBe('Gi:A2:2')
  })

  it('changes size by removing and re-adding', async () => {
    cartApi.removeCartItem.mockResolvedValue(serverCart([]))
    cartApi.addCartItem.mockResolvedValue(serverCart([line(gi, 'A3')]))
    await renderCart()

    await act(() => actions.updateSize(gi, 'A2', 'A3'))

    expect(cartApi.removeCartItem).toHaveBeenCalledWith('c1', 'p1', 'A2')
    expect(cartApi.addCartItem).toHaveBeenCalledWith('c1', 'p1', 'A3')
    expect(items()).toBe('Gi:A3:1')
  })

  it('resets the server cart on clear', async () => {
    cartApi.resetCart.mockResolvedValue(serverCart([]))
    await renderCart()

    await act(() => actions.clear())

    expect(cartApi.resetCart).toHaveBeenCalledWith('c1')
    expect(items()).toBe('')
  })
})
