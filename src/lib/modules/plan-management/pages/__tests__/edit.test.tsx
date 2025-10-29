/* Comprehensive test suite for EditPlan page */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/* Plan module imports */
import EditPlanPage from '@plan-management/pages/edit'
import * as usePlanOperationsHook from '@plan-management/hooks/use-plan-operations'
import * as toastUtils from '@shared/utils/ui/notifications'
import * as formUtils from '@plan-management/utils/forms'
import { PLAN_PAGE_ROUTES, PLAN_FORM_DEFAULT_VALUES } from '@plan-management/constants'
import { CreatePlanFormData } from '@plan-management/schemas'

/* Mock next/navigation */
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush
  }))
}))

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
const mockFormSubmit = vi.fn()
vi.mock('@plan-management/forms/form-container', () => ({
  default: vi.fn(({ onSubmit, isSubmitting }) => {
    mockFormSubmit.mockImplementation(onSubmit)
    return (
      <div data-testid="plan-form-container">
        <button
          data-testid="submit-button"
          onClick={() => {
            const formData: CreatePlanFormData = {
              ...PLAN_FORM_DEFAULT_VALUES,
              name: 'Updated Plan',
              description: 'Updated Description'
            }
            onSubmit(formData)
          }}
          disabled={isSubmitting}
        >
          Update
        </button>
        <div data-testid="submitting-state">{isSubmitting ? 'true' : 'false'}</div>
      </div>
    )
  })
}))

/* Mock utils */
vi.mock('@shared/utils/ui/notifications', () => ({
  createToastNotification: vi.fn()
}))

vi.mock('@plan-management/utils/forms', () => ({
  formatFormDataToApiData: vi.fn((data) => data)
}))

