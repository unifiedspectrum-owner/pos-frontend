/* Comprehensive test suite for ViewRolePage */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { Provider } from '@/components/ui/provider'

/* Role module imports */
import ViewRolePage from '@role-management/pages/view'
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
        <div data-testid="form-content">
          <div>Name: {methods.getValues?.()?.name}</div>
          <div>Description: {methods.getValues?.()?.description}</div>
          <button type="button" onClick={onCancel}>Back</button>
        </div>
      )}
    </div>
  )
}))

describe('ViewRolePage', () => {
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
    },
    {
      id: 2,
      role_id: 123,
      module_id: 2,
      can_create: false,
      can_read: true,
      can_update: false,
      can_delete: false,
      display_order: 2
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
      },
      {
        module_id: '2',
        can_create: false,
        can_read: true,
        can_update: false,
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
    it('should render the view role form layout', () => {
      render(
        <Provider>
          <ViewRolePage roleId={mockRoleId} />
        </Provider>
      )

      expect(screen.getByTestId('role-form-layout')).toBeInTheDocument()
      expect(screen.getByTestId('form-mode')).toHaveTextContent('VIEW')
    })

    it('should show loading state while fetching role details', async () => {
      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        isFetching: true
      })

      render(
        <Provider>
          <ViewRolePage roleId={mockRoleId} />
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
          <ViewRolePage roleId={mockRoleId} />
        </Provider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('error-container')).toBeInTheDocument()
        expect(screen.getByTestId('error-message')).toHaveTextContent(errorMessage)
      })
    })

    it('should render form content after successful data fetch', async () => {
      render(
        <Provider>
          <ViewRolePage roleId={mockRoleId} />
        </Provider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('form-content')).toBeInTheDocument()
        expect(screen.getByText('Back')).toBeInTheDocument()
      })
    })

    it('should display role data in readonly mode', async () => {
      render(
        <Provider>
          <ViewRolePage roleId={mockRoleId} />
        </Provider>
      )

      await waitFor(() => {
        expect(screen.getByText(/Test Role/)).toBeInTheDocument()
        expect(screen.getByText(/Test Description/)).toBeInTheDocument()
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
          <ViewRolePage roleId={mockRoleId} />
        </Provider>
      )

      await waitFor(() => {
        expect(mockFetchRoleDetails).toHaveBeenCalledWith(mockRoleId)
      })
    })

    it('should show form content after successful data fetch', async () => {
      render(
        <Provider>
          <ViewRolePage roleId={mockRoleId} />
        </Provider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('form-content')).toBeInTheDocument()
        expect(screen.getByText('Back')).toBeInTheDocument()
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
          <ViewRolePage roleId={mockRoleId} />
        </Provider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('form-content')).toBeInTheDocument()
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
          <ViewRolePage roleId={mockRoleId} />
        </Provider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('form-content')).toBeInTheDocument()
      })
    })
  })

  describe('Form Initialization', () => {
    it('should initialize form without validation schema', () => {
      render(
        <Provider>
          <ViewRolePage roleId={mockRoleId} />
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

      /* Should not have resolver for view mode */
      const formConfig = (useForm as Mock).mock.calls[0][0]
      expect(formConfig.resolver).toBeUndefined()
    })

    it('should use default values on initialization', () => {
      render(
        <Provider>
          <ViewRolePage roleId={mockRoleId} />
        </Provider>
      )

      expect(useForm).toHaveBeenCalledWith(
        expect.objectContaining({
          defaultValues: expect.any(Object)
        })
      )
    })
  })

  describe('Cancel/Back Action', () => {
    it('should navigate to home page when back button is clicked', async () => {
      render(
        <Provider>
          <ViewRolePage roleId={mockRoleId} />
        </Provider>
      )

      await waitFor(() => {
        expect(screen.getByText('Back')).toBeInTheDocument()
      })

      const backButton = screen.getByText('Back')
      await userEvent.click(backButton)

      expect(mockPush).toHaveBeenCalledWith('/admin/role-management')
    })

    it('should not call any update operations when back is clicked', async () => {
      const mockUpdateRole = vi.fn()
      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        updateRole: mockUpdateRole
      })

      render(
        <Provider>
          <ViewRolePage roleId={mockRoleId} />
        </Provider>
      )

      await waitFor(() => {
        expect(screen.getByText('Back')).toBeInTheDocument()
      })

      const backButton = screen.getByText('Back')
      await userEvent.click(backButton)

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
          <ViewRolePage roleId={mockRoleId} />
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
          <ViewRolePage roleId={mockRoleId} />
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
        expect(mockFetchRoleDetails).toHaveBeenCalledWith(mockRoleId)
      })
    })
  })

  describe('View Mode Behavior', () => {
    it('should not have form submission functionality', async () => {
      const mockUpdateRole = vi.fn()
      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        updateRole: mockUpdateRole
      })

      render(
        <Provider>
          <ViewRolePage roleId={mockRoleId} />
        </Provider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('form-content')).toBeInTheDocument()
      })

      /* No submit button should be present */
      expect(screen.queryByText('Submit')).not.toBeInTheDocument()
      expect(screen.queryByText('Update')).not.toBeInTheDocument()

      /* updateRole should never be called */
      expect(mockUpdateRole).not.toHaveBeenCalled()
    })
  })

  describe('Props Passed to RoleFormLayout', () => {
    it('should pass correct mode prop', () => {
      render(
        <Provider>
          <ViewRolePage roleId={mockRoleId} />
        </Provider>
      )

      expect(screen.getByTestId('form-mode')).toHaveTextContent('VIEW')
    })

    it('should show loading state when fetching', async () => {
      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        isFetching: true
      })

      render(
        <Provider>
          <ViewRolePage roleId={mockRoleId} />
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
          <ViewRolePage roleId={mockRoleId} />
        </Provider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent(errorMessage)
      })
    })
  })

  describe('Integration Tests', () => {
    it('should complete full view workflow successfully', async () => {
      const mockFetchRoleDetails = vi.fn().mockResolvedValue({ role: mockRole, permissions: mockPermissions })

      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        fetchRoleDetails: mockFetchRoleDetails
      })

      render(
        <Provider>
          <ViewRolePage roleId={mockRoleId} />
        </Provider>
      )

      /* Wait for data to load */
      await waitFor(() => {
        expect(mockFetchRoleDetails).toHaveBeenCalledWith(mockRoleId)
        expect(screen.getByTestId('form-content')).toBeInTheDocument()
      })

      /* Click back button */
      const backButton = screen.getByText('Back')
      await userEvent.click(backButton)

      /* Verify navigation */
      expect(mockPush).toHaveBeenCalledWith('/admin/role-management')
    })

    it('should show error state and allow retry', async () => {
      const mockFetchRoleDetails = vi.fn().mockResolvedValue(null)

      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        fetchError: 'Failed to load',
        fetchRoleDetails: mockFetchRoleDetails
      })

      render(
        <Provider>
          <ViewRolePage roleId={mockRoleId} />
        </Provider>
      )

      /* Wait for error to appear */
      await waitFor(() => {
        expect(screen.getByTestId('error-container')).toBeInTheDocument()
      })

      /* Verify retry button is present */
      expect(screen.getByText('Retry')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined roleId', async () => {
      const mockFetchRoleDetails = vi.fn()
      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        fetchRoleDetails: mockFetchRoleDetails
      })

      render(
        <Provider>
          <ViewRolePage roleId={undefined as any} />
        </Provider>
      )

      /* Should not fetch when roleId is undefined */
      await waitFor(() => {
        expect(mockFetchRoleDetails).not.toHaveBeenCalled()
      })
    })

    it('should handle empty string roleId', async () => {
      const mockFetchRoleDetails = vi.fn()
      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        fetchRoleDetails: mockFetchRoleDetails
      })

      render(
        <Provider>
          <ViewRolePage roleId="" />
        </Provider>
      )

      /* Should not fetch when roleId is empty */
      await waitFor(() => {
        expect(mockFetchRoleDetails).not.toHaveBeenCalled()
      })
    })

    it('should handle role with no description', async () => {
      const roleWithoutDescription = { ...mockRole, description: '' }
      const mockFetchRoleDetails = vi.fn().mockResolvedValue({
        role: roleWithoutDescription,
        permissions: mockPermissions
      })

      vi.spyOn(useRoleOperationsHook, 'useRoleOperations').mockReturnValue({
        ...defaultOperationsReturn,
        fetchRoleDetails: mockFetchRoleDetails
      })

      render(
        <Provider>
          <ViewRolePage roleId={mockRoleId} />
        </Provider>
      )

      await waitFor(() => {
        expect(mockFormMethods.reset).toHaveBeenCalledWith(
          expect.objectContaining({
            description: ''
          })
        )
      })
    })
  })
})
