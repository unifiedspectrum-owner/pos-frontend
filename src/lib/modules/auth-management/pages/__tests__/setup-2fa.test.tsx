/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

/* Auth module imports */
import Setup2FAPage from '@auth-management/pages/setup-2fa'

/* Mock Setup2FAForm component */
vi.mock('@auth-management/forms', () => ({
  Setup2FAForm: vi.fn(() => <div data-testid="setup-2fa-form">Setup 2FA Form</div>)
}))

/* Mock AuthLayout component */
vi.mock('@auth-management/components', () => ({
  AuthLayout: vi.fn(({ children }) => (
    <div data-testid="auth-layout">{children}</div>
  ))
}))

describe('Setup2FAPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the setup 2FA page', () => {
      render(<Setup2FAPage />)

      expect(screen.getByTestId('auth-layout')).toBeInTheDocument()
      expect(screen.getByTestId('setup-2fa-form')).toBeInTheDocument()
    })

    it('should render auth layout with form', () => {
      render(<Setup2FAPage />)

      const layout = screen.getByTestId('auth-layout')
      const form = screen.getByTestId('setup-2fa-form')

      expect(layout).toContainElement(form)
    })
  })

  describe('Component Integration', () => {
    it('should render Setup2FAForm component', () => {
      render(<Setup2FAPage />)

      expect(screen.getByTestId('setup-2fa-form')).toBeInTheDocument()
      expect(screen.getByText('Setup 2FA Form')).toBeInTheDocument()
    })

    it('should wrap form in AuthLayout', () => {
      render(<Setup2FAPage />)

      const authLayout = screen.getByTestId('auth-layout')
      const form = screen.getByTestId('setup-2fa-form')

      expect(authLayout).toBeInTheDocument()
      expect(authLayout).toContainElement(form)
    })
  })

  describe('Component Structure', () => {
    it('should have correct component hierarchy', () => {
      render(<Setup2FAPage />)

      const authLayout = screen.getByTestId('auth-layout')
      const form = screen.getByTestId('setup-2fa-form')

      expect(authLayout).toBeInTheDocument()
      expect(form).toBeInTheDocument()
      expect(authLayout).toContainElement(form)
    })
  })
})
