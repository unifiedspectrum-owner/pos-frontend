/* Grid component for displaying and selecting available add-ons with pricing and descriptions */
import React from 'react'
import { SimpleGrid, GridItem, Box, Flex, Text } from '@chakra-ui/react'
import { Controller } from 'react-hook-form'
import { lighten } from 'polished'
import { MdOutlineCheckBoxOutlineBlank, MdExtension } from 'react-icons/md'
import { FiPlus } from 'react-icons/fi'
import { FaPlus } from 'react-icons/fa'

/* Types */
import { Addon } from '@plan-management/types'
import { FieldArrayWithId } from 'react-hook-form'
import { CreatePlanFormData } from '@plan-management/schemas/validation/plans'

/* Constants */
import { PRIMARY_COLOR, GRAY_COLOR, DARK_COLOR, WHITE_COLOR, SECONDARY_COLOR } from '@shared/config'

/* Components */
import { EmptyStateContainer } from '@shared/components'
import { ResourceSkeleton } from '@plan-management/components'

type AddonAssignmentFieldArray = FieldArrayWithId<CreatePlanFormData, "addon_assignments", "id">;

interface AddonsGridProps {
  loading: boolean;
  displayAddons: Addon[];
  addonAssignments: AddonAssignmentFieldArray[];
  isReadOnly: boolean;
  control: any;
  handleToggleWithConfirm: (id: number) => void;
}

const AddonsGrid: React.FC<AddonsGridProps> = ({
  loading,
  displayAddons,
  addonAssignments,
  isReadOnly,
  control,
  handleToggleWithConfirm
}) => {
  /* Show skeleton loader while data is loading */
  if (loading && addonAssignments.length === 0) {
    return (
      <ResourceSkeleton 
        count={6} 
        columns={3} 
        variant="detailed" 
        minHeight="120px" 
      />
    );
  }

  /* Show empty state when no addons are available */
  if (displayAddons.length === 0 && addonAssignments.length === 0) {
    return (
      <EmptyStateContainer
        icon={isReadOnly 
          ? <MdExtension size={48} color={lighten(0.2, GRAY_COLOR)} />
          : <FaPlus size={48} color={lighten(0.2, GRAY_COLOR)} />
        }
        title={isReadOnly ? "No add-ons included" : "No add-ons selected"}
        description={isReadOnly 
          ? "This plan does not include any add-ons"
          : "Select add-ons from the list above to configure this plan"
        }
        testId="addons-empty-state"
      />
    );
  }

  /* Don't render grid if no addons to display */
  if (!displayAddons || displayAddons.length === 0) {
    return null;
  }

  /* Main addons selection grid */
  return (
    <Controller
      name="addon_assignments"
      control={control}
      render={() => (
        <SimpleGrid columns={3} gap={4}>
          {displayAddons.map((addon) => {
            const isSelected = addonAssignments.some((a) => a.addon_id === addon.id);
            
            return (
              <GridItem key={addon.id} h="full">
                {/* Addon card with selection styling */}
                <Box
                  p={4}
                  borderWidth={1}
                  borderRadius="lg"
                  borderColor={isReadOnly ? lighten(0.3, GRAY_COLOR) : (isSelected ? PRIMARY_COLOR : lighten(0.3, GRAY_COLOR))}
                  bg={isReadOnly ? 'white' : (isSelected ? lighten(0.49, PRIMARY_COLOR) : 'white')}
                  cursor={isReadOnly ? "default" : "pointer"}
                  transition="all 0.2s"
                  _hover={isReadOnly ? {} : {
                    borderColor: PRIMARY_COLOR,
                    bg: isSelected ? lighten(0.44, PRIMARY_COLOR) : lighten(0.5, PRIMARY_COLOR)
                  }}
                  onClick={isReadOnly ? undefined : () => handleToggleWithConfirm(addon.id)}
                  position="relative"
                  h="full"
                  minH="100px"
                  display="flex"
                  flexDirection="column"
                  shadow={isReadOnly ? 'none' : (isSelected ? 'md' : 'none')}
                >
                  <Flex justifyContent={'space-between'} h="full" align="flex-start">
                    {/* Addon content - name, description, and pricing info */}
                    <Flex flexDir="column" gap={2} flex={1} minH={0}>
                      <Text 
                        fontSize="md" 
                        fontWeight="semibold" 
                        color={isReadOnly ? SECONDARY_COLOR : (isSelected ? DARK_COLOR : GRAY_COLOR)}
                      >
                        {addon.name}
                      </Text>
                      <Text 
                        fontSize="sm" 
                        color={lighten(0.2, GRAY_COLOR)}
                        lineHeight="1.4"
                        flex={1}
                      >
                        {addon.description}
                      </Text>
                      
                      {/* Pricing and scope information */}
                      <Flex justify="space-between" align="center" mt={2}>
                        <Text 
                          fontSize="xs" 
                          fontWeight="medium"
                          color={lighten(0.2, GRAY_COLOR)}
                        >
                          Price: $<Text as={'b'}>{addon.addon_price ?? 0}</Text>
                        </Text>
                        <Text 
                          fontSize="xs" 
                          color={lighten(0.2, GRAY_COLOR)}
                          textTransform="capitalize"
                        >
                          Scope: <Text as={'span'}>{addon.pricing_scope ?? "N/A"}</Text>
                        </Text>
                      </Flex>
                      
                      {/* Default quantity display */}
                      {addon.default_quantity && (
                        <Text 
                          fontSize="xs" 
                          color={lighten(0.2, GRAY_COLOR)}
                        >
                          Default: {addon.default_quantity}
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
                          bg={isSelected ? 'white' : 'transparent'}
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
      )}
    />
  );
};

export default AddonsGrid;