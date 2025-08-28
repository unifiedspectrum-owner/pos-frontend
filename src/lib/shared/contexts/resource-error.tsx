/* React and Chakra UI component imports */
import React, { createContext, useContext, useState, ReactNode } from 'react';

/* Resource error with retry functionality */
interface ResourceError {
  id: string; /* Unique error identifier */
  error: any; /* Error object or message */
  title: string; /* Human-readable error title */
  onRetry: () => void; /* Retry function handler */
  isRetrying: boolean; /* Retry operation status */
}

/* Context API interface for error management */
interface ResourceErrorContextType {
  error: ResourceError | null; /* Current active error */
  addError: (error: ResourceError) => void; /* Add new error handler */
  removeError: (id: string) => void; /* Remove specific error handler */
  clearAllErrors: () => void; /* Clear all errors handler */
}

/* Provider props interface */
interface ResourceErrorProviderProps {
  children: ReactNode; /* Child components */
}

/* Resource error context instance */
const ResourceErrorContext = createContext<ResourceErrorContextType | undefined>(undefined);

/* Custom hook to access resource error context */
export const useResourceErrors = () => {
  const context = useContext(ResourceErrorContext);
  if (!context) {
    throw new Error('useResourceErrors must be used within ResourceErrorProvider');
  }
  return context;
};

/* Resource error context provider component */
export const ResourceErrorProvider: React.FC<ResourceErrorProviderProps> = ({ children }) => {
  /* Current error state */
  const [error, setError] = useState<ResourceError | null>(null);

  /* Add new error (replaces existing error) */
  const addError = (error: ResourceError) => {
    setError(error);
  };

  /* Remove error by ID if it matches current error */
  const removeError = (id: string) => {
    setError(prev => prev?.id === id ? null : prev);
  };

  /* Clear all errors */
  const clearAllErrors = () => {
    setError(null);
  };

  /* Context value object */
  const value = {
    error,
    addError,
    removeError,
    clearAllErrors
  };

  return (
    <ResourceErrorContext.Provider value={value}>
      {children}
    </ResourceErrorContext.Provider>
  );
};