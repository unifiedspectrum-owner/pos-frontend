/* React imports */
import React from 'react'

/* UI component imports */
import { Box, Flex, Skeleton, SimpleGrid } from '@chakra-ui/react'

/* Individual plan card skeleton matching actual design */
const PlanCardSkeleton: React.FC = () => (
  <Flex
    borderWidth="1px"
    borderColor="gray.200"
    bg="white"
    position="relative"
    transition="all 0.2s"
    _hover={{
      borderColor: 'blue.500',
      boxShadow: 'lg'
    }}
  >
    {/* Popular badge placeholder */}
    <Box
      position="absolute"
      top="-8px"
      left="50%"
      transform="translateX(-50%)"
      zIndex={1}
    >
      <Skeleton height="24px" width="80px" borderRadius="full" />
    </Box>

    {/* Main content area matching actual structure */}
    <Flex p={5} w="100%">
      <Flex gap={4} align="center" w="100%" justifyContent="space-between">
        {/* Plan name and description side */}
        <Flex flexDir="column" gap={2} align="start" textAlign="left" flex={1}>
          <Skeleton height="24px" width="70%" borderRadius="md" />
          <Skeleton height="20px" width="90%" borderRadius="sm" />
        </Flex>

        {/* Price side */}
        <Skeleton height="28px" width="100px" borderRadius="md" />
      </Flex>
    </Flex>
  </Flex>
)

/* Billing cycle selector skeleton matching SegmentGroup design */
const BillingCycleSkeleton: React.FC = () => (
  <Flex justify="center" position="relative" mb={6}>
    <Box
      p="20px"
      bg="gray.100"
      borderRadius="lg"
      display="flex"
      position="relative"
    >
      <Skeleton height="40px" width="120px" borderRadius="md" mr={2} />
      <Skeleton height="40px" width="120px" borderRadius="md" />
      
      {/* Badge placeholder for discount */}
      <Box position="absolute" top="-10px" right="10px">
        <Skeleton height="20px" width="60px" borderRadius="full" />
      </Box>
    </Box>
  </Flex>
)

/* Branch configuration section skeleton */
const BranchConfigSkeleton: React.FC = () => (
  <Box p={6} bg="gray.50" borderRadius="lg" mb={6}>
    <Skeleton height="24px" width="200px" mb={4} borderRadius="md" />
    
    <Flex flexDir="column" gap={3}>
      {/* Number input field skeleton */}
      <Box>
        <Skeleton height="16px" width="140px" mb={2} borderRadius="sm" />
        <Skeleton height="44px" width="100%" borderRadius="md" />
      </Box>
      
      {/* Help text skeletons */}
      <Skeleton height="14px" width="250px" borderRadius="sm" />
      <Skeleton height="14px" width="300px" borderRadius="sm" />
    </Flex>
  </Box>
)

/* Addons section skeleton matching actual grid design */
const AddonsSectionSkeleton: React.FC = () => (
  <Box mt={8}>
    {/* Available addons grid with proper card structure */}
    <SimpleGrid columns={[1, 2, 3]} gap={4} mb={6}>
      {Array.from({ length: 6 }, (_, index) => (
        <Box
          key={`addon-skeleton-${index}`}
          p={4}
          borderWidth={1}
          borderRadius="md"
          borderColor="gray.200"
          bg="white"
          position="relative"
          minH="140px"
        >
          {/* Badge/status placeholder */}
          <Box position="absolute" top={2} right={2}>
            <Skeleton height="18px" width="50px" borderRadius="full" />
          </Box>
          
          {/* Addon name */}
          <Skeleton height="20px" width="75%" mb={2} borderRadius="md" />
          
          {/* Addon description */}
          <Skeleton height="16px" width="90%" mb={2} borderRadius="sm" />
          
          {/* Price and scope info */}
          <Flex align="baseline" mb={3}>
            <Skeleton height="16px" width="60px" borderRadius="sm" mr={2} />
            <Skeleton height="14px" width="40px" borderRadius="sm" />
          </Flex>
          
          {/* Action buttons */}
          <Flex gap={2}>
            <Skeleton height="32px" width="80px" borderRadius="md" />
            <Skeleton height="32px" width="32px" borderRadius="md" />
          </Flex>
        </Box>
      ))}
    </SimpleGrid>
    
    {/* Selected addons summary skeleton */}
    <Box mt={6}>
      <Skeleton height="20px" width="180px" mb={3} borderRadius="md" />
      <Box p={4} bg="gray.50" borderRadius="lg">
        <Skeleton height="16px" width="90%" mb={2} borderRadius="sm" />
        <Skeleton height="16px" width="70%" mb={2} borderRadius="sm" />
        <Skeleton height="16px" width="85%" borderRadius="sm" />
      </Box>
    </Box>
  </Box>
)

/* Navigation buttons skeleton */
const NavigationSkeleton: React.FC = () => (
  <Flex justify="space-between" pt={4}>
    <Skeleton height="44px" width="150px" borderRadius="md" />
    <Skeleton height="44px" width="180px" borderRadius="md" />
  </Flex>
)

/* Main plan selection skeleton component */
interface PlanSelectionSkeletonProps {
  showBranchConfig?: boolean
  showAddons?: boolean
  planCount?: number
}

const PlanSelectionSkeleton: React.FC<PlanSelectionSkeletonProps> = ({
  showBranchConfig = false,
  showAddons = false,
  planCount = 4
}) => {
  return (
    <Flex flexDir="column" gap={3} align="stretch">
      {/* Billing cycle selector skeleton */}
      <BillingCycleSkeleton />
      
      {/* Plans grid skeleton - matching actual 2-column layout */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mb={6}>
        {Array.from({ length: planCount }, (_, index) => (
          <PlanCardSkeleton key={`plan-skeleton-${index}`} />
        ))}
      </SimpleGrid>
      
      {/* Branch configuration skeleton (conditional) */}
      {showBranchConfig && <BranchConfigSkeleton />}
      
      {/* Addons section skeleton (conditional) */}
      {showAddons && <AddonsSectionSkeleton />}
      
      {/* Navigation buttons skeleton */}
      <NavigationSkeleton />
    </Flex>
  )
}

export default PlanSelectionSkeleton