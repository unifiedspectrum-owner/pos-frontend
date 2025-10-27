/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

/* Auth module imports */
import ForgotPasswordPage from '@auth-management/pages/forgot-password'

/* Mock ForgotPasswordForm component */
vi.mock('@auth-management/forms', () => ({
  ForgotPasswordForm: vi.fn(() => <div data-testid="forgot-password-form">Forgot Password Form</div>)
}))

/* Mock AuthLayout component */
vi.mock('@auth-management/components', () => ({
  AuthLayout: vi.fn(({ children }) => (
    <div data-testid="auth-layout">{children}</div>
  ))
}))

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the forgot password page', () => {
      render(<ForgotPasswordPage />)

      expect(screen.getByTestId('auth-layout')).toBeInTheDocument()
      expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument()
    })

    it('should render auth layout with form', () => {
      render(<ForgotPasswordPage />)

      const layout = screen.getByTestId('auth-layout')
      const form = screen.getByTestId('forgot-password-form')

      expect(layout).toContainElement(form)
    })
  })

  describe('Component Integration', () => {
    it('should render ForgotPasswordForm component', () => {
      render(<ForgotPasswordPage />)

      expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument()
      expect(screen.getByText('Forgot Password Form')).toBeInTheDocument()
    })

    it('should wrap form in AuthLayout', () => {
      render(<ForgotPasswordPage />)

      const authLayout = screen.getByTestId('auth-layout')
      const form = screen.getByTestId('forgot-password-form')

      expect(authLayout).toBeInTheDocument()
      expect(authLayout).toContainElement(form)
    })
  })

  describe('Component Structure', () => {
    it('should have correct component hierarchy', () => {
      render(<ForgotPasswordPage />)

      const authLayout = screen.getByTestId('auth-layout')
      const form = screen.getByTestId('forgot-password-form')

      expect(authLayout).toBeInTheDocument()
      expect(form).toBeInTheDocument()
      expect(authLayout).toContainElement(form)
    })
  })
})
