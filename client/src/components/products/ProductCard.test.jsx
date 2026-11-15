import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProductCard, { Stars } from './ProductCard'

const product = { _id: 'p1', title: 'BJJ Gi', price: 79, rating: 4, numReviews: 12, image: 'bjj_gi.jpg', category: 'bjj' }

const renderCard = (props = {}) =>
  render(
    <MemoryRouter>
      <ProductCard product={product} {...props} />
    </MemoryRouter>,
  )

describe('Stars', () => {
  it('is announced as one image with the rating as its name', () => {
    render(<Stars rating={4} count={12} />)

    expect(screen.getByRole('img', { name: 'Rated 4 of 5' })).toBeInTheDocument()
  })

  it('draws empty stars with a different shape, not only a different colour', () => {
    render(<Stars rating={3} />)

    expect(screen.getByRole('img', { name: 'Rated 3 of 5' })).toHaveTextContent('★★★☆☆')
  })
})

describe('ProductCard', () => {
  it('names the add button with its visible text followed by the product', () => {
    renderCard()

    expect(screen.getByRole('button', { name: 'Add to cart BJJ Gi' })).toBeInTheDocument()
  })

  it('uses an h3 for the product name by default', () => {
    renderCard()

    expect(screen.getByRole('heading', { level: 3, name: 'BJJ Gi' })).toBeInTheDocument()
  })

  it('can use another heading level so the outline never skips a level', () => {
    renderCard({ headingLevel: 2 })

    expect(screen.getByRole('heading', { level: 2, name: 'BJJ Gi' })).toBeInTheDocument()
  })
})
