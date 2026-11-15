import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ContactPage from './ContactPage'

const renderPage = () => render(<MemoryRouter><ContactPage /></MemoryRouter>)

describe('ContactPage form', () => {
  it('labels every field', () => {
    renderPage()

    expect(screen.getByLabelText('Name')).toHaveAttribute('autocomplete', 'name')
    expect(screen.getByLabelText('Email')).toHaveAttribute('autocomplete', 'email')
    expect(screen.getByLabelText('Message')).toBeInTheDocument()
  })

  it('ties the email error to the field and announces it', async () => {
    renderPage()

    await userEvent.type(screen.getByLabelText('Name'), 'Ninja')
    await userEvent.type(screen.getByLabelText('Email'), 'ninja@bad')
    await userEvent.type(screen.getByLabelText('Message'), 'Hello')
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }))

    const email = screen.getByLabelText('Email')
    expect(email).toHaveAttribute('aria-invalid', 'true')
    expect(email).toHaveAccessibleDescription(/valid email/)
    expect(screen.getByRole('alert')).toHaveTextContent(/valid email/)
  })
})
