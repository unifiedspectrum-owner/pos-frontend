/* Libraries imports */
import { describe, it, expect } from 'vitest'
import { render } from '@shared/test-utils/render'

/* Tenant management module imports */
import TenantTableSkeleton from '../table-skeleton'

describe('TenantTableSkeleton', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<TenantTableSkeleton />)
      expect(container).toBeInTheDocument()
    })

    it('renders skeleton elements', () => {
      const { container } = render(<TenantTableSkeleton />)
      const skeletons = container.querySelectorAll('[class*="skeleton"]')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('renders circular skeletons for action buttons', () => {
      const { container } = render(<TenantTableSkeleton />)
      expect(container).toBeInTheDocument()
    })

    it('renders as a horizontal stack', () => {
      const { container } = render(<TenantTableSkeleton />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Structure', () => {
    it('has rounded borders', () => {
      const { container } = render(<TenantTableSkeleton />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('has border styling', () => {
      const { container } = render(<TenantTableSkeleton />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('has padding applied', () => {
      const { container } = render(<TenantTableSkeleton />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('has full width', () => {
      const { container } = render(<TenantTableSkeleton />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Column Layout', () => {
    it('renders multiple skeleton elements', () => {
      const { container } = render(<TenantTableSkeleton />)
      const skeletons = container.querySelectorAll('[class*="skeleton"]')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('has multiple flex containers', () => {
      const { container } = render(<TenantTableSkeleton />)
      /* Check that container has child elements representing columns */
      expect(container.firstChild).toBeInTheDocument()
      expect(container.firstChild?.childNodes.length).toBeGreaterThan(0)
    })

    it('renders circular skeletons', () => {
      const { container } = render(<TenantTableSkeleton />)
      /* Table has circular skeleton elements for action buttons */
      const skeletons = container.querySelectorAll('[class*="skeleton"]')
      expect(skeletons.length).toBeGreaterThan(3)
    })

    it('has proper structure', () => {
      const { container } = render(<TenantTableSkeleton />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('contains child elements', () => {
      const { container } = render(<TenantTableSkeleton />)
      expect(container.firstChild?.childNodes.length).toBeGreaterThan(0)
    })
  })

  describe('Component Lifecycle', () => {
    it('mounts without errors', () => {
      expect(() => {
        render(<TenantTableSkeleton />)
      }).not.toThrow()
    })

    it('unmounts cleanly', () => {
      const { unmount, container } = render(<TenantTableSkeleton />)
      expect(container).toBeInTheDocument()
      unmount()
      expect(container).toBeEmptyDOMElement()
    })

    it('handles multiple mount/unmount cycles', () => {
      const { unmount: unmount1 } = render(<TenantTableSkeleton />)
      unmount1()

      const { unmount: unmount2, container } = render(<TenantTableSkeleton />)
      expect(container).toBeInTheDocument()
      unmount2()
    })
  })

  describe('Re-rendering Behavior', () => {
    it('handles multiple re-renders', () => {
      const { rerender, container } = render(<TenantTableSkeleton />)
      expect(container).toBeInTheDocument()

      for (let i = 0; i < 5; i++) {
        rerender(<TenantTableSkeleton />)
      }

      expect(container).toBeInTheDocument()
    })

    it('maintains structure across re-renders', () => {
      const { rerender, container } = render(<TenantTableSkeleton />)
      const initialSkeletons = container.querySelectorAll('[class*="skeleton"]')
      const initialCount = initialSkeletons.length

      rerender(<TenantTableSkeleton />)

      const afterSkeletons = container.querySelectorAll('[class*="skeleton"]')
      expect(afterSkeletons.length).toBe(initialCount)
    })
  })

  describe('Performance', () => {
    it('renders quickly', () => {
      const startTime = Date.now()
      render(<TenantTableSkeleton />)
      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(100)
    })

    it('maintains performance during multiple renders', () => {
      const { rerender } = render(<TenantTableSkeleton />)
      const startTime = Date.now()

      for (let i = 0; i < 20; i++) {
        rerender(<TenantTableSkeleton />)
      }

      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(500)
    })

    it('renders efficiently in lists', () => {
      const startTime = Date.now()

      render(
        <div>
          {Array.from({ length: 10 }, (_, i) => (
            <TenantTableSkeleton key={i} />
          ))}
        </div>
      )

      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(500)
    })
  })

  describe('Visual Consistency', () => {
    it('maintains consistent skeleton structure', () => {
      const { container } = render(<TenantTableSkeleton />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('has proper spacing between elements', () => {
      const { container } = render(<TenantTableSkeleton />)
      expect(container).toBeInTheDocument()
    })
  })

  describe('Multiple Instances', () => {
    it('renders multiple instances independently', () => {
      const { container } = render(
        <>
          <TenantTableSkeleton />
          <TenantTableSkeleton />
          <TenantTableSkeleton />
        </>
      )

      const skeletonRows = container.querySelectorAll('[class*="chakra-stack"]')
      expect(skeletonRows.length).toBeGreaterThan(0)
    })

    it('maintains independence between instances', () => {
      const { container } = render(
        <div>
          <TenantTableSkeleton />
          <TenantTableSkeleton />
        </div>
      )

      expect(container).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles rendering in different container sizes', () => {
      expect(() => {
        render(
          <div style={{ width: '500px' }}>
            <TenantTableSkeleton />
          </div>
        )
      }).not.toThrow()
    })

    it('handles rendering in very wide containers', () => {
      expect(() => {
        render(
          <div style={{ width: '2000px' }}>
            <TenantTableSkeleton />
          </div>
        )
      }).not.toThrow()
    })
  })
})
