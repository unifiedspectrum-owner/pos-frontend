"use client"

import React from 'react'
import { Flex } from '@chakra-ui/react'
import TenantAccountCreationForm from '../../forms/account/create';

/* Main component for creating new tenant accounts */
const CreateTenantAccountPage: React.FC = () => {
  return (
    <Flex justifyContent={'center'} alignItems={'center'}>
      <TenantAccountCreationForm  />
    </Flex>
  );
}

export default CreateTenantAccountPage