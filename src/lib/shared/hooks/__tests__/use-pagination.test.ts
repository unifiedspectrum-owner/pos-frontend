/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

/* Shared module imports */
import { usePagination } from '@shared/hooks/use-pagination'
import type { PaginationInfo } from '@shared/types'

describe('use-pagination', () => {
  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => usePagination({}))

      expect(result.current.currentPage).toBe(1)
      expect(result.current.pageLimit).toBe(10)
    })

    it('should initialize with custom initial page', () => {
      const { result } = renderHook(() => usePagination({ initialPage: 5 }))

      expect(result.current.currentPage).toBe(5)
    })

    it('should initialize with custom initial limit', () => {
      const { result } = renderHook(() => usePagination({ initialLimit: 25 }))

      expect(result.current.pageLimit).toBe(25)
    })

    it('should initialize with both custom page and limit', () => {
      const { result } = renderHook(() =>
        usePagination({ initialPage: 3, initialLimit: 50 })
      )

      expect(result.current.currentPage).toBe(3)
      expect(result.current.pageLimit).toBe(50)
    })
  })

  describe('Return interface', () => {
    it('should return all required properties', () => {
      const { result } = renderHook(() => usePagination({}))

      expect(result.current).toHaveProperty('currentPage')
      expect(result.current).toHaveProperty('pageLimit')
      expect(result.current).toHaveProperty('setCurrentPage')
      expect(result.current).toHaveProperty('setPageLimit')
      expect(result.current).toHaveProperty('handleLimitChange')
      expect(result.current).toHaveProperty('handlePreviousPage')
      expect(result.current).toHaveProperty('handleNextPage')
      expect(result.current).toHaveProperty('resetToFirstPage')
    })

    it('should return functions with correct types', () => {
      const { result } = renderHook(() => usePagination({}))

      expect(typeof result.current.setCurrentPage).toBe('function')
      expect(typeof result.current.setPageLimit).toBe('function')
      expect(typeof result.current.handleLimitChange).toBe('function')
      expect(typeof result.current.handlePreviousPage).toBe('function')
      expect(typeof result.current.handleNextPage).toBe('function')
      expect(typeof result.current.resetToFirstPage).toBe('function')
    })
  })

  describe('setCurrentPage', () => {
    it('should update current page', () => {
      const { result } = renderHook(() => usePagination({}))

      act(() => {
        result.current.setCurrentPage(3)
      })

      expect(result.current.currentPage).toBe(3)
    })

    it('should allow setting page to 1', () => {
      const { result } = renderHook(() => usePagination({ initialPage: 5 }))

      act(() => {
        result.current.setCurrentPage(1)
      })

      expect(result.current.currentPage).toBe(1)
    })
  })

  describe('setPageLimit', () => {
    it('should update page limit', () => {
      const { result } = renderHook(() => usePagination({}))

      act(() => {
        result.current.setPageLimit(25)
      })

      expect(result.current.pageLimit).toBe(25)
    })

    it('should not reset current page when setting limit directly', () => {
      const { result } = renderHook(() => usePagination({ initialPage: 3 }))

      act(() => {
        result.current.setPageLimit(50)
      })

      expect(result.current.currentPage).toBe(3)
      expect(result.current.pageLimit).toBe(50)
    })
  })

  describe('handleLimitChange', () => {
    it('should update limit and reset to first page', () => {
      const { result } = renderHook(() => usePagination({ initialPage: 5 }))

      act(() => {
        result.current.handleLimitChange('25')
      })

      expect(result.current.pageLimit).toBe(25)
      expect(result.current.currentPage).toBe(1)
    })

    it('should call onPageChange callback', () => {
      const onPageChange = vi.fn()
      const { result } = renderHook(() => usePagination({ onPageChange }))

      act(() => {
        result.current.handleLimitChange('25')
      })

      expect(onPageChange).toHaveBeenCalledWith(1, 25)
    })

    it('should not update when loading is true', () => {
      const onPageChange = vi.fn()
      const { result } = renderHook(() =>
        usePagination({ onPageChange, loading: true })
      )

      act(() => {
        result.current.handleLimitChange('25')
      })

      expect(result.current.pageLimit).toBe(10)
      expect(onPageChange).not.toHaveBeenCalled()
    })

    it('should parse string limit to number', () => {
      const { result } = renderHook(() => usePagination({}))

      act(() => {
        result.current.handleLimitChange('100')
      })

      expect(result.current.pageLimit).toBe(100)
    })
  })

  describe('handlePreviousPage', () => {
    const mockPaginationWithPrev: PaginationInfo = {
      current_page: 3,
      limit: 10,
      total_count: 100,
      total_pages: 10,
      has_prev_page: true,
      has_next_page: true
    }

    const mockPaginationWithoutPrev: PaginationInfo = {
      current_page: 1,
      limit: 10,
      total_count: 100,
      total_pages: 10,
      has_prev_page: false,
      has_next_page: true
    }

    it('should navigate to previous page when has_prev_page is true', () => {
      const { result } = renderHook(() => usePagination({ initialPage: 3 }))

      act(() => {
        result.current.handlePreviousPage(mockPaginationWithPrev)
      })

      expect(result.current.currentPage).toBe(2)
    })

    it('should not navigate when has_prev_page is false', () => {
      const { result } = renderHook(() => usePagination({ initialPage: 1 }))

      act(() => {
        result.current.handlePreviousPage(mockPaginationWithoutPrev)
      })

      expect(result.current.currentPage).toBe(1)
    })

    it('should call onPageChange callback with correct values', () => {
      const onPageChange = vi.fn()
      const { result } = renderHook(() =>
        usePagination({ onPageChange, initialPage: 3 })
      )

      act(() => {
        result.current.handlePreviousPage(mockPaginationWithPrev)
      })

      expect(onPageChange).toHaveBeenCalledWith(2, 10)
    })

    it('should not update when loading is true', () => {
      const onPageChange = vi.fn()
      const { result } = renderHook(() =>
        usePagination({ onPageChange, loading: true, initialPage: 3 })
      )

      act(() => {
        result.current.handlePreviousPage(mockPaginationWithPrev)
      })

      expect(result.current.currentPage).toBe(3)
      expect(onPageChange).not.toHaveBeenCalled()
    })

    it('should handle when pagination info is undefined', () => {
      const { result } = renderHook(() => usePagination({ initialPage: 3 }))

      act(() => {
        result.current.handlePreviousPage(undefined)
      })

      expect(result.current.currentPage).toBe(3)
    })
  })

  describe('handleNextPage', () => {
    const mockPaginationWithNext: PaginationInfo = {
      current_page: 3,
      limit: 10,
      total_count: 100,
      total_pages: 10,
      has_prev_page: true,
      has_next_page: true
    }

    const mockPaginationWithoutNext: PaginationInfo = {
      current_page: 10,
      limit: 10,
      total_count: 100,
      total_pages: 10,
      has_prev_page: true,
      has_next_page: false
    }

    it('should navigate to next page when has_next_page is true', () => {
      const { result } = renderHook(() => usePagination({ initialPage: 3 }))

      act(() => {
        result.current.handleNextPage(mockPaginationWithNext)
      })

      expect(result.current.currentPage).toBe(4)
    })

    it('should not navigate when has_next_page is false', () => {
      const { result } = renderHook(() => usePagination({ initialPage: 10 }))

      act(() => {
        result.current.handleNextPage(mockPaginationWithoutNext)
      })

      expect(result.current.currentPage).toBe(10)
    })

    it('should call onPageChange callback with correct values', () => {
      const onPageChange = vi.fn()
      const { result } = renderHook(() =>
        usePagination({ onPageChange, initialPage: 3 })
      )

      act(() => {
        result.current.handleNextPage(mockPaginationWithNext)
      })

      expect(onPageChange).toHaveBeenCalledWith(4, 10)
    })

    it('should not update when loading is true', () => {
      const onPageChange = vi.fn()
      const { result } = renderHook(() =>
        usePagination({ onPageChange, loading: true, initialPage: 3 })
      )

      act(() => {
        result.current.handleNextPage(mockPaginationWithNext)
      })

      expect(result.current.currentPage).toBe(3)
      expect(onPageChange).not.toHaveBeenCalled()
    })

    it('should handle when pagination info is undefined', () => {
      const { result } = renderHook(() => usePagination({ initialPage: 3 }))

      act(() => {
        result.current.handleNextPage(undefined)
      })

      expect(result.current.currentPage).toBe(3)
    })
  })

  describe('resetToFirstPage', () => {
    it('should reset to page 1', () => {
      const { result } = renderHook(() => usePagination({ initialPage: 5 }))

      act(() => {
        result.current.resetToFirstPage()
      })

      expect(result.current.currentPage).toBe(1)
    })

    it('should call onPageChange callback', () => {
      const onPageChange = vi.fn()
      const { result } = renderHook(() =>
        usePagination({ onPageChange, initialPage: 5, initialLimit: 25 })
      )

      act(() => {
        result.current.resetToFirstPage()
      })

      expect(onPageChange).toHaveBeenCalledWith(1, 25)
    })

    it('should not update when loading is true', () => {
      const onPageChange = vi.fn()
      const { result } = renderHook(() =>
        usePagination({ onPageChange, loading: true, initialPage: 5 })
      )

      act(() => {
        result.current.resetToFirstPage()
      })

      expect(result.current.currentPage).toBe(5)
      expect(onPageChange).not.toHaveBeenCalled()
    })

    it('should keep current page limit', () => {
      const { result } = renderHook(() =>
        usePagination({ initialPage: 5, initialLimit: 50 })
      )

      act(() => {
        result.current.resetToFirstPage()
      })

      expect(result.current.currentPage).toBe(1)
      expect(result.current.pageLimit).toBe(50)
    })
  })

  describe('Loading state behavior', () => {
    it('should prevent all operations when loading', () => {
      const onPageChange = vi.fn()
      const { result } = renderHook(() =>
        usePagination({ onPageChange, loading: true, initialPage: 3 })
      )

      const pagination: PaginationInfo = {
        current_page: 3,
        limit: 10,
        total_count: 100,
        total_pages: 10,
        has_prev_page: true,
        has_next_page: true
      }

      act(() => {
        result.current.handleLimitChange('25')
        result.current.handlePreviousPage(pagination)
        result.current.handleNextPage(pagination)
        result.current.resetToFirstPage()
      })

      expect(result.current.currentPage).toBe(3)
      expect(result.current.pageLimit).toBe(10)
      expect(onPageChange).not.toHaveBeenCalled()
    })

    it('should allow direct setters even when loading', () => {
      const { result } = renderHook(() =>
        usePagination({ loading: true, initialPage: 3 })
      )

      act(() => {
        result.current.setCurrentPage(5)
        result.current.setPageLimit(25)
      })

      expect(result.current.currentPage).toBe(5)
      expect(result.current.pageLimit).toBe(25)
    })
  })

  describe('Integration scenarios', () => {
    it('should handle complete pagination workflow', () => {
      const onPageChange = vi.fn()
      const { result } = renderHook(() => usePagination({ onPageChange }))

      /* Change limit */
      act(() => {
        result.current.handleLimitChange('25')
      })
      expect(result.current.currentPage).toBe(1)
      expect(result.current.pageLimit).toBe(25)

      /* Navigate to page 3 */
      act(() => {
        result.current.setCurrentPage(3)
      })

      const pagination: PaginationInfo = {
        current_page: 3,
        limit: 25,
        total_count: 100,
        total_pages: 4,
        has_prev_page: true,
        has_next_page: true
      }

      /* Go to next page */
      act(() => {
        result.current.handleNextPage(pagination)
      })
      expect(result.current.currentPage).toBe(4)

      /* Go to previous page */
      const newPagination: PaginationInfo = {
        ...pagination,
        current_page: 4
      }
      act(() => {
        result.current.handlePreviousPage(newPagination)
      })
      expect(result.current.currentPage).toBe(3)

      /* Reset to first page */
      act(() => {
        result.current.resetToFirstPage()
      })
      expect(result.current.currentPage).toBe(1)
    })

    it('should maintain stable function references', () => {
      const { result, rerender } = renderHook(() => usePagination({}))

      const firstRender = {
        handleLimitChange: result.current.handleLimitChange,
        handlePreviousPage: result.current.handlePreviousPage,
        handleNextPage: result.current.handleNextPage,
        resetToFirstPage: result.current.resetToFirstPage
      }

      rerender()

      expect(result.current.handleLimitChange).toBe(firstRender.handleLimitChange)
      expect(result.current.handlePreviousPage).toBe(firstRender.handlePreviousPage)
      expect(result.current.handleNextPage).toBe(firstRender.handleNextPage)
      expect(result.current.resetToFirstPage).toBe(firstRender.resetToFirstPage)
    })
  })
})
