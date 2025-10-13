"use client"

/* Libraries imports */
import React, { useEffect, useState } from 'react'
import { Flex, Box, VStack, HStack, Heading, Text, Badge, SimpleGrid, Icon, Tabs, Separator, IconButton } from '@chakra-ui/react'
import { lighten } from 'polished'
import { FaCalendarAlt, FaUser, FaEnvelope, FaPhone, FaTicketAlt, FaListAlt, FaExclamationCircle, FaClock, FaUserTie, FaCheckCircle, FaComments, FaPaperclip, FaStar, FaInfoCircle, FaDownload } from 'react-icons/fa'
import { MdOutlineConfirmationNumber } from 'react-icons/md'

/* Shared module imports */
import { PRIMARY_COLOR, GRAY_COLOR } from '@shared/config'
import { ErrorMessageContainer, Breadcrumbs, FullPageLoader } from '@shared/components/common'
import { formatDate, formatFileSize } from '@shared/utils'
import { STATUS_BADGE_CONFIG, getFileTypeIcon } from '@shared/constants'

/* Support ticket module imports */
import { useTicketOperations } from '@support-ticket-management/hooks'

/* Component props interface */
interface TicketDetailsPageProps {
  ticketId: string
}

/* Tab types for ticket details view */
type TicketDetailsTabType = 'overview' | 'communications'

