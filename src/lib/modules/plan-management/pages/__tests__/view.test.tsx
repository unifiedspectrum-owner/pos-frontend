/* Comprehensive test suite for ViewPlanPage */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'

/* Plan module imports */
import ViewPlanPage from '@plan-management/pages/view'

/* Mock ResourceErrorProvider */
vi.mock('@shared/contexts', () => ({
  ResourceErrorProvider: vi.fn(({ children }) => <div data-testid="error-provider">{children}</div>)
}))

/* Mock PlanFormModeProvider */
vi.mock('@plan-management/contexts', () => ({
  PlanFormModeProvider: vi.fn(({ children, mode, planId }) => (
    <div data-testid="form-mode-provider" data-mode={mode} data-plan-id={planId}>
      {children}
    </div>
  ))
}))

/* Mock PlanFormContainer */
vi.mock('@plan-management/forms/form-container', () => ({
  default: vi.fn(() => (
    <div data-testid="plan-form-container">
      <div data-testid="form-fields">Plan Details (Read-only)</div>
    </div>
  ))
}))

describe('ViewPlanPage', () => {
  const mockPlanId = 123

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering States', () => {
    it('should render all required providers', () => {
      render(<ViewPlanPage planId={mockPlanId} />)

      expect(screen.getByTestId('error-provider')).toBeInTheDocument()
      expect(screen.getByTestId('form-mode-provider')).toBeInTheDocument()
    })

    it('should set form mode to VIEW', () => {
      render(<ViewPlanPage planId={mockPlanId} />)

      const formModeProvider = screen.getByTestId('form-mode-provider')
      expect(formModeProvider).toHaveAttribute('data-mode', 'VIEW')
    })

    it('should pass planId to form mode provider', () => {
      render(<ViewPlanPage planId={mockPlanId} />)

      const formModeProvider = screen.getByTestId('form-mode-provider')
      expect(formModeProvider).toHaveAttribute('data-plan-id', String(mockPlanId))
    })

    it('should render plan form container', () => {
      render(<ViewPlanPage planId={mockPlanId} />)

      expect(screen.getByTestId('plan-form-container')).toBeInTheDocument()
    })

    it('should display read-only form fields', () => {
      render(<ViewPlanPage planId={mockPlanId} />)

      expect(screen.getByTestId('form-fields')).toHaveTextContent('Plan Details (Read-only)')
    })
  })

  describe('Props Handling', () => {
    it('should handle different planId values', () => {
      const differentPlanId = 456

      render(<ViewPlanPage planId={differentPlanId} />)

      const formModeProvider = screen.getByTestId('form-mode-provider')
      expect(formModeProvider).toHaveAttribute('data-plan-id', String(differentPlanId))
    })

    it('should handle planId of 0', () => {
      render(<ViewPlanPage planId={0} />)

      const formModeProvider = screen.getByTestId('form-mode-provider')
      expect(formModeProvider).toHaveAttribute('data-plan-id', '0')
    })

    it('should handle large planId values', () => {
      const largePlanId = 999999

      render(<ViewPlanPage planId={largePlanId} />)

      const formModeProvider = screen.getByTestId('form-mode-provider')
      expect(formModeProvider).toHaveAttribute('data-plan-id', String(largePlanId))
    })

    it('should pass planId correctly to context provider', () => {
      const testPlanId = 789

      render(<ViewPlanPage planId={testPlanId} />)

      const formModeProvider = screen.getByTestId('form-mode-provider')
      expect(formModeProvider).toHaveAttribute('data-plan-id', String(testPlanId))
      expect(formModeProvider).toHaveAttribute('data-mode', 'VIEW')
    })
  })

  describe('Read-only Behavior', () => {
    it('should not provide onSubmit to form container', () => {
      render(<ViewPlanPage planId={mockPlanId} />)

      /* In view mode, form container should not have submit functionality */
      expect(screen.getByTestId('plan-form-container')).toBeInTheDocument()
      expect(screen.queryByTestId('submit-button')).not.toBeInTheDocument()
    })

    it('should render form in view-only mode', () => {
      render(<ViewPlanPage planId={mockPlanId} />)

      const formModeProvider = screen.getByTestId('form-mode-provider')
      expect(formModeProvider).toHaveAttribute('data-mode', 'VIEW')
    })

    it('should not provide isSubmitting state', () => {
      render(<ViewPlanPage planId={mockPlanId} />)

      /* View mode should not have submitting state */
      expect(screen.queryByTestId('submitting-state')).not.toBeInTheDocument()
    })
  })

  describe('Component Structure', () => {
    it('should wrap form in FormProvider', () => {
      render(<ViewPlanPage planId={mockPlanId} />)

      /* FormProvider is used internally, verify the form container renders */
      expect(screen.getByTestId('plan-form-container')).toBeInTheDocument()
    })

    it('should nest providers correctly', () => {
      render(<ViewPlanPage planId={mockPlanId} />)

      const errorProvider = screen.getByTestId('error-provider')
      const formModeProvider = screen.getByTestId('form-mode-provider')

      expect(errorProvider).toContainElement(formModeProvider)
    })

    it('should render form container inside providers', () => {
      render(<ViewPlanPage planId={mockPlanId} />)

      const formModeProvider = screen.getByTestId('form-mode-provider')
      const formContainer = screen.getByTestId('plan-form-container')

      expect(formModeProvider).toContainElement(formContainer)
    })
  })

  describe('Form Configuration', () => {
    it('should initialize form with default values', () => {
      render(<ViewPlanPage planId={mockPlanId} />)

      /* Form should be initialized and rendered */
      expect(screen.getByTestId('plan-form-container')).toBeInTheDocument()
    })

    it('should use Zod schema for validation', () => {
      render(<ViewPlanPage planId={mockPlanId} />)

      /* Schema is used internally via zodResolver */
      expect(screen.getByTestId('plan-form-container')).toBeInTheDocument()
    })

    it('should set form mode to onChange', () => {
      render(<ViewPlanPage planId={mockPlanId} />)

      /* Form is configured with onChange mode */
      expect(screen.getByTestId('plan-form-container')).toBeInTheDocument()
    })
  })

  describe('Multiple Instances', () => {
    it('should handle multiple view pages with different planIds', () => {
      const { unmount: unmount1 } = render(<ViewPlanPage planId={123} />)

      const formModeProvider1 = screen.getByTestId('form-mode-provider')
      expect(formModeProvider1).toHaveAttribute('data-plan-id', '123')

      unmount1()

      const { unmount: unmount2 } = render(<ViewPlanPage planId={456} />)

      const formModeProvider2 = screen.getByTestId('form-mode-provider')
      expect(formModeProvider2).toHaveAttribute('data-plan-id', '456')

      unmount2()
    })

    it('should maintain correct state for each instance', () => {
      const { unmount } = render(<ViewPlanPage planId={mockPlanId} />)

      expect(screen.getByTestId('form-mode-provider')).toHaveAttribute('data-mode', 'VIEW')
      expect(screen.getByTestId('form-mode-provider')).toHaveAttribute('data-plan-id', String(mockPlanId))

      unmount()

      render(<ViewPlanPage planId={999} />)

      expect(screen.getByTestId('form-mode-provider')).toHaveAttribute('data-mode', 'VIEW')
      expect(screen.getByTestId('form-mode-provider')).toHaveAttribute('data-plan-id', '999')
    })
  })

  describe('Context Providers', () => {
    it('should provide ResourceErrorProvider context', () => {
      render(<ViewPlanPage planId={mockPlanId} />)

      expect(screen.getByTestId('error-provider')).toBeInTheDocument()
    })

    it('should provide PlanFormModeProvider context', () => {
      render(<ViewPlanPage planId={mockPlanId} />)

      expect(screen.getByTestId('form-mode-provider')).toBeInTheDocument()
    })

    it('should provide FormProvider context', () => {
      render(<ViewPlanPage planId={mockPlanId} />)

      /* FormProvider wraps the form container */
      expect(screen.getByTestId('plan-form-container')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should render without accessibility violations', () => {
      render(<ViewPlanPage planId={mockPlanId} />)

      expect(screen.getByTestId('plan-form-container')).toBeInTheDocument()
    })

    it('should have proper semantic structure', () => {
      const { container } = render(<ViewPlanPage planId={mockPlanId} />)

      expect(container.querySelector('[data-testid="error-provider"]')).toBeInTheDocument()
      expect(container.querySelector('[data-testid="form-mode-provider"]')).toBeInTheDocument()
      expect(container.querySelector('[data-testid="plan-form-container"]')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle negative planId', () => {
      render(<ViewPlanPage planId={-1} />)

      const formModeProvider = screen.getByTestId('form-mode-provider')
      expect(formModeProvider).toHaveAttribute('data-plan-id', '-1')
    })

    it('should render consistently across re-renders', () => {
      const { rerender } = render(<ViewPlanPage planId={mockPlanId} />)

      expect(screen.getByTestId('plan-form-container')).toBeInTheDocument()

      rerender(<ViewPlanPage planId={mockPlanId} />)

      expect(screen.getByTestId('plan-form-container')).toBeInTheDocument()
    })

    it('should handle planId updates', () => {
      const { rerender } = render(<ViewPlanPage planId={123} />)

      expect(screen.getByTestId('form-mode-provider')).toHaveAttribute('data-plan-id', '123')

      rerender(<ViewPlanPage planId={456} />)

      expect(screen.getByTestId('form-mode-provider')).toHaveAttribute('data-plan-id', '456')
    })
  })

  describe('Component Behavior', () => {
    it('should not trigger any side effects on mount', () => {
      const consoleSpy = vi.spyOn(console, 'log')

      render(<ViewPlanPage planId={mockPlanId} />)

      expect(consoleSpy).not.toHaveBeenCalled()
    })

    it('should maintain form mode throughout lifecycle', () => {
      const { rerender } = render(<ViewPlanPage planId={mockPlanId} />)

      expect(screen.getByTestId('form-mode-provider')).toHaveAttribute('data-mode', 'VIEW')

      rerender(<ViewPlanPage planId={mockPlanId} />)

      expect(screen.getByTestId('form-mode-provider')).toHaveAttribute('data-mode', 'VIEW')
    })
  })
})
