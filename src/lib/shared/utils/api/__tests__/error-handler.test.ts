/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AxiosError } from 'axios'

/* Shared module imports */
import { handleApiError } from '@shared/utils/api/error-handler'
import { ValidationError } from '@shared/types'

/* Mock the notifications utility */
vi.mock('@shared/utils/ui/notifications', () => ({
  createToastNotification: vi.fn()
}))

import { createToastNotification } from '@shared/utils/ui/notifications'

describe('API Error Handler Utility', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn> | undefined

  beforeEach(() => {
    vi.clearAllMocks()
    /* Suppress console logs */
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy?.mockRestore()
  })

  describe('handleApiError', () => {
    describe('Validation Errors', () => {
      it('should handle single validation error', () => {
        const validationErrors: ValidationError[] = [
          { field: 'email', message: 'Invalid email format' }
        ]

        const error = {
          isAxiosError: true,
          response: {
            data: {
              success: false,
              message: 'Validation failed',
              error: 'Please check the form',
              validation_errors: validationErrors
            }
          }
        } as AxiosError

        handleApiError(error, { title: 'Form Submission Failed' })

        expect(createToastNotification).toHaveBeenCalledWith({
          title: 'Validation failed',
          description: 'Invalid email format',
          type: 'error'
        })

        expect(createToastNotification).toHaveBeenCalledWith({
          title: 'Validation failed',
          description: 'Please check the form',
          type: 'error'
        })
      })

      it('should handle multiple validation errors', () => {
        const validationErrors: ValidationError[] = [
          { field: 'email', message: 'Invalid email format' },
          { field: 'password', message: 'Password too short' },
          { field: 'username', message: 'Username already taken' }
        ]

        const error = {
          isAxiosError: true,
          response: {
            data: {
              success: false,
              message: 'Multiple validation errors',
              validation_errors: validationErrors
            }
          }
        } as AxiosError

        handleApiError(error, { title: 'Registration Failed' })

        expect(createToastNotification).toHaveBeenCalledTimes(4)
      })

      it('should use default message when validation error message is missing', () => {
        const validationErrors: ValidationError[] = [
          { field: 'email', message: '' }
        ]

        const error = {
          isAxiosError: true,
          response: {
            data: {
              success: false,
              validation_errors: validationErrors
            }
          }
        } as AxiosError

        handleApiError(error, { title: 'Error' })

        expect(createToastNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            description: expect.stringContaining('check the form')
          })
        )
      })

      it('should handle empty validation errors array', () => {
        const error = {
          isAxiosError: true,
          response: {
            data: {
              success: false,
              validation_errors: []
            }
          }
        } as AxiosError

        handleApiError(error, { title: 'Error' })

        /* Should not enter validation error handling path */
        expect(createToastNotification).not.toHaveBeenCalledWith(
          expect.objectContaining({
            description: expect.stringContaining('check the form')
          })
        )
      })
    })

    describe('General API Errors', () => {
      it('should handle error with message and error properties', () => {
        const error = {
          isAxiosError: true,
          response: {
            data: {
              success: false,
              message: 'Operation Failed',
              error: 'Insufficient permissions'
            }
          }
        } as AxiosError

        handleApiError(error, { title: 'Access Denied' })

        expect(createToastNotification).toHaveBeenCalledWith({
          title: 'Operation Failed',
          description: 'Insufficient permissions',
          type: 'error'
        })
      })

      it('should handle error with only message property', () => {
        const error = {
          isAxiosError: true,
          response: {
            data: {
              success: false,
              message: 'Resource not found'
            }
          }
        } as AxiosError

        handleApiError(error, { title: 'Not Found' })

        expect(createToastNotification).toHaveBeenCalledWith({
          title: 'Resource not found',
          description: 'An error occurred during the operation.',
          type: 'error'
        })
      })

      it('should handle error with only error property', () => {
        const error = {
          isAxiosError: true,
          response: {
            data: {
              success: false,
              error: 'Database connection failed'
            }
          }
        } as AxiosError

        handleApiError(error, { title: 'Server Error' })

        expect(createToastNotification).toHaveBeenCalledWith({
          title: 'Server Error',
          description: 'Database connection failed',
          type: 'error'
        })
      })

      it('should use custom title from config', () => {
        const error = {
          isAxiosError: true,
          response: {
            data: {
              success: false,
              error: 'Something went wrong'
            }
          }
        } as AxiosError

        handleApiError(error, { title: 'Custom Error Title' })

        expect(createToastNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Custom Error Title'
          })
        )
      })

      it('should use default title when not provided', () => {
        const error = {
          isAxiosError: true,
          response: {
            data: {
              success: false,
              error: 'Error occurred'
            }
          }
        } as AxiosError

        handleApiError(error, {})

        expect(createToastNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Operation Failed'
          })
        )
      })
    })

    describe('Failed Response Without Error Messages', () => {
      it('should handle success=false with no error messages', () => {
        const error = {
          isAxiosError: true,
          response: {
            data: {
              success: false
            }
          }
        } as AxiosError

        handleApiError(error, { title: 'Request Failed' })

        expect(createToastNotification).toHaveBeenCalledWith({
          title: 'Request Failed',
          description: 'Operation failed. Please try again.',
          type: 'error'
        })
      })

      it('should use message when available', () => {
        const error = {
          isAxiosError: true,
          response: {
            data: {
              success: false,
              message: 'Custom failure message'
            }
          }
        } as AxiosError

        handleApiError(error, { title: 'Failed' })

        expect(createToastNotification).toHaveBeenCalledWith({
          title: 'Custom failure message',
          description: 'An error occurred during the operation.',
          type: 'error'
        })
      })
    })

    describe('Network/Connection Errors', () => {
      it('should handle network error with no response', () => {
        const error = {
          isAxiosError: true,
          response: undefined
        } as AxiosError

        handleApiError(error, { title: 'Network Error' })

        expect(createToastNotification).toHaveBeenCalledWith({
          title: 'Connection Error',
          description: 'Unable to connect to the server. Please check your connection and try again.',
          type: 'error'
        })
      })

      it('should handle error with no response data', () => {
        const error = {
          isAxiosError: true,
          response: {
            data: undefined
          }
        } as AxiosError

        handleApiError(error, { title: 'Error' })

        expect(createToastNotification).toHaveBeenCalledWith({
          title: 'Connection Error',
          description: expect.stringContaining('Unable to connect'),
          type: 'error'
        })
      })

      it('should handle timeout errors', () => {
        const error = {
          isAxiosError: true,
          code: 'ECONNABORTED'
        } as AxiosError

        handleApiError(error, { title: 'Timeout' })

        expect(createToastNotification).toHaveBeenCalledWith({
          title: 'Connection Error',
          description: expect.stringContaining('Unable to connect'),
          type: 'error'
        })
      })
    })

    describe('Non-Axios Errors', () => {
      it('should handle non-axios error', () => {
        const error = new Error('Regular error') as unknown as AxiosError

        handleApiError(error, { title: 'Unexpected Error' })

        expect(createToastNotification).toHaveBeenCalledWith({
          title: 'Unexpected Error',
          description: 'An unexpected error occurred.',
          type: 'error'
        })
      })

      it('should handle undefined error', () => {
        const error = undefined as unknown as AxiosError

        handleApiError(error, { title: 'Unknown Error' })

        expect(createToastNotification).toHaveBeenCalledWith({
          title: 'Unknown Error',
          description: 'An unexpected error occurred.',
          type: 'error'
        })
      })

      it('should handle null error', () => {
        const error = null as unknown as AxiosError

        handleApiError(error, { title: 'Null Error' })

        expect(createToastNotification).toHaveBeenCalledWith({
          title: 'Null Error',
          description: 'An unexpected error occurred.',
          type: 'error'
        })
      })
    })

    describe('HTTP Status Codes', () => {
      it('should handle 400 Bad Request', () => {
        const error = {
          isAxiosError: true,
          response: {
            status: 400,
            data: {
              success: false,
              message: 'Bad Request',
              error: 'Invalid parameters'
            }
          }
        } as AxiosError

        handleApiError(error, { title: '400 Error' })

        expect(createToastNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'error'
          })
        )
      })

      it('should handle 401 Unauthorized', () => {
        const error = {
          isAxiosError: true,
          response: {
            status: 401,
            data: {
              success: false,
              message: 'Unauthorized',
              error: 'Invalid credentials'
            }
          }
        } as AxiosError

        handleApiError(error, { title: 'Authentication Failed' })

        expect(createToastNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Unauthorized'
          })
        )
      })

      it('should handle 403 Forbidden', () => {
        const error = {
          isAxiosError: true,
          response: {
            status: 403,
            data: {
              success: false,
              error: 'Access denied'
            }
          }
        } as AxiosError

        handleApiError(error, { title: 'Forbidden' })

        expect(createToastNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            description: 'Access denied'
          })
        )
      })

      it('should handle 404 Not Found', () => {
        const error = {
          isAxiosError: true,
          response: {
            status: 404,
            data: {
              success: false,
              message: 'Resource not found'
            }
          }
        } as AxiosError

        handleApiError(error, { title: 'Not Found' })

        expect(createToastNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Resource not found'
          })
        )
      })

      it('should handle 500 Internal Server Error', () => {
        const error = {
          isAxiosError: true,
          response: {
            status: 500,
            data: {
              success: false,
              error: 'Internal server error'
            }
          }
        } as AxiosError

        handleApiError(error, { title: 'Server Error' })

        expect(createToastNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            description: 'Internal server error'
          })
        )
      })
    })

    describe('Logging', () => {
      it('should log error response data', () => {
        const error = {
          isAxiosError: true,
          response: {
            data: {
              success: false,
              message: 'Test error'
            }
          }
        } as AxiosError

        handleApiError(error, { title: 'Test Title' })

        expect(console.log).toHaveBeenCalledWith('Test Title', {
          success: false,
          message: 'Test error'
        })
      })

      it('should log with custom title', () => {
        const error = {
          isAxiosError: true,
          response: {
            data: {
              success: false
            }
          }
        } as AxiosError

        handleApiError(error, { title: 'Custom Log Title' })

        expect(console.log).toHaveBeenCalledWith('Custom Log Title', expect.any(Object))
      })
    })

    describe('Edge Cases', () => {
      it('should handle empty response data object', () => {
        const error = {
          isAxiosError: true,
          response: {
            data: {}
          }
        } as AxiosError

        handleApiError(error, { title: 'Empty Response' })

        expect(createToastNotification).toHaveBeenCalledWith({
          title: 'Connection Error',
          description: expect.stringContaining('Unable to connect'),
          type: 'error'
        })
      })

      it('should handle response with null data', () => {
        const error = {
          isAxiosError: true,
          response: {
            data: null
          }
        } as AxiosError

        handleApiError(error, { title: 'Null Data' })

        expect(createToastNotification).toHaveBeenCalledWith({
          title: 'Connection Error',
          description: expect.stringContaining('Unable to connect'),
          type: 'error'
        })
      })

      it('should handle validation errors with missing field names', () => {
        const validationErrors: ValidationError[] = [
          { field: '', message: 'Error without field' }
        ]

        const error = {
          isAxiosError: true,
          response: {
            data: {
              success: false,
              validation_errors: validationErrors
            }
          }
        } as AxiosError

        handleApiError(error, { title: 'Validation Error' })

        expect(createToastNotification).toHaveBeenCalled()
      })

      it('should handle very long error messages', () => {
        const longMessage = 'Error '.repeat(100)

        const error = {
          isAxiosError: true,
          response: {
            data: {
              success: false,
              error: longMessage
            }
          }
        } as AxiosError

        handleApiError(error, { title: 'Long Error' })

        expect(createToastNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            description: longMessage
          })
        )
      })

      it('should handle special characters in error messages', () => {
        const error = {
          isAxiosError: true,
          response: {
            data: {
              success: false,
              error: 'Error with <special> & "characters"'
            }
          }
        } as AxiosError

        handleApiError(error, { title: 'Special Chars' })

        expect(createToastNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            description: 'Error with <special> & "characters"'
          })
        )
      })
    })

    describe('Toast Notification Properties', () => {
      it('should always use error type for notifications', () => {
        const error = {
          isAxiosError: true,
          response: {
            data: {
              success: false,
              error: 'Test error'
            }
          }
        } as AxiosError

        handleApiError(error, { title: 'Test' })

        expect(createToastNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'error'
          })
        )
      })

      it('should provide both title and description', () => {
        const error = {
          isAxiosError: true,
          response: {
            data: {
              success: false,
              message: 'Error title',
              error: 'Error description'
            }
          }
        } as AxiosError

        handleApiError(error, { title: 'Fallback' })

        expect(createToastNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            title: expect.any(String),
            description: expect.any(String)
          })
        )
      })
    })

    describe('Priority of Error Messages', () => {
      it('should prioritize message over title in config', () => {
        const error = {
          isAxiosError: true,
          response: {
            data: {
              success: false,
              message: 'Response message',
              error: 'Response error'
            }
          }
        } as AxiosError

        handleApiError(error, { title: 'Config title' })

        expect(createToastNotification).toHaveBeenCalledWith({
          title: 'Response message',
          description: 'Response error',
          type: 'error'
        })
      })

      it('should use title when message is not available', () => {
        const error = {
          isAxiosError: true,
          response: {
            data: {
              success: false,
              error: 'Some error'
            }
          }
        } as AxiosError

        handleApiError(error, { title: 'Config title' })

        expect(createToastNotification).toHaveBeenCalledWith({
          title: 'Config title',
          description: 'Some error',
          type: 'error'
        })
      })
    })

    describe('Integration Tests', () => {
      it('should handle complete registration error workflow', () => {
        const validationErrors: ValidationError[] = [
          { field: 'email', message: 'Email already exists' },
          { field: 'password', message: 'Password must be at least 8 characters' }
        ]

        const error = {
          isAxiosError: true,
          response: {
            status: 422,
            data: {
              success: false,
              message: 'Registration failed',
              error: 'Please fix the errors and try again',
              validation_errors: validationErrors
            }
          }
        } as AxiosError

        handleApiError(error, { title: 'Registration Error' })

        /* Should call for each validation error + general error */
        expect(createToastNotification).toHaveBeenCalledTimes(3)
      })

      it('should handle complete login error workflow', () => {
        const error = {
          isAxiosError: true,
          response: {
            status: 401,
            data: {
              success: false,
              message: 'Authentication failed',
              error: 'Invalid username or password'
            }
          }
        } as AxiosError

        handleApiError(error, { title: 'Login Failed' })

        expect(createToastNotification).toHaveBeenCalledWith({
          title: 'Authentication failed',
          description: 'Invalid username or password',
          type: 'error'
        })
      })

      it('should handle network timeout scenario', () => {
        const error = {
          isAxiosError: true,
          code: 'ECONNABORTED',
          message: 'timeout of 5000ms exceeded'
        } as AxiosError

        handleApiError(error, { title: 'Request Timeout' })

        expect(createToastNotification).toHaveBeenCalledWith({
          title: 'Connection Error',
          description: expect.stringContaining('Unable to connect'),
          type: 'error'
        })
      })
    })
  })
})
