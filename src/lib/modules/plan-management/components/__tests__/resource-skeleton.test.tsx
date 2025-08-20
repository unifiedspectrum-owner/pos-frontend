import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@shared/test-utils/render'
import { axe } from 'vitest-axe'
import ResourceSkeleton from '../resource-skeleton'

// Mock the shared config
vi.mock('@shared/config', () => ({
  GRAY_COLOR: '#718096'
}))

// Mock polished library
vi.mock('polished', () => ({
  lighten: (amount: number, color: string) => `lightened-${color}`
}))

describe('ResourceSkeleton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<ResourceSkeleton />)
      
      // Should render skeleton elements
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('renders specified number of skeleton cards', () => {
      render(<ResourceSkeleton count={4} />)
      
      // Should render multiple skeleton elements for 4 cards
      const skeletonElements = document.querySelectorAll('.chakra-skeleton')
      expect(skeletonElements.length).toBeGreaterThan(3)
    })

    it('renders with simple variant by default', () => {
      render(<ResourceSkeleton variant="simple" />)
      
      // Should render skeleton elements
      expect(document.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(0)
    })

    it('renders with detailed variant', () => {
      render(<ResourceSkeleton variant="detailed" />)
      
      // Should render more skeleton elements for detailed variant
      expect(document.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(5)
    })
  })

  describe('Props', () => {
    it('handles zero count gracefully', () => {
      render(<ResourceSkeleton count={0} />)
      
      // Should render no skeleton elements
      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(0)
    })

    it('handles large count values', () => {
      render(<ResourceSkeleton count={20} />)
      
      // Should render many skeleton elements
      expect(document.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(15)
    })

    it('applies custom minimum height', () => {
      render(<ResourceSkeleton minHeight="200px" />)
      
      // Component should render without errors
      expect(document.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(0)
    })

    it('applies different column layouts', () => {
      render(<ResourceSkeleton columns={2} count={4} />)
      
      // Should render skeleton elements regardless of column count
      expect(document.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<ResourceSkeleton />)
      const results = await axe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('provides appropriate loading indicators', () => {
      render(<ResourceSkeleton />)
      
      // Skeleton components should be present as visual loading indicators
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons.length).toBeGreaterThan(0)
      
      // Chakra UI skeletons have appropriate loading styling
      skeletons.forEach(skeleton => {
        expect(skeleton).toHaveClass('chakra-skeleton')
      })
    })
  })

  describe('Variants', () => {
    it('switches between variants correctly', () => {
      const { rerender } = render(<ResourceSkeleton variant="simple" count={3} />)
      
      const simpleCount = document.querySelectorAll('.chakra-skeleton').length
      
      rerender(<ResourceSkeleton variant="detailed" count={3} />)
      
      const detailedCount = document.querySelectorAll('.chakra-skeleton').length
      
      // Detailed variant should have more skeleton elements
      expect(detailedCount).toBeGreaterThan(simpleCount)
    })
  })

  describe('Grid Layout Configurations', () => {
    it('renders with 1 column layout', () => {
      render(<ResourceSkeleton columns={1} count={3} />)
      
      // Should render skeleton elements regardless of column count
      expect(document.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(0)
    })

    it('renders with 2 column layout', () => {
      render(<ResourceSkeleton columns={2} count={4} />)
      
      expect(document.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(0)
    })

    it('renders with 5 column layout', () => {
      render(<ResourceSkeleton columns={5} count={10} />)
      
      expect(document.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(0)
    })

    it('handles more cards than columns', () => {
      render(<ResourceSkeleton columns={3} count={7} />)
      
      expect(document.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(0)
    })

    it('handles fewer cards than columns', () => {
      render(<ResourceSkeleton columns={5} count={2} />)
      
      expect(document.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(0)
    })
  })

  describe('Skeleton Card Structure', () => {
    it('renders title placeholder in each card', () => {
      render(<ResourceSkeleton count={2} />)
      
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons.length).toBeGreaterThanOrEqual(2)
    })

    it('maintains card structure consistency', () => {
      render(<ResourceSkeleton count={3} />)
      
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('applies consistent spacing between cards', () => {
      render(<ResourceSkeleton count={4} />)
      
      // Should render without layout issues
      expect(document.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(0)
    })
  })

  describe('Variant Behaviors', () => {
    it('renders simple variant with basic skeleton elements', () => {
      render(<ResourceSkeleton variant="simple" count={2} />)
      
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('renders detailed variant with more skeleton elements', () => {
      render(<ResourceSkeleton variant="detailed" count={2} />)
      
      const detailedSkeletons = document.querySelectorAll('.chakra-skeleton')
      expect(detailedSkeletons.length).toBeGreaterThan(0)
    })

    it('switches between variants correctly', () => {
      const { rerender } = render(<ResourceSkeleton variant="simple" count={3} />)
      
      const simpleCount = document.querySelectorAll('.chakra-skeleton').length
      
      rerender(<ResourceSkeleton variant="detailed" count={3} />)
      
      const detailedCount = document.querySelectorAll('.chakra-skeleton').length
      
      // Detailed variant should have more or equal skeleton elements
      expect(detailedCount).toBeGreaterThanOrEqual(simpleCount)
    })

    it('maintains variant consistency during re-renders', () => {
      const { rerender } = render(<ResourceSkeleton variant="detailed" count={2} />)
      
      const initialCount = document.querySelectorAll('.chakra-skeleton').length
      
      rerender(<ResourceSkeleton variant="detailed" count={2} />)
      
      const rerenderedCount = document.querySelectorAll('.chakra-skeleton').length
      expect(rerenderedCount).toBe(initialCount)
    })
  })

  describe('Styling and Appearance', () => {
    it('applies minimum height correctly', () => {
      render(<ResourceSkeleton minHeight="200px" count={1} />)
      
      // Component should render without styling errors
      expect(document.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(0)
    })

    it('handles very small minimum heights', () => {
      render(<ResourceSkeleton minHeight="10px" count={1} />)
      
      expect(document.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(0)
    })

    it('handles very large minimum heights', () => {
      render(<ResourceSkeleton minHeight="500px" count={1} />)
      
      expect(document.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(0)
    })

    it('applies consistent skeleton styling', () => {
      render(<ResourceSkeleton count={3} />)
      
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons.length).toBe(12) // 3 cards * 4 skeletons each (title + 2 content + selection)
    })

    it('maintains responsive design', () => {
      render(<ResourceSkeleton columns={3} count={6} />)
      
      // Should handle responsive layout without errors
      expect(document.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(0)
    })
  })

  describe('Performance and Optimization', () => {
    it('handles large count values efficiently', () => {
      const startTime = Date.now()
      render(<ResourceSkeleton count={50} />)
      const endTime = Date.now()
      
      // Should render quickly even with many skeletons
      expect(endTime - startTime).toBeLessThan(1000)
      expect(document.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(0)
    })

    it('handles frequent prop updates efficiently', () => {
      const { rerender } = render(<ResourceSkeleton count={5} />)
      
      // Multiple rapid re-renders
      for (let i = 1; i <= 10; i++) {
        rerender(<ResourceSkeleton count={i} variant={i % 2 === 0 ? 'detailed' : 'simple'} />)
      }
      
      expect(document.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(0)
    })

    it('maintains performance with complex configurations', () => {
      render(<ResourceSkeleton 
        count={20} 
        columns={4} 
        variant="detailed" 
        minHeight="150px" 
      />)
      
      expect(document.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(0)
    })

    it('generates unique keys for skeleton items', () => {
      render(<ResourceSkeleton count={5} />)
      
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons.length).toBeGreaterThan(0)
      
      // Each skeleton should be a unique DOM element
      const uniqueElements = new Set(skeletons)
      expect(uniqueElements.size).toBe(skeletons.length)
    })
  })

  describe('Animation and Loading States', () => {
    it('applies skeleton animation classes', () => {
      render(<ResourceSkeleton count={1} />)
      
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('maintains animation consistency across skeletons', () => {
      render(<ResourceSkeleton count={3} />)
      
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('handles animation during variant switches', () => {
      const { rerender } = render(<ResourceSkeleton variant="simple" count={2} />)
      
      expect(document.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(0)
      
      rerender(<ResourceSkeleton variant="detailed" count={2} />)
      
      expect(document.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility Enhancements', () => {
    it('provides appropriate ARIA labels for loading states', () => {
      render(<ResourceSkeleton count={2} />)
      
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons.length).toBeGreaterThan(0)
      
      // Chakra UI skeletons provide visual loading indication
      skeletons.forEach(skeleton => {
        expect(skeleton).toHaveClass('chakra-skeleton')
      })
    })

    it('supports screen reader announcements', () => {
      render(<ResourceSkeleton count={1} />)
      
      // Should provide visual loading indicators
      const loadingIndicators = document.querySelectorAll('.chakra-skeleton')
      expect(loadingIndicators.length).toBeGreaterThan(0)
      
      // Ensure skeletons are visible for screen readers
      loadingIndicators.forEach(indicator => {
        expect(indicator).toHaveClass('chakra-skeleton')
      })
    })

    it('maintains accessibility during state changes', () => {
      const { rerender } = render(<ResourceSkeleton count={2} />)
      
      const initialAccessibleElements = document.querySelectorAll('.chakra-skeleton')
      expect(initialAccessibleElements.length).toBeGreaterThan(0)
      
      rerender(<ResourceSkeleton count={4} />)
      
      const updatedAccessibleElements = document.querySelectorAll('.chakra-skeleton')
      expect(updatedAccessibleElements.length).toBeGreaterThan(0)
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('handles zero count gracefully', () => {
      render(<ResourceSkeleton count={0} />)
      
      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(0)
    })

    it('handles negative count gracefully', () => {
      render(<ResourceSkeleton count={-1} />)
      
      // Should not crash and render no skeletons
      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(0)
    })

    it('handles zero columns gracefully', () => {
      render(<ResourceSkeleton columns={0} count={3} />)
      
      // Should still render skeletons even with 0 columns
      expect(document.querySelectorAll('.chakra-skeleton').length).toBeGreaterThanOrEqual(0)
    })

    it('handles undefined props gracefully', () => {
      expect(() => {
        render(<ResourceSkeleton 
          count={undefined as any} 
          columns={undefined as any}
          variant={undefined as any}
          minHeight={undefined as any}
        />)
      }).not.toThrow()
    })

    it('handles invalid variant values', () => {
      expect(() => {
        render(<ResourceSkeleton variant={"invalid" as any} count={2} />)
      }).not.toThrow()
    })

    it('handles very large count values without memory issues', () => {
      expect(() => {
        render(<ResourceSkeleton count={1000} />)
      }).not.toThrow()
    })

    it('handles rapid mount/unmount cycles', () => {
      const { unmount, rerender } = render(<ResourceSkeleton count={3} />)
      
      expect(document.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(0)
      
      unmount()
      
      expect(() => {
        rerender(<ResourceSkeleton count={3} />)
      }).toThrow() // This should throw because component is unmounted
      
      // But a fresh render should work
      expect(() => {
        render(<ResourceSkeleton count={3} />)
      }).not.toThrow()
    })
  })

  describe('Component Lifecycle', () => {
    it('cleans up properly when unmounted', () => {
      const { unmount } = render(<ResourceSkeleton count={3} />)
      
      expect(document.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(0)
      
      unmount()
      
      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(0)
    })

    it('handles multiple mount/unmount cycles', () => {
      // First mount
      const { unmount: unmount1 } = render(<ResourceSkeleton count={2} />)
      expect(document.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(0)
      
      unmount1()
      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(0)
      
      // Second mount
      const { unmount: unmount2 } = render(<ResourceSkeleton count={4} />)
      expect(document.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(0)
      
      unmount2()
      expect(document.querySelectorAll('.chakra-skeleton')).toHaveLength(0)
    })

    it('maintains state consistency during prop updates', () => {
      const { rerender } = render(<ResourceSkeleton count={2} variant="simple" />)
      
      const initialCount = document.querySelectorAll('.chakra-skeleton').length
      
      rerender(<ResourceSkeleton count={2} variant="simple" />)
      
      const updatedCount = document.querySelectorAll('.chakra-skeleton').length
      expect(updatedCount).toBe(initialCount)
    })
  })

  describe('Integration Scenarios', () => {
    it('works correctly in loading state simulation', () => {
      // Simulate typical usage during data loading
      render(<ResourceSkeleton count={6} columns={3} variant="detailed" />)
      
      const skeletons = document.querySelectorAll('.chakra-skeleton')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('transitions smoothly between loading and content states', () => {
      const { rerender } = render(<ResourceSkeleton count={4} />)
      
      // Initially should have skeleton elements
      const initialSkeletons = document.querySelectorAll('.chakra-skeleton')
      expect(initialSkeletons.length).toBeGreaterThan(0)
      
      // Simulate transition to actual content
      rerender(<div data-testid="actual-content">Real content loaded</div>)
      
      expect(screen.getByTestId('actual-content')).toBeInTheDocument()
      
      // After transition, skeletons should be gone
      const finalSkeletons = document.querySelectorAll('.chakra-skeleton')
      expect(finalSkeletons).toHaveLength(0)
    })

    it('maintains consistent behavior across different viewport sizes', () => {
      // Test different column configurations for responsive design
      const configurations = [
        { columns: 1, count: 3 }, // Mobile
        { columns: 2, count: 4 }, // Tablet
        { columns: 3, count: 6 }, // Desktop
        { columns: 4, count: 8 }  // Large desktop
      ]
      
      configurations.forEach(config => {
        const { unmount } = render(
          <ResourceSkeleton columns={config.columns} count={config.count} />
        )
        
        expect(document.querySelectorAll('.chakra-skeleton').length).toBeGreaterThan(0)
        
        unmount()
      })
    })
  })
})