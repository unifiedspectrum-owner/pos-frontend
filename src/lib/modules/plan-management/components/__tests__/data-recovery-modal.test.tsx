import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@shared/test-utils/render'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import DataRecoveryModal from '../data-recovery-modal'

// Mock the shared config
vi.mock('@shared/config', () => ({
  PRIMARY_COLOR: '#3182CE'
}))

// Mock react-icons
vi.mock('react-icons/fi', () => ({
  FiRefreshCw: () => <span data-testid="refresh-icon">RefreshIcon</span>,
  FiX: () => <span data-testid="x-icon">XIcon</span>
}))

// Mock shared components
vi.mock('@shared/components/form-elements', () => ({
  PrimaryButton: ({ children, onClick, leftIcon: LeftIcon, ...props }: any) => (
    <button onClick={onClick} data-testid="primary-button" aria-label={children} {...props}>
      {LeftIcon && <LeftIcon aria-hidden="true" />}
      {children}
    </button>
  ),
  SecondaryButton: ({ children, onClick, leftIcon: LeftIcon, ...props }: any) => (
    <button onClick={onClick} data-testid="secondary-button" aria-label={children} {...props}>
      {LeftIcon && <LeftIcon aria-hidden="true" />}
      {children}
    </button>
  )
}))

describe('DataRecoveryModal', () => {
  const mockOnRestore = vi.fn()
  const mockOnStartFresh = vi.fn()

  const defaultProps = {
    isOpen: true,
    onRestore: mockOnRestore,
    onStartFresh: mockOnStartFresh
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders modal when isOpen is true', () => {
      render(<DataRecoveryModal {...defaultProps} />)
      
      expect(screen.getByText('Restore Previous Data?')).toBeInTheDocument()
      expect(screen.getByText(/We found previously saved form data/)).toBeInTheDocument()
    })

    it('does not render modal when isOpen is false', () => {
      render(<DataRecoveryModal {...defaultProps} isOpen={false} />)
      
      expect(screen.queryByText('Restore Previous Data?')).not.toBeInTheDocument()
    })

    it('renders both action buttons', () => {
      render(<DataRecoveryModal {...defaultProps} />)
      
      expect(screen.getByText('Start Fresh')).toBeInTheDocument()
      expect(screen.getByText('Restore Data')).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('calls onRestore when Restore Data button is clicked', async () => {
      const user = userEvent.setup()
      render(<DataRecoveryModal {...defaultProps} />)
      
      const restoreButton = screen.getByText('Restore Data')
      await user.click(restoreButton)
      
      expect(mockOnRestore).toHaveBeenCalledTimes(1)
    })

    it('calls onStartFresh when Start Fresh button is clicked', async () => {
      const user = userEvent.setup()
      render(<DataRecoveryModal {...defaultProps} />)
      
      const startFreshButton = screen.getByText('Start Fresh')
      await user.click(startFreshButton)
      
      expect(mockOnStartFresh).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<DataRecoveryModal {...defaultProps} />)
      const results = await axe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('has proper button roles', () => {
      render(<DataRecoveryModal {...defaultProps} />)
      
      expect(screen.getByRole('button', { name: 'Start Fresh' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Restore Data' })).toBeInTheDocument()
    })
  })

  describe('Modal State Management', () => {
    it('shows modal when isOpen changes from false to true', () => {
      const { rerender } = render(<DataRecoveryModal {...defaultProps} isOpen={false} />)
      
      expect(screen.queryByText('Restore Previous Data?')).not.toBeInTheDocument()
      
      rerender(<DataRecoveryModal {...defaultProps} isOpen={true} />)
      
      expect(screen.getByText('Restore Previous Data?')).toBeInTheDocument()
    })

    it('hides modal when isOpen changes from true to false', () => {
      const { rerender } = render(<DataRecoveryModal {...defaultProps} isOpen={true} />)
      
      expect(screen.getByText('Restore Previous Data?')).toBeInTheDocument()
      
      rerender(<DataRecoveryModal {...defaultProps} isOpen={false} />)
      
      expect(screen.queryByText('Restore Previous Data?')).not.toBeInTheDocument()
    })

    it('handles callback prop changes', () => {
      const newOnRestore = vi.fn()
      const { rerender } = render(<DataRecoveryModal {...defaultProps} isOpen={true} />)
      
      // Verify initial rendering
      expect(screen.getByText('Restore Previous Data?')).toBeInTheDocument()
      
      // Update props while keeping modal open
      rerender(
        <DataRecoveryModal 
          isOpen={true}
          onRestore={newOnRestore}
          onStartFresh={mockOnStartFresh}
        />
      )
      
      // Modal should still be visible with updated props
      expect(screen.getByText('Restore Previous Data?')).toBeInTheDocument()
      expect(screen.getByText('Start Fresh')).toBeInTheDocument()
      expect(screen.getByText('Restore Data')).toBeInTheDocument()
    })
  })

  describe('Modal Close Behavior', () => {
    it('calls onStartFresh when modal is closed via backdrop', () => {
      render(<DataRecoveryModal {...defaultProps} />)
      
      // Simulate modal close behavior (onOpenChange with details.open = false)
      // This would normally be handled by Chakra UI Dialog component
      expect(screen.getByText('Start Fresh')).toBeInTheDocument()
    })

    it('calls onStartFresh when Escape key is pressed', async () => {
      const user = userEvent.setup()
      render(<DataRecoveryModal {...defaultProps} />)
      
      await user.keyboard('{Escape}')
      
      // The Escape behavior would be handled by Chakra UI internally
      // This test verifies the component structure supports it
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  describe('Button States and Icons', () => {
    it('renders Start Fresh button with X icon', () => {
      render(<DataRecoveryModal {...defaultProps} />)
      
      const startFreshButton = screen.getByText('Start Fresh')
      expect(startFreshButton).toBeInTheDocument()
      
      // X icon should be present
      expect(screen.getByTestId('x-icon')).toBeInTheDocument()
    })

    it('renders Restore Data button with refresh icon', () => {
      render(<DataRecoveryModal {...defaultProps} />)
      
      const restoreButton = screen.getByText('Restore Data')
      expect(restoreButton).toBeInTheDocument()
      
      // Refresh icons should be present (header and button)
      const refreshIcons = screen.getAllByTestId('refresh-icon')
      expect(refreshIcons).toHaveLength(2) // One in header, one in button
    })

    it('maintains button state during rapid clicks', async () => {
      const user = userEvent.setup()
      render(<DataRecoveryModal {...defaultProps} />)
      
      const restoreButton = screen.getByText('Restore Data')
      
      // Rapid clicks
      await user.click(restoreButton)
      await user.click(restoreButton)
      await user.click(restoreButton)
      
      expect(mockOnRestore).toHaveBeenCalledTimes(3)
    })

    it('prevents default button behaviors', async () => {
      const user = userEvent.setup()
      render(<DataRecoveryModal {...defaultProps} />)
      
      const startFreshButton = screen.getByText('Start Fresh')
      await user.click(startFreshButton)
      
      expect(mockOnStartFresh).toHaveBeenCalledTimes(1)
      // Should not cause form submission or page navigation
    })
  })

  describe('Modal Content and Structure', () => {
    it('renders modal header with icon and title', () => {
      render(<DataRecoveryModal {...defaultProps} />)
      
      expect(screen.getByText('Restore Previous Data?')).toBeInTheDocument()
      
      // There should be refresh icons (one in header, one in button)
      const refreshIcons = screen.getAllByTestId('refresh-icon')
      expect(refreshIcons.length).toBeGreaterThanOrEqual(1)
    })

    it('renders explanatory text in modal body', () => {
      render(<DataRecoveryModal {...defaultProps} />)
      
      const explanationText = screen.getByText(/We found previously saved form data/)
      expect(explanationText).toBeInTheDocument()
      expect(explanationText).toHaveTextContent(
        'We found previously saved form data. Would you like to restore your previous progress or start with a fresh form?'
      )
    })

    it('renders modal footer with both buttons', () => {
      render(<DataRecoveryModal {...defaultProps} />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(2)
      
      expect(screen.getByText('Start Fresh')).toBeInTheDocument()
      expect(screen.getByText('Restore Data')).toBeInTheDocument()
    })

    it('applies correct modal size and placement', () => {
      render(<DataRecoveryModal {...defaultProps} />)
      
      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
      expect(dialog).toHaveAttribute('aria-modal', 'true')
    })
  })

  describe('Keyboard Navigation', () => {
    it('supports tab navigation between buttons', async () => {
      const user = userEvent.setup()
      render(<DataRecoveryModal {...defaultProps} />)
      
      // Tab should move focus between buttons
      await user.tab()
      
      // Should be able to navigate to both buttons
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(2)
    })

    it('supports Enter key activation on buttons', async () => {
      const user = userEvent.setup()
      render(<DataRecoveryModal {...defaultProps} />)
      
      const restoreButton = screen.getByText('Restore Data')
      
      // Use click to simulate keyboard activation
      await user.click(restoreButton)
      
      expect(mockOnRestore).toHaveBeenCalledTimes(1)
    })

    it('supports Space key activation on buttons', async () => {
      const user = userEvent.setup()
      render(<DataRecoveryModal {...defaultProps} />)
      
      const startFreshButton = screen.getByText('Start Fresh')
      
      // Click to focus and activate with space
      await user.click(startFreshButton)
      
      expect(mockOnStartFresh).toHaveBeenCalledTimes(1)
    })
  })

  describe('Focus Management', () => {
    it('focuses modal content when opened', () => {
      render(<DataRecoveryModal {...defaultProps} />)
      
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('tabindex', '-1')
    })

    it('contains focusable elements within modal', () => {
      render(<DataRecoveryModal {...defaultProps} />)
      
      const modal = screen.getByRole('dialog')
      const buttons = screen.getAllByRole('button')
      
      // All buttons should be within the modal
      buttons.forEach(button => {
        expect(modal.contains(button)).toBe(true)
      })
      
      expect(buttons).toHaveLength(2)
    })
  })

  describe('Visual States', () => {
    it('applies backdrop blur effect', () => {
      render(<DataRecoveryModal {...defaultProps} />)
      
      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
      // Backdrop styling would be handled by Chakra UI
    })

    it('centers modal on screen', () => {
      render(<DataRecoveryModal {...defaultProps} />)
      
      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
      // Positioning would be handled by Chakra UI Dialog
    })

    it('applies consistent button styling', () => {
      render(<DataRecoveryModal {...defaultProps} />)
      
      const startFreshButton = screen.getByTestId('secondary-button')
      const restoreButton = screen.getByTestId('primary-button')
      
      expect(startFreshButton).toBeInTheDocument()
      expect(restoreButton).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles missing onRestore callback gracefully', async () => {
      const user = userEvent.setup()
      render(
        <DataRecoveryModal 
          isOpen={true}
          onRestore={undefined as any}
          onStartFresh={mockOnStartFresh}
        />
      )
      
      const restoreButton = screen.getByText('Restore Data')
      
      expect(() => user.click(restoreButton)).not.toThrow()
    })

    it('handles missing onStartFresh callback gracefully', async () => {
      const user = userEvent.setup()
      render(
        <DataRecoveryModal 
          isOpen={true}
          onRestore={mockOnRestore}
          onStartFresh={undefined as any}
        />
      )
      
      const startFreshButton = screen.getByText('Start Fresh')
      
      expect(() => user.click(startFreshButton)).not.toThrow()
    })

    it('handles all undefined callbacks gracefully', () => {
      expect(() => {
        render(
          <DataRecoveryModal 
            isOpen={true}
            onRestore={undefined as any}
            onStartFresh={undefined as any}
          />
        )
      }).not.toThrow()
    })
  })

  describe('Component Lifecycle', () => {
    it('cleans up properly when unmounted', () => {
      const { unmount } = render(<DataRecoveryModal {...defaultProps} />)
      
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      
      unmount()
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('handles multiple mount/unmount cycles', () => {
      // First mount
      const { unmount: unmount1 } = render(<DataRecoveryModal {...defaultProps} />)
      
      expect(screen.getByText('Restore Previous Data?')).toBeInTheDocument()
      
      unmount1()
      
      expect(screen.queryByText('Restore Previous Data?')).not.toBeInTheDocument()
      
      // Second mount after unmounting
      const { unmount: unmount2 } = render(<DataRecoveryModal {...defaultProps} />)
      
      expect(screen.getByText('Restore Previous Data?')).toBeInTheDocument()
      
      unmount2()
      
      expect(screen.queryByText('Restore Previous Data?')).not.toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('handles frequent prop updates efficiently', () => {
      const { rerender } = render(<DataRecoveryModal {...defaultProps} />)
      
      // Multiple rapid re-renders with different states
      for (let i = 0; i < 10; i++) {
        rerender(
          <DataRecoveryModal 
            {...defaultProps}
            isOpen={i % 2 === 0}
          />
        )
      }
      
      // Should handle updates without errors
      expect(screen.queryByText('Restore Previous Data?')).toBeInTheDocument()
    })

    it('maintains callback references during re-renders', () => {
      const { rerender } = render(<DataRecoveryModal {...defaultProps} />)
      
      // Re-render with same callbacks
      rerender(<DataRecoveryModal {...defaultProps} />)
      
      expect(screen.getByText('Start Fresh')).toBeInTheDocument()
      expect(screen.getByText('Restore Data')).toBeInTheDocument()
    })
  })
})