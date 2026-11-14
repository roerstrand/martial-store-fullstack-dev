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
  afterEach(() => {
    vi.restoreAllMocks()
  })

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

  it('never touches localStorage for the session', async () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem')
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    const removeItem = vi.spyOn(Storage.prototype, 'removeItem')
    getCurrentUser.mockResolvedValue({ name: 'ninja' })
    logout.mockResolvedValue()

    renderAuth()
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('ninja'))
    await userEvent.click(screen.getByText('do-logout'))
    await userEvent.click(screen.getByText('do-login'))

    expect(getItem).not.toHaveBeenCalled()
    expect(setItem).not.toHaveBeenCalled()
    expect(removeItem).not.toHaveBeenCalled()
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

  it('keeps the user until the server has cleared the session cookie', async () => {
    getCurrentUser.mockResolvedValue({ name: 'ninja' })
    let finishLogout
    logout.mockReturnValue(new Promise((resolve) => { finishLogout = resolve }))
    renderAuth()
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('ninja'))

    await userEvent.click(screen.getByText('do-logout'))

    expect(screen.getByTestId('user')).toHaveTextContent('ninja')

    finishLogout()

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('none'))
  })
})
