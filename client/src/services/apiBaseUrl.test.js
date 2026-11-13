import { resolveApiBaseUrl } from './apiBaseUrl'

describe('resolveApiBaseUrl', () => {
  it('uses the same-origin /api proxy in production so the session cookie is first-party', () => {
    expect(resolveApiBaseUrl({ PROD: true, VITE_API_URL: 'https://api.example.com/api' })).toBe('/api')
  })

  it('uses VITE_API_URL outside production', () => {
    expect(resolveApiBaseUrl({ PROD: false, VITE_API_URL: 'http://localhost:3000/api' })).toBe('http://localhost:3000/api')
  })

  it('falls back to the same-origin proxy when VITE_API_URL is missing', () => {
    expect(resolveApiBaseUrl({ PROD: false })).toBe('/api')
  })
})