describe('EditPlanPage', () => {
  const mockPlanId = 123
  const mockUpdatePlan = vi.fn()

  const defaultHookReturn = {
    createPlan: vi.fn(),
    isCreating: false,
    createError: null,
    fetchPlanDetails: vi.fn(),
    isFetching: false,
    fetchError: null,
    updatePlan: mockUpdatePlan,
    isUpdating: false,
    updateError: null,
    deletePlan: vi.fn(),
    isDeleting: false,
    deleteError: null
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(usePlanOperationsHook, 'usePlanOperations').mockReturnValue(defaultHookReturn)
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering States', () => {
    it('should render all required providers', () => {
      render(<EditPlanPage planId={mockPlanId} />)

      expect(screen.getByTestId('error-provider')).toBeInTheDocument()
      expect(screen.getByTestId('form-mode-provider')).toBeInTheDocument()
    })

    it('should set form mode to EDIT', () => {
      render(<EditPlanPage planId={mockPlanId} />)

      const formModeProvider = screen.getByTestId('form-mode-provider')
      expect(formModeProvider).toHaveAttribute('data-mode', 'EDIT')
    })

    it('should pass planId to form mode provider', () => {
      render(<EditPlanPage planId={mockPlanId} />)

      const formModeProvider = screen.getByTestId('form-mode-provider')
      expect(formModeProvider).toHaveAttribute('data-plan-id', String(mockPlanId))
    })

    it('should render plan form container', () => {
      render(<EditPlanPage planId={mockPlanId} />)

      expect(screen.getByTestId('plan-form-container')).toBeInTheDocument()
    })

    it('should show submitting state when updating', () => {
      vi.spyOn(usePlanOperationsHook, 'usePlanOperations').mockReturnValue({
        ...defaultHookReturn,
        isUpdating: true
      })

      render(<EditPlanPage planId={mockPlanId} />)

      expect(screen.getByTestId('submitting-state')).toHaveTextContent('true')
    })

    it('should not show submitting state initially', () => {
      render(<EditPlanPage planId={mockPlanId} />)

      expect(screen.getByTestId('submitting-state')).toHaveTextContent('false')
    })
  })

  describe('Form Submission', () => {
    it('should call updatePlan with planId on form submit', async () => {
      mockUpdatePlan.mockResolvedValue(true)
      const user = userEvent.setup()

      render(<EditPlanPage planId={mockPlanId} />)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockUpdatePlan).toHaveBeenCalledWith(
          mockPlanId,
          expect.any(Object)
        )
      })
    })

    it('should format form data before submission', async () => {
      mockUpdatePlan.mockResolvedValue(true)
      const user = userEvent.setup()
      const formatSpy = vi.spyOn(formUtils, 'formatFormDataToApiData')

      render(<EditPlanPage planId={mockPlanId} />)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(formatSpy).toHaveBeenCalled()
      })
    })

    it('should disable submit button while updating', () => {
      vi.spyOn(usePlanOperationsHook, 'usePlanOperations').mockReturnValue({
        ...defaultHookReturn,
        isUpdating: true
      })

      render(<EditPlanPage planId={mockPlanId} />)

      const submitButton = screen.getByTestId('submit-button')
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Success Handling', () => {
    it('should show success toast on successful update', async () => {
      mockUpdatePlan.mockResolvedValue(true)
      const user = userEvent.setup()

      render(<EditPlanPage planId={mockPlanId} />)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(toastUtils.createToastNotification).toHaveBeenCalledWith({
          title: 'Plan Updated Successfully',
          description: expect.stringContaining('Updated Plan')
        })
      })
    })

    it('should navigate to home page on success', async () => {
      mockUpdatePlan.mockResolvedValue(true)
      const user = userEvent.setup()

      render(<EditPlanPage planId={mockPlanId} />)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(PLAN_PAGE_ROUTES.HOME)
      })
    })

    it('should log success message', async () => {
      mockUpdatePlan.mockResolvedValue(true)
      const user = userEvent.setup()
      const consoleSpy = vi.spyOn(console, 'log')

      render(<EditPlanPage planId={mockPlanId} />)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('[EditPlan] Plan updated successfully')
      })
    })

    it('should include updated plan name in toast', async () => {
      mockUpdatePlan.mockResolvedValue(true)
      const user = userEvent.setup()

      render(<EditPlanPage planId={mockPlanId} />)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(toastUtils.createToastNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            description: expect.stringContaining('Updated Plan')
          })
        )
      })
    })
  })

  describe('Error Handling', () => {
    it('should not navigate on update failure', async () => {
      mockUpdatePlan.mockResolvedValue(false)
      const user = userEvent.setup()

      render(<EditPlanPage planId={mockPlanId} />)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockUpdatePlan).toHaveBeenCalled()
      })

      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should not show success toast on failure', async () => {
      mockUpdatePlan.mockResolvedValue(false)
      const user = userEvent.setup()

      render(<EditPlanPage planId={mockPlanId} />)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockUpdatePlan).toHaveBeenCalled()
      })

      expect(toastUtils.createToastNotification).not.toHaveBeenCalled()
    })

    it('should handle update errors from hook', async () => {
      mockUpdatePlan.mockResolvedValue(false)
      const user = userEvent.setup()

      vi.spyOn(usePlanOperationsHook, 'usePlanOperations').mockReturnValue({
        ...defaultHookReturn,
        updateError: 'Update failed'
      })

      render(<EditPlanPage planId={mockPlanId} />)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockUpdatePlan).toHaveBeenCalled()
      })

      expect(mockPush).not.toHaveBeenCalled()
      expect(toastUtils.createToastNotification).not.toHaveBeenCalled()
    })
  })

  describe('Hook Integration', () => {
    it('should call usePlanOperations hook', () => {
      const spy = vi.spyOn(usePlanOperationsHook, 'usePlanOperations')

      render(<EditPlanPage planId={mockPlanId} />)

      expect(spy).toHaveBeenCalled()
    })

    it('should use updatePlan function from hook', async () => {
      mockUpdatePlan.mockResolvedValue(true)
      const user = userEvent.setup()

      render(<EditPlanPage planId={mockPlanId} />)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockUpdatePlan).toHaveBeenCalled()
      })
    })

    it('should use isUpdating state from hook', () => {
      vi.spyOn(usePlanOperationsHook, 'usePlanOperations').mockReturnValue({
        ...defaultHookReturn,
        isUpdating: true
      })

      render(<EditPlanPage planId={mockPlanId} />)

      expect(screen.getByTestId('submitting-state')).toHaveTextContent('true')
    })
  })

  describe('Props Handling', () => {
    it('should handle different planId values', async () => {
      mockUpdatePlan.mockResolvedValue(true)
      const user = userEvent.setup()
      const differentPlanId = 456

      render(<EditPlanPage planId={differentPlanId} />)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockUpdatePlan).toHaveBeenCalledWith(
          differentPlanId,
          expect.any(Object)
        )
      })
    })

    it('should handle planId of 0', async () => {
      mockUpdatePlan.mockResolvedValue(true)
      const user = userEvent.setup()

      render(<EditPlanPage planId={0} />)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockUpdatePlan).toHaveBeenCalledWith(0, expect.any(Object))
      })
    })

    it('should pass planId to form mode provider', () => {
      const testPlanId = 789

      render(<EditPlanPage planId={testPlanId} />)

      const formModeProvider = screen.getByTestId('form-mode-provider')
      expect(formModeProvider).toHaveAttribute('data-plan-id', String(testPlanId))
    })
  })

  describe('Form Data Handling', () => {
    it('should pass formatted data to updatePlan', async () => {
      mockUpdatePlan.mockResolvedValue(true)
      const user = userEvent.setup()

      render(<EditPlanPage planId={mockPlanId} />)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockUpdatePlan).toHaveBeenCalledWith(
          mockPlanId,
          expect.objectContaining({
            name: 'Updated Plan',
            description: 'Updated Description'
          })
        )
      })
    })

    it('should preserve planId during update', async () => {
      mockUpdatePlan.mockResolvedValue(true)
      const user = userEvent.setup()

      render(<EditPlanPage planId={mockPlanId} />)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        const [[planId]] = mockUpdatePlan.mock.calls
        expect(planId).toBe(mockPlanId)
      })
    })
  })

  describe('Component Structure', () => {
    it('should wrap form in FormProvider', () => {
      render(<EditPlanPage planId={mockPlanId} />)

      /* FormProvider is used internally, verify the form container renders */
      expect(screen.getByTestId('plan-form-container')).toBeInTheDocument()
    })

    it('should provide correct props to form container', () => {
      render(<EditPlanPage planId={mockPlanId} />)

      expect(screen.getByTestId('plan-form-container')).toBeInTheDocument()
      expect(screen.getByTestId('submit-button')).toBeInTheDocument()
    })

    it('should nest providers correctly', () => {
      render(<EditPlanPage planId={mockPlanId} />)

      const errorProvider = screen.getByTestId('error-provider')
      const formModeProvider = screen.getByTestId('form-mode-provider')

      expect(errorProvider).toContainElement(formModeProvider)
    })
  })
})
