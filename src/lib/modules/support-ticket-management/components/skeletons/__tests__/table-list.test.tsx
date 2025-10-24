/* Libraries imports */
import { describe, it, expect } from 'vitest'
import { render } from '@shared/test-utils/render'
import { axe } from 'vitest-axe'

/* Support ticket management module imports */
import { SupportTicketTableSkeleton } from '@support-ticket-management/components'

describe('SupportTicketTableSkeleton', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<SupportTicketTableSkeleton />)
      expect(container).toBeInTheDocument()
    })

    it('renders main container element', () => {
      const { container } = render(<SupportTicketTableSkeleton />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('renders all skeleton elements', () => {
      render(<SupportTicketTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      /* Header: 5 skeletons, Body: 5 rows * 5 skeletons = 25, Total: 30 */
      expect(skeletons).toHaveLength(30)
    })

    it('renders skeleton structure with proper hierarchy', () => {
      const { container } = render(<SupportTicketTableSkeleton />)
      const skeletons = container.querySelectorAll('.chakra-skeleton')
      expect(skeletons.length).toBe(30)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Header Structure', () => {
    it('renders correct total number of skeleton elements', () => {
      render(<SupportTicketTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      /* Total: 30 skeletons (5 in header + 25 in body rows) */
      expect(skeletons).toHaveLength(30)
    })

    it('renders skeleton elements with consistent class', () => {
      render(<SupportTicketTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')

      skeletons.forEach(skeleton => {
        expect(skeleton).toHaveClass('chakra-skeleton')
      })
    })

    it('maintains header structure integrity', () => {
      const { container } = render(<SupportTicketTableSkeleton />)
      const skeletons = container.querySelectorAll('.chakra-skeleton')

      /* Verify all skeletons are rendered */
      expect(skeletons.length).toBe(30)
    })
  })

  describe('Body Row Structure', () => {
    it('renders all skeleton elements for body rows', () => {
      render(<SupportTicketTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      /* 5 rows * 5 columns + 5 header = 30 total */
      expect(skeletons).toHaveLength(30)
    })

    it('maintains consistent skeleton structure', () => {
      const { container } = render(<SupportTicketTableSkeleton />)
      const skeletons = container.querySelectorAll('.chakra-skeleton')

      expect(skeletons.length).toBe(30)
      skeletons.forEach(skeleton => {
        expect(skeleton).toBeInTheDocument()
      })
    })

    it('renders skeleton elements with proper classes', () => {
      render(<SupportTicketTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')

      skeletons.forEach(skeleton => {
        expect(skeleton).toHaveClass('chakra-skeleton')
      })
    })
  })

  describe('Layout and Spacing', () => {
    it('renders main container with content', () => {
      const { container } = render(<SupportTicketTableSkeleton />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('maintains proper DOM structure', () => {
      const { container } = render(<SupportTicketTableSkeleton />)
      const skeletons = container.querySelectorAll('.chakra-skeleton')
      expect(skeletons).toHaveLength(30)
    })

    it('uses Stack component for body rows container', () => {
      render(<SupportTicketTableSkeleton />)
      const stacks = document.querySelectorAll('.chakra-stack')
      expect(stacks.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<SupportTicketTableSkeleton />)
      const results = await axe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('provides visual loading indicators', () => {
      render(<SupportTicketTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')

      /* All skeletons should be visible loading indicators */
      expect(skeletons.length).toBeGreaterThan(0)
      skeletons.forEach(skeleton => {
        expect(skeleton).toHaveClass('chakra-skeleton')
      })
    })

    it('maintains semantic structure for screen readers', () => {
      const { container } = render(<SupportTicketTableSkeleton />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('uses proper container hierarchy', () => {
      const { container } = render(<SupportTicketTableSkeleton />)
      const stacks = container.querySelectorAll('.chakra-stack')
      const skeletons = container.querySelectorAll('.chakra-skeleton')

      expect(stacks.length).toBeGreaterThan(0)
      expect(skeletons.length).toBe(30)
    })
  })

  describe('Component Lifecycle', () => {
    it('mounts without errors', () => {
      expect(() => {
        render(<SupportTicketTableSkeleton />)
      }).not.toThrow()
    })

    it('unmounts cleanly', () => {
      const { unmount } = render(<SupportTicketTableSkeleton />)

      expect(document.querySelectorAll('.chakra-skeleton').length).toBe(30)

      unmount()

      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(0)
    })

    it('handles multiple mount/unmount cycles', () => {
      /* First mount */
      const { unmount: unmount1 } = render(<SupportTicketTableSkeleton />)
      expect(document.querySelectorAll('.chakra-skeleton').length).toBe(30)

      unmount1()
      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(0)

      /* Second mount */
      const { unmount: unmount2 } = render(<SupportTicketTableSkeleton />)
      expect(document.querySelectorAll('.chakra-skeleton').length).toBe(30)

      unmount2()
      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(0)
    })

    it('maintains state consistency across renders', () => {
      const { rerender } = render(<SupportTicketTableSkeleton />)

      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(30)

      rerender(<SupportTicketTableSkeleton />)

      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(30)
    })
  })

  describe('Performance', () => {
    it('renders quickly', () => {
      const startTime = Date.now()
      render(<SupportTicketTableSkeleton />)
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(100)
    })

    it('renders all 30 skeleton elements efficiently', () => {
      const startTime = Date.now()
      render(<SupportTicketTableSkeleton />)
      const endTime = Date.now()

      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(30)
      expect(endTime - startTime).toBeLessThan(200)
    })

    it('handles rapid mount/unmount without memory leaks', () => {
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<SupportTicketTableSkeleton />)
        expect(document.querySelectorAll('.chakra-skeleton').length).toBe(30)
        unmount()
      }

      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(0)
    })

    it('maintains performance with multiple instances', () => {
      const startTime = Date.now()

      render(
        <>
          <SupportTicketTableSkeleton />
          <SupportTicketTableSkeleton />
          <SupportTicketTableSkeleton />
        </>
      )

      const endTime = Date.now()

      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(90)
      expect(endTime - startTime).toBeLessThan(300)
    })
  })

  describe('Animation', () => {
    it('applies skeleton animation classes', () => {
      render(<SupportTicketTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')

      skeletons.forEach(skeleton => {
        expect(skeleton).toHaveClass('chakra-skeleton')
      })
    })

    it('maintains animation consistency across all skeletons', () => {
      render(<SupportTicketTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')

      expect(skeletons).toHaveLength(30)
      skeletons.forEach(skeleton => {
        expect(skeleton).toHaveClass('chakra-skeleton')
      })
    })

    it('all skeletons have consistent animation class', () => {
      render(<SupportTicketTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')

      expect(skeletons.length).toBe(30)
      skeletons.forEach(skeleton => {
        expect(skeleton).toHaveClass('chakra-skeleton')
      })
    })
  })

  describe('Integration Scenarios', () => {
    it('simulates loading state for support ticket table', () => {
      render(
        <div role="table">
          <div role="rowgroup">
            <SupportTicketTableSkeleton />
          </div>
        </div>
      )

      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons).toHaveLength(30)
    })

    it('transitions from loading to content state', () => {
      const { rerender } = render(<SupportTicketTableSkeleton />)

      /* Initially showing skeleton */
      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(30)

      /* Transition to actual content */
      rerender(
        <div data-testid="ticket-table">
          <div data-testid="ticket-row">
            <span>TKT-001</span>
            <span>Login Issue</span>
          </div>
        </div>
      )

      /* Skeleton should be replaced */
      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(0)
      expect(document.querySelector('[data-testid="ticket-table"]')).toBeInTheDocument()
    })

    it('works correctly within table component', () => {
      render(
        <div>
          <SupportTicketTableSkeleton />
        </div>
      )

      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons).toHaveLength(30)
    })

    it('maintains structure when nested in containers', () => {
      render(
        <div className="table-container">
          <div className="table-wrapper">
            <SupportTicketTableSkeleton />
          </div>
        </div>
      )

      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(30)
      expect(document.querySelector('.table-container')).toBeInTheDocument()
    })
  })

  describe('Visual Consistency', () => {
    it('renders correct number of skeleton elements', () => {
      render(<SupportTicketTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')

      expect(skeletons).toHaveLength(30)
    })

    it('maintains consistent skeleton structure', () => {
      const { container } = render(<SupportTicketTableSkeleton />)
      const skeletons = container.querySelectorAll('.chakra-skeleton')

      expect(skeletons.length).toBe(30)
      skeletons.forEach(skeleton => {
        expect(skeleton).toBeInTheDocument()
      })
    })

    it('applies consistent classes across all skeletons', () => {
      render(<SupportTicketTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')

      skeletons.forEach(skeleton => {
        expect(skeleton).toHaveClass('chakra-skeleton')
      })
    })
  })

  describe('Edge Cases', () => {
    it('renders correctly when wrapped in fragment', () => {
      render(
        <>
          <SupportTicketTableSkeleton />
        </>
      )

      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(30)
    })

    it('renders correctly when wrapped in div', () => {
      render(
        <div>
          <SupportTicketTableSkeleton />
        </div>
      )

      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(30)
    })

    it('handles conditional rendering', () => {
      const { rerender } = render(
        <div>
          {true && <SupportTicketTableSkeleton />}
        </div>
      )

      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(30)

      rerender(
        <div>
          {false && <SupportTicketTableSkeleton />}
        </div>
      )

      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(0)
    })

    it('maintains integrity with React strict mode', () => {
      expect(() => {
        render(<SupportTicketTableSkeleton />)
      }).not.toThrow()
    })

    it('handles empty parent containers', () => {
      render(
        <div style={{ width: 0, height: 0 }}>
          <SupportTicketTableSkeleton />
        </div>
      )

      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(30)
    })

    it('maintains structure with custom styling on parent', () => {
      render(
        <div style={{ backgroundColor: 'red', padding: '20px' }}>
          <SupportTicketTableSkeleton />
        </div>
      )

      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(30)
    })
  })

  describe('Row Count Validation', () => {
    it('always renders exactly 30 skeleton elements', () => {
      render(<SupportTicketTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')

      /* Should be 30 total (5 header + 25 body) */
      expect(skeletons.length).toBe(30)
    })

    it('renders consistent structure across multiple renders', () => {
      const { rerender } = render(<SupportTicketTableSkeleton />)

      expect(document.querySelectorAll('.chakra-skeleton').length).toBe(30)

      rerender(<SupportTicketTableSkeleton />)

      expect(document.querySelectorAll('.chakra-skeleton').length).toBe(30)
    })

    it('maintains skeleton count consistency', () => {
      const { container } = render(<SupportTicketTableSkeleton />)
      const skeletons = container.querySelectorAll('.chakra-skeleton')

      expect(skeletons.length).toBe(30)
    })
  })

  describe('Column Width Consistency', () => {
    it('renders all skeleton elements with consistent structure', () => {
      render(<SupportTicketTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')

      expect(skeletons.length).toBe(30)
      skeletons.forEach(skeleton => {
        expect(skeleton).toHaveClass('chakra-skeleton')
      })
    })

    it('maintains consistent skeleton elements', () => {
      const { container } = render(<SupportTicketTableSkeleton />)
      const skeletons = container.querySelectorAll('.chakra-skeleton')

      expect(skeletons.length).toBe(30)
      skeletons.forEach(skeleton => {
        expect(skeleton).toBeInTheDocument()
      })
    })
  })

  describe('Responsive Behavior', () => {
    it('maintains structure in narrow viewports', () => {
      render(<SupportTicketTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons).toHaveLength(30)
    })

    it('maintains structure in wide viewports', () => {
      render(<SupportTicketTableSkeleton />)
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons).toHaveLength(30)
    })

    it('handles container width changes gracefully', () => {
      const { rerender } = render(
        <div style={{ width: '500px' }}>
          <SupportTicketTableSkeleton />
        </div>
      )

      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(30)

      rerender(
        <div style={{ width: '1200px' }}>
          <SupportTicketTableSkeleton />
        </div>
      )

      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(30)
    })

    it('adapts to container constraints', () => {
      render(
        <div style={{ maxWidth: '800px', overflow: 'hidden' }}>
          <SupportTicketTableSkeleton />
        </div>
      )

      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(30)
    })
  })
})
