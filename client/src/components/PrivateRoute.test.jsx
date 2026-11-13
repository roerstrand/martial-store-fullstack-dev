import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import { AuthProvider } from '../context/AuthContext'
import { getCurrentUser } from '../services/authService'

vi.mock('../services/authService', () => ({
  getCurrentUser: vi.fn(),
  logout: vi.fn(),
}))

const renderAt = (path) =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<p>Login page</p>} />
          <Route element={<PrivateRoute />}>
            <Route path="/my-pages" element={<p>Secret page</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )

describe('PrivateRoute', () => {
  it('renders the page when the cookie session is valid', async () => {
    getCurrentUser.mockResolvedValue({ name: 'ninja' })

    renderAt('/my-pages')

    expect(await screen.findByText('Secret page')).toBeInTheDocument()
  })

  it('does not redirect while the session is still being checked', () => {
    getCurrentUser.mockReturnValue(new Promise(() => {}))

    renderAt('/my-pages')

    expect(screen.queryByText('Login page')).not.toBeInTheDocument()
    expect(screen.queryByText('Secret page')).not.toBeInTheDocument()
  })

  it('redirects to login without a session', async () => {
    getCurrentUser.mockRejectedValue({ response: { status: 401 } })

    renderAt('/my-pages')

    expect(await screen.findByText('Login page')).toBeInTheDocument()
  })
})
