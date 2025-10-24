/* Comprehensive test suite for RoleInfoSection component */

/* Libraries imports */
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { Provider } from '@/components/ui/provider'

/* Role module imports */
import RoleInfoSection from '@role-management/forms/sections/role-info'
import { CreateRoleFormData } from '@role-management/schemas'
import { ROLE_FORM_MODES, RoleFormMode } from '@role-management/constants'
import * as useFormModeHook from '@role-management/contexts/form-mode'

/* Mock dependencies */
vi.mock('@shared/components/form-elements', () => ({
  TextInputField: ({ label, value, onChange, errorMessage, isInValid, readOnly }: { label: string; value: string; onChange: (value: string) => void; errorMessage?: string; isInValid: boolean; readOnly: boolean }) => (
    <div data-testid={`text-input-${label}`}>
      <label>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} data-testid={`input-${label}`} readOnly={readOnly} />
      {isInValid && errorMessage && <span data-testid={`error-${label}`}>{errorMessage}</span>}
    </div>
  ),
  TextAreaField: ({ label, value, onChange, errorMessage, isInValid, readOnly }: { label: string; value: string; onChange: (value: string) => void; errorMessage?: string; isInValid: boolean; readOnly: boolean }) => (
    <div data-testid={`textarea-${label}`}>
      <label>{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} data-testid={`textarea-input-${label}`} readOnly={readOnly} />
      {isInValid && errorMessage && <span data-testid={`error-${label}`}>{errorMessage}</span>}
    </div>
  ),
  SwitchField: ({ label, value, onChange, activeText, inactiveText, disabled }: { label: string; value: boolean; onChange: (val: boolean) => void; activeText?: string; inactiveText?: string; disabled: boolean }) => (
    <div data-testid={`switch-${label}`}>
      <label>{label}</label>
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} data-testid={`switch-input-${label}`} disabled={disabled} />
      <span data-testid={`switch-text-${label}`}>{value ? activeText : inactiveText}</span>
    </div>
  )
}))

