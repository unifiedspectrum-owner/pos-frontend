import React from 'react'
import { SimpleGrid, GridItem, Box, Flex, Text } from '@chakra-ui/react'
import { lighten } from 'polished'
import { MdStars, MdOutlineCheckBoxOutlineBlank } from 'react-icons/md'
import { FiPlus } from 'react-icons/fi'
import { Feature } from '@plan-management/types'
import { PRIMARY_COLOR, GRAY_COLOR, DARK_COLOR, WHITE_COLOR } from '@shared/config'
import { ResourceSkeleton } from '@plan-management/components'
import { EmptyStateContainer } from '@shared/components'

/* Features grid component props */
interface FeaturesGridProps {
  loading: boolean /* Is data currently loading */
  displayResources: Feature[] /* Features to display in grid */
  selectedFeatureIds: number[] /* Currently selected feature IDs */
  isReadOnly: boolean /* Is component in read-only mode */
  handleToggleWithConfirm: (id: number) => void /* Feature selection handler with confirmation */
}

/* Features display and selection grid component */
const FeaturesGrid: React.FC<FeaturesGridProps> = ({
  loading,
  displayResources,
  selectedFeatureIds,
  isReadOnly,
  handleToggleWithConfirm
}) => {
  /* Display loading skeleton while fetching data */
  if (loading) {
    return (
      <ResourceSkeleton 
        count={6} 
        columns={3} 
        variant="simple" 
        minHeight="100px" 
      />
    );
  }

  /* Display empty state when no features available */
  if (displayResources.length === 0) {
    return isReadOnly ? (
      <EmptyStateContainer
        icon={<MdStars size={48} color={lighten(0.2, GRAY_COLOR)} />}
        title="No features included"
        description="This plan does not include any features"
        testId="features-empty-state"
      />
    ) : null;
  }

  /* Features grid with selection functionality */
  return (
    <SimpleGrid columns={3} gap={4}>
      {displayResources.map((feature) => {
        const isSelected = selectedFeatureIds.includes(feature.id) /* Check if feature is selected */;
        
        return (
          <GridItem key={feature.id} h="full">
            {/* Interactive feature card with selection states */}
            <Box
              p={4}
              borderWidth={1}
              borderRadius="lg"
              borderColor={isReadOnly ? lighten(0.3, GRAY_COLOR) : (isSelected ? PRIMARY_COLOR : lighten(0.3, GRAY_COLOR))}
              bg={isReadOnly ? WHITE_COLOR : (isSelected ? lighten(0.49, PRIMARY_COLOR) : WHITE_COLOR)}
              cursor={isReadOnly ? "default" : "pointer"}
              transition="all 0.2s"
              _hover={isReadOnly ? {} : {
                borderColor: PRIMARY_COLOR,
                bg: isSelected ? lighten(0.44, PRIMARY_COLOR) : lighten(0.5, PRIMARY_COLOR)
              }}
              onClick={isReadOnly ? undefined : () => handleToggleWithConfirm(feature.id)}
              position="relative"
              h="full"
              minH="100px"
              display="flex"
              flexDirection="column"
              shadow={isReadOnly ? 'none' : (isSelected ? 'md' : 'none')}
            >
              <Flex justifyContent={'space-between'} h="full" align="flex-start">
                {/* Feature name and description content */}
                <Flex flexDir="column" gap={2} flex={1} minH={0}>
                  <Text 
                    fontSize="md" 
                    fontWeight="semibold" 
                    color={isSelected ? PRIMARY_COLOR : GRAY_COLOR}
                  >
                    {feature.name}
                  </Text>
                  <Text 
                    fontSize="sm" 
                    color={isSelected ? DARK_COLOR : lighten(0.2, GRAY_COLOR)}
                    lineHeight="1.4"
                    flex={1}
                  >
                    {feature.description}
                  </Text>
                </Flex>
                
                {/* Selection state indicator icon */}
                {!isReadOnly && (
                  <Flex flexShrink={0} ml={2}>
                    <Box
                      w="20px"
                      h="20px"
                      borderRadius="sm"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      bg={isSelected ? WHITE_COLOR : 'transparent'}
                    >
                      {isSelected ? (
                        <Text fontSize={'20px'} color={WHITE_COLOR}> 
                          <FiPlus style={{background: PRIMARY_COLOR, padding: 3, borderRadius: 3}}/>  
                        </Text>
                      ) : (
                        <Text fontSize={'20px'}>
                          <MdOutlineCheckBoxOutlineBlank style={{borderRadius: 3}}/> 
                        </Text>
                      )}
                    </Box>
                  </Flex>
                )}
              </Flex>
            </Box>
          </GridItem>
        );
      })}
    </SimpleGrid>
  );
};

export default FeaturesGrid;