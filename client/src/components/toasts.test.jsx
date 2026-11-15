import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CartToast from './CartToast'
import FavoriteToast from './favorites/FavoriteToast'

const cartState = { toast: null }
const favState = { toast: null }

vi.mock('../context/CartContext', () => ({
  useCart: () => [[{ quantity: 2 }], null, null, null, null, null, null, cartState.toast],
}))
vi.mock('../context/FavoriteContext', () => ({
  useFavorites: () => [vi.fn(), [], favState.toast],
}))

const renderIn = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('CartToast', () => {
  it('keeps a polite live region in the page even before anything is added', () => {
    cartState.toast = null
    renderIn(<CartToast />)

    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('announces an added item through the live region', () => {
    cartState.toast = { title: 'BJJ Gi' }
    renderIn(<CartToast />)

    expect(screen.getByRole('status')).toHaveTextContent('Added to cart')
  })

  it('announces a failure assertively', () => {
    cartState.toast = { title: 'Could not add item', error: true }
    renderIn(<CartToast />)

    expect(screen.getByRole('alert')).toHaveTextContent('Could not add item')
  })
})

describe('FavoriteToast', () => {
  it('keeps a polite live region in the page before anything is added', () => {
    favState.toast = null
    renderIn(<FavoriteToast />)

    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('announces an added favorite through the live region', () => {
    favState.toast = { title: 'BJJ Gi' }
    renderIn(<FavoriteToast />)

    expect(screen.getByRole('status')).toHaveTextContent('Added to favorites')
  })
})