/* Ticket details page component with tabbed interface */
const TicketDetailsPage: React.FC<TicketDetailsPageProps> = ({ ticketId }) => {
  /* Ticket operations hook for data fetching */
  const { fetchTicketDetails, ticketDetails, isFetching, fetchError } = useTicketOperations()

  /* Active tab state management */
  const [activeTab, setActiveTab] = useState<TicketDetailsTabType>('overview')

  /* Fetch ticket data on component mount */
  useEffect(() => {
    if (ticketId) {
      fetchTicketDetails(ticketId)
    }
  }, [ticketId, fetchTicketDetails])

  /* Tab change handler */
  const handleTabChange = (e: { value: string }) => {
    setActiveTab(e.value as TicketDetailsTabType)
  }

  /* Loading state display */
  if (isFetching) {
    return <FullPageLoader />
  }

  /* Error state display */
  if (fetchError || !ticketDetails) {
    return (
      <ErrorMessageContainer
        error={fetchError || 'Ticket details not found'}
      />
    )
  }

  /* Get status badge configuration */
  const statusConfig = STATUS_BADGE_CONFIG[ticketDetails.status] || STATUS_BADGE_CONFIG.default

  return (
    <Flex w={'100%'} flexDir={'column'}>
      {/* Main container with responsive layout */}
      <Flex flexDir="column" p={6} maxW="1400px" mx="auto" w="full" gap={4}>
        {/* Page header with title and breadcrumbs */}
        <Flex flexDir="column" gap={1}>
          <Heading as="h1" fontWeight="700" mb={0}>
            {ticketDetails.ticket_id} - {ticketDetails.subject}
          </Heading>
          <Breadcrumbs />
        </Flex>

        {/* Main content container with tabs */}
        <Flex py={5} borderWidth={1} borderRadius={10} borderColor={lighten(0.3, GRAY_COLOR)}>
          <Tabs.Root w="100%" value={activeTab} variant="outline" size="md" onValueChange={handleTabChange}>

            {/* Tab navigation headers */}
            <Tabs.List w={'full'} px={5} borderBottomWidth={1} gap={1} borderColor={lighten(0.3, GRAY_COLOR)} flex={1} mb={4}>
              <Tabs.Trigger
                alignItems="center"
                justifyContent="space-between"
                h="60px"
                borderWidth={1}
                borderBottomWidth={activeTab === 'overview' ? 0 : 1}
                borderColor={lighten(0.3, GRAY_COLOR)}
                borderTopRadius={10}
                w="50%"
                p={5}
                value="overview"
                cursor={'pointer'}
                _hover={{ bg: lighten(0.47, PRIMARY_COLOR) }}>
                <Flex align="center" justify="center" gap="5px">
                  <Text fontSize="lg">
                    <FaInfoCircle color={PRIMARY_COLOR} />
                  </Text>
                  <Text>Overview</Text>
                </Flex>
              </Tabs.Trigger>

              <Tabs.Trigger
                alignItems="center"
                justifyContent="space-between"
                h="60px"
                borderWidth={1}
                borderBottomWidth={activeTab === 'communications' ? 0 : 1}
                borderColor={lighten(0.3, GRAY_COLOR)}
                borderTopRadius={10}
                w="50%"
                p={5}
                value="communications"
                cursor={'pointer'}
                _hover={{ bg: lighten(0.47, PRIMARY_COLOR) }}>
                <Flex align="center" justify="center" gap="5px">
                  <Text fontSize="lg">
                    <FaComments color={PRIMARY_COLOR} />
                  </Text>
                  <Text>Communications ({ticketDetails.communications.filter(c => !c.is_internal).length})</Text>
                </Flex>
              </Tabs.Trigger>
            </Tabs.List>

            {/* Tab content */}
            <Tabs.ContentGroup px={6} borderTopWidth={0}>

              {/* Overview Tab */}
              <Tabs.Content value="overview" borderTopWidth={0}>
                <VStack align="start" gap={6} w="full">

                  {/* Ticket Information Section */}
                  <Box w="full">
                    <Heading size="sm" color="gray.700" mb={4}>Ticket Information</Heading>
                    <SimpleGrid columns={4} gap={6}>

                      <VStack align={'start'} gap={1}>
                        <HStack color="gray.600">
                          <Icon as={MdOutlineConfirmationNumber} boxSize={3} />
                          <Text fontSize="xs" fontWeight="600">Ticket ID</Text>
                        </HStack>
                        <Text fontSize="md" fontWeight="600" color="gray.900">
                          {ticketDetails.ticket_id}
                        </Text>
                      </VStack>

                      <VStack align={'start'} gap={1}>
                        <HStack color="gray.600">
                          <Icon as={statusConfig.icon} boxSize={3} />
                          <Text fontSize="xs" fontWeight="600">Status</Text>
                        </HStack>
                        <Badge
                          colorScheme={statusConfig.colorScheme}
                          size="sm"
                          px={2}
                          py={1}
                          borderRadius="full"
                          fontSize="xs"
                          fontWeight="700"
                          textTransform="capitalize"
                        >
                          {ticketDetails.status.replace('_', ' ')}
                        </Badge>
                      </VStack>

                      <VStack align={'start'} gap={1}>
                        <HStack color="gray.600">
                          <Icon as={FaListAlt} boxSize={3} />
                          <Text fontSize="xs" fontWeight="600">Category</Text>
                        </HStack>
                        <Text fontSize="md" fontWeight="600" color="gray.900">
                          {ticketDetails.category_details?.name || 'N/A'}
                        </Text>
                      </VStack>

                      <VStack align={'start'} gap={1}>
                        <HStack color="gray.600">
                          <Icon as={ticketDetails.is_overdue ? FaExclamationCircle : FaClock} boxSize={3} />
                          <Text fontSize="xs" fontWeight="600">Overdue Status</Text>
                        </HStack>
                        <Badge
                          colorScheme={ticketDetails.is_overdue ? "red" : "green"}
                          size="sm"
                          px={2}
                          py={1}
                          borderRadius="full"
                          fontSize="xs"
                          fontWeight="700"
                        >
                          {ticketDetails.is_overdue ? 'Overdue' : 'On Track'}
                        </Badge>
                      </VStack>

                      <VStack align={'start'} gap={1}>
                        <HStack color="gray.600">
                          <Icon as={FaCalendarAlt} boxSize={3} />
                          <Text fontSize="xs" fontWeight="600">Created At</Text>
                        </HStack>
                        <Text fontSize="md" fontWeight="600" color="gray.900">
                          {formatDate(ticketDetails.created_at) || 'N/A'}
                        </Text>
                      </VStack>

                      <VStack align={'start'} gap={1}>
                        <HStack color="gray.600">
                          <Icon as={FaClock} boxSize={3} />
                          <Text fontSize="xs" fontWeight="600">Resolution Due</Text>
                        </HStack>
                        <Text fontSize="md" fontWeight="600" color="gray.900">
                          {ticketDetails.resolution_due ? formatDate(ticketDetails.resolution_due) : 'N/A'}
                        </Text>
                      </VStack>

                      <VStack align={'start'} gap={1}>
                        <HStack color="gray.600">
                          <Icon as={FaCheckCircle} boxSize={3} />
                          <Text fontSize="xs" fontWeight="600">First Response</Text>
                        </HStack>
                        <Text fontSize="md" fontWeight="600" color="gray.900">
                          {ticketDetails.first_response_at ? formatDate(ticketDetails.first_response_at) : 'N/A'}
                        </Text>
                      </VStack>

                      <VStack align={'start'} gap={1}>
                        <HStack color="gray.600">
                          <Icon as={FaCalendarAlt} boxSize={3} />
                          <Text fontSize="xs" fontWeight="600">Last Updated</Text>
                        </HStack>
                        <Text fontSize="md" fontWeight="600" color="gray.900">
                          {ticketDetails.updated_at ? formatDate(ticketDetails.updated_at) : 'N/A'}
                        </Text>
                      </VStack>

                    </SimpleGrid>
                  </Box>

                  <Separator />

                  {/* Requester Information Section */}
                  <Box w="full">
                    <Heading size="sm" color="gray.700" mb={4}>Requester Information</Heading>
                    <SimpleGrid columns={4} gap={6}>

                      <VStack align={'start'} gap={1}>
                        <HStack color="gray.600">
                          <Icon as={FaUser} boxSize={3} />
                          <Text fontSize="xs" fontWeight="600">Name</Text>
                        </HStack>
                        <Text fontSize="md" fontWeight="600" color="gray.900">
                          {ticketDetails.requester_name}
                        </Text>
                      </VStack>

                      <VStack align={'start'} gap={1}>
                        <HStack color="gray.600">
                          <Icon as={FaEnvelope} boxSize={3} />
                          <Text fontSize="xs" fontWeight="600">Email</Text>
                        </HStack>
                        <Text fontSize="md" fontWeight="600" color="gray.900">
                          {ticketDetails.requester_email}
                        </Text>
                      </VStack>

                      <VStack align={'start'} gap={1}>
                        <HStack color="gray.600">
                          <Icon as={FaPhone} boxSize={3} />
                          <Text fontSize="xs" fontWeight="600">Phone</Text>
                        </HStack>
                        <Text fontSize="md" fontWeight="600" color="gray.900">
                          {ticketDetails.requester_phone || 'N/A'}
                        </Text>
                      </VStack>

                      <VStack align={'start'} gap={1}>
                        <HStack color="gray.600">
                          <Icon as={FaTicketAlt} boxSize={3} />
                          <Text fontSize="xs" fontWeight="600">Tenant ID</Text>
                        </HStack>
                        <Text fontSize="md" fontWeight="600" color="gray.900">
                          {ticketDetails.tenant_id || 'N/A'}
                        </Text>
                      </VStack>

                    </SimpleGrid>
                  </Box>

                  <Separator />

                  {/* Assignment Information Section */}
                  <Box w="full">
                    <Heading size="sm" color="gray.700" mb={4}>Assignment Information</Heading>
                    {ticketDetails.assignment_details ? (
                      <SimpleGrid columns={4} gap={6}>

                        <VStack align={'start'} gap={1}>
                          <HStack color="gray.600">
                            <Icon as={FaUserTie} boxSize={3} />
                            <Text fontSize="xs" fontWeight="600">Assigned To</Text>
                          </HStack>
                          <Text fontSize="md" fontWeight="600" color="gray.900">
                            {ticketDetails.assignment_details.assigned_to_user_name || 'N/A'}
                          </Text>
                        </VStack>

                        <VStack align={'start'} gap={1}>
                          <HStack color="gray.600">
                            <Icon as={FaUserTie} boxSize={3} />
                            <Text fontSize="xs" fontWeight="600">Role</Text>
                          </HStack>
                          <Text fontSize="md" fontWeight="600" color="gray.900">
                            {ticketDetails.assignment_details.assigned_to_role_name || 'N/A'}
                          </Text>
                        </VStack>

                        <VStack align={'start'} gap={1}>
                          <HStack color="gray.600">
                            <Icon as={FaCalendarAlt} boxSize={3} />
                            <Text fontSize="xs" fontWeight="600">Assigned At</Text>
                          </HStack>
                          <Text fontSize="md" fontWeight="600" color="gray.900">
                            {ticketDetails.assignment_details.assigned_at ? formatDate(ticketDetails.assignment_details.assigned_at) : 'N/A'}
                          </Text>
                        </VStack>

                      </SimpleGrid>
                    ) : (
                      <Box p={6} bg="gray.50" borderRadius="8px" textAlign="center">
                        <Text color="gray.500">Not yet assigned</Text>
                      </Box>
                    )}
                  </Box>

                  {/* Internal Notes Section */}
                  {ticketDetails.internal_notes && (
                    <>
                      <Separator />
                      <Box w="full">
                        <Heading size="sm" color="gray.700" mb={4}>Internal Notes</Heading>
                        <Box p={4} bg="yellow.50" borderRadius="8px" borderWidth={1} borderColor="yellow.200">
                          <Text fontSize="sm" color="gray.700">
                            {ticketDetails.internal_notes}
                          </Text>
                        </Box>
                      </Box>
                    </>
                  )}

                  {/* Satisfaction Rating Section */}
                  {ticketDetails.satisfaction_rating && (
                    <>
                      <Separator />
                      <Box w="full">
                        <Heading size="sm" color="gray.700" mb={4}>Customer Satisfaction</Heading>
                        <SimpleGrid columns={3} gap={6}>

                          <VStack align={'start'} gap={1}>
                            <HStack color="gray.600">
                              <Icon as={FaStar} boxSize={3} />
                              <Text fontSize="xs" fontWeight="600">Rating</Text>
                            </HStack>
                            <HStack>
                              {[...Array(5)].map((_, i) => (
                                <Icon
                                  key={i}
                                  as={FaStar}
                                  color={i < ticketDetails.satisfaction_rating! ? 'yellow.400' : 'gray.300'}
                                  boxSize={4}
                                />
                              ))}
                            </HStack>
                          </VStack>

                          <VStack align={'start'} gap={1}>
                            <HStack color="gray.600">
                              <Icon as={FaCalendarAlt} boxSize={3} />
                              <Text fontSize="xs" fontWeight="600">Submitted At</Text>
                            </HStack>
                            <Text fontSize="md" fontWeight="600" color="gray.900">
                              {ticketDetails.satisfaction_submitted_at ? formatDate(ticketDetails.satisfaction_submitted_at) : 'N/A'}
                            </Text>
                          </VStack>

                        </SimpleGrid>
                        {ticketDetails.satisfaction_feedback && (
                          <Box mt={4} p={4} bg="blue.50" borderRadius="8px">
                            <Text fontSize="xs" fontWeight="600" color="gray.600" mb={2}>Feedback</Text>
                            <Text fontSize="sm" color="gray.700">
                              {ticketDetails.satisfaction_feedback}
                            </Text>
                          </Box>
                        )}
                      </Box>
                    </>
                  )}

                </VStack>
              </Tabs.Content>

              {/* Communications Tab */}
              <Tabs.Content value="communications" borderTopWidth={0}>
                <VStack align="start" gap={4} w="full">
                  <Heading size="sm" color="gray.700">Communication History</Heading>

                  {ticketDetails.communications.filter(c => !c.is_internal).length === 0 ? (
                    <Box p={8} bg="gray.50" borderRadius="8px" w="full" textAlign="center">
                      <Text color="gray.500">No communications yet</Text>
                    </Box>
                  ) : (
                    <VStack w="full" gap={3} align="stretch">
                      {ticketDetails.communications
                        .filter(comm => !comm.is_internal)
                        .map((comm) => {
                          const isCustomer = comm.sender_type === 'customer'
                          const hasAttachments = comm.attachments && comm.attachments.length > 0
                          return (
                            <Box
                              key={comm.id}
                              p={4}
                              bg={isCustomer ? 'blue.50' : 'green.50'}
                              borderRadius="8px"
                              borderWidth={1}
                              borderColor={isCustomer ? 'blue.200' : 'green.200'}
                            >
                              <HStack justify="space-between" mb={2}>
                                <HStack>
                                  <Icon as={isCustomer ? FaUser : FaUserTie} color={isCustomer ? 'blue.600' : 'green.600'} />
                                  <Text fontSize="sm" fontWeight="700" color="gray.800">
                                    {comm.sender_name}
                                  </Text>
                                  <Badge
                                    colorScheme={isCustomer ? 'blue' : 'green'}
                                    size="sm"
                                    fontSize="9px"
                                  >
                                    {comm.sender_type}
                                  </Badge>
                                  {hasAttachments && (
                                    <Badge
                                      colorScheme="purple"
                                      size="sm"
                                      fontSize="9px"
                                    >
                                      <HStack gap={1}>
                                        <Icon as={FaPaperclip} boxSize={2} />
                                        <Text>{comm.attachments!.length}</Text>
                                      </HStack>
                                    </Badge>
                                  )}
                                </HStack>
                                <Text fontSize="xs" color="gray.500">
                                  {formatDate(comm.created_at)}
                                </Text>
                              </HStack>
                              <Text fontSize="sm" color="gray.700" whiteSpace="pre-wrap">
                                {comm.message_content}
                              </Text>
                              {hasAttachments && (
                                <Box mt={3} pt={3} borderTopWidth={1} borderColor={isCustomer ? 'blue.200' : 'green.200'}>
                                  <Text fontSize="xs" fontWeight="600" color="gray.600" mb={2}>Attachments:</Text>
                                  <SimpleGrid columns={2} gap={3} w="full">
                                    {comm.attachments!.map((attachment) => {
                                      const FileIcon = getFileTypeIcon(attachment.mime_type)
                                      return (
                                        <Box
                                          key={attachment.id}
                                          p={3}
                                          bg="white"
                                          borderRadius="6px"
                                          borderWidth={1}
                                          borderColor="gray.200"
                                          _hover={{ bg: 'gray.50', borderColor: PRIMARY_COLOR }}
                                          cursor="pointer"
                                        >
                                          <HStack gap={2} w="full" justify="space-between">
                                            <HStack gap={2} flex={1} minW={0}>
                                              <Icon as={FileIcon} color={PRIMARY_COLOR} boxSize={4} flexShrink={0} />
                                              <VStack align="start" gap={0.5} flex={1} minW={0}>
                                                <Text fontSize="xs" fontWeight="700" color="gray.800" noOfLines={1}>
                                                  {attachment.filename}
                                                </Text>
                                                <Text fontSize="10px" color="gray.600">
                                                  {formatFileSize(attachment.file_size)} • {formatDate(attachment.uploaded_at)}
                                                </Text>
                                              </VStack>
                                            </HStack>
                                            <IconButton
                                              aria-label="Download file"
                                              size="sm"
                                              variant="ghost"
                                              colorScheme="blue"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                /* TODO: Implement download functionality */
                                                console.log('Download:', attachment.filename)
                                              }}
                                            >
                                              <FaDownload size={14} />
                                            </IconButton>
                                          </HStack>
                                        </Box>
                                      )
                                    })}
                                  </SimpleGrid>
                                </Box>
                              )}
                            </Box>
                          )
                        })}
                    </VStack>
                  )}
                </VStack>
              </Tabs.Content>

            </Tabs.ContentGroup>
          </Tabs.Root>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default React.memo(TicketDetailsPage)
