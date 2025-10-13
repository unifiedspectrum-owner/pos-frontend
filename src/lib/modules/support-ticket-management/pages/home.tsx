"use client"

/* Libraries imports */
import React from 'react'
import { Flex } from '@chakra-ui/react'
import { useRouter } from '@/i18n/navigation'

/* Shared module imports */
import { HeaderSection, ErrorMessageContainer } from '@shared/components'
import { usePermissions } from '@shared/contexts'
import { PERMISSION_ACTIONS } from '@shared/constants/rbac'

/* Support ticket module imports */
import SupportTicketTable from '@support-ticket-management/tables/support-tickets'
import { useSupportTickets } from '@support-ticket-management/hooks'
import { SUPPORT_TICKET_PAGE_ROUTES, SUPPORT_TICKET_MODULE_NAME } from '@support-ticket-management/constants'

const SupportTicketManagement: React.FC = () => {
  /* Navigation and permissions */
  const router = useRouter()
  const { hasSpecificPermission } = usePermissions()

  /* Data operations */
  const { tickets, loading, error, lastUpdated, pagination, fetchTickets, refetch } = useSupportTickets({
    autoFetch: true
  })

  /* Navigation handlers */
  const handleAddTicket = () => {
    router.push(SUPPORT_TICKET_PAGE_ROUTES.CREATE)
  }

  /* Manual refresh triggered by header refresh button */
  const handleRefresh = () => {
    refetch()
    console.log('[SupportTicketManagement] Support ticket data refreshed successfully')
  }

  return (
    <Flex w={'100%'} flexDir={'column'}>
      {/* Header with navigation and actions */}
      <HeaderSection
        showAddButton={hasSpecificPermission(SUPPORT_TICKET_MODULE_NAME, PERMISSION_ACTIONS.CREATE)}
        translation={'SupportTicketManagement'}
        loading={loading}
        handleAdd={hasSpecificPermission(SUPPORT_TICKET_MODULE_NAME, PERMISSION_ACTIONS.CREATE) ? handleAddTicket : undefined}
        handleRefresh={handleRefresh}
      />

      {/* Error state */}
      {error && (
        <ErrorMessageContainer
          error={error}
          title="Error Loading Support Tickets"
          onRetry={fetchTickets}
          isRetrying={loading}
          testId="support-ticket-management-error"
        />
      )}

      {/* Data table */}
      <SupportTicketTable
        tickets={tickets}
        lastUpdated={lastUpdated}
        onRefresh={refetch}
        onPageChange={(page, limit) => fetchTickets(page, limit)}
        loading={loading}
        pagination={pagination}
      />
    </Flex>
  )
}

export default SupportTicketManagement
