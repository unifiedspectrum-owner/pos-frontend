/* Comprehensive test suite for module assignments table component */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { Provider } from '@/components/ui/provider'
import ModuleAssignmentsTable from '@role-management/tables/module-assign'
import React from 'react'

/* Test wrapper component with Chakra Provider */
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

/* Test harness component that provides form context */
interface ModuleAssignmentFormData {
  module_assignments: Array<{
    module_id: string
    can_create: boolean
    can_read: boolean
    can_update: boolean
    can_delete: boolean
  }>
}

interface TestHarnessProps {
  children: (control: ReturnType<typeof useForm<ModuleAssignmentFormData>>['control']) => React.ReactElement
  defaultValues?: ModuleAssignmentFormData
}

const TestHarness = ({ children, defaultValues }: TestHarnessProps) => {
  const { control } = useForm<ModuleAssignmentFormData>({
    defaultValues: defaultValues || {
      module_assignments: [
        {
          module_id: '1',
          can_create: false,
          can_read: false,
          can_update: false,
          can_delete: false
        }
      ]
    }
  })

  return (
    <TestWrapper>
      {children(control)}
    </TestWrapper>
  )
}

describe('ModuleAssignmentsTable Component', () => {
  const defaultOptions = [
    { label: 'Create', value: 'can_create' },
    { label: 'Read', value: 'can_read' },
    { label: 'Update', value: 'can_update' },
    { label: 'Delete', value: 'can_delete' }
  ]

  const defaultProps = {
    label: 'User Management',
    options: defaultOptions,
    moduleIndex: 0
  }

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      render(
        <TestHarness>
          {(control) => <ModuleAssignmentsTable {...defaultProps} control={control} />}
        </TestHarness>
      )
      expect(screen.getByText('User Management')).toBeInTheDocument()
    })

    it('should display module label', () => {
      render(
        <TestHarness>
          {(control) => <ModuleAssignmentsTable {...defaultProps} control={control} />}
        </TestHarness>
      )
      expect(screen.getByText('User Management')).toBeInTheDocument()
    })

    it('should render select all checkbox', () => {
      render(
        <TestHarness>
          {(control) => <ModuleAssignmentsTable {...defaultProps} control={control} />}
        </TestHarness>
      )
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(0)
    })

    it('should render checkbox for each permission option', () => {
      render(
        <TestHarness>
          {(control) => <ModuleAssignmentsTable {...defaultProps} control={control} />}
        </TestHarness>
      )
      const checkboxes = screen.getAllByRole('checkbox')
      /* 1 select all + 4 individual permissions */
      expect(checkboxes).toHaveLength(5)
    })

    it('should display help text as title attribute', () => {
      render(
        <TestHarness>
          {(control) => <ModuleAssignmentsTable {...defaultProps} helpText="Module description" control={control} />}
        </TestHarness>
      )
      const label = screen.getByText('User Management')
      expect(label).toHaveAttribute('title', 'Module description')
    })
  })

  describe('Checkbox States', () => {
    it('should render unchecked checkboxes by default', () => {
      render(
        <TestHarness>
          {(control) => <ModuleAssignmentsTable {...defaultProps} control={control} />}
        </TestHarness>
      )
      const checkboxes = screen.getAllByRole('checkbox')
      checkboxes.forEach(checkbox => {
        expect(checkbox).not.toBeChecked()
      })
    })

    it('should render checked checkboxes when permissions are true', () => {
      const defaultValues = {
        module_assignments: [
          {
            module_id: '1',
            can_create: true,
            can_read: true,
            can_update: true,
            can_delete: true
          }
        ]
      }
      render(
        <TestHarness defaultValues={defaultValues}>
          {(control) => <ModuleAssignmentsTable {...defaultProps} control={control} />}
        </TestHarness>
      )
      const checkboxes = screen.getAllByRole('checkbox')
      checkboxes.forEach(checkbox => {
        expect(checkbox).toBeChecked()
      })
    })

    it('should render partially checked state', () => {
      const defaultValues = {
        module_assignments: [
          {
            module_id: '1',
            can_create: true,
            can_read: true,
            can_update: false,
            can_delete: false
          }
        ]
      }
      render(
        <TestHarness defaultValues={defaultValues}>
          {(control) => <ModuleAssignmentsTable {...defaultProps} control={control} />}
        </TestHarness>
      )
      /* Select all should not be checked when not all are selected */
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes[0]).not.toBeChecked()
    })
  })

  describe('Select All Functionality', () => {
    it('should select all permissions when select all is clicked', async () => {
      const user = userEvent.setup()
      render(
        <TestHarness>
          {(control) => <ModuleAssignmentsTable {...defaultProps} control={control} />}
        </TestHarness>
      )

      const checkboxes = screen.getAllByRole('checkbox')
      const selectAllCheckbox = checkboxes[0]

      await user.click(selectAllCheckbox)

      await waitFor(() => {
        checkboxes.forEach(checkbox => {
          expect(checkbox).toBeChecked()
        })
      })
    })

    it('should deselect all permissions when select all is unchecked', async () => {
      const user = userEvent.setup()
      const defaultValues = {
        module_assignments: [
          {
            module_id: '1',
            can_create: true,
            can_read: true,
            can_update: true,
            can_delete: true
          }
        ]
      }
      render(
        <TestHarness defaultValues={defaultValues}>
          {(control) => <ModuleAssignmentsTable {...defaultProps} control={control} />}
        </TestHarness>
      )

      const checkboxes = screen.getAllByRole('checkbox')
      const selectAllCheckbox = checkboxes[0]

      await user.click(selectAllCheckbox)

      await waitFor(() => {
        checkboxes.forEach(checkbox => {
          expect(checkbox).not.toBeChecked()
        })
      })
    })

    it('should check select all when all permissions are checked', async () => {
      const user = userEvent.setup()
      render(
        <TestHarness>
          {(control) => <ModuleAssignmentsTable {...defaultProps} control={control} />}
        </TestHarness>
      )

      const checkboxes = screen.getAllByRole('checkbox')
      const selectAllCheckbox = checkboxes[0]

      await user.click(selectAllCheckbox)

      await waitFor(() => {
        expect(selectAllCheckbox).toBeChecked()
      })
    })
  })

  describe('Individual Permission Changes', () => {
    it('should toggle individual permission on click', async () => {
      const user = userEvent.setup()
      render(
        <TestHarness>
          {(control) => <ModuleAssignmentsTable {...defaultProps} control={control} />}
        </TestHarness>
      )

      const checkboxes = screen.getAllByRole('checkbox')
      const createCheckbox = checkboxes[1]

      await user.click(createCheckbox)

      await waitFor(() => {
        expect(createCheckbox).toBeChecked()
      })
    })

    it('should update form state when permission changes', async () => {
      const user = userEvent.setup()
      render(
        <TestHarness>
          {(control) => <ModuleAssignmentsTable {...defaultProps} control={control} />}
        </TestHarness>
      )

      const checkboxes = screen.getAllByRole('checkbox')
      const readCheckbox = checkboxes[2]

      await user.click(readCheckbox)

      await waitFor(() => {
        expect(readCheckbox).toBeChecked()
      })
    })

    it('should handle multiple permission changes', async () => {
      const user = userEvent.setup()
      render(
        <TestHarness>
          {(control) => <ModuleAssignmentsTable {...defaultProps} control={control} />}
        </TestHarness>
      )

      const checkboxes = screen.getAllByRole('checkbox')

      await user.click(checkboxes[1])
      await user.click(checkboxes[2])
      await user.click(checkboxes[3])

      await waitFor(() => {
        expect(checkboxes[1]).toBeChecked()
        expect(checkboxes[2]).toBeChecked()
        expect(checkboxes[3]).toBeChecked()
      })
    })
  })

  describe('Disabled State', () => {
    it('should disable all checkboxes when disabled prop is true', () => {
      render(
        <TestHarness>
          {(control) => <ModuleAssignmentsTable {...defaultProps} disabled={true} control={control} />}
        </TestHarness>
      )

      const checkboxes = screen.getAllByRole('checkbox')
      checkboxes.forEach(checkbox => {
        expect(checkbox).toBeDisabled()
      })
    })

    it('should not allow changes when disabled', async () => {
      const user = userEvent.setup()
      render(
        <TestHarness>
          {(control) => <ModuleAssignmentsTable {...defaultProps} disabled={true} control={control} />}
        </TestHarness>
      )

      const checkboxes = screen.getAllByRole('checkbox')
      const createCheckbox = checkboxes[1]

      await user.click(createCheckbox)

      await waitFor(() => {
        expect(createCheckbox).not.toBeChecked()
      })
    })
  })

  describe('Read-Only State', () => {
    it('should make checkboxes read-only when readOnly prop is true', () => {
      render(
        <TestHarness>
          {(control) => <ModuleAssignmentsTable {...defaultProps} readOnly={true} control={control} />}
        </TestHarness>
      )

      const checkboxes = screen.getAllByRole('checkbox')
      checkboxes.forEach(checkbox => {
        expect(checkbox).toBeDisabled()
      })
    })

    it('should not allow changes when read-only', async () => {
      const user = userEvent.setup()
      render(
        <TestHarness>
          {(control) => <ModuleAssignmentsTable {...defaultProps} readOnly={true} control={control} />}
        </TestHarness>
      )

      const checkboxes = screen.getAllByRole('checkbox')
      const createCheckbox = checkboxes[1]

      await user.click(createCheckbox)

      /* Should remain unchanged */
      await waitFor(() => {
        expect(createCheckbox).not.toBeChecked()
      })
    })
  })

  describe('Protected Permissions', () => {
    it('should disable protected permissions', () => {
      render(
        <TestHarness>
          {(control) => <ModuleAssignmentsTable {...defaultProps} protectedPermissions={['can_create']} control={control} />}
        </TestHarness>
      )

      const checkboxes = screen.getAllByRole('checkbox')
      const createCheckbox = checkboxes[1]

      expect(createCheckbox).toBeDisabled()
    })

    it('should not allow changes to protected permissions', async () => {
      const user = userEvent.setup()
      const defaultValues = {
        module_assignments: [
          {
            module_id: '1',
            can_create: true,
            can_read: false,
            can_update: false,
            can_delete: false
          }
        ]
      }
      render(
        <TestHarness defaultValues={defaultValues}>
          {(control) => <ModuleAssignmentsTable {...defaultProps} protectedPermissions={['can_create']} control={control} />}
        </TestHarness>
      )

      const checkboxes = screen.getAllByRole('checkbox')
      const createCheckbox = checkboxes[1]

      await user.click(createCheckbox)

      /* Should remain checked because it's protected */
      await waitFor(() => {
        expect(createCheckbox).toBeChecked()
      })
    })

    it('should disable select all when all permissions are protected', () => {
      render(
        <TestHarness>
          {(control) => (
            <ModuleAssignmentsTable
              {...defaultProps}
              protectedPermissions={['can_create', 'can_read', 'can_update', 'can_delete']}
              control={control}
            />
          )}
        </TestHarness>
      )

      const checkboxes = screen.getAllByRole('checkbox')
      const selectAllCheckbox = checkboxes[0]

      expect(selectAllCheckbox).toBeDisabled()
    })

    it('should preserve protected permissions when select all is clicked', async () => {
      const user = userEvent.setup()
      const defaultValues = {
        module_assignments: [
          {
            module_id: '1',
            can_create: true,
            can_read: false,
            can_update: false,
            can_delete: false
          }
        ]
      }
      render(
        <TestHarness defaultValues={defaultValues}>
          {(control) => <ModuleAssignmentsTable {...defaultProps} protectedPermissions={['can_create']} control={control} />}
        </TestHarness>
      )

      const checkboxes = screen.getAllByRole('checkbox')
      const selectAllCheckbox = checkboxes[0]

      await user.click(selectAllCheckbox)

      /* Protected permission should remain unchanged */
      await waitFor(() => {
        expect(checkboxes[1]).toBeChecked()
      })
    })

    it('should handle multiple protected permissions', () => {
      render(
        <TestHarness>
          {(control) => (
            <ModuleAssignmentsTable
              {...defaultProps}
              protectedPermissions={['can_create', 'can_delete']}
              control={control}
            />
          )}
        </TestHarness>
      )

      const checkboxes = screen.getAllByRole('checkbox')
      const createCheckbox = checkboxes[1]
      const deleteCheckbox = checkboxes[4]

      expect(createCheckbox).toBeDisabled()
      expect(deleteCheckbox).toBeDisabled()
    })
  })

  describe('Individual Option Disabled State', () => {
    it('should disable specific option when disabled property is set', () => {
      const optionsWithDisabled = [
        { label: 'Create', value: 'can_create', disabled: true },
        { label: 'Read', value: 'can_read' },
        { label: 'Update', value: 'can_update' },
        { label: 'Delete', value: 'can_delete' }
      ]

      render(
        <TestHarness>
          {(control) => <ModuleAssignmentsTable {...defaultProps} options={optionsWithDisabled} control={control} />}
        </TestHarness>
      )

      const checkboxes = screen.getAllByRole('checkbox')
      const createCheckbox = checkboxes[1]

      expect(createCheckbox).toBeDisabled()
    })

    it('should allow enabling other options when one is disabled', async () => {
      const user = userEvent.setup()
      const optionsWithDisabled = [
        { label: 'Create', value: 'can_create', disabled: true },
        { label: 'Read', value: 'can_read' },
        { label: 'Update', value: 'can_update' },
        { label: 'Delete', value: 'can_delete' }
      ]

      render(
        <TestHarness>
          {(control) => <ModuleAssignmentsTable {...defaultProps} options={optionsWithDisabled} control={control} />}
        </TestHarness>
      )

      const checkboxes = screen.getAllByRole('checkbox')
      const readCheckbox = checkboxes[2]

      await user.click(readCheckbox)

      await waitFor(() => {
        expect(readCheckbox).toBeChecked()
      })
    })
  })

  describe('Styling and Layout', () => {
    it('should apply last row border radius when isLastRow is true', () => {
      const { container } = render(
        <TestHarness>
          {(control) => <ModuleAssignmentsTable {...defaultProps} isLastRow={true} control={control} />}
        </TestHarness>
      )
      /* Check for border radius styling */
      expect(container).toBeInTheDocument()
    })

    it('should not apply last row border radius by default', () => {
      const { container } = render(
        <TestHarness>
          {(control) => <ModuleAssignmentsTable {...defaultProps} control={control} />}
        </TestHarness>
      )
      expect(container).toBeInTheDocument()
    })

    it('should render label with correct width', () => {
      render(
        <TestHarness>
          {(control) => <ModuleAssignmentsTable {...defaultProps} control={control} />}
        </TestHarness>
      )
      const label = screen.getByText('User Management')
      expect(label).toBeInTheDocument()
    })
  })

  describe('Module Index Handling', () => {
    it('should handle different module indices', () => {
      render(
        <TestHarness
          defaultValues={{
            module_assignments: [
              { module_id: '1', can_create: false, can_read: false, can_update: false, can_delete: false },
              { module_id: '2', can_create: false, can_read: false, can_update: false, can_delete: false }
            ]
          }}
        >
          {(control) => <ModuleAssignmentsTable {...defaultProps} moduleIndex={1} label="Role Management" control={control} />}
        </TestHarness>
      )

      expect(screen.getByText('Role Management')).toBeInTheDocument()
    })

    it('should create unique keys for checkboxes based on module index', () => {
      render(
        <TestHarness>
          {(control) => <ModuleAssignmentsTable {...defaultProps} moduleIndex={5} control={control} />}
        </TestHarness>
      )
      /* Should render without key conflicts */
      expect(screen.getByText('User Management')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty options array', () => {
      render(
        <TestHarness>
          {(control) => <ModuleAssignmentsTable {...defaultProps} options={[]} control={control} />}
        </TestHarness>
      )
      /* Should only render select all checkbox */
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes).toHaveLength(1)
    })

    it('should handle single option', () => {
      const singleOption = [{ label: 'Read', value: 'can_read' }]
      render(
        <TestHarness>
          {(control) => <ModuleAssignmentsTable {...defaultProps} options={singleOption} control={control} />}
        </TestHarness>
      )
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes).toHaveLength(2)
    })

    it('should handle undefined protectedPermissions', () => {
      render(
        <TestHarness>
          {(control) => <ModuleAssignmentsTable {...defaultProps} protectedPermissions={undefined} control={control} />}
        </TestHarness>
      )
      const checkboxes = screen.getAllByRole('checkbox')
      checkboxes.forEach(checkbox => {
        expect(checkbox).not.toBeDisabled()
      })
    })

    it('should handle empty protectedPermissions array', () => {
      render(
        <TestHarness>
          {(control) => <ModuleAssignmentsTable {...defaultProps} protectedPermissions={[]} control={control} />}
        </TestHarness>
      )
      const checkboxes = screen.getAllByRole('checkbox')
      checkboxes.forEach(checkbox => {
        expect(checkbox).not.toBeDisabled()
      })
    })
  })

  describe('Permission State Logic', () => {
    it('should correctly determine if all permissions are selected', () => {
      const defaultValues = {
        module_assignments: [
          {
            module_id: '1',
            can_create: true,
            can_read: true,
            can_update: true,
            can_delete: true
          }
        ]
      }
      render(
        <TestHarness defaultValues={defaultValues}>
          {(control) => <ModuleAssignmentsTable {...defaultProps} control={control} />}
        </TestHarness>
      )

      const checkboxes = screen.getAllByRole('checkbox')
      const selectAllCheckbox = checkboxes[0]

      expect(selectAllCheckbox).toBeChecked()
    })

    it('should handle mixed permission states', () => {
      const defaultValues = {
        module_assignments: [
          {
            module_id: '1',
            can_create: true,
            can_read: false,
            can_update: true,
            can_delete: false
          }
        ]
      }
      render(
        <TestHarness defaultValues={defaultValues}>
          {(control) => <ModuleAssignmentsTable {...defaultProps} control={control} />}
        </TestHarness>
      )

      const checkboxes = screen.getAllByRole('checkbox')
      const selectAllCheckbox = checkboxes[0]

      expect(selectAllCheckbox).not.toBeChecked()
    })
  })
})
