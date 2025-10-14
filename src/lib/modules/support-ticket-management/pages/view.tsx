"use client"

/* Libraries imports */
import React, { useEffect, useState, useMemo } from 'react'
import { Flex, Box, VStack, HStack, Heading, Text, Badge, SimpleGrid, Icon, Tabs, Separator } from '@chakra-ui/react'
import { lighten } from 'polished'
import { FaExclamationCircle, FaStar } from 'react-icons/fa'

/* Shared module imports */
import { PRIMARY_COLOR, GRAY_COLOR } from '@shared/config'
import { ErrorMessageContainer, Breadcrumbs, LoaderWrapper } from '@shared/components/common'
import { formatDate } from '@shared/utils'
import { STATUS_BADGE_CONFIG } from '@shared/constants'

/* Support ticket module imports */
import { useTicketOperations, useCommentOperations } from '@support-ticket-management/hooks'
import TicketComments from '@support-ticket-management/forms/ticket-comments'
import { TICKET_DETAILS_SECTIONS, TICKET_DETAILS_TABS, TICKET_DETAILS_TAB, TICKET_VIEW_FIELD_TYPES, TicketDetailsTabType } from '@support-ticket-management/constants'
import { SupportTicketDetails, TicketStatus } from '@support-ticket-management/types'

/* Component props interface */
interface TicketDetailsPageProps {
  ticketId: string
}

/* Helper function to get nested value from object using dot notation */
const getNestedValue = (obj: SupportTicketDetails, path: string): string | TicketStatus | number | boolean | null | undefined => {
  return path.split('.').reduce((current: unknown, key: string) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key]
    }
    return undefined
  }, obj as unknown) as string | number | boolean | null | undefined | TicketStatus
}

