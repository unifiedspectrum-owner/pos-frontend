import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'
import ErrorMessageContainer from '../error-message-container'

// Mock form elements
vi.mock('@shared/components/form-elements', () => ({
  PrimaryButton: ({ children, onClick, leftIcon, loading, disabled, ...props }: any) => (
    <button 
      onClick={onClick} 
      data-testid="primary-button" 
      disabled={disabled || loading}
      {...props}
    >
      {leftIcon && <span data-testid="left-icon" />}
      {children}
    </button>
  ),
  SecondaryButton: ({ children, onClick, leftIcon, ...props }: any) => (
    <button onClick={onClick} data-testid="secondary-button" {...props}>
      {leftIcon && <span data-testid="left-icon" />}
      {children}
    </button>
  )
}))

// Mock config imports
vi.mock('@shared/config', () => ({
  ERROR_RED_COLOR: '#DC2626',
  GRAY_COLOR: '#6B7280',
  DARK_COLOR: '#1F2937'
}))

// Mock polished functions
vi.mock('polished', () => ({
  lighten: vi.fn((amount: number, color: string) => color)
}))

// Mock window reload
const mockReload = vi.fn()

// Mock the entire location object
vi.stubGlobal('location', {
  ...window.location,
  reload: mockReload
})

beforeEach(() => {
  mockReload.mockClear()
  // Re-establish the global mock after it may have been unstubbed
  vi.stubGlobal('location', {
    ...window.location,
    reload: mockReload
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

interface ErrorMessageContainerProps {
  error: string | Error | any
  title?: string
  onRetry?: () => void
  onReload?: () => void
  onDismiss?: () => void
  isRetrying?: boolean
  showReloadButton?: boolean
  showDismissButton?: boolean
  customTroubleshootingTips?: string[]
  testId?: string
}

const defaultProps: Partial<ErrorMessageContainerProps> = {
  error: 'Default error message'
}

const renderErrorContainer = (props: Partial<ErrorMessageContainerProps> = {}) => {
  const mergedProps = { ...defaultProps, ...props }
  return render(
    <ErrorMessageContainer {...mergedProps} />,
    { wrapper: TestWrapper }
  )
}

describe('ErrorMessageContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      renderErrorContainer()
      
      expect(screen.getByText('Default error message')).toBeInTheDocument()
      expect(screen.getByText('Error Loading Data')).toBeInTheDocument()
    })

    it('should render with default testId', () => {
      renderErrorContainer()
      
      expect(screen.getByTestId('error-message-container')).toBeInTheDocument()
    })

    it('should render with custom testId', () => {
      renderErrorContainer({ testId: 'custom-error' })
      
      expect(screen.getByTestId('custom-error')).toBeInTheDocument()
    })

    it('should render custom title', () => {
      renderErrorContainer({ title: 'Custom Error Title' })
      
      expect(screen.getByText('Custom Error Title')).toBeInTheDocument()
      expect(screen.queryByText('Error Loading Data')).not.toBeInTheDocument()
    })
  })

  describe('Error Processing', () => {
    it('should handle string errors', () => {
      renderErrorContainer({ error: 'Simple string error' })
      
      expect(screen.getByText('Simple string error')).toBeInTheDocument()
    })

    it('should handle Error objects', () => {
      const errorObj = new Error('Error object message')
      renderErrorContainer({ error: errorObj })
      
      expect(screen.getByText('Error object message')).toBeInTheDocument()
    })

    it('should handle API response errors with message', () => {
      const apiError = {
        response: {
          data: {
            message: 'API error message'
          }
        }
      }
      renderErrorContainer({ error: apiError })
      
      expect(screen.getByText('API error message')).toBeInTheDocument()
    })

    it('should handle API response errors with error field', () => {
      const apiError = {
        response: {
          data: {
            error: 'API error field'
          }
        }
      }
      renderErrorContainer({ error: apiError })
      
      expect(screen.getByText('API error field')).toBeInTheDocument()
    })

    it('should handle API response errors with errors array', () => {
      const apiError = {
        response: {
          data: {
            errors: ['First error', 'Second error']
          }
        }
      }
      renderErrorContainer({ error: apiError })
      
      expect(screen.getByText('First error, Second error')).toBeInTheDocument()
    })

    it('should handle validation errors', () => {
      const validationError = {
        response: {
          data: {
            validation_errors: [
              { field: 'email', message: 'Email is required' },
              { field: 'password', message: 'Password is too short' }
            ]
          }
        }
      }
      renderErrorContainer({ error: validationError })
      
      expect(screen.getByText('Validation Errors:')).toBeInTheDocument()
      expect(screen.getByText(/email.*Email is required/)).toBeInTheDocument()
      expect(screen.getByText(/password.*Password is too short/)).toBeInTheDocument()
    })

    it('should handle network errors', () => {
      const networkError = {
        request: {},
        // No response indicates network error
      }
      renderErrorContainer({ error: networkError })
      
      expect(screen.getByText('Network error. Please check your connection and try again.')).toBeInTheDocument()
    })

    it('should handle unknown error formats', () => {
      const unknownError = { someField: 'unknown structure' }
      renderErrorContainer({ error: unknownError })
      
      expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument()
    })
  })

  describe('Error Type Detection and Icons', () => {
    it('should detect network errors and show appropriate icon', () => {
      renderErrorContainer({ error: 'Network connection failed' })
      
      // Should render network-related troubleshooting tips
      expect(screen.getByText('Check your internet connection')).toBeInTheDocument()
    })

    it('should detect server errors and show appropriate icon', () => {
      renderErrorContainer({ error: 'Server error 500' })
      
      expect(screen.getByText('Our servers are experiencing issues')).toBeInTheDocument()
    })

    it('should detect auth errors and show appropriate tips', () => {
      renderErrorContainer({ error: '401 Unauthorized access' })
      
      expect(screen.getByText('Log out and log back in to refresh your session')).toBeInTheDocument()
    })

    it('should detect permission errors', () => {
      renderErrorContainer({ error: '403 Forbidden access' })
      
      expect(screen.getByText('You may not have permission to access this resource')).toBeInTheDocument()
    })

    it('should detect not found errors', () => {
      renderErrorContainer({ error: '404 Not found' })
      
      expect(screen.getByText('The requested resource may be temporarily unavailable')).toBeInTheDocument()
    })

    it('should detect timeout errors', () => {
      renderErrorContainer({ error: 'Request timeout occurred' })
      
      expect(screen.getByText('The request timed out')).toBeInTheDocument()
    })

    it('should handle general errors with default tips', () => {
      renderErrorContainer({ error: 'General application error' })
      
      expect(screen.getByText('Refresh the page to try again')).toBeInTheDocument()
    })
  })

  describe('Troubleshooting Tips', () => {
    it('should show default troubleshooting tips', () => {
      renderErrorContainer({ error: 'Some error' })
      
      expect(screen.getByText('What you can do:')).toBeInTheDocument()
      expect(screen.getByText('Refresh the page to try again')).toBeInTheDocument()
      expect(screen.getByText('Clear browser cache and cookies')).toBeInTheDocument()
      expect(screen.getByText('Try using a different browser')).toBeInTheDocument()
      expect(screen.getByText('Contact support if the problem continues')).toBeInTheDocument()
    })

    it('should show custom troubleshooting tips when provided', () => {
      const customTips = [
        'First custom tip',
        'Second custom tip',
        'Third custom tip'
      ]
      
      renderErrorContainer({ 
        error: 'Error with custom tips',
        customTroubleshootingTips: customTips 
      })
      
      expect(screen.getByText('First custom tip')).toBeInTheDocument()
      expect(screen.getByText('Second custom tip')).toBeInTheDocument()
      expect(screen.getByText('Third custom tip')).toBeInTheDocument()
      
      // Should not show default tips
      expect(screen.queryByText('Refresh the page to try again')).not.toBeInTheDocument()
    })

    it('should show validation-specific tips for validation errors', () => {
      const validationError = {
        response: {
          data: {
            validation_errors: [
              { field: 'name', message: 'Name is required' }
            ]
          }
        }
      }
      
      renderErrorContainer({ error: validationError })
      
      expect(screen.getByText('Review the highlighted fields and correct the issues')).toBeInTheDocument()
      expect(screen.getByText('Ensure all required fields are filled')).toBeInTheDocument()
    })
  })

  describe('Action Buttons', () => {
    it('should render retry button when onRetry is provided', () => {
      const mockOnRetry = vi.fn()
      
      renderErrorContainer({ onRetry: mockOnRetry })
      
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })

    it('should call onRetry when retry button is clicked', async () => {
      const mockOnRetry = vi.fn()
      
      renderErrorContainer({ onRetry: mockOnRetry })
      
      const retryButton = screen.getByText('Try Again')
      await userEvent.click(retryButton)
      
      expect(mockOnRetry).toHaveBeenCalledTimes(1)
    })

    it('should show retrying state when isRetrying is true', () => {
      const mockOnRetry = vi.fn()
      
      renderErrorContainer({ 
        onRetry: mockOnRetry,
        isRetrying: true 
      })
      
      expect(screen.getByText('Retrying...')).toBeInTheDocument()
      
      const retryButton = screen.getByTestId('primary-button')
      expect(retryButton).toBeDisabled()
    })

    it('should render reload button by default', () => {
      renderErrorContainer()
      
      expect(screen.getByText('Reload Page')).toBeInTheDocument()
    })

    it('should hide reload button when showReloadButton is false', () => {
      renderErrorContainer({ showReloadButton: false })
      
      expect(screen.queryByText('Reload Page')).not.toBeInTheDocument()
    })

    it('should call custom onReload when provided', async () => {
      const mockOnReload = vi.fn()
      
      renderErrorContainer({ onReload: mockOnReload })
      
      const reloadButton = screen.getByText('Reload Page')
      await userEvent.click(reloadButton)
      
      expect(mockOnReload).toHaveBeenCalledTimes(1)
      expect(mockReload).not.toHaveBeenCalled()
    })

    it('should not render retry button when onRetry is not provided', () => {
      renderErrorContainer()
      
      expect(screen.queryByText('Try Again')).not.toBeInTheDocument()
    })
  })

  describe('Validation Error Display', () => {
    it('should display validation errors in structured format', () => {
      const validationError = {
        response: {
          data: {
            validation_errors: [
              { field: 'username', message: 'Username must be unique' },
              { field: 'email', message: 'Invalid email format' },
              { field: 'age', message: 'Age must be a positive number' }
            ]
          }
        }
      }
      
      renderErrorContainer({ error: validationError })
      
      expect(screen.getByText('Validation Errors:')).toBeInTheDocument()
      expect(screen.getByText(/username.*Username must be unique/)).toBeInTheDocument()
      expect(screen.getByText(/email.*Invalid email format/)).toBeInTheDocument()
      expect(screen.getByText(/age.*Age must be a positive number/)).toBeInTheDocument()
    })

    it('should handle single validation error', () => {
      const singleValidationError = {
        response: {
          data: {
            validation_errors: [
              { field: 'password', message: 'Password is required' }
            ]
          }
        }
      }
      
      renderErrorContainer({ error: singleValidationError })
      
      expect(screen.getByText('Validation Errors:')).toBeInTheDocument()
      expect(screen.getByText(/password.*Password is required/)).toBeInTheDocument()
    })

    it('should handle empty validation errors array', () => {
      const emptyValidationError = {
        response: {
          data: {
            validation_errors: []
          }
        }
      }
      
      renderErrorContainer({ error: emptyValidationError })
      
      // Should fall back to general error processing
      expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument()
    })
  })

  describe('Component State and Re-rendering', () => {
    it('should update when error prop changes', () => {
      const { rerender } = renderErrorContainer({ error: 'Initial error' })
      
      expect(screen.getByText('Initial error')).toBeInTheDocument()
      
      rerender(
        <TestWrapper>
          <ErrorMessageContainer error="Updated error" />
        </TestWrapper>
      )
      
      expect(screen.getByText('Updated error')).toBeInTheDocument()
      expect(screen.queryByText('Initial error')).not.toBeInTheDocument()
    })

    it('should update troubleshooting tips when error type changes', () => {
      const { rerender } = renderErrorContainer({ error: 'Network error' })
      
      expect(screen.getByText('Check your internet connection')).toBeInTheDocument()
      
      rerender(
        <TestWrapper>
          <ErrorMessageContainer error="Server error 500" />
        </TestWrapper>
      )
      
      expect(screen.getByText('Our servers are experiencing issues')).toBeInTheDocument()
      expect(screen.queryByText('Check your internet connection')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper error message identification', () => {
      renderErrorContainer({ error: 'Accessible error message' })
      
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
      expect(screen.getByTestId('error-message')).toHaveTextContent('Accessible error message')
    })

    it('should have keyboard accessible action buttons', () => {
      const mockOnRetry = vi.fn()
      
      renderErrorContainer({ onRetry: mockOnRetry })
      
      const retryButton = screen.getByText('Try Again')
      const reloadButton = screen.getByText('Reload Page')
      
      expect(retryButton).not.toHaveAttribute('tabindex', '-1')
      expect(reloadButton).not.toHaveAttribute('tabindex', '-1')
    })

    it('should provide clear error hierarchy', () => {
      renderErrorContainer({ 
        title: 'Clear Error Title',
        error: 'Clear error message description'
      })
      
      expect(screen.getByText('Clear Error Title')).toBeInTheDocument()
      expect(screen.getByText('Clear error message description')).toBeInTheDocument()
      expect(screen.getByText('What you can do:')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle null error gracefully', () => {
      renderErrorContainer({ error: null })
      
      expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument()
    })

    it('should handle undefined error gracefully', () => {
      renderErrorContainer({ error: undefined })
      
      expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument()
    })

    it('should handle empty string error', () => {
      renderErrorContainer({ error: '' })
      
      expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument()
    })

    it('should handle complex nested error objects', () => {
      const complexError = {
        response: {
          data: {
            message: 'Complex nested error',
            details: {
              code: 'COMPLEX_ERROR',
              nested: {
                deepError: 'Very deep error'
              }
            }
          }
        }
      }
      
      renderErrorContainer({ error: complexError })
      
      expect(screen.getByText('Complex nested error')).toBeInTheDocument()
    })

    it('should handle empty custom troubleshooting tips array', () => {
      renderErrorContainer({ 
        error: 'Test error',
        customTroubleshootingTips: [] 
      })
      
      // Should fall back to default tips based on error type
      expect(screen.getByText('What you can do:')).toBeInTheDocument()
    })
  })

  describe('Dismiss Functionality', () => {
    it('should render dismiss button when onDismiss is provided', () => {
      const mockOnDismiss = vi.fn()
      
      renderErrorContainer({ onDismiss: mockOnDismiss })
      
      const dismissButton = screen.getByTestId('dismiss-error-button')
      expect(dismissButton).toBeInTheDocument()
      expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss error')
    })

    it('should call onDismiss when dismiss button is clicked', async () => {
      const mockOnDismiss = vi.fn()
      
      renderErrorContainer({ onDismiss: mockOnDismiss })
      
      const dismissButton = screen.getByTestId('dismiss-error-button')
      await userEvent.click(dismissButton)
      
      expect(mockOnDismiss).toHaveBeenCalledTimes(1)
    })

    it('should not render dismiss button when onDismiss is not provided', () => {
      renderErrorContainer()
      
      expect(screen.queryByTestId('dismiss-error-button')).not.toBeInTheDocument()
    })

    it('should not render dismiss button when showDismissButton is false', () => {
      const mockOnDismiss = vi.fn()
      
      renderErrorContainer({ 
        onDismiss: mockOnDismiss, 
        showDismissButton: false 
      })
      
      expect(screen.queryByTestId('dismiss-error-button')).not.toBeInTheDocument()
    })

    it('should render dismiss button with proper accessibility attributes', () => {
      const mockOnDismiss = vi.fn()
      
      renderErrorContainer({ onDismiss: mockOnDismiss })
      
      const dismissButton = screen.getByTestId('dismiss-error-button')
      expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss error')
      expect(dismissButton).not.toHaveAttribute('tabindex', '-1')
    })
  })
})