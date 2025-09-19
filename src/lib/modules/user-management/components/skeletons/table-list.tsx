/* Libraries imports */
import React from 'react'
import { HStack, Skeleton } from '@chakra-ui/react'

/* User table skeleton loading component */
export const UserTableSkeleton: React.FC = () => {
  return (
    <HStack w="100%" p={2}>
      <Skeleton w="8%" h="20px" borderRadius="md" />
      <Skeleton w="20%" h="20px" borderRadius="md" />
      <Skeleton w="30%" h="20px" borderRadius="md" />
      <Skeleton w="12%" h="20px" borderRadius="md" />
      <Skeleton w="12%" h="24px" borderRadius="md" />
      <Skeleton w="15%" h="20px" borderRadius="md" />
    </HStack>
  )
}