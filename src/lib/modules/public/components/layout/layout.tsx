"use client"

/* Libraries imports */
import React from 'react'
import { Flex, VStack } from '@chakra-ui/react'

/* Public module imports */
import { PublicHeader, PublicFooter } from '@public/components/layout'

/* Public layout component props */
interface PublicLayoutProps {
  children: React.ReactNode
}

/* Shared public layout component */
const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
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

export default PublicLayout
