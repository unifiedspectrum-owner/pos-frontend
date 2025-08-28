import { createToastMessage } from '@shared/utils/ui/toast'

/* Interface for validation errors from API response */
interface ValidationError {
  field: string
  message: string
}

/* Interface for API error response structure */
interface APIErrorResponse {
  success: boolean
  message?: string
  error?: string
  validation_errors?: ValidationError[]
}

/* Configuration for error handling behavior */
interface ErrorHandlerConfig {
  title?: string /* Default title for error toasts */
}

/* Reusable API error handler based on verification.tsx pattern */
export const handleApiError = (
  err: any,
  config: ErrorHandlerConfig
) => {
  const {
    title = 'Operation Failed',
  } = config

  /* Handle structured API error responses */
  if (err.response?.data) {
    const responseData: APIErrorResponse = err.response.data

    /* Handle validation errors if form setError function is provided */
    if ( responseData.validation_errors && responseData.validation_errors.length > 0) {
      responseData.validation_errors.forEach((validationError: ValidationError) => {
        createToastMessage({
          title: responseData.message || 'Validation Error',
          description: validationError.message || 'Please check the form and try again.',
          type: 'error'
        })
      })
      
      createToastMessage({
        title: responseData.message || 'Validation Error',
        description: responseData.error || 'Please check the form and try again.',
        type: 'error'
      })
      return
    }

    /* Handle general API errors */
    if (responseData.error || responseData.message) {
      createToastMessage({
        title: responseData.message || title,
        description: responseData.error || 'An error occurred during the operation.',
        type: 'error'
      })
      return
    }

    /* Handle failed responses without specific error messages */
    if (responseData.success === false) {
      createToastMessage({
        title: responseData.message || title,
        description: responseData.error || 'Operation failed. Please try again.',
        type: 'error'
      })
      return
    }
  }

  /* Handle network/connection errors */
  createToastMessage({
    title: 'Connection Error',
    description: 'Unable to connect to the server. Please check your connection and try again.',
    type: 'error'
  })
}
