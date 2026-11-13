import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from './AuthContext'
import AuthProbe from '../test/AuthProbe'
import { getCurrentUser, logout } from '../services/authService'

vi.mock('../services/authService', () => ({
  getCurrentUser: vi.fn(),
  logout: vi.fn(),
}))

const renderAuth = () =>
  render(
    <AuthProvider>
      <AuthProbe />
    </AuthProvider>,
  )

describe('AuthProvider', () => {
  it('restores the session from the cookie without anything in localStorage', async () => {
    getCurrentUser.mockResolvedValue({ name: 'ninja' })

    renderAuth()

    expect(screen.getByTestId('initializing')).toHaveTextContent('true')
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('ninja'))
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    expect(screen.getByTestId('initializing')).toHaveTextContent('false')
  })

  it('stays logged out when there is no valid cookie', async () => {
    getCurrentUser.mockRejectedValue({ response: { status: 401 } })

    renderAuth()

    await waitFor(() => expect(screen.getByTestId('initializing')).toHaveTextContent('false'))
    expect(screen.getByTestId('user')).toHaveTextContent('none')
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
  })

  it('removes a legacy token left in localStorage', async () => {
    localStorage.setItem('token', 'legacy')
    getCurrentUser.mockRejectedValue({ response: { status: 401 } })

    renderAuth()

    await waitFor(() => expect(screen.getByTestId('initializing')).toHaveTextContent('false'))
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('logs in with only the user', async () => {
    getCurrentUser.mockRejectedValue({ response: { status: 401 } })
    renderAuth()
    await waitFor(() => expect(screen.getByTestId('initializing')).toHaveTextContent('false'))

    await userEvent.click(screen.getByText('do-login'))

    expect(screen.getByTestId('user')).toHaveTextContent('fresh')
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
  })

  it('logs out through the service and clears the user', async () => {
    getCurrentUser.mockResolvedValue({ name: 'ninja' })
    logout.mockResolvedValue()
    renderAuth()
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('ninja'))

    await userEvent.click(screen.getByText('do-logout'))

    expect(logout).toHaveBeenCalled()
    expect(screen.getByTestId('user')).toHaveTextContent('none')
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
  })

  it('clears the user even if the logout request fails', async () => {
    getCurrentUser.mockResolvedValue({ name: 'ninja' })
    logout.mockRejectedValue(new Error('offline'))
    renderAuth()
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('ninja'))

    await userEvent.click(screen.getByText('do-logout'))

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('none'))
  })
})
