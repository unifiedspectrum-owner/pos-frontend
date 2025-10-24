/* Libraries imports */
import { describe, it, expect, vi, beforeEach, type MockInstance } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/* User module imports */
import CreateUserPage from '@user-management/pages/create'
import * as useUserOperationsHook from '@user-management/hooks/use-user-operations'
import * as buildPayloadUtil from '@user-management/utils'

/* Mock next/navigation */
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: vi.fn()
  })
}))

/* Mock UserFormLayout component */
vi.mock('@user-management/forms/layout', () => ({
  default: vi.fn(({ title, methods, onSubmit, onCancel, isSubmitting, submitText, loadingText }) => (
    <div data-testid="user-form-layout">
      <h1>{title}</h1>
      <div data-testid="form-submitting">{isSubmitting ? 'true' : 'false'}</div>
      <div data-testid="submit-text">{submitText || 'Create User'}</div>
      <div data-testid="loading-text">{loadingText || 'Creating User...'}</div>
      <button onClick={() => onSubmit(methods.getValues(), undefined)} data-testid="submit-button">
        Submit
      </button>
      <button onClick={onCancel} data-testid="cancel-button">
        Cancel
      </button>
    </div>
  ))
}))

describe('CreateUserPage', () => {
  const mockCreateUser = vi.fn()
  let mockBuildCreateUserPayload: MockInstance

  const defaultHookReturn = {
    createUser: mockCreateUser,
    isCreating: false,
    createError: null,
    updateUser: vi.fn(),
    isUpdating: false,
    updateError: null,
    deleteUser: vi.fn(),
    isDeleting: false,
    deleteError: null,
    fetchUserDetails: vi.fn(),
    fetchUserBasicDetails: vi.fn(),
    userDetails: null,
    userStatistics: null,
    permissions: [],
    isFetching: false,
    fetchError: null
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useUserOperationsHook, 'useUserOperations').mockReturnValue(defaultHookReturn)
    mockBuildCreateUserPayload = vi.spyOn(buildPayloadUtil, 'buildCreateUserPayload').mockReturnValue({
      f_name: 'John',
      l_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+11234567890',
      role_id: 1,
      is_active: true,
      is_2fa_required: false
    })
  })

  it('should render the create user page', () => {
    render(<CreateUserPage />)

    expect(screen.getByTestId('user-form-layout')).toBeInTheDocument()
    expect(screen.getByText('Create New User')).toBeInTheDocument()
  })

  it('should display default submit and loading text', () => {
    render(<CreateUserPage />)

    expect(screen.getByTestId('submit-text')).toHaveTextContent('Create User')
    expect(screen.getByTestId('loading-text')).toHaveTextContent('Creating User...')
  })

  it('should show not submitting state initially', () => {
    render(<CreateUserPage />)

    expect(screen.getByTestId('form-submitting')).toHaveTextContent('false')
  })

  it('should show submitting state when creating user', () => {
    vi.spyOn(useUserOperationsHook, 'useUserOperations').mockReturnValue({
      ...defaultHookReturn,
      isCreating: true
    })

    render(<CreateUserPage />)

    expect(screen.getByTestId('form-submitting')).toHaveTextContent('true')
  })

  it('should call buildCreateUserPayload with form data on submit', async () => {
    const user = userEvent.setup()
    mockCreateUser.mockResolvedValue(true)

    render(<CreateUserPage />)

    await user.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(mockBuildCreateUserPayload).toHaveBeenCalled()
    })
  })

  it('should call createUser with payload on submit', async () => {
    const user = userEvent.setup()
    mockCreateUser.mockResolvedValue(true)

    const mockPayload = {
      f_name: 'John',
      l_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+11234567890',
      role_id: 1,
      is_active: true,
      is_2fa_required: false
    }

    mockBuildCreateUserPayload.mockReturnValue(mockPayload)

    render(<CreateUserPage />)

    await user.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith(mockPayload)
    })
  })

  it('should navigate to user list on successful creation', async () => {
    const user = userEvent.setup()
    mockCreateUser.mockResolvedValue(true)

    render(<CreateUserPage />)

    await user.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/user-management')
    })
  })

  it('should not navigate when creation fails', async () => {
    const user = userEvent.setup()
    mockCreateUser.mockResolvedValue(false)

    render(<CreateUserPage />)

    await user.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalled()
    })

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('should navigate to user list when cancel is clicked', async () => {
    const user = userEvent.setup()

    render(<CreateUserPage />)

    await user.click(screen.getByTestId('cancel-button'))

    expect(mockPush).toHaveBeenCalledWith('/admin/user-management')
  })

  it('should handle errors during submission gracefully', async () => {
    const user = userEvent.setup()
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockCreateUser.mockRejectedValue(new Error('Network error'))

    render(<CreateUserPage />)

    await user.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating user:', expect.any(Error))
    })

    consoleErrorSpy.mockRestore()
  })

  it('should pass role permissions to payload builder when provided', async () => {
    const user = userEvent.setup()
    mockCreateUser.mockResolvedValue(true)

    render(<CreateUserPage />)

    await user.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(mockBuildCreateUserPayload).toHaveBeenCalledWith(
        expect.any(Object),
        undefined
      )
    })
  })

  it('should use useUserOperations hook', () => {
    const spy = vi.spyOn(useUserOperationsHook, 'useUserOperations')

    render(<CreateUserPage />)

    expect(spy).toHaveBeenCalled()
  })

  it('should handle multiple rapid submissions correctly', async () => {
    const user = userEvent.setup()
    let resolveCreate: (value: boolean) => void
    const createPromise = new Promise<boolean>((resolve) => {
      resolveCreate = resolve
    })
    mockCreateUser.mockReturnValue(createPromise)

    render(<CreateUserPage />)

    await user.click(screen.getByTestId('submit-button'))
    await user.click(screen.getByTestId('submit-button'))

    resolveCreate!(true)

    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledTimes(2)
    })
  })

  it('should not navigate when createUser throws an error', async () => {
    const user = userEvent.setup()
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockCreateUser.mockRejectedValue(new Error('API error'))

    render(<CreateUserPage />)

    await user.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalled()
    })

    expect(mockPush).not.toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })

  it('should log form data and payload before submission', async () => {
    const user = userEvent.setup()
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    mockCreateUser.mockResolvedValue(true)

    render(<CreateUserPage />)

    await user.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith('Form data before submission:', expect.any(Object))
      expect(consoleLogSpy).toHaveBeenCalledWith('Role permissions:', undefined)
      expect(consoleLogSpy).toHaveBeenCalledWith('Payload being sent:', expect.any(Object))
    })

    consoleLogSpy.mockRestore()
  })
})
