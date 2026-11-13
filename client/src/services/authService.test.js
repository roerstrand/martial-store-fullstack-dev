import api from './api'
import {
  register,
  login,
  logout,
  getCurrentUser,
  changePassword,
  updateProfile,
} from './authService'

vi.mock('./api', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

describe('authService', () => {
  it('logs in without storing anything in localStorage', async () => {
    api.post.mockResolvedValue({ data: { user: { name: 'ninja' } } })

    const data = await login({ username: 'ninja', password: 'pw' })

    expect(api.post).toHaveBeenCalledWith('users/login', { username: 'ninja', password: 'pw' })
    expect(data).toEqual({ user: { name: 'ninja' } })
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('logs out through the api so the server clears the cookie', async () => {
    api.post.mockResolvedValue({ data: { message: 'Logged out' } })

    await logout()

    expect(api.post).toHaveBeenCalledWith('users/logout')
  })

  it('registers a user', async () => {
    api.post.mockResolvedValue({ data: { name: 'ninja' } })
    expect(await register({ name: 'ninja' })).toEqual({ name: 'ninja' })
    expect(api.post).toHaveBeenCalledWith('users/register', { name: 'ninja' })
  })

  it('fetches the current user', async () => {
    api.get.mockResolvedValue({ data: { name: 'ninja' } })
    expect(await getCurrentUser()).toEqual({ name: 'ninja' })
    expect(api.get).toHaveBeenCalledWith('users/current')
  })

  it('changes password and profile', async () => {
    api.put.mockResolvedValue({ data: {} })

    await changePassword({ currentPassword: 'a', newPassword: 'b' })
    await updateProfile({ name: 'new' })

    expect(api.put).toHaveBeenCalledWith('users/password', { currentPassword: 'a', newPassword: 'b' })
    expect(api.put).toHaveBeenCalledWith('users/profile', { name: 'new' })
  })
})
