/* React and UI component imports */
import React from 'react'
import { Text, Box, SimpleGrid, Flex, Badge, Button } from '@chakra-ui/react'
import { FiPlus, FiTrash2, FiEdit, FiPackage } from 'react-icons/fi'
import { lighten } from 'polished'

/* Shared module imports */
import { GRAY_COLOR, PRIMARY_COLOR, WHITE_COLOR } from '@shared/config'
import { ConfirmationDialog } from '@shared/components'
import EmptyStateContainer from '@shared/components/common/empty-state-container'

/* Plan module imports */
import { Plan, Addon } from '@plan-management/types/plans'

/* Tenant module imports */
import { SelectedAddon, PlanBillingCycle } from '@tenant-management/types'
import { useAddonConfirmation } from '@tenant-management/hooks'
import { calculateSingleAddonPrice } from '@tenant-management/utils/business'
import { getBillingCycleLabel } from '@tenant-management/utils/formatting'
import { FaPlus } from 'react-icons/fa'

/* Component props interface */
interface AvailableAddonsGridProps {
  selectedPlan: Plan | null
  billingCycle: PlanBillingCycle
  onAddonConfigure: (addon: Addon) => void
  onAddonRemove: (addonId: number) => void
  isAddonSelected: (addonId: number) => boolean
  getAddonSelection: (addonId: number) => SelectedAddon | null
}

/* Grid component displaying available addons for selected plan */
const AvailableAddonsGrid: React.FC<AvailableAddonsGridProps> = ({
  selectedPlan,
  billingCycle,
  onAddonConfigure,
  onAddonRemove,
  isAddonSelected,
  getAddonSelection
}) => {
  const {
    confirmState,
    showRemoveConfirmationById,
    hideConfirmation,
    getConfirmationMessage,
    getConfirmationTitle,
    getConfirmText
  } = useAddonConfirmation()

  const handleConfirmedRemove = () => {
    if (confirmState.addonId && onAddonRemove) {
      onAddonRemove(confirmState.addonId)
    }
    hideConfirmation()
  }

  /* Show nothing when no plan selected */
  if (!selectedPlan) {
    console.warn('AvailableAddonsGrid: No selectedPlan provided')
    return null
  }

  return (
    <Flex flexDir={'column'}>
      {/* Addons section header */}
      <Flex alignItems="center" gap={3} mb={6}>
        <Text fontSize={15} borderRadius={'50%'} p={1} color={WHITE_COLOR} bg={PRIMARY_COLOR}>
          <FaPlus />
        </Text>
        <Text fontSize="xl" fontWeight="bold">
          Available Add-ons for {selectedPlan.name} (Optional)
        </Text>
      </Flex>

      {/* Show empty state when no addons are available */}
      {(!selectedPlan.add_ons || selectedPlan.add_ons.length === 0) ? (
        <EmptyStateContainer
          icon={<FiPackage size={48} />}
          title="No Add-ons Available"
          description={`The ${selectedPlan.name} plan doesn't have any additional add-ons available at this time.`}
          testId="addons-empty-state"
        />
      ) : (
      
        /* Addons grid layout */
        <SimpleGrid columns={3} gap={6}>
          {selectedPlan.add_ons.map((addon) => {
            const isSelected = isAddonSelected(addon.id)
            const addonSelection = getAddonSelection(addon.id)
            const addonPrice = addon.addon_price !== null ? calculateSingleAddonPrice(addon.addon_price, billingCycle, selectedPlan?.annual_discount_percentage) : null
            return (
              <Flex
                key={addon.id}
                p={1}
                borderRadius="xl"
                border="2px solid"
                borderColor={isSelected ? PRIMARY_COLOR : lighten(0.3, GRAY_COLOR)}
                transition="all 0.3s ease"
                _hover={!addon.is_included ? {
                  borderColor: PRIMARY_COLOR,
                  boxShadow: '0 8px 25px -8px rgba(0, 0, 0, 0.15)',
                  transform: 'translateY(-2px)'
                } : {}}
                position="relative"
                cursor={!addon.is_included ? "pointer" : "default"}
                onClick={() => onAddonConfigure(addon)}
                bg={isSelected ? lighten(0.9, PRIMARY_COLOR) : WHITE_COLOR}
              >
                {/* Included addon badge */}
                {addon.is_included ? (
                  <Badge
                    position="absolute"
                    top="-15px"
                    left="50%"
                    transform="translateX(-50%)"
                    bg={PRIMARY_COLOR}
                    color={WHITE_COLOR}
                    px={4}
                    py={2}
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="bold"
                    zIndex={1}
                  >
                    Included
                  </Badge>
                ) : null}
                
                {/* Addon card content */}
                <Flex flexDir="column" p={4}>
                  {/* Addon name and actions */}
                  <Flex justifyContent="space-between" alignItems="center" mb={4}>
                    <Text fontSize="lg" fontWeight="bold">
                      {addon.name}
                    </Text>

                    {/* Edit/remove/add buttons */}
                      {!addon.is_included && (
                        <Flex gap={2}>
                          {isSelected && addonSelection ? (
                            <>
                              <Button
                                aria-label="Edit addon configuration"
                                size="sm"
                                variant="outline"
                                colorScheme="blue"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onAddonConfigure(addon)
                                }}
                                _hover={{ bg: 'blue.50' }}
                                p={2}
                                minW="auto"
                              >
                                <FiEdit />
                              </Button>
                              <Button
                                aria-label="Remove addon"
                                size="sm"
                                variant="outline"
                                color="red"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  showRemoveConfirmationById(addon.id, addon.name)
                                }}
                                _hover={{ bg: 'red.50' }}
                                p={2}
                                minW="auto"
                              >
                                <FiTrash2 />
                              </Button>
                            </>
                          ) : (
                            <Button
                              aria-label="Configure addon for branches"
                              size="sm"
                              variant="outline"
                              colorScheme="brand"
                              onClick={(e) => {
                                e.stopPropagation()
                                onAddonConfigure(addon)
                              }}
                              _hover={{ bg: lighten(0.5, PRIMARY_COLOR) }}
                              p={2}
                              minW="auto"
                            >
                              <FiPlus />
                            </Button>
                          )}
                        </Flex>
                      )}
                  </Flex>
                  
                  
                  
                  {/* Price information */}
                  <Box >
                    <Flex justifyContent="space-between" gap={2} alignItems="center">
                        {/* Addon description */}
                        <Text fontSize="sm" color="gray.600" mb={2}>
                          {addon.description}
                        </Text>
                      <Flex flexDir={'column'} gap={1}>
                        <Flex>
                          <Text fontSize="xl" fontWeight="bold" color={PRIMARY_COLOR} lineHeight="1">
                            ${addonPrice !== null ? Math.floor(addonPrice) : 'N/A'}
                          </Text>
                          <Text fontSize={'sm'}>
                            {getBillingCycleLabel({billingCycle})}
                          </Text>
                        </Flex>
                        <Text textWrap={'nowrap'} fontSize="xs" color="gray.500" textTransform="capitalize">
                          per {addon.pricing_scope}
                        </Text>
                      </Flex>
                    </Flex>
                  </Box>
                </Flex>
              </Flex>
            )
          })}
        </SimpleGrid>
      )}

      {/* Addon removal confirmation dialog */}
      <ConfirmationDialog
        isOpen={confirmState.show}
        title={getConfirmationTitle()}
        message={getConfirmationMessage()}
        confirmText={getConfirmText()}
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={handleConfirmedRemove}
        onCancel={hideConfirmation}
      />
    </Flex>
  )
}

export default AvailableAddonsGrid