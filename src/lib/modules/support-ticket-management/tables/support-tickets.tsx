"use client"

/* Libraries imports */
import React, { useState, useMemo, useCallback } from 'react'
import { Badge, ButtonGroup, Flex, Heading, HStack, IconButton, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { lighten } from 'polished'

/* Icons imports */
import { HiOutlineEye, HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi'
import { MdOutlineFilterList, MdOutlineConfirmationNumber } from 'react-icons/md'
import { LuSearch } from 'react-icons/lu'
import { GoDotFill } from 'react-icons/go'
import { FaUserPlus, FaCommentDots, FaExchangeAlt } from 'react-icons/fa'

/* Shared module imports */
import { EmptyStateContainer, Pagination, TextInputField, TableFilterSelect, DynamicDialog, ConfirmationDialog } from '@shared/components'
import { usePermissions } from '@shared/contexts'
import { PaginationInfo } from '@shared/types'
import { GRAY_COLOR, PRIMARY_COLOR, ERROR_RED_COLOR } from '@shared/config'
import { PERMISSION_ACTIONS } from '@shared/constants/rbac'

/* Support ticket module imports */
import { TicketListItem } from '@support-ticket-management/types'
import { SUPPORT_TICKET_PAGE_ROUTES, TICKET_STATUS, TICKET_STATUS_LABELS, TICKET_STATUS_OPTIONS, SUPPORT_TICKET_MODULE_NAME } from '@support-ticket-management/constants'
import { SupportTicketTableSkeleton } from '@support-ticket-management/components'
import { AssignTicketForm, TicketComments, UpdateTicketStatusForm } from '@support-ticket-management/forms'
import { STATUS_BADGE_CONFIG } from '@shared/constants'
import { useCommentOperations, useTicketOperations } from '@support-ticket-management/hooks'

/* Component interfaces */
interface SupportTicketTableProps {
  tickets: TicketListItem[]
  lastUpdated: string
  onRefresh?: () => void
  onPageChange?: (page: number, limit: number) => void
  loading?: boolean
  pagination?: PaginationInfo
}

interface DeleteConfirmState {
  show: boolean
  ticketId?: number
  ticketNumber?: string
}

/* Support ticket table component with search functionality */
const SupportTicketTable: React.FC<SupportTicketTableProps> = ({
  tickets, lastUpdated, onRefresh, onPageChange, loading = false, pagination
}) => {
  /* Navigation and permissions */
  const router = useRouter()
  const { hasSpecificPermission } = usePermissions()

  /* Fetch ticket comments hook */
  const { ticketComments, fetchTicketComments, refetchTicketComments } = useCommentOperations()

  /* Ticket operations hook */
  const { deleteTicket, isDeleting } = useTicketOperations()

  /* Component state */
  const [selectedTicketID, setSelectedTicketID] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>(TICKET_STATUS.ALL)
  const [assignTicketModalOpen, setAssignTicketModalOpen] = useState<boolean>(false)
  const [selectedTicketForAssignment, setSelectedTicketForAssignment] = useState<TicketListItem | null>(null)
  const [addCommentModalOpen, setAddCommentModalOpen] = useState<boolean>(false)
  const [selectedTicketForComment, setSelectedTicketForComment] = useState<TicketListItem | null>(null)
  const [updateStatusModalOpen, setUpdateStatusModalOpen] = useState<boolean>(false)
  const [selectedTicketForStatusUpdate, setSelectedTicketForStatusUpdate] = useState<TicketListItem | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({ show: false })

  /* Filtered tickets based on search and status */
  const filteredTickets = useMemo(() => {
    if (loading) return []

    return tickets.filter(ticket => {
      const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.ticket_id.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === TICKET_STATUS.ALL || ticket.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [tickets, searchTerm, statusFilter, loading])

  /* Navigation handlers */
  const handleTicketRowClick = useCallback((ticketId: number) => {
    setSelectedTicketID(prev => prev === ticketId ? null : ticketId)
  }, [])

  const handleViewTicket = useCallback((ticketId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    router.push(SUPPORT_TICKET_PAGE_ROUTES.VIEW.replace(':id', ticketId.toString()))
  }, [router])

  const handleEditTicket = useCallback((ticketId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    router.push(SUPPORT_TICKET_PAGE_ROUTES.EDIT.replace(':id', ticketId.toString()))
  }, [router])

  const handleAssignTicket = useCallback((ticket: TicketListItem, event: React.MouseEvent) => {
    event.stopPropagation()
    setSelectedTicketForAssignment(ticket)
    setAssignTicketModalOpen(true)
  }, [])

  const handleCloseAssignModal = useCallback(() => {
    setAssignTicketModalOpen(false)
    setSelectedTicketForAssignment(null)
  }, [])

  const handleAssignSuccess = useCallback(() => {
    handleCloseAssignModal()
    /* Refresh ticket list if onRefresh is provided */
    if (onRefresh) {
      onRefresh()
    }
  }, [handleCloseAssignModal, onRefresh])

  const handleAddComment = useCallback(async (ticket: TicketListItem, event: React.MouseEvent) => {
    event.stopPropagation()
    setSelectedTicketForComment(ticket)
    setAddCommentModalOpen(true)
    /* Fetch comments for the selected ticket */
    await fetchTicketComments(ticket.id.toString())
  }, [fetchTicketComments])

  const handleCloseCommentModal = useCallback(() => {
    setAddCommentModalOpen(false)
    setSelectedTicketForComment(null)
  }, [])

  const handleRefreshComments = useCallback(async () => {
    /* Refetch comments and refresh ticket list */
    await refetchTicketComments()
    if (onRefresh) {
      onRefresh()
    }
  }, [refetchTicketComments, onRefresh])

  const handleUpdateStatus = useCallback((ticket: TicketListItem, event: React.MouseEvent) => {
    event.stopPropagation()
    setSelectedTicketForStatusUpdate(ticket)
    setUpdateStatusModalOpen(true)
  }, [])

  const handleCloseStatusUpdateModal = useCallback(() => {
    setUpdateStatusModalOpen(false)
    setSelectedTicketForStatusUpdate(null)
  }, [])

  const handleStatusUpdateSuccess = useCallback(() => {
    handleCloseStatusUpdateModal()
    /* Refresh ticket list if onRefresh is provided */
    if (onRefresh) {
      onRefresh()
    }
  }, [handleCloseStatusUpdateModal, onRefresh])

  const handleDeleteTicket = useCallback((ticketId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    const ticket = tickets.find(t => t.id === ticketId)
    setDeleteConfirm({
      show: true,
      ticketId,
      ticketNumber: ticket ? ticket.ticket_id : 'Selected Ticket'
    })
  }, [tickets])

  /* Data operations */
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirm.ticketId) return

    const success = await deleteTicket(deleteConfirm.ticketId.toString())

    if (success) {
      onRefresh?.() /* Trigger parent refresh */
      setDeleteConfirm({ show: false })
    }
  }, [deleteConfirm.ticketId, deleteTicket, onRefresh])

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirm({ show: false })
  }, [])

  return (
    <Flex p={5} flexDir="column" w="100%" gap={3}>
      {/* Header with title and last updated */}
      <Flex justify="space-between">
        <Heading color={lighten(0.2, GRAY_COLOR)}>Support Ticket Management</Heading>
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
              placeholder="Search by ticket ID or subject..."
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
            {/* Ticket status filter */}
            <TableFilterSelect
              value={statusFilter}
              onValueChange={setStatusFilter}
              options={TICKET_STATUS_OPTIONS}
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
            <Text w="6%" textAlign="center">SNo.</Text>
            <Text w="13%" _hover={{fontWeight:'bold', color: PRIMARY_COLOR, cursor: 'pointer'}}>Ticket ID</Text>
            <Text w="25%" _hover={{fontWeight:'bold', color: PRIMARY_COLOR, cursor: 'pointer'}}>Subject</Text>
            <Text w="10%" textAlign={'center'} _hover={{fontWeight:'bold', color: PRIMARY_COLOR, cursor: 'pointer'}}>Status</Text>
            <Text w="13%" textAlign={'center'} _hover={{fontWeight:'bold', color: PRIMARY_COLOR, cursor: 'pointer'}}>Category</Text>
            <Text w="9%" textAlign={'center'} _hover={{fontWeight:'bold', color: PRIMARY_COLOR, cursor: 'pointer'}}>Created</Text>
            <Text w="12%" textAlign="center">Quick Actions</Text>
            <Text w="12%" textAlign="center">Actions</Text>
          </HStack>

          {/* Data rows */}
          {loading ? (
            /* Loading state */
            Array.from({ length: 5 }).map((_, index) => (
              <SupportTicketTableSkeleton key={`skeleton-${index}`} />
            ))
          ) : filteredTickets.length === 0 ? (
            /* Empty state */
            <EmptyStateContainer
              icon={<MdOutlineConfirmationNumber size={48} color={lighten(0.2, GRAY_COLOR)} />}
              title="No Support Tickets Found"
              description={tickets.length === 0
                ? "No support tickets have been created yet."
                : "No tickets match your current search criteria."
              }
            />
          ) : (
            /* Data rows */
            filteredTickets.map((ticket, index) => {
              const statusColors = STATUS_BADGE_CONFIG[ticket.status];
              return (
                <HStack
                  key={ticket.id}
                  w="100%"
                  borderLeftRadius={20}
                  borderRightRadius={20}
                  borderWidth={selectedTicketID === ticket.id ? 2 : 1}
                  borderColor={selectedTicketID === ticket.id ? lighten(0.3, PRIMARY_COLOR) : lighten(0.3, GRAY_COLOR)}
                  bg={selectedTicketID === ticket.id ? lighten(0.47, PRIMARY_COLOR) : ''}
                  _hover={{
                    bg: lighten(0.44, PRIMARY_COLOR),
                    borderColor: lighten(0.3, PRIMARY_COLOR)
                  }}
                  p={2}
                  color={GRAY_COLOR}
                  onClick={() => handleTicketRowClick(ticket.id)}
                >
                  <Text w="6%" textAlign="center">{index + 1}</Text>
                  <Text w="13%" fontWeight="medium">{ticket.ticket_id}</Text>
                  <Text w="25%">{ticket.subject}</Text>

                  <Text w="10%" textAlign={'center'}>
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
                      {TICKET_STATUS_LABELS[ticket.status as keyof typeof TICKET_STATUS_LABELS] || ticket.status}
                    </Badge>
                  </Text>

                  <Text w="13%" textAlign={'center'}>{ticket.category_name || 'N/A'}</Text>
                  <Text w="9%" textAlign={'center'} fontSize="sm">{new Date(ticket.created_at).toLocaleDateString()}</Text>

                  <ButtonGroup w="12%" justifyContent={'center'} gap={1}>
                    {hasSpecificPermission(SUPPORT_TICKET_MODULE_NAME, PERMISSION_ACTIONS.UPDATE) && (
                      <>
                        <IconButton
                          bg="none"
                          color="black"
                          _hover={{ color: 'blue.500' }}
                          onClick={(e) => handleAssignTicket(ticket, e)}
                          title="Assign ticket to user"
                        >
                          <FaUserPlus size={16} />
                        </IconButton>
                        <IconButton
                          bg="none"
                          color="black"
                          _hover={{ color: 'orange.500' }}
                          onClick={(e) => handleUpdateStatus(ticket, e)}
                          title="Update ticket status"
                        >
                          <FaExchangeAlt size={16} />
                        </IconButton>
                        <IconButton
                          bg="none"
                          color="black"
                          _hover={{ color: 'green.500' }}
                          onClick={(e) => handleAddComment(ticket, e)}
                          title="Add comment"
                        >
                          <FaCommentDots size={16} />
                        </IconButton>
                      </>
                    )}
                  </ButtonGroup>

                  <ButtonGroup w="12%" justifyContent={'center'} gap={1}>
                    {hasSpecificPermission(SUPPORT_TICKET_MODULE_NAME, PERMISSION_ACTIONS.READ) && (
                      <IconButton
                        bg="none"
                        color="black"
                        _hover={{ color: PRIMARY_COLOR }}
                        onClick={(e) => handleViewTicket(ticket.id, e)}
                        title="View ticket details"
                      >
                        <HiOutlineEye size={18} />
                      </IconButton>
                    )}
                    {hasSpecificPermission(SUPPORT_TICKET_MODULE_NAME, PERMISSION_ACTIONS.UPDATE) && (
                      <IconButton
                        bg="none"
                        color="black"
                        _hover={{ color: PRIMARY_COLOR }}
                        onClick={(e) => handleEditTicket(ticket.id, e)}
                        title="Edit ticket"
                      >
                        <HiOutlinePencilAlt size={18} />
                      </IconButton>
                    )}
                    {hasSpecificPermission(SUPPORT_TICKET_MODULE_NAME, PERMISSION_ACTIONS.DELETE) && (
                      <IconButton
                        bg="none"
                        color="black"
                        _hover={{ color: ERROR_RED_COLOR }}
                        onClick={(e) => handleDeleteTicket(ticket.id, e)}
                        title="Delete ticket"
                        disabled={isDeleting}
                        loading={isDeleting && deleteConfirm.ticketId === ticket.id}
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

      {/* Assign Ticket Modal */}
      <DynamicDialog
        isOpen={assignTicketModalOpen}
        onClose={handleCloseAssignModal}
        title="Assign Ticket to User"
        titleIcon={<FaUserPlus size={20} />}
        size="lg"
        closeOnOutsideClick={false}
      >
        {selectedTicketForAssignment && (
          <AssignTicketForm
            ticketId={selectedTicketForAssignment.id.toString()}
            ticketNumber={selectedTicketForAssignment.ticket_id}
            ticketSubject={selectedTicketForAssignment.subject}
            ticketStatus={selectedTicketForAssignment.status}
            onSuccess={handleAssignSuccess}
            onCancel={handleCloseAssignModal}
          />
        )}
      </DynamicDialog>

      {/* Add Comment Modal */}
      <DynamicDialog
        isOpen={addCommentModalOpen}
        onClose={handleCloseCommentModal}
        title="Ticket Communications"
        titleIcon={<FaCommentDots size={20} />}
        size="lg"
        closeOnOutsideClick={false}
      >
        {selectedTicketForComment && (
          <TicketComments
            comments={ticketComments}
            ticketId={selectedTicketForComment.id.toString()}
            onRefresh={handleRefreshComments}
          />
        )}
      </DynamicDialog>

      {/* Update Ticket Status Modal */}
      <DynamicDialog
        isOpen={updateStatusModalOpen}
        onClose={handleCloseStatusUpdateModal}
        title="Update Ticket Status"
        titleIcon={<FaExchangeAlt size={20} />}
        size="lg"
        closeOnOutsideClick={false}
      >
        {selectedTicketForStatusUpdate && (
          <UpdateTicketStatusForm
            ticketId={selectedTicketForStatusUpdate.id.toString()}
            ticketNumber={selectedTicketForStatusUpdate.ticket_id}
            ticketSubject={selectedTicketForStatusUpdate.subject}
            currentStatus={selectedTicketForStatusUpdate.status}
            onSuccess={handleStatusUpdateSuccess}
            onCancel={handleCloseStatusUpdateModal}
          />
        )}
      </DynamicDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirm.show}
        title="Delete Support Ticket"
        message={`Are you sure you want to delete ticket "${deleteConfirm.ticketNumber}"? This action cannot be undone and will remove all associated data.`}
        confirmText="Delete Ticket"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmationText={deleteConfirm.ticketId?.toString()}
      />
    </Flex>
  )
}

export default SupportTicketTable
