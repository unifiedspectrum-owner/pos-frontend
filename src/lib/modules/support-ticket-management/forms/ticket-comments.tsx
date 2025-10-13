"use client"

/* Libraries imports */
import React, { useState } from 'react'
import { Flex, Heading, VStack, HStack, Box, Text, Badge, Icon, SimpleGrid, FormatByte, Button } from '@chakra-ui/react'
import { FaUser, FaUserTie, FaCommentDots, FaEyeSlash, FaCommentSlash, FaEye } from 'react-icons/fa'
import parse from 'html-react-parser';

/* Shared module imports */
import { PRIMARY_COLOR } from '@shared/config'
import { formatDateTime } from '@shared/utils'
import { getFileTypeIcon } from '@shared/constants'
import { Tooltip } from '@/components/ui/tooltip'
import { EmptyStateContainer } from '@shared/components'

/* Support ticket module imports */
import { TicketCommunicationWithAttachments } from '@support-ticket-management/types'
import { SENDER_TYPES } from '@support-ticket-management/constants'
import { useCommentOperations } from '@support-ticket-management/hooks'
import AddCommentForm from './add-comment-form'
import { LuDownload } from 'react-icons/lu'

/* Component props interface */
interface TicketCommentsProps {
  comments: TicketCommunicationWithAttachments[]
  ticketId?: string
  onRefresh?: () => void
}

/* Ticket comments display component */
const TicketComments: React.FC<TicketCommentsProps> = ({ comments, ticketId, onRefresh }) => {
  /* State for toggling internal notes visibility */
  const [showInternal, setShowInternal] = useState(true)

  /* Use comment operations hook for download functionality */
  const { downloadTicketCommentAttachment, isDownloadingAttachment } = useCommentOperations()

  /* Filter comments based on internal visibility toggle */
  const filteredComments = showInternal ? comments : comments.filter(comment => !Boolean(comment.is_internal))

  /* Count internal notes */
  const internalNotesCount = comments.filter(comment => Boolean(comment.is_internal)).length

  return (
    <Flex flexDir="column" gap={4} w="full">
      {/* Section header */}
      <Flex align="center" justify="space-between" w="full">
        <Flex align="center" gap={2}>
          <Icon as={FaCommentDots} color={PRIMARY_COLOR} boxSize={5} />
          <Heading as="h3" size="md" fontWeight="600">
            Communications ({filteredComments.length})
          </Heading>
        </Flex>
        {internalNotesCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            colorScheme={showInternal ? 'orange' : 'gray'}
            onClick={() => setShowInternal(!showInternal)}
          >
            <Icon as={showInternal ? FaEyeSlash : FaEye} mr={2} />
            {showInternal ? 'Hide' : 'Show'} Internal Notes ({internalNotesCount})
          </Button>
        )}
      </Flex>

      {/* Comments list */}
      {filteredComments.length === 0 ? (
        <EmptyStateContainer
          icon={<FaCommentSlash />}
          title="No Communications"
          description={showInternal ? "No communications have been added to this ticket yet" : "No public communications yet. Toggle internal notes to view all communications."}
        />
      ) : (
        <VStack w="full" gap={4} align="stretch">
          {filteredComments.map((comment) => {
            const isCustomer = comment.sender_type === SENDER_TYPES.CUSTOMER
            const hasAttachments = comment.attachments && comment.attachments.length > 0
            const isInternal = Boolean(comment.is_internal)

            return (
              <Flex key={comment.id}  w="full"justify={isCustomer ? 'flex-start' : 'flex-end'}>
                <Tooltip
                  content={isInternal ? "This is an internal note - not visible to customers" : ""}
                  disabled={!isInternal}
                  positioning={{ placement: 'top' }}
                  showArrow
                >
                  <Box
                    w="800px"
                    maxW="75%"
                    p={4}
                    bg={isInternal ? 'orange.50' : isCustomer ? 'blue.50' : 'green.50'}
                    borderRadius="12px"
                    borderWidth={1}
                    borderColor={isInternal ? 'orange.200' : isCustomer ? 'blue.200' : 'green.200'}
                    position="relative"
                  >
                  {/* Comment header */}
                  <HStack justify="space-between" mb={2} gap={3}>
                    <HStack>
                      <Icon
                        as={isCustomer ? FaUser : FaUserTie}
                        color={isInternal ? 'orange.600' : isCustomer ? 'blue.600' : 'green.600'}
                        boxSize={3}
                      />
                      <Text fontSize="xs" fontWeight="700" color="gray.800">
                        {comment.sender_name}
                      </Text>
                      <Badge
                        colorScheme={isInternal ? 'orange' : isCustomer ? 'blue' : 'green'}
                        size="sm"
                        fontSize="9px"
                      >
                        {comment.sender_type}
                      </Badge>
                      {isInternal ? (
                        <Badge
                          colorScheme="orange"
                          size="sm"
                          fontSize="9px"
                          variant="solid"
                        >
                          <HStack gap={1}>
                            <Icon as={FaEyeSlash} boxSize={2} />
                            <Text>Internal</Text>
                          </HStack>
                        </Badge>
                      ) : <></>}
                    </HStack>
                    <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
                      {formatDateTime(comment.created_at)}
                    </Text>
                  </HStack>

                  {/* Comment content */}
                  <Text fontSize="sm" color="gray.700" whiteSpace="pre-wrap">
                    {parse(comment.message_content)}
                  </Text>

                  {/* Attachments */}
                  {hasAttachments && (
                  <Box mt={3} pt={3} borderTopWidth={1} borderColor={isInternal ? 'orange.200' : isCustomer ? 'blue.200' : 'green.200'}>
                    <Text fontSize="xs" fontWeight="600" color="gray.600" mb={2}>
                      Attachments:
                    </Text>
                    <SimpleGrid columns={3} gap={3} w="full">
                      {comment.attachments?.map((attachment) => {
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
                            <HStack gap={2} w="full" justify="space-between" align="start">
                              <HStack gap={2} flex={1} minW={0} overflow="hidden">
                                <Icon as={FileIcon} color={PRIMARY_COLOR}size={'lg'} flexShrink={0} />
                                <VStack align="start" gap={0.5} flex={1} minW={0} overflow="hidden">
                                  <Tooltip content={attachment.filename} positioning={{ placement: 'top' }}>
                                    <Text fontSize="xs" fontWeight="700" color="gray.800" w="full" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                                      {attachment.filename}
                                    </Text>
                                  </Tooltip>
                                  <Text fontSize="10px" color="gray.600" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" w="full">
                                    <FormatByte value={attachment.file_size} /> • {formatDateTime(attachment.uploaded_at)}
                                    {/* {formatFileSize(attachment.file_size)} • {formatDate(attachment.uploaded_at)} */}
                                  </Text>
                                </VStack>
                              </HStack>
                              <Button
                                variant="ghost"
                                onClick={() => downloadTicketCommentAttachment(attachment.id, attachment.filename)}
                                disabled={isDownloadingAttachment}
                              >
                                <LuDownload />
                              </Button>
                            </HStack>
                          </Box>
                        )
                      })}
                    </SimpleGrid>
                  </Box>
                )}
                  </Box>
                </Tooltip>
              </Flex>
            )
          })}
        </VStack>
      )}

      {/* Add comment form */}
      <AddCommentForm ticketId={ticketId} onRefresh={onRefresh} />
    </Flex>
  )
}

export default TicketComments
