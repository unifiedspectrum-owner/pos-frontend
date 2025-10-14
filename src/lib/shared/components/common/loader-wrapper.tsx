/* Libraries imports */
import React from 'react'
import { Box, Spinner, Center, VStack, Text } from '@chakra-ui/react'

/* Shared module imports */
import { PRIMARY_COLOR } from '@shared/config'

/* Loader wrapper component props */
interface LoaderWrapperProps {
  /* Whether to show the loading state */
  isLoading: boolean
  /* The content to show when not loading */
  children: React.ReactNode
  /* Loading message to display */
  loadingText?: string
  /* Spinner size */
  spinnerSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /* Minimum height for the loading container */
  minHeight?: string | number
  /* Whether to show loading text */
  showLoadingText?: boolean
  /* Custom spinner color */
  spinnerColor?: string
  /* Loading container background */
  loadingBg?: string
  /* Whether to blur the background content while loading */
  blurBackground?: boolean
  /* Custom loading component */
  customLoader?: React.ReactNode
}

/* Shared loader wrapper component */
const LoaderWrapper: React.FC<LoaderWrapperProps> = ({
  isLoading,
  children,
  loadingText = 'Loading...',
  spinnerSize = 'lg',
  minHeight = '200px',
  showLoadingText = true,
  spinnerColor = PRIMARY_COLOR,
  loadingBg = 'transparent',
  blurBackground = false,
  customLoader
}) => {
  if (isLoading) {
    return (
      <Box
        position="relative"
        minHeight={minHeight}
        bg={loadingBg}
        borderRadius="md"
        w={'100%'}
      >
        <Center height="100%" minHeight={minHeight}>
          {customLoader || (
            <VStack gap={4}>
              <Spinner
                size={spinnerSize}
                color={spinnerColor}
                borderWidth="3px"
              />
              {showLoadingText && (
                <Text
                  color="gray.600"
                  fontSize="sm"
                  fontWeight="medium"
                  textAlign="center"
                >
                  {loadingText}
                </Text>
              )}
            </VStack>
          )}
        </Center>
      </Box>
    )
  }

  if (blurBackground && isLoading) {
    return (
      <Box position="relative">
        <Box filter="blur(2px)" opacity={0.5}>
          {children}
        </Box>
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="whiteAlpha.800"
          zIndex={10}
        >
          <Center height="100%">
            {customLoader || (
              <VStack gap={4}>
                <Spinner
                  size={spinnerSize}
                  color={spinnerColor}
                  borderWidth="3px"
                />
                {showLoadingText && (
                  <Text
                    color="gray.600"
                    fontSize="sm"
                    fontWeight="medium"
                    textAlign="center"
                  >
                    {loadingText}
                  </Text>
                )}
              </VStack>
            )}
          </Center>
        </Box>
      </Box>
    )
  }

  return <>{children}</>
}

export default LoaderWrapper