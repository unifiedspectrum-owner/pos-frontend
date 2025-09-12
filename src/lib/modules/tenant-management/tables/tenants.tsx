"use client"

/* Libraries imports */
import React, { useState, useMemo, useCallback } from 'react'
import { 
  Badge, ButtonGroup, Flex, Heading, HStack, IconButton, Text, Select, Portal, createListCollection 
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { lighten } from 'polished'

/* Icons imports */
import { HiOutlineEye, HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi'
import { MdOutlineFilterList, MdBusiness, MdPause, MdBlock, MdPlayArrow } from 'react-icons/md'
import { LuSearch } from 'react-icons/lu'
import { GoDotFill } from 'react-icons/go'

/* Shared module imports */
import { ConfirmationDialog, EmptyStateContainer, Pagination, TextInputField } from '@shared/components'
import { createToastNotification } from '@shared/utils/ui/notifications'
import { PaginationInfo } from '@shared/types'
import { 
  GRAY_COLOR, PRIMARY_COLOR, SUCCESS_GREEN_COLOR, SUCCESS_GREEN_COLOR2, 
  ERROR_RED_COLOR, WARNING_ORANGE_COLOR, LOADING_DELAY, LOADING_DELAY_ENABLED 
} from '@shared/config'

/* Tenant module imports */
import { TenantWithPlanDetails } from '@tenant-management/types/account/list'
import { TenantTableSkeleton, TenantSuspensionModal, TenantHoldModal, TenantActivationModal } from '@tenant-management/components'
import { TENANT_STATUS_FILTER_OPTIONS, TENANT_SUBSCRIPTION_FILTER_OPTIONS } from '@tenant-management/constants'
import { tenantActionsService } from '@tenant-management/api'
import { handleApiError } from '@/lib/shared'
import { AxiosError } from 'axios'

/* Component interfaces */
interface TenantTableProps {
  tenants: TenantWithPlanDetails[]
  lastUpdated: string
  onTenantDeleted?: () => void
  onPageChange?: (page: number, limit: number) => void
  loading?: boolean
  pagination?: PaginationInfo
}

interface DeleteConfirmState {
  show: boolean
  tenantId?: string
  organizationName?: string
}

interface SuspensionModalState {
  show: boolean
  tenantId?: string
  organizationName?: string
}

interface HoldModalState {
  show: boolean
  tenantId?: string
  organizationName?: string
}

interface ActivationModalState {
  show: boolean
  tenantId?: string
  organizationName?: string
}

/* Tenant table component with CRUD operations */
const TenantTable: React.FC<TenantTableProps> = ({ 
  tenants, 
  lastUpdated, 
  onTenantDeleted, 
  onPageChange,
  loading = false,
  pagination
}) => {
  /* Router for navigation */
  const router = useRouter()

  /* Component state */
  const [selectedTenantID, setSelectedTenantID] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({ show: false })
  const [suspensionModal, setSuspensionModal] = useState<SuspensionModalState>({ show: false })
  const [holdModal, setHoldModal] = useState<HoldModalState>({ show: false })
  const [activationModal, setActivationModal] = useState<ActivationModalState>({ show: false })
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>('all')

  /* Chakra UI select collections for filters */
  const statusCollection = useMemo(() => createListCollection({ items: TENANT_STATUS_FILTER_OPTIONS }), [])
  const subscriptionCollection = useMemo(() => createListCollection({ items: TENANT_SUBSCRIPTION_FILTER_OPTIONS }), [])

  /* Filtered tenants based on search and filters */
  const filteredTenants = useMemo(() => {
    if (loading) return [] /* Skip filtering during data load */
    
    return tenants.filter(tenant => {
      const matchesSearch = tenant.organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.tenant_id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || tenant.tenant_status === statusFilter
      const matchesSubscription = subscriptionFilter === 'all' || 
        (subscriptionFilter === 'none' && !tenant.subscription_status) ||
        tenant.subscription_status === subscriptionFilter
      
      return matchesSearch && matchesStatus && matchesSubscription
    })
  }, [tenants, searchTerm, statusFilter, subscriptionFilter, loading])

  /* Navigation handlers */
  const handleTenantRowClick = useCallback((tenantId: string) => {
    setSelectedTenantID(prev => prev === tenantId ? null : tenantId)
  }, [])

  const handleViewTenant = useCallback((tenantId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    router.push(`/admin/tenant-management/view/${tenantId}`)
  }, [router])

  const handleEditTenant = useCallback((tenantId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    router.push(`/admin/tenant-management/edit/${tenantId}`)
  }, [router])

  const handleDeleteTenant = useCallback((tenantId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    const tenant = tenants.find(t => t.tenant_id === tenantId)
    setDeleteConfirm({
      show: true,
      tenantId,
      organizationName: tenant?.organization_name || 'Selected Tenant'
    })
  }, [tenants])

  const handleHoldTenant = useCallback((tenantId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    const tenant = tenants.find(t => t.tenant_id === tenantId)
    setHoldModal({
      show: true,
      tenantId,
      organizationName: tenant?.organization_name || 'Selected Tenant'
    })
  }, [tenants])

  const handleSuspendTenant = useCallback((tenantId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    const tenant = tenants.find(t => t.tenant_id === tenantId)
    setSuspensionModal({
      show: true,
      tenantId,
      organizationName: tenant?.organization_name || 'Selected Tenant'
    })
  }, [tenants])

  /* Data operations */
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirm.tenantId) return

    setIsDeleting(true)
    try {
      /* Artificial delay for testing loading states */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY));
      }

      /* Call tenant deletion API */
      const response = await tenantActionsService.deleteTenant({ tenant_id: deleteConfirm.tenantId })
      
      if (response.success) {
        createToastNotification({
          type: 'success',
          title: 'Organization Deleted',
          description: `The organization '${deleteConfirm.organizationName}' has been successfully deleted.`
        })
        onTenantDeleted?.() /* Trigger parent refresh */
      } else {
        createToastNotification({
          type: 'error',
          title: 'Failed to Delete Organization',
          description: response.message || 'An error occurred while deleting the organization.'
        })
      }
    } catch (error: unknown) {
      console.error('[TenantTable] Error deleting tenant:', error);
      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Delete Organization'
      })
    } finally {
      setIsDeleting(false)
      setDeleteConfirm({ show: false })
    }
  }, [deleteConfirm, onTenantDeleted])

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirm({ show: false })
  }, [])

  /* Suspension modal handlers */
  const handleCloseSuspensionModal = useCallback(() => {
    setSuspensionModal({ show: false })
  }, [])

  const handleSuspensionSuccess = useCallback(() => {
    onTenantDeleted?.() /* Trigger parent refresh to update tenant list */
  }, [onTenantDeleted])

  /* Hold modal handlers */
  const handleCloseHoldModal = useCallback(() => {
    setHoldModal({ show: false })
  }, [])

  const handleHoldSuccess = useCallback(() => {
    onTenantDeleted?.() /* Trigger parent refresh to update tenant list */
  }, [onTenantDeleted])

  /* Activation handlers */
  const handleActivateTenant = useCallback((tenantId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    const tenant = tenants.find(t => t.tenant_id === tenantId)
    setActivationModal({
      show: true,
      tenantId,
      organizationName: tenant?.organization_name || 'Selected Tenant'
    })
  }, [tenants])

  /* Activation modal handlers */
  const handleCloseActivationModal = useCallback(() => {
    setActivationModal({ show: false })
  }, [])

  const handleActivationSuccess = useCallback(() => {
    onTenantDeleted?.() /* Trigger parent refresh to update tenant list */
  }, [onTenantDeleted])

  /* UI helper functions */
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return {
          color: SUCCESS_GREEN_COLOR2,
          bg: lighten(0.45, SUCCESS_GREEN_COLOR),
          borderColor: lighten(0.35, SUCCESS_GREEN_COLOR)
        }
      case 'suspended':
      case 'suspend':
        return {
          color: WARNING_ORANGE_COLOR,
          bg: lighten(0.4, WARNING_ORANGE_COLOR),
          borderColor: lighten(0.3, WARNING_ORANGE_COLOR)
        }
      case 'cancelled':
        return {
          color: ERROR_RED_COLOR,
          bg: lighten(0.35, ERROR_RED_COLOR),
          borderColor: lighten(0.3, ERROR_RED_COLOR)
        }
      case 'trial':
      case 'trialing':
        return {
          color: '#3b82f6', /* Blue */
          bg: lighten(0.4, '#3b82f6'),
          borderColor: lighten(0.3, '#3b82f6')
        }
      case 'setup':
        return {
          color: '#6366f1', /* Indigo */
          bg: lighten(0.4, '#6366f1'),
          borderColor: lighten(0.3, '#6366f1')
        }
      case 'past_due':
        return {
          color: '#f59e0b', /* Amber */
          bg: lighten(0.4, '#f59e0b'),
          borderColor: lighten(0.3, '#f59e0b')
        }
      case 'incomplete':
        return {
          color: '#ef4444', /* Red */
          bg: lighten(0.4, '#ef4444'),
          borderColor: lighten(0.3, '#ef4444')
        }
      case 'paused':
        return {
          color: '#8b5cf6', /* Purple */
          bg: lighten(0.4, '#8b5cf6'),
          borderColor: lighten(0.3, '#8b5cf6')
        }
      default:
        return {
          color: lighten(0.2, GRAY_COLOR),
          bg: lighten(0.4, GRAY_COLOR),
          borderColor: lighten(0.3, GRAY_COLOR)
        }
    }
  }

  return (
    <Flex p={5} flexDir="column" w="100%" gap={3}>
      {/* Header with title and last updated */}
      <Flex justify="space-between">
        <Heading color={lighten(0.2, GRAY_COLOR)}>Tenant Organizations</Heading>
        <Text alignSelf="end" fontSize="xs">Last Updated: {lastUpdated}</Text>
      </Flex>

      {/* Main table container */}
      <Flex gap={6} p={5} flexDir="column" borderWidth={1} borderColor={lighten(0.3, GRAY_COLOR)} borderRadius={10}>
        
        {/* Search and filters row */}
        <HStack w="100%" gap={3}>
          {/* Search input */}
          <Flex w="60%">
            <TextInputField
              label=""
              value={searchTerm}
              placeholder="Search by organization name or tenant ID..."
              isInValid={false}
              required={false}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
              leftIcon={<LuSearch />}
              inputProps={{
                h: "36px",
                borderRadius: "2xl"
              }}
            />
          </Flex>

          {/* Filter dropdowns */}
          <Flex w="40%" gap={3}>
            {/* Tenant status filter */}
            <Select.Root 
              value={[statusFilter]} 
              onValueChange={(e) => setStatusFilter(e.value[0])}
              size="sm"
              collection={statusCollection}
              disabled={loading}
            >
              <Select.Control>
                <Select.Trigger
                  borderRadius="2xl"
                  borderColor={lighten(0.3, GRAY_COLOR)}
                  _hover={{ borderColor: lighten(0.2, GRAY_COLOR) }}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  gap={2}
                  pl={3}
                  pr={3}
                >
                  <MdOutlineFilterList size={16} color={lighten(0.2, GRAY_COLOR)} />
                  <Select.ValueText placeholder="Filter by Status" />
                </Select.Trigger>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content 
                    borderRadius="2xl" 
                    p={2} 
                    gap={1}
                    maxH="200px"
                    overflowY="auto"
                  >
                    {statusCollection.items.map((item) => (
                      <Select.Item 
                        key={item.value} 
                        item={item}
                        p={2}
                        borderRadius="lg"
                        _hover={{ bg: lighten(0.4, GRAY_COLOR) }}
                      >
                        {item.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
            
            {/* Subscription status filter */}
            <Select.Root 
              value={[subscriptionFilter]} 
              onValueChange={(e) => setSubscriptionFilter(e.value[0])}
              size="sm"
              collection={subscriptionCollection}
              disabled={loading}
            >
              <Select.Control>
                <Select.Trigger
                  borderRadius="2xl"
                  borderColor={lighten(0.3, GRAY_COLOR)}
                  _hover={{ borderColor: lighten(0.2, GRAY_COLOR) }}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  gap={2}
                  pl={3}
                  pr={3}
                >
                  <MdOutlineFilterList size={16} color={lighten(0.2, GRAY_COLOR)} />
                  <Select.ValueText placeholder="Filter by Subscription" />
                </Select.Trigger>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content 
                    borderRadius="2xl" 
                    p={2} 
                    gap={1}
                    maxH="200px"
                    overflowY="auto"
                  >
                    {subscriptionCollection.items.map((item) => (
                      <Select.Item 
                        key={item.value} 
                        item={item}
                        p={2}
                        borderRadius="lg"
                        _hover={{ bg: lighten(0.4, GRAY_COLOR) }}
                      >
                        {item.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </Flex>
        </HStack>

        {/* Table content */}
        <Flex w="100%" flexDir="column" gap={2}>
          {/* Column headers */}
          <HStack w="100%" borderTopWidth={1} borderColor={GRAY_COLOR} fontWeight={500} color={lighten(0.2, GRAY_COLOR)} p={2}>
            <Text w="8%" textAlign="center">SNo.</Text>
            <Text w="20%" _hover={{fontWeight:'bold', color: PRIMARY_COLOR, cursor: 'pointer'}}>Organization</Text>
            <Text w="15%" textAlign={'center'} _hover={{fontWeight:'bold', color: PRIMARY_COLOR, cursor: 'pointer'}}>Status</Text>
            <Text w="10%" textAlign={'center'} _hover={{fontWeight:'bold', color: PRIMARY_COLOR, cursor: 'pointer'}}>Plan Name</Text>
            <Text w="17%" textAlign={'center'} _hover={{fontWeight:'bold', color: PRIMARY_COLOR, cursor: 'pointer'}}>Subscription</Text>
            <Text w="15%" textAlign="center">Status Actions</Text>
            <Text w="15%" textAlign="center">Actions</Text>
          </HStack>

          {/* Data rows */}
          {loading ? (
            /* Loading state */
            Array.from({ length: 5 }).map((_, index) => (
              <TenantTableSkeleton key={`skeleton-${index}`} />
            ))
          ) : filteredTenants.length === 0 ? (
            /* Empty state */
            <EmptyStateContainer
              icon={<MdBusiness size={48} color={lighten(0.2, GRAY_COLOR)} />}
              title="No Tenants Found"
              description={tenants.length === 0 
                ? "No tenant organizations have been created yet."
                : "No tenants match your current filters. Try adjusting your search criteria."
              }
            />
          ) : (
            /* Data rows */
            filteredTenants.map((tenant, index) => {
              const statusColors = getStatusBadgeColor(tenant.tenant_status)
              const subscriptionColors = tenant.subscription_status 
                ? getStatusBadgeColor(tenant.subscription_status)
                : { color: lighten(0.2, GRAY_COLOR), bg: lighten(0.4, GRAY_COLOR), borderColor: lighten(0.3, GRAY_COLOR) }
              
              return (
                <HStack 
                  key={tenant.tenant_id}
                  w="100%" 
                  borderLeftRadius={20} 
                  borderRightRadius={20}
                  borderWidth={selectedTenantID === tenant.tenant_id ? 2 : 1} 
                  borderColor={selectedTenantID === tenant.tenant_id ? lighten(0.3, PRIMARY_COLOR) : lighten(0.3, GRAY_COLOR)} 
                  bg={selectedTenantID === tenant.tenant_id ? lighten(0.47, PRIMARY_COLOR) : ''} 
                  _hover={{
                    bg: lighten(0.44, PRIMARY_COLOR),
                    borderColor: lighten(0.3, PRIMARY_COLOR)
                  }}
                  p={2}
                  color={GRAY_COLOR}
                  onClick={() => handleTenantRowClick(tenant.tenant_id)}
                >
                  <Text w="8%" textAlign="center">{index + 1}</Text>
                  <Text w="20%" fontWeight="medium">{tenant.organization_name}</Text>
                  <Text w="15%" textAlign={'center'}>
                    <Badge 
                      fontWeight="bold" 
                      color={statusColors.color}
                      borderRadius={20} 
                      py={1} 
                      px={2} 
                      borderWidth={2}
                      borderColor={statusColors.borderColor}
                      bg={statusColors.bg}
                    >
                      <GoDotFill />
                      {tenant.tenant_status}
                    </Badge>  
                  </Text>

                  <Text w="10%" textAlign={'center'} fontWeight="medium">{tenant.plan_name}</Text>
                  <Text w="17%" textAlign={'center'}>
                    {tenant.subscription_status ? (
                      <Badge 
                        fontWeight="bold" 
                        color={subscriptionColors.color}
                        borderRadius={20} 
                        py={1} 
                        px={2} 
                        borderWidth={2}
                        borderColor={subscriptionColors.borderColor}
                        bg={subscriptionColors.bg}
                      >
                        <GoDotFill />
                        {tenant.subscription_status}
                      </Badge>
                    ) : (
                      <Text as={'span'} fontSize="xs" color={lighten(0.2, GRAY_COLOR)}>
                        No Subscription
                      </Text>
                    )}
                  </Text>

                  <ButtonGroup w="15%" justifyContent="center">
                    {/* If tenant is held or suspended, show only activate button */}
                    {(tenant.tenant_status.toLowerCase() === 'hold' || 
                      tenant.tenant_status.toLowerCase() === 'suspended' ||
                      tenant.tenant_status.toLowerCase() === 'suspend') ? (
                      <IconButton 
                        bg="none" 
                        color="black"
                        _hover={{ color: "green.500" }}
                        onClick={(e) => handleActivateTenant(tenant.tenant_id, e)}
                        title="Activate tenant"
                      >
                        <MdPlayArrow size={20} />
                      </IconButton>
                    ) : (
                      /* If tenant is active, show hold and suspend buttons */
                      <>
                        <IconButton 
                          bg="none" 
                          color="black"
                          _hover={{ color: WARNING_ORANGE_COLOR }}
                          onClick={(e) => handleHoldTenant(tenant.tenant_id, e)}
                          title="Hold tenant"
                        >
                          <MdPause size={20} />
                        </IconButton>
                        <IconButton 
                          bg="none" 
                          color="black"
                          _hover={{ color: ERROR_RED_COLOR }}
                          onClick={(e) => handleSuspendTenant(tenant.tenant_id, e)}
                          title="Suspend tenant"
                        >
                          <MdBlock size={20} />
                        </IconButton>
                      </>
                    )}
                  </ButtonGroup>
                  
                  <ButtonGroup w="15%">
                    <IconButton 
                      bg="none" 
                      color="black"
                      _hover={{ color: PRIMARY_COLOR }}
                      onClick={(e) => handleViewTenant(tenant.tenant_id, e)}
                      title="View tenant details"
                    >
                      <HiOutlineEye size={20} />
                    </IconButton>
                    <IconButton 
                      bg="none" 
                      color="black"
                      _hover={{ color: PRIMARY_COLOR }}
                      onClick={(e) => handleEditTenant(tenant.tenant_id, e)}
                      title="Edit tenant"
                    >
                      <HiOutlinePencilAlt size={20} />
                    </IconButton>
                    <IconButton 
                      bg="none" 
                      color="black"
                      _hover={{ color: ERROR_RED_COLOR }}
                      onClick={(e) => handleDeleteTenant(tenant.tenant_id, e)}
                      title="Delete tenant"
                      disabled={isDeleting}
                      loading={isDeleting && deleteConfirm.tenantId === tenant.tenant_id}
                    >
                      <HiOutlineTrash size={20} />
                    </IconButton>
                  </ButtonGroup>
                </HStack>
              )
            })
          )}
        </Flex>

        {/* Pagination */}
        {pagination && pagination.total_count > 0 && (
          <Pagination
            pagination={pagination}
            loading={loading}
            onPageChange={onPageChange}
          />
        )}
      </Flex>

      {/* Delete confirmation modal */}
      <ConfirmationDialog
        isOpen={deleteConfirm.show}
        title="Delete Tenant Organization"
        message={`Are you sure you want to delete the organization '${deleteConfirm.organizationName}'? This action cannot be undone and will remove all associated data.`}
        confirmText="Delete Organization"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmationText={deleteConfirm.tenantId}
      />

      {/* Tenant suspension modal */}
      {suspensionModal.show && suspensionModal.tenantId && (
        <TenantSuspensionModal
          isOpen={suspensionModal.show}
          onClose={handleCloseSuspensionModal}
          onSuccess={handleSuspensionSuccess}
          tenantId={suspensionModal.tenantId}
          tenantName={suspensionModal.organizationName || 'Selected Tenant'}
        />
      )}

      {/* Tenant hold modal */}
      {holdModal.show && holdModal.tenantId && (
        <TenantHoldModal
          isOpen={holdModal.show}
          onClose={handleCloseHoldModal}
          onSuccess={handleHoldSuccess}
          tenantId={holdModal.tenantId}
          tenantName={holdModal.organizationName || 'Selected Tenant'}
        />
      )}

      {/* Tenant activation modal */}
      {activationModal.show && activationModal.tenantId && (
        <TenantActivationModal
          isOpen={activationModal.show}
          onClose={handleCloseActivationModal}
          onSuccess={handleActivationSuccess}
          tenantId={activationModal.tenantId}
          tenantName={activationModal.organizationName || 'Selected Tenant'}
        />
      )}
    </Flex>
  )
}

export default TenantTable