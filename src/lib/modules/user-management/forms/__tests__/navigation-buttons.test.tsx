/* Libraries imports */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'

/* User module imports */
import UserNavigationButtons from '@user-management/forms/navigation-buttons'

describe('UserNavigationButtons', () => {
  const mockOnCancel = vi.fn()
  const mockOnSubmit = vi.fn()

  const defaultProps = {
    onCancel: mockOnCancel,
    onSubmit: mockOnSubmit,
    loading: false
  }

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render Cancel and Submit buttons', () => {
      render(<UserNavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Create User')).toBeInTheDocument()
    })

    it('should render custom submit text', () => {
      render(
        <UserNavigationButtons {...defaultProps} submitText="Update User" />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Update User')).toBeInTheDocument()
    })

    it('should render loading text when loading', () => {
      render(
        <UserNavigationButtons {...defaultProps} loading={true} loadingText="Updating..." />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Updating...')).toBeInTheDocument()
    })
  })

  describe('Button Interactions', () => {
    it('should call onCancel when Cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<UserNavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('should call onSubmit when Submit button is clicked', async () => {
      const user = userEvent.setup()
      render(<UserNavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      const submitButton = screen.getByText('Create User')
      await user.click(submitButton)

      expect(mockOnSubmit).toHaveBeenCalledTimes(1)
    })
  })

  describe('Disabled States', () => {
    it('should not call onCancel when loading is true', async () => {
      const user = userEvent.setup()
      render(<UserNavigationButtons {...defaultProps} loading={true} />, { wrapper: TestWrapper })

      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      expect(mockOnCancel).not.toHaveBeenCalled()
    })

    it('should not call onSubmit when loading is true', async () => {
      const user = userEvent.setup()
      render(<UserNavigationButtons {...defaultProps} loading={true} />, { wrapper: TestWrapper })

      const submitButton = screen.getByText('Creating User...')
      await user.click(submitButton)

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should not call handlers when disabled prop is true', async () => {
      const user = userEvent.setup()
      render(<UserNavigationButtons {...defaultProps} disabled={true} />, { wrapper: TestWrapper })

      const cancelButton = screen.getByText('Cancel')
      const submitButton = screen.getByText('Create User')

      await user.click(cancelButton)
      await user.click(submitButton)

      expect(mockOnCancel).not.toHaveBeenCalled()
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should not call handlers when both loading and disabled are true', async () => {
      const user = userEvent.setup()
      render(
        <UserNavigationButtons {...defaultProps} loading={true} disabled={true} />,
        { wrapper: TestWrapper }
      )

      const cancelButton = screen.getByText('Cancel')
      const submitButton = screen.getByText('Creating User...')

      await user.click(cancelButton)
      await user.click(submitButton)

      expect(mockOnCancel).not.toHaveBeenCalled()
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  describe('Layout', () => {
    it('should render buttons in a flex container', () => {
      const { container } = render(<UserNavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      const flexContainer = container.querySelector('[class*="chakra-stack"]')
      expect(flexContainer).toBeInTheDocument()
    })
  })

  describe('Default Props', () => {
    it('should use default submit text when not provided', () => {
      render(<UserNavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Create User')).toBeInTheDocument()
    })

    it('should use default loading text when not provided', () => {
      render(<UserNavigationButtons {...defaultProps} loading={true} />, { wrapper: TestWrapper })

      expect(screen.getByText('Creating User...')).toBeInTheDocument()
    })

    it('should call handlers when not disabled', async () => {
      const user = userEvent.setup()
      render(<UserNavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      const cancelButton = screen.getByText('Cancel')
      const submitButton = screen.getByText('Create User')

      await user.click(cancelButton)
      expect(mockOnCancel).toHaveBeenCalledTimes(1)

      await user.click(submitButton)
      expect(mockOnSubmit).toHaveBeenCalledTimes(1)
    })
  })
})