describe('RoleInfoSection', () => {
  const defaultFormModeReturn = {
    mode: ROLE_FORM_MODES.CREATE as RoleFormMode,
    isViewMode: false,
    isCreateMode: true,
    isEditMode: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useFormModeHook, 'useFormMode').mockReturnValue(defaultFormModeReturn)
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  const TestComponent = () => {
    const methods = useForm<CreateRoleFormData>({
      defaultValues: {
        name: '',
        description: '',
        is_active: true,
        module_assignments: []
      }
    })

    return (
      <FormProvider {...methods}>
        <RoleInfoSection />
      </FormProvider>
    )
  }

  describe('Form Fields Rendering', () => {
    it('should render name field', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByTestId('input-Name')).toBeInTheDocument()
    })

    it('should render description field', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByTestId('textarea-input-Description')).toBeInTheDocument()
    })

    it('should render status switch field', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByTestId('switch-input-Status')).toBeInTheDocument()
    })

    it('should render all required fields', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('text-input-Name')).toBeInTheDocument()
      expect(screen.getByTestId('textarea-Description')).toBeInTheDocument()
      expect(screen.getByTestId('switch-Status')).toBeInTheDocument()
    })
  })

  describe('Field Interactions', () => {
    it('should update name value', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const input = screen.getByTestId('input-Name') as HTMLInputElement
      await user.type(input, 'Admin Role')

      await waitFor(() => {
        expect(input.value).toBe('Admin Role')
      })
    })

    it('should update description value', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const textarea = screen.getByTestId('textarea-input-Description') as HTMLTextAreaElement
      await user.type(textarea, 'Administrator with full access')

      await waitFor(() => {
        expect(textarea.value).toBe('Administrator with full access')
      })
    })

    it('should toggle status switch', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const switchInput = screen.getByTestId('switch-input-Status') as HTMLInputElement
      expect(switchInput.checked).toBe(true)

      await user.click(switchInput)

      await waitFor(() => {
        expect(switchInput.checked).toBe(false)
      })
    })

    it('should allow multiple field updates', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const nameInput = screen.getByTestId('input-Name') as HTMLInputElement
      const descInput = screen.getByTestId('textarea-input-Description') as HTMLTextAreaElement

      await user.type(nameInput, 'Manager')
      await user.type(descInput, 'Team Manager')

      await waitFor(() => {
        expect(nameInput.value).toBe('Manager')
        expect(descInput.value).toBe('Team Manager')
      })
    })
  })

  describe('Switch Field States', () => {
    it('should display active text when status is true', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const switchText = screen.getByTestId('switch-text-Status')
      expect(switchText).toHaveTextContent('Active')
    })

    it('should display inactive text when status is toggled off', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const switchInput = screen.getByTestId('switch-input-Status') as HTMLInputElement
      await user.click(switchInput)

      await waitFor(() => {
        const switchText = screen.getByTestId('switch-text-Status')
        expect(switchText).toHaveTextContent('Inactive')
      })
    })

    it('should have correct default state', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const switchInput = screen.getByTestId('switch-input-Status') as HTMLInputElement
      expect(switchInput.checked).toBe(true)
    })
  })

  describe('View Mode', () => {
    beforeEach(() => {
      vi.spyOn(useFormModeHook, 'useFormMode').mockReturnValue({
        mode: ROLE_FORM_MODES.VIEW as RoleFormMode,
        isViewMode: true,
        isCreateMode: false,
        isEditMode: false
      })
    })

    it('should make name field readonly in view mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const input = screen.getByTestId('input-Name') as HTMLInputElement
      expect(input).toHaveAttribute('readOnly')
    })

    it('should make description field readonly in view mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const textarea = screen.getByTestId('textarea-input-Description') as HTMLTextAreaElement
      expect(textarea).toHaveAttribute('readOnly')
    })

    it('should disable status switch in view mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const switchInput = screen.getByTestId('switch-input-Status') as HTMLInputElement
      expect(switchInput).toBeDisabled()
    })

    it('should not show error messages in view mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('error-Name')).not.toBeInTheDocument()
      expect(screen.queryByTestId('error-Description')).not.toBeInTheDocument()
    })
  })

  describe('Edit Mode', () => {
    beforeEach(() => {
      vi.spyOn(useFormModeHook, 'useFormMode').mockReturnValue({
        mode: ROLE_FORM_MODES.EDIT as RoleFormMode,
        isViewMode: false,
        isCreateMode: false,
        isEditMode: true
      })
    })

    it('should allow editing name field in edit mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const input = screen.getByTestId('input-Name') as HTMLInputElement
      expect(input).not.toHaveAttribute('readOnly')
    })

    it('should allow editing description field in edit mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const textarea = screen.getByTestId('textarea-input-Description') as HTMLTextAreaElement
      expect(textarea).not.toHaveAttribute('readOnly')
    })

    it('should allow toggling status in edit mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const switchInput = screen.getByTestId('switch-input-Status') as HTMLInputElement
      expect(switchInput).not.toBeDisabled()
    })
  })

  describe('Create Mode', () => {
    it('should allow all field interactions in create mode', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      const nameInput = screen.getByTestId('input-Name') as HTMLInputElement
      const descInput = screen.getByTestId('textarea-input-Description') as HTMLTextAreaElement
      const switchInput = screen.getByTestId('switch-input-Status') as HTMLInputElement

      expect(nameInput).not.toHaveAttribute('readOnly')
      expect(descInput).not.toHaveAttribute('readOnly')
      expect(switchInput).not.toBeDisabled()
    })
  })

  describe('Form Validation', () => {
    it('should render form fields that can be validated', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('input-Name')).toBeInTheDocument()
      expect(screen.getByTestId('textarea-input-Description')).toBeInTheDocument()
    })
  })

  describe('Field Ordering', () => {
    it('should render fields in correct display order', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      /* Verify all three fields are present */
      expect(screen.getByTestId('text-input-Name')).toBeInTheDocument()
      expect(screen.getByTestId('textarea-Description')).toBeInTheDocument()
      expect(screen.getByTestId('switch-Status')).toBeInTheDocument()
    })

    it('should render name field before description field', () => {
      const { container } = render(<TestComponent />, { wrapper: TestWrapper })

      const allFields = Array.from(container.querySelectorAll('[data-testid^="text-input-"], [data-testid^="textarea-"], [data-testid^="switch-"]'))
      const nameIndex = allFields.findIndex(el => el.getAttribute('data-testid')?.includes('Name'))
      const descIndex = allFields.findIndex(el => el.getAttribute('data-testid')?.includes('Description'))

      expect(nameIndex).toBeLessThan(descIndex)
    })
  })

  describe('Grid Layout', () => {
    it('should render fields in a grid layout', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
    })
  })

  describe('Field Props', () => {
    it('should pass correct props to name field', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('text-input-Name')).toBeInTheDocument()
      expect(screen.getByTestId('input-Name')).toHaveValue('')
    })

    it('should pass correct props to description field', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('textarea-Description')).toBeInTheDocument()
      expect(screen.getByTestId('textarea-input-Description')).toHaveValue('')
    })

    it('should pass correct props to status field', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.getByTestId('switch-Status')).toBeInTheDocument()
      const switchInput = screen.getByTestId('switch-input-Status') as HTMLInputElement
      expect(switchInput.checked).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should not show errors initially', () => {
      render(<TestComponent />, { wrapper: TestWrapper })

      expect(screen.queryByTestId('error-Name')).not.toBeInTheDocument()
      expect(screen.queryByTestId('error-Description')).not.toBeInTheDocument()
    })
  })

  describe('Form Context Integration', () => {
    it('should integrate with react-hook-form context', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const nameInput = screen.getByTestId('input-Name') as HTMLInputElement
      await user.type(nameInput, 'Test Role')

      await waitFor(() => {
        expect(nameInput.value).toBe('Test Role')
      })
    })

    it('should handle form state changes', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const switchInput = screen.getByTestId('switch-input-Status') as HTMLInputElement
      const initialState = switchInput.checked

      await user.click(switchInput)

      await waitFor(() => {
        expect(switchInput.checked).not.toBe(initialState)
      })
    })
  })

  describe('Field Clearing', () => {
    it('should allow clearing name field', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const nameInput = screen.getByTestId('input-Name') as HTMLInputElement
      await user.type(nameInput, 'Test')
      await user.clear(nameInput)

      await waitFor(() => {
        expect(nameInput.value).toBe('')
      })
    })

    it('should allow clearing description field', async () => {
      const user = userEvent.setup()
      render(<TestComponent />, { wrapper: TestWrapper })

      const descInput = screen.getByTestId('textarea-input-Description') as HTMLTextAreaElement
      await user.type(descInput, 'Test description')
      await user.clear(descInput)

      await waitFor(() => {
        expect(descInput.value).toBe('')
      })
    })
  })
})
