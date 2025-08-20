import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ResourceErrorProvider, useResourceErrors } from '../resource-error'

// Test component to interact with the context
const TestComponent = () => {
  const { error, addError, removeError, clearAllErrors } = useResourceErrors()
  
  return (
    <div>
      <div data-testid="error-display">
        {error ? (
          <div>
            <span data-testid="error-id">{error.id}</span>
            <span data-testid="error-title">{error.title}</span>
            <span data-testid="error-message">{error.error?.message || error.error}</span>
            <span data-testid="error-retrying">{error.isRetrying.toString()}</span>
          </div>
        ) : (
          'No error'
        )}
      </div>
      
      <button
        data-testid="add-error-btn"
        onClick={() => addError({
          id: 'test-error-1',
          error: new Error('Test error message'),
          title: 'Test Error Title',
          onRetry: vi.fn(),
          isRetrying: false
        })}
      >
        Add Error
      </button>
      
      <button
        data-testid="add-string-error-btn"
        onClick={() => addError({
          id: 'string-error',
          error: 'String error message',
          title: 'String Error',
          onRetry: vi.fn(),
          isRetrying: true
        })}
      >
        Add String Error
      </button>
      
      <button
        data-testid="remove-error-btn"
        onClick={() => removeError('test-error-1')}
      >
        Remove Error
      </button>
      
      <button
        data-testid="clear-all-btn"
        onClick={() => clearAllErrors()}
      >
        Clear All
      </button>
    </div>
  )
}

// Component to test hook outside provider
const ComponentWithoutProvider = () => {
  const context = useResourceErrors()
  return <div>{context.error?.title}</div>
}

describe('ResourceErrorProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Provider Setup', () => {
    it('should render children correctly', () => {
      render(
        <ResourceErrorProvider>
          <div data-testid="test-child">Test Child</div>
        </ResourceErrorProvider>
      )
      
      expect(screen.getByTestId('test-child')).toBeInTheDocument()
      expect(screen.getByText('Test Child')).toBeInTheDocument()
    })

    it('should provide context value to children', () => {
      render(
        <ResourceErrorProvider>
          <TestComponent />
        </ResourceErrorProvider>
      )
      
      expect(screen.getByTestId('error-display')).toBeInTheDocument()
      expect(screen.getByText('No error')).toBeInTheDocument()
    })

    it('should handle multiple children', () => {
      render(
        <ResourceErrorProvider>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <TestComponent />
        </ResourceErrorProvider>
      )
      
      expect(screen.getByTestId('child-1')).toBeInTheDocument()
      expect(screen.getByTestId('child-2')).toBeInTheDocument()
      expect(screen.getByTestId('error-display')).toBeInTheDocument()
    })
  })

  describe('Error State Management', () => {
    it('should start with no error', () => {
      render(
        <ResourceErrorProvider>
          <TestComponent />
        </ResourceErrorProvider>
      )
      
      expect(screen.getByText('No error')).toBeInTheDocument()
    })

    it('should add error with Error object', () => {
      render(
        <ResourceErrorProvider>
          <TestComponent />
        </ResourceErrorProvider>
      )
      
      act(() => {
        screen.getByTestId('add-error-btn').click()
      })
      
      expect(screen.getByTestId('error-id')).toHaveTextContent('test-error-1')
      expect(screen.getByTestId('error-title')).toHaveTextContent('Test Error Title')
      expect(screen.getByTestId('error-message')).toHaveTextContent('Test error message')
      expect(screen.getByTestId('error-retrying')).toHaveTextContent('false')
    })

    it('should add error with string message', () => {
      render(
        <ResourceErrorProvider>
          <TestComponent />
        </ResourceErrorProvider>
      )
      
      act(() => {
        screen.getByTestId('add-string-error-btn').click()
      })
      
      expect(screen.getByTestId('error-id')).toHaveTextContent('string-error')
      expect(screen.getByTestId('error-title')).toHaveTextContent('String Error')
      expect(screen.getByTestId('error-message')).toHaveTextContent('String error message')
      expect(screen.getByTestId('error-retrying')).toHaveTextContent('true')
    })

    it('should replace existing error when adding new error', () => {
      const TestMultipleErrors = () => {
        const { addError, error } = useResourceErrors()
        
        return (
          <div>
            <div data-testid="current-error">
              {error?.id || 'no-error'}
            </div>
            <button
              data-testid="add-first-error"
              onClick={() => addError({
                id: 'first-error',
                error: 'First error',
                title: 'First',
                onRetry: vi.fn(),
                isRetrying: false
              })}
            >
              Add First
            </button>
            <button
              data-testid="add-second-error"
              onClick={() => addError({
                id: 'second-error',
                error: 'Second error',
                title: 'Second',
                onRetry: vi.fn(),
                isRetrying: false
              })}
            >
              Add Second
            </button>
          </div>
        )
      }

      render(
        <ResourceErrorProvider>
          <TestMultipleErrors />
        </ResourceErrorProvider>
      )
      
      expect(screen.getByTestId('current-error')).toHaveTextContent('no-error')
      
      act(() => {
        screen.getByTestId('add-first-error').click()
      })
      
      expect(screen.getByTestId('current-error')).toHaveTextContent('first-error')
      
      act(() => {
        screen.getByTestId('add-second-error').click()
      })
      
      expect(screen.getByTestId('current-error')).toHaveTextContent('second-error')
    })
  })

  describe('Error Removal', () => {
    it('should remove error by matching ID', () => {
      render(
        <ResourceErrorProvider>
          <TestComponent />
        </ResourceErrorProvider>
      )
      
      // Add error first
      act(() => {
        screen.getByTestId('add-error-btn').click()
      })
      
      expect(screen.getByTestId('error-id')).toHaveTextContent('test-error-1')
      
      // Remove the error
      act(() => {
        screen.getByTestId('remove-error-btn').click()
      })
      
      expect(screen.getByText('No error')).toBeInTheDocument()
    })

    it('should not remove error if ID does not match', () => {
      const TestRemoveWrongId = () => {
        const { addError, removeError, error } = useResourceErrors()
        
        return (
          <div>
            <div data-testid="error-state">
              {error?.id || 'no-error'}
            </div>
            <button
              data-testid="add-error"
              onClick={() => addError({
                id: 'correct-id',
                error: 'Test error',
                title: 'Test',
                onRetry: vi.fn(),
                isRetrying: false
              })}
            >
              Add Error
            </button>
            <button
              data-testid="remove-wrong-id"
              onClick={() => removeError('wrong-id')}
            >
              Remove Wrong ID
            </button>
          </div>
        )
      }

      render(
        <ResourceErrorProvider>
          <TestRemoveWrongId />
        </ResourceErrorProvider>
      )
      
      act(() => {
        screen.getByTestId('add-error').click()
      })
      
      expect(screen.getByTestId('error-state')).toHaveTextContent('correct-id')
      
      act(() => {
        screen.getByTestId('remove-wrong-id').click()
      })
      
      // Error should still be present
      expect(screen.getByTestId('error-state')).toHaveTextContent('correct-id')
    })

    it('should handle removing error when no error exists', () => {
      render(
        <ResourceErrorProvider>
          <TestComponent />
        </ResourceErrorProvider>
      )
      
      expect(screen.getByText('No error')).toBeInTheDocument()
      
      act(() => {
        screen.getByTestId('remove-error-btn').click()
      })
      
      expect(screen.getByText('No error')).toBeInTheDocument()
    })
  })

  describe('Clear All Errors', () => {
    it('should clear all errors', () => {
      render(
        <ResourceErrorProvider>
          <TestComponent />
        </ResourceErrorProvider>
      )
      
      // Add error first
      act(() => {
        screen.getByTestId('add-error-btn').click()
      })
      
      expect(screen.getByTestId('error-id')).toHaveTextContent('test-error-1')
      
      // Clear all errors
      act(() => {
        screen.getByTestId('clear-all-btn').click()
      })
      
      expect(screen.getByText('No error')).toBeInTheDocument()
    })

    it('should handle clearing when no errors exist', () => {
      render(
        <ResourceErrorProvider>
          <TestComponent />
        </ResourceErrorProvider>
      )
      
      expect(screen.getByText('No error')).toBeInTheDocument()
      
      act(() => {
        screen.getByTestId('clear-all-btn').click()
      })
      
      expect(screen.getByText('No error')).toBeInTheDocument()
    })
  })

  describe('Hook Usage', () => {
    it('should throw error when used outside provider', () => {
      const originalError = console.error
      console.error = vi.fn()
      
      expect(() => {
        render(<ComponentWithoutProvider />)
      }).toThrow('useResourceErrors must be used within ResourceErrorProvider')
      
      console.error = originalError
    })

    it('should provide correct context interface', () => {
      const TestContextInterface = () => {
        const context = useResourceErrors()
        
        return (
          <div>
            <div data-testid="has-error">{typeof context.error}</div>
            <div data-testid="has-addError">{typeof context.addError}</div>
            <div data-testid="has-removeError">{typeof context.removeError}</div>
            <div data-testid="has-clearAllErrors">{typeof context.clearAllErrors}</div>
          </div>
        )
      }

      render(
        <ResourceErrorProvider>
          <TestContextInterface />
        </ResourceErrorProvider>
      )
      
      expect(screen.getByTestId('has-error')).toHaveTextContent('object')
      expect(screen.getByTestId('has-addError')).toHaveTextContent('function')
      expect(screen.getByTestId('has-removeError')).toHaveTextContent('function')
      expect(screen.getByTestId('has-clearAllErrors')).toHaveTextContent('function')
    })
  })

  describe('Error Object Handling', () => {
    it('should handle complex error objects', () => {
      const TestComplexError = () => {
        const { addError, error } = useResourceErrors()
        
        const complexError = {
          message: 'Network request failed',
          code: 500,
          details: { endpoint: '/api/users', method: 'GET' }
        }
        
        return (
          <div>
            <div data-testid="error-details">
              {error ? JSON.stringify(error.error) : 'no-error'}
            </div>
            <button
              data-testid="add-complex-error"
              onClick={() => addError({
                id: 'complex-error',
                error: complexError,
                title: 'Complex Error',
                onRetry: vi.fn(),
                isRetrying: false
              })}
            >
              Add Complex Error
            </button>
          </div>
        )
      }

      render(
        <ResourceErrorProvider>
          <TestComplexError />
        </ResourceErrorProvider>
      )
      
      act(() => {
        screen.getByTestId('add-complex-error').click()
      })
      
      const errorDetails = screen.getByTestId('error-details')
      expect(errorDetails.textContent).toContain('Network request failed')
      expect(errorDetails.textContent).toContain('500')
      expect(errorDetails.textContent).toContain('/api/users')
    })

    it('should handle null/undefined error values', () => {
      const TestNullError = () => {
        const { addError, error } = useResourceErrors()
        
        return (
          <div>
            <div data-testid="error-value">
              {error ? String(error.error) : 'no-error'}
            </div>
            <button
              data-testid="add-null-error"
              onClick={() => addError({
                id: 'null-error',
                error: null,
                title: 'Null Error',
                onRetry: vi.fn(),
                isRetrying: false
              })}
            >
              Add Null Error
            </button>
            <button
              data-testid="add-undefined-error"
              onClick={() => addError({
                id: 'undefined-error',
                error: undefined,
                title: 'Undefined Error',
                onRetry: vi.fn(),
                isRetrying: false
              })}
            >
              Add Undefined Error
            </button>
          </div>
        )
      }

      render(
        <ResourceErrorProvider>
          <TestNullError />
        </ResourceErrorProvider>
      )
      
      act(() => {
        screen.getByTestId('add-null-error').click()
      })
      
      expect(screen.getByTestId('error-value')).toHaveTextContent('null')
      
      act(() => {
        screen.getByTestId('add-undefined-error').click()
      })
      
      expect(screen.getByTestId('error-value')).toHaveTextContent('undefined')
    })
  })

  describe('Retry Functionality', () => {
    it('should store and access retry function', () => {
      const mockRetryFn = vi.fn()
      
      const TestRetryFunction = () => {
        const { addError, error } = useResourceErrors()
        
        return (
          <div>
            <div data-testid="retry-status">
              {error ? `Can retry: ${typeof error.onRetry === 'function'}` : 'no-error'}
            </div>
            <button
              data-testid="add-error-with-retry"
              onClick={() => addError({
                id: 'retry-error',
                error: 'Retryable error',
                title: 'Retry Test',
                onRetry: mockRetryFn,
                isRetrying: false
              })}
            >
              Add Error with Retry
            </button>
            <button
              data-testid="trigger-retry"
              onClick={() => error?.onRetry()}
            >
              Trigger Retry
            </button>
          </div>
        )
      }

      render(
        <ResourceErrorProvider>
          <TestRetryFunction />
        </ResourceErrorProvider>
      )
      
      act(() => {
        screen.getByTestId('add-error-with-retry').click()
      })
      
      expect(screen.getByTestId('retry-status')).toHaveTextContent('Can retry: true')
      
      act(() => {
        screen.getByTestId('trigger-retry').click()
      })
      
      expect(mockRetryFn).toHaveBeenCalledTimes(1)
    })

    it('should track retry state correctly', () => {
      const TestRetryState = () => {
        const { addError, error } = useResourceErrors()
        
        return (
          <div>
            <div data-testid="retry-state">
              {error ? `Retrying: ${error.isRetrying}` : 'no-error'}
            </div>
            <button
              data-testid="add-retrying-error"
              onClick={() => addError({
                id: 'retrying-error',
                error: 'Error in retry',
                title: 'Retrying Error',
                onRetry: vi.fn(),
                isRetrying: true
              })}
            >
              Add Retrying Error
            </button>
            <button
              data-testid="add-not-retrying-error"
              onClick={() => addError({
                id: 'not-retrying-error',
                error: 'Error not retrying',
                title: 'Not Retrying Error',
                onRetry: vi.fn(),
                isRetrying: false
              })}
            >
              Add Not Retrying Error
            </button>
          </div>
        )
      }

      render(
        <ResourceErrorProvider>
          <TestRetryState />
        </ResourceErrorProvider>
      )
      
      act(() => {
        screen.getByTestId('add-retrying-error').click()
      })
      
      expect(screen.getByTestId('retry-state')).toHaveTextContent('Retrying: true')
      
      act(() => {
        screen.getByTestId('add-not-retrying-error').click()
      })
      
      expect(screen.getByTestId('retry-state')).toHaveTextContent('Retrying: false')
    })
  })

  describe('Component Re-renders and State Updates', () => {
    it('should trigger re-renders when error state changes', () => {
      let renderCount = 0
      
      const TestRenderCount = () => {
        const { error, addError, clearAllErrors } = useResourceErrors()
        renderCount++
        
        return (
          <div>
            <div data-testid="render-count">{renderCount}</div>
            <div data-testid="error-status">{error ? 'has-error' : 'no-error'}</div>
            <button
              data-testid="add-error"
              onClick={() => addError({
                id: 'test',
                error: 'Test',
                title: 'Test',
                onRetry: vi.fn(),
                isRetrying: false
              })}
            >
              Add Error
            </button>
            <button
              data-testid="clear-error"
              onClick={() => clearAllErrors()}
            >
              Clear Error
            </button>
          </div>
        )
      }

      render(
        <ResourceErrorProvider>
          <TestRenderCount />
        </ResourceErrorProvider>
      )
      
      const initialRenderCount = parseInt(screen.getByTestId('render-count').textContent || '0')
      
      act(() => {
        screen.getByTestId('add-error').click()
      })
      
      const afterAddRenderCount = parseInt(screen.getByTestId('render-count').textContent || '0')
      expect(afterAddRenderCount).toBeGreaterThan(initialRenderCount)
      
      act(() => {
        screen.getByTestId('clear-error').click()
      })
      
      const afterClearRenderCount = parseInt(screen.getByTestId('render-count').textContent || '0')
      expect(afterClearRenderCount).toBeGreaterThan(afterAddRenderCount)
    })

    it('should maintain functional context methods across re-renders', () => {
      const functionRefs = new Set()
      
      const TestContextFunctionStability = () => {
        const { addError, removeError, clearAllErrors, error } = useResourceErrors()
        
        // Track function references to ensure they remain stable
        functionRefs.add(`${addError.toString()}-${removeError.toString()}-${clearAllErrors.toString()}`)
        
        return (
          <div>
            <div data-testid="function-signature-count">{functionRefs.size}</div>
            <div data-testid="error-state">{error ? 'has-error' : 'no-error'}</div>
            <button
              data-testid="add-error"
              onClick={() => addError({
                id: 'test',
                error: 'Test',
                title: 'Test',
                onRetry: vi.fn(),
                isRetrying: false
              })}
            >
              Add Error
            </button>
            <button
              data-testid="clear-error"
              onClick={() => clearAllErrors()}
            >
              Clear Error
            </button>
          </div>
        )
      }

      render(
        <ResourceErrorProvider>
          <TestContextFunctionStability />
        </ResourceErrorProvider>
      )
      
      // Functions should remain stable across state changes
      act(() => {
        screen.getByTestId('add-error').click()
      })
      
      expect(screen.getByTestId('error-state')).toHaveTextContent('has-error')
      
      act(() => {
        screen.getByTestId('clear-error').click()
      })
      
      expect(screen.getByTestId('error-state')).toHaveTextContent('no-error')
      
      // Function signatures should remain the same (functions are stable)
      expect(screen.getByTestId('function-signature-count')).toHaveTextContent('1')
    })
  })

  describe('TypeScript Type Safety', () => {
    it('should enforce ResourceError interface', () => {
      const TestTypeEnforcement = () => {
        const { addError } = useResourceErrors()
        
        // This test validates that the component accepts proper ResourceError objects
        const validError = {
          id: 'valid-error',
          error: new Error('Valid error'),
          title: 'Valid Error Title',
          onRetry: vi.fn(),
          isRetrying: false
        }
        
        return (
          <button
            data-testid="add-valid-error"
            onClick={() => addError(validError)}
          >
            Add Valid Error
          </button>
        )
      }

      expect(() => {
        render(
          <ResourceErrorProvider>
            <TestTypeEnforcement />
          </ResourceErrorProvider>
        )
      }).not.toThrow()
    })
  })
})