/* React and external library imports */
import React, { useState, useEffect, useCallback } from 'react'
import { Text, Box, SimpleGrid, Flex, Dialog, Portal } from '@chakra-ui/react'
import { MdOutlineCheckBoxOutlineBlank } from 'react-icons/md'
import { FiPlus } from 'react-icons/fi'
import { lighten } from 'polished'

/* Shared module imports */
import { PrimaryButton, SecondaryButton } from '@shared/components/form-elements/buttons'
import { ConfirmationDialog } from '@shared/components'
import { GRAY_COLOR, PRIMARY_COLOR, WHITE_COLOR } from '@shared/config'

/* Plan module imports */
import { Addon } from '@plan-management/types/plans'

/* Tenant module imports */
import { AddonBranchSelection, SelectedAddon, PlanBillingCycle } from '@tenant-management/types'
import { calculateSingleAddonPrice } from '@tenant-management/utils/business'
import { useAddonConfirmation } from '@tenant-management/hooks'

/* UI component imports */
import { toaster } from '@/components/ui/toaster'
import { getBillingCycleLabel } from '@/lib/modules/tenant-management/utils/formatting'

/* Modal component props for add-on branch selection */
interface AddonSelectionModalProps {
  isOpen: boolean /* Modal visibility state */
  onClose: () => void /* Close modal handler */
  addon: Addon | null /* Add-on being configured */
  branchCount: number /* Total number of branches */
  billingCycle: PlanBillingCycle /* Current billing cycle */
  planDiscountPercentage: number /* Plan's annual discount percentage */
  currentSelection: SelectedAddon | null /* Existing selection state */
  onSave: (addon: Addon, branchSelections: AddonBranchSelection[]) => void /* Save configuration handler */
}

