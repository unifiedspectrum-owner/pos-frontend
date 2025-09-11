/* React and external library imports */
import React, { useState, useRef, useEffect } from 'react'
import { Box, Flex, Text, SimpleGrid, Badge, Button, Input, IconButton } from '@chakra-ui/react'
import { FiEdit, FiTrash2, FiEdit3, FiCheck, FiX } from 'react-icons/fi'
import { lighten } from 'polished'

/* Shared module imports */
import { PRIMARY_COLOR, GRAY_COLOR } from '@shared/config'
import { ConfirmationDialog } from '@shared/components'

/* Tenant module imports */
import { SelectedAddon, PlanBillingCycle } from '@tenant-management/types'
import { calculateSingleAddonPrice } from '@tenant-management/utils/business'
import { useAddonConfirmation } from '@tenant-management/hooks'
import { ADDON_PRICING_SCOPE } from '@tenant-management/constants'
import { getBillingCycleLabel } from '@/lib/modules/tenant-management/utils/formatting'

/* Props for selected addons summary component */
interface SelectedAddonsSummaryProps {
  selectedAddons: SelectedAddon[] /* List of configured add-ons */
  branchCount: number /* Total number of branches */
  billingCycle?: PlanBillingCycle /* Current billing cycle */
  planDiscountPercentage?: number /* Plan's annual discount percentage */
  onEdit?: (addonId: number) => void /* Optional edit handler */
  onRemove?: (addonId: number) => void /* Optional remove handler */
  onBranchNameChange?: (branchIndex: number, newName: string) => void /* Optional branch name change handler */
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
  onBranchNameChange,
  readOnly = false
}) => {
  /* State for inline branch name editing */
  const [editingBranchIndex, setEditingBranchIndex] = useState<number | null>(null)
  const [editingBranchName, setEditingBranchName] = useState<string>('')
  const editingContainerRef = useRef<HTMLDivElement>(null)
  
  /* Confirmation dialog hook for addon removal */
  const {
    confirmState,
    showRemoveConfirmation,
    hideConfirmation,
    getConfirmationMessage,
    getConfirmationTitle,
    getConfirmText
  } = useAddonConfirmation()

  /* Handle click outside editing area */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editingBranchIndex !== null && editingContainerRef.current && !editingContainerRef.current.contains(event.target as Node)) {
        /* Auto-save when clicking outside */
        if (editingBranchName.trim()) {
          if (onBranchNameChange) {
            onBranchNameChange(editingBranchIndex, editingBranchName.trim())
          }
        }
        setEditingBranchIndex(null)
        setEditingBranchName('')
      }
    }

    if (editingBranchIndex !== null) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [editingBranchIndex, editingBranchName, onBranchNameChange])

  /* Handle inline branch name editing */
  const handleBranchEditClick = (branchIndex: number, currentName: string) => {
    if (readOnly || !onBranchNameChange) return
    console.log('Editing branch:', branchIndex, 'with name:', currentName)
    setEditingBranchIndex(branchIndex)
    setEditingBranchName(currentName)
  }

  const handleSaveBranchName = (branchIndex: number) => {
    if (onBranchNameChange && editingBranchName.trim()) {
      onBranchNameChange(branchIndex, editingBranchName.trim())
    }
    setEditingBranchIndex(null)
    setEditingBranchName('')
  }

  const handleCancelEdit = () => {
    setEditingBranchIndex(null)
    setEditingBranchName('')
  }

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
    const selectedBranches = addon.branches.filter(b => b.isSelected);
    const isOrgAddon = addon.pricing_scope == ADDON_PRICING_SCOPE.ORGANIZATION;
    const addonPrice = calculateSingleAddonPrice(addon.addon_price, billingCycle, planDiscountPercentage)
    const addonCost = isOrgAddon ? addonPrice : addonPrice*selectedBranches.length
    return sum + addonCost
  }, 0)

  return (
    <Box>
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Selected Add-ons ({selectedAddons.length})
      </Text>
      
      {/* List of selected add-ons */}
      <SimpleGrid columns={1} gap={3} mb={4}>
        {selectedAddons.map((addon) => {
          const selectedBranches = addon.branches.filter(b => b.isSelected);
          const isOrgAddon = addon.pricing_scope == ADDON_PRICING_SCOPE.ORGANIZATION;
          const addonPrice = calculateSingleAddonPrice(addon.addon_price, billingCycle, planDiscountPercentage)
          const addonCost = isOrgAddon ? addonPrice : addonPrice*selectedBranches.length

          return (
            <Box
              key={addon.addon_id}
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
                      {addon.addon_name}
                    </Text>
                    <Badge 
                      colorScheme={addon.pricing_scope === 'organization' ? 'blue' : 'green'}
                      size="sm"
                    >
                      {addon.pricing_scope === 'organization' ? 'Organization' : 'Per Branch'}
                    </Badge>
                  </Flex>
                  
                  {/* Branch configuration details */}
                  <Text fontSize="sm" color="gray.600">
                    {addon.pricing_scope === 'organization' 
                      ? 'Applied to entire organization'
                      : `Applied to ${selectedBranches.length} of ${branchCount} branches`
                    }
                  </Text>
                  
                  {/* Show selected branches for branch-level add-ons */}
                  {addon.pricing_scope === ADDON_PRICING_SCOPE.BRANCH && selectedBranches.length > 0 && (
                    <Flex gap={2} flexWrap="wrap" alignItems="center">
                      {selectedBranches.map((branch) => (
                        <Flex 
                          key={branch.branchIndex} 
                          alignItems="center" 
                          gap={1}
                          ref={editingBranchIndex === branch.branchIndex ? editingContainerRef : null}
                        >
                          {editingBranchIndex === branch.branchIndex ? (
                            /* Inline editing mode */
                            <>
                              <Input
                                value={editingBranchName}
                                onChange={(e) => setEditingBranchName(e.target.value)}
                                size="sm"
                                width="120px"
                                fontSize="sm"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleSaveBranchName(branch.branchIndex)
                                  }
                                  if (e.key === 'Escape') {
                                    e.preventDefault()
                                    handleCancelEdit()
                                  }
                                }}
                                autoFocus
                              />
                              <IconButton
                                aria-label="Save branch name"
                                size="sm"
                                variant="solid"
                                colorScheme="green"
                                bg="green.500"
                                color="white"
                                _hover={{ bg: "green.600" }}
                                onClick={() => handleSaveBranchName(branch.branchIndex)}
                              >
                                <FiCheck />
                              </IconButton>
                              <IconButton
                                aria-label="Cancel edit"
                                size="sm"
                                variant="solid"
                                colorScheme="red"
                                bg="red.500"
                                color="white"
                                _hover={{ bg: "red.600" }}
                                onClick={handleCancelEdit}
                              >
                                <FiX />
                              </IconButton>
                            </>
                          ) : (
                            /* Display mode */
                            <Badge 
                              size="sm" 
                              variant="outline" 
                              p={3}
                              cursor={readOnly || !onBranchNameChange ? "default" : "pointer"}
                              transition="all 0.2s"
                              _hover={!readOnly && onBranchNameChange ? {
                                borderColor: PRIMARY_COLOR,
                                color: PRIMARY_COLOR,
                                transform: "scale(1.02)"
                              } : {}}
                              onClick={() => handleBranchEditClick(branch.branchIndex, branch.branchName || `Branch ${branch.branchIndex + 1}`)}
                              position="relative"
                            >
                              <Flex alignItems="center" gap={1}>
                                {branch.branchName || `Branch ${branch.branchIndex + 1}`}
                                {!readOnly && onBranchNameChange && (
                                  <Text fontSize="xs" opacity={0.7}>
                                    <FiEdit3 />
                                  </Text>
                                )}
                              </Flex>
                            </Badge>
                          )}
                        </Flex>
                      ))}
                    </Flex>
                  )}
                </Flex>
                
                {/* Cost and remove button */}
                <Flex flexDir="column" alignItems="flex-end" gap={2}>
                  <Text fontSize="lg" fontWeight="bold" color={PRIMARY_COLOR}>
                    ${Math.floor(addonCost)}{getBillingCycleLabel({billingCycle})}
                  </Text>
                  
                  {/* Action buttons for non-read-only mode */}
                  {!readOnly && (onEdit || onRemove) && (
                    <Flex gap={2}>
                      {/* Only show edit button for branch-scoped addons */}
                      {onEdit && addon.pricing_scope === ADDON_PRICING_SCOPE.BRANCH && (
                        <Button
                          aria-label="Edit addon configuration"
                          size="sm"
                          variant="outline"
                          colorScheme="blue"
                          onClick={() => onEdit(addon.addon_id)}
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
            ${Math.floor(totalCost)}{getBillingCycleLabel({billingCycle})}
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