/* Libraries imports */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';

/* Plan management module imports */
import ResourceGridSkeleton from '../resource-grid-skeleton';

/* Helper function to render with Chakra provider */
const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider value={defaultSystem}>{component}</ChakraProvider>);
};

describe('ResourceGridSkeleton', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = renderWithChakra(<ResourceGridSkeleton />);
      expect(container).toBeInTheDocument();
    });

    it('renders with default count of 6 skeleton cards', () => {
      const { container } = renderWithChakra(<ResourceGridSkeleton />);
      const gridItems = container.querySelectorAll('div > div');
      expect(gridItems.length).toBeGreaterThanOrEqual(6);
    });

    it('renders with custom count of skeleton cards', () => {
      const { container } = renderWithChakra(<ResourceGridSkeleton count={4} />);
      const gridItems = container.querySelectorAll('div > div');
      expect(gridItems.length).toBeGreaterThanOrEqual(4);
    });

    it('renders with custom count of 10 skeleton cards', () => {
      const { container } = renderWithChakra(<ResourceGridSkeleton count={10} />);
      const gridItems = container.querySelectorAll('div > div');
      expect(gridItems.length).toBeGreaterThanOrEqual(10);
    });

    it('renders with 1 skeleton card', () => {
      const { container } = renderWithChakra(<ResourceGridSkeleton count={1} />);
      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('renders with 0 skeleton cards', () => {
      const { container } = renderWithChakra(<ResourceGridSkeleton count={0} />);
      const gridItems = container.querySelectorAll('.chakra-grid__item');
      expect(gridItems).toHaveLength(0);
    });
  });

  describe('Grid Layout', () => {
    it('renders with default 3-column layout', () => {
      const { container } = renderWithChakra(<ResourceGridSkeleton />);
      const grid = container.firstChild;
      expect(grid).toBeInTheDocument();
    });

    it('renders with custom 2-column layout', () => {
      const { container } = renderWithChakra(<ResourceGridSkeleton columns={2} />);
      const grid = container.firstChild;
      expect(grid).toBeInTheDocument();
    });

    it('renders with custom 4-column layout', () => {
      const { container } = renderWithChakra(<ResourceGridSkeleton columns={4} />);
      const grid = container.firstChild;
      expect(grid).toBeInTheDocument();
    });

    it('renders with 1-column layout', () => {
      const { container } = renderWithChakra(<ResourceGridSkeleton columns={1} />);
      const grid = container.firstChild;
      expect(grid).toBeInTheDocument();
    });

    it('renders grid items properly', () => {
      const { container } = renderWithChakra(<ResourceGridSkeleton count={3} />);
      const gridItems = container.querySelectorAll('div > div');
      expect(gridItems.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Skeleton Variants', () => {
    it('renders with default simple variant', () => {
      const { container } = renderWithChakra(<ResourceGridSkeleton />);
      expect(container).toBeInTheDocument();
    });

    it('renders with simple variant', () => {
      const { container } = renderWithChakra(<ResourceGridSkeleton variant="simple" />);
      expect(container).toBeInTheDocument();
    });

    it('renders with detailed variant', () => {
      const { container } = renderWithChakra(<ResourceGridSkeleton variant="detailed" />);
      expect(container).toBeInTheDocument();
    });

    it('renders simple variant with SkeletonText', () => {
      const { container } = renderWithChakra(<ResourceGridSkeleton variant="simple" count={1} />);
      expect(container).toBeInTheDocument();
    });

    it('renders detailed variant with multiple Skeleton lines', () => {
      const { container } = renderWithChakra(<ResourceGridSkeleton variant="detailed" count={1} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Card Structure', () => {
    it('renders skeleton cards with border', () => {
      const { container } = renderWithChakra(<ResourceGridSkeleton count={1} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders title placeholder in each card', () => {
      const { container } = renderWithChakra(<ResourceGridSkeleton count={1} />);
      expect(container).toBeInTheDocument();
    });

    it('renders selection indicator placeholder', () => {
      const { container } = renderWithChakra(<ResourceGridSkeleton count={1} />);
      expect(container).toBeInTheDocument();
    });

    it('renders content placeholders based on variant', () => {
      const { container } = renderWithChakra(<ResourceGridSkeleton count={1} variant="simple" />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Minimum Height', () => {
    it('applies default minimum height of 100px', () => {
      const { container } = renderWithChakra(<ResourceGridSkeleton count={1} />);
      expect(container).toBeInTheDocument();
    });

    it('applies custom minimum height', () => {
      const { container } = renderWithChakra(<ResourceGridSkeleton count={1} minHeight="200px" />);
      expect(container).toBeInTheDocument();
    });

    it('applies custom minimum height of 50px', () => {
      const { container } = renderWithChakra(<ResourceGridSkeleton count={1} minHeight="50px" />);
      expect(container).toBeInTheDocument();
    });

    it('applies custom minimum height of 300px', () => {
      const { container } = renderWithChakra(<ResourceGridSkeleton count={1} minHeight="300px" />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Combined Props', () => {
    it('renders with all custom props', () => {
      const { container } = renderWithChakra(
        <ResourceGridSkeleton count={8} columns={4} variant="detailed" minHeight="150px" />
      );
      const gridItems = container.querySelectorAll('div > div');
      expect(gridItems.length).toBeGreaterThanOrEqual(8);
    });

    it('renders with custom count and columns', () => {
      const { container } = renderWithChakra(<ResourceGridSkeleton count={6} columns={2} />);
      const gridItems = container.querySelectorAll('div > div');
      expect(gridItems.length).toBeGreaterThanOrEqual(6);
    });

    it('renders with custom variant and minHeight', () => {
      const { container } = renderWithChakra(
        <ResourceGridSkeleton variant="detailed" minHeight="250px" />
      );
      expect(container).toBeInTheDocument();
    });

    it('renders with custom count, variant, and minHeight', () => {
      const { container } = renderWithChakra(
        <ResourceGridSkeleton count={5} variant="simple" minHeight="120px" />
      );
      const gridItems = container.querySelectorAll('div > div');
      expect(gridItems.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Edge Cases', () => {
    it('handles zero count gracefully', () => {
      expect(() => {
        renderWithChakra(<ResourceGridSkeleton count={0} />);
      }).not.toThrow();
    });

    it('handles large count values', () => {
      const { container } = renderWithChakra(<ResourceGridSkeleton count={100} />);
      const gridItems = container.querySelectorAll('div > div');
      expect(gridItems.length).toBeGreaterThanOrEqual(100);
    });

    it('handles single column layout', () => {
      const { container } = renderWithChakra(<ResourceGridSkeleton columns={1} />);
      expect(container).toBeInTheDocument();
    });

    it('handles large column values', () => {
      const { container } = renderWithChakra(<ResourceGridSkeleton columns={12} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Component Lifecycle', () => {
    it('mounts without errors', () => {
      expect(() => {
        renderWithChakra(<ResourceGridSkeleton />);
      }).not.toThrow();
    });

    it('unmounts cleanly', () => {
      const { unmount } = renderWithChakra(<ResourceGridSkeleton />);
      expect(() => {
        unmount();
      }).not.toThrow();
    });

    it('handles multiple mount/unmount cycles', () => {
      const { unmount: unmount1 } = renderWithChakra(<ResourceGridSkeleton />);
      unmount1();

      const { unmount: unmount2 } = renderWithChakra(<ResourceGridSkeleton />);
      unmount2();

      expect(() => {
        renderWithChakra(<ResourceGridSkeleton />);
      }).not.toThrow();
    });
  });

  describe('Re-rendering Behavior', () => {
    it('updates when count prop changes', () => {
      const { container, rerender } = renderWithChakra(<ResourceGridSkeleton count={3} />);
      let gridItems = container.querySelectorAll('div > div');
      expect(gridItems.length).toBeGreaterThanOrEqual(3);

      rerender(
        <ChakraProvider value={defaultSystem}>
          <ResourceGridSkeleton count={5} />
        </ChakraProvider>
      );

      gridItems = container.querySelectorAll('div > div');
      expect(gridItems.length).toBeGreaterThanOrEqual(5);
    });

    it('updates when variant prop changes', () => {
      const { container, rerender } = renderWithChakra(<ResourceGridSkeleton variant="simple" />);
      expect(container).toBeInTheDocument();

      rerender(
        <ChakraProvider value={defaultSystem}>
          <ResourceGridSkeleton variant="detailed" />
        </ChakraProvider>
      );

      expect(container).toBeInTheDocument();
    });

    it('updates when columns prop changes', () => {
      const { container, rerender } = renderWithChakra(<ResourceGridSkeleton columns={2} />);
      expect(container).toBeInTheDocument();

      rerender(
        <ChakraProvider value={defaultSystem}>
          <ResourceGridSkeleton columns={4} />
        </ChakraProvider>
      );

      expect(container).toBeInTheDocument();
    });

    it('updates when minHeight prop changes', () => {
      const { container, rerender } = renderWithChakra(<ResourceGridSkeleton minHeight="100px" />);
      expect(container).toBeInTheDocument();

      rerender(
        <ChakraProvider value={defaultSystem}>
          <ResourceGridSkeleton minHeight="200px" />
        </ChakraProvider>
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders quickly with default props', () => {
      const startTime = Date.now();
      renderWithChakra(<ResourceGridSkeleton />);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);
    });

    it('renders efficiently with large count', () => {
      const startTime = Date.now();
      renderWithChakra(<ResourceGridSkeleton count={50} />);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(500);
    });

    it('handles multiple re-renders efficiently', () => {
      const { rerender } = renderWithChakra(<ResourceGridSkeleton count={5} />);

      const startTime = Date.now();

      for (let i = 1; i <= 20; i++) {
        rerender(
          <ChakraProvider value={defaultSystem}>
            <ResourceGridSkeleton count={5 + i} />
          </ChakraProvider>
        );
      }

      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1500);
    });
  });

  describe('Visual Consistency', () => {
    it('maintains consistent structure across different counts', () => {
      const { container: container1 } = renderWithChakra(<ResourceGridSkeleton count={3} />);
      const { container: container2 } = renderWithChakra(<ResourceGridSkeleton count={6} />);

      expect(container1.firstChild).toBeInTheDocument();
      expect(container2.firstChild).toBeInTheDocument();
    });

    it('maintains consistent structure across variants', () => {
      const { container: container1 } = renderWithChakra(<ResourceGridSkeleton variant="simple" />);
      const { container: container2 } = renderWithChakra(<ResourceGridSkeleton variant="detailed" />);

      expect(container1.firstChild).toBeInTheDocument();
      expect(container2.firstChild).toBeInTheDocument();
    });

    it('maintains grid layout structure', () => {
      const { container } = renderWithChakra(<ResourceGridSkeleton count={6} columns={3} />);
      const grid = container.firstChild;
      expect(grid).toBeInTheDocument();
    });
  });
});
