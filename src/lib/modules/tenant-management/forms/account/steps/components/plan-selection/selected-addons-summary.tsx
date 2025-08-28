/* React and external library imports */
import React from 'react'
import { Box, Flex, Text, SimpleGrid, Badge, Button } from '@chakra-ui/react'
import { FiEdit, FiTrash2 } from 'react-icons/fi'
import { lighten } from 'polished'

/* Shared module imports */
import { PRIMARY_COLOR, GRAY_COLOR } from '@shared/config'
import { ConfirmationDialog } from '@shared/components'

/* Tenant module imports */
import { SelectedAddon, PlanBillingCycle } from '@tenant-management/types'
import { calculateAddonCost, applyBillingCycleDiscount } from '@tenant-management/utils'
import { useAddonConfirmation } from '@tenant-management/hooks'

/* Props for selected addons summary component */
interface SelectedAddonsSummaryProps {
  selectedAddons: SelectedAddon[] /* List of configured add-ons */
  branchCount: number /* Total number of branches */
  billingCycle?: PlanBillingCycle /* Current billing cycle */
  planDiscountPercentage?: number /* Plan's annual discount percentage */
  onEdit?: (addonId: number) => void /* Optional edit handler */
  onRemove?: (addonId: number) => void /* Optional remove handler */
  readOnly?: boolean /* Whether in read-only mode */
}

/* Displays summary of all selected add-ons with branch configurations */
const SelectedAddonsSummary: React.FC<SelectedAddonsSummaryProps> = ({
  selectedAddons,
  branchCount,
  billingCycle = 'monthly',
  planDiscountPercentage = 0,
  onEdit,
  onRemove,
  readOnly = false
}) => {
  /* Confirmation dialog hook for addon removal */
  const {
    confirmState,
    showRemoveConfirmation,
    hideConfirmation,
    getConfirmationMessage,
    getConfirmationTitle,
    getConfirmText
  } = useAddonConfirmation()

  /* Handle confirmed removal */
  const handleConfirmedRemove = () => {
    if (confirmState.addonId && onRemove) {
      onRemove(confirmState.addonId)
    }
    hideConfirmation()
  }

  /* Don't render if no add-ons selected */
  if (selectedAddons.length === 0) return null

  /* Calculate total cost across all add-ons */
  const totalCost = selectedAddons.reduce((sum, addon) => {
    const baseCost = calculateAddonCost(addon)
    return sum + applyBillingCycleDiscount(baseCost, billingCycle, planDiscountPercentage)
  }, 0)

  return (
    <Box>
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Selected Add-ons ({selectedAddons.length})
      </Text>
      
      {/* List of selected add-ons */}
      <SimpleGrid columns={1} gap={3} mb={4}>
        {selectedAddons.map((addon) => {
          const selectedBranches = addon.branches.filter(b => b.isSelected)
          const baseCost = calculateAddonCost(addon)
          const addonCost = applyBillingCycleDiscount(baseCost, billingCycle, planDiscountPercentage)

          return (
            <Box
              key={addon.addonId}
              p={4}
              borderWidth={1}
              borderRadius="lg"
              borderColor={lighten(0.3, GRAY_COLOR)}
              bg="gray.50"
            >
              <Flex justifyContent="space-between" alignItems="flex-start">
                <Flex flexDir="column" gap={2} flex={1}>
                  {/* Add-on name and pricing scope */}
                  <Flex alignItems="center" gap={3}>
                    <Text fontSize="md" fontWeight="semibold">
                      {addon.addonName}
                    </Text>
                    <Badge 
                      colorScheme={addon.pricingScope === 'organization' ? 'blue' : 'green'}
                      size="sm"
                    >
                      {addon.pricingScope === 'organization' ? 'Organization' : 'Per Branch'}
                    </Badge>
                  </Flex>
                  
                  {/* Branch configuration details */}
                  <Text fontSize="sm" color="gray.600">
                    {addon.pricingScope === 'organization' 
                      ? 'Applied to entire organization'
                      : `Applied to ${selectedBranches.length} of ${branchCount} branches`
                    }
                  </Text>
                  
                  {/* Show selected branches for branch-level add-ons */}
                  {addon.pricingScope === 'branch' && selectedBranches.length > 0 && (
                    <Flex gap={1} flexWrap="wrap">
                      {selectedBranches.map((branch) => (
                        <Badge key={branch.branchIndex} size="sm" variant="outline" p={3}>
                          Branch {branch.branchIndex + 1}
                        </Badge>
                      ))}
                    </Flex>
                  )}
                </Flex>
                
                {/* Cost and remove button */}
                <Flex flexDir="column" alignItems="flex-end" gap={2}>
                  <Text fontSize="lg" fontWeight="bold" color={PRIMARY_COLOR}>
                    ${addonCost}/{billingCycle === 'yearly' ? 'year' : 'month'}
                  </Text>
                  
                  {/* Action buttons for non-read-only mode */}
                  {!readOnly && (onEdit || onRemove) && (
                    <Flex gap={2}>
                      {/* Only show edit button for branch-scoped addons */}
                      {onEdit && addon.pricingScope === 'branch' && (
                        <Button
                          aria-label="Edit addon configuration"
                          size="sm"
                          variant="outline"
                          colorScheme="blue"
                          onClick={() => onEdit(addon.addonId)}
                          _hover={{ bg: 'blue.50' }}
                          p={2}
                          minW="auto"
                        >
                          <FiEdit />
                        </Button>
                      )}
                      {onRemove && (
                        <Button
                          aria-label="Remove addon"
                          size="sm"
                          variant="outline"
                          color="red"
                          onClick={() => showRemoveConfirmation(addon)}
                          _hover={{ bg: 'red.50' }}
                          p={2}
                          minW="auto"
                        >
                          <FiTrash2 />
                        </Button>
                      )}
                    </Flex>
                  )}
                </Flex>
              </Flex>
            </Box>
          )
        })}
      </SimpleGrid>
      
      {/* Total cost summary */}
      <Box 
        p={4} 
        bg={lighten(0.9, PRIMARY_COLOR)} 
        borderRadius="lg" 
        border="1px solid" 
        borderColor={lighten(0.6, PRIMARY_COLOR)}
      >
        <Flex justifyContent="space-between" alignItems="center">
          <Text fontSize="md" fontWeight="bold">
            Total Add-ons Cost
          </Text>
          <Text fontSize="xl" fontWeight="bold" color={PRIMARY_COLOR}>
            ${totalCost}/{billingCycle === 'yearly' ? 'year' : 'month'}
          </Text>
        </Flex>
      </Box>

      {/* Confirmation Dialog */}
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
    </Box>
  )
}

export default SelectedAddonsSummary