import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DocumentTitle from './DocumentTitle'
import { titleFor } from '../utils/pageTitle'

describe('titleFor', () => {
  it.each([
    ['/', 'Apex Core · Fight gear for winners'],
    ['/products', 'All products · Apex Core'],
    ['/products/abc123', 'Product · Apex Core'],
    ['/login', 'Log in · Apex Core'],
    ['/register', 'Create account · Apex Core'],
    ['/cart', 'Cart · Apex Core'],
    ['/checkout', 'Checkout · Apex Core'],
    ['/confirmation', 'Order confirmed · Apex Core'],
    ['/contact', 'Contact · Apex Core'],
    ['/articles', 'Stories · Apex Core'],
    ['/articles/42', 'Story · Apex Core'],
    ['/favorites', 'Favorites · Apex Core'],
    ['/info/shipping', 'Shipping · Apex Core'],
    ['/info/faq', 'FAQ · Apex Core'],
    ['/orders/1', 'Order · Apex Core'],
    ['/my-pages', 'My pages · Apex Core'],
    ['/admin', 'Admin · Apex Core'],
    ['/does-not-exist', 'Page not found · Apex Core'],
  ])('gives %s a descriptive title', (path, title) => {
    expect(titleFor(path)).toBe(title)
  })
})

describe('DocumentTitle', () => {
  it('sets the document title for the current route', () => {
    render(
      <MemoryRouter initialEntries={['/cart']}>
        <DocumentTitle />
      </MemoryRouter>,
    )

    expect(document.title).toBe('Cart · Apex Core')
  })
})
