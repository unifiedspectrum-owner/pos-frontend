/* Comprehensive test suite for EditRolePage */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { Provider } from '@/components/ui/provider'

/* Role module imports */
import EditRolePage from '@role-management/pages/edit'
import * as useRoleOperationsHook from '@role-management/hooks/use-role-operations'
import { CreateRoleFormData } from '@role-management/schemas'
import { Role, RolePermission } from '@role-management/types'

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
  RoleFormLayout: ({ mode, methods, onSubmit, onCancel, isSubmitting, isLoading, error, onRetry }: any) => (
    <div data-testid="role-form-layout">
      <div data-testid="form-mode">{mode}</div>
      {isLoading && <div data-testid="loading">Loading...</div>}
      {error && (
        <div data-testid="error-container">
          <div data-testid="error-message">{error}</div>
          <button onClick={onRetry}>Retry</button>
        </div>
      )}
      {!isLoading && !error && (
        <form onSubmit={(e) => {
          e.preventDefault()
          const formData = methods.getValues()
          onSubmit(formData)
        }}>
          <button type="submit" disabled={isSubmitting}>Update</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </form>
      )}
    </div>
  )
}))

vi.mock('@role-management/utils', () => ({
  buildUpdateRolePayload: vi.fn((data) => ({
    name: data.name,
    description: data.description,
    is_active: data.is_active,
    module_assignments: data.module_assignments
  })),
  getChangedFields: vi.fn((current, original) => {
    if (!original) return current
    const changed: any = {}
    if (current.name !== original.name) changed.name = current.name
    if (current.description !== original.description) changed.description = current.description
    if (current.is_active !== original.is_active) changed.is_active = current.is_active
    return Object.keys(changed).length > 0 ? changed : null
  })
}))

vi.mock('@shared/utils/ui/notifications', () => ({
  createToastNotification: vi.fn()
}))

