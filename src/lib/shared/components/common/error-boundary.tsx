import React from 'react';
import { Box, Flex, Text, VStack, HStack } from '@chakra-ui/react';
import { lighten } from 'polished';
import { FiAlertTriangle, FiRefreshCw, FiRotateCcw, FiHome } from 'react-icons/fi';
import { ERROR_RED_COLOR, GRAY_COLOR, DARK_COLOR } from '@shared/config';
import { PrimaryButton, SecondaryButton } from '@shared/components/form-elements';

/* React error information structure */
interface ErrorInfo {
  componentStack: string; /* Component stack trace */
}

/* Error boundary component state */
interface ErrorBoundaryState {
  hasError: boolean; /* Whether an error has occurred */
  error: Error | null; /* The caught error object */
  errorInfo: ErrorInfo | null; /* Additional error information */
  retryCount: number; /* Number of retry attempts */
}

/* Props for error boundary component */
interface ErrorBoundaryProps {
  children: React.ReactNode; /* Child components to wrap */
  fallback?: React.ComponentType<ErrorFallbackProps>; /* Custom error fallback component */
  onError?: (error: Error, errorInfo: ErrorInfo) => void; /* Error event handler */
  maxRetries?: number; /* Maximum retry attempts allowed */
  showErrorDetails?: boolean; /* Whether to show technical error details */
}

/* Props for error fallback component */
interface ErrorFallbackProps {
  error: Error; /* The error that occurred */
  errorInfo: ErrorInfo | null; /* Additional error information */
  onRetry: () => void; /* Retry action handler */
  onReload: () => void; /* Page reload handler */
  onNavigateHome?: () => void; /* Navigate to home handler */
  retryCount: number; /* Current retry attempt count */
  maxRetries: number; /* Maximum retry attempts allowed */
  showErrorDetails: boolean; /* Whether to display technical details */
}

/* Default error fallback component */
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  onRetry,
  onReload,
  onNavigateHome,
  retryCount,
  maxRetries,
  showErrorDetails
}) => {
  const canRetry = retryCount < maxRetries;

  return (
    <Flex p={6} w="100%" justify="center">
      <Box
        maxW="600px"
        w="100%"
        p={6}
        borderWidth={1}
        borderRadius="lg"
        borderColor={lighten(0.3, GRAY_COLOR)}
        bg="white"
        shadow="md"
      >
        <VStack gap={6} align="stretch">
          {/* Error Icon and Title */}
          <Flex align="center" gap={4}>
            <Box>
              <FiAlertTriangle size={32} color={ERROR_RED_COLOR} />
            </Box>
            <VStack align="flex-start" gap={1}>
              <Text fontSize="xl" fontWeight="semibold" color={DARK_COLOR}>
                Something went wrong
              </Text>
              <Text fontSize="sm" color={lighten(0.2, GRAY_COLOR)}>
                An unexpected error occurred in this component
              </Text>
            </VStack>
          </Flex>

          {/* Error Message */}
          <Box
            p={4}
            borderRadius="md"
            bg={lighten(0.95, ERROR_RED_COLOR)}
            borderWidth={1}
            borderColor={lighten(0.7, ERROR_RED_COLOR)}
          >
            <Text fontSize="sm" fontWeight="medium" color={ERROR_RED_COLOR}>
              {error.message}
            </Text>
          </Box>

          {/* Error Details (Development/Debug Mode) */}
          {showErrorDetails && (
            <Box>
              <Text fontSize="sm" fontWeight="medium" color={DARK_COLOR} mb={2}>
                Error Details:
              </Text>
              <Box
                p={3}
                bg={lighten(0.98, GRAY_COLOR)}
                borderRadius="md"
                borderWidth={1}
                borderColor={lighten(0.3, GRAY_COLOR)}
                maxH="200px"
                overflow="auto"
                fontFamily="monospace"
                fontSize="xs"
                color={lighten(0.1, GRAY_COLOR)}
                whiteSpace="pre-wrap"
              >
                <Text mb={2}>
                  <Text as="span" fontWeight="bold">Stack:</Text>
                  {'\n'}{error.stack}
                </Text>
                {errorInfo?.componentStack && (
                  <Text>
                    <Text as="span" fontWeight="bold">Component Stack:</Text>
                    {'\n'}{errorInfo.componentStack}
                  </Text>
                )}
              </Box>
            </Box>
          )}

          {/* Retry Information */}
          {retryCount > 0 && (
            <Box
              p={3}
              bg={lighten(0.95, '#f59e0b')}
              borderWidth={1}
              borderColor={lighten(0.7, '#f59e0b')}
              borderRadius="md"
            >
              <Text fontSize="sm" color={'#f59e0b'}>
                Retry attempt {retryCount} of {maxRetries}
                {!canRetry && ' (Maximum retries reached)'}
              </Text>
            </Box>
          )}

          {/* Suggestions */}
          <Box>
            <Text fontSize="sm" fontWeight="medium" color={DARK_COLOR} mb={2}>
              What you can try:
            </Text>
            <VStack align="flex-start" fontSize="sm" color={lighten(0.1, GRAY_COLOR)} gap={1}>
              <Text>• Refresh the page to reload the component</Text>
              <Text>• Clear your browser cache and cookies</Text>
              <Text>• Try navigating to a different page and coming back</Text>
              <Text>• Contact support if this problem persists</Text>
            </VStack>
          </Box>

          {/* Action Buttons */}
          <HStack gap={3} justify="center">
            {canRetry && (
              <PrimaryButton
                onClick={onRetry}
                leftIcon={FiRefreshCw}
                size="sm"
              >
                Try Again
              </PrimaryButton>
            )}
            
            <SecondaryButton
              onClick={onReload}
              leftIcon={FiRotateCcw}
              size="sm"
            >
              Reload Page
            </SecondaryButton>

            {onNavigateHome && (
              <SecondaryButton
                onClick={onNavigateHome}
                leftIcon={FiHome}
                size="sm"
              >
                Go Home
              </SecondaryButton>
            )}
          </HStack>
        </VStack>
      </Box>
    </Flex>
  );
};

/* React Error Boundary Component */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };

    this.handleRetry = this.handleRetry.bind(this);
    this.handleReload = this.handleReload.bind(this);
    this.handleNavigateHome = this.handleNavigateHome.bind(this);
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    /* Call error callback if provided */
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    /* Log error to console in development */
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    /* Here you could also send error to logging service */
    // logErrorToService(error, errorInfo);
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) {
      return;
    }

    this.setState(prevState => ({
      retryCount: prevState.retryCount + 1,
    }));

    /* Reset error state after a brief delay to allow component remount */
    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      });
    }, 100);
  };

  handleReload = () => {
    window.location.reload();
  };

  handleNavigateHome = () => {
    /* Navigate to home - implementation depends on your routing setup */
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', '/');
      window.location.reload();
    }
  };

  render() {
    const { hasError, error, errorInfo, retryCount } = this.state;
    const { 
      children, 
      fallback: FallbackComponent = DefaultErrorFallback,
      maxRetries = 3,
      showErrorDetails = process.env.NODE_ENV === 'development'
    } = this.props;

    if (hasError && error) {
      return (
        <FallbackComponent
          error={error}
          errorInfo={errorInfo}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
          onNavigateHome={this.handleNavigateHome}
          retryCount={retryCount}
          maxRetries={maxRetries}
          showErrorDetails={showErrorDetails}
        />
      );
    }

    return children;
  }
}

export default ErrorBoundary;
export type { ErrorBoundaryProps, ErrorFallbackProps };