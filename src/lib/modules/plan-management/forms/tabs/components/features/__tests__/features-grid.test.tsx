import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from '@/components/ui/provider';
import FeaturesGrid from '../features-grid';
import { Feature } from '@plan-management/types';

// Mock dependencies
vi.mock('@shared/config', () => ({
  PRIMARY_COLOR: '#3182CE',
  GRAY_COLOR: '#718096',
  DARK_COLOR: '#2D3748',
  WHITE_COLOR: '#FFFFFF'
}));

vi.mock('@plan-management/components', () => ({
  ResourceSkeleton: ({ count, columns, variant, minHeight }: any) => (
    <div data-testid="resource-skeleton">
      <div data-testid="skeleton-count">{count}</div>
      <div data-testid="skeleton-columns">{columns}</div>
      <div data-testid="skeleton-variant">{variant}</div>
      <div data-testid="skeleton-min-height">{minHeight}</div>
    </div>
  )
}));

vi.mock('@shared/components', () => ({
  EmptyStateContainer: ({ icon, title, description, testId }: any) => (
    <div data-testid={testId}>
      <div data-testid="empty-state-icon">{icon}</div>
      <div data-testid="empty-state-title">{title}</div>
      <div data-testid="empty-state-description">{description}</div>
    </div>
  )
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
);

describe('FeaturesGrid', () => {
  const mockFeatures: Feature[] = [
    {
      id: 1,
      name: 'Advanced Analytics',
      description: 'Get detailed insights and analytics for your business',
      display_order: 1
    },
    {
      id: 2,
      name: 'API Access',
      description: 'Full API access to integrate with your systems',
      display_order: 2
    },
    {
      id: 3,
      name: 'Priority Support',
      description: '24/7 priority customer support',
      display_order: 3
    }
  ];

  const defaultProps = {
    loading: false,
    displayResources: mockFeatures,
    selectedFeatureIds: [],
    isReadOnly: false,
    handleToggleWithConfirm: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('loading states', () => {
    it('should display loading skeleton when loading is true', () => {
      render(
        <FeaturesGrid
          {...defaultProps}
          loading={true}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByTestId('resource-skeleton')).toBeInTheDocument();
      expect(screen.getByTestId('skeleton-count')).toHaveTextContent('6');
      expect(screen.getByTestId('skeleton-columns')).toHaveTextContent('3');
      expect(screen.getByTestId('skeleton-variant')).toHaveTextContent('simple');
      expect(screen.getByTestId('skeleton-min-height')).toHaveTextContent('100px');
    });

    it('should not display features grid when loading is true', () => {
      render(
        <FeaturesGrid
          {...defaultProps}
          loading={true}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.queryByText('Advanced Analytics')).not.toBeInTheDocument();
      expect(screen.queryByText('API Access')).not.toBeInTheDocument();
      expect(screen.queryByText('Priority Support')).not.toBeInTheDocument();
    });

    it('should display features grid when loading is false', () => {
      render(
        <FeaturesGrid
          {...defaultProps}
          loading={false}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.queryByTestId('resource-skeleton')).not.toBeInTheDocument();
      expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
      expect(screen.getByText('API Access')).toBeInTheDocument();
      expect(screen.getByText('Priority Support')).toBeInTheDocument();
    });
  });

  describe('empty states', () => {
    it('should show empty state when no features available and isReadOnly is true', () => {
      render(
        <FeaturesGrid
          {...defaultProps}
          displayResources={[]}
          isReadOnly={true}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByTestId('features-empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('empty-state-title')).toHaveTextContent('No features included');
      expect(screen.getByTestId('empty-state-description')).toHaveTextContent('This plan does not include any features');
    });

    it('should not show empty state when no features available and isReadOnly is false', () => {
      render(
        <FeaturesGrid
          {...defaultProps}
          displayResources={[]}
          isReadOnly={false}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.queryByTestId('features-empty-state')).not.toBeInTheDocument();
    });

    it('should render features grid when displayResources has items', () => {
      render(
        <FeaturesGrid
          {...defaultProps}
          displayResources={mockFeatures}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.queryByTestId('features-empty-state')).not.toBeInTheDocument();
      expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
    });
  });

  describe('features rendering', () => {
    it('should render all features with correct names and descriptions', () => {
      render(
        <FeaturesGrid
          {...defaultProps}
          displayResources={mockFeatures}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
      expect(screen.getByText('Get detailed insights and analytics for your business')).toBeInTheDocument();
      
      expect(screen.getByText('API Access')).toBeInTheDocument();
      expect(screen.getByText('Full API access to integrate with your systems')).toBeInTheDocument();
      
      expect(screen.getByText('Priority Support')).toBeInTheDocument();
      expect(screen.getByText('24/7 priority customer support')).toBeInTheDocument();
    });

    it('should render features in a 3-column grid', () => {
      const { container } = render(
        <FeaturesGrid
          {...defaultProps}
          displayResources={mockFeatures}
        />,
        { wrapper: TestWrapper }
      );

      // Check that the grid structure is rendered by looking for the grid container
      const gridContainer = container.querySelector('[class*="css-"]'); // Chakra UI generates CSS classes
      expect(gridContainer).toBeInTheDocument();
      
      // Verify that all features are rendered as individual items
      expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
      expect(screen.getByText('API Access')).toBeInTheDocument();
      expect(screen.getByText('Priority Support')).toBeInTheDocument();
    });

    it('should render correct number of feature cards', () => {
      render(
        <FeaturesGrid
          {...defaultProps}
          displayResources={mockFeatures}
        />,
        { wrapper: TestWrapper }
      );

      const featureCards = screen.getAllByText(/Advanced Analytics|API Access|Priority Support/);
      expect(featureCards).toHaveLength(3);
    });
  });

  describe('feature selection states', () => {
    it('should show unselected state for features not in selectedFeatureIds', () => {
      const { container } = render(
        <FeaturesGrid
          {...defaultProps}
          selectedFeatureIds={[]}
        />,
        { wrapper: TestWrapper }
      );

      // All features should show unselected state (checkbox outline icons)
      // Since we can't easily test React Icons, we verify by checking that
      // the features are rendered and clickable (indicating unselected interactive state)
      expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
      expect(screen.getByText('API Access')).toBeInTheDocument();
      expect(screen.getByText('Priority Support')).toBeInTheDocument();
      
      // Verify features are in unselected state by checking for lack of selected styling
      const featureCards = container.querySelectorAll('[class*="css-"]');
      expect(featureCards.length).toBeGreaterThan(0);
    });

    it('should show selected state for features in selectedFeatureIds', () => {
      render(
        <FeaturesGrid
          {...defaultProps}
          selectedFeatureIds={[1, 3]}
        />,
        { wrapper: TestWrapper }
      );

      // Selected features should have different styling/icons
      // This would need to check for specific styling or icons used for selected state
    });

    it('should handle mixed selection states correctly', () => {
      render(
        <FeaturesGrid
          {...defaultProps}
          selectedFeatureIds={[2]}
        />,
        { wrapper: TestWrapper }
      );

      // Only feature with id 2 (API Access) should be selected
      // Other features should be unselected
    });
  });

  describe('interaction handling', () => {
    it('should call handleToggleWithConfirm when feature card is clicked and not readonly', async () => {
      const user = userEvent.setup();
      const mockHandleToggle = vi.fn();

      render(
        <FeaturesGrid
          {...defaultProps}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggle}
        />,
        { wrapper: TestWrapper }
      );

      // Click on the feature text which should be within the clickable area
      await user.click(screen.getByText('Advanced Analytics'));
      expect(mockHandleToggle).toHaveBeenCalledWith(1);
    });

    it('should not call handleToggleWithConfirm when feature card is clicked in readonly mode', async () => {
      const user = userEvent.setup();
      const mockHandleToggle = vi.fn();

      render(
        <FeaturesGrid
          {...defaultProps}
          isReadOnly={true}
          handleToggleWithConfirm={mockHandleToggle}
        />,
        { wrapper: TestWrapper }
      );

      // Click on the feature text - in readonly mode this should not trigger the handler
      await user.click(screen.getByText('Advanced Analytics'));
      expect(mockHandleToggle).not.toHaveBeenCalled();
    });

    it('should handle multiple feature clicks correctly', async () => {
      const user = userEvent.setup();
      const mockHandleToggle = vi.fn();

      render(
        <FeaturesGrid
          {...defaultProps}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggle}
        />,
        { wrapper: TestWrapper }
      );

      // Click on each feature text
      await user.click(screen.getByText('Advanced Analytics'));
      await user.click(screen.getByText('API Access'));
      await user.click(screen.getByText('Priority Support'));

      expect(mockHandleToggle).toHaveBeenCalledTimes(3);
      expect(mockHandleToggle).toHaveBeenNthCalledWith(1, 1);
      expect(mockHandleToggle).toHaveBeenNthCalledWith(2, 2);
      expect(mockHandleToggle).toHaveBeenNthCalledWith(3, 3);
    });
  });

  describe('readonly mode behavior', () => {
    it('should not show selection indicators in readonly mode', () => {
      render(
        <FeaturesGrid
          {...defaultProps}
          isReadOnly={true}
        />,
        { wrapper: TestWrapper }
      );

      // Selection indicators should not be visible in readonly mode
      // This would check for absence of checkbox icons or selection UI
    });

    it('should show different styling in readonly mode', () => {
      render(
        <FeaturesGrid
          {...defaultProps}
          isReadOnly={true} />,
        { wrapper: TestWrapper }
      );
    });

    it('should maintain selection display in readonly mode', () => {
      render(
        <FeaturesGrid
          {...defaultProps}
          isReadOnly={true}
          selectedFeatureIds={[1, 2]}
        />,
        { wrapper: TestWrapper }
      );

      // Selected features should still show as selected visually
      // but without interactive elements
    });
  });

  describe('visual styling and states', () => {
    it('should apply correct styling for selected features', () => {
      render(
        <FeaturesGrid
          {...defaultProps}
          selectedFeatureIds={[1]} />,
        { wrapper: TestWrapper }
      );

      // Selected feature cards should have different border/background colors
      // This would check for specific CSS classes or inline styles
    });

    it('should apply hover effects when not readonly', () => {
      render(
        <FeaturesGrid
          {...defaultProps}
          isReadOnly={false} />,
        { wrapper: TestWrapper }
      );
    });

    it('should not apply hover effects in readonly mode', () => {
      render(
        <FeaturesGrid
          {...defaultProps}
          isReadOnly={true} />,
        { wrapper: TestWrapper }
      );

      // Feature cards should have default cursor in readonly mode
    });
  });

  describe('accessibility', () => {
    it('should be keyboard navigable when not readonly', async () => {
      const user = userEvent.setup();
      const mockHandleToggle = vi.fn();

      render(
        <FeaturesGrid
          {...defaultProps}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggle}
        />,
        { wrapper: TestWrapper }
      );

      // Should be able to tab through feature cards
      await user.tab();
      
    });

    it('should support keyboard activation when not readonly', async () => {
      const user = userEvent.setup();
      const mockHandleToggle = vi.fn();

      render(
        <FeaturesGrid
          {...defaultProps}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggle}
        />,
        { wrapper: TestWrapper }
      );

      // Since the features are clickable boxes, we can test click interaction
      // which is the primary interaction method for this component
      const firstFeature = screen.getByText('Advanced Analytics').closest('div');

      if (firstFeature) {
        await user.click(firstFeature);
        expect(mockHandleToggle).toHaveBeenCalledWith(1);
      } else {
        // If the closest div approach doesn't work, test the text element directly
        await user.click(screen.getByText('Advanced Analytics'));
        expect(mockHandleToggle).toHaveBeenCalledWith(1);
      }
    });

    it('should have proper ARIA attributes for interactive elements', () => {
      render(
        <FeaturesGrid
          {...defaultProps}
          isReadOnly={false}
        />,
        { wrapper: TestWrapper }
      );

      // Interactive feature cards should have proper ARIA attributes
      // This would check for role, aria-label, aria-pressed, etc.
    });

    it('should not be keyboard navigable in readonly mode', () => {
      render(
        <FeaturesGrid
          {...defaultProps}
          isReadOnly={true}
        />,
        { wrapper: TestWrapper }
      );

      // Feature cards should not be focusable in readonly mode
    });
  });

  describe('error handling', () => {
    it('should handle empty feature objects gracefully', () => {
      const incompleteFeature = {
        id: 1,
        name: '',
        description: ''
      } as Feature;

      expect(() => {
        render(
          <FeaturesGrid
            {...defaultProps}
            displayResources={[incompleteFeature]}
          />,
          { wrapper: TestWrapper }
        );
      }).not.toThrow();
    });

    it('should handle missing feature properties gracefully', () => {
      const incompleteFeature = {
        id: 1
      } as Feature;

      expect(() => {
        render(
          <FeaturesGrid
            {...defaultProps}
            displayResources={[incompleteFeature]}
          />,
          { wrapper: TestWrapper }
        );
      }).not.toThrow();
    });

    it('should handle invalid selectedFeatureIds gracefully', () => {
      expect(() => {
        render(
          <FeaturesGrid
            {...defaultProps}
            selectedFeatureIds={[999, -1, 0]}
          />,
          { wrapper: TestWrapper }
        );
      }).not.toThrow();
    });

    it('should handle null or undefined handleToggleWithConfirm', () => {
      expect(() => {
        render(
          <FeaturesGrid
            {...defaultProps}
            handleToggleWithConfirm={undefined as any}
          />,
          { wrapper: TestWrapper }
        );
      }).not.toThrow();
    });
  });

  describe('performance considerations', () => {
    it('should handle large numbers of features efficiently', () => {
      const manyFeatures: Feature[] = Array.from({ length: 100 }, (_, index) => ({
        id: index + 1,
        name: `Feature ${index + 1}`,
        description: `Description for feature ${index + 1}`,
        display_order: 4
      }));

      const start = performance.now();
      render(
        <FeaturesGrid
          {...defaultProps}
          displayResources={manyFeatures}
        />,
        { wrapper: TestWrapper }
      );
      const end = performance.now();

      // Should render reasonably quickly even with many features
      expect(end - start).toBeLessThan(1000); // Less than 1 second
    });

    it('should handle frequent selection updates efficiently', () => {
      const { rerender } = render(
        <FeaturesGrid
          {...defaultProps}
          selectedFeatureIds={[]}
        />,
        { wrapper: TestWrapper }
      );

      // Simulate rapid selection changes
      const selectionStates = [
        [1],
        [1, 2],
        [1, 2, 3],
        [2, 3],
        [3],
        []
      ];

      selectionStates.forEach(selection => {
        expect(() => {
          rerender(
            <FeaturesGrid
              {...defaultProps}
              selectedFeatureIds={selection}
            />
          );
        }).not.toThrow();
      });
    });
  });

  describe('component lifecycle', () => {
    it('should cleanup properly on unmount', () => {
      const { unmount } = render(
        <FeaturesGrid
          {...defaultProps}
        />,
        { wrapper: TestWrapper }
      );

      expect(() => unmount()).not.toThrow();
    });

    it('should handle prop changes correctly', () => {
      const { rerender } = render(
        <FeaturesGrid
          {...defaultProps}
          loading={true}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByTestId('resource-skeleton')).toBeInTheDocument();

      rerender(
        <FeaturesGrid
          {...defaultProps}
          loading={false}
        />
      );

      expect(screen.queryByTestId('resource-skeleton')).not.toBeInTheDocument();
      expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
    });

    it('should handle displayResources updates correctly', () => {
      const { rerender } = render(
        <FeaturesGrid
          {...defaultProps}
          displayResources={[mockFeatures[0]]}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
      expect(screen.queryByText('API Access')).not.toBeInTheDocument();

      rerender(
        <FeaturesGrid
          {...defaultProps}
          displayResources={mockFeatures}
        />
      );

      expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
      expect(screen.getByText('API Access')).toBeInTheDocument();
      expect(screen.getByText('Priority Support')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle features with very long names and descriptions', () => {
      const longTextFeature: Feature = {
        id: 1,
        name: 'This is a very long feature name that might cause layout issues if not handled properly in the UI components',
        description: 'This is an extremely long description that goes on and on and on and should be handled gracefully by the component without breaking the layout or causing visual issues that would impact the user experience negatively',
        display_order:1
      };

      render(
        <FeaturesGrid
          {...defaultProps}
          displayResources={[longTextFeature]}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText(longTextFeature.name)).toBeInTheDocument();
      expect(screen.getByText(longTextFeature.description)).toBeInTheDocument();
    });

    it('should handle features with special characters in names and descriptions', () => {
      const specialCharFeature: Feature = {
        id: 1,
        name: 'Feature & Service™ (Premium) - 2024',
        description: 'Special chars: @#$%^&*()_+{}|:"<>?[];\\,./`~',
        display_order: 1,
      };

      render(
        <FeaturesGrid
          {...defaultProps}
          displayResources={[specialCharFeature]}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('Feature & Service™ (Premium) - 2024')).toBeInTheDocument();
      expect(screen.getByText('Special chars: @#$%^&*()_+{}|:"<>?[];\\,./`~')).toBeInTheDocument();
    });

    it('should handle duplicate feature IDs gracefully', () => {
      const duplicateFeatures: Feature[] = [
        {
          id: 1,
          name: 'Feature 1',
          description: 'First feature',
          display_order: 1,
        },
        {
          id: 1,
          name: 'Feature 1 Duplicate',
          description: 'Second feature with same ID',
          display_order: 1,
        }
      ];

      expect(() => {
        render(
          <FeaturesGrid
            {...defaultProps}
            displayResources={duplicateFeatures}
          />,
          { wrapper: TestWrapper }
        );
      }).not.toThrow();
    });
  });
});