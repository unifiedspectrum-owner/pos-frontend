/* Libraries imports */
import React from 'react'
import { SimpleGrid, GridItem, Skeleton, VStack, HStack, Text, Box } from '@chakra-ui/react'

/* Props interface for module assignments skeleton */
interface ModuleAssignmentsSkeletonProps {
  count?: number
}

/* Loading skeleton for module assignments matching actual card structure */
const ModuleAssignmentsSkeleton: React.FC<ModuleAssignmentsSkeletonProps> = ({
  count = 4
}) => {
  return (
    <SimpleGrid w={'100%'} columns={[1, 1, 6]} gap={6}>
      {/* Header section skeleton */}
      <GridItem colSpan={[1, 6]}>
        <Box>
          <Skeleton height="28px" width="200px" mb={1} />
          <Skeleton height="20px" width="400px" />
        </Box>
      </GridItem>

      {/* Module cards skeleton */}
      {Array.from({ length: count }).map((_, index) => (
        <GridItem key={index} colSpan={[1, 3]}>
          <Box borderWidth={1} p={3} borderRadius={'md'} bg="gray.50">
            <VStack align="start" spacing={3}>
              {/* Module name skeleton */}
              <Skeleton height="20px" width="120px" />

              {/* Permission checkboxes grid skeleton */}
              <SimpleGrid columns={4} gap={2} w="100%">
                {Array.from({ length: 4 }).map((_, checkboxIndex) => (
                  <HStack key={checkboxIndex} spacing={2}>
                    <Skeleton height="16px" width="16px" borderRadius="sm" />
                    <Skeleton height="16px" width="50px" />
                  </HStack>
                ))}
              </SimpleGrid>

              {/* Help text skeleton */}
              <Skeleton height="14px" width="180px" />
            </VStack>
          </Box>
        </GridItem>
      ))}
    </SimpleGrid>
  )
}

export { ModuleAssignmentsSkeleton }