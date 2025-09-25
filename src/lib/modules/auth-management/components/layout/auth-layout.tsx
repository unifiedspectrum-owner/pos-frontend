"use client"

/* Libraries imports */
import React from 'react'
import { Flex, VStack } from '@chakra-ui/react'

/* Auth management module imports */
import { AuthHeader, AuthFooter } from '@auth-management/components/layout'

/* Auth layout component props */
interface AuthLayoutProps {
  children: React.ReactNode
}

/* Shared auth layout component */
const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <VStack minH="100vh" w="100%">
      {/* Page header */}
      <AuthHeader />

      {/* Main content area */}
      <Flex flex="1" w="100%" justifyContent="center" alignItems="center" py={8} bg="gray.50">
        {children}
      </Flex>

      {/* Page footer */}
      <AuthFooter />
    </VStack>
  )
}

export default AuthLayout