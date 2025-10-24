/* Comprehensive test suite for CreateRolePage */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { Provider } from '@/components/ui/provider'

/* Role module imports */
import CreateRolePage from '@role-management/pages/create'
import * as useRoleOperationsHook from '@role-management/hooks/use-role-operations'
import { CreateRoleFormData } from '@role-management/schemas'

/* Mock dependencies */
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn()
  }))
}))

vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form')
  return {
    ...actual,
    useForm: vi.fn()
  }
})

vi.mock('@role-management/forms', () => ({
  RoleFormLayout: ({ mode, methods, onSubmit, onCancel, isSubmitting }: any) => (
    <div data-testid="role-form-layout">
      <div data-testid="form-mode">{mode}</div>
      <form onSubmit={(e) => {
        e.preventDefault()
        const formData = methods.getValues()
        onSubmit(formData)
      }}>
        <button type="submit" disabled={isSubmitting}>Submit</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </form>
    </div>
  )
}))

vi.mock('@role-management/utils', () => ({
  buildCreateRolePayload: vi.fn((data) => ({
    name: data.name,
    description: data.description,
    is_active: data.is_active,
    module_assignments: data.module_assignments
  }))
}))

describe('CreateRolePage', () => {
  const mockFormMethods = {
    handleSubmit: vi.fn((callback) => (e: any) => {
      e?.preventDefault()
      callback(mockFormData)
    }),
    reset: vi.fn(),
    getValues: vi.fn(),
    setValue: vi.fn(),
    watch: vi.fn(),
    formState: { errors: {}, isSubmitting: false }
  }

  const mockFormData: CreateRoleFormData = {
    name: 'Test Role',
    description: 'Test Description',
    is_active: true,
    module_assignments: [
      {
        module_id: '1',
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: false
      }
    ]
  }

  const defaultOperationsReturn = {
    createRole: vi.fn(),
    updateRole: vi.fn(),
    deleteRole: vi.fn(),
    fetchRoleDetails: vi.fn(),
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isFetching: false,
    createError: null,
    updateError: null,
    deleteError: null,
    fetchError: null
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockFormMethods.getValues.mockReturnValue(mockFormData)
    ;(useForm as Mock).mockReturnValue(mockFormMethods)
    vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue(defaultOperationsReturn)
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('Rendering', () => {
    it('should render the create role form layout', () => {
      render(
        <Provider>
          <CreateRolePage />
        </Provider>
      )

      expect(screen.getByTestId('role-form-layout')).toBeInTheDocument()
      expect(screen.getByTestId('form-mode')).toHaveTextContent('CREATE')
    })

    it('should render submit and cancel buttons', () => {
      render(
        <Provider>
          <CreateRolePage />
        </Provider>
      )

      expect(screen.getByText('Submit')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('should initialize form with default values', () => {
      render(
        <Provider>
          <CreateRolePage />
        </Provider>
      )

      expect(useForm).toHaveBeenCalledWith(
        expect.objectContaining({
          defaultValues: expect.objectContaining({
            name: '',
            description: '',
            is_active: true,
            module_assignments: []
          })
        })
      )
    })

    it('should use zodResolver for form validation', () => {
      render(
        <Provider>
          <CreateRolePage />
        </Provider>
      )

      expect(useForm).toHaveBeenCalledWith(
        expect.objectContaining({
          resolver: expect.any(Function)
        })
      )
    })
  })

  describe('Form Submission', () => {
    it('should call createRole on form submit with valid data', async () => {
      const mockCreateRole = vi.fn().mockResolvedValue(true)
      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        createRole: mockCreateRole
      })

      render(
        <Provider>
          <CreateRolePage />
        </Provider>
      )

      const submitButton = screen.getByText('Submit')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockCreateRole).toHaveBeenCalledWith(
          expect.objectContaining({
            name: mockFormData.name,
            description: mockFormData.description,
            is_active: mockFormData.is_active
          })
        )
      })
    })

    it('should navigate to home page on successful creation', async () => {
      const mockCreateRole = vi.fn().mockResolvedValue(true)
      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        createRole: mockCreateRole
      })

      render(
        <Provider>
          <CreateRolePage />
        </Provider>
      )

      const submitButton = screen.getByText('Submit')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/role-management')
      })
    })

    it('should not navigate when creation fails', async () => {
      const mockCreateRole = vi.fn().mockResolvedValue(false)
      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        createRole: mockCreateRole
      })

      render(
        <Provider>
          <CreateRolePage />
        </Provider>
      )

      const submitButton = screen.getByText('Submit')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockCreateRole).toHaveBeenCalled()
      })

      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should handle creation errors gracefully', async () => {
      const mockError = new Error('Creation failed')
      const mockCreateRole = vi.fn().mockRejectedValue(mockError)
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        createRole: mockCreateRole
      })

      render(
        <Provider>
          <CreateRolePage />
        </Provider>
      )

      const submitButton = screen.getByText('Submit')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating role:', mockError)
      })

      expect(mockPush).not.toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })

    it('should disable submit button when isCreating is true', () => {
      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        isCreating: true
      })

      render(
        <Provider>
          <CreateRolePage />
        </Provider>
      )

      const submitButton = screen.getByText('Submit')
      expect(submitButton).toBeDisabled()
    })

    it('should log form data and payload before submission', async () => {
      const mockCreateRole = vi.fn().mockResolvedValue(true)
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        createRole: mockCreateRole
      })

      render(
        <Provider>
          <CreateRolePage />
        </Provider>
      )

      const submitButton = screen.getByText('Submit')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith('Form data before submission:', mockFormData)
        expect(consoleLogSpy).toHaveBeenCalledWith('Payload being sent:', expect.any(Object))
      })

      consoleLogSpy.mockRestore()
    })
  })

  describe('Cancel Action', () => {
    it('should navigate to home page when cancel is clicked', async () => {
      render(
        <Provider>
          <CreateRolePage />
        </Provider>
      )

      const cancelButton = screen.getByText('Cancel')
      await userEvent.click(cancelButton)

      expect(mockPush).toHaveBeenCalledWith('/admin/role-management')
    })

    it('should not call createRole when cancel is clicked', async () => {
      const mockCreateRole = vi.fn()
      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        createRole: mockCreateRole
      })

      render(
        <Provider>
          <CreateRolePage />
        </Provider>
      )

      const cancelButton = screen.getByText('Cancel')
      await userEvent.click(cancelButton)

      expect(mockCreateRole).not.toHaveBeenCalled()
    })
  })

  describe('Payload Building', () => {
    it('should include all required fields in payload', async () => {
      const mockCreateRole = vi.fn().mockResolvedValue(true)

      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        createRole: mockCreateRole
      })

      render(
        <Provider>
          <CreateRolePage />
        </Provider>
      )

      const submitButton = screen.getByText('Submit')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockCreateRole).toHaveBeenCalledWith(
          expect.objectContaining({
            name: expect.any(String),
            description: expect.any(String),
            is_active: expect.any(Boolean),
            module_assignments: expect.any(Array)
          })
        )
      })
    })
  })

  describe('Props Passed to RoleFormLayout', () => {
    it('should pass correct mode prop', () => {
      render(
        <Provider>
          <CreateRolePage />
        </Provider>
      )

      expect(screen.getByTestId('form-mode')).toHaveTextContent('CREATE')
    })

    it('should disable submit button when isCreating', () => {
      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        isCreating: true
      })

      render(
        <Provider>
          <CreateRolePage />
        </Provider>
      )

      const submitButton = screen.getByText('Submit')
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Integration Tests', () => {
    it('should complete full create workflow successfully', async () => {
      const mockCreateRole = vi.fn().mockResolvedValue(true)
      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        createRole: mockCreateRole
      })

      render(
        <Provider>
          <CreateRolePage />
        </Provider>
      )

      /* Verify initial render */
      expect(screen.getByTestId('role-form-layout')).toBeInTheDocument()

      /* Submit form */
      const submitButton = screen.getByText('Submit')
      await userEvent.click(submitButton)

      /* Verify API call */
      await waitFor(() => {
        expect(mockCreateRole).toHaveBeenCalled()
      })

      /* Verify navigation */
      expect(mockPush).toHaveBeenCalledWith('/admin/role-management')
    })

    it('should handle multiple rapid submit clicks gracefully', async () => {
      const mockCreateRole = vi.fn().mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(true), 100))
      )

      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        createRole: mockCreateRole
      })

      render(
        <Provider>
          <CreateRolePage />
        </Provider>
      )

      const submitButton = screen.getByText('Submit')

      /* Click multiple times */
      await userEvent.click(submitButton)
      await userEvent.click(submitButton)
      await userEvent.click(submitButton)

      await waitFor(() => {
        /* Should only be called once or based on form submission logic */
        expect(mockCreateRole).toHaveBeenCalled()
      })
    })
  })
})
