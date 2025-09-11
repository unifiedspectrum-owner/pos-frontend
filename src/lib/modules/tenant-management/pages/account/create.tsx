"use client"

/* Libraries imports */
import React from 'react'
import { Flex, VStack } from '@chakra-ui/react'

/* Tenant module imports */
import TenantAccountCreationForm from '@tenant-management/forms/account/create'
import { Header, Footer } from '@tenant-management/components/layout'

/* Account creation page component */
const CreateTenantAccountPage: React.FC = () => {
  return (
    <VStack minH="100vh" w="100%">
      {/* Page header */}
      <Header currentPath="/tenant/account/create" />
      
      {/* Main content area */}
      <Flex flex="1" w="100%" justifyContent="center" alignItems="center" py={8}>
        <TenantAccountCreationForm />
      </Flex>
      
      {/* Page footer */}
      <Footer />
    </VStack>
  )
}

export default CreateTenantAccountPage