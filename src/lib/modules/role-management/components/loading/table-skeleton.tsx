/* Libraries imports */
import React from 'react'
import { HStack, Skeleton } from '@chakra-ui/react'

/* Role table skeleton loading component */
export const RoleTableSkeleton: React.FC = () => {
  return (
    <HStack w="100%" p={2}>
      <Skeleton w="8%" h="20px" borderRadius="md" />
      <Skeleton w="20%" h="20px" borderRadius="md" />
      <Skeleton w="35%" h="20px" borderRadius="md" />
      <Skeleton w="12%" h="20px" borderRadius="md" />
      <Skeleton w="10%" h="20px" borderRadius="md" />
      <Skeleton w="15%" h="20px" borderRadius="md" />
    </HStack>
  )
}