"use client"

/* Libraries imports */
import React, { useState, useMemo, useCallback } from 'react'
import { Badge, ButtonGroup, Flex, Heading, HStack, IconButton, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { lighten } from 'polished'

/* Icons imports */
import { HiOutlineEye, HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi'
import { MdOutlineFilterList, MdPerson } from 'react-icons/md'
import { LuSearch } from 'react-icons/lu'
import { GoDotFill } from 'react-icons/go'

/* Shared module imports */
import { ConfirmationDialog, EmptyStateContainer, Pagination, TextInputField, TableFilterSelect } from '@shared/components'
import { PaginationInfo } from '@shared/types'
import { GRAY_COLOR, PRIMARY_COLOR, ERROR_RED_COLOR } from '@shared/config'
import { getStatusBadgeColor } from '@shared/utils'

/* User module imports */
import { UserAccountDetails } from '@user-management/types'
import { UserTableSkeleton } from '@user-management/components'
import { useUserOperations } from '@user-management/hooks'
import { USER_PAGE_ROUTES, USER_STATUS_FILTER_OPTIONS } from '@user-management/constants'

/* Role module imports */
import { useRoles } from '@role-management/hooks'

/* Component interfaces */
interface UserTableProps {
  users: UserAccountDetails[]
  lastUpdated: string
  onRefresh?: () => void
  onPageChange?: (page: number, limit: number) => void
  loading?: boolean
  pagination?: PaginationInfo
}

interface DeleteConfirmState {
  show: boolean
  userId?: number
  userName?: string
}

/* User table component with CRUD operations */
const UserTable: React.FC<UserTableProps> = ({
  users, lastUpdated, onRefresh,
  onPageChange, loading = false, pagination
}) => {
  /* Router for navigation */
  const router = useRouter()

  /* Custom hooks */
  const { roleOptions, loading: rolesLoading } = useRoles()
  const { deleteUser, isDeleting } = useUserOperations()

  /* Component state */
  const [selectedUserID, setSelectedUserID] = useState<number | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({ show: false })
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  /* Filtered users based on search and filters */
  const filteredUsers = useMemo(() => {
    if (loading) return [] /* Skip filtering during data load */

    return users.filter(user => {
      const matchesSearch = user.f_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.l_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || user.user_status === statusFilter
      const matchesRole = roleFilter === 'all' || user.role_details?.name === roleFilter

      return matchesSearch && matchesStatus && matchesRole
    })
  }, [users, searchTerm, statusFilter, roleFilter, loading])

  /* Navigation handlers */
  const handleUserRowClick = useCallback((userId: number) => {
    setSelectedUserID(prev => prev === userId ? null : userId)
  }, [])

  const handleViewUser = useCallback((userId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    router.push(USER_PAGE_ROUTES.VIEW.replace(':id', userId.toString()))
  }, [router])

  const handleEditUser = useCallback((userId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    router.push(USER_PAGE_ROUTES.EDIT.replace(':id', userId.toString()))
  }, [router])

  const handleDeleteUser = useCallback((userId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    const user = users.find(u => u.id === userId)
    setDeleteConfirm({
      show: true,
      userId,
      userName: user ? `${user.f_name} ${user.l_name}` : 'Selected User'
    })
  }, [users])

  /* Data operations */
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirm.userId) return

    const success = await deleteUser(
      deleteConfirm.userId.toString(),
      deleteConfirm.userName
    )

    if (success) {
      onRefresh?.() /* Trigger parent refresh */
      setDeleteConfirm({ show: false })
    }
  }, [deleteConfirm.userId, deleteConfirm.userName, deleteUser, onRefresh])

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirm({ show: false })
  }, [])


  return (
    <Flex p={5} flexDir="column" w="100%" gap={3}>
      {/* Header with title and last updated */}
      <Flex justify="space-between">
        <Heading color={lighten(0.2, GRAY_COLOR)}>User Management</Heading>
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
              placeholder="Search by name or email..."
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
            {/* User status filter */}
            <TableFilterSelect
              value={statusFilter}
              onValueChange={setStatusFilter}
              options={USER_STATUS_FILTER_OPTIONS}
              placeholder="Filter by Status"
              disabled={loading}
              icon={<MdOutlineFilterList size={16} color={lighten(0.2, GRAY_COLOR)} />}
            />

            {/* User role filter */}
            <TableFilterSelect
              value={roleFilter}
              onValueChange={setRoleFilter}
              options={roleOptions}
              placeholder="Filter by Role"
              disabled={loading || rolesLoading}
              icon={<MdOutlineFilterList size={16} color={lighten(0.2, GRAY_COLOR)} />}
            />
          </Flex>
        </HStack>

        {/* Table content */}
        <Flex w="100%" flexDir="column" gap={2}>
          {/* Column headers */}
          <HStack w="100%" borderTopWidth={1} borderColor={GRAY_COLOR} fontWeight={500} color={lighten(0.2, GRAY_COLOR)} p={2}>
            <Text w="8%" textAlign="center">SNo.</Text>
            <Text w="20%" textAlign={'center'} _hover={{fontWeight:'bold', color: PRIMARY_COLOR, cursor: 'pointer'}}>Name</Text>
            <Text w="30%" textAlign={'center'} _hover={{fontWeight:'bold', color: PRIMARY_COLOR, cursor: 'pointer'}}>Email</Text>
            <Text w="12%" textAlign={'center'} _hover={{fontWeight:'bold', color: PRIMARY_COLOR, cursor: 'pointer'}}>Role</Text>
            <Text w="15%" textAlign={'center'} _hover={{fontWeight:'bold', color: PRIMARY_COLOR, cursor: 'pointer'}}>Status</Text>
            <Text w="15%" textAlign="center">Actions</Text>
          </HStack>

          {/* Data rows */}
          {loading ? (
            /* Loading state */
            Array.from({ length: 5 }).map((_, index) => (
              <UserTableSkeleton key={`skeleton-${index}`} />
            ))
          ) : filteredUsers.length === 0 ? (
            /* Empty state */
            <EmptyStateContainer
              icon={<MdPerson size={48} color={lighten(0.2, GRAY_COLOR)} />}
              title="No Users Found"
              description={users.length === 0
                ? "No users have been created yet."
                : "No users match your current filters. Try adjusting your search criteria."
              }
            />
          ) : (
            /* Data rows */
            filteredUsers.map((user, index) => {
              const statusColors = getStatusBadgeColor(user.user_status)

              return (
                <HStack
                  key={user.id}
                  w="100%"
                  borderLeftRadius={20}
                  borderRightRadius={20}
                  borderWidth={selectedUserID === user.id ? 2 : 1}
                  borderColor={selectedUserID === user.id ? lighten(0.3, PRIMARY_COLOR) : lighten(0.3, GRAY_COLOR)}
                  bg={selectedUserID === user.id ? lighten(0.47, PRIMARY_COLOR) : ''}
                  _hover={{
                    bg: lighten(0.44, PRIMARY_COLOR),
                    borderColor: lighten(0.3, PRIMARY_COLOR)
                  }}
                  p={2}
                  color={GRAY_COLOR}
                  onClick={() => handleUserRowClick(user.id)}
                >
                  <Text w="8%" textAlign="center">{index + 1}</Text>
                  <Text w="20%" textAlign={'center'} fontWeight="medium">{`${user.f_name} ${user.l_name}`}</Text>
                  <Text w="30%" textAlign={'center'}>{user.email}</Text>

                  <Text w="12%" textAlign={'center'}>
                      {user.role_details?.name || 'N/A'}
                  </Text>

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
                      {user.user_status}
                    </Badge>
                  </Text>

                  <ButtonGroup w="15%">
                    <IconButton
                      bg="none"
                      color="black"
                      _hover={{ color: PRIMARY_COLOR }}
                      onClick={(e) => handleViewUser(user.id, e)}
                      title="View user details"
                    >
                      <HiOutlineEye size={18} />
                    </IconButton>
                    <IconButton
                      bg="none"
                      color="black"
                      _hover={{ color: PRIMARY_COLOR }}
                      onClick={(e) => handleEditUser(user.id, e)}
                      title="Edit user"
                    >
                      <HiOutlinePencilAlt size={18} />
                    </IconButton>
                    <IconButton
                      bg="none"
                      color="black"
                      _hover={{ color: ERROR_RED_COLOR }}
                      onClick={(e) => handleDeleteUser(user.id, e)}
                      title="Delete user"
                      disabled={isDeleting}
                      loading={isDeleting && deleteConfirm.userId === user.id}
                    >
                      <HiOutlineTrash size={18} />
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
        title="Delete User"
        message={`Are you sure you want to delete the user '${deleteConfirm.userName}'? This action cannot be undone and will remove all associated data.`}
        confirmText="Delete User"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmationText={deleteConfirm.userId?.toString()}
      />
    </Flex>
  )
}

export default UserTable