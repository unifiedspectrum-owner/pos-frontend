"use client"

/* Libraries imports */
import React from 'react'
import { Flex, VStack } from '@chakra-ui/react'

/* Tenant module imports */
import {AccountCreateForm } from '@/lib/modules/tenant-management/forms'
import { Header, Footer } from '@tenant-management/components/layout'

/* Tenant account creation page component */
const CreateTenantPage: React.FC = () => {
  return (
    <VStack minH="100vh" w="100%">
      {/* Page header */}
      <Header currentPath="/tenant/account/create" />

      {/* Main content area */}
      <Flex flex="1" w="100%" justifyContent="center" alignItems="center" py={8}>
        <AccountCreateForm />
      </Flex>

      {/* Page footer */}
      <Footer />
    </VStack>
  )
}

export default CreateTenantPage