describe('EditRolePage', () => {
  const mockRoleId = '123'

  const mockRole: Role = {
    id: 123,
    name: 'Test Role',
    description: 'Test Description',
    display_order: 1,
    user_count: 5,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z'
  }

  const mockPermissions: RolePermission[] = [
    {
      id: 1,
      role_id: 123,
      module_id: 1,
      can_create: true,
      can_read: true,
      can_update: true,
      can_delete: false,
      display_order: 1
    }
  ]

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

  const defaultOperationsReturn = {
    createRole: vi.fn(),
    updateRole: vi.fn(),
    deleteRole: vi.fn(),
    fetchRoleDetails: vi.fn().mockResolvedValue({ role: mockRole, permissions: mockPermissions }),
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
    it('should render the edit role form layout', () => {
      render(
        <Provider>
          <EditRolePage roleId={mockRoleId} />
        </Provider>
      )

      expect(screen.getByTestId('role-form-layout')).toBeInTheDocument()
      expect(screen.getByTestId('form-mode')).toHaveTextContent('EDIT')
    })

    it('should show loading state while fetching role details', async () => {
      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        isFetching: true
      })

      render(
        <Provider>
          <EditRolePage roleId={mockRoleId} />
        </Provider>
      )

      expect(screen.getByTestId('loading')).toBeInTheDocument()
    })

    it('should display error when fetch fails', async () => {
      const errorMessage = 'Failed to load role'
      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        fetchError: errorMessage,
        fetchRoleDetails: vi.fn().mockResolvedValue(null)
      })

      render(
        <Provider>
          <EditRolePage roleId={mockRoleId} />
        </Provider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('error-container')).toBeInTheDocument()
        expect(screen.getByTestId('error-message')).toHaveTextContent(errorMessage)
      })
    })

    it('should render form after successful data fetch', async () => {
      render(
        <Provider>
          <EditRolePage roleId={mockRoleId} />
        </Provider>
      )

      await waitFor(() => {
        expect(screen.getByText('Update')).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
      })
    })
  })

  describe('Data Loading', () => {
    it('should fetch role details on mount', async () => {
      const mockFetchRoleDetails = vi.fn().mockResolvedValue({ role: mockRole, permissions: mockPermissions })
      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        fetchRoleDetails: mockFetchRoleDetails
      })

      render(
        <Provider>
          <EditRolePage roleId={mockRoleId} />
        </Provider>
      )

      await waitFor(() => {
        expect(mockFetchRoleDetails).toHaveBeenCalledWith(mockRoleId)
      })
    })

    it('should show form after successful data fetch', async () => {
      render(
        <Provider>
          <EditRolePage roleId={mockRoleId} />
        </Provider>
      )

      await waitFor(() => {
        expect(screen.getByText('Update')).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
      })
    })

    it('should handle empty permissions array', async () => {
      const mockFetchRoleDetails = vi.fn().mockResolvedValue({ role: mockRole, permissions: [] })
      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        fetchRoleDetails: mockFetchRoleDetails
      })

      render(
        <Provider>
          <EditRolePage roleId={mockRoleId} />
        </Provider>
      )

      await waitFor(() => {
        expect(screen.getByText('Update')).toBeInTheDocument()
      })
    })

    it('should handle null permissions', async () => {
      const mockFetchRoleDetails = vi.fn().mockResolvedValue({ role: mockRole, permissions: null })
      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        fetchRoleDetails: mockFetchRoleDetails
      })

      render(
        <Provider>
          <EditRolePage roleId={mockRoleId} />
        </Provider>
      )

      await waitFor(() => {
        expect(screen.getByText('Update')).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('should call updateRole on form submission', async () => {
      const mockUpdateRole = vi.fn().mockResolvedValue(true)
      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        updateRole: mockUpdateRole
      })

      render(
        <Provider>
          <EditRolePage roleId={mockRoleId} />
        </Provider>
      )

      await waitFor(() => {
        expect(screen.getByText('Update')).toBeInTheDocument()
      })

      const updateButton = screen.getByText('Update')
      await userEvent.click(updateButton)

      await waitFor(() => {
        expect(mockUpdateRole).toHaveBeenCalled()
      })
    })

    it('should navigate to home page on successful update', async () => {
      const mockUpdateRole = vi.fn().mockResolvedValue(true)
      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        updateRole: mockUpdateRole
      })

      render(
        <Provider>
          <EditRolePage roleId={mockRoleId} />
        </Provider>
      )

      await waitFor(() => {
        expect(screen.getByText('Update')).toBeInTheDocument()
      })

      const updateButton = screen.getByText('Update')
      await userEvent.click(updateButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/role-management')
      })
    })

    it('should not navigate when update fails', async () => {
      const mockUpdateRole = vi.fn().mockResolvedValue(false)
      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        updateRole: mockUpdateRole
      })

      render(
        <Provider>
          <EditRolePage roleId={mockRoleId} />
        </Provider>
      )

      await waitFor(() => {
        expect(screen.getByText('Update')).toBeInTheDocument()
      })

      const updateButton = screen.getByText('Update')
      await userEvent.click(updateButton)

      await waitFor(() => {
        expect(mockUpdateRole).toHaveBeenCalled()
      })

      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should handle update errors gracefully', async () => {
      const mockError = new Error('Update failed')
      const mockUpdateRole = vi.fn().mockRejectedValue(mockError)
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        updateRole: mockUpdateRole
      })

      render(
        <Provider>
          <EditRolePage roleId={mockRoleId} />
        </Provider>
      )

      await waitFor(() => {
        expect(screen.getByText('Update')).toBeInTheDocument()
      })

      const updateButton = screen.getByText('Update')
      await userEvent.click(updateButton)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating role:', mockError)
      })

      consoleErrorSpy.mockRestore()
    })

    it('should disable submit button when isUpdating is true', async () => {
      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        isUpdating: true
      })

      render(
        <Provider>
          <EditRolePage roleId={mockRoleId} />
        </Provider>
      )

      await waitFor(() => {
        const updateButton = screen.getByText('Update')
        expect(updateButton).toBeDisabled()
      })
    })
  })

  describe('Cancel Action', () => {
    it('should navigate to home page when cancel is clicked', async () => {
      render(
        <Provider>
          <EditRolePage roleId={mockRoleId} />
        </Provider>
      )

      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument()
      })

      const cancelButton = screen.getByText('Cancel')
      await userEvent.click(cancelButton)

      expect(mockPush).toHaveBeenCalledWith('/admin/role-management')
    })

    it('should not call updateRole when cancel is clicked', async () => {
      const mockUpdateRole = vi.fn()
      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        updateRole: mockUpdateRole
      })

      render(
        <Provider>
          <EditRolePage roleId={mockRoleId} />
        </Provider>
      )

      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument()
      })

      const cancelButton = screen.getByText('Cancel')
      await userEvent.click(cancelButton)

      expect(mockUpdateRole).not.toHaveBeenCalled()
    })
  })

  describe('Retry Functionality', () => {
    it('should retry loading role details when retry is clicked', async () => {
      const mockFetchRoleDetails = vi.fn().mockResolvedValue(null)
      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        fetchError: 'Failed to load',
        fetchRoleDetails: mockFetchRoleDetails
      })

      render(
        <Provider>
          <EditRolePage roleId={mockRoleId} />
        </Provider>
      )

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument()
      })

      const retryButton = screen.getByText('Retry')
      await userEvent.click(retryButton)

      await waitFor(() => {
        expect(mockFetchRoleDetails).toHaveBeenCalledTimes(2)
      })
    })

    it('should call fetchRoleDetails again on retry', async () => {
      const mockFetchRoleDetails = vi.fn().mockResolvedValue(null)
      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        fetchError: 'Failed to load',
        fetchRoleDetails: mockFetchRoleDetails
      })

      render(
        <Provider>
          <EditRolePage roleId={mockRoleId} />
        </Provider>
      )

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument()
      })

      const initialCallCount = mockFetchRoleDetails.mock.calls.length

      const retryButton = screen.getByText('Retry')
      await userEvent.click(retryButton)

      await waitFor(() => {
        expect(mockFetchRoleDetails).toHaveBeenCalledTimes(initialCallCount + 1)
      })
    })
  })

  describe('Props Passed to RoleFormLayout', () => {
    it('should pass correct mode prop', async () => {
      render(
        <Provider>
          <EditRolePage roleId={mockRoleId} />
        </Provider>
      )

      expect(screen.getByTestId('form-mode')).toHaveTextContent('EDIT')
    })

    it('should show loading state when fetching', async () => {
      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        isFetching: true
      })

      render(
        <Provider>
          <EditRolePage roleId={mockRoleId} />
        </Provider>
      )

      expect(screen.getByTestId('loading')).toBeInTheDocument()
    })

    it('should show error after initial load complete', async () => {
      const errorMessage = 'Failed to load role'
      const mockFetchRoleDetails = vi.fn().mockResolvedValue(null)

      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        fetchError: errorMessage,
        fetchRoleDetails: mockFetchRoleDetails
      })

      render(
        <Provider>
          <EditRolePage roleId={mockRoleId} />
        </Provider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent(errorMessage)
      })
    })
  })

  describe('Integration Tests', () => {
    it('should load data and allow form submission', async () => {
      const mockUpdateRole = vi.fn().mockResolvedValue(true)
      const mockFetchRoleDetails = vi.fn().mockResolvedValue({ role: mockRole, permissions: mockPermissions })

      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        updateRole: mockUpdateRole,
        fetchRoleDetails: mockFetchRoleDetails
      })

      render(
        <Provider>
          <EditRolePage roleId={mockRoleId} />
        </Provider>
      )

      /* Wait for data to load */
      await waitFor(() => {
        expect(mockFetchRoleDetails).toHaveBeenCalled()
        expect(screen.getByText('Update')).toBeInTheDocument()
      })

      /* Verify form is ready */
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByTestId('form-mode')).toHaveTextContent('EDIT')
    })
  })
})
