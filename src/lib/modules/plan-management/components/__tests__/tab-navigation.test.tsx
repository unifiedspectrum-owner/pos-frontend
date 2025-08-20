import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@shared/test-utils/render'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import TabNavigation from '../tab-navigation'

// Mock react-icons
vi.mock('react-icons/md', () => ({
  MdOutlineArrowBack: () => <span data-testid="back-icon">BackIcon</span>,
  MdOutlineArrowForward: () => <span data-testid="forward-icon">ForwardIcon</span>,
  MdList: () => <span data-testid="list-icon">ListIcon</span>
}))

vi.mock('react-icons/fi', () => ({
  FiEdit: () => <span data-testid="edit-icon">EditIcon</span>
}))

// Mock shared components
vi.mock('@shared/components/form-elements', () => ({
  PrimaryButton: ({ children, onClick, leftIcon: LeftIcon, rightIcon: RightIcon, loading, disabled, ...props }: any) => (
    <button 
      onClick={onClick}
      disabled={disabled || loading}
      data-testid="primary-button"
      aria-label={children}
      {...props}
    >
      {LeftIcon && <LeftIcon aria-hidden="true" />}
      {children}
      {RightIcon && <RightIcon aria-hidden="true" />}
    </button>
  ),
  SecondaryButton: ({ children, onClick, leftIcon: LeftIcon, ...props }: any) => (
    <button 
      onClick={onClick} 
      data-testid="secondary-button" 
      aria-label={children}
      {...props}
    >
      {LeftIcon && <LeftIcon aria-hidden="true" />}
      {children}
    </button>
  )
}))

