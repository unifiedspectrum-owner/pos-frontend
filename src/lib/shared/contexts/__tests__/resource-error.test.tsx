/* Libraries imports */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, renderHook, act, waitFor } from '@testing-library/react'
import React from 'react'

/* Shared module imports */
import { ResourceErrorProvider, useResourceErrors } from '@shared/contexts/resource-error'

describe('resource-error context', () => {
  describe('ResourceErrorProvider', () => {
    it('should render children', () => {
      render(
        <ResourceErrorProvider>
          <div data-testid="test-child">Test Child</div>
        </ResourceErrorProvider>
      )

      expect(screen.getByTestId('test-child')).toBeInTheDocument()
      expect(screen.getByText('Test Child')).toBeInTheDocument()
    })

    it('should provide context value to children', () => {
      const TestComponent = () => {
        const context = useResourceErrors()
        return <div data-testid="context-check">{context ? 'Context Available' : 'No Context'}</div>
      }

      render(
        <ResourceErrorProvider>
          <TestComponent />
        </ResourceErrorProvider>
      )

      expect(screen.getByText('Context Available')).toBeInTheDocument()
    })

    it('should initialize with null error', () => {
      const { result } = renderHook(() => useResourceErrors(), {
        wrapper: ResourceErrorProvider
      })

      expect(result.current.error).toBeNull()
    })

    it('should provide all required context methods', () => {
      const { result } = renderHook(() => useResourceErrors(), {
        wrapper: ResourceErrorProvider
      })

      expect(result.current.error).toBeDefined()
      expect(result.current.addError).toBeTypeOf('function')
      expect(result.current.removeError).toBeTypeOf('function')
      expect(result.current.clearAllErrors).toBeTypeOf('function')
    })
  })

  describe('useResourceErrors hook', () => {
    it('should throw error when used outside provider', () => {
      /* Suppress console.error for this test */
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useResourceErrors())
      }).toThrow('useResourceErrors must be used within ResourceErrorProvider')

      consoleSpy.mockRestore()
    })

    it('should return context when used inside provider', () => {
      const { result } = renderHook(() => useResourceErrors(), {
        wrapper: ResourceErrorProvider
      })

      expect(result.current).toBeDefined()
      expect(result.current.error).toBeNull()
    })

    it('should provide function references that work correctly', () => {
      const { result, rerender } = renderHook(() => useResourceErrors(), {
        wrapper: ResourceErrorProvider
      })

      const firstAddError = result.current.addError
      const firstRemoveError = result.current.removeError
      const firstClearAllErrors = result.current.clearAllErrors

      /* Functions should be defined and callable */
      expect(typeof firstAddError).toBe('function')
      expect(typeof firstRemoveError).toBe('function')
      expect(typeof firstClearAllErrors).toBe('function')

      rerender()

      /* Functions should still be defined and callable after rerender */
      expect(typeof result.current.addError).toBe('function')
      expect(typeof result.current.removeError).toBe('function')
      expect(typeof result.current.clearAllErrors).toBe('function')
    })
  })

  describe('addError functionality', () => {
    it('should add error to context', () => {
      const { result } = renderHook(() => useResourceErrors(), {
        wrapper: ResourceErrorProvider
      })

      const testError = {
        id: 'error-1',
        error: new Error('Test error'),
        title: 'Test Error Title',
        onRetry: vi.fn(),
        isRetrying: false
      }

      act(() => {
        result.current.addError(testError)
      })

      expect(result.current.error).toEqual(testError)
      expect(result.current.error?.id).toBe('error-1')
      expect(result.current.error?.title).toBe('Test Error Title')
    })

    it('should replace existing error when adding new one', () => {
      const { result } = renderHook(() => useResourceErrors(), {
        wrapper: ResourceErrorProvider
      })

      const firstError = {
        id: 'error-1',
        error: new Error('First error'),
        title: 'First Error',
        onRetry: vi.fn(),
        isRetrying: false
      }

      const secondError = {
        id: 'error-2',
        error: new Error('Second error'),
        title: 'Second Error',
        onRetry: vi.fn(),
        isRetrying: false
      }

      act(() => {
        result.current.addError(firstError)
      })

      expect(result.current.error?.id).toBe('error-1')

      act(() => {
        result.current.addError(secondError)
      })

      expect(result.current.error?.id).toBe('error-2')
      expect(result.current.error?.title).toBe('Second Error')
    })

    it('should handle error with retry function', () => {
      const { result } = renderHook(() => useResourceErrors(), {
        wrapper: ResourceErrorProvider
      })

      const retryFn = vi.fn()
      const testError = {
        id: 'error-1',
        error: new Error('Test error'),
        title: 'Test Error',
        onRetry: retryFn,
        isRetrying: false
      }

      act(() => {
        result.current.addError(testError)
      })

      expect(result.current.error?.onRetry).toBe(retryFn)

      result.current.error?.onRetry()
      expect(retryFn).toHaveBeenCalledOnce()
    })

    it('should handle error with isRetrying state', () => {
      const { result } = renderHook(() => useResourceErrors(), {
        wrapper: ResourceErrorProvider
      })

      const testError = {
        id: 'error-1',
        error: new Error('Test error'),
        title: 'Test Error',
        onRetry: vi.fn(),
        isRetrying: true
      }

      act(() => {
        result.current.addError(testError)
      })

      expect(result.current.error?.isRetrying).toBe(true)
    })

    it('should handle error object with any type', () => {
      const { result } = renderHook(() => useResourceErrors(), {
        wrapper: ResourceErrorProvider
      })

      const errorWithString = {
        id: 'error-1',
        error: 'String error',
        title: 'String Error',
        onRetry: vi.fn(),
        isRetrying: false
      }

      act(() => {
        result.current.addError(errorWithString)
      })

      expect(result.current.error?.error).toBe('String error')

      const errorWithObject = {
        id: 'error-2',
        error: { message: 'Object error' },
        title: 'Object Error',
        onRetry: vi.fn(),
        isRetrying: false
      }

      act(() => {
        result.current.addError(errorWithObject)
      })

      expect(result.current.error?.error).toEqual({ message: 'Object error' })
    })
  })

  describe('removeError functionality', () => {
    it('should remove error by id when it matches current error', () => {
      const { result } = renderHook(() => useResourceErrors(), {
        wrapper: ResourceErrorProvider
      })

      const testError = {
        id: 'error-1',
        error: new Error('Test error'),
        title: 'Test Error',
        onRetry: vi.fn(),
        isRetrying: false
      }

      act(() => {
        result.current.addError(testError)
      })

      expect(result.current.error).not.toBeNull()

      act(() => {
        result.current.removeError('error-1')
      })

      expect(result.current.error).toBeNull()
    })

    it('should not remove error when id does not match', () => {
      const { result } = renderHook(() => useResourceErrors(), {
        wrapper: ResourceErrorProvider
      })

      const testError = {
        id: 'error-1',
        error: new Error('Test error'),
        title: 'Test Error',
        onRetry: vi.fn(),
        isRetrying: false
      }

      act(() => {
        result.current.addError(testError)
      })

      act(() => {
        result.current.removeError('error-2')
      })

      expect(result.current.error).not.toBeNull()
      expect(result.current.error?.id).toBe('error-1')
    })

    it('should handle removing error when no error exists', () => {
      const { result } = renderHook(() => useResourceErrors(), {
        wrapper: ResourceErrorProvider
      })

      expect(result.current.error).toBeNull()

      act(() => {
        result.current.removeError('non-existent')
      })

      expect(result.current.error).toBeNull()
    })

    it('should handle multiple remove attempts', () => {
      const { result } = renderHook(() => useResourceErrors(), {
        wrapper: ResourceErrorProvider
      })

      const testError = {
        id: 'error-1',
        error: new Error('Test error'),
        title: 'Test Error',
        onRetry: vi.fn(),
        isRetrying: false
      }

      act(() => {
        result.current.addError(testError)
      })

      act(() => {
        result.current.removeError('error-1')
        result.current.removeError('error-1')
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('clearAllErrors functionality', () => {
    it('should clear all errors', () => {
      const { result } = renderHook(() => useResourceErrors(), {
        wrapper: ResourceErrorProvider
      })

      const testError = {
        id: 'error-1',
        error: new Error('Test error'),
        title: 'Test Error',
        onRetry: vi.fn(),
        isRetrying: false
      }

      act(() => {
        result.current.addError(testError)
      })

      expect(result.current.error).not.toBeNull()

      act(() => {
        result.current.clearAllErrors()
      })

      expect(result.current.error).toBeNull()
    })

    it('should handle clearing when no errors exist', () => {
      const { result } = renderHook(() => useResourceErrors(), {
        wrapper: ResourceErrorProvider
      })

      expect(result.current.error).toBeNull()

      act(() => {
        result.current.clearAllErrors()
      })

      expect(result.current.error).toBeNull()
    })

    it('should clear error regardless of id', () => {
      const { result } = renderHook(() => useResourceErrors(), {
        wrapper: ResourceErrorProvider
      })

      const testError = {
        id: 'any-error-id',
        error: new Error('Test error'),
        title: 'Test Error',
        onRetry: vi.fn(),
        isRetrying: false
      }

      act(() => {
        result.current.addError(testError)
      })

      act(() => {
        result.current.clearAllErrors()
      })

      expect(result.current.error).toBeNull()
    })

    it('should allow adding new error after clearing', () => {
      const { result } = renderHook(() => useResourceErrors(), {
        wrapper: ResourceErrorProvider
      })

      const firstError = {
        id: 'error-1',
        error: new Error('First error'),
        title: 'First Error',
        onRetry: vi.fn(),
        isRetrying: false
      }

      const secondError = {
        id: 'error-2',
        error: new Error('Second error'),
        title: 'Second Error',
        onRetry: vi.fn(),
        isRetrying: false
      }

      act(() => {
        result.current.addError(firstError)
      })

      act(() => {
        result.current.clearAllErrors()
      })

      act(() => {
        result.current.addError(secondError)
      })

      expect(result.current.error?.id).toBe('error-2')
    })
  })

  describe('Error state management', () => {
    it('should maintain error state across renders', () => {
      const { result, rerender } = renderHook(() => useResourceErrors(), {
        wrapper: ResourceErrorProvider
      })

      const testError = {
        id: 'error-1',
        error: new Error('Test error'),
        title: 'Test Error',
        onRetry: vi.fn(),
        isRetrying: false
      }

      act(() => {
        result.current.addError(testError)
      })

      rerender()

      expect(result.current.error?.id).toBe('error-1')
    })

    it('should handle rapid error updates', () => {
      const { result } = renderHook(() => useResourceErrors(), {
        wrapper: ResourceErrorProvider
      })

      act(() => {
        result.current.addError({
          id: 'error-1',
          error: new Error('Error 1'),
          title: 'Error 1',
          onRetry: vi.fn(),
          isRetrying: false
        })

        result.current.addError({
          id: 'error-2',
          error: new Error('Error 2'),
          title: 'Error 2',
          onRetry: vi.fn(),
          isRetrying: false
        })

        result.current.addError({
          id: 'error-3',
          error: new Error('Error 3'),
          title: 'Error 3',
          onRetry: vi.fn(),
          isRetrying: false
        })
      })

      expect(result.current.error?.id).toBe('error-3')
    })

    it('should handle error lifecycle', () => {
      const { result } = renderHook(() => useResourceErrors(), {
        wrapper: ResourceErrorProvider
      })

      /* Initial state */
      expect(result.current.error).toBeNull()

      /* Add error */
      act(() => {
        result.current.addError({
          id: 'error-1',
          error: new Error('Test error'),
          title: 'Test Error',
          onRetry: vi.fn(),
          isRetrying: false
        })
      })

      expect(result.current.error).not.toBeNull()

      /* Update error state */
      act(() => {
        result.current.addError({
          id: 'error-1',
          error: new Error('Test error'),
          title: 'Test Error',
          onRetry: vi.fn(),
          isRetrying: true
        })
      })

      expect(result.current.error?.isRetrying).toBe(true)

      /* Remove error */
      act(() => {
        result.current.removeError('error-1')
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('Multiple consumers', () => {
    it('should share state between multiple consumers', () => {
      const Consumer1 = () => {
        const { error } = useResourceErrors()
        return <div data-testid="consumer-1">{error?.id || 'no-error'}</div>
      }

      const Consumer2 = () => {
        const { error } = useResourceErrors()
        return <div data-testid="consumer-2">{error?.id || 'no-error'}</div>
      }

      const Consumer3 = () => {
        const { addError } = useResourceErrors()
        return (
          <button
            onClick={() =>
              addError({
                id: 'shared-error',
                error: new Error('Shared error'),
                title: 'Shared Error',
                onRetry: vi.fn(),
                isRetrying: false
              })
            }
            data-testid="add-error-btn"
          >
            Add Error
          </button>
        )
      }

      render(
        <ResourceErrorProvider>
          <Consumer1 />
          <Consumer2 />
          <Consumer3 />
        </ResourceErrorProvider>
      )

      expect(screen.getByTestId('consumer-1')).toHaveTextContent('no-error')
      expect(screen.getByTestId('consumer-2')).toHaveTextContent('no-error')

      act(() => {
        screen.getByTestId('add-error-btn').click()
      })

      waitFor(() => {
        expect(screen.getByTestId('consumer-1')).toHaveTextContent('shared-error')
        expect(screen.getByTestId('consumer-2')).toHaveTextContent('shared-error')
      })
    })
  })

  describe('Type safety', () => {
    it('should enforce ResourceError interface', () => {
      const { result } = renderHook(() => useResourceErrors(), {
        wrapper: ResourceErrorProvider
      })

      const validError = {
        id: 'error-1',
        error: new Error('Test'),
        title: 'Test',
        onRetry: vi.fn(),
        isRetrying: false
      }

      act(() => {
        result.current.addError(validError)
      })

      expect(result.current.error).toEqual(validError)
    })

    it('should handle error field as any type', () => {
      const { result } = renderHook(() => useResourceErrors(), {
        wrapper: ResourceErrorProvider
      })

      const errors = [
        { id: '1', error: 'string', title: 'T', onRetry: vi.fn(), isRetrying: false },
        { id: '2', error: 123, title: 'T', onRetry: vi.fn(), isRetrying: false },
        { id: '3', error: { code: 500 }, title: 'T', onRetry: vi.fn(), isRetrying: false },
        { id: '4', error: null, title: 'T', onRetry: vi.fn(), isRetrying: false },
        { id: '5', error: undefined, title: 'T', onRetry: vi.fn(), isRetrying: false }
      ]

      errors.forEach(error => {
        act(() => {
          result.current.addError(error)
        })
        expect(result.current.error?.error).toBe(error.error)
      })
    })
  })

  describe('Integration scenarios', () => {
    it('should support retry workflow', () => {
      const { result } = renderHook(() => useResourceErrors(), {
        wrapper: ResourceErrorProvider
      })

      const retryFn = vi.fn()

      act(() => {
        result.current.addError({
          id: 'retry-error',
          error: new Error('Network error'),
          title: 'Network Error',
          onRetry: retryFn,
          isRetrying: false
        })
      })

      /* Simulate retry */
      act(() => {
        result.current.addError({
          id: 'retry-error',
          error: new Error('Network error'),
          title: 'Network Error',
          onRetry: retryFn,
          isRetrying: true
        })
      })

      expect(result.current.error?.isRetrying).toBe(true)

      /* Simulate success after retry */
      act(() => {
        result.current.removeError('retry-error')
      })

      expect(result.current.error).toBeNull()
    })

    it('should handle error replacement pattern', () => {
      const { result } = renderHook(() => useResourceErrors(), {
        wrapper: ResourceErrorProvider
      })

      /* Add initial error */
      act(() => {
        result.current.addError({
          id: 'initial-error',
          error: new Error('Initial'),
          title: 'Initial',
          onRetry: vi.fn(),
          isRetrying: false
        })
      })

      /* Replace with new error */
      act(() => {
        result.current.addError({
          id: 'replacement-error',
          error: new Error('Replacement'),
          title: 'Replacement',
          onRetry: vi.fn(),
          isRetrying: false
        })
      })

      expect(result.current.error?.id).toBe('replacement-error')
    })
  })
})
