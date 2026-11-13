import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider } from './AuthContext'
import { FavoriteProvider, useFavorites } from './FavoriteContext'
import { getCurrentUser } from '../services/authService'
import * as favoriteApi from '../services/favoriteService'

vi.mock('../services/authService', () => ({ getCurrentUser: vi.fn(), logout: vi.fn() }))
vi.mock('../services/favoriteService', () => ({
  getMyFavorites: vi.fn(),
  addProductToFavorites: vi.fn(),
  removeProductFromFavorites: vi.fn(),
}))

const gi = { _id: 'p1', title: 'Gi' }
const belt = { _id: 'p2', title: 'Belt' }

let ctx

function Capture({ onValue }) {
  const value = useFavorites()
  onValue(value)
  const [, favorites, toast, , loading] = value
  return (
    <div>
      <span data-testid="favorites">{favorites.map((f) => f.title).join(',')}</span>
      <span data-testid="toast">{String(!!toast)}</span>
      <span data-testid="loading">{String(loading)}</span>
    </div>
  )
}

const toggle = (product) => act(() => ctx[0](product))
const clear = () => act(() => ctx[3]())
const favorites = () => screen.getByTestId('favorites').textContent

const renderFavorites = async () => {
  render(
    <AuthProvider>
      <FavoriteProvider>
        <Capture onValue={(value) => { ctx = value }} />
      </FavoriteProvider>
    </AuthProvider>,
  )
  await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
}

describe('FavoriteProvider as guest', () => {
  beforeEach(() => {
    getCurrentUser.mockRejectedValue({ response: { status: 401 } })
  })

  it('toggles favorites in localStorage and toasts on add', async () => {
    await renderFavorites()

    await toggle(gi)
    expect(favorites()).toBe('Gi')
    expect(screen.getByTestId('toast')).toHaveTextContent('true')
    expect(JSON.parse(localStorage.getItem('favorites'))).toEqual([gi])

    await toggle(gi)
    expect(favorites()).toBe('')
  })

  it('clears favorites', async () => {
    await renderFavorites()
    await toggle(gi)

    await clear()

    expect(favorites()).toBe('')
    expect(localStorage.getItem('favorites')).toBeNull()
    expect(favoriteApi.removeProductFromFavorites).not.toHaveBeenCalled()
  })
})

describe('FavoriteProvider when logged in', () => {
  beforeEach(() => {
    getCurrentUser.mockResolvedValue({ id: 'u1', name: 'ninja' })
    favoriteApi.getMyFavorites.mockResolvedValue({ products: [gi] })
    favoriteApi.addProductToFavorites.mockResolvedValue({})
    favoriteApi.removeProductFromFavorites.mockResolvedValue({})
  })

  it('drops guest favorites from localStorage', async () => {
    localStorage.setItem('favorites', JSON.stringify([belt]))

    await renderFavorites()

    expect(favorites()).toBe('Gi')
    expect(localStorage.getItem('favorites')).toBeNull()
  })

  it('adds and removes through the api', async () => {
    await renderFavorites()

    await toggle(belt)
    expect(favoriteApi.addProductToFavorites).toHaveBeenCalledWith('p2')
    expect(favorites()).toBe('Gi,Belt')

    await toggle(gi)
    expect(favoriteApi.removeProductFromFavorites).toHaveBeenCalledWith('p1')
    expect(favorites()).toBe('Belt')
  })

  it('keeps the optimistic update when the api fails', async () => {
    favoriteApi.addProductToFavorites.mockRejectedValue(new Error('down'))
    await renderFavorites()

    await toggle(belt)

    expect(favorites()).toBe('Gi,Belt')
  })

  it('removes every favorite on clear', async () => {
    favoriteApi.getMyFavorites.mockResolvedValue({ products: [gi, belt] })
    await renderFavorites()

    await clear()

    expect(favoriteApi.removeProductFromFavorites).toHaveBeenCalledWith('p1')
    expect(favoriteApi.removeProductFromFavorites).toHaveBeenCalledWith('p2')
    expect(favorites()).toBe('')
  })
})
