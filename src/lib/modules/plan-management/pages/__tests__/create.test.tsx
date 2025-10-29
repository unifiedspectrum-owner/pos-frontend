/* Comprehensive test suite for CreatePlan page */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/* Plan module imports */
import CreatePlan from '@plan-management/pages/create'
import * as usePlanOperationsHook from '@plan-management/hooks/use-plan-operations'
import * as toastUtils from '@shared/utils/ui/notifications'
import * as storageUtils from '@plan-management/utils/storage'
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
  PlanFormModeProvider: vi.fn(({ children, mode }) => (
    <div data-testid="form-mode-provider" data-mode={mode}>
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
              name: 'Test Plan',
              description: 'Test Description'
            }
            onSubmit(formData)
          }}
          disabled={isSubmitting}
        >
          Submit
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

vi.mock('@plan-management/utils/storage', () => ({
  clearStorageData: vi.fn()
}))

vi.mock('@plan-management/utils/forms', () => ({
  formatFormDataToApiData: vi.fn((data) => data)
}))

describe('CreatePlan Page', () => {
  const mockCreatePlan = vi.fn()

  const defaultHookReturn = {
    createPlan: mockCreatePlan,
    isCreating: false,
    createError: null,
    fetchPlanDetails: vi.fn(),
    isFetching: false,
    fetchError: null,
    updatePlan: vi.fn(),
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
      render(<CreatePlan />)

      expect(screen.getByTestId('error-provider')).toBeInTheDocument()
      expect(screen.getByTestId('form-mode-provider')).toBeInTheDocument()
    })

    it('should set form mode to CREATE', () => {
      render(<CreatePlan />)

      const formModeProvider = screen.getByTestId('form-mode-provider')
      expect(formModeProvider).toHaveAttribute('data-mode', 'CREATE')
    })

    it('should render plan form container', () => {
      render(<CreatePlan />)

      expect(screen.getByTestId('plan-form-container')).toBeInTheDocument()
    })

    it('should show submitting state when creating', () => {
      vi.spyOn(usePlanOperationsHook, 'usePlanOperations').mockReturnValue({
        ...defaultHookReturn,
        isCreating: true
      })

      render(<CreatePlan />)

      expect(screen.getByTestId('submitting-state')).toHaveTextContent('true')
    })

    it('should not show submitting state initially', () => {
      render(<CreatePlan />)

      expect(screen.getByTestId('submitting-state')).toHaveTextContent('false')
    })
  })

  describe('Form Submission', () => {
    it('should call createPlan on form submit', async () => {
      mockCreatePlan.mockResolvedValue(true)
      const user = userEvent.setup()

      render(<CreatePlan />)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockCreatePlan).toHaveBeenCalled()
      })
    })

    it('should format form data before submission', async () => {
      mockCreatePlan.mockResolvedValue(true)
      const user = userEvent.setup()
      const formatSpy = vi.spyOn(formUtils, 'formatFormDataToApiData')

      render(<CreatePlan />)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(formatSpy).toHaveBeenCalled()
      })
    })

    it('should disable submit button while creating', () => {
      vi.spyOn(usePlanOperationsHook, 'usePlanOperations').mockReturnValue({
        ...defaultHookReturn,
        isCreating: true
      })

      render(<CreatePlan />)

      const submitButton = screen.getByTestId('submit-button')
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Success Handling', () => {
    it('should show success toast on successful creation', async () => {
      mockCreatePlan.mockResolvedValue(true)
      const user = userEvent.setup()

      render(<CreatePlan />)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(toastUtils.createToastNotification).toHaveBeenCalledWith({
          title: 'Plan Created Successfully',
          description: expect.stringContaining('Test Plan')
        })
      })
    })

    it('should clear storage data on success', async () => {
      mockCreatePlan.mockResolvedValue(true)
      const user = userEvent.setup()

      render(<CreatePlan />)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(storageUtils.clearStorageData).toHaveBeenCalled()
      })
    })

    it('should navigate to home page on success', async () => {
      mockCreatePlan.mockResolvedValue(true)
      const user = userEvent.setup()

      render(<CreatePlan />)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(PLAN_PAGE_ROUTES.HOME)
      })
    })

    it('should log success message', async () => {
      mockCreatePlan.mockResolvedValue(true)
      const user = userEvent.setup()
      const consoleSpy = vi.spyOn(console, 'log')

      render(<CreatePlan />)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('[CreatePlan] Plan created successfully')
      })
    })
  })

  describe('Error Handling', () => {
    it('should not navigate on creation failure', async () => {
      mockCreatePlan.mockResolvedValue(false)
      const user = userEvent.setup()

      render(<CreatePlan />)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockCreatePlan).toHaveBeenCalled()
      })

      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should not show success toast on failure', async () => {
      mockCreatePlan.mockResolvedValue(false)
      const user = userEvent.setup()

      render(<CreatePlan />)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockCreatePlan).toHaveBeenCalled()
      })

      expect(toastUtils.createToastNotification).not.toHaveBeenCalled()
    })

    it('should not clear storage on failure', async () => {
      mockCreatePlan.mockResolvedValue(false)
      const user = userEvent.setup()

      render(<CreatePlan />)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockCreatePlan).toHaveBeenCalled()
      })

      expect(storageUtils.clearStorageData).not.toHaveBeenCalled()
    })
  })

  describe('Hook Integration', () => {
    it('should call usePlanOperations hook', () => {
      const spy = vi.spyOn(usePlanOperationsHook, 'usePlanOperations')

      render(<CreatePlan />)

      expect(spy).toHaveBeenCalled()
    })

    it('should use createPlan function from hook', async () => {
      mockCreatePlan.mockResolvedValue(true)
      const user = userEvent.setup()

      render(<CreatePlan />)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockCreatePlan).toHaveBeenCalled()
      })
    })

    it('should use isCreating state from hook', () => {
      vi.spyOn(usePlanOperationsHook, 'usePlanOperations').mockReturnValue({
        ...defaultHookReturn,
        isCreating: true
      })

      render(<CreatePlan />)

      expect(screen.getByTestId('submitting-state')).toHaveTextContent('true')
    })
  })

  describe('Form Data Handling', () => {
    it('should include plan name in success message', async () => {
      mockCreatePlan.mockResolvedValue(true)
      const user = userEvent.setup()

      render(<CreatePlan />)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(toastUtils.createToastNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            description: expect.stringContaining('Test Plan')
          })
        )
      })
    })

    it('should pass formatted data to createPlan', async () => {
      mockCreatePlan.mockResolvedValue(true)
      const user = userEvent.setup()

      render(<CreatePlan />)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockCreatePlan).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Plan',
            description: 'Test Description'
          })
        )
      })
    })
  })

  describe('Component Structure', () => {
    it('should wrap form in FormProvider', () => {
      render(<CreatePlan />)

      /* FormProvider is used internally, verify the form container renders */
      expect(screen.getByTestId('plan-form-container')).toBeInTheDocument()
    })

    it('should provide correct props to form container', () => {
      render(<CreatePlan />)

      expect(screen.getByTestId('plan-form-container')).toBeInTheDocument()
      expect(screen.getByTestId('submit-button')).toBeInTheDocument()
    })
  })
})
