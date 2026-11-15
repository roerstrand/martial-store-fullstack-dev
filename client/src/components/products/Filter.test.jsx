import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Filter from './Filter'

const filters = { sort: 'default', minPrice: '', maxPrice: '', onSale: false, newArrival: false, minRating: 0 }

const renderFilter = (overrides = {}) =>
  render(<Filter filters={{ ...filters, ...overrides }} onChange={vi.fn()} onClose={vi.fn()} />)

describe('Filter', () => {
  it('labels both price inputs', () => {
    renderFilter()

    expect(screen.getByLabelText('Minimum price (EUR)')).toBeInTheDocument()
    expect(screen.getByLabelText('Maximum price (EUR)')).toBeInTheDocument()
  })

  it('names each rating button and tells which one is selected', async () => {
    renderFilter()

    const four = screen.getByRole('button', { name: '4 stars and up' })
    expect(four).toHaveAttribute('aria-pressed', 'false')

    await userEvent.click(four)

    expect(four).toHaveAttribute('aria-pressed', 'true')
  })

  it('tells which sort option is selected', () => {
    renderFilter({ sort: 'price-asc' })

    expect(screen.getByRole('button', { name: 'Price: Low → High' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Default' })).toHaveAttribute('aria-pressed', 'false')
  })
})
