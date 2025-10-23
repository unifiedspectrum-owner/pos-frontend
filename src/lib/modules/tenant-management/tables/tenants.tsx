"use client"

/* Libraries imports */
import React, { useState, useMemo, useCallback } from 'react'
import { Badge, ButtonGroup, Flex, Heading, HStack, IconButton, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { lighten } from 'polished'

/* Icons imports */
import { HiOutlineEye, HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi'
import { MdOutlineFilterList, MdBusiness, MdPause, MdBlock, MdPlayArrow } from 'react-icons/md'
import { LuSearch } from 'react-icons/lu'
import { GoDotFill } from 'react-icons/go'

/* Shared module imports */
import { ConfirmationDialog, EmptyStateContainer, Pagination, TextInputField, TableFilterSelect } from '@shared/components'
import { usePermissions } from '@shared/contexts'
import { PaginationInfo } from '@shared/types'
import { GRAY_COLOR, PRIMARY_COLOR, ERROR_RED_COLOR, WARNING_ORANGE_COLOR } from '@shared/config'
import { STATUS_BADGE_CONFIG } from '@shared/constants'
import { PERMISSION_ACTIONS } from '@shared/constants/rbac'

/* Tenant module imports */
import { TenantWithPlanDetails } from '@tenant-management/types'
import { TenantTableSkeleton, TenantSuspensionModal, TenantHoldModal, TenantActivationModal } from '@tenant-management/components'
import { TENANT_STATUS_FILTER_OPTIONS, TENANT_SUBSCRIPTION_FILTER_OPTIONS, TENANT_PAGE_ROUTES, TENANT_STATUS, TENANT_MODULE_NAME } from '@tenant-management/constants'
import { useTenantOperations } from '@tenant-management/hooks'

/* Component interfaces */
interface TenantTableProps {
  tenants: TenantWithPlanDetails[] /* Array of tenant data to display */
  lastUpdated: string /* Timestamp of last data refresh */
  onRefresh?: () => void /* Callback when tenant is deleted or modified */
  onPageChange?: (page: number, limit: number) => void /* Pagination handler */
  loading?: boolean /* Loading state indicator */
  pagination?: PaginationInfo /* Pagination configuration */
}

/* Modal state for tenant operations */
interface ModalState {
  show: boolean /* Modal visibility flag */
  tenantId?: string /* Selected tenant ID */
  organizationName?: string /* Selected tenant organization name */
}

/* Tenant table component with CRUD operations */
const TenantTable: React.FC<TenantTableProps> = ({ 
  tenants, 
  lastUpdated, 
  onRefresh,
  onPageChange,
  loading = false,
  pagination
}) => {
  /* Navigation and permissions */
  const router = useRouter()
  const { hasSpecificPermission } = usePermissions()

  /* Data operations */
  const { deleteTenant, isDeleting } = useTenantOperations()

  /* UI state management */
  const [selectedTenantID, setSelectedTenantID] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>(TENANT_STATUS_FILTER_OPTIONS[0].value)
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>(TENANT_SUBSCRIPTION_FILTER_OPTIONS[0].value)

  /* Modal states */
  const [deleteConfirm, setDeleteConfirm] = useState<ModalState>({ show: false })
  const [suspensionModal, setSuspensionModal] = useState<ModalState>({ show: false })
  const [holdModal, setHoldModal] = useState<ModalState>({ show: false })
  const [activationModal, setActivationModal] = useState<ModalState>({ show: false })

  /* Data filtering logic */
  const filteredTenants = useMemo(() => {
    if (loading) return [] /* Skip filtering during data load */

    return tenants.filter(tenant => {
      /* Search by organization name or tenant ID */
      const matchesSearch = tenant.organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.tenant_id.toLowerCase().includes(searchTerm.toLowerCase())

      /* Filter by tenant status */
      const matchesStatus = statusFilter === TENANT_STATUS_FILTER_OPTIONS[0].value || tenant.tenant_status === statusFilter

      /* Filter by subscription status */
      const matchesSubscription = subscriptionFilter === TENANT_SUBSCRIPTION_FILTER_OPTIONS[0].value ||
        (subscriptionFilter === TENANT_SUBSCRIPTION_FILTER_OPTIONS.find(opt => opt.value === 'none')?.value && !tenant.subscription_status) ||
        tenant.subscription_status === subscriptionFilter

      return matchesSearch && matchesStatus && matchesSubscription
    })
  }, [tenants, searchTerm, statusFilter, subscriptionFilter, loading])

  /* Table interaction handlers */
  const handleTenantRowClick = useCallback((tenantId: string) => {
    setSelectedTenantID(prev => prev === tenantId ? null : tenantId) /* Toggle row selection */
  }, [])

  /* Navigation action handlers */
  const handleViewTenant = useCallback((tenantId: string, event: React.MouseEvent) => {
    event.stopPropagation() /* Prevent row selection */
    router.push(TENANT_PAGE_ROUTES.VIEW.replace(':id', tenantId))
  }, [router])

  const handleEditTenant = useCallback((tenantId: string, event: React.MouseEvent) => {
    event.stopPropagation() /* Prevent row selection */
    router.push(TENANT_PAGE_ROUTES.EDIT.replace(':id', tenantId))
  }, [router])

  /* Tenant action modal handlers */
  const handleDeleteTenant = useCallback((tenantId: string, event: React.MouseEvent) => {
    event.stopPropagation() /* Prevent row selection */
    const tenant = tenants.find(t => t.tenant_id === tenantId)
    setDeleteConfirm({
      show: true,
      tenantId,
      organizationName: tenant?.organization_name || 'Selected Tenant'
    })
  }, [tenants])

  const handleHoldTenant = useCallback((tenantId: string, event: React.MouseEvent) => {
    event.stopPropagation() /* Prevent row selection */
    const tenant = tenants.find(t => t.tenant_id === tenantId)
    setHoldModal({
      show: true,
      tenantId,
      organizationName: tenant?.organization_name || 'Selected Tenant'
    })
  }, [tenants])

  const handleSuspendTenant = useCallback((tenantId: string, event: React.MouseEvent) => {
    event.stopPropagation() /* Prevent row selection */
    const tenant = tenants.find(t => t.tenant_id === tenantId)
    setSuspensionModal({
      show: true,
      tenantId,
      organizationName: tenant?.organization_name || 'Selected Tenant'
    })
  }, [tenants])

  const handleActivateTenant = useCallback((tenantId: string, event: React.MouseEvent) => {
    event.stopPropagation() /* Prevent row selection */
    const tenant = tenants.find(t => t.tenant_id === tenantId)
    setActivationModal({
      show: true,
      tenantId,
      organizationName: tenant?.organization_name || 'Selected Tenant'
    })
  }, [tenants])

  /* Delete confirmation handlers */
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirm.tenantId) return

    const success = await deleteTenant(deleteConfirm.tenantId, deleteConfirm.organizationName)

    if (success) {
      onRefresh?.() /* Trigger parent refresh */
    }

    setDeleteConfirm({ show: false })
  }, [deleteConfirm.tenantId, deleteConfirm.organizationName, deleteTenant, onRefresh])

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirm({ show: false })
  }, [])

  /* Modal close and success handlers */
  const handleCloseSuspensionModal = useCallback(() => {
    setSuspensionModal({ show: false })
  }, [])

  const handleSuspensionSuccess = useCallback(() => {
    onRefresh?.() /* Trigger parent refresh */
  }, [onRefresh])

  const handleCloseHoldModal = useCallback(() => {
    setHoldModal({ show: false })
  }, [])

  const handleHoldSuccess = useCallback(() => {
    onRefresh?.() /* Trigger parent refresh */
  }, [onRefresh])

  const handleCloseActivationModal = useCallback(() => {
    setActivationModal({ show: false })
  }, [])

  const handleActivationSuccess = useCallback(() => {
    onRefresh?.() /* Trigger parent refresh */
  }, [onRefresh])

  return (
    <Flex p={5} flexDir="column" w="100%" gap={3}>
      {/* Header with title and last updated */}
      <Flex justify="space-between">
        <Heading color={lighten(0.2, GRAY_COLOR)}>Tenant Organizations</Heading>
        <Text alignSelf="end" fontSize="xs">Last Updated: {lastUpdated}</Text>
      </Flex>

      {/* Main table container */}
      <Flex gap={6} p={5} flexDir="column" borderWidth={1} borderColor={lighten(0.3, GRAY_COLOR)} borderRadius={10}>
        
        {/* Search and filter controls */}
        <HStack w="100%" gap={3}>
          {/* Search input field */}
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

          {/* Filter dropdown controls */}
          <Flex w="40%" gap={3}>
            {/* Status filter dropdown */}
            <TableFilterSelect
              value={statusFilter}
              onValueChange={setStatusFilter}
              options={TENANT_STATUS_FILTER_OPTIONS}
              placeholder="Filter by Status"
              disabled={loading}
              icon={<MdOutlineFilterList size={16} color={lighten(0.2, GRAY_COLOR)} />}
            />

            {/* Subscription filter dropdown */}
            <TableFilterSelect
              value={subscriptionFilter}
              onValueChange={setSubscriptionFilter}
              options={TENANT_SUBSCRIPTION_FILTER_OPTIONS}
              placeholder="Filter by Subscription"
              disabled={loading}
              icon={<MdOutlineFilterList size={16} color={lighten(0.2, GRAY_COLOR)} />}
            />
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
            {hasSpecificPermission(TENANT_MODULE_NAME, PERMISSION_ACTIONS.UPDATE) && (
              <Text w="15%" textAlign="center">Status Actions</Text>
            )}
            {hasSpecificPermission(TENANT_MODULE_NAME, PERMISSION_ACTIONS.UPDATE) 
            ? <Text w="15%" textAlign="center">Actions</Text>
            : <Text w="30%" textAlign="center">Actions</Text>
            }
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
              const statusColors = STATUS_BADGE_CONFIG[tenant.tenant_status];
              const subscriptionColors = tenant.subscription_status 
                ? STATUS_BADGE_CONFIG[tenant.subscription_status]
                : { color: lighten(0.2, GRAY_COLOR), bg: lighten(0.4, GRAY_COLOR), borderColor: lighten(0.3, GRAY_COLOR) }
              console.log("tenants", tenant.tenant_id, subscriptionColors)
              
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

                  {hasSpecificPermission(TENANT_MODULE_NAME, PERMISSION_ACTIONS.UPDATE) && (
                    <ButtonGroup w="15%" justifyContent="center">
                      {/* If tenant is held or suspended, show only activate button */}
                      {(tenant.tenant_status.toLowerCase() === TENANT_STATUS.HOLD ||
                        tenant.tenant_status.toLowerCase() === TENANT_STATUS.SUSPENDED) ? (
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
                  )}
                  
                  <ButtonGroup w={hasSpecificPermission(TENANT_MODULE_NAME, PERMISSION_ACTIONS.UPDATE) ? '15%' : '30%'} justifyContent={'center'}>
                    {hasSpecificPermission(TENANT_MODULE_NAME, PERMISSION_ACTIONS.READ) && (
                      <IconButton
                        bg="none"
                        color="black"
                        _hover={{ color: PRIMARY_COLOR }}
                        onClick={(e) => handleViewTenant(tenant.tenant_id, e)}
                        title="View tenant details"
                      >
                        <HiOutlineEye size={20} />
                      </IconButton>
                    )}
                    {hasSpecificPermission(TENANT_MODULE_NAME, PERMISSION_ACTIONS.UPDATE) && (
                      <IconButton
                        bg="none"
                        color="black"
                        _hover={{ color: PRIMARY_COLOR }}
                        onClick={(e) => handleEditTenant(tenant.tenant_id, e)}
                        title="Edit tenant"
                      >
                        <HiOutlinePencilAlt size={20} />
                      </IconButton>
                    )}
                    {hasSpecificPermission(TENANT_MODULE_NAME, PERMISSION_ACTIONS.DELETE) && (
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
                    )}
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