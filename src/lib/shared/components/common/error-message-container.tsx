import React from 'react';
import { Box, Flex, Text, VStack, HStack, IconButton } from '@chakra-ui/react';
import { lighten } from 'polished';
import { FiWifi, FiServer, FiAlertCircle, FiRefreshCw, FiRotateCcw, FiX } from 'react-icons/fi';
import { ERROR_RED_COLOR, GRAY_COLOR, DARK_COLOR } from '@shared/config';
import { PrimaryButton, SecondaryButton } from '@shared/components/form-elements';

/* Validation error structure */
interface ValidationError {
  field: string; /* Field name that failed validation */
  message: string; /* Validation error message */
}

/* Props for error message container component */
interface ErrorMessageContainerProps {
  error: string | Error | any; /* Error object, message, or any error type */
  title?: string; /* Custom error title */
  onRetry?: () => void; /* Retry action handler */
  onReload?: () => void; /* Page reload handler */
  onDismiss?: () => void; /* Dismiss/clear error handler */
  isRetrying?: boolean; /* Whether retry is in progress */
  showReloadButton?: boolean; /* Whether to show reload button */
  showDismissButton?: boolean; /* Whether to show dismiss (X) button */
  customTroubleshootingTips?: string[]; /* Custom troubleshooting suggestions */
  testId?: string; /* Test identifier for testing */
}

/* Process API error response to extract meaningful error message */
const processApiError = (error: any): string => {
  // Handle string errors directly (but not empty strings)
  if (typeof error === 'string' && error.trim().length > 0) {
    return error;
  }

  // Handle Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle API response errors
  if (error?.response?.data) {
    const responseData = error.response.data;
    
    // Handle validation errors
    if (responseData.validation_errors && Array.isArray(responseData.validation_errors) && responseData.validation_errors.length > 0) {
      const errorMessages = responseData.validation_errors.map((err: ValidationError) => `${err.field}: ${err.message}`).join(', ');
      return `Validation Error: ${errorMessages}`;
    }
    
    // Handle general API error messages
    if (responseData.message) {
      return responseData.message;
    }
    
    // Handle error field
    if (responseData.error) {
      return responseData.error;
    }
    
    // Handle errors array
    if (responseData.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
      return responseData.errors.join(', ');
    }
  }
  
  // Handle network/request errors
  if (error?.request && !error?.response) {
    return 'Network error. Please check your connection and try again.';
  }
  
  // Handle generic message from error object
  if (error?.message) {
    return error.message;
  }
  
  // Fallback for unknown error formats
  return 'An unexpected error occurred. Please try again.';
};

/* Error type detection helper */
const getErrorType = (error: string, hasValidationErrors: boolean = false) => {
  const errorLower = error.toLowerCase();
  
  if (hasValidationErrors || errorLower.includes('validation') || errorLower.includes('invalid') ||  errorLower.includes('unique') || errorLower.includes('exists') || errorLower.includes('required')) {
    return 'validation';
  } else if (errorLower.includes('network') || errorLower.includes('connection') || errorLower.includes('fetch')) {
    return 'network';
  } else if (errorLower.includes('auth') || errorLower.includes('401') || errorLower.includes('unauthorized')) {
    return 'auth';
  } else if (errorLower.includes('403') || errorLower.includes('permission') || errorLower.includes('forbidden')) {
    return 'permission';
  } else if (errorLower.includes('404') || errorLower.includes('not found')) {
    return 'notfound';
  } else if (errorLower.includes('server') || errorLower.includes('500') || errorLower.includes('502') || errorLower.includes('503')) {
    return 'server';
  } else if (errorLower.includes('timeout')) {
    return 'timeout';
  }
  return 'general';
};

/* Get appropriate icon based on error type */
const getErrorIcon = (error: string, hasValidationErrors: boolean = false) => {
  const errorType = getErrorType(error, hasValidationErrors);
  
  switch (errorType) {
    case 'validation':
      return <FiAlertCircle size={24} color={ERROR_RED_COLOR} />;
    case 'network':
      return <FiWifi size={24} color={ERROR_RED_COLOR} />;
    case 'server':
    case 'timeout':
      return <FiServer size={24} color={ERROR_RED_COLOR} />;
    default:
      return <FiAlertCircle size={24} color={ERROR_RED_COLOR} />;
  }
};

/* Get troubleshooting tips based on error type */
const getTroubleshootingTips = (error: string, hasValidationErrors: boolean = false): string[] => {
  const errorType = getErrorType(error, hasValidationErrors);
  
  switch (errorType) {
    case 'validation':
      return [
        'Review the highlighted fields and correct the issues',
        'Ensure all required fields are filled',
        'Check that field formats match the expected pattern',
        'Verify that values are within acceptable ranges',
        'Try submitting again after making corrections'
      ];
    case 'network':
      return [
        'Check your internet connection',
        'Try disconnecting VPN temporarily',
        'Refresh your browser',
        'Wait a few minutes and try again'
      ];
    case 'auth':
      return [
        'Log out and log back in to refresh your session',
        'Clear browser cookies and cache',
        'Contact your administrator if issue persists'
      ];
    case 'permission':
      return [
        'You may not have permission to access this resource',
        'Contact your administrator to request access',
        'Ensure you\'re logged in with the correct account'
      ];
    case 'notfound':
      return [
        'The requested resource may be temporarily unavailable',
        'Try refreshing the page',
        'Contact support if this continues'
      ];
    case 'server':
      return [
        'Our servers are experiencing issues',
        'Please wait a few minutes and try again',
        'Contact support if the problem persists'
      ];
    case 'timeout':
      return [
        'The request timed out',
        'Check your internet connection',
        'Try again with a slower connection',
        'Contact support if timeouts continue'
      ];
    default:
      return [
        'Refresh the page to try again',
        'Clear browser cache and cookies',
        'Try using a different browser',
        'Contact support if the problem continues'
      ];
  }
};

