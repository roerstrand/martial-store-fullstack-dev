import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NotFoundPage from './NotFoundPage'

describe('NotFoundPage', () => {
  it('offers a way back to the home page', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /Back to home/i })).toHaveAttribute('href', '/')
  })

  it('offers a way to the catalog', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /All products/i })).toHaveAttribute('href', '/products')
  })
})
