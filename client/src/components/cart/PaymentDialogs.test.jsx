import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CardModal from './CardModal'
import SwishModal from './SwishModal'
import KlarnaModal from './KlarnaModal'

describe.each([
  ['CardModal', CardModal],
  ['SwishModal', SwishModal],
  ['KlarnaModal', KlarnaModal],
])('%s', (_, Modal) => {
  const renderModal = (onClose = vi.fn()) => {
    render(
      <>
        <button type="button">Opener</button>
        <Modal total={100} onConfirm={vi.fn()} onClose={onClose} />
      </>,
    )
    return onClose
  }

  it('is a modal dialog named by its title', () => {
    renderModal()

    expect(screen.getByRole('dialog', { name: 'Confirm your payment' })).toHaveAttribute('aria-modal', 'true')
  })

  it('moves focus into the dialog when it opens', () => {
    renderModal()

    expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true)
  })

  it('closes on Escape', () => {
    const onClose = renderModal()

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('has a close button with an accessible name', () => {
    renderModal()

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('keeps Tab inside the dialog', async () => {
    renderModal()
    const dialog = screen.getByRole('dialog')

    for (let i = 0; i < 8; i++) {
      await userEvent.tab()
      expect(dialog.contains(document.activeElement)).toBe(true)
    }
  })
})

describe('KlarnaModal options', () => {
  it('offers the payment plans as a radio group', async () => {
    render(<KlarnaModal total={90} onConfirm={vi.fn()} onClose={vi.fn()} />)

    expect(screen.getByRole('radiogroup', { name: 'Payment plan' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Pay now/ })).toBeChecked()

    await userEvent.click(screen.getByRole('radio', { name: /Pay in 30 days/ }))

    expect(screen.getByRole('radio', { name: /Pay in 30 days/ })).toBeChecked()
  })
})
