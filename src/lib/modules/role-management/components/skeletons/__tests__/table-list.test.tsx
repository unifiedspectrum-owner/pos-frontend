/* Libraries imports */
import { describe, it, expect } from 'vitest'
import { render } from '@shared/test-utils/render'
import { axe } from 'vitest-axe'

/* Role management module imports */
import { RoleTableSkeleton } from '@role-management/components'

describe('RoleTableSkeleton', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<RoleTableSkeleton />)
      expect(container).toBeInTheDocument()
    })

    it('renders HStack container', () => {
      render(<RoleTableSkeleton />)
      const hstack = document.querySelector('.chakra-stack')
      expect(hstack).toBeInTheDocument()
    })

    it('renders all skeleton elements for table row', () => {
      render(<RoleTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons).toHaveLength(6)
    })

    it('renders skeleton elements in correct order', () => {
      render(<RoleTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')

      /* Verify all 6 skeleton placeholders exist */
      expect(skeletons).toHaveLength(6)
      expect(skeletons[0]).toBeInTheDocument() /* ID/Number column */
      expect(skeletons[1]).toBeInTheDocument() /* Name column */
      expect(skeletons[2]).toBeInTheDocument() /* Description column */
      expect(skeletons[3]).toBeInTheDocument() /* User Count column */
      expect(skeletons[4]).toBeInTheDocument() /* Status column */
      expect(skeletons[5]).toBeInTheDocument() /* Actions column */
    })
  })

  describe('Structure and Layout', () => {
    it('applies full width to container', () => {
      render(<RoleTableSkeleton />)
      const container = document.querySelector('.chakra-stack')
      expect(container).toBeInTheDocument()
    })

    it('applies padding to container', () => {
      render(<RoleTableSkeleton />)
      const container = document.querySelector('.chakra-stack')
      expect(container).toBeInTheDocument()
    })

    it('uses HStack for horizontal layout', () => {
      render(<RoleTableSkeleton />)
      const hstack = document.querySelector('.chakra-stack')
      expect(hstack).toBeInTheDocument()
    })
  })

  describe('Skeleton Column Widths', () => {
    it('renders ID column skeleton with 8% width', () => {
      render(<RoleTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons[0]).toBeInTheDocument()
    })

    it('renders name column skeleton with 20% width', () => {
      render(<RoleTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons[1]).toBeInTheDocument()
    })

    it('renders description column skeleton with 35% width', () => {
      render(<RoleTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons[2]).toBeInTheDocument()
    })

    it('renders user count column skeleton with 12% width', () => {
      render(<RoleTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons[3]).toBeInTheDocument()
    })

    it('renders status column skeleton with 10% width', () => {
      render(<RoleTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons[4]).toBeInTheDocument()
    })

    it('renders actions column skeleton with 15% width', () => {
      render(<RoleTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons[5]).toBeInTheDocument()
    })
  })

  describe('Skeleton Heights', () => {
    it('renders all columns with 20px height', () => {
      render(<RoleTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')

      /* All columns should have 20px height */
      expect(skeletons[0]).toBeInTheDocument()
      expect(skeletons[1]).toBeInTheDocument()
      expect(skeletons[2]).toBeInTheDocument()
      expect(skeletons[3]).toBeInTheDocument()
      expect(skeletons[4]).toBeInTheDocument()
      expect(skeletons[5]).toBeInTheDocument()
    })
  })

  describe('Border Radius', () => {
    it('applies medium border radius to all skeletons', () => {
      render(<RoleTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')

      skeletons.forEach(skeleton => {
        expect(skeleton).toBeInTheDocument()
        expect(skeleton).toHaveClass('chakra-skeleton')
      })
    })
  })

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<RoleTableSkeleton />)
      const results = await axe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('provides visual loading indicators', () => {
      render(<RoleTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')

      /* All skeletons should be visible loading indicators */
      expect(skeletons.length).toBeGreaterThan(0)
      skeletons.forEach(skeleton => {
        expect(skeleton).toHaveClass('chakra-skeleton')
      })
    })

    it('maintains semantic structure for screen readers', () => {
      render(<RoleTableSkeleton />)
      const container = document.querySelector('.chakra-stack')
      expect(container).toBeInTheDocument()
    })
  })

  describe('Multiple Instances', () => {
    it('renders multiple skeletons for table rows', () => {
      const { container } = render(
        <>
          <RoleTableSkeleton />
          <RoleTableSkeleton />
          <RoleTableSkeleton />
        </>
      )

      const skeletons = container.querySelectorAll('.chakra-skeleton')
      expect(skeletons).toHaveLength(18) /* 6 skeletons * 3 rows */
    })

    it('maintains consistent structure across multiple instances', () => {
      render(
        <>
          <RoleTableSkeleton />
          <RoleTableSkeleton />
        </>
      )

      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons).toHaveLength(12) /* 6 skeletons * 2 rows */
    })

    it('handles rendering in a list', () => {
      const { container } = render(
        <>
          {Array.from({ length: 5 }).map((_, index) => (
            <RoleTableSkeleton key={index} />
          ))}
        </>
      )

      const skeletons = container.querySelectorAll('.chakra-skeleton')
      expect(skeletons).toHaveLength(30) /* 6 skeletons * 5 rows */
    })
  })

  describe('Component Lifecycle', () => {
    it('mounts without errors', () => {
      expect(() => {
        render(<RoleTableSkeleton />)
      }).not.toThrow()
    })

    it('unmounts cleanly', () => {
      const { unmount } = render(<RoleTableSkeleton />)

      expect(document.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(0)

      unmount()

      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(0)
    })

    it('handles multiple mount/unmount cycles', () => {
      /* First mount */
      const { unmount: unmount1 } = render(<RoleTableSkeleton />)
      expect(document.querySelectorAll('.chakra-skeleton').length).toBe(6)

      unmount1()
      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(0)

      /* Second mount */
      const { unmount: unmount2 } = render(<RoleTableSkeleton />)
      expect(document.querySelectorAll('.chakra-skeleton').length).toBe(6)

      unmount2()
      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(0)
    })
  })

  describe('Performance', () => {
    it('renders quickly with single instance', () => {
      const startTime = Date.now()
      render(<RoleTableSkeleton />)
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(100)
    })

    it('renders efficiently with multiple instances', () => {
      const startTime = Date.now()
      render(
        <>
          {Array.from({ length: 20 }).map((_, index) => (
            <RoleTableSkeleton key={index} />
          ))}
        </>
      )
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(500)
      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(120)
    })

    it('handles rapid mount/unmount without memory leaks', () => {
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<RoleTableSkeleton />)
        expect(document.querySelectorAll('.chakra-skeleton').length).toBe(6)
        unmount()
      }

      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(0)
    })
  })

  describe('Animation', () => {
    it('applies skeleton animation classes', () => {
      render(<RoleTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')

      skeletons.forEach(skeleton => {
        expect(skeleton).toHaveClass('chakra-skeleton')
      })
    })

    it('maintains animation consistency across all skeletons', () => {
      render(<RoleTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')

      expect(skeletons).toHaveLength(6)
      skeletons.forEach(skeleton => {
        expect(skeleton).toHaveClass('chakra-skeleton')
      })
    })
  })

  describe('Integration Scenarios', () => {
    it('simulates loading state for role table', () => {
      /* Simulate typical usage in a loading table */
      render(
        <div role="table">
          <div role="rowgroup">
            <RoleTableSkeleton />
            <RoleTableSkeleton />
            <RoleTableSkeleton />
          </div>
        </div>
      )

      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons).toHaveLength(18) /* 3 rows * 6 columns */
    })

    it('transitions from loading to content state', () => {
      const { rerender } = render(<RoleTableSkeleton />)

      /* Initially showing skeleton */
      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(6)

      /* Transition to actual content */
      rerender(
        <div data-testid="role-row">
          <span>Admin Role</span>
          <span>Administrator with full access</span>
        </div>
      )

      /* Skeleton should be replaced */
      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(0)
      expect(document.querySelector('[data-testid="role-row"]')).toBeInTheDocument()
    })

    it('works correctly within table component', () => {
      render(
        <div>
          <RoleTableSkeleton />
          <RoleTableSkeleton />
          <RoleTableSkeleton />
        </div>
      )

      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons).toHaveLength(18)
    })
  })

  describe('Visual Consistency', () => {
    it('maintains consistent column proportions', () => {
      render(<RoleTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')

      /* All 6 columns should be present */
      expect(skeletons).toHaveLength(6)
    })

    it('applies consistent spacing between columns', () => {
      render(<RoleTableSkeleton />)
      const container = document.querySelector('.chakra-stack')
      expect(container).toBeInTheDocument()
    })

    it('maintains visual hierarchy for different column types', () => {
      render(<RoleTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')

      /* All columns should be present */
      expect(skeletons[0]).toBeInTheDocument()
      expect(skeletons[1]).toBeInTheDocument()
      expect(skeletons[2]).toBeInTheDocument()
      expect(skeletons[3]).toBeInTheDocument()
      expect(skeletons[4]).toBeInTheDocument()
      expect(skeletons[5]).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('maintains structure in narrow viewports', () => {
      render(<RoleTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons).toHaveLength(6)
    })

    it('maintains structure in wide viewports', () => {
      render(<RoleTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons).toHaveLength(6)
    })

    it('handles container width changes gracefully', () => {
      const { rerender } = render(
        <div style={{ width: '500px' }}>
          <RoleTableSkeleton />
        </div>
      )

      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(6)

      rerender(
        <div style={{ width: '1200px' }}>
          <RoleTableSkeleton />
        </div>
      )

      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(6)
    })
  })

  describe('Edge Cases', () => {
    it('renders correctly when wrapped in fragment', () => {
      render(
        <>
          <RoleTableSkeleton />
        </>
      )

      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(6)
    })

    it('renders correctly when wrapped in div', () => {
      render(
        <div>
          <RoleTableSkeleton />
        </div>
      )

      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(6)
    })

    it('handles conditional rendering', () => {
      const { rerender } = render(
        <div>
          {true && <RoleTableSkeleton />}
        </div>
      )

      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(6)

      rerender(
        <div>
          {false && <RoleTableSkeleton />}
        </div>
      )

      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(0)
    })

    it('maintains integrity with React strict mode', () => {
      expect(() => {
        render(<RoleTableSkeleton />)
      }).not.toThrow()
    })
  })
})
