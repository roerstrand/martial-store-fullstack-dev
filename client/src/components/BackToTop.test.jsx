import { render, screen, fireEvent, act } from '@testing-library/react'
import BackToTop from './BackToTop'

const scrollPage = (y) => {
  act(() => {
    window.scrollY = y
    window.dispatchEvent(new Event('scroll'))
  })
}

describe('BackToTop', () => {
  beforeEach(() => {
    window.scrollY = 0
    window.scrollTo = vi.fn()
  })

  it('is hidden while the visitor is at the top of the page', () => {
    render(<BackToTop />)

    expect(screen.queryByRole('button', { name: 'Back to top' })).not.toBeInTheDocument()
  })

  it('appears once the visitor has scrolled down', () => {
    render(<BackToTop />)

    scrollPage(900)

    expect(screen.getByRole('button', { name: 'Back to top' })).toBeInTheDocument()
  })

  it('scrolls smoothly to the top when clicked', () => {
    render(<BackToTop />)
    scrollPage(900)

    fireEvent.click(screen.getByRole('button', { name: 'Back to top' }))

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('hides again when the visitor is back at the top', () => {
    render(<BackToTop />)
    scrollPage(900)

    scrollPage(0)

    expect(screen.queryByRole('button', { name: 'Back to top' })).not.toBeInTheDocument()
  })
})