/* Ticket details page component with tabbed interface */
const TicketDetailsPage: React.FC<TicketDetailsPageProps> = ({ ticketId }) => {
  /* Ticket operations hook for data fetching */
  const { fetchTicketDetails, ticketDetails, isFetching, fetchError } = useTicketOperations()

  /* Fetch ticket comments */
  const { fetchTicketComments, refetchTicketComments, ticketComments, isFetchingComments, fetchCommentsError } = useCommentOperations()

  /* Active tab state management */
  const [activeTab, setActiveTab] = useState<TicketDetailsTabType>(TICKET_DETAILS_TAB.OVERVIEW)

  /* Track if comments have been fetched */
  const [commentsLoaded, setCommentsLoaded] = useState<boolean>(false)

  /* Memoized processed sections with filtered and sorted fields */
  const processedSections = useMemo(() =>
    TICKET_DETAILS_SECTIONS.map(section => ({
      ...section,
      processedFields: section.section_values
        .filter(field => field.is_active)
        .sort((a, b) => a.display_order - b.display_order)
    })), []
  )

  /* Fetch ticket data on component mount */
  useEffect(() => {
    if (ticketId) {
      fetchTicketDetails(ticketId)
    }
  }, [ticketId, fetchTicketDetails])

  /* Fetch comments when switching to communications tab */
  useEffect(() => {
    if (activeTab === TICKET_DETAILS_TAB.COMMUNICATIONS && ticketId && !commentsLoaded) {
      fetchTicketComments(ticketId)
      setCommentsLoaded(true)
    }
  }, [activeTab, ticketId, commentsLoaded, fetchTicketComments])

  /* Tab change handler */
  const handleTabChange = (e: { value: string }) => {
    setActiveTab(e.value as TicketDetailsTabType)
  }

  return (
    <Flex w={'100%'} flexDir={'column'}>
      {/* Main container with responsive layout */}
      <Flex flexDir="column" p={6} maxW="1400px" mx="auto" w="full" gap={4}>
        {/* Page header with title and breadcrumbs */}
        <Flex flexDir="column" gap={1}>
          <Heading as="h1" fontWeight="700" mb={0}>
            {ticketDetails ? `${ticketDetails.ticket_id} - ${ticketDetails.subject}` : 'Ticket Details'}
          </Heading>
          <Breadcrumbs />
        </Flex>

        {/* Main content container with tabs */}
        <Flex py={5} borderWidth={1} borderRadius={10} borderColor={lighten(0.3, GRAY_COLOR)}>
          <LoaderWrapper
            isLoading={isFetching}
            loadingText="Loading ticket details..."
            minHeight="500px"
          >
            {fetchError ? (
              <ErrorMessageContainer error={fetchError} />
            ) : !ticketDetails ? (
              <ErrorMessageContainer error="Ticket details not found" />
            ) : (
              <Tabs.Root w="100%" value={activeTab} variant="outline" size="md" onValueChange={handleTabChange}>

                {/* Tab navigation headers */}
                <Tabs.List w={'full'} px={5} borderBottomWidth={1} gap={1} borderColor={lighten(0.3, GRAY_COLOR)} flex={1} mb={4}>
                  {TICKET_DETAILS_TABS.map((tab) => {
                    const TabIcon = tab.icon
                    const isSelected = tab.id === activeTab

                    return (
                      <Tabs.Trigger
                        key={tab.id}
                        alignItems="center"
                        justifyContent="space-between"
                        h="60px"
                        borderWidth={1}
                        borderBottomWidth={isSelected ? 0 : 1}
                        borderColor={lighten(0.3, GRAY_COLOR)}
                        borderTopRadius={10}
                        w="25%"
                        p={5}
                        value={tab.id}
                        cursor={'pointer'}
                        _hover={{ bg: lighten(0.47, PRIMARY_COLOR) }}>
                        <Flex align="center" justify="center" gap="5px">
                          <Text fontSize="lg">
                            <TabIcon color={PRIMARY_COLOR} />
                          </Text>
                          <Text>{tab.label}</Text>
                        </Flex>
                      </Tabs.Trigger>
                    )
                  })}
                </Tabs.List>

                {/* Tab content */}
                <Tabs.ContentGroup px={6} borderTopWidth={0}>

                  {/* Overview Tab */}
                  <Tabs.Content value={TICKET_DETAILS_TAB.OVERVIEW} borderTopWidth={0}>
                    <VStack align="start" gap={6} w="full">

                      {processedSections.map((section, index) => {
                        /* Check show condition */
                        if (section.show_condition) {
                          const conditionValue = getNestedValue(ticketDetails, section.show_condition)
                          console.log("conditionValue", conditionValue)
                          if (!conditionValue) {
                            return null
                          }
                        }

                        /* Skip sections without fields (handled separately below) */
                        if (section.processedFields.length === 0) {
                          return null
                        }

                        return (
                          <React.Fragment key={section.id}>
                            {index > 0 && <Separator />}
                            <Box w="full">
                              <Heading size="sm" color="gray.700" mb={4}>{section.section_heading}</Heading>
                              {section.show_condition && !getNestedValue(ticketDetails, section.show_condition) ? (
                                <Box p={6} bg="gray.50" borderRadius="8px" textAlign="center">
                                  <Text color="gray.500">{section.empty_state_message}</Text>
                                </Box>
                              ) : (
                                <SimpleGrid columns={section.columns || 4} gap={6}>
                                  {section.processedFields.map((field) => {
                                    const value = getNestedValue(ticketDetails, field.data_key)

                                    /* Text field rendering */
                                    if (field.type === TICKET_VIEW_FIELD_TYPES.TEXT) {
                                      return (
                                        <VStack key={field.id} align={'start'} gap={1}>
                                          <HStack color="gray.600">
                                            <Icon as={field.icon_name} boxSize={3} />
                                            <Text fontSize="xs" fontWeight="600">{field.label}</Text>
                                          </HStack>
                                          <Text fontSize="md" fontWeight="600" color="gray.900">
                                            {value || 'N/A'}
                                          </Text>
                                        </VStack>
                                      )
                                    }

                                    /* Date field rendering */
                                    if (field.type === TICKET_VIEW_FIELD_TYPES.DATE) {
                                      const displayValue = typeof value === 'string' ? formatDate(value) ?? 'N/A' : 'N/A'
                                      return (
                                        <VStack key={field.id} align={'start'} gap={1}>
                                          <HStack color="gray.600">
                                            <Icon as={field.icon_name} boxSize={3} />
                                            <Text fontSize="xs" fontWeight="600">{field.label}</Text>
                                          </HStack>
                                          <Text fontSize="md" fontWeight="600" color="gray.900">
                                            {displayValue}
                                          </Text>
                                        </VStack>
                                      )
                                    }

                                    /* Status badge rendering */
                                    if (field.type === TICKET_VIEW_FIELD_TYPES.STATUS_BADGE) {
                                      const statusConfig = STATUS_BADGE_CONFIG[value as TicketStatus] || STATUS_BADGE_CONFIG.default
                                      return (
                                        <VStack key={field.id} align="start" gap={1}>
                                          <HStack color="gray.600">
                                            <Icon as={statusConfig.icon} boxSize={3} />
                                            <Text fontSize="xs" fontWeight="600">{field.label}</Text>
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
                                            {String(value)?.replace('_', ' ') || 'N/A'}
                                          </Badge>
                                        </VStack>
                                      )
                                    }

                                    /* Overdue badge rendering */
                                    if (field.type === TICKET_VIEW_FIELD_TYPES.OVERDUE_BADGE) {
                                      return (
                                        <VStack key={field.id} align="start" gap={1}>
                                          <HStack color="gray.600">
                                            <Icon as={value ? FaExclamationCircle : field.icon_name} boxSize={3} />
                                            <Text fontSize="xs" fontWeight="600">{field.label}</Text>
                                          </HStack>
                                          <Badge
                                            colorScheme={value ? "red" : "green"}
                                            size="sm"
                                            px={2}
                                            py={1}
                                            borderRadius="full"
                                            fontSize="xs"
                                            fontWeight="700"
                                          >
                                            {value ? 'Overdue' : 'On Track'}
                                          </Badge>
                                        </VStack>
                                      )
                                    }

                                    /* Star rating rendering */
                                    if (field.type === TICKET_VIEW_FIELD_TYPES.STAR_RATING) {
                                      return (
                                        <VStack key={field.id} align={'start'} gap={1}>
                                          <HStack color="gray.600">
                                            <Icon as={FaStar} boxSize={3} />
                                            <Text fontSize="xs" fontWeight="600">{field.label}</Text>
                                          </HStack>
                                          <HStack>
                                            {[...Array(5)].map((_, i) => (
                                              <Icon
                                                key={i}
                                                as={FaStar}
                                                color={i < (Number(value) || 0) ? 'yellow.400' : 'gray.300'}
                                                boxSize={4}
                                              />
                                            ))}
                                          </HStack>
                                        </VStack>
                                      )
                                    }

                                    return null
                                  })}
                                </SimpleGrid>
                              )}
                            </Box>
                          </React.Fragment>
                        )
                      })}

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

                      {/* Satisfaction Feedback */}
                      {ticketDetails.satisfaction_feedback && (
                        <Box w="full">
                          <Box mt={4} p={4} bg="blue.50" borderRadius="8px">
                            <Text fontSize="xs" fontWeight="600" color="gray.600" mb={2}>Feedback</Text>
                            <Text fontSize="sm" color="gray.700">
                              {ticketDetails.satisfaction_feedback}
                            </Text>
                          </Box>
                        </Box>
                      )}

                    </VStack>
                  </Tabs.Content>

                  {/* Communications Tab */}
                  <Tabs.Content value={TICKET_DETAILS_TAB.COMMUNICATIONS} borderTopWidth={0}>
                    <LoaderWrapper
                      isLoading={isFetchingComments}
                      loadingText="Loading communications..."
                      minHeight="400px"
                    >
                      {fetchCommentsError ? (
                        <ErrorMessageContainer error={fetchCommentsError} />
                      ) : (
                        <TicketComments
                          comments={ticketComments}
                          ticketId={ticketId}
                          onRefresh={refetchTicketComments}
                          showAddCommentForm={false}
                        />
                      )}
                    </LoaderWrapper>
                  </Tabs.Content>

                </Tabs.ContentGroup>
              </Tabs.Root>
            )}
          </LoaderWrapper>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default React.memo(TicketDetailsPage)
