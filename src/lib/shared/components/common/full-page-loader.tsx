import React from 'react'
import { Flex, Text, VStack, Spinner } from '@chakra-ui/react'
import { PRIMARY_COLOR } from '@shared/config'

/* Props interface for full page loader */
interface FullPageLoaderProps {
  title?: string /* Main loading title */
  subtitle?: string /* Loading description */
  size?: 'sm' | 'md' | 'lg' | 'xl' /* Spinner size */
  color?: string /* Spinner color */
}

/* Reusable full page loader component */
const FullPageLoader: React.FC<FullPageLoaderProps> = ({
  title = 'Loading...',
  subtitle = 'Please wait while we process your request.',
  size = 'xl',
  color = PRIMARY_COLOR
}) => {
  return (
    <Flex
      position="fixed" 
      top={0} 
      left={0} 
      width="100vw" 
      height="100vh"
      backgroundColor="rgba(255, 255, 255, 0.9)" 
      zIndex={9999}
      justifyContent="center" 
      alignItems="center" 
      flexDirection="column" 
      gap={4}
    >
      <Spinner 
        size={size} 
        color={color} 
        borderWidth="4px" 
        speed="0.65s" 
      />
      <VStack gap={2}>
        <Text fontSize="lg" fontWeight="medium" color={color}>
          {title}
        </Text>
        <Text fontSize="sm" color="gray.600">
          {subtitle}
        </Text>
      </VStack>
    </Flex>
  )
}

export default FullPageLoader