"use client"

/* Libraries imports */
import React, { useState, useMemo, useCallback } from 'react'
import { Badge, ButtonGroup, Flex, Heading, HStack, IconButton, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { lighten } from 'polished'

/* Icons imports */
import { HiOutlineEye, HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi'
import { MdOutlineFilterList } from 'react-icons/md'
import { LuSearch } from 'react-icons/lu'
import { MdOutlineAdminPanelSettings } from 'react-icons/md'
import { GoDotFill } from 'react-icons/go'

/* Shared module imports */
import { ConfirmationDialog, EmptyStateContainer, Pagination, TextInputField, TableFilterSelect } from '@shared/components'
import { usePermissions } from '@shared/contexts'
import { PaginationInfo } from '@shared/types'
import { GRAY_COLOR, PRIMARY_COLOR, ERROR_RED_COLOR } from '@shared/config'
import { PERMISSION_ACTIONS } from '@shared/constants/rbac'
import { getStatusBadgeColor } from '@shared/utils'

/* Role module imports */
import { Role } from '@role-management/types'
import { ROLE_PAGE_ROUTES, ROLE_STATUS_FILTER_OPTIONS, ROLE_STATUS, ROLE_STATUS_LABELS, ROLE_MODULE_NAME } from '@role-management/constants'
import { RoleTableSkeleton } from '@role-management/components'
import { useRoleOperations } from '@role-management/hooks'

/* Component interfaces */
interface RoleTableProps {
  roles: Role[]
  lastUpdated: string
  onRefresh?: () => void
  onPageChange?: (page: number, limit: number) => void
  loading?: boolean
  pagination?: PaginationInfo
}

interface DeleteConfirmState {
  show: boolean
  roleId?: number
  roleName?: string
}

/* Role table component with search functionality */
const RoleTable: React.FC<RoleTableProps> = ({
  roles, lastUpdated, onRefresh, onPageChange, loading = false, pagination
}) => {
  /* Navigation and permissions */
  const router = useRouter()
  const { hasSpecificPermission } = usePermissions()

  /* Data operations */
  const { deleteRole, isDeleting } = useRoleOperations()

  /* Component state */
  const [selectedRoleID, setSelectedRoleID] = useState<number | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({ show: false })
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>(ROLE_STATUS.ALL)

  /* Filtered roles based on search and status */
  const filteredRoles = useMemo(() => {
    if (loading) return []

    return roles.filter(role => {
      const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase())

      const roleStatus = role.is_active ? ROLE_STATUS.ACTIVE : ROLE_STATUS.INACTIVE
      const matchesStatus = statusFilter === ROLE_STATUS.ALL || roleStatus === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [roles, searchTerm, statusFilter, loading])

  /* Navigation handlers */
  const handleRoleRowClick = useCallback((roleId: number) => {
    setSelectedRoleID(prev => prev === roleId ? null : roleId)
  }, [])

  const handleViewRole = useCallback((roleId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    router.push(ROLE_PAGE_ROUTES.VIEW.replace(':id', roleId.toString()))
  }, [router])

  const handleEditRole = useCallback((roleId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    router.push(ROLE_PAGE_ROUTES.EDIT.replace(':id', roleId.toString()))
  }, [router])

  const handleDeleteRole = useCallback((roleId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    const role = roles.find(r => r.id === roleId)
    setDeleteConfirm({
      show: true,
      roleId,
      roleName: role ? role.name : 'Selected Role'
    })
  }, [roles])

  /* Data operations */
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirm.roleId) return

    const success = await deleteRole(
      deleteConfirm.roleId.toString(),
      deleteConfirm.roleName
    )

    if (success) {
      onRefresh?.() /* Trigger parent refresh */
      setDeleteConfirm({ show: false })
    }
  }, [deleteConfirm.roleId, deleteConfirm.roleName, deleteRole, onRefresh])

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirm({ show: false })
  }, [])

  return (
    <Flex p={5} flexDir="column" w="100%" gap={3}>
      {/* Header with title and last updated */}
      <Flex justify="space-between">
        <Heading color={lighten(0.2, GRAY_COLOR)}>Role Management</Heading>
        <Text alignSelf="end" fontSize="xs">Last Updated: {lastUpdated}</Text>
      </Flex>

      {/* Main table container */}
      <Flex gap={6} p={5} flexDir="column" borderWidth={1} borderColor={lighten(0.3, GRAY_COLOR)} borderRadius={10}>

        {/* Search and filters row */}
        <HStack w="100%" gap={3}>
          {/* Search input */}
          <Flex w="70%">
            <TextInputField
              label=""
              value={searchTerm}
              placeholder="Search by role name or description..."
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
          <Flex w="30%" gap={3}>
            {/* Role status filter */}
            <TableFilterSelect
              value={statusFilter}
              onValueChange={setStatusFilter}
              options={ROLE_STATUS_FILTER_OPTIONS}
              placeholder="Filter by Status"
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
            <Text w="20%"  _hover={{fontWeight:'bold', color: PRIMARY_COLOR, cursor: 'pointer'}}>Name</Text>
            <Text w="35%" textAlign={'center'} _hover={{fontWeight:'bold', color: PRIMARY_COLOR, cursor: 'pointer'}}>Description</Text>
            <Text w="12%" textAlign={'center'} _hover={{fontWeight:'bold', color: PRIMARY_COLOR, cursor: 'pointer'}}>Status</Text>
            <Text w="10%" textAlign={'center'} _hover={{fontWeight:'bold', color: PRIMARY_COLOR, cursor: 'pointer'}}>Users Count</Text>
            <Text w="15%" textAlign="center">Actions</Text>
          </HStack>

          {/* Data rows */}
          {loading ? (
            /* Loading state */
            Array.from({ length: 5 }).map((_, index) => (
              <RoleTableSkeleton key={`skeleton-${index}`} />
            ))
          ) : filteredRoles.length === 0 ? (
            /* Empty state */
            <EmptyStateContainer
              icon={<MdOutlineAdminPanelSettings size={48} color={lighten(0.2, GRAY_COLOR)} />}
              title="No Roles Found"
              description={roles.length === 0
                ? "No roles have been created yet."
                : "No roles match your current search criteria."
              }
            />
          ) : (
            /* Data rows */
            filteredRoles
            .sort((a, b) => Number(a.display_order) - Number(b.display_order))
            .map((role, index) => {
              const roleStatus = role.is_active ? ROLE_STATUS.ACTIVE : ROLE_STATUS.INACTIVE
              const statusColors = getStatusBadgeColor(roleStatus)

              return (
                <HStack
                  key={role.id}
                  w="100%"
                  borderLeftRadius={20}
                  borderRightRadius={20}
                  borderWidth={selectedRoleID === role.id ? 2 : 1}
                  borderColor={selectedRoleID === role.id ? lighten(0.3, PRIMARY_COLOR) : lighten(0.3, GRAY_COLOR)}
                  bg={selectedRoleID === role.id ? lighten(0.47, PRIMARY_COLOR) : ''}
                  _hover={{
                    bg: lighten(0.44, PRIMARY_COLOR),
                    borderColor: lighten(0.3, PRIMARY_COLOR)
                  }}
                  p={2}
                  color={GRAY_COLOR}
                  onClick={() => handleRoleRowClick(role.id)}
                >
                  <Text w="8%" textAlign="center">{index + 1}</Text>
                  <Text w="20%" fontWeight="medium">{role.name}</Text>
                  <Text w="35%">{role.description}</Text>

                  <Text w="12%" textAlign={'center'}>
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
                      {ROLE_STATUS_LABELS[roleStatus]}
                    </Badge>
                  </Text>

                  <Text w="10%" textAlign={'center'} fontWeight="medium">{role.user_count}</Text>

                  <ButtonGroup w="15%" justifyContent={'center'}>
                    {hasSpecificPermission(ROLE_MODULE_NAME, PERMISSION_ACTIONS.READ) && (
                      <IconButton
                        bg="none"
                        color="black"
                        _hover={{ color: PRIMARY_COLOR }}
                        onClick={(e) => handleViewRole(role.id, e)}
                        title="View role details"
                      >
                        <HiOutlineEye size={18} />
                      </IconButton>
                    )}
                    {hasSpecificPermission(ROLE_MODULE_NAME, PERMISSION_ACTIONS.UPDATE) && (
                      <IconButton
                        bg="none"
                        color="black"
                        _hover={{ color: PRIMARY_COLOR }}
                        onClick={(e) => handleEditRole(role.id, e)}
                        title="Edit role"
                      >
                        <HiOutlinePencilAlt size={18} />
                      </IconButton>
                    )}
                    {hasSpecificPermission(ROLE_MODULE_NAME, PERMISSION_ACTIONS.DELETE) && (
                      <IconButton
                        bg="none"
                        color="black"
                        _hover={{ color: ERROR_RED_COLOR }}
                        onClick={(e) => handleDeleteRole(role.id, e)}
                        title="Delete role"
                        disabled={isDeleting}
                        loading={isDeleting && deleteConfirm.roleId === role.id}
                      >
                        <HiOutlineTrash size={18} />
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
        title="Delete Role"
        message={`Are you sure you want to delete the role '${deleteConfirm.roleName}'? This action cannot be undone and will remove all associated data.`}
        confirmText="Delete Role"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmationText={deleteConfirm.roleId?.toString()}
      />
    </Flex>
  )
}

export default RoleTable