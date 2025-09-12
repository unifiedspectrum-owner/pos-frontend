/* React and Chakra UI component imports */
import React from 'react'
import { HStack, Flex, Skeleton, SkeletonCircle } from '@chakra-ui/react'
import { lighten } from 'polished'

/* Shared module imports */
import { GRAY_COLOR } from '@shared/config'

/* Loading skeleton row component for tenant table */
const TenantTableSkeleton: React.FC = () => (
  <HStack 
    w="100%" 
    borderLeftRadius={20} 
    borderRightRadius={20}
    borderWidth={1} 
    borderColor={lighten(0.3, GRAY_COLOR)} 
    p={2}
  >
    <Flex w="8%" justifyContent="center">
      <Skeleton height="20px" width="20px" />
    </Flex>
    <Flex w="30%">
      <Skeleton height="20px" width="80%" />
    </Flex>
    <Flex w="15%">
      <Skeleton height="28px" width="80px" borderRadius="20px" />
    </Flex>
    <Flex w="17%">
      <Skeleton height="28px" width="90px" borderRadius="20px" />
    </Flex>
    <Flex w="15%" justify="center" gap={2}>
      <SkeletonCircle size="8" />
      <SkeletonCircle size="8" />
    </Flex>
    <Flex w="15%" justify="center" gap={2}>
      <SkeletonCircle size="8" />
      <SkeletonCircle size="8" />
      <SkeletonCircle size="8" />
    </Flex>
  </HStack>
)

export default TenantTableSkeleton