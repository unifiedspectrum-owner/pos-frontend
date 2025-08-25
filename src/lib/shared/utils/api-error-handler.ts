import { toaster } from '@/components/ui/toaster'

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
  config: ErrorHandlerConfig = {}
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
        toaster.create({
          title: responseData.message || 'Validation Error',
          description: validationError.message || 'Please check the form and try again.',
          type: 'error',
          duration: 5000,
          closable: true
        })
      })
      
      toaster.create({
        title: responseData.message || 'Validation Error',
        description: responseData.error || 'Please check the form and try again.',
        type: 'error',
        duration: 5000,
        closable: true
      })
      return
    }

    /* Handle general API errors */
    if (responseData.error || responseData.message) {
      toaster.create({
        title: responseData.message || title,
        description: responseData.error || 'An error occurred during the operation.',
        type: 'error',
        duration: 5000,
        closable: true
      })
      return
    }

    /* Handle failed responses without specific error messages */
    if (responseData.success === false) {
      toaster.create({
        title: responseData.message || title,
        description: responseData.error || 'Operation failed. Please try again.',
        type: 'error',
        duration: 5000,
        closable: true
      })
      return
    }
  }

  /* Handle network/connection errors */
  toaster.create({
    title: 'Connection Error',
    description: 'Unable to connect to the server. Please check your connection and try again.',
    type: 'error',
     duration: 5000,
    closable: true
  })
}
