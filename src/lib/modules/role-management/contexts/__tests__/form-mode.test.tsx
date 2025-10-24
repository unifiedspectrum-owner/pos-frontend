/* Libraries imports */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

/* Role management module imports */
import { FormModeProvider, useFormMode } from '@role-management/contexts'
import { ROLE_FORM_MODES } from '@role-management/constants'

/* Test component to interact with the context */
const TestComponent = () => {
  const { mode, isViewMode, isEditMode, isCreateMode } = useFormMode()

  return (
    <div>
      <div data-testid="mode">{mode}</div>
      <div data-testid="is-view-mode">{isViewMode.toString()}</div>
      <div data-testid="is-edit-mode">{isEditMode.toString()}</div>
      <div data-testid="is-create-mode">{isCreateMode.toString()}</div>
    </div>
  )
}

/* Component to test hook outside provider */
const ComponentWithoutProvider = () => {
  const context = useFormMode()
  return <div>{context.mode}</div>
}

describe('FormModeProvider', () => {
  describe('Provider Setup', () => {
    it('should render children correctly', () => {
      render(
        <FormModeProvider mode={ROLE_FORM_MODES.CREATE}>
          <div data-testid="test-child">Test Child</div>
        </FormModeProvider>
      )

      expect(screen.getByTestId('test-child')).toBeInTheDocument()
      expect(screen.getByText('Test Child')).toBeInTheDocument()
    })

    it('should provide context value to children', () => {
      render(
        <FormModeProvider mode={ROLE_FORM_MODES.CREATE}>
          <TestComponent />
        </FormModeProvider>
      )

      expect(screen.getByTestId('mode')).toBeInTheDocument()
      expect(screen.getByTestId('is-create-mode')).toBeInTheDocument()
    })

    it('should handle multiple children', () => {
      render(
        <FormModeProvider mode={ROLE_FORM_MODES.CREATE}>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <TestComponent />
        </FormModeProvider>
      )

      expect(screen.getByTestId('child-1')).toBeInTheDocument()
      expect(screen.getByTestId('child-2')).toBeInTheDocument()
      expect(screen.getByTestId('mode')).toBeInTheDocument()
    })

    it('should handle nested providers', () => {
      render(
        <FormModeProvider mode={ROLE_FORM_MODES.CREATE}>
          <div data-testid="outer-provider">
            <FormModeProvider mode={ROLE_FORM_MODES.EDIT}>
              <TestComponent />
            </FormModeProvider>
          </div>
        </FormModeProvider>
      )

      /* Inner provider should override outer provider */
      expect(screen.getByTestId('mode')).toHaveTextContent(ROLE_FORM_MODES.EDIT)
    })
  })

  describe('CREATE Mode', () => {
    it('should set mode to CREATE', () => {
      render(
        <FormModeProvider mode={ROLE_FORM_MODES.CREATE}>
          <TestComponent />
        </FormModeProvider>
      )

      expect(screen.getByTestId('mode')).toHaveTextContent('CREATE')
    })

    it('should set isCreateMode to true', () => {
      render(
        <FormModeProvider mode={ROLE_FORM_MODES.CREATE}>
          <TestComponent />
        </FormModeProvider>
      )

      expect(screen.getByTestId('is-create-mode')).toHaveTextContent('true')
    })

    it('should set isEditMode to false', () => {
      render(
        <FormModeProvider mode={ROLE_FORM_MODES.CREATE}>
          <TestComponent />
        </FormModeProvider>
      )

      expect(screen.getByTestId('is-edit-mode')).toHaveTextContent('false')
    })

    it('should set isViewMode to false', () => {
      render(
        <FormModeProvider mode={ROLE_FORM_MODES.CREATE}>
          <TestComponent />
        </FormModeProvider>
      )

      expect(screen.getByTestId('is-view-mode')).toHaveTextContent('false')
    })

    it('should provide all context properties correctly', () => {
      render(
        <FormModeProvider mode={ROLE_FORM_MODES.CREATE}>
          <TestComponent />
        </FormModeProvider>
      )

      expect(screen.getByTestId('mode')).toHaveTextContent('CREATE')
      expect(screen.getByTestId('is-create-mode')).toHaveTextContent('true')
      expect(screen.getByTestId('is-edit-mode')).toHaveTextContent('false')
      expect(screen.getByTestId('is-view-mode')).toHaveTextContent('false')
    })
  })

  describe('EDIT Mode', () => {
    it('should set mode to EDIT', () => {
      render(
        <FormModeProvider mode={ROLE_FORM_MODES.EDIT}>
          <TestComponent />
        </FormModeProvider>
      )

      expect(screen.getByTestId('mode')).toHaveTextContent('EDIT')
    })

    it('should set isEditMode to true', () => {
      render(
        <FormModeProvider mode={ROLE_FORM_MODES.EDIT}>
          <TestComponent />
        </FormModeProvider>
      )

      expect(screen.getByTestId('is-edit-mode')).toHaveTextContent('true')
    })

    it('should set isCreateMode to false', () => {
      render(
        <FormModeProvider mode={ROLE_FORM_MODES.EDIT}>
          <TestComponent />
        </FormModeProvider>
      )

      expect(screen.getByTestId('is-create-mode')).toHaveTextContent('false')
    })

    it('should set isViewMode to false', () => {
      render(
        <FormModeProvider mode={ROLE_FORM_MODES.EDIT}>
          <TestComponent />
        </FormModeProvider>
      )

      expect(screen.getByTestId('is-view-mode')).toHaveTextContent('false')
    })

    it('should provide all context properties correctly', () => {
      render(
        <FormModeProvider mode={ROLE_FORM_MODES.EDIT}>
          <TestComponent />
        </FormModeProvider>
      )

      expect(screen.getByTestId('mode')).toHaveTextContent('EDIT')
      expect(screen.getByTestId('is-create-mode')).toHaveTextContent('false')
      expect(screen.getByTestId('is-edit-mode')).toHaveTextContent('true')
      expect(screen.getByTestId('is-view-mode')).toHaveTextContent('false')
    })
  })

  describe('VIEW Mode', () => {
    it('should set mode to VIEW', () => {
      render(
        <FormModeProvider mode={ROLE_FORM_MODES.VIEW}>
          <TestComponent />
        </FormModeProvider>
      )

      expect(screen.getByTestId('mode')).toHaveTextContent('VIEW')
    })

    it('should set isViewMode to true', () => {
      render(
        <FormModeProvider mode={ROLE_FORM_MODES.VIEW}>
          <TestComponent />
        </FormModeProvider>
      )

      expect(screen.getByTestId('is-view-mode')).toHaveTextContent('true')
    })

    it('should set isCreateMode to false', () => {
      render(
        <FormModeProvider mode={ROLE_FORM_MODES.VIEW}>
          <TestComponent />
        </FormModeProvider>
      )

      expect(screen.getByTestId('is-create-mode')).toHaveTextContent('false')
    })

    it('should set isEditMode to false', () => {
      render(
        <FormModeProvider mode={ROLE_FORM_MODES.VIEW}>
          <TestComponent />
        </FormModeProvider>
      )

      expect(screen.getByTestId('is-edit-mode')).toHaveTextContent('false')
    })

    it('should provide all context properties correctly', () => {
      render(
        <FormModeProvider mode={ROLE_FORM_MODES.VIEW}>
          <TestComponent />
        </FormModeProvider>
      )

      expect(screen.getByTestId('mode')).toHaveTextContent('VIEW')
      expect(screen.getByTestId('is-create-mode')).toHaveTextContent('false')
      expect(screen.getByTestId('is-edit-mode')).toHaveTextContent('false')
      expect(screen.getByTestId('is-view-mode')).toHaveTextContent('true')
    })
  })

  describe('Hook Usage', () => {
    it('should throw error when used outside provider', () => {
      const originalError = console.error
      console.error = vi.fn()

      expect(() => {
        render(<ComponentWithoutProvider />)
      }).toThrow('useFormMode must be used within a FormModeProvider')

      console.error = originalError
    })

    it('should provide correct context interface', () => {
      const TestContextInterface = () => {
        const context = useFormMode()

        return (
          <div>
            <div data-testid="has-mode">{typeof context.mode}</div>
            <div data-testid="has-isViewMode">{typeof context.isViewMode}</div>
            <div data-testid="has-isEditMode">{typeof context.isEditMode}</div>
            <div data-testid="has-isCreateMode">{typeof context.isCreateMode}</div>
          </div>
        )
      }

      render(
        <FormModeProvider mode={ROLE_FORM_MODES.CREATE}>
          <TestContextInterface />
        </FormModeProvider>
      )

      expect(screen.getByTestId('has-mode')).toHaveTextContent('string')
      expect(screen.getByTestId('has-isViewMode')).toHaveTextContent('boolean')
      expect(screen.getByTestId('has-isEditMode')).toHaveTextContent('boolean')
      expect(screen.getByTestId('has-isCreateMode')).toHaveTextContent('boolean')
    })

    it('should return context value from hook', () => {
      const TestHookReturn = () => {
        const formModeContext = useFormMode()

        return (
          <div>
            <div data-testid="context-exists">{formModeContext ? 'exists' : 'missing'}</div>
            <div data-testid="context-mode">{formModeContext.mode}</div>
          </div>
        )
      }

      render(
        <FormModeProvider mode={ROLE_FORM_MODES.EDIT}>
          <TestHookReturn />
        </FormModeProvider>
      )

      expect(screen.getByTestId('context-exists')).toHaveTextContent('exists')
      expect(screen.getByTestId('context-mode')).toHaveTextContent('EDIT')
    })
  })

  describe('Mode Consistency', () => {
    it('should have exactly one mode active at a time in CREATE mode', () => {
      const TestModeExclusivity = () => {
        const { isCreateMode, isEditMode, isViewMode } = useFormMode()
        const activeCount = [isCreateMode, isEditMode, isViewMode].filter(Boolean).length

        return <div data-testid="active-count">{activeCount}</div>
      }

      render(
        <FormModeProvider mode={ROLE_FORM_MODES.CREATE}>
          <TestModeExclusivity />
        </FormModeProvider>
      )

      expect(screen.getByTestId('active-count')).toHaveTextContent('1')
    })

    it('should have exactly one mode active at a time in EDIT mode', () => {
      const TestModeExclusivity = () => {
        const { isCreateMode, isEditMode, isViewMode } = useFormMode()
        const activeCount = [isCreateMode, isEditMode, isViewMode].filter(Boolean).length

        return <div data-testid="active-count">{activeCount}</div>
      }

      render(
        <FormModeProvider mode={ROLE_FORM_MODES.EDIT}>
          <TestModeExclusivity />
        </FormModeProvider>
      )

      expect(screen.getByTestId('active-count')).toHaveTextContent('1')
    })

    it('should have exactly one mode active at a time in VIEW mode', () => {
      const TestModeExclusivity = () => {
        const { isCreateMode, isEditMode, isViewMode } = useFormMode()
        const activeCount = [isCreateMode, isEditMode, isViewMode].filter(Boolean).length

        return <div data-testid="active-count">{activeCount}</div>
      }

      render(
        <FormModeProvider mode={ROLE_FORM_MODES.VIEW}>
          <TestModeExclusivity />
        </FormModeProvider>
      )

      expect(screen.getByTestId('active-count')).toHaveTextContent('1')
    })
  })

  describe('Mode Flags Accuracy', () => {
    it('should correctly calculate isCreateMode flag', () => {
      const TestCreateFlag = () => {
        const { mode, isCreateMode } = useFormMode()
        const expectedIsCreate = mode === ROLE_FORM_MODES.CREATE

        return (
          <div>
            <div data-testid="mode">{mode}</div>
            <div data-testid="is-create">{isCreateMode.toString()}</div>
            <div data-testid="matches-expected">{(isCreateMode === expectedIsCreate).toString()}</div>
          </div>
        )
      }

      const { rerender } = render(
        <FormModeProvider mode={ROLE_FORM_MODES.CREATE}>
          <TestCreateFlag />
        </FormModeProvider>
      )

      expect(screen.getByTestId('matches-expected')).toHaveTextContent('true')

      rerender(
        <FormModeProvider mode={ROLE_FORM_MODES.EDIT}>
          <TestCreateFlag />
        </FormModeProvider>
      )

      expect(screen.getByTestId('matches-expected')).toHaveTextContent('true')
    })

    it('should correctly calculate isEditMode flag', () => {
      const TestEditFlag = () => {
        const { mode, isEditMode } = useFormMode()
        const expectedIsEdit = mode === ROLE_FORM_MODES.EDIT

        return (
          <div>
            <div data-testid="mode">{mode}</div>
            <div data-testid="is-edit">{isEditMode.toString()}</div>
            <div data-testid="matches-expected">{(isEditMode === expectedIsEdit).toString()}</div>
          </div>
        )
      }

      const { rerender } = render(
        <FormModeProvider mode={ROLE_FORM_MODES.EDIT}>
          <TestEditFlag />
        </FormModeProvider>
      )

      expect(screen.getByTestId('matches-expected')).toHaveTextContent('true')

      rerender(
        <FormModeProvider mode={ROLE_FORM_MODES.VIEW}>
          <TestEditFlag />
        </FormModeProvider>
      )

      expect(screen.getByTestId('matches-expected')).toHaveTextContent('true')
    })

    it('should correctly calculate isViewMode flag', () => {
      const TestViewFlag = () => {
        const { mode, isViewMode } = useFormMode()
        const expectedIsView = mode === ROLE_FORM_MODES.VIEW

        return (
          <div>
            <div data-testid="mode">{mode}</div>
            <div data-testid="is-view">{isViewMode.toString()}</div>
            <div data-testid="matches-expected">{(isViewMode === expectedIsView).toString()}</div>
          </div>
        )
      }

      const { rerender } = render(
        <FormModeProvider mode={ROLE_FORM_MODES.VIEW}>
          <TestViewFlag />
        </FormModeProvider>
      )

      expect(screen.getByTestId('matches-expected')).toHaveTextContent('true')

      rerender(
        <FormModeProvider mode={ROLE_FORM_MODES.CREATE}>
          <TestViewFlag />
        </FormModeProvider>
      )

      expect(screen.getByTestId('matches-expected')).toHaveTextContent('true')
    })
  })

  describe('Context Value Stability', () => {
    it('should provide stable mode value', () => {
      const TestModeStability = () => {
        const { mode } = useFormMode()

        return <div data-testid="mode">{mode}</div>
      }

      const { rerender } = render(
        <FormModeProvider mode={ROLE_FORM_MODES.CREATE}>
          <TestModeStability />
        </FormModeProvider>
      )

      expect(screen.getByTestId('mode')).toHaveTextContent('CREATE')

      /* Re-render with same mode - value should remain the same */
      rerender(
        <FormModeProvider mode={ROLE_FORM_MODES.CREATE}>
          <TestModeStability />
        </FormModeProvider>
      )

      expect(screen.getByTestId('mode')).toHaveTextContent('CREATE')
    })

    it('should update mode value when provider mode changes', () => {
      const TestModeChange = () => {
        const { mode } = useFormMode()

        return <div data-testid="mode">{mode}</div>
      }

      const { rerender } = render(
        <FormModeProvider mode={ROLE_FORM_MODES.CREATE}>
          <TestModeChange />
        </FormModeProvider>
      )

      expect(screen.getByTestId('mode')).toHaveTextContent('CREATE')

      rerender(
        <FormModeProvider mode={ROLE_FORM_MODES.EDIT}>
          <TestModeChange />
        </FormModeProvider>
      )

      expect(screen.getByTestId('mode')).toHaveTextContent('EDIT')

      rerender(
        <FormModeProvider mode={ROLE_FORM_MODES.VIEW}>
          <TestModeChange />
        </FormModeProvider>
      )

      expect(screen.getByTestId('mode')).toHaveTextContent('VIEW')
    })
  })

  describe('Multiple Consumers', () => {
    it('should provide same context to multiple consumers', () => {
      const Consumer1 = () => {
        const { mode } = useFormMode()
        return <div data-testid="consumer-1">{mode}</div>
      }

      const Consumer2 = () => {
        const { isCreateMode } = useFormMode()
        return <div data-testid="consumer-2">{isCreateMode.toString()}</div>
      }

      const Consumer3 = () => {
        const { isEditMode } = useFormMode()
        return <div data-testid="consumer-3">{isEditMode.toString()}</div>
      }

      render(
        <FormModeProvider mode={ROLE_FORM_MODES.CREATE}>
          <Consumer1 />
          <Consumer2 />
          <Consumer3 />
        </FormModeProvider>
      )

      expect(screen.getByTestId('consumer-1')).toHaveTextContent('CREATE')
      expect(screen.getByTestId('consumer-2')).toHaveTextContent('true')
      expect(screen.getByTestId('consumer-3')).toHaveTextContent('false')
    })

    it('should sync all consumers when mode changes', () => {
      const Consumer1 = () => {
        const { mode } = useFormMode()
        return <div data-testid="consumer-1">{mode}</div>
      }

      const Consumer2 = () => {
        const { isEditMode } = useFormMode()
        return <div data-testid="consumer-2">{isEditMode.toString()}</div>
      }

      const { rerender } = render(
        <FormModeProvider mode={ROLE_FORM_MODES.CREATE}>
          <Consumer1 />
          <Consumer2 />
        </FormModeProvider>
      )

      expect(screen.getByTestId('consumer-1')).toHaveTextContent('CREATE')
      expect(screen.getByTestId('consumer-2')).toHaveTextContent('false')

      rerender(
        <FormModeProvider mode={ROLE_FORM_MODES.EDIT}>
          <Consumer1 />
          <Consumer2 />
        </FormModeProvider>
      )

      expect(screen.getByTestId('consumer-1')).toHaveTextContent('EDIT')
      expect(screen.getByTestId('consumer-2')).toHaveTextContent('true')
    })
  })

  describe('TypeScript Type Safety', () => {
    it('should accept valid RoleFormMode values', () => {
      const TestTypeEnforcement = () => {
        const { mode } = useFormMode()
        return <div data-testid="mode">{mode}</div>
      }

      expect(() => {
        render(
          <FormModeProvider mode={ROLE_FORM_MODES.CREATE}>
            <TestTypeEnforcement />
          </FormModeProvider>
        )
      }).not.toThrow()

      expect(() => {
        render(
          <FormModeProvider mode={ROLE_FORM_MODES.EDIT}>
            <TestTypeEnforcement />
          </FormModeProvider>
        )
      }).not.toThrow()

      expect(() => {
        render(
          <FormModeProvider mode={ROLE_FORM_MODES.VIEW}>
            <TestTypeEnforcement />
          </FormModeProvider>
        )
      }).not.toThrow()
    })

    it('should enforce FormModeContextType interface', () => {
      const TestContextShape = () => {
        const context = useFormMode()

        /* Verify context has correct shape */
        const hasMode = 'mode' in context
        const hasIsViewMode = 'isViewMode' in context
        const hasIsEditMode = 'isEditMode' in context
        const hasIsCreateMode = 'isCreateMode' in context

        return (
          <div>
            <div data-testid="has-mode">{hasMode.toString()}</div>
            <div data-testid="has-is-view-mode">{hasIsViewMode.toString()}</div>
            <div data-testid="has-is-edit-mode">{hasIsEditMode.toString()}</div>
            <div data-testid="has-is-create-mode">{hasIsCreateMode.toString()}</div>
          </div>
        )
      }

      render(
        <FormModeProvider mode={ROLE_FORM_MODES.CREATE}>
          <TestContextShape />
        </FormModeProvider>
      )

      expect(screen.getByTestId('has-mode')).toHaveTextContent('true')
      expect(screen.getByTestId('has-is-view-mode')).toHaveTextContent('true')
      expect(screen.getByTestId('has-is-edit-mode')).toHaveTextContent('true')
      expect(screen.getByTestId('has-is-create-mode')).toHaveTextContent('true')
    })
  })

  describe('Practical Usage Scenarios', () => {
    it('should support conditional rendering based on mode', () => {
      const TestConditionalRendering = () => {
        const { isCreateMode, isEditMode, isViewMode } = useFormMode()

        return (
          <div>
            {isCreateMode && <div data-testid="create-content">Create Form</div>}
            {isEditMode && <div data-testid="edit-content">Edit Form</div>}
            {isViewMode && <div data-testid="view-content">View Details</div>}
          </div>
        )
      }

      const { rerender } = render(
        <FormModeProvider mode={ROLE_FORM_MODES.CREATE}>
          <TestConditionalRendering />
        </FormModeProvider>
      )

      expect(screen.getByTestId('create-content')).toBeInTheDocument()
      expect(screen.queryByTestId('edit-content')).not.toBeInTheDocument()
      expect(screen.queryByTestId('view-content')).not.toBeInTheDocument()

      rerender(
        <FormModeProvider mode={ROLE_FORM_MODES.EDIT}>
          <TestConditionalRendering />
        </FormModeProvider>
      )

      expect(screen.queryByTestId('create-content')).not.toBeInTheDocument()
      expect(screen.getByTestId('edit-content')).toBeInTheDocument()
      expect(screen.queryByTestId('view-content')).not.toBeInTheDocument()

      rerender(
        <FormModeProvider mode={ROLE_FORM_MODES.VIEW}>
          <TestConditionalRendering />
        </FormModeProvider>
      )

      expect(screen.queryByTestId('create-content')).not.toBeInTheDocument()
      expect(screen.queryByTestId('edit-content')).not.toBeInTheDocument()
      expect(screen.getByTestId('view-content')).toBeInTheDocument()
    })

    it('should support button visibility based on mode', () => {
      const TestButtonVisibility = () => {
        const { isViewMode } = useFormMode()

        return (
          <div>
            {!isViewMode && <button data-testid="save-button">Save</button>}
            {!isViewMode && <button data-testid="cancel-button">Cancel</button>}
            {isViewMode && <button data-testid="close-button">Close</button>}
          </div>
        )
      }

      const { rerender } = render(
        <FormModeProvider mode={ROLE_FORM_MODES.CREATE}>
          <TestButtonVisibility />
        </FormModeProvider>
      )

      expect(screen.getByTestId('save-button')).toBeInTheDocument()
      expect(screen.getByTestId('cancel-button')).toBeInTheDocument()
      expect(screen.queryByTestId('close-button')).not.toBeInTheDocument()

      rerender(
        <FormModeProvider mode={ROLE_FORM_MODES.VIEW}>
          <TestButtonVisibility />
        </FormModeProvider>
      )

      expect(screen.queryByTestId('save-button')).not.toBeInTheDocument()
      expect(screen.queryByTestId('cancel-button')).not.toBeInTheDocument()
      expect(screen.getByTestId('close-button')).toBeInTheDocument()
    })

    it('should support field disabled state based on mode', () => {
      const TestFieldState = () => {
        const { isViewMode } = useFormMode()

        return (
          <div>
            <input
              data-testid="name-input"
              disabled={isViewMode}
              placeholder="Role Name"
            />
            <input
              data-testid="description-input"
              disabled={isViewMode}
              placeholder="Description"
            />
          </div>
        )
      }

      const { rerender } = render(
        <FormModeProvider mode={ROLE_FORM_MODES.EDIT}>
          <TestFieldState />
        </FormModeProvider>
      )

      expect(screen.getByTestId('name-input')).not.toBeDisabled()
      expect(screen.getByTestId('description-input')).not.toBeDisabled()

      rerender(
        <FormModeProvider mode={ROLE_FORM_MODES.VIEW}>
          <TestFieldState />
        </FormModeProvider>
      )

      expect(screen.getByTestId('name-input')).toBeDisabled()
      expect(screen.getByTestId('description-input')).toBeDisabled()
    })
  })
})