const ErrorMessageContainer: React.FC<ErrorMessageContainerProps> = ({
  error,
  title,
  onRetry,
  onReload,
  onDismiss,
  isRetrying = false,
  showReloadButton = true,
  showDismissButton = true,
  customTroubleshootingTips,
  testId = 'error-message-container'
}) => {
  // Process the error to extract meaningful message
  const processedErrorMessage = processApiError(error);
  
  // Extract validation errors for special display
  const validationErrors = error?.response?.data?.validation_errors;
  const hasValidationErrors = validationErrors && Array.isArray(validationErrors) && validationErrors.length > 0;
  
  const errorIcon = getErrorIcon(processedErrorMessage, hasValidationErrors);
  const troubleshootingTips = customTroubleshootingTips || getTroubleshootingTips(processedErrorMessage, hasValidationErrors);
  const defaultTitle = title || (hasValidationErrors ? 'Validation Error' : 'Error Loading Data');

  const handleReload = () => {
    if (onReload) {
      onReload();
    } else {
      window.location.reload();
    }
  };

  return (
    <Flex p={3} w={'100%'}>
    <Box
      p={3}
      w={'100%'}
      borderWidth={1}
      borderRadius="lg"
      borderColor={lighten(0.3, GRAY_COLOR)}
      bg="white"
      shadow="sm"
      data-testid={testId}
    >
      <Flex align="flex-start" gap={4} position="relative">
        {/* Error Icon */}
        <Box flexShrink={0}>
          {errorIcon}
        </Box>

        {/* Error Content */}
        <VStack align="stretch" flex={1} gap={1}>

        {/* Dismiss Button */}
        {showDismissButton && onDismiss && (
          <IconButton
            onClick={onDismiss}
            aria-label="Dismiss error"
            size="sm"
            variant="ghost"
            position="absolute"
            top={-2}
            right={-2}
            color={lighten(0.2, GRAY_COLOR)}
            _hover={{ 
              color: ERROR_RED_COLOR,
              bg: lighten(0.9, ERROR_RED_COLOR)
            }}
            data-testid="dismiss-error-button"
          >
            <FiX size={16} />
          </IconButton>
        )}
          {/* Error Title */}
          <Text 
            fontSize="lg" 
            fontWeight="semibold" 
            color={DARK_COLOR}
          >
            {defaultTitle}
          </Text>

          {/* Error Message */}
          <Box
            borderRadius="md"
            bg={lighten(0.95, ERROR_RED_COLOR)}
            borderWidth={1}
            borderColor={lighten(0.7, ERROR_RED_COLOR)}
          >
            {hasValidationErrors ? (
              /* Show validation errors in a structured format */
              <VStack align="stretch" gap={2}>
                <Text 
                  fontSize="sm" 
                  fontWeight="semibold"
                  color={ERROR_RED_COLOR}
                >
                  Validation Errors:
                </Text>
                <Box ml={2}>
                  {validationErrors.map((err: ValidationError, index: number) => (
                    <Text 
                      key={index} 
                      fontSize="sm" 
                      color={ERROR_RED_COLOR} 
                      mb={1}
                      _before={{
                        content: '"• "',
                        display: 'inline'
                      }}
                    >
                      {`${err.field}: ${err.message}`}
                    </Text>
                  ))}
                </Box>
              </VStack>
            ) : (
              /* Show regular error message */
              <Text 
                fontSize="sm" 
                fontWeight="medium"
                color={ERROR_RED_COLOR}
                data-testid="error-message"
              >
                {processedErrorMessage}
              </Text>
            )}
          </Box>

          {/* Troubleshooting Tips */}
          <Box>
            <Text 
              fontSize="sm" 
              fontWeight="medium" 
              color={DARK_COLOR} 
              mb={2}
            >
              What you can do:
            </Text>
            <Box ml={4}>
              {troubleshootingTips.map((tip, index) => (
                <Text 
                  key={index} 
                  fontSize="sm" 
                  color={lighten(0.1, GRAY_COLOR)}
                  mb={1}
                  _before={{
                    content: '"• "',
                    display: 'inline'
                  }}
                >
                  {tip}
                </Text>
              ))}
            </Box>
          </Box>

          {/* Action Buttons */}
          <HStack gap={3}>
            {onRetry && (
              <PrimaryButton
                onClick={onRetry}
                disabled={isRetrying}
                loading={isRetrying}
                leftIcon={FiRefreshCw}
                size="sm"
              >
                {isRetrying ? 'Retrying...' : 'Try Again'}
              </PrimaryButton>
            )}

            {showReloadButton && (
              <SecondaryButton
                onClick={handleReload}
                leftIcon={FiRotateCcw}
                size="sm"
              >
                Reload Page
              </SecondaryButton>
            )}
          </HStack>
        </VStack>
      </Flex>
    </Box>
    </Flex>
  );
};

export default ErrorMessageContainer;