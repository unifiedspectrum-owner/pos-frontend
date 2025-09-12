"use client"

/* React imports */
import React from 'react'
import { Flex, HStack, Text } from '@chakra-ui/react'
import { lighten } from 'polished'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'

/* Shared module imports */
import { SelectField, SecondaryButton } from '@shared/components'
import { PaginationInfo } from '@shared/types'
import { usePagination } from '@shared/hooks'
import { GRAY_COLOR } from '@shared/config'

/* Pagination component props interface */
export interface PaginationProps {
  pagination: PaginationInfo
  loading?: boolean
  onPageChange?: (page: number, limit: number) => void
  limitOptions?: { label: string; value: string }[]
  showLimitSelector?: boolean
  showPageInfo?: boolean
}

/* Default limit options */
const defaultLimitOptions = [
  { label: '5', value: '5' },
  { label: '10', value: '10' },
  { label: '25', value: '25' },
  { label: '50', value: '50' },
]

/* Reusable pagination component */
const Pagination: React.FC<PaginationProps> = ({
  pagination,
  loading = false,
  onPageChange,
  limitOptions = defaultLimitOptions,
  showLimitSelector = true,
  showPageInfo = true
}) => {
  /* Pagination hook */
  const {
    pageLimit,
    handleLimitChange,
    handlePreviousPage,
    handleNextPage
  } = usePagination({
    initialPage: pagination.current_page,
    initialLimit: pagination.limit,
    onPageChange,
    loading
  })

  return (
    <Flex 
      justify="space-between" 
      align="center" 
      pt={4} 
      borderTopWidth={1} 
      borderColor={lighten(0.3, GRAY_COLOR)}
    >
      <HStack gap={3}>
        {showLimitSelector && (
          <HStack gap={1} align="center">
            <Text fontSize="sm" color={lighten(0.2, GRAY_COLOR)}>Show</Text>
            
            {/* Items per page selector */}
            <SelectField
              label=""
              value={pageLimit.toString()}
              options={limitOptions}
              onChange={handleLimitChange}
              isInValid={false}
              required={false}
              size="sm"
              height="32px"
              width="70px"
              padding="8px"
              borderRadius="md"
              disabled={loading}
            />
            
            <Text fontSize="sm" color={lighten(0.2, GRAY_COLOR)}>entries</Text>
          </HStack>
        )}
        
        {showPageInfo && (
          <Text fontSize="sm" color={lighten(0.2, GRAY_COLOR)}>
            Showing {((pagination.current_page - 1) * pagination.limit) + 1}-
            {Math.min(pagination.current_page * pagination.limit, pagination.total_count)} of {pagination.total_count}
          </Text>
        )}
      </HStack>
      
      <HStack gap={2}>
        <SecondaryButton
          size="sm"
          onClick={() => handlePreviousPage(pagination)}
          disabled={loading || !pagination.has_prev_page}
          leftIcon={MdChevronLeft}
          buttonProps={{
            borderRadius:"md"
          }}
        >
          Previous
        </SecondaryButton>
        
        <Text fontSize="sm" px={4}>
          Page {pagination.current_page} of {pagination.total_pages}
        </Text>
        
        <SecondaryButton
          size="sm"
          onClick={() => handleNextPage(pagination)}
          disabled={loading || !pagination.has_next_page}
          rightIcon={MdChevronRight}
          buttonProps={{
            borderRadius:"md"
          }}
        >
          Next
        </SecondaryButton>
      </HStack>
    </Flex>
  )
}

export default Pagination