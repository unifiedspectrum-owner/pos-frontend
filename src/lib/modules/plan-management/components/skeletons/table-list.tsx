/* Libraries imports */
import React from 'react';
import { HStack, Flex, Skeleton, SkeletonCircle } from '@chakra-ui/react';
import { lighten } from 'polished';

/* Shared module imports */
import { GRAY_COLOR } from '@shared/config';

/* Plan table loading skeleton row component */
export const PlanTableSkeleton: React.FC = () => (
  <HStack
    w="100%"
    borderLeftRadius={20}
    borderRightRadius={20}
    borderWidth={1}
    borderColor={lighten(0.3, GRAY_COLOR)}
    p={2}
  >
    <Flex w="10%" justifyContent="center">
      <Skeleton height="20px" width="20px" />
    </Flex>
    <Flex w="30%">
      <Skeleton height="20px" width="80%" />
    </Flex>
    <Flex w="20%">
      <Skeleton height="20px" width="60%" />
    </Flex>
    <Flex w="20%">
      <Skeleton height="28px" width="70px" borderRadius="20px" />
    </Flex>
    <Flex w="20%" justify="center" gap={2}>
      <SkeletonCircle size="8" />
      <SkeletonCircle size="8" />
      <SkeletonCircle size="8" />
    </Flex>
  </HStack>
);