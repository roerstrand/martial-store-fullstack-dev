import api from './api'

let captured

beforeEach(() => {
  captured = null
  api.defaults.adapter = async (config) => {
    captured = config
    return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
  }
})

describe('api client', () => {
  it('targets the configured api url', async () => {
    await api.get('/products')
    expect(captured.baseURL).toBe('http://api.test/api/')
  })

  it('sends cookies with every request', async () => {
    await api.get('/products')
    expect(captured.withCredentials).toBe(true)
  })

  it('sends the csrf header with every request', async () => {
    await api.post('/carts')
    expect(captured.headers['X-Requested-With']).toBe('XMLHttpRequest')
  })

  it('never sends a bearer token, even if a legacy one is stored', async () => {
    localStorage.setItem('token', 'legacy-token')
    await api.get('/users/current')
    expect(captured.headers.Authorization).toBeUndefined()
  })
})
