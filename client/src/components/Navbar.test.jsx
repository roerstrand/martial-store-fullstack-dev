import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Navbar from './Navbar'

const logout = vi.fn()

vi.mock('../context/AuthContext', () => ({
  useAuth: () => [{ name: 'ninja', role: 'user' }, true, vi.fn(), logout],
}))
vi.mock('../context/CartContext', () => ({ useCart: () => [[]] }))
vi.mock('../context/FavoriteContext', () => ({ useFavorites: () => [vi.fn(), []] }))

const renderNavbar = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Navbar variant="light" />} />
        <Route path="/login" element={<p>Login page</p>} />
      </Routes>
    </MemoryRouter>,
  )

describe('Navbar logout', () => {
  it('waits for the server logout to finish before leaving the page', async () => {
    let finishLogout
    logout.mockReturnValue(new Promise((resolve) => { finishLogout = resolve }))

    renderNavbar()
    fireEvent.click(screen.getByRole('button', { name: 'Log out' }))

    expect(logout).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('Login page')).not.toBeInTheDocument()

    await act(async () => { finishLogout() })

    expect(await screen.findByText('Login page')).toBeInTheDocument()
  })
})
