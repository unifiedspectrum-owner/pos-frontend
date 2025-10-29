/* Libraries imports */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

/* Plan management module imports */
import { PlanFormModeProvider, usePlanFormMode } from '@plan-management/contexts'
import { PLAN_FORM_MODES } from '@plan-management/constants'

/* Test component to interact with the context */
const TestComponent = () => {
  const { mode, planId } = usePlanFormMode()

  return (
    <div>
      <div data-testid="mode">{mode}</div>
      <div data-testid="plan-id">{planId !== undefined ? planId.toString() : 'undefined'}</div>
    </div>
  )
}

/* Component to test hook outside provider */
const ComponentWithoutProvider = () => {
  const context = usePlanFormMode()
  return <div>{context.mode}</div>
}

describe('PlanFormModeProvider', () => {
  describe('Provider Setup', () => {
    it('should render children correctly', () => {
      render(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.CREATE}>
          <div data-testid="test-child">Test Child</div>
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('test-child')).toBeInTheDocument()
      expect(screen.getByText('Test Child')).toBeInTheDocument()
    })

    it('should provide context value to children', () => {
      render(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.CREATE}>
          <TestComponent />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('mode')).toBeInTheDocument()
      expect(screen.getByTestId('plan-id')).toBeInTheDocument()
    })

    it('should handle multiple children', () => {
      render(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.CREATE}>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <TestComponent />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('child-1')).toBeInTheDocument()
      expect(screen.getByTestId('child-2')).toBeInTheDocument()
      expect(screen.getByTestId('mode')).toBeInTheDocument()
    })

    it('should handle nested providers', () => {
      render(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.CREATE}>
          <div data-testid="outer-provider">
            <PlanFormModeProvider mode={PLAN_FORM_MODES.EDIT} planId={123}>
              <TestComponent />
            </PlanFormModeProvider>
          </div>
        </PlanFormModeProvider>
      )

      /* Inner provider should override outer provider */
      expect(screen.getByTestId('mode')).toHaveTextContent(PLAN_FORM_MODES.EDIT)
      expect(screen.getByTestId('plan-id')).toHaveTextContent('123')
    })
  })

  describe('CREATE Mode', () => {
    it('should set mode to CREATE', () => {
      render(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.CREATE}>
          <TestComponent />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('mode')).toHaveTextContent('CREATE')
    })

    it('should have planId as undefined in CREATE mode', () => {
      render(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.CREATE}>
          <TestComponent />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('plan-id')).toHaveTextContent('undefined')
    })

    it('should provide all context properties correctly', () => {
      render(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.CREATE}>
          <TestComponent />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('mode')).toHaveTextContent('CREATE')
      expect(screen.getByTestId('plan-id')).toHaveTextContent('undefined')
    })
  })

  describe('EDIT Mode', () => {
    it('should set mode to EDIT', () => {
      render(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.EDIT} planId={456}>
          <TestComponent />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('mode')).toHaveTextContent('EDIT')
    })

    it('should have planId defined in EDIT mode', () => {
      render(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.EDIT} planId={456}>
          <TestComponent />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('plan-id')).toHaveTextContent('456')
    })

    it('should provide all context properties correctly', () => {
      render(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.EDIT} planId={789}>
          <TestComponent />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('mode')).toHaveTextContent('EDIT')
      expect(screen.getByTestId('plan-id')).toHaveTextContent('789')
    })

    it('should handle EDIT mode without planId', () => {
      render(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.EDIT}>
          <TestComponent />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('mode')).toHaveTextContent('EDIT')
      expect(screen.getByTestId('plan-id')).toHaveTextContent('undefined')
    })
  })

  describe('VIEW Mode', () => {
    it('should set mode to VIEW', () => {
      render(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.VIEW} planId={101}>
          <TestComponent />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('mode')).toHaveTextContent('VIEW')
    })

    it('should have planId defined in VIEW mode', () => {
      render(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.VIEW} planId={101}>
          <TestComponent />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('plan-id')).toHaveTextContent('101')
    })

    it('should provide all context properties correctly', () => {
      render(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.VIEW} planId={202}>
          <TestComponent />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('mode')).toHaveTextContent('VIEW')
      expect(screen.getByTestId('plan-id')).toHaveTextContent('202')
    })

    it('should handle VIEW mode without planId', () => {
      render(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.VIEW}>
          <TestComponent />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('mode')).toHaveTextContent('VIEW')
      expect(screen.getByTestId('plan-id')).toHaveTextContent('undefined')
    })
  })

  describe('Hook Usage', () => {
    it('should throw error when used outside provider', () => {
      const originalError = console.error
      console.error = vi.fn()

      expect(() => {
        render(<ComponentWithoutProvider />)
      }).toThrow('usePlanFormMode must be used within a PlanFormModeProvider')

      console.error = originalError
    })

    it('should provide correct context interface', () => {
      const TestContextInterface = () => {
        const context = usePlanFormMode()

        return (
          <div>
            <div data-testid="has-mode">{typeof context.mode}</div>
            <div data-testid="has-planId">{context.planId !== undefined ? typeof context.planId : 'undefined'}</div>
          </div>
        )
      }

      render(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.CREATE}>
          <TestContextInterface />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('has-mode')).toHaveTextContent('string')
      expect(screen.getByTestId('has-planId')).toHaveTextContent('undefined')
    })

    it('should return context value from hook', () => {
      const TestHookReturn = () => {
        const planFormModeContext = usePlanFormMode()

        return (
          <div>
            <div data-testid="context-exists">{planFormModeContext ? 'exists' : 'missing'}</div>
            <div data-testid="context-mode">{planFormModeContext.mode}</div>
          </div>
        )
      }

      render(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.EDIT} planId={999}>
          <TestHookReturn />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('context-exists')).toHaveTextContent('exists')
      expect(screen.getByTestId('context-mode')).toHaveTextContent('EDIT')
    })
  })

  describe('Plan ID Handling', () => {
    it('should handle numeric plan IDs', () => {
      render(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.EDIT} planId={123}>
          <TestComponent />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('plan-id')).toHaveTextContent('123')
    })

    it('should handle zero as valid plan ID', () => {
      render(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.EDIT} planId={0}>
          <TestComponent />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('plan-id')).toHaveTextContent('0')
    })

    it('should handle large plan IDs', () => {
      render(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.VIEW} planId={999999}>
          <TestComponent />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('plan-id')).toHaveTextContent('999999')
    })

    it('should handle missing planId', () => {
      render(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.EDIT}>
          <TestComponent />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('plan-id')).toHaveTextContent('undefined')
    })
  })

  describe('Context Value Stability', () => {
    it('should provide stable mode value', () => {
      const TestModeStability = () => {
        const { mode } = usePlanFormMode()

        return <div data-testid="mode">{mode}</div>
      }

      const { rerender } = render(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.CREATE}>
          <TestModeStability />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('mode')).toHaveTextContent('CREATE')

      /* Re-render with same mode - value should remain the same */
      rerender(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.CREATE}>
          <TestModeStability />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('mode')).toHaveTextContent('CREATE')
    })

    it('should update mode value when provider mode changes', () => {
      const TestModeChange = () => {
        const { mode } = usePlanFormMode()

        return <div data-testid="mode">{mode}</div>
      }

      const { rerender } = render(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.CREATE}>
          <TestModeChange />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('mode')).toHaveTextContent('CREATE')

      rerender(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.EDIT} planId={111}>
          <TestModeChange />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('mode')).toHaveTextContent('EDIT')

      rerender(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.VIEW} planId={222}>
          <TestModeChange />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('mode')).toHaveTextContent('VIEW')
    })

    it('should update planId when provider planId changes', () => {
      const TestPlanIdChange = () => {
        const { planId } = usePlanFormMode()

        return <div data-testid="plan-id">{planId !== undefined ? planId.toString() : 'undefined'}</div>
      }

      const { rerender } = render(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.EDIT} planId={100}>
          <TestPlanIdChange />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('plan-id')).toHaveTextContent('100')

      rerender(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.EDIT} planId={200}>
          <TestPlanIdChange />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('plan-id')).toHaveTextContent('200')

      rerender(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.EDIT}>
          <TestPlanIdChange />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('plan-id')).toHaveTextContent('undefined')
    })
  })

  describe('Multiple Consumers', () => {
    it('should provide same context to multiple consumers', () => {
      const Consumer1 = () => {
        const { mode } = usePlanFormMode()
        return <div data-testid="consumer-1">{mode}</div>
      }

      const Consumer2 = () => {
        const { planId } = usePlanFormMode()
        return <div data-testid="consumer-2">{planId !== undefined ? planId.toString() : 'undefined'}</div>
      }

      const Consumer3 = () => {
        const { mode, planId } = usePlanFormMode()
        return <div data-testid="consumer-3">{`${mode}-${planId !== undefined ? planId : 'none'}`}</div>
      }

      render(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.EDIT} planId={555}>
          <Consumer1 />
          <Consumer2 />
          <Consumer3 />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('consumer-1')).toHaveTextContent('EDIT')
      expect(screen.getByTestId('consumer-2')).toHaveTextContent('555')
      expect(screen.getByTestId('consumer-3')).toHaveTextContent('EDIT-555')
    })

    it('should sync all consumers when mode changes', () => {
      const Consumer1 = () => {
        const { mode } = usePlanFormMode()
        return <div data-testid="consumer-1">{mode}</div>
      }

      const Consumer2 = () => {
        const { planId } = usePlanFormMode()
        return <div data-testid="consumer-2">{planId !== undefined ? planId.toString() : 'undefined'}</div>
      }

      const { rerender } = render(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.CREATE}>
          <Consumer1 />
          <Consumer2 />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('consumer-1')).toHaveTextContent('CREATE')
      expect(screen.getByTestId('consumer-2')).toHaveTextContent('undefined')

      rerender(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.EDIT} planId={777}>
          <Consumer1 />
          <Consumer2 />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('consumer-1')).toHaveTextContent('EDIT')
      expect(screen.getByTestId('consumer-2')).toHaveTextContent('777')
    })
  })

  describe('TypeScript Type Safety', () => {
    it('should accept valid PlanFormMode values', () => {
      const TestTypeEnforcement = () => {
        const { mode } = usePlanFormMode()
        return <div data-testid="mode">{mode}</div>
      }

      expect(() => {
        render(
          <PlanFormModeProvider mode={PLAN_FORM_MODES.CREATE}>
            <TestTypeEnforcement />
          </PlanFormModeProvider>
        )
      }).not.toThrow()

      expect(() => {
        render(
          <PlanFormModeProvider mode={PLAN_FORM_MODES.EDIT} planId={123}>
            <TestTypeEnforcement />
          </PlanFormModeProvider>
        )
      }).not.toThrow()

      expect(() => {
        render(
          <PlanFormModeProvider mode={PLAN_FORM_MODES.VIEW} planId={456}>
            <TestTypeEnforcement />
          </PlanFormModeProvider>
        )
      }).not.toThrow()
    })

    it('should enforce PlanFormModeContextType interface', () => {
      const TestContextShape = () => {
        const context = usePlanFormMode()

        /* Verify context has correct shape */
        const hasMode = 'mode' in context
        const hasPlanId = 'planId' in context

        return (
          <div>
            <div data-testid="has-mode">{hasMode.toString()}</div>
            <div data-testid="has-plan-id">{hasPlanId.toString()}</div>
          </div>
        )
      }

      render(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.CREATE}>
          <TestContextShape />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('has-mode')).toHaveTextContent('true')
      expect(screen.getByTestId('has-plan-id')).toHaveTextContent('true')
    })
  })

  describe('Practical Usage Scenarios', () => {
    it('should support conditional rendering based on mode', () => {
      const TestConditionalRendering = () => {
        const { mode } = usePlanFormMode()

        return (
          <div>
            {mode === PLAN_FORM_MODES.CREATE && <div data-testid="create-content">Create Plan</div>}
            {mode === PLAN_FORM_MODES.EDIT && <div data-testid="edit-content">Edit Plan</div>}
            {mode === PLAN_FORM_MODES.VIEW && <div data-testid="view-content">View Plan Details</div>}
          </div>
        )
      }

      const { rerender } = render(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.CREATE}>
          <TestConditionalRendering />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('create-content')).toBeInTheDocument()
      expect(screen.queryByTestId('edit-content')).not.toBeInTheDocument()
      expect(screen.queryByTestId('view-content')).not.toBeInTheDocument()

      rerender(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.EDIT} planId={123}>
          <TestConditionalRendering />
        </PlanFormModeProvider>
      )

      expect(screen.queryByTestId('create-content')).not.toBeInTheDocument()
      expect(screen.getByTestId('edit-content')).toBeInTheDocument()
      expect(screen.queryByTestId('view-content')).not.toBeInTheDocument()

      rerender(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.VIEW} planId={456}>
          <TestConditionalRendering />
        </PlanFormModeProvider>
      )

      expect(screen.queryByTestId('create-content')).not.toBeInTheDocument()
      expect(screen.queryByTestId('edit-content')).not.toBeInTheDocument()
      expect(screen.getByTestId('view-content')).toBeInTheDocument()
    })

    it('should support button visibility based on mode', () => {
      const TestButtonVisibility = () => {
        const { mode } = usePlanFormMode()
        const isViewMode = mode === PLAN_FORM_MODES.VIEW

        return (
          <div>
            {!isViewMode && <button data-testid="save-button">Save Plan</button>}
            {!isViewMode && <button data-testid="cancel-button">Cancel</button>}
            {isViewMode && <button data-testid="close-button">Close</button>}
          </div>
        )
      }

      const { rerender } = render(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.CREATE}>
          <TestButtonVisibility />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('save-button')).toBeInTheDocument()
      expect(screen.getByTestId('cancel-button')).toBeInTheDocument()
      expect(screen.queryByTestId('close-button')).not.toBeInTheDocument()

      rerender(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.VIEW} planId={789}>
          <TestButtonVisibility />
        </PlanFormModeProvider>
      )

      expect(screen.queryByTestId('save-button')).not.toBeInTheDocument()
      expect(screen.queryByTestId('cancel-button')).not.toBeInTheDocument()
      expect(screen.getByTestId('close-button')).toBeInTheDocument()
    })

    it('should support field disabled state based on mode', () => {
      const TestFieldState = () => {
        const { mode } = usePlanFormMode()
        const isViewMode = mode === PLAN_FORM_MODES.VIEW

        return (
          <div>
            <input
              data-testid="name-input"
              disabled={isViewMode}
              placeholder="Plan Name"
            />
            <input
              data-testid="price-input"
              disabled={isViewMode}
              placeholder="Monthly Price"
            />
          </div>
        )
      }

      const { rerender } = render(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.EDIT} planId={101}>
          <TestFieldState />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('name-input')).not.toBeDisabled()
      expect(screen.getByTestId('price-input')).not.toBeDisabled()

      rerender(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.VIEW} planId={101}>
          <TestFieldState />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('name-input')).toBeDisabled()
      expect(screen.getByTestId('price-input')).toBeDisabled()
    })

    it('should support displaying plan ID in edit mode', () => {
      const TestPlanIdDisplay = () => {
        const { mode, planId } = usePlanFormMode()

        return (
          <div>
            <div data-testid="title">
              {mode === PLAN_FORM_MODES.CREATE && 'Create New Plan'}
              {mode === PLAN_FORM_MODES.EDIT && `Edit Plan #${planId}`}
              {mode === PLAN_FORM_MODES.VIEW && `View Plan #${planId}`}
            </div>
          </div>
        )
      }

      const { rerender } = render(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.CREATE}>
          <TestPlanIdDisplay />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('title')).toHaveTextContent('Create New Plan')

      rerender(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.EDIT} planId={888}>
          <TestPlanIdDisplay />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('title')).toHaveTextContent('Edit Plan #888')

      rerender(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.VIEW} planId={999}>
          <TestPlanIdDisplay />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('title')).toHaveTextContent('View Plan #999')
    })
  })

  describe('Mode Transitions', () => {
    it('should transition from CREATE to EDIT mode', () => {
      const TestModeTransition = () => {
        const { mode, planId } = usePlanFormMode()

        return (
          <div>
            <div data-testid="mode">{mode}</div>
            <div data-testid="plan-id">{planId !== undefined ? planId.toString() : 'undefined'}</div>
          </div>
        )
      }

      const { rerender } = render(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.CREATE}>
          <TestModeTransition />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('mode')).toHaveTextContent('CREATE')
      expect(screen.getByTestId('plan-id')).toHaveTextContent('undefined')

      /* Simulate transitioning to EDIT after successful creation */
      rerender(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.EDIT} planId={123}>
          <TestModeTransition />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('mode')).toHaveTextContent('EDIT')
      expect(screen.getByTestId('plan-id')).toHaveTextContent('123')
    })

    it('should transition from EDIT to VIEW mode', () => {
      const TestModeTransition = () => {
        const { mode } = usePlanFormMode()

        return <div data-testid="mode">{mode}</div>
      }

      const { rerender } = render(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.EDIT} planId={456}>
          <TestModeTransition />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('mode')).toHaveTextContent('EDIT')

      /* Simulate transitioning to VIEW after successful update */
      rerender(
        <PlanFormModeProvider mode={PLAN_FORM_MODES.VIEW} planId={456}>
          <TestModeTransition />
        </PlanFormModeProvider>
      )

      expect(screen.getByTestId('mode')).toHaveTextContent('VIEW')
    })
  })
})