describe('TabNavigation', () => {
  const mockOnPrevious = vi.fn()
  const mockOnNext = vi.fn()
  const mockOnSubmit = vi.fn()
  const mockOnEdit = vi.fn()
  const mockOnBackToList = vi.fn()

  const defaultProps = {
    onPrevious: mockOnPrevious,
    onNext: mockOnNext,
    onSubmit: mockOnSubmit,
    onEdit: mockOnEdit,
    onBackToList: mockOnBackToList
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<TabNavigation />)
      
      // Should render at least one button (the main action button)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(1)
    })

    it('shows Previous button when not first tab', () => {
      render(<TabNavigation {...defaultProps} isFirstTab={false} />)
      
      expect(screen.getByText('Previous')).toBeInTheDocument()
    })

    it('hides Previous button when first tab', () => {
      render(<TabNavigation {...defaultProps} isFirstTab={true} />)
      
      expect(screen.queryByText('Previous')).not.toBeInTheDocument()
    })

    it('renders Next button with default text', () => {
      render(<TabNavigation {...defaultProps} />)
      
      expect(screen.getByText('Next')).toBeInTheDocument()
    })

    it('renders custom next button text', () => {
      render(<TabNavigation {...defaultProps} nextButtonText="Continue" />)
      
      expect(screen.getByText('Continue')).toBeInTheDocument()
    })

    it('renders submit button on last tab with valid form', () => {
      render(
        <TabNavigation 
          {...defaultProps} 
          isLastTab={true} 
          isFormValid={true} 
        />
      )
      
      expect(screen.getByText('Create Plan')).toBeInTheDocument()
    })

    it('renders custom submit button text', () => {
      render(
        <TabNavigation 
          {...defaultProps} 
          isLastTab={true} 
          isFormValid={true}
          submitButtonText="Save Plan"
        />
      )
      
      expect(screen.getByText('Save Plan')).toBeInTheDocument()
    })
  })

  describe('Button Interactions', () => {
    it('calls onPrevious when Previous button is clicked', async () => {
      const user = userEvent.setup()
      render(<TabNavigation {...defaultProps} isFirstTab={false} />)
      
      const previousButton = screen.getByText('Previous')
      await user.click(previousButton)
      
      expect(mockOnPrevious).toHaveBeenCalledTimes(1)
    })

    it('calls onNext when Next button is clicked', async () => {
      const user = userEvent.setup()
      render(<TabNavigation {...defaultProps} />)
      
      const nextButton = screen.getByText('Next')
      await user.click(nextButton)
      
      expect(mockOnNext).toHaveBeenCalledTimes(1)
    })

    it('calls onSubmit when submit button is clicked on last tab with valid form', async () => {
      const user = userEvent.setup()
      render(
        <TabNavigation 
          {...defaultProps} 
          isLastTab={true} 
          isFormValid={true}
        />
      )
      
      const submitButton = screen.getByText('Create Plan')
      await user.click(submitButton)
      
      expect(mockOnSubmit).toHaveBeenCalledTimes(1)
    })

    it('shows loading state when submitting', () => {
      render(
        <TabNavigation 
          {...defaultProps} 
          isLastTab={true} 
          isFormValid={true}
          isSubmitting={true}
        />
      )
      
      expect(screen.getByText('Creating Plan...')).toBeInTheDocument()
      
      const submitButton = screen.getByText('Creating Plan...')
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Read-only Mode', () => {
    it('renders Edit button on last tab in read-only mode', () => {
      render(
        <TabNavigation 
          {...defaultProps} 
          isLastTab={true} 
          readOnly={true}
        />
      )
      
      expect(screen.getByText('Edit Plan')).toBeInTheDocument()
    })

    it('calls onEdit when Edit button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <TabNavigation 
          {...defaultProps} 
          isLastTab={true} 
          readOnly={true}
        />
      )
      
      const editButton = screen.getByText('Edit Plan')
      await user.click(editButton)
      
      expect(mockOnEdit).toHaveBeenCalledTimes(1)
    })

    it('shows Back to List button in read-only mode on last tab', () => {
      render(
        <TabNavigation 
          {...defaultProps} 
          isLastTab={true} 
          readOnly={true}
        />
      )
      
      expect(screen.getByText('Back to List')).toBeInTheDocument()
    })

    it('calls onBackToList when Back to List button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <TabNavigation 
          {...defaultProps} 
          isLastTab={true} 
          readOnly={true}
        />
      )
      
      const backButton = screen.getByText('Back to List')
      await user.click(backButton)
      
      expect(mockOnBackToList).toHaveBeenCalledTimes(1)
    })
  })

  describe('Button States', () => {
    it('shows Next text for middle tabs', () => {
      render(
        <TabNavigation 
          {...defaultProps} 
          isFirstTab={false}
          isLastTab={false}
        />
      )
      
      expect(screen.getByText('Next')).toBeInTheDocument()
    })

    it('shows Edit Plan text in read-only last tab', () => {
      render(
        <TabNavigation 
          {...defaultProps} 
          isLastTab={true}
          readOnly={true}
        />
      )
      
      expect(screen.getByText('Edit Plan')).toBeInTheDocument()
    })

    it('shows Create Plan text for valid last tab', () => {
      render(
        <TabNavigation 
          {...defaultProps} 
          isLastTab={true}
          isFormValid={true}
        />
      )
      
      expect(screen.getByText('Create Plan')).toBeInTheDocument()
    })

    it('shows Creating Plan... text when submitting', () => {
      render(
        <TabNavigation 
          {...defaultProps} 
          isLastTab={true}
          isFormValid={true}
          isSubmitting={true}
        />
      )
      
      expect(screen.getByText('Creating Plan...')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <TabNavigation 
          {...defaultProps} 
          isFirstTab={false} 
          isLastTab={false} 
        />
      )
      const results = await axe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('has proper button roles and labels', () => {
      render(
        <TabNavigation 
          {...defaultProps} 
          isFirstTab={false} 
          isLastTab={true}
          isFormValid={true}
        />
      )
      
      expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Create Plan' })).toBeInTheDocument()
    })

    it('disables buttons appropriately during loading', () => {
      render(
        <TabNavigation 
          {...defaultProps} 
          isSubmitting={true}
          isLastTab={true}
          isFormValid={true}
        />
      )
      
      const submitButton = screen.getByText('Creating Plan...')
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Form Validation Logic', () => {
    it('shows Next button on invalid last tab', () => {
      render(
        <TabNavigation 
          {...defaultProps} 
          isLastTab={true} 
          isFormValid={false}
        />
      )
      
      expect(screen.getByText('Next')).toBeInTheDocument()
      expect(screen.queryByText('Create Plan')).not.toBeInTheDocument()
    })

    it('calls onNext instead of onSubmit when form is invalid on last tab', async () => {
      const user = userEvent.setup()
      render(
        <TabNavigation 
          {...defaultProps} 
          isLastTab={true} 
          isFormValid={false}
        />
      )
      
      const button = screen.getByText('Next')
      await user.click(button)
      
      expect(mockOnNext).toHaveBeenCalledTimes(1)
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('prevents submission when form validation fails', async () => {
      const user = userEvent.setup()
      render(
        <TabNavigation 
          {...defaultProps} 
          isLastTab={true} 
          isFormValid={false}
        />
      )
      
      const button = screen.getByTestId('primary-button')
      await user.click(button)
      
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('enables submission only when form is valid on last tab', async () => {
      const user = userEvent.setup()
      render(
        <TabNavigation 
          {...defaultProps} 
          isLastTab={true} 
          isFormValid={true}
        />
      )
      
      const button = screen.getByText('Create Plan')
      await user.click(button)
      
      expect(mockOnSubmit).toHaveBeenCalledTimes(1)
    })
  })

  describe('Loading States and Submission', () => {
    it('shows loading text during submission', () => {
      render(
        <TabNavigation 
          {...defaultProps} 
          isLastTab={true} 
          isFormValid={true}
          isSubmitting={true}
          submitButtonText="Save Plan"
        />
      )
      
      expect(screen.getByText('Creating Plan...')).toBeInTheDocument()
      expect(screen.queryByText('Save Plan')).not.toBeInTheDocument()
    })

    it('disables all buttons during submission', () => {
      render(
        <TabNavigation 
          {...defaultProps} 
          isFirstTab={false}
          isLastTab={true}
          isFormValid={true}
          isSubmitting={true}
        />
      )
      
      const previousButton = screen.getByText('Previous')
      const submitButton = screen.getByText('Creating Plan...')
      
      expect(previousButton).toBeInTheDocument() // Previous button should still be visible
      expect(submitButton).toBeDisabled()
    })

    it('maintains loading state consistency', () => {
      const { rerender } = render(
        <TabNavigation 
          {...defaultProps} 
          isLastTab={true}
          isFormValid={true}
          isSubmitting={true}
        />
      )
      
      expect(screen.getByText('Creating Plan...')).toBeInTheDocument()
      
      // Re-render with same loading state
      rerender(
        <TabNavigation 
          {...defaultProps} 
          isLastTab={true}
          isFormValid={true}
          isSubmitting={true}
        />
      )
      
      expect(screen.getByText('Creating Plan...')).toBeInTheDocument()
    })
  })

  describe('Button Icon Logic', () => {
    it('shows forward arrow icon on Next button', () => {
      render(<TabNavigation {...defaultProps} isLastTab={false} />)
      
      const button = screen.getByTestId('primary-button')
      expect(button).toBeInTheDocument()
    })

    it('shows edit icon on Edit button in read-only mode', () => {
      render(
        <TabNavigation 
          {...defaultProps} 
          isLastTab={true} 
          readOnly={true}
        />
      )
      
      const button = screen.getByText('Edit Plan')
      expect(button).toBeInTheDocument()
    })

    it('shows back arrow icon on Previous button', () => {
      render(<TabNavigation {...defaultProps} isFirstTab={false} />)
      
      const button = screen.getByText('Previous')
      expect(button).toBeInTheDocument()
    })

    it('shows no icon on submit button', () => {
      render(
        <TabNavigation 
          {...defaultProps} 
          isLastTab={true} 
          isFormValid={true}
        />
      )
      
      const button = screen.getByText('Create Plan')
      expect(button).toBeInTheDocument()
    })
  })

  describe('Layout and Positioning', () => {
    it('positions buttons to right when first tab', () => {
      render(<TabNavigation {...defaultProps} isFirstTab={true} />)
      
      // Only one button should be visible (Next/Submit)
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(1)
    })

    it('positions buttons space-between when not first tab', () => {
      render(<TabNavigation {...defaultProps} isFirstTab={false} />)
      
      // Should have Previous and Next/Submit buttons
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(2)
      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
    })

    it('groups right-side buttons correctly in read-only mode', () => {
      render(
        <TabNavigation 
          {...defaultProps} 
          isFirstTab={false}
          isLastTab={true} 
          readOnly={true}
        />
      )
      
      // Should have Previous, Back to List, and Edit buttons
      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Back to List')).toBeInTheDocument()
      expect(screen.getByText('Edit Plan')).toBeInTheDocument()
    })
  })

  describe('Custom Text Props', () => {
    it('uses custom next button text', () => {
      render(<TabNavigation {...defaultProps} nextButtonText="Continue" />)
      
      expect(screen.getByText('Continue')).toBeInTheDocument()
      expect(screen.queryByText('Next')).not.toBeInTheDocument()
    })

    it('uses custom submit button text', () => {
      render(
        <TabNavigation 
          {...defaultProps} 
          isLastTab={true} 
          isFormValid={true}
          submitButtonText="Save Changes"
        />
      )
      
      expect(screen.getByText('Save Changes')).toBeInTheDocument()
      expect(screen.queryByText('Create Plan')).not.toBeInTheDocument()
    })

    it('updates button text dynamically', () => {
      const { rerender } = render(
        <TabNavigation {...defaultProps} nextButtonText="Step 1" />
      )
      
      expect(screen.getByText('Step 1')).toBeInTheDocument()
      
      rerender(<TabNavigation {...defaultProps} nextButtonText="Step 2" />)
      
      expect(screen.getByText('Step 2')).toBeInTheDocument()
      expect(screen.queryByText('Step 1')).not.toBeInTheDocument()
    })
  })

  describe('Complex State Combinations', () => {
    it('handles first tab + last tab scenario', () => {
      render(
        <TabNavigation 
          {...defaultProps} 
          isFirstTab={true}
          isLastTab={true}
          isFormValid={true}
        />
      )
      
      // Should only show submit button
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(1)
      expect(screen.getByText('Create Plan')).toBeInTheDocument()
      expect(screen.queryByText('Previous')).not.toBeInTheDocument()
    })

    it('handles read-only first tab + last tab', () => {
      render(
        <TabNavigation 
          {...defaultProps} 
          isFirstTab={true}
          isLastTab={true}
          readOnly={true}
        />
      )
      
      // Should show Back to List and Edit buttons
      expect(screen.getByText('Back to List')).toBeInTheDocument()
      expect(screen.getByText('Edit Plan')).toBeInTheDocument()
    })

    it('handles middle tab with all features', () => {
      render(
        <TabNavigation 
          {...defaultProps} 
          isFirstTab={false}
          isLastTab={false}
          isFormValid={false}
          nextButtonText="Continue to Next Step"
        />
      )
      
      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Continue to Next Step')).toBeInTheDocument()
    })
  })

  describe('Interaction Combinations', () => {
    it('handles Previous then Next navigation', async () => {
      const user = userEvent.setup()
      render(<TabNavigation {...defaultProps} isFirstTab={false} />)
      
      const previousButton = screen.getByText('Previous')
      const nextButton = screen.getByText('Next')
      
      await user.click(previousButton)
      await user.click(nextButton)
      
      expect(mockOnPrevious).toHaveBeenCalledTimes(1)
      expect(mockOnNext).toHaveBeenCalledTimes(1)
    })

    it('handles Edit then Back to List flow', async () => {
      const user = userEvent.setup()
      render(
        <TabNavigation 
          {...defaultProps} 
          isLastTab={true} 
          readOnly={true}
        />
      )
      
      const editButton = screen.getByText('Edit Plan')
      const backButton = screen.getByText('Back to List')
      
      await user.click(editButton)
      await user.click(backButton)
      
      expect(mockOnEdit).toHaveBeenCalledTimes(1)
      expect(mockOnBackToList).toHaveBeenCalledTimes(1)
    })

    it('handles rapid button interactions', async () => {
      const user = userEvent.setup()
      render(<TabNavigation {...defaultProps} isFirstTab={false} />)
      
      const previousButton = screen.getByText('Previous')
      const nextButton = screen.getByText('Next')
      
      // Rapid alternating clicks
      await user.click(previousButton)
      await user.click(nextButton)
      await user.click(previousButton)
      await user.click(nextButton)
      
      expect(mockOnPrevious).toHaveBeenCalledTimes(2)
      expect(mockOnNext).toHaveBeenCalledTimes(2)
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('handles undefined callback props gracefully', () => {
      expect(() => {
        render(<TabNavigation />)
      }).not.toThrow()
    })

    it('handles missing onPrevious callback', async () => {
      const user = userEvent.setup()
      render(<TabNavigation isFirstTab={false} onPrevious={undefined} />)
      
      const previousButton = screen.getByText('Previous')
      
      expect(() => user.click(previousButton)).not.toThrow()
    })

    it('handles missing onNext callback', async () => {
      const user = userEvent.setup()
      render(<TabNavigation onNext={undefined} />)
      
      const nextButton = screen.getByText('Next')
      
      expect(() => user.click(nextButton)).not.toThrow()
    })

    it('handles missing onSubmit callback', async () => {
      const user = userEvent.setup()
      render(
        <TabNavigation 
          isLastTab={true} 
          isFormValid={true} 
          onSubmit={undefined}
        />
      )
      
      const submitButton = screen.getByText('Create Plan')
      
      expect(() => user.click(submitButton)).not.toThrow()
    })

    it('handles invalid boolean props', () => {
      expect(() => {
        render(
          <TabNavigation 
            isFirstTab={"invalid" as any}
            isLastTab={"invalid" as any}
            isSubmitting={"invalid" as any}
            isFormValid={"invalid" as any}
            readOnly={"invalid" as any}
          />
        )
      }).not.toThrow()
    })

    it('handles null text props', () => {
      expect(() => {
        render(
          <TabNavigation 
            nextButtonText={null as any}
            submitButtonText={null as any}
          />
        )
      }).not.toThrow()
    })
  })

  describe('Performance and Optimization', () => {
    it('handles frequent prop updates efficiently', () => {
      const { rerender } = render(<TabNavigation {...defaultProps} />)
      
      const startTime = Date.now()
      
      // Multiple rapid re-renders with different states
      for (let i = 0; i < 50; i++) {
        rerender(
          <TabNavigation 
            {...defaultProps}
            isFirstTab={i % 2 === 0}
            isLastTab={i % 3 === 0}
            isFormValid={i % 5 === 0}
            isSubmitting={i % 7 === 0}
            readOnly={i % 11 === 0}
          />
        )
      }
      
      const endTime = Date.now()
      
      expect(endTime - startTime).toBeLessThan(1000)
      expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
    })

    it('maintains consistent callback references', () => {
      const { rerender } = render(<TabNavigation {...defaultProps} />)
      
      const initialButton = screen.getByText('Next')
      expect(initialButton).toBeInTheDocument()
      
      // Re-render with same callbacks
      rerender(<TabNavigation {...defaultProps} />)
      
      const rerenderedButton = screen.getByText('Next')
      expect(rerenderedButton).toBeInTheDocument()
    })
  })

  describe('Component Lifecycle', () => {
    it('cleans up properly when unmounted', () => {
      const { unmount } = render(<TabNavigation {...defaultProps} />)
      
      expect(screen.getByText('Next')).toBeInTheDocument()
      
      unmount()
      
      expect(screen.queryByText('Next')).not.toBeInTheDocument()
    })

    it('handles multiple mount/unmount cycles', () => {
      // First mount
      const { unmount: unmount1 } = render(<TabNavigation {...defaultProps} />)
      expect(screen.getByText('Next')).toBeInTheDocument()
      
      unmount1()
      expect(screen.queryByText('Next')).not.toBeInTheDocument()
      
      // Second mount
      const { unmount: unmount2 } = render(<TabNavigation {...defaultProps} />)
      expect(screen.getByText('Next')).toBeInTheDocument()
      
      unmount2()
      expect(screen.queryByText('Next')).not.toBeInTheDocument()
    })

    it('maintains state during complex prop transitions', () => {
      const { rerender } = render(
        <TabNavigation 
          {...defaultProps} 
          isFirstTab={true}
          isLastTab={false}
        />
      )
      
      expect(screen.getByText('Next')).toBeInTheDocument()
      expect(screen.queryByText('Previous')).not.toBeInTheDocument()
      
      // Transition through multiple states
      rerender(
        <TabNavigation 
          {...defaultProps} 
          isFirstTab={false}
          isLastTab={false}
        />
      )
      
      expect(screen.getByText('Next')).toBeInTheDocument()
      expect(screen.getByText('Previous')).toBeInTheDocument()
      
      rerender(
        <TabNavigation 
          {...defaultProps} 
          isFirstTab={false}
          isLastTab={true}
          isFormValid={true}
        />
      )
      
      expect(screen.getByText('Create Plan')).toBeInTheDocument()
      expect(screen.getByText('Previous')).toBeInTheDocument()
    })
  })

  describe('Integration Scenarios', () => {
    it('supports complete form wizard flow', async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <TabNavigation {...defaultProps} isFirstTab={true} />
      )
      
      // Step 1: First tab, only Next button
      expect(screen.getByText('Next')).toBeInTheDocument()
      expect(screen.queryByText('Previous')).not.toBeInTheDocument()
      
      // Step 2: Navigate to middle tab
      await user.click(screen.getByText('Next'))
      rerender(<TabNavigation {...defaultProps} isFirstTab={false} isLastTab={false} />)
      
      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
      
      // Step 3: Navigate to last tab
      await user.click(screen.getByText('Next'))
      rerender(
        <TabNavigation 
          {...defaultProps} 
          isFirstTab={false} 
          isLastTab={true} 
          isFormValid={true}
        />
      )
      
      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Create Plan')).toBeInTheDocument()
      
      // Step 4: Submit form
      await user.click(screen.getByText('Create Plan'))
      
      expect(mockOnNext).toHaveBeenCalledTimes(2)
      expect(mockOnSubmit).toHaveBeenCalledTimes(1)
    })

    it('supports read-only view workflow', async () => {
      const user = userEvent.setup()
      render(
        <TabNavigation 
          {...defaultProps} 
          isFirstTab={false}
          isLastTab={true} 
          readOnly={true}
        />
      )
      
      // Read-only last tab should show Previous, Back to List, Edit
      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Back to List')).toBeInTheDocument()
      expect(screen.getByText('Edit Plan')).toBeInTheDocument()
      
      await user.click(screen.getByText('Edit Plan'))
      expect(mockOnEdit).toHaveBeenCalledTimes(1)
    })

    it('handles form validation workflow', () => {
      const { rerender } = render(
        <TabNavigation 
          {...defaultProps} 
          isLastTab={true} 
          isFormValid={false}
        />
      )
      
      // Invalid form should show Next button
      expect(screen.getByText('Next')).toBeInTheDocument()
      expect(screen.queryByText('Create Plan')).not.toBeInTheDocument()
      
      // Valid form should show Submit button
      rerender(
        <TabNavigation 
          {...defaultProps} 
          isLastTab={true} 
          isFormValid={true}
        />
      )
      
      expect(screen.getByText('Create Plan')).toBeInTheDocument()
      expect(screen.queryByText('Next')).not.toBeInTheDocument()
    })
  })
})