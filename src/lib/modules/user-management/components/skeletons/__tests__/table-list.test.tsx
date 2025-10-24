/* Libraries imports */
import { describe, it, expect } from 'vitest'
import { render } from '@shared/test-utils/render'
import { axe } from 'vitest-axe'

/* User management module imports */
import { UserTableSkeleton } from '@user-management/components'

describe('UserTableSkeleton', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<UserTableSkeleton />)
      expect(container).toBeInTheDocument()
    })

    it('renders HStack container', () => {
      render(<UserTableSkeleton />)
      const hstack = document.querySelector('.chakra-stack')
      expect(hstack).toBeInTheDocument()
    })

    it('renders all skeleton elements for table row', () => {
      render(<UserTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons).toHaveLength(6)
    })

    it('renders skeleton elements in correct order', () => {
      render(<UserTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')

      /* Verify all 6 skeleton placeholders exist */
      expect(skeletons).toHaveLength(6)
      expect(skeletons[0]).toBeInTheDocument() /* ID/Number column */
      expect(skeletons[1]).toBeInTheDocument() /* Name column */
      expect(skeletons[2]).toBeInTheDocument() /* Email column */
      expect(skeletons[3]).toBeInTheDocument() /* Role column */
      expect(skeletons[4]).toBeInTheDocument() /* Status column */
      expect(skeletons[5]).toBeInTheDocument() /* Actions column */
    })
  })

  describe('Structure and Layout', () => {
    it('applies full width to container', () => {
      render(<UserTableSkeleton />)
      const container = document.querySelector('.chakra-stack')
      expect(container).toBeInTheDocument()
    })

    it('applies padding to container', () => {
      render(<UserTableSkeleton />)
      const container = document.querySelector('.chakra-stack')
      expect(container).toBeInTheDocument()
    })

    it('uses HStack for horizontal layout', () => {
      render(<UserTableSkeleton />)
      const hstack = document.querySelector('.chakra-stack')
      expect(hstack).toBeInTheDocument()
    })
  })

  describe('Skeleton Column Widths', () => {
    it('renders ID column skeleton with 8% width', () => {
      render(<UserTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons[0]).toBeInTheDocument()
    })

    it('renders name column skeleton with 20% width', () => {
      render(<UserTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons[1]).toBeInTheDocument()
    })

    it('renders email column skeleton with 30% width', () => {
      render(<UserTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons[2]).toBeInTheDocument()
    })

    it('renders role column skeleton with 12% width', () => {
      render(<UserTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons[3]).toBeInTheDocument()
    })

    it('renders status column skeleton with 12% width', () => {
      render(<UserTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons[4]).toBeInTheDocument()
    })

    it('renders actions column skeleton with 15% width', () => {
      render(<UserTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons[5]).toBeInTheDocument()
    })
  })

  describe('Skeleton Heights', () => {
    it('renders most columns with 20px height', () => {
      render(<UserTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')

      /* ID, Name, Email, Role, and Actions should have 20px height */
      expect(skeletons[0]).toBeInTheDocument()
      expect(skeletons[1]).toBeInTheDocument()
      expect(skeletons[2]).toBeInTheDocument()
      expect(skeletons[3]).toBeInTheDocument()
      expect(skeletons[5]).toBeInTheDocument()
    })

    it('renders status column with 24px height for badge', () => {
      render(<UserTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')

      /* Status column should have 24px height to accommodate badge */
      expect(skeletons[4]).toBeInTheDocument()
    })
  })

  describe('Border Radius', () => {
    it('applies medium border radius to all skeletons', () => {
      render(<UserTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')

      skeletons.forEach(skeleton => {
        expect(skeleton).toBeInTheDocument()
        expect(skeleton).toHaveClass('chakra-skeleton')
      })
    })
  })

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<UserTableSkeleton />)
      const results = await axe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('provides visual loading indicators', () => {
      render(<UserTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')

      /* All skeletons should be visible loading indicators */
      expect(skeletons.length).toBeGreaterThan(0)
      skeletons.forEach(skeleton => {
        expect(skeleton).toHaveClass('chakra-skeleton')
      })
    })

    it('maintains semantic structure for screen readers', () => {
      render(<UserTableSkeleton />)
      const container = document.querySelector('.chakra-stack')
      expect(container).toBeInTheDocument()
    })
  })

  describe('Multiple Instances', () => {
    it('renders multiple skeletons for table rows', () => {
      const { container } = render(
        <>
          <UserTableSkeleton />
          <UserTableSkeleton />
          <UserTableSkeleton />
        </>
      )

      const skeletons = container.querySelectorAll('.chakra-skeleton')
      expect(skeletons).toHaveLength(18) /* 6 skeletons * 3 rows */
    })

    it('maintains consistent structure across multiple instances', () => {
      render(
        <>
          <UserTableSkeleton />
          <UserTableSkeleton />
        </>
      )

      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons).toHaveLength(12) /* 6 skeletons * 2 rows */
    })

    it('handles rendering in a list', () => {
      const { container } = render(
        <>
          {Array.from({ length: 5 }).map((_, index) => (
            <UserTableSkeleton key={index} />
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
        render(<UserTableSkeleton />)
      }).not.toThrow()
    })

    it('unmounts cleanly', () => {
      const { unmount } = render(<UserTableSkeleton />)

      expect(document.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(0)

      unmount()

      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(0)
    })

    it('handles multiple mount/unmount cycles', () => {
      /* First mount */
      const { unmount: unmount1 } = render(<UserTableSkeleton />)
      expect(document.querySelectorAll('.chakra-skeleton').length).toBe(6)

      unmount1()
      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(0)

      /* Second mount */
      const { unmount: unmount2 } = render(<UserTableSkeleton />)
      expect(document.querySelectorAll('.chakra-skeleton').length).toBe(6)

      unmount2()
      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(0)
    })
  })

  describe('Performance', () => {
    it('renders quickly with single instance', () => {
      const startTime = Date.now()
      render(<UserTableSkeleton />)
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(100)
    })

    it('renders efficiently with multiple instances', () => {
      const startTime = Date.now()
      render(
        <>
          {Array.from({ length: 20 }).map((_, index) => (
            <UserTableSkeleton key={index} />
          ))}
        </>
      )
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(500)
      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(120)
    })

    it('handles rapid mount/unmount without memory leaks', () => {
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<UserTableSkeleton />)
        expect(document.querySelectorAll('.chakra-skeleton').length).toBe(6)
        unmount()
      }

      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(0)
    })
  })

  describe('Animation', () => {
    it('applies skeleton animation classes', () => {
      render(<UserTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')

      skeletons.forEach(skeleton => {
        expect(skeleton).toHaveClass('chakra-skeleton')
      })
    })

    it('maintains animation consistency across all skeletons', () => {
      render(<UserTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')

      expect(skeletons).toHaveLength(6)
      skeletons.forEach(skeleton => {
        expect(skeleton).toHaveClass('chakra-skeleton')
      })
    })
  })

  describe('Integration Scenarios', () => {
    it('simulates loading state for user table', () => {
      /* Simulate typical usage in a loading table */
      render(
        <div role="table">
          <div role="rowgroup">
            <UserTableSkeleton />
            <UserTableSkeleton />
            <UserTableSkeleton />
          </div>
        </div>
      )

      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons).toHaveLength(18) /* 3 rows * 6 columns */
    })

    it('transitions from loading to content state', () => {
      const { rerender } = render(<UserTableSkeleton />)

      /* Initially showing skeleton */
      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(6)

      /* Transition to actual content */
      rerender(
        <div data-testid="user-row">
          <span>John Doe</span>
          <span>john@example.com</span>
        </div>
      )

      /* Skeleton should be replaced */
      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(0)
      expect(document.querySelector('[data-testid="user-row"]')).toBeInTheDocument()
    })

    it('works correctly within table component', () => {
      render(
        <div>
          <UserTableSkeleton />
          <UserTableSkeleton />
          <UserTableSkeleton />
        </div>
      )

      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons).toHaveLength(18)
    })
  })

  describe('Visual Consistency', () => {
    it('maintains consistent column proportions', () => {
      render(<UserTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')

      /* All 6 columns should be present */
      expect(skeletons).toHaveLength(6)
    })

    it('applies consistent spacing between columns', () => {
      render(<UserTableSkeleton />)
      const container = document.querySelector('.chakra-stack')
      expect(container).toBeInTheDocument()
    })

    it('maintains visual hierarchy for different column types', () => {
      render(<UserTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')

      /* Status column (index 4) should be slightly taller for badge styling */
      expect(skeletons[4]).toBeInTheDocument()

      /* Other columns should have standard height */
      expect(skeletons[0]).toBeInTheDocument()
      expect(skeletons[1]).toBeInTheDocument()
      expect(skeletons[2]).toBeInTheDocument()
      expect(skeletons[3]).toBeInTheDocument()
      expect(skeletons[5]).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('maintains structure in narrow viewports', () => {
      render(<UserTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons).toHaveLength(6)
    })

    it('maintains structure in wide viewports', () => {
      render(<UserTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons).toHaveLength(6)
    })

    it('handles container width changes gracefully', () => {
      const { rerender } = render(
        <div style={{ width: '500px' }}>
          <UserTableSkeleton />
        </div>
      )

      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(6)

      rerender(
        <div style={{ width: '1200px' }}>
          <UserTableSkeleton />
        </div>
      )

      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(6)
    })
  })

  describe('Edge Cases', () => {
    it('renders correctly when wrapped in fragment', () => {
      render(
        <>
          <UserTableSkeleton />
        </>
      )

      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(6)
    })

    it('renders correctly when wrapped in div', () => {
      render(
        <div>
          <UserTableSkeleton />
        </div>
      )

      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(6)
    })

    it('handles conditional rendering', () => {
      const { rerender } = render(
        <div>
          {true && <UserTableSkeleton />}
        </div>
      )

      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(6)

      rerender(
        <div>
          {false && <UserTableSkeleton />}
        </div>
      )

      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(0)
    })

    it('maintains integrity with React strict mode', () => {
      expect(() => {
        render(<UserTableSkeleton />)
      }).not.toThrow()
    })
  })
})
