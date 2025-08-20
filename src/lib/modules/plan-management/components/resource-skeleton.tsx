import React from 'react';
import { SimpleGrid, GridItem, Box, Skeleton, SkeletonText } from '@chakra-ui/react';
import { lighten } from 'polished';
import { GRAY_COLOR } from '@shared/config';

/* Props interface for resource skeleton component */
interface ResourceSkeletonProps {
  count?: number; /* Number of skeleton cards to display */
  columns?: number; /* Number of columns in the grid */
  variant?: 'simple' | 'detailed'; /* Skeleton complexity variant */
  minHeight?: string; /* Minimum height for skeleton cards */
}

/* Individual skeleton card with loading placeholders */
const SkeletonCard: React.FC<{ variant: 'simple' | 'detailed', minHeight: string }> = ({ variant, minHeight }) => (
  <Box
    p={4}
    borderWidth={1}
    borderRadius="lg"
    borderColor={lighten(0.3, GRAY_COLOR)}
    bg="white"
    h="full"
    minH={minHeight}
    display="flex"
    flexDirection="column"
    gap={2}
  >
    {/* Title placeholder */}
    <Skeleton height="20px" width="70%" borderRadius="md" />
    
    {/* Content placeholders based on variant */}
    {variant === 'simple' ? 
      (
        /* Simple variant: Text lines for basic resources */
        <SkeletonText noOfLines={2} gap="2" height="3" width="90%" />
      ) : (
        /* Detailed variant: Multiple data lines for complex resources */
        <>
          <Skeleton height="14px" width="60%" borderRadius="sm" />
          <Skeleton height="14px" width="50%" borderRadius="sm" />
          <Skeleton height="14px" width="65%" borderRadius="sm" />
        </>
      )
    }
    
    {/* Selection checkbox/indicator placeholder */}
    <Box position="absolute" top={4} right={4}>
      <Skeleton width="20px" height="20px" borderRadius="sm" />
    </Box>
  </Box>
);

/* Grid of skeleton cards for loading states */
const ResourceSkeleton: React.FC<ResourceSkeletonProps> = ({
  count = 6, /* Default 6 skeleton cards */
  columns = 3, /* Default 3-column layout */
  variant = 'simple', /* Default simple variant */
  minHeight = '100px' /* Default minimum height */
}) => {
  return (
    <SimpleGrid columns={columns} gap={4}>
      {/* Generate skeleton cards based on count prop */}
      {
        Array.from({ length: count }, (_, index) => (
          <GridItem key={`skeleton-${index}`} h="full">
            <Box position="relative">
              <SkeletonCard variant={variant} minHeight={minHeight} />
            </Box>
          </GridItem>
        ))
      }
    </SimpleGrid>
  );
};

export default ResourceSkeleton;