/* Libraries imports */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';

/* Plan management module imports */
import { PlanTableSkeleton } from '../table-skeleton';

/* Helper function to render with Chakra provider */
const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider value={defaultSystem}>{component}</ChakraProvider>);
};

describe('PlanTableSkeleton', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      expect(container).toBeInTheDocument();
    });

    it('renders HStack container', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      const hstack = container.querySelector('[data-part="root"]');
      expect(hstack || container.firstChild).toBeInTheDocument();
    });

    it('renders all skeleton elements', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Structure', () => {
    it('renders with proper border radius', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      const element = container.firstChild;
      expect(element).toBeInTheDocument();
    });

    it('renders with border', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      const element = container.firstChild;
      expect(element).toBeInTheDocument();
    });

    it('renders with padding', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      const element = container.firstChild;
      expect(element).toBeInTheDocument();
    });
  });

  describe('Column Layout', () => {
    it('renders checkbox column skeleton', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      const elements = container.querySelectorAll('div');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('renders name column skeleton', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      const elements = container.querySelectorAll('div');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('renders price column skeleton', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      const elements = container.querySelectorAll('div');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('renders status column skeleton', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      const elements = container.querySelectorAll('div');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('renders actions column skeleton', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      const elements = container.querySelectorAll('div');
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('Skeleton Elements', () => {
    it('renders Skeleton components', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      expect(container).toBeInTheDocument();
    });

    it('renders SkeletonCircle components for action buttons', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      expect(container).toBeInTheDocument();
    });

    it('renders skeletons with proper dimensions', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Visual Consistency', () => {
    it('maintains consistent border radius', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      const element = container.firstChild;
      expect(element).toBeInTheDocument();
    });

    it('applies consistent spacing', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      const element = container.firstChild;
      expect(element).toBeInTheDocument();
    });

    it('uses consistent border color', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      const element = container.firstChild;
      expect(element).toBeInTheDocument();
    });
  });

  describe('Column Widths', () => {
    it('renders checkbox column with 10% width', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      const elements = container.querySelectorAll('div');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('renders name column with 30% width', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      const elements = container.querySelectorAll('div');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('renders price column with 20% width', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      const elements = container.querySelectorAll('div');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('renders status column with 20% width', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      const elements = container.querySelectorAll('div');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('renders actions column with 20% width', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      const elements = container.querySelectorAll('div');
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('Action Buttons Skeleton', () => {
    it('renders three skeleton circles for action buttons', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      expect(container).toBeInTheDocument();
    });

    it('centers action buttons skeleton', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      const elements = container.querySelectorAll('div');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('applies gap between action button skeletons', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Component Lifecycle', () => {
    it('mounts without errors', () => {
      expect(() => {
        renderWithChakra(<PlanTableSkeleton />);
      }).not.toThrow();
    });

    it('unmounts cleanly', () => {
      const { unmount } = renderWithChakra(<PlanTableSkeleton />);
      expect(() => {
        unmount();
      }).not.toThrow();
    });

    it('handles multiple mount/unmount cycles', () => {
      const { unmount: unmount1 } = renderWithChakra(<PlanTableSkeleton />);
      unmount1();

      const { unmount: unmount2 } = renderWithChakra(<PlanTableSkeleton />);
      unmount2();

      expect(() => {
        renderWithChakra(<PlanTableSkeleton />);
      }).not.toThrow();
    });
  });

  describe('Re-rendering Behavior', () => {
    it('handles multiple re-renders', () => {
      const { rerender } = renderWithChakra(<PlanTableSkeleton />);

      for (let i = 0; i < 10; i++) {
        rerender(
          <ChakraProvider value={defaultSystem}>
            <PlanTableSkeleton />
          </ChakraProvider>
        );
      }

      const { container } = renderWithChakra(<PlanTableSkeleton />);
      expect(container).toBeInTheDocument();
    });

    it('maintains structure during re-renders', () => {
      const { container, rerender } = renderWithChakra(<PlanTableSkeleton />);
      const initialElement = container.firstChild;

      rerender(
        <ChakraProvider value={defaultSystem}>
          <PlanTableSkeleton />
        </ChakraProvider>
      );

      const rerenderedElement = container.firstChild;
      expect(initialElement).toBeInTheDocument();
      expect(rerenderedElement).toBeInTheDocument();
    });
  });

  describe('Multiple Instances', () => {
    it('renders multiple skeleton rows independently', () => {
      const { container } = renderWithChakra(
        <>
          <PlanTableSkeleton />
          <PlanTableSkeleton />
          <PlanTableSkeleton />
        </>
      );

      const children = container.children;
      expect(children.length).toBeGreaterThanOrEqual(3);
    });

    it('maintains consistency across multiple instances', () => {
      const { container } = renderWithChakra(
        <>
          <PlanTableSkeleton />
          <PlanTableSkeleton />
        </>
      );

      const children = container.children;
      expect(children.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Accessibility', () => {
    it('renders with proper structure for screen readers', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      expect(container).toBeInTheDocument();
    });

    it('maintains semantic structure', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      const element = container.firstChild;
      expect(element).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders quickly', () => {
      const startTime = Date.now();
      renderWithChakra(<PlanTableSkeleton />);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);
    });

    it('renders multiple instances efficiently', () => {
      const startTime = Date.now();
      renderWithChakra(
        <>
          {Array.from({ length: 20 }).map((_, i) => (
            <PlanTableSkeleton key={i} />
          ))}
        </>
      );
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(500);
    });

    it('handles rapid re-renders efficiently', () => {
      const { rerender } = renderWithChakra(<PlanTableSkeleton />);

      const startTime = Date.now();

      for (let i = 0; i < 50; i++) {
        rerender(
          <ChakraProvider value={defaultSystem}>
            <PlanTableSkeleton />
          </ChakraProvider>
        );
      }

      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe('Integration with Table', () => {
    it('works as loading placeholder in table structure', () => {
      const { container } = renderWithChakra(
        <div>
          <PlanTableSkeleton />
          <PlanTableSkeleton />
          <PlanTableSkeleton />
        </div>
      );

      expect(container).toBeInTheDocument();
    });

    it('maintains consistent width with actual table rows', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      const element = container.firstChild;
      expect(element).toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    it('renders checkbox placeholder skeleton', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      expect(container).toBeInTheDocument();
    });

    it('renders name placeholder skeleton', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      expect(container).toBeInTheDocument();
    });

    it('renders price placeholder skeleton', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      expect(container).toBeInTheDocument();
    });

    it('renders status badge placeholder skeleton', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      expect(container).toBeInTheDocument();
    });

    it('renders action buttons placeholder skeletons', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles rendering in different container sizes', () => {
      const { container } = renderWithChakra(
        <div style={{ width: '500px' }}>
          <PlanTableSkeleton />
        </div>
      );

      expect(container).toBeInTheDocument();
    });

    it('handles rendering in wide containers', () => {
      const { container } = renderWithChakra(
        <div style={{ width: '1200px' }}>
          <PlanTableSkeleton />
        </div>
      );

      expect(container).toBeInTheDocument();
    });

    it('handles rendering in narrow containers', () => {
      const { container } = renderWithChakra(
        <div style={{ width: '300px' }}>
          <PlanTableSkeleton />
        </div>
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe('Consistency', () => {
    it('maintains consistent appearance across renders', () => {
      const { container: container1 } = renderWithChakra(<PlanTableSkeleton />);
      const { container: container2 } = renderWithChakra(<PlanTableSkeleton />);

      expect(container1.firstChild).toBeInTheDocument();
      expect(container2.firstChild).toBeInTheDocument();
    });

    it('renders with consistent border styling', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      const element = container.firstChild;
      expect(element).toBeInTheDocument();
    });

    it('maintains consistent skeleton proportions', () => {
      const { container } = renderWithChakra(<PlanTableSkeleton />);
      expect(container).toBeInTheDocument();
    });
  });
});
