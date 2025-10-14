"use client"

/* Libraries imports */
import React from 'react'
import { Flex, VStack } from '@chakra-ui/react'

/* Public module imports */
import { PublicHeader, PublicFooter } from '@public/components/layout'

/* Auth layout component props */
interface AuthLayoutProps {
  children: React.ReactNode
}

/* Shared auth layout component */
const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <VStack minH="100vh" w="100%">
      {/* Page header */}
      <PublicHeader />

      {/* Main content area */}
      <Flex flex="1" w="100%" justifyContent="center" alignItems="center" py={8} bg="gray.50">
        {children}
      </Flex>

      {/* Page footer */}
      <PublicFooter />
    </VStack>
  )
}

export default AuthLayout