/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/* Shared module imports */
import { Provider } from '@/components/ui/provider'
import { PaginationInfo } from '@shared/types'

/* Component imports */
import Pagination from '../pagination'

/* Mock dependencies */
vi.mock('polished', () => ({
  lighten: vi.fn((amount: number, color: string) => color)
}))

vi.mock('@shared/config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@shared/config')>()
  return {
    ...actual,
    GRAY_COLOR: '#718096',
    SUCCESS_GREEN_COLOR: '#00FF41',
    SUCCESS_GREEN_COLOR2: '#30cb57ff',
    WARNING_ORANGE_COLOR: '#f59e0b',
    ERROR_RED_COLOR: '#ef4444',
    PRIMARY_COLOR: '#562dc6',
    SECONDARY_COLOR: '#885CF7',
    WHITE_COLOR: '#FFFFFF',
    BG_COLOR: '#FCFCFF',
    DARK_COLOR: '#17171A'
  }
})

vi.mock('@shared/hooks', () => ({
  usePagination: vi.fn()
}))

import { usePagination } from '@shared/hooks'

/* Test wrapper with Chakra Provider */
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

/* Helper function to get navigation buttons */
const getNavigationButtons = () => {
  const buttons = screen.getAllByRole('button')
  /* Filter out the combobox button if limit selector is shown */
  const navigationButtons = buttons.filter(btn =>
    !btn.closest('[role="combobox"]')
  )
  /* Previous button is the first navigation button, Next is the second */
  return {
    previousButton: navigationButtons[0],
    nextButton: navigationButtons[1]
  }
}

describe('Pagination Component', () => {
  const mockHandleLimitChange = vi.fn()
  const mockHandlePreviousPage = vi.fn()
  const mockHandleNextPage = vi.fn()
  const mockSetCurrentPage = vi.fn()
  const mockSetPageLimit = vi.fn()
  const mockResetToFirstPage = vi.fn()
  const mockOnPageChange = vi.fn()

  const defaultPagination: PaginationInfo = {
    current_page: 2,
    limit: 10,
    total_count: 100,
    total_pages: 10,
    has_prev_page: true,
    has_next_page: true
  }

  const defaultProps = {
    pagination: defaultPagination,
    loading: false,
    onPageChange: mockOnPageChange
  }

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(usePagination).mockReturnValue({
      currentPage: 2,
      pageLimit: 10,
      setCurrentPage: mockSetCurrentPage,
      setPageLimit: mockSetPageLimit,
      handleLimitChange: mockHandleLimitChange,
      handlePreviousPage: mockHandlePreviousPage,
      handleNextPage: mockHandleNextPage,
      resetToFirstPage: mockResetToFirstPage
    })
  })

  describe('Basic Rendering', () => {
    it('should render pagination controls', () => {
      render(<Pagination {...defaultProps} />, { wrapper: TestWrapper })

      const { previousButton, nextButton } = getNavigationButtons()
      expect(previousButton).toBeInTheDocument()
      expect(nextButton).toBeInTheDocument()
    })

    it('should render page info', () => {
      render(<Pagination {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Page 2 of 10')).toBeInTheDocument()
    })

    it('should render showing entries info', () => {
      render(<Pagination {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText(/Showing 11-20 of 100/)).toBeInTheDocument()
    })

    it('should render limit selector by default', () => {
      render(<Pagination {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Show')).toBeInTheDocument()
      expect(screen.getByText('entries')).toBeInTheDocument()
    })

    it('should render previous button', () => {
      render(<Pagination {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Previous')).toBeInTheDocument()
    })

    it('should render next button', () => {
      render(<Pagination {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Next')).toBeInTheDocument()
    })
  })

  describe('Page Navigation', () => {
    it('should call handlePreviousPage when previous button is clicked', async () => {
      const user = userEvent.setup()

      render(<Pagination {...defaultProps} />, { wrapper: TestWrapper })

      const previousButton = screen.getByText('Previous')
      await user.click(previousButton)

      expect(mockHandlePreviousPage).toHaveBeenCalledWith(defaultPagination)
    })

    it('should call handleNextPage when next button is clicked', async () => {
      const user = userEvent.setup()

      render(<Pagination {...defaultProps} />, { wrapper: TestWrapper })

      const nextButton = screen.getByText('Next')
      await user.click(nextButton)

      expect(mockHandleNextPage).toHaveBeenCalledWith(defaultPagination)
    })

    it('should disable previous button when has_prev_page is false', () => {
      const pagination = { ...defaultPagination, has_prev_page: false }

      render(<Pagination {...defaultProps} pagination={pagination} />, { wrapper: TestWrapper })

      const { previousButton } = getNavigationButtons()
      expect(previousButton).toBeDisabled()
    })

    it('should disable next button when has_next_page is false', () => {
      const pagination = { ...defaultPagination, has_next_page: false }

      render(<Pagination {...defaultProps} pagination={pagination} />, { wrapper: TestWrapper })

      const { nextButton } = getNavigationButtons()
      expect(nextButton).toBeDisabled()
    })

    it('should enable previous button when has_prev_page is true', () => {
      render(<Pagination {...defaultProps} />, { wrapper: TestWrapper })

      const previousButton = screen.getByText('Previous')
      expect(previousButton).not.toBeDisabled()
    })

    it('should enable next button when has_next_page is true', () => {
      render(<Pagination {...defaultProps} />, { wrapper: TestWrapper })

      const nextButton = screen.getByText('Next')
      expect(nextButton).not.toBeDisabled()
    })
  })

  describe('Loading State', () => {
    it('should disable previous button when loading', () => {
      render(<Pagination {...defaultProps} loading={true} />, { wrapper: TestWrapper })

      const { previousButton } = getNavigationButtons()
      expect(previousButton).toBeDisabled()
    })

    it('should disable next button when loading', () => {
      render(<Pagination {...defaultProps} loading={true} />, { wrapper: TestWrapper })

      const { nextButton } = getNavigationButtons()
      expect(nextButton).toBeDisabled()
    })

    it('should disable limit selector when loading', () => {
      render(<Pagination {...defaultProps} loading={true} />, { wrapper: TestWrapper })

      const select = screen.getByRole('combobox')
      expect(select).toBeDisabled()
    })

    it('should enable controls when not loading', () => {
      render(<Pagination {...defaultProps} loading={false} />, { wrapper: TestWrapper })

      const previousButton = screen.getByText('Previous')
      const nextButton = screen.getByText('Next')

      expect(previousButton).not.toBeDisabled()
      expect(nextButton).not.toBeDisabled()
    })
  })

  describe('Limit Selector', () => {
    it('should show limit selector by default', () => {
      render(<Pagination {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Show')).toBeInTheDocument()
      expect(screen.getByText('entries')).toBeInTheDocument()
    })

    it('should hide limit selector when showLimitSelector is false', () => {
      render(<Pagination {...defaultProps} showLimitSelector={false} />, { wrapper: TestWrapper })

      expect(screen.queryByText('Show')).not.toBeInTheDocument()
      expect(screen.queryByText('entries')).not.toBeInTheDocument()
    })

    it('should render limit selector with default options', () => {
      render(<Pagination {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('should accept custom limit options', () => {
      const customOptions = [
        { label: '20', value: '20' },
        { label: '40', value: '40' }
      ]

      render(<Pagination {...defaultProps} limitOptions={customOptions} />, { wrapper: TestWrapper })

      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })

  describe('Page Info Display', () => {
    it('should show page info by default', () => {
      render(<Pagination {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText(/Showing 11-20 of 100/)).toBeInTheDocument()
    })

    it('should hide page info when showPageInfo is false', () => {
      render(<Pagination {...defaultProps} showPageInfo={false} />, { wrapper: TestWrapper })

      expect(screen.queryByText(/Showing/)).not.toBeInTheDocument()
    })

    it('should calculate correct range for first page', () => {
      const pagination = { ...defaultPagination, current_page: 1, has_prev_page: false }

      render(<Pagination {...defaultProps} pagination={pagination} />, { wrapper: TestWrapper })

      expect(screen.getByText(/Showing 1-10 of 100/)).toBeInTheDocument()
    })

    it('should calculate correct range for middle page', () => {
      const pagination = { ...defaultPagination, current_page: 5 }

      render(<Pagination {...defaultProps} pagination={pagination} />, { wrapper: TestWrapper })

      expect(screen.getByText(/Showing 41-50 of 100/)).toBeInTheDocument()
    })

    it('should calculate correct range for last page', () => {
      const pagination = {
        ...defaultPagination,
        current_page: 10,
        has_next_page: false
      }

      render(<Pagination {...defaultProps} pagination={pagination} />, { wrapper: TestWrapper })

      expect(screen.getByText(/Showing 91-100 of 100/)).toBeInTheDocument()
    })

    it('should handle partial last page', () => {
      const pagination = {
        ...defaultPagination,
        current_page: 10,
        total_count: 95,
        has_next_page: false
      }

      render(<Pagination {...defaultProps} pagination={pagination} />, { wrapper: TestWrapper })

      expect(screen.getByText(/Showing 91-95 of 95/)).toBeInTheDocument()
    })

    it('should show correct page count', () => {
      render(<Pagination {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Page 2 of 10')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle single page', () => {
      const pagination: PaginationInfo = {
        current_page: 1,
        limit: 10,
        total_count: 5,
        total_pages: 1,
        has_prev_page: false,
        has_next_page: false
      }

      render(<Pagination {...defaultProps} pagination={pagination} />, { wrapper: TestWrapper })

      expect(screen.getByText('Page 1 of 1')).toBeInTheDocument()
      expect(screen.getByText(/Showing 1-5 of 5/)).toBeInTheDocument()
    })

    it('should handle empty results', () => {
      const pagination: PaginationInfo = {
        current_page: 1,
        limit: 10,
        total_count: 0,
        total_pages: 0,
        has_prev_page: false,
        has_next_page: false
      }

      render(<Pagination {...defaultProps} pagination={pagination} />, { wrapper: TestWrapper })

      expect(screen.getByText('Page 1 of 0')).toBeInTheDocument()
    })

    it('should handle large page numbers', () => {
      const pagination: PaginationInfo = {
        current_page: 1000,
        limit: 10,
        total_count: 10000,
        total_pages: 1000,
        has_prev_page: true,
        has_next_page: false
      }

      render(<Pagination {...defaultProps} pagination={pagination} />, { wrapper: TestWrapper })

      expect(screen.getByText('Page 1000 of 1000')).toBeInTheDocument()
    })

    it('should handle large total counts', () => {
      const pagination: PaginationInfo = {
        current_page: 1,
        limit: 10,
        total_count: 999999,
        total_pages: 99999,
        has_prev_page: false,
        has_next_page: true
      }

      render(<Pagination {...defaultProps} pagination={pagination} />, { wrapper: TestWrapper })

      expect(screen.getByText(/Showing 1-10 of 999999/)).toBeInTheDocument()
    })

    it('should handle first page with no previous', () => {
      const pagination: PaginationInfo = {
        current_page: 1,
        limit: 10,
        total_count: 100,
        total_pages: 10,
        has_prev_page: false,
        has_next_page: true
      }

      render(<Pagination {...defaultProps} pagination={pagination} />, { wrapper: TestWrapper })

      const { previousButton } = getNavigationButtons()
      expect(previousButton).toBeDisabled()
    })

    it('should handle last page with no next', () => {
      const pagination: PaginationInfo = {
        current_page: 10,
        limit: 10,
        total_count: 100,
        total_pages: 10,
        has_prev_page: true,
        has_next_page: false
      }

      render(<Pagination {...defaultProps} pagination={pagination} />, { wrapper: TestWrapper })

      const { nextButton } = getNavigationButtons()
      expect(nextButton).toBeDisabled()
    })
  })

  describe('Use Cases', () => {
    it('should render for user list pagination', () => {
      render(<Pagination {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
      expect(screen.getByText('Page 2 of 10')).toBeInTheDocument()
    })

    it('should render for minimal pagination without selectors', () => {
      render(
        <Pagination
          {...defaultProps}
          showLimitSelector={false}
          showPageInfo={false}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
      expect(screen.queryByText('Show')).not.toBeInTheDocument()
      expect(screen.queryByText(/Showing/)).not.toBeInTheDocument()
    })

    it('should render for large dataset', () => {
      const pagination: PaginationInfo = {
        current_page: 50,
        limit: 50,
        total_count: 5000,
        total_pages: 100,
        has_prev_page: true,
        has_next_page: true
      }

      render(<Pagination {...defaultProps} pagination={pagination} />, { wrapper: TestWrapper })

      expect(screen.getByText('Page 50 of 100')).toBeInTheDocument()
    })

    it('should render during loading state', () => {
      render(<Pagination {...defaultProps} loading={true} />, { wrapper: TestWrapper })

      const { previousButton, nextButton } = getNavigationButtons()
      expect(previousButton).toBeDisabled()
      expect(nextButton).toBeDisabled()
    })

    it('should render with custom limit options', () => {
      const customOptions = [
        { label: '15', value: '15' },
        { label: '30', value: '30' },
        { label: '60', value: '60' }
      ]

      render(
        <Pagination {...defaultProps} limitOptions={customOptions} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })

  describe('State Management', () => {
    it('should update when pagination changes', () => {
      const { rerender } = render(
        <Pagination {...defaultProps} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Page 2 of 10')).toBeInTheDocument()

      const newPagination = { ...defaultPagination, current_page: 3 }

      rerender(<Pagination {...defaultProps} pagination={newPagination} />)

      expect(screen.getByText('Page 3 of 10')).toBeInTheDocument()
    })

    it('should update when loading state changes', () => {
      const { rerender } = render(
        <Pagination {...defaultProps} loading={false} />,
        { wrapper: TestWrapper }
      )

      const { previousButton: previousButton1 } = getNavigationButtons()
      expect(previousButton1).not.toBeDisabled()

      rerender(<Pagination {...defaultProps} loading={true} />)

      const { previousButton: previousButton2 } = getNavigationButtons()
      expect(previousButton2).toBeDisabled()
    })

    it('should call usePagination hook with correct params', () => {
      render(<Pagination {...defaultProps} />, { wrapper: TestWrapper })

      expect(usePagination).toHaveBeenCalledWith({
        initialPage: defaultPagination.current_page,
        initialLimit: defaultPagination.limit,
        onPageChange: mockOnPageChange,
        loading: false
      })
    })
  })

  describe('Accessibility', () => {
    it('should have accessible buttons', () => {
      render(<Pagination {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
    })

    it('should have accessible select field', () => {
      render(<Pagination {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('should indicate disabled state', () => {
      const pagination = {
        ...defaultPagination,
        has_prev_page: false,
        has_next_page: false
      }

      render(<Pagination {...defaultProps} pagination={pagination} />, { wrapper: TestWrapper })

      const { previousButton, nextButton } = getNavigationButtons()
      expect(previousButton).toBeDisabled()
      expect(nextButton).toBeDisabled()
    })

    it('should have readable page information', () => {
      render(<Pagination {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Page 2 of 10')).toBeInTheDocument()
      expect(screen.getByText(/Showing 11-20 of 100/)).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('should integrate with usePagination hook', () => {
      render(<Pagination {...defaultProps} />, { wrapper: TestWrapper })

      expect(usePagination).toHaveBeenCalled()
    })

    it('should pass onPageChange callback', () => {
      render(<Pagination {...defaultProps} onPageChange={mockOnPageChange} />, { wrapper: TestWrapper })

      expect(usePagination).toHaveBeenCalledWith(
        expect.objectContaining({
          onPageChange: mockOnPageChange
        })
      )
    })

    it('should work without onPageChange callback', () => {
      const { onPageChange, ...propsWithoutCallback } = defaultProps

      render(<Pagination {...propsWithoutCallback} />, { wrapper: TestWrapper })

      expect(screen.getByText('Previous')).toBeInTheDocument()
    })
  })

  describe('Visual Consistency', () => {
    it('should maintain layout with different content', () => {
      const { rerender } = render(
        <Pagination {...defaultProps} />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Page 2 of 10')).toBeInTheDocument()

      const newPagination = {
        ...defaultPagination,
        current_page: 999,
        total_pages: 1000
      }

      rerender(<Pagination {...defaultProps} pagination={newPagination} />)

      expect(screen.getByText('Page 999 of 1000')).toBeInTheDocument()
    })

    it('should maintain consistent spacing', () => {
      const { container } = render(<Pagination {...defaultProps} />, { wrapper: TestWrapper })

      expect(container.firstChild).toBeInTheDocument()
    })
  })
})
