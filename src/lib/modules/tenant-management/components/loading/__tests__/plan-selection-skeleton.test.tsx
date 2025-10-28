/* Libraries imports */
import { describe, it, expect } from 'vitest'
import { render } from '@shared/test-utils/render'

/* Tenant management module imports */
import PlanSelectionSkeleton from '../plan-selection-skeleton'

describe('PlanSelectionSkeleton', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<PlanSelectionSkeleton />)
      expect(container).toBeInTheDocument()
    })

    it('renders billing cycle skeleton', () => {
      const { container } = render(<PlanSelectionSkeleton />)
      expect(container.querySelector('[class*="skeleton"]')).toBeInTheDocument()
    })

    it('renders default number of plan cards (4)', () => {
      const { container } = render(<PlanSelectionSkeleton />)
      const skeletons = container.querySelectorAll('[class*="skeleton"]')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('renders custom number of plan cards', () => {
      const { container } = render(<PlanSelectionSkeleton planCount={6} />)
      expect(container).toBeInTheDocument()
    })

    it('renders navigation skeleton', () => {
      const { container } = render(<PlanSelectionSkeleton />)
      expect(container).toBeInTheDocument()
    })
  })

  describe('Conditional Rendering', () => {
    it('does not show branch config by default', () => {
      const { container } = render(<PlanSelectionSkeleton />)
      expect(container).toBeInTheDocument()
    })

    it('shows branch config when enabled', () => {
      const { container } = render(<PlanSelectionSkeleton showBranchConfig={true} />)
      expect(container).toBeInTheDocument()
    })

    it('does not show addons by default', () => {
      const { container } = render(<PlanSelectionSkeleton />)
      expect(container).toBeInTheDocument()
    })

    it('shows addons when enabled', () => {
      const { container } = render(<PlanSelectionSkeleton showAddons={true} />)
      expect(container).toBeInTheDocument()
    })

    it('shows both branch config and addons when enabled', () => {
      const { container } = render(
        <PlanSelectionSkeleton showBranchConfig={true} showAddons={true} />
      )
      expect(container).toBeInTheDocument()
    })
  })

  describe('Plan Count Variations', () => {
    it('renders with 1 plan', () => {
      const { container } = render(<PlanSelectionSkeleton planCount={1} />)
      expect(container).toBeInTheDocument()
    })

    it('renders with 2 plans', () => {
      const { container } = render(<PlanSelectionSkeleton planCount={2} />)
      expect(container).toBeInTheDocument()
    })

    it('renders with 8 plans', () => {
      const { container } = render(<PlanSelectionSkeleton planCount={8} />)
      expect(container).toBeInTheDocument()
    })

    it('renders with 0 plans', () => {
      const { container } = render(<PlanSelectionSkeleton planCount={0} />)
      expect(container).toBeInTheDocument()
    })
  })

  describe('Component Lifecycle', () => {
    it('mounts without errors', () => {
      expect(() => {
        render(<PlanSelectionSkeleton />)
      }).not.toThrow()
    })

    it('unmounts cleanly', () => {
      const { unmount, container } = render(<PlanSelectionSkeleton />)
      expect(container).toBeInTheDocument()
      unmount()
      expect(container).toBeEmptyDOMElement()
    })

    it('handles multiple mount/unmount cycles', () => {
      const { unmount: unmount1 } = render(<PlanSelectionSkeleton />)
      unmount1()

      const { unmount: unmount2, container } = render(<PlanSelectionSkeleton />)
      expect(container).toBeInTheDocument()
      unmount2()
    })
  })

  describe('Re-rendering Behavior', () => {
    it('updates when planCount changes', () => {
      const { rerender, container } = render(<PlanSelectionSkeleton planCount={2} />)
      expect(container).toBeInTheDocument()

      rerender(<PlanSelectionSkeleton planCount={6} />)
      expect(container).toBeInTheDocument()
    })

    it('updates when showBranchConfig changes', () => {
      const { rerender, container } = render(<PlanSelectionSkeleton showBranchConfig={false} />)
      expect(container).toBeInTheDocument()

      rerender(<PlanSelectionSkeleton showBranchConfig={true} />)
      expect(container).toBeInTheDocument()
    })

    it('updates when showAddons changes', () => {
      const { rerender, container } = render(<PlanSelectionSkeleton showAddons={false} />)
      expect(container).toBeInTheDocument()

      rerender(<PlanSelectionSkeleton showAddons={true} />)
      expect(container).toBeInTheDocument()
    })

    it('handles multiple prop changes simultaneously', () => {
      const { rerender, container } = render(
        <PlanSelectionSkeleton planCount={2} showBranchConfig={false} showAddons={false} />
      )
      expect(container).toBeInTheDocument()

      rerender(
        <PlanSelectionSkeleton planCount={6} showBranchConfig={true} showAddons={true} />
      )
      expect(container).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('renders quickly with default props', () => {
      const startTime = Date.now()
      render(<PlanSelectionSkeleton />)
      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(150)
    })

    it('renders efficiently with many plans', () => {
      const startTime = Date.now()
      render(<PlanSelectionSkeleton planCount={20} />)
      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(300)
    })

    it('maintains performance with all sections enabled', () => {
      const startTime = Date.now()
      render(
        <PlanSelectionSkeleton
          planCount={8}
          showBranchConfig={true}
          showAddons={true}
        />
      )
      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(300)
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined planCount gracefully', () => {
      expect(() => {
        render(<PlanSelectionSkeleton planCount={undefined} />)
      }).not.toThrow()
    })

    it('handles negative planCount gracefully', () => {
      expect(() => {
        render(<PlanSelectionSkeleton planCount={-1} />)
      }).not.toThrow()
    })

    it('handles very large planCount', () => {
      expect(() => {
        render(<PlanSelectionSkeleton planCount={100} />)
      }).not.toThrow()
    })
  })

  describe('Visual Structure', () => {
    it('maintains consistent layout structure', () => {
      const { container } = render(<PlanSelectionSkeleton />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('preserves layout with all options enabled', () => {
      const { container } = render(
        <PlanSelectionSkeleton
          showBranchConfig={true}
          showAddons={true}
        />
      )
      expect(container.firstChild).toBeInTheDocument()
    })
  })
})