const AddonSelectionModal: React.FC<AddonSelectionModalProps> = ({
  isOpen,
  onClose,
  addon,
  branchCount,
  billingCycle,
  planDiscountPercentage,
  currentSelection,
  onSave
}) => {
  const [branchSelections, setBranchSelections] = useState<AddonBranchSelection[]>([])
  const [pendingBranchToggle, setPendingBranchToggle] = useState<number | null>(null)

  /* Confirmation dialog hook for branch unselection */
  const {
    confirmState,
    showUnselectConfirmation,
    hideConfirmation,
    getConfirmationMessage,
    getConfirmationTitle,
    getConfirmText
  } = useAddonConfirmation()

  /* Initialize branch selections when modal opens or addon changes */
  useEffect(() => {
    if (addon && isOpen) {
      const initialSelections: AddonBranchSelection[] = []
      
      for (let i = 0; i < branchCount; i++) {
        const existingSelection = currentSelection?.branches.find(b => b.branchIndex === i)
        initialSelections.push({
          branchIndex: i,
          branchName: existingSelection?.branchName || `Branch ${i + 1}`,
          isSelected: existingSelection?.isSelected || false
        })
      }
      
      setBranchSelections(initialSelections)
    }
  }, [addon, branchCount, currentSelection, isOpen])

  /* Toggle individual branch selection state with confirmation for unselection */
  const handleBranchToggle = useCallback((branchIndex: number) => {
    const currentBranch = branchSelections.find(s => s.branchIndex === branchIndex)
    const isCurrentlySelected = currentBranch?.isSelected || false
    const selectedCount = branchSelections.filter(s => s.isSelected).length
    
    /* If unselecting and it would leave no branches selected, show confirmation */
    if (isCurrentlySelected && selectedCount === 1 && addon?.pricing_scope === 'branch') {
      if (addon) {
        setPendingBranchToggle(branchIndex)
        showUnselectConfirmation({
          addon_id: addon.id,
          addon_name: addon.name,
          addon_price: addon.addon_price,
          pricing_scope: addon.pricing_scope,
          branches: branchSelections,
          is_included: addon.is_included
        })
      }
      return
    }
    
    /* Direct toggle for selection or safe unselection */
    setBranchSelections(prev =>
      prev.map(selection =>
        selection.branchIndex === branchIndex
          ? { ...selection, isSelected: !selection.isSelected }
          : selection
      )
    )
  }, [branchSelections, addon, showUnselectConfirmation])

  /* Handle confirmed branch unselection */
  const handleConfirmedBranchToggle = useCallback(() => {
    if (pendingBranchToggle !== null) {
      setBranchSelections(prev =>
        prev.map(selection =>
          selection.branchIndex === pendingBranchToggle
            ? { ...selection, isSelected: !selection.isSelected }
            : selection
        )
      )
      setPendingBranchToggle(null)
    }
    hideConfirmation()
  }, [pendingBranchToggle, hideConfirmation])

  /* Handle cancelled branch unselection */
  const handleCancelledBranchToggle = useCallback(() => {
    setPendingBranchToggle(null)
    hideConfirmation()
  }, [hideConfirmation])

  /* Calculate selected branches count and total cost */
  const selectedBranchCount = branchSelections.filter(selection => selection.isSelected).length
  const addonPrice = addon ? calculateSingleAddonPrice(addon.addon_price, billingCycle, planDiscountPercentage) : 0
  const totalCost = addon 
    ? (addon.pricing_scope === 'branch' 
        ? selectedBranchCount * addonPrice
        : addonPrice)
    : 0

  /* Save branch configuration with validation */
  const handleSave = useCallback(() => {
    if (!addon) return
    
    /* Validate branch selection for branch-level pricing */
    if (addon.pricing_scope === 'branch' && selectedBranchCount === 0) {
      toaster.create({
        title: 'Selection Required',
        description: 'Please select at least one branch for this add-on.',
        type: 'error',
        duration: 5000,
        closable: true
      })
      return
    }
    
    /* For organization addons, pass empty array; for branch addons, pass selections */
    const selectionsToSave = addon.pricing_scope === 'organization' ? [] : branchSelections
    onSave(addon, selectionsToSave)
  }, [addon, branchSelections, onSave, selectedBranchCount])

  if (!addon) return null /* Don't render if no addon provided */

  return (
    <>
      <Dialog.Root 
        open={isOpen} 
      size="xl"
      placement="center"
      onOpenChange={(details) => {
        if (!details.open) {
          onClose()
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(8px)">
          <Dialog.Positioner>
            <Dialog.Content p={0} maxW="2xl">
              {/* Modal header with add-on name */}
              <Dialog.Header p={6} borderBottom="1px solid" borderColor="gray.200">
                <Dialog.Title fontSize="xl" fontWeight="bold">
                  Configure {addon.name} for Branches
                </Dialog.Title>
              </Dialog.Header>
              
              <Dialog.Body p={6}>
                <Flex flexDir="column" gap={4}>
                  {/* Add-on information card with pricing details */}
                  <Flex w={'100%'} bg="gray.50" borderRadius="lg">
                    <Flex p={4} w={'100%'} justifyContent="space-between" alignItems="center" >
                      <Flex flexDir={'column'} gap={2}>
                        <Text fontSize="lg" fontWeight="bold">
                          {addon.name}
                        </Text>
                        <Text fontSize="sm" color="gray.700">
                          {addon.description}
                        </Text>
                      </Flex>
                      <Flex flexDir={'column'}>
                        <Text fontSize="xl" fontWeight="bold" color={PRIMARY_COLOR}>
                          ${Math.floor(addonPrice)}{getBillingCycleLabel({billingCycle})}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          per {addon.pricing_scope}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>

                  {/* Branch selection interface or organization-level configuration */}
                  <Box>
                    {addon.pricing_scope === 'branch' ? (
                      <>
                        <Text fontSize="lg" fontWeight="bold" mb={4}>
                          Select Branches for this Add-on
                        </Text>
                        
                        {/* Grid of selectable branch cards */}
                        <SimpleGrid columns={3} gap={4}>
                          {branchSelections.map((selection) => (
                            <Flex
                              key={selection.branchIndex}
                              p={4}
                              borderWidth={1}
                              borderRadius="lg"
                              borderColor={selection.isSelected ? PRIMARY_COLOR : lighten(0.3, GRAY_COLOR)}
                              bg={selection.isSelected ? lighten(0.49, PRIMARY_COLOR) : WHITE_COLOR}
                              cursor="pointer"
                              transition="all 0.2s"
                              _hover={{
                                borderColor: PRIMARY_COLOR,
                                bg: selection.isSelected ? lighten(0.44, PRIMARY_COLOR) : lighten(0.5, PRIMARY_COLOR)
                              }}
                              onClick={() => handleBranchToggle(selection.branchIndex)}
                              position="relative"
                              flexDirection="column"
                              shadow={selection.isSelected ? 'md' : 'none'}
                            >
                              <Flex justifyContent={'space-between'} align="flex-start">
                                {/* Branch name and individual pricing */}
                                <Flex flexDir="column" gap={2} flex={1} minH={0}>
                                  <Text 
                                    fontSize="md" 
                                    fontWeight="semibold" 
                                    color={selection.isSelected ? PRIMARY_COLOR : GRAY_COLOR}
                                  >
                                    {selection.branchName || `Branch ${selection.branchIndex + 1}`}
                                  </Text>

                                  {/* Show pricing when branch is selected */}
                                  {selection.isSelected && (
                                    <Text fontSize="sm" fontWeight="bold" color={PRIMARY_COLOR}>
                                      ${Math.floor(addonPrice)}{getBillingCycleLabel({billingCycle})}
                                    </Text>
                                  )}
                                </Flex>
                                
                                {/* Visual indicator for selection state */}
                                <Flex flexShrink={0} ml={2}>
                                  <Box
                                    w="20px"
                                    h="20px"
                                    borderRadius="sm"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    bg={selection.isSelected ? WHITE_COLOR : 'transparent'}
                                  >
                                    {selection.isSelected ? (
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
                              </Flex>
                            </Flex>
                          ))}
                        </SimpleGrid>
                      </>
                    ) : (
                      <>
                        <Text fontSize="lg" fontWeight="bold" mb={4}>
                          Organization-level Add-on
                        </Text>
                        
                        {/* Information card for organization-wide add-ons */}
                        <Box p={4} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.200">
                          <Flex alignItems="center" gap={3}>
                            <Box color="blue.500" fontSize="lg">
                              ℹ️
                            </Box>
                            <Box>
                              <Text fontSize="md" fontWeight="medium" color="blue.800" mb={1}>
                                Organization-wide Add-on
                              </Text>
                              <Text fontSize="sm" color="blue.700">
                                This add-on applies to your entire organization and will be available across all branches. 
                                The cost is ${addonPrice}{getBillingCycleLabel({billingCycle})} for the organization.
                              </Text>
                            </Box>
                          </Flex>
                        </Box>
                      </>
                    )}
                  </Box>

                  {/* Configuration summary with total cost */}
                  {(addon.pricing_scope === 'branch' ? selectedBranchCount > 0 : true) && (
                    <Box p={4} bg={lighten(0.9, PRIMARY_COLOR)} borderRadius="lg" border="1px solid" borderColor={lighten(0.6, PRIMARY_COLOR)}>
                      <Flex justifyContent="space-between" alignItems="center">
                        <Flex flexDir="column">
                          <Text fontSize="md" fontWeight="bold">
                            Total Configuration
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {addon.pricing_scope === 'branch' 
                              ? `${selectedBranchCount} branches selected`
                              : 'Organization-wide add-on'
                            }
                          </Text>
                        </Flex>
                        <Text fontSize="xl" fontWeight="bold" color={PRIMARY_COLOR}>
                          ${Math.floor(totalCost)}{getBillingCycleLabel({billingCycle})}
                        </Text>
                      </Flex>
                    </Box>
                  )}
                </Flex>
              </Dialog.Body>
              
              {/* Action buttons for cancel and save */}
              <Dialog.Footer p={6} borderTop="1px solid" borderColor="gray.200">
                <Flex gap={3} justifyContent="flex-end">
                  <SecondaryButton onClick={onClose}>
                    Cancel
                  </SecondaryButton>
                  
                  <PrimaryButton onClick={handleSave}>
                    {addon.pricing_scope === 'organization' 
                      ? 'Add to Organization'
                      : 'Save Configuration'
                    }
                  </PrimaryButton>
                </Flex>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Backdrop>
      </Portal>
    </Dialog.Root>

    {/* Branch unselection confirmation dialog */}
    <ConfirmationDialog
      isOpen={confirmState.show}
      title={getConfirmationTitle()}
      message={getConfirmationMessage()}
      confirmText={getConfirmText()}
      cancelText="Cancel"
      confirmVariant="danger"
      onConfirm={handleConfirmedBranchToggle}
      onCancel={handleCancelledBranchToggle}
    />
  </>
  )
}

export default AddonSelectionModal