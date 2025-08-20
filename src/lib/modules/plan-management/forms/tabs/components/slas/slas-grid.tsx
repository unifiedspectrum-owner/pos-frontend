/* Grid component for displaying and selecting available SLAs with support details */
import React from 'react'
import { SimpleGrid, GridItem, Box, Flex, Text } from '@chakra-ui/react'
import { lighten } from 'polished'
import { MdOutlineCheckBoxOutlineBlank, MdSecurity } from 'react-icons/md'
import { FiPlus } from 'react-icons/fi'
import { FaPlus } from 'react-icons/fa'

/* Types */
import { SupportSLA } from '@plan-management/types'

/* Constants */
import { PRIMARY_COLOR, GRAY_COLOR, DARK_COLOR, WHITE_COLOR } from '@shared/config'

/* Components */
import { EmptyStateContainer } from '@shared/components'
import { ResourceSkeleton } from '@plan-management/components'

interface SLAsGridProps {
  loading: boolean;
  displaySlas: SupportSLA[];
  selectedSlaIds: number[];
  isReadOnly: boolean;
  handleToggleWithConfirm: (id: number) => void;
}

const SLAsGrid: React.FC<SLAsGridProps> = ({
  loading,
  displaySlas,
  selectedSlaIds,
  isReadOnly,
  handleToggleWithConfirm
}) => {
  /* Show skeleton loader while data is loading */
  if (loading && selectedSlaIds.length === 0) {
    return (
      <ResourceSkeleton 
        count={6} 
        columns={3} 
        variant="detailed" 
        minHeight="140px" 
      />
    );
  }

  /* Show empty state when no SLAs are available */
  if (displaySlas.length === 0 && selectedSlaIds.length === 0) {
    return (
      <EmptyStateContainer
        icon={isReadOnly 
          ? <MdSecurity size={48} color={lighten(0.2, GRAY_COLOR)} />
          : <FaPlus size={48} color={lighten(0.2, GRAY_COLOR)} />
        }
        title={isReadOnly ? "No SLAs included" : "No SLAs selected"}
        description={isReadOnly 
          ? "This plan does not include any SLAs"
          : "Select SLAs from the list above to configure this plan"
        }
        testId="slas-empty-state"
      />
    );
  }

  /* Don't render grid if no SLAs to display */
  if (!displaySlas || displaySlas.length === 0) {
    return null;
  }

  /* Main SLAs selection grid */
  return (
    <SimpleGrid columns={3} gap={4}>
      {displaySlas.map((sla) => {
        const isSelected = selectedSlaIds.includes(sla.id);
        
        return (
          <GridItem key={sla.id} h="full">
            {/* SLA card with selection styling */}
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
              onClick={isReadOnly ? undefined : () => handleToggleWithConfirm(sla.id)}
              position="relative"
              h="full"
              minH="140px"
              display="flex"
              flexDirection="column"
              shadow={isReadOnly ? 'none' : (isSelected ? 'md' : 'none')}
            >
              <Flex justifyContent={'space-between'} h="full" align="flex-start">
                {/* SLA content - name, channel, response time, and schedule */}
                <Flex flexDir="column" gap={2} flex={1} minH={0}>
                  <Text 
                    fontSize="md" 
                    fontWeight="semibold" 
                    color={isSelected ? PRIMARY_COLOR : GRAY_COLOR}
                  >
                    {sla.name}
                  </Text>
                  <Text 
                    fontSize="sm" 
                    color={isSelected ? DARK_COLOR : lighten(0.2, GRAY_COLOR)}
                    lineHeight="1.4"
                  >
                    Channel: {sla.support_channel}
                  </Text>
                  <Text 
                    fontSize="sm" 
                    color={isSelected ? DARK_COLOR : lighten(0.2, GRAY_COLOR)}
                    lineHeight="1.4"
                  >
                    Response: {sla.response_time_hours}h
                  </Text>
                  <Text 
                    fontSize="sm" 
                    color={isSelected ? DARK_COLOR : lighten(0.2, GRAY_COLOR)}
                    lineHeight="1.4"
                    flex={1}
                  >
                    Schedule: {sla.availability_schedule}
                  </Text>
                  
                  {/* Optional notes display */}
                  {sla.notes && (
                    <Text 
                      fontSize="xs" 
                      color={isSelected ? DARK_COLOR : lighten(0.3, GRAY_COLOR)}
                      lineHeight="1.3"
                    >
                      {sla.notes}
                    </Text>
                  )}
                </Flex>
                
                {/* Selection indicator - checkbox or plus icon */}
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

export default SLAsGrid;