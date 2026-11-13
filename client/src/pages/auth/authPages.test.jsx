import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage'
import { AuthProvider } from '../../context/AuthContext'
import AuthProbe from '../../test/AuthProbe'
import { getCurrentUser, login, register } from '../../services/authService'

vi.mock('../../services/authService', () => ({
  getCurrentUser: vi.fn(),
  logout: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}))

const renderAt = (entry) =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[entry]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<><p>Home page</p><AuthProbe /></>} />
          <Route path="/my-pages" element={<><p>My pages</p><AuthProbe /></>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )

beforeEach(() => {
  getCurrentUser.mockRejectedValue({ response: { status: 401 } })
})

describe('LoginPage', () => {
  const submit = async (username = 'ninja', password = 'secret') => {
    await userEvent.type(screen.getByPlaceholderText('Username'), username)
    await userEvent.type(screen.getByPlaceholderText('Password'), password)
    await userEvent.click(screen.getByRole('button', { name: /login/i }))
  }

  it('logs in and returns to the home page', async () => {
    login.mockResolvedValue({ user: { name: 'ninja' } })
    renderAt('/login')

    await submit()

    expect(login).toHaveBeenCalledWith({ username: 'ninja', password: 'secret' })
    expect(await screen.findByText('Home page')).toBeInTheDocument()
    expect(screen.getByTestId('user')).toHaveTextContent('ninja')
  })

  it('returns to the page the user came from', async () => {
    login.mockResolvedValue({ user: { name: 'ninja' } })
    renderAt({ pathname: '/login', state: { from: { pathname: '/my-pages' } } })

    await submit()

    expect(await screen.findByText('My pages')).toBeInTheDocument()
  })

  it('shows the server error message', async () => {
    login.mockRejectedValue({ response: { status: 401, data: { message: 'Invalid credentials' } } })
    renderAt('/login')

    await submit()

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument()
  })

  it('explains when the server is unreachable', async () => {
    login.mockRejectedValue(new Error('Network Error'))
    renderAt('/login')

    await submit()

    expect(await screen.findByText(/Cannot connect to server/)).toBeInTheDocument()
  })
})

describe('RegisterPage', () => {
  const fill = async ({ name = 'ninja', email = 'ninja@test.com', password = 'secret1', repeat = password } = {}) => {
    await userEvent.type(screen.getByPlaceholderText('Username'), name)
    await userEvent.type(screen.getByPlaceholderText('Email'), email)
    await userEvent.type(screen.getByPlaceholderText('Password'), password)
    await userEvent.type(screen.getByPlaceholderText('Repeat Password'), repeat)
    await userEvent.click(screen.getByRole('button', { name: /register/i }))
  }

  it('registers and goes to login', async () => {
    register.mockResolvedValue({})
    renderAt('/register')

    await fill()

    expect(register).toHaveBeenCalledWith({ name: 'ninja', email: 'ninja@test.com', password: 'secret1' })
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument())
  })

  it.each([
    [{ email: 'ninja@test.c' }, /valid email/],
    [{ repeat: 'different' }, /do not match/],
    [{ password: 'short' }, /at least 6/],
  ])('validates %p before calling the api', async (input, message) => {
    renderAt('/register')

    await fill(input)

    expect(screen.getByText(message)).toBeInTheDocument()
    expect(register).not.toHaveBeenCalled()
  })

  it('shows the server error message', async () => {
    register.mockRejectedValue({ response: { data: { message: 'Username already taken' } } })
    renderAt('/register')

    await fill()

    expect(await screen.findByText('Username already taken')).toBeInTheDocument()
  })
})
