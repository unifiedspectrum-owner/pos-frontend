/* React and utility imports */
import { useState, useCallback } from 'react'

/* Shared module imports */
import { PaginationInfo } from '@shared/types'

/* Pagination hook configuration interface */
export interface UsePaginationConfig {
  initialPage?: number
  initialLimit?: number
  onPageChange?: (page: number, limit: number) => void
  loading?: boolean
}

/* Pagination hook return interface */
export interface UsePaginationReturn {
  currentPage: number
  pageLimit: number
  setCurrentPage: (page: number) => void
  setPageLimit: (limit: number) => void
  handleLimitChange: (newLimit: string) => void
  handlePreviousPage: (pagination?: PaginationInfo) => void
  handleNextPage: (pagination?: PaginationInfo) => void
  resetToFirstPage: () => void
}

/* Reusable pagination hook for consistent pagination behavior across components */
export const usePagination = ({
  initialPage = 1,
  initialLimit = 10,
  onPageChange,
  loading = false
}: UsePaginationConfig): UsePaginationReturn => {
  
  /* Pagination state */
  const [currentPage, setCurrentPage] = useState<number>(initialPage)
  const [pageLimit, setPageLimit] = useState<number>(initialLimit)

  /* Handle limit change and reset to first page */
  const handleLimitChange = useCallback((newLimit: string) => {
    if (loading) return
    const limit = parseInt(newLimit)
    setPageLimit(limit)
    setCurrentPage(1)
    onPageChange?.(1, limit)
  }, [onPageChange, loading])

  /* Handle previous page navigation */
  const handlePreviousPage = useCallback((pagination?: PaginationInfo) => {
    if (loading || !pagination?.has_prev_page) return
    const newPage = pagination.current_page - 1
    setCurrentPage(newPage)
    onPageChange?.(newPage, pageLimit)
  }, [pageLimit, onPageChange, loading])

  /* Handle next page navigation */
  const handleNextPage = useCallback((pagination?: PaginationInfo) => {
    if (loading || !pagination?.has_next_page) return
    const newPage = pagination.current_page + 1
    setCurrentPage(newPage)
    onPageChange?.(newPage, pageLimit)
  }, [pageLimit, onPageChange, loading])

  /* Reset to first page */
  const resetToFirstPage = useCallback(() => {
    if (loading) return
    setCurrentPage(1)
    onPageChange?.(1, pageLimit)
  }, [pageLimit, onPageChange, loading])

  return {
    currentPage,
    pageLimit,
    setCurrentPage,
    setPageLimit,
    handleLimitChange,
    handlePreviousPage,
    handleNextPage,
    resetToFirstPage
  }
}