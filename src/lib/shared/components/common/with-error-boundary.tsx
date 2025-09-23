/* React and Chakra UI component imports */
'use client';
import React from 'react';

/* Shared module imports */
import ErrorBoundary, { ErrorBoundaryProps } from '@shared/components/common/error-boundary';

/* Higher-order component that wraps components with error boundary */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const ComponentWithErrorBoundary = (props: P) => {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };

  /* Set display name for debugging */
  ComponentWithErrorBoundary.displayName = 
    `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return ComponentWithErrorBoundary;
}

/* Specific HOC for form components with custom error handling */
export function withFormErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: {
    onError?: (error: Error, errorInfo: unknown) => void;
    maxRetries?: number;
    componentName?: string;
  }
) {
  const { onError, maxRetries = 2, componentName } = options || {};

  return withErrorBoundary(WrappedComponent, {
    onError: (error, errorInfo) => {
      /* Custom logging for form errors */
      console.error(`Form Error in ${componentName || WrappedComponent.name}:`, {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      });

      /* Call custom error handler if provided */
      if (onError) {
        onError(error, errorInfo);
      }

      /* Here you could send to analytics/monitoring service */
      // trackFormError(componentName || WrappedComponent.name, error);
    },
    maxRetries,
    showErrorDetails: process.env.NODE_ENV === 'development',
  });
}

/* Specific HOC for tab components with retry logic */
export function withTabErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  tabName?: string
) {
  return withErrorBoundary(WrappedComponent, {
    onError: (error, errorInfo) => {
      console.error(`Tab Error in ${tabName || WrappedComponent.name}:`, {
        error: error.message,
        tab: tabName,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      });

      /* Analytics tracking for tab errors */
      // trackTabError(tabName, error);
    },
    maxRetries: 1, // Tabs usually need full reload
    showErrorDetails: false, // Hide technical details in production tabs
  });
}

export default withErrorBoundary;