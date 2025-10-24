/* Comprehensive test suite for NavigationButtons component */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'

/* Role module imports */
import NavigationButtons from '@role-management/forms/navigation-buttons'
import * as useFormModeHook from '@role-management/contexts/form-mode'
import { ROLE_FORM_MODES, RoleFormMode } from '@role-management/constants'

/* Mock next/navigation */
const mockPush = vi.fn()
const mockParams = { roleId: '123' }

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn()
  })),
  useParams: vi.fn(() => mockParams)
}))

describe('NavigationButtons', () => {
  const mockOnCancel = vi.fn()
  const mockOnSubmit = vi.fn()

  const defaultProps = {
    onCancel: mockOnCancel,
    onSubmit: mockOnSubmit,
    loading: false
  }

  const defaultFormModeReturn = {
    mode: ROLE_FORM_MODES.CREATE as RoleFormMode,
    isViewMode: false,
    isCreateMode: true,
    isEditMode: false
  }

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  beforeEach(() => {
    vi.clearAllMocks()
    mockPush.mockClear()
    vi.spyOn(useFormModeHook, 'useFormMode').mockReturnValue(defaultFormModeReturn)
  })

  describe('Rendering in CREATE Mode', () => {
    it('should render Cancel and Create Role buttons', () => {
      render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Create Role')).toBeInTheDocument()
    })

    it('should show creating text when loading', () => {
      render(<NavigationButtons {...defaultProps} loading={true} />, { wrapper: TestWrapper })

      expect(screen.getByText('Creating Role...')).toBeInTheDocument()
    })

    it('should have submit button type for create mode', () => {
      render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      const submitButton = screen.getByRole('button', { name: /Create Role/i })
      expect(submitButton).toHaveAttribute('type', 'submit')
    })
  })

  describe('Rendering in EDIT Mode', () => {
    beforeEach(() => {
      vi.spyOn(useFormModeHook, 'useFormMode').mockReturnValue({
        mode: ROLE_FORM_MODES.EDIT as RoleFormMode,
        isViewMode: false,
        isCreateMode: false,
        isEditMode: true
      })
    })

    it('should render Cancel and Update Role buttons', () => {
      render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Update Role')).toBeInTheDocument()
    })

    it('should show updating text when loading', () => {
      render(<NavigationButtons {...defaultProps} loading={true} />, { wrapper: TestWrapper })

      expect(screen.getByText('Updating Role...')).toBeInTheDocument()
    })

    it('should have submit button type for edit mode', () => {
      render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      const submitButton = screen.getByRole('button', { name: /Update Role/i })
      expect(submitButton).toHaveAttribute('type', 'submit')
    })
  })

  describe('Rendering in VIEW Mode', () => {
    beforeEach(() => {
      vi.spyOn(useFormModeHook, 'useFormMode').mockReturnValue({
        mode: ROLE_FORM_MODES.VIEW as RoleFormMode,
        isViewMode: true,
        isCreateMode: false,
        isEditMode: false
      })
    })

    it('should render Cancel and Edit Role buttons', () => {
      render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Edit Role')).toBeInTheDocument()
    })

    it('should have button type for edit button in view mode', () => {
      render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      const editButton = screen.getByRole('button', { name: /Edit Role/i })
      expect(editButton).toHaveAttribute('type', 'button')
    })

    it('should not show loading text in view mode', () => {
      render(<NavigationButtons {...defaultProps} loading={true} />, { wrapper: TestWrapper })

      /* In view mode, loading should not affect button text */
      expect(screen.getByText('Edit Role')).toBeInTheDocument()
      expect(screen.queryByText('Creating Role...')).not.toBeInTheDocument()
      expect(screen.queryByText('Updating Role...')).not.toBeInTheDocument()
    })
  })

  describe('Button Interactions - CREATE Mode', () => {
    it('should call onCancel when Cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('should call onSubmit when Create Role button is clicked', async () => {
      const user = userEvent.setup()
      render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      const submitButton = screen.getByText('Create Role')
      await user.click(submitButton)

      expect(mockOnSubmit).toHaveBeenCalledTimes(1)
    })
  })

  describe('Button Interactions - EDIT Mode', () => {
    beforeEach(() => {
      vi.spyOn(useFormModeHook, 'useFormMode').mockReturnValue({
        mode: ROLE_FORM_MODES.EDIT as RoleFormMode,
        isViewMode: false,
        isCreateMode: false,
        isEditMode: true
      })
    })

    it('should call onCancel when Cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('should call onSubmit when Update Role button is clicked', async () => {
      const user = userEvent.setup()
      render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      const submitButton = screen.getByText('Update Role')
      await user.click(submitButton)

      expect(mockOnSubmit).toHaveBeenCalledTimes(1)
    })
  })

  describe('Button Interactions - VIEW Mode', () => {
    beforeEach(() => {
      vi.spyOn(useFormModeHook, 'useFormMode').mockReturnValue({
        mode: ROLE_FORM_MODES.VIEW as RoleFormMode,
        isViewMode: true,
        isCreateMode: false,
        isEditMode: false
      })
    })

    it('should call onCancel when Cancel button is clicked in view mode', async () => {
      const user = userEvent.setup()
      render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      const backButton = screen.getByRole('button', { name: /Cancel/i })
      await user.click(backButton)

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('should navigate to edit page when Edit Role button is clicked', async () => {
      const user = userEvent.setup()
      render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      const editButton = screen.getByText('Edit Role')
      await user.click(editButton)

      expect(mockPush).toHaveBeenCalledWith('/admin/role-management/edit/123')
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should use roleId from params for edit navigation', async () => {
      const user = userEvent.setup()
      const customParams = { roleId: '456' }
      const { useParams } = await import('next/navigation')
      vi.mocked(useParams).mockReturnValue(customParams)

      render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      const editButton = screen.getByText('Edit Role')
      await user.click(editButton)

      expect(mockPush).toHaveBeenCalledWith('/admin/role-management/edit/456')
    })
  })

  describe('Disabled States', () => {
    it('should disable Cancel button when loading in CREATE mode', () => {
      render(<NavigationButtons {...defaultProps} loading={true} />, { wrapper: TestWrapper })

      const cancelButton = screen.getByRole('button', { name: /Cancel/i })
      expect(cancelButton).toBeDisabled()
    })

    it('should disable Create button when loading', () => {
      render(<NavigationButtons {...defaultProps} loading={true} />, { wrapper: TestWrapper })

      const buttons = screen.getAllByRole('button')
      const createButton = buttons[1] /* Second button is the primary action button */
      expect(createButton).toBeDisabled()
      expect(screen.getByText('Creating Role...')).toBeInTheDocument()
    })

    it('should disable Cancel button when loading in EDIT mode', () => {
      vi.spyOn(useFormModeHook, 'useFormMode').mockReturnValue({
        mode: ROLE_FORM_MODES.EDIT as RoleFormMode,
        isViewMode: false,
        isCreateMode: false,
        isEditMode: true
      })

      render(<NavigationButtons {...defaultProps} loading={true} />, { wrapper: TestWrapper })

      const cancelButton = screen.getByRole('button', { name: /Cancel/i })
      expect(cancelButton).toBeDisabled()
    })

    it('should disable Update button when loading', () => {
      vi.spyOn(useFormModeHook, 'useFormMode').mockReturnValue({
        mode: ROLE_FORM_MODES.EDIT as RoleFormMode,
        isViewMode: false,
        isCreateMode: false,
        isEditMode: true
      })

      render(<NavigationButtons {...defaultProps} loading={true} />, { wrapper: TestWrapper })

      const buttons = screen.getAllByRole('button')
      const updateButton = buttons[1] /* Second button is the primary action button */
      expect(updateButton).toBeDisabled()
      expect(screen.getByText('Updating Role...')).toBeInTheDocument()
    })

    it('should not disable buttons in VIEW mode when loading', () => {
      vi.spyOn(useFormModeHook, 'useFormMode').mockReturnValue({
        mode: ROLE_FORM_MODES.VIEW as RoleFormMode,
        isViewMode: true,
        isCreateMode: false,
        isEditMode: false
      })

      render(<NavigationButtons {...defaultProps} loading={true} />, { wrapper: TestWrapper })

      const backButton = screen.getByRole('button', { name: /Cancel/i })
      const editButton = screen.getByText('Edit Role')

      expect(backButton).not.toBeDisabled()
      expect(editButton).not.toBeDisabled()
    })
  })

  describe('Button Icons', () => {
    it('should render primary button for CREATE mode', () => {
      render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      /* Primary button should exist */
      const submitButton = screen.getByText('Create Role')
      expect(submitButton).toBeInTheDocument()
    })

    it('should render update button for EDIT mode', () => {
      vi.spyOn(useFormModeHook, 'useFormMode').mockReturnValue({
        mode: ROLE_FORM_MODES.EDIT as RoleFormMode,
        isViewMode: false,
        isCreateMode: false,
        isEditMode: true
      })

      render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      const submitButton = screen.getByText('Update Role')
      expect(submitButton).toBeInTheDocument()
    })

    it('should render edit button for VIEW mode', () => {
      vi.spyOn(useFormModeHook, 'useFormMode').mockReturnValue({
        mode: ROLE_FORM_MODES.VIEW as RoleFormMode,
        isViewMode: true,
        isCreateMode: false,
        isEditMode: false
      })

      render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      const editButton = screen.getByText('Edit Role')
      expect(editButton).toBeInTheDocument()
    })

    it('should render cancel button', () => {
      render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      const cancelButton = screen.getByText('Cancel')
      expect(cancelButton).toBeInTheDocument()
    })
  })

  describe('Layout', () => {
    it('should render both cancel and submit buttons', () => {
      render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      /* Cancel button should be on left, submit on right */
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Create Role')).toBeInTheDocument()
    })

    it('should render buttons with proper structure', () => {
      render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      /* Both buttons should be present */
      const cancelButton = screen.getByText('Cancel')
      const submitButton = screen.getByText('Create Role')

      expect(cancelButton).toBeInTheDocument()
      expect(submitButton).toBeInTheDocument()
    })
  })

  describe('Props Handling', () => {
    it('should handle undefined onSubmit gracefully in VIEW mode', async () => {
      vi.spyOn(useFormModeHook, 'useFormMode').mockReturnValue({
        mode: ROLE_FORM_MODES.VIEW as RoleFormMode,
        isViewMode: true,
        isCreateMode: false,
        isEditMode: false
      })

      const user = userEvent.setup()
      render(<NavigationButtons onCancel={mockOnCancel} />, { wrapper: TestWrapper })

      const editButton = screen.getByText('Edit Role')
      await user.click(editButton)

      /* Should navigate instead of calling onSubmit */
      expect(mockPush).toHaveBeenCalled()
    })

    it('should call onSubmit if provided in CREATE mode', async () => {
      const user = userEvent.setup()
      render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      const submitButton = screen.getByText('Create Role')
      await user.click(submitButton)

      expect(mockOnSubmit).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing roleId in params for VIEW mode', async () => {
      vi.spyOn(useFormModeHook, 'useFormMode').mockReturnValue({
        mode: ROLE_FORM_MODES.VIEW as RoleFormMode,
        isViewMode: true,
        isCreateMode: false,
        isEditMode: false
      })

      const { useParams } = await import('next/navigation')
      vi.mocked(useParams).mockReturnValue({})

      const user = userEvent.setup()
      render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      const editButton = screen.getByText('Edit Role')
      await user.click(editButton)

      /* Should still attempt to navigate with undefined */
      expect(mockPush).toHaveBeenCalled()
    })

    it('should handle rapid button clicks', async () => {
      const user = userEvent.setup()
      render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      const submitButton = screen.getByText('Create Role')

      /* Click multiple times rapidly */
      await user.click(submitButton)
      await user.click(submitButton)
      await user.click(submitButton)

      /* Should be called multiple times unless prevented by form */
      expect(mockOnSubmit).toHaveBeenCalled()
    })

    it('should not call handlers when loading', async () => {
      const user = userEvent.setup()
      render(<NavigationButtons {...defaultProps} loading={true} />, { wrapper: TestWrapper })

      const cancelButton = screen.getByText('Cancel')
      const submitButton = screen.getByText('Creating Role...')

      await user.click(cancelButton)
      await user.click(submitButton)

      /* Buttons should be disabled, so handlers should not be called */
      expect(mockOnCancel).not.toHaveBeenCalled()
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  describe('Integration with Form Modes', () => {
    it('should adapt to CREATE mode context', () => {
      vi.spyOn(useFormModeHook, 'useFormMode').mockReturnValue({
        mode: ROLE_FORM_MODES.CREATE as RoleFormMode,
        isViewMode: false,
        isCreateMode: true,
        isEditMode: false
      })

      render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Create Role')).toBeInTheDocument()
      expect(screen.queryByText('Update Role')).not.toBeInTheDocument()
      expect(screen.queryByText('Edit Role')).not.toBeInTheDocument()
    })

    it('should adapt to EDIT mode context', () => {
      vi.spyOn(useFormModeHook, 'useFormMode').mockReturnValue({
        mode: ROLE_FORM_MODES.EDIT as RoleFormMode,
        isViewMode: false,
        isCreateMode: false,
        isEditMode: true
      })

      render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Update Role')).toBeInTheDocument()
      expect(screen.queryByText('Create Role')).not.toBeInTheDocument()
      expect(screen.queryByText('Edit Role')).not.toBeInTheDocument()
    })

    it('should adapt to VIEW mode context', () => {
      vi.spyOn(useFormModeHook, 'useFormMode').mockReturnValue({
        mode: ROLE_FORM_MODES.VIEW as RoleFormMode,
        isViewMode: true,
        isCreateMode: false,
        isEditMode: false
      })

      render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByText('Edit Role')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.queryByText('Create Role')).not.toBeInTheDocument()
      expect(screen.queryByText('Update Role')).not.toBeInTheDocument()
    })
  })

  describe('Button Text Generation', () => {
    it('should generate correct button text for each mode', () => {
      /* CREATE mode */
      vi.spyOn(useFormModeHook, 'useFormMode').mockReturnValue({
        mode: ROLE_FORM_MODES.CREATE as RoleFormMode,
        isViewMode: false,
        isCreateMode: true,
        isEditMode: false
      })

      const { rerender } = render(<NavigationButtons {...defaultProps} />, { wrapper: TestWrapper })
      expect(screen.getByText('Create Role')).toBeInTheDocument()

      /* EDIT mode */
      vi.spyOn(useFormModeHook, 'useFormMode').mockReturnValue({
        mode: ROLE_FORM_MODES.EDIT as RoleFormMode,
        isViewMode: false,
        isCreateMode: false,
        isEditMode: true
      })

      rerender(
        <TestWrapper>
          <NavigationButtons {...defaultProps} />
        </TestWrapper>
      )
      expect(screen.getByText('Update Role')).toBeInTheDocument()

      /* VIEW mode */
      vi.spyOn(useFormModeHook, 'useFormMode').mockReturnValue({
        mode: ROLE_FORM_MODES.VIEW as RoleFormMode,
        isViewMode: true,
        isCreateMode: false,
        isEditMode: false
      })

      rerender(
        <TestWrapper>
          <NavigationButtons {...defaultProps} />
        </TestWrapper>
      )
      expect(screen.getByText('Edit Role')).toBeInTheDocument()
    })

    it('should generate correct loading text for each mode', () => {
      /* CREATE mode loading */
      vi.spyOn(useFormModeHook, 'useFormMode').mockReturnValue({
        mode: ROLE_FORM_MODES.CREATE as RoleFormMode,
        isViewMode: false,
        isCreateMode: true,
        isEditMode: false
      })

      const { rerender } = render(<NavigationButtons {...defaultProps} loading={true} />, { wrapper: TestWrapper })
      expect(screen.getByText('Creating Role...')).toBeInTheDocument()

      /* EDIT mode loading */
      vi.spyOn(useFormModeHook, 'useFormMode').mockReturnValue({
        mode: ROLE_FORM_MODES.EDIT as RoleFormMode,
        isViewMode: false,
        isCreateMode: false,
        isEditMode: true
      })

      rerender(
        <TestWrapper>
          <NavigationButtons {...defaultProps} loading={true} />
        </TestWrapper>
      )
      expect(screen.getByText('Updating Role...')).toBeInTheDocument()
    })
  })
})
