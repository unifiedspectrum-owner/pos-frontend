"use client"

/* Libraries imports */
import React from 'react'
import { Flex } from '@chakra-ui/react'
import { useRouter } from '@/i18n/navigation'

/* Shared module imports */
import { HeaderSection, ErrorMessageContainer } from '@shared/components'

/* User module imports */
import UserTable from '@user-management/tables/users'
import { useUsers } from '@user-management/hooks'
import { USER_PAGE_ROUTES } from '@user-management/constants'

const UserManagement: React.FC = () => {
  /* Navigation and routing */
  const router = useRouter()

  /* Custom hooks */
  const { users, loading, error, lastUpdated, pagination, fetchUsers, refetch } = useUsers()

  /* Navigation handlers */
  const handleAddUser = () => {
    router.push(USER_PAGE_ROUTES.CREATE)
  }

  /* Manual refresh triggered by header refresh button */
  const handleRefresh = () => {
    refetch()
    console.log('[UserManagement] User data refreshed successfully')
  }

  return (
    <Flex w={'100%'} flexDir={'column'}>
      {/* Header with navigation and actions */}
      <HeaderSection
        showAddButton={true}
        translation={'UserManagement'}
        loading={loading}
        handleAdd={handleAddUser}
        handleRefresh={handleRefresh}
      />

      {/* Error state */}
      {error && (
        <ErrorMessageContainer
          error={error}
          title="Error Loading Users"
          onRetry={fetchUsers}
          isRetrying={loading}
          testId="user-management-error"
        />
      )}

      {/* Data table */}
      <UserTable
        users={users}
        lastUpdated={lastUpdated}
        onRefresh={refetch}
        onPageChange={(page, limit) => fetchUsers(page, limit)}
        loading={loading}
        pagination={pagination}
      />
    </Flex>
  )
}

export default UserManagement