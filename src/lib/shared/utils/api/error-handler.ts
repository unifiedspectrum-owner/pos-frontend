/* Reusable API error handling utilities */

/* Shared module imports */
import axios, { AxiosError } from 'axios'
import { createToastNotification } from '../ui/notifications'
import { ValidationError } from '@shared/types'

/* API error response structure interface */
interface APIErrorResponse {
  success: boolean
  message?: string
  error?: string
  validation_errors?: ValidationError[]
}

/* Configuration for error handling behavior */
interface ErrorHandlerConfig {
  title?: string
}

/* Reusable API error handler with toast integration */
export const handleApiError = (
  error: AxiosError,
  config: ErrorHandlerConfig
) => {
  const {
    title = 'Operation Failed',
  } = config;

  if (!axios.isAxiosError(error)) {
    createToastNotification({
      title,
      description: 'An unexpected error occurred.',
      type: 'error'
    });
    return;
  }

  const err = error as AxiosError<APIErrorResponse>

  /* Handle structured API error responses */
  if (err.response?.data) {
    const responseData: APIErrorResponse = err.response.data;
    console.log(title, responseData);

    /* Handle validation errors */
    if (responseData.validation_errors && responseData.validation_errors.length > 0) {
      responseData.validation_errors.forEach((validationError: ValidationError) => {
        createToastNotification({
          title: responseData.message || 'Validation Error',
          description: validationError.message || 'Please check the form and try again.',
          type: 'error'
        })
      })
      
      createToastNotification({
        title: responseData.message || 'Validation Error',
        description: responseData.error || 'Please check the form and try again.',
        type: 'error'
      })
      return
    }

    /* Handle general API errors */
    if (responseData.error || responseData.message) {
      createToastNotification({
        title: responseData.message || title,
        description: responseData.error || 'An error occurred during the operation.',
        type: 'error'
      })
      return
    }

    /* Handle failed responses without specific error messages */
    if (responseData.success === false) {
      createToastNotification({
        title: responseData.message || title,
        description: responseData.error || 'Operation failed. Please try again.',
        type: 'error'
      })
      return
    }
  }

  /* Handle network/connection errors */
  createToastNotification({
    title: 'Connection Error',
    description: 'Unable to connect to the server. Please check your connection and try again.',
    type: 'error'
  })
}