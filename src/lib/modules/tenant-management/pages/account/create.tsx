"use client"

/* React and Chakra UI component imports */
import React from 'react'
import { Flex } from '@chakra-ui/react'

/* Tenant module imports */
import TenantAccountCreationForm from '@tenant-management/forms/account/create'

/* Main component for creating new tenant accounts */
const CreateTenantAccountPage: React.FC = () => {
  return (
    <Flex justifyContent={'center'} alignItems={'center'}>
      <TenantAccountCreationForm  />
    </Flex>
  );
}

export default CreateTenantAccountPage