import { renderHook, act, waitFor } from '@testing-library/react'
import useInput from './useInput'
import useFetch from './useFetch'
import { useRecentlyViewed } from './useRecentlyViewed'

describe('useInput', () => {
  it('tracks changes and resets to the initial value', () => {
    const { result } = renderHook(() => useInput('start'))

    act(() => result.current.onChange({ target: { value: 'typed' } }))
    expect(result.current.value).toBe('typed')

    act(() => result.current.reset())
    expect(result.current.value).toBe('start')
  })
})

describe('useFetch', () => {
  it('exposes data after a successful fetch', async () => {
    const { result } = renderHook(() => useFetch(() => Promise.resolve([1, 2])))

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual([1, 2])
    expect(result.current.error).toBeNull()
  })

  it('exposes the error when the fetch fails', async () => {
    const failure = new Error('down')
    const { result } = renderHook(() => useFetch(() => Promise.reject(failure)))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe(failure)
    expect(result.current.data).toBeNull()
  })

  it('refetches when a dependency changes', async () => {
    const fetchFn = vi.fn((id) => Promise.resolve(id))
    const { result, rerender } = renderHook(({ id }) => useFetch(() => fetchFn(id), [id]), {
      initialProps: { id: 1 },
    })
    await waitFor(() => expect(result.current.data).toBe(1))

    rerender({ id: 2 })

    await waitFor(() => expect(result.current.data).toBe(2))
    expect(fetchFn).toHaveBeenCalledTimes(2)
  })
})

describe('useRecentlyViewed', () => {
  const product = (id) => ({ _id: id, title: `P${id}` })

  it('starts from stored items', () => {
    localStorage.setItem('apex_recently_viewed', JSON.stringify([product('a')]))
    const { result } = renderHook(() => useRecentlyViewed())
    expect(result.current.items).toEqual([product('a')])
  })

  it('survives corrupt storage', () => {
    localStorage.setItem('apex_recently_viewed', '{bad json')
    const { result } = renderHook(() => useRecentlyViewed())
    expect(result.current.items).toEqual([])
  })

  it('moves a re-viewed product to the front without duplicates', () => {
    const { result } = renderHook(() => useRecentlyViewed())

    act(() => result.current.addProduct(product('a')))
    act(() => result.current.addProduct(product('b')))
    act(() => result.current.addProduct(product('a')))

    expect(result.current.items.map((p) => p._id)).toEqual(['a', 'b'])
    expect(JSON.parse(localStorage.getItem('apex_recently_viewed'))).toHaveLength(2)
  })

  it('keeps at most six products', () => {
    const { result } = renderHook(() => useRecentlyViewed())

    ;['1', '2', '3', '4', '5', '6', '7'].forEach((id) => act(() => result.current.addProduct(product(id))))

    expect(result.current.items.map((p) => p._id)).toEqual(['7', '6', '5', '4', '3', '2'])
  })
})
