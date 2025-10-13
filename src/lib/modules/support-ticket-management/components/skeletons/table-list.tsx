/* Libraries imports */
import React from 'react'
import { Box, Flex, Skeleton, Stack } from '@chakra-ui/react'

/* Support ticket table skeleton loading component */
export const SupportTicketTableSkeleton: React.FC = () => {
  return (
    <Box w={'100%'} mt={4}>
      {/* Table header skeleton */}
      <Flex gap={4} mb={4}>
        <Skeleton height="40px" flex={1} />
        <Skeleton height="40px" flex={1} />
        <Skeleton height="40px" flex={1} />
        <Skeleton height="40px" flex={1} />
        <Skeleton height="40px" width="120px" />
      </Flex>

      {/* Table rows skeleton */}
      <Stack gap={3}>
        {[...Array(5)].map((_, index) => (
          <Flex key={index} gap={4} p={4} borderWidth="1px" borderRadius="md">
            <Skeleton height="20px" flex={1} />
            <Skeleton height="20px" flex={1} />
            <Skeleton height="20px" flex={1} />
            <Skeleton height="20px" flex={1} />
            <Skeleton height="20px" width="120px" />
          </Flex>
        ))}
      </Stack>
    </Box>
  )
}
