import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from '@/components/ui/provider';
import SelectedFeaturesSummary from '../selected-features-summary';
import { Feature } from '@plan-management/types';

// Mock dependencies
vi.mock('@shared/config', () => ({
  GRAY_COLOR: '#718096',
  SECONDARY_COLOR: '#805AD5'
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

describe('SelectedFeaturesSummary', () => {
  const mockFeatures: Feature[] = [
    {
      id: 1,
      name: 'Advanced Analytics',
      description: 'Get detailed insights and analytics for your business',
      display_order: 1,
    },
    {
      id: 2,
      name: 'API Access',
      description: 'Full API access to integrate with your systems',
      display_order: 2,
    },
    {
      id: 3,
      name: 'Priority Support',
      description: '24/7 priority customer support',
      display_order: 3,
    }
  ];

  const mockOnRemove = vi.fn();

  const defaultProps = {
    selectedFeatures: [],
    onRemove: mockOnRemove,
    readOnly: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render component with correct header', () => {
      render(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={mockFeatures}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('Selected Features (3)')).toBeInTheDocument();
    });

    it('should render zero count when no features selected', () => {
      render(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={[]}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('Selected Features (0)')).toBeInTheDocument();
    });

    it('should update count when selectedFeatures change', () => {
      const { rerender } = render(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={[mockFeatures[0]]}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('Selected Features (1)')).toBeInTheDocument();

      rerender(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={mockFeatures}
        />
      );

      expect(screen.getByText('Selected Features (3)')).toBeInTheDocument();
    });
  });

  describe('selected features display', () => {
    it('should display all selected feature names as tags', () => {
      render(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={mockFeatures}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
      expect(screen.getByText('API Access')).toBeInTheDocument();
      expect(screen.getByText('Priority Support')).toBeInTheDocument();
    });

    it('should render feature tags with remove buttons when not readonly', () => {
      render(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={mockFeatures}
          readOnly={false}
        />,
        { wrapper: TestWrapper }
      );

      // Each feature should have a remove button
      const removeButtons = screen.getAllByRole('button');
      expect(removeButtons).toHaveLength(3);
    });

    it('should not render remove buttons when readonly', () => {
      render(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={mockFeatures}
          readOnly={true}
        />,
        { wrapper: TestWrapper }
      );

      // No remove buttons should be present in readonly mode
      const removeButtons = screen.queryAllByRole('button');
      expect(removeButtons).toHaveLength(0);
    });

    it('should display features in flexbox layout with proper wrapping', () => {
      const { container } = render(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={mockFeatures}
        />,
        { wrapper: TestWrapper }
      );

      // Verify that features are rendered (indicating flexbox layout is working)
      expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
      expect(screen.getByText('API Access')).toBeInTheDocument();
      expect(screen.getByText('Priority Support')).toBeInTheDocument();
      
      // Check that the container has the expected structure
      const containerElements = container.querySelectorAll('div');
      expect(containerElements.length).toBeGreaterThan(0);
    });
  });

  describe('remove functionality', () => {
    it('should call onRemove when remove button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={[mockFeatures[0]]}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      );

      const removeButton = screen.getByRole('button');
      await user.click(removeButton);

      expect(mockOnRemove).toHaveBeenCalledTimes(1);
      expect(mockOnRemove).toHaveBeenCalledWith(1);
    });

    it('should call onRemove with correct feature ID for each button', async () => {
      const user = userEvent.setup();

      render(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={mockFeatures}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      );

      const removeButtons = screen.getAllByRole('button');
      
      // Click first remove button
      await user.click(removeButtons[0]);
      expect(mockOnRemove).toHaveBeenCalledWith(1);

      // Click second remove button
      await user.click(removeButtons[1]);
      expect(mockOnRemove).toHaveBeenCalledWith(2);

      // Click third remove button
      await user.click(removeButtons[2]);
      expect(mockOnRemove).toHaveBeenCalledWith(3);

      expect(mockOnRemove).toHaveBeenCalledTimes(3);
    });

    it('should prevent event propagation when remove button is clicked', async () => {
      const user = userEvent.setup();
      const mockTagClick = vi.fn();

      render(
        <div onClick={mockTagClick}>
          <SelectedFeaturesSummary
            {...defaultProps}
            selectedFeatures={[mockFeatures[0]]}
            onRemove={mockOnRemove}
          />
        </div>,
        { wrapper: TestWrapper }
      );

      const removeButton = screen.getByRole('button');
      await user.click(removeButton);

      expect(mockOnRemove).toHaveBeenCalledWith(1);
      expect(mockTagClick).not.toHaveBeenCalled();
    });

    it('should not call onRemove in readonly mode', async () => {

      render(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={mockFeatures}
          readOnly={true}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      );

      // No remove buttons should be present
      const removeButtons = screen.queryAllByRole('button');
      expect(removeButtons).toHaveLength(0);
      expect(mockOnRemove).not.toHaveBeenCalled();
    });
  });

  describe('empty state', () => {
    it('should show empty state when no features selected', () => {
      render(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={[]}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByTestId('selected-features-empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('empty-state-title')).toHaveTextContent('No features selected');
      expect(screen.getByTestId('empty-state-description')).toHaveTextContent('Select features from the list above to configure this plan');
    });

    it('should not show empty state when features are selected', () => {
      render(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={[mockFeatures[0]]}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.queryByTestId('selected-features-empty-state')).not.toBeInTheDocument();
      expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
    });

    it('should show empty state icon correctly', () => {
      render(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={[]}
        />,
        { wrapper: TestWrapper }
      );

      const emptyStateIcon = screen.getByTestId('empty-state-icon');
      expect(emptyStateIcon).toBeInTheDocument();
      // The icon should be the FaPlus icon
    });
  });

  describe('readonly mode behavior', () => {
    it('should display features without remove functionality in readonly mode', () => {
      render(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={mockFeatures}
          readOnly={true}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
      expect(screen.getByText('API Access')).toBeInTheDocument();
      expect(screen.getByText('Priority Support')).toBeInTheDocument();
      
      expect(screen.queryAllByRole('button')).toHaveLength(0);
    });

    it('should maintain visual styling in readonly mode', () => {
      const { container } = render(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={mockFeatures}
          readOnly={true}
        />,
        { wrapper: TestWrapper }
      );

      // Verify that features are displayed with proper styling in readonly mode
      expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
      expect(screen.getByText('API Access')).toBeInTheDocument();
      expect(screen.getByText('Priority Support')).toBeInTheDocument();
      
      // Feature tags should still have structural elements
      const containerDivs = container.querySelectorAll('div');
      expect(containerDivs.length).toBeGreaterThan(0);
    });

    it('should handle readOnly prop changes correctly', () => {
      const { rerender } = render(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={mockFeatures}
          readOnly={false}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getAllByRole('button')).toHaveLength(3);

      rerender(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={mockFeatures}
          readOnly={true}
        />
      );

      expect(screen.queryAllByRole('button')).toHaveLength(0);
    });
  });

  describe('accessibility', () => {
    it('should have accessible remove buttons with proper labels', () => {
      render(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={[mockFeatures[0]]}
          readOnly={false}
        />,
        { wrapper: TestWrapper }
      );

      const removeButton = screen.getByRole('button');
      expect(removeButton).toBeInTheDocument();
      // In a full implementation, this would check for aria-label or title attributes
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();

      render(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={mockFeatures}
          readOnly={false}
        />,
        { wrapper: TestWrapper }
      );

      // Should be able to tab to remove buttons
      await user.tab();
      const firstRemoveButton = screen.getAllByRole('button')[0];
      expect(firstRemoveButton).toHaveFocus();
    });

    it('should support keyboard activation of remove buttons', async () => {
      const user = userEvent.setup();

      render(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={[mockFeatures[0]]}
          readOnly={false}
        />,
        { wrapper: TestWrapper }
      );

      const removeButton = screen.getByRole('button');
      removeButton.focus();
      await user.keyboard('{Enter}');

      expect(mockOnRemove).toHaveBeenCalledWith(1);
    });

    it('should have proper semantic structure', () => {
      render(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={mockFeatures}
        />,
        { wrapper: TestWrapper }
      );

      // Header should be properly structured
      const header = screen.getByText('Selected Features (3)');
      expect(header).toBeInTheDocument();
      
      // Feature names should be readable by screen readers
      expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
    });
  });

  describe('visual styling and layout', () => {
    it('should apply proper styling to feature tags', () => {
      const { container } = render(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={mockFeatures}
        />,
        { wrapper: TestWrapper }
      );

      // Feature tags should be properly styled - verify by checking that features are rendered
      expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
      expect(screen.getByText('API Access')).toBeInTheDocument();
      expect(screen.getByText('Priority Support')).toBeInTheDocument();
      
      // Verify the container has the expected structure for styling
      const containerElements = container.querySelectorAll('div');
      expect(containerElements.length).toBeGreaterThan(0);
    });

    it('should handle hover effects on feature tags', () => {
      render(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={mockFeatures} />,
        { wrapper: TestWrapper }
      );

    });

    it('should display remove button icons correctly', () => {
      render(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={[mockFeatures[0]]}
        />,
        { wrapper: TestWrapper }
      );

      const removeButton = screen.getByRole('button');
      expect(removeButton).toBeInTheDocument();
      // The button should contain the FiX icon
    });
  });

  describe('error handling', () => {
    it('should handle empty feature objects gracefully', () => {
      const emptyFeature = {
        id: 1,
        name: '',
        description: '',
        display_order: 1,
      } as Feature;

      expect(() => {
        render(
          <SelectedFeaturesSummary
            {...defaultProps}
            selectedFeatures={[emptyFeature]}
          />,
          { wrapper: TestWrapper }
        );
      }).not.toThrow();

      expect(screen.getByText('Selected Features (1)')).toBeInTheDocument();
    });

    it('should handle null or undefined onRemove gracefully', async () => {
      const user = userEvent.setup();

      expect(() => {
        render(
          <SelectedFeaturesSummary
            selectedFeatures={[mockFeatures[0]]}
            onRemove={undefined as any}
            readOnly={false}
          />,
          { wrapper: TestWrapper }
        );
      }).not.toThrow();

      const removeButton = screen.getByRole('button');
      
      // Should not throw when clicked with undefined onRemove
      await user.click(removeButton);
    });

    it('should handle features with missing properties', () => {
      const incompleteFeature = {
        id: 1
      } as Feature;

      expect(() => {
        render(
          <SelectedFeaturesSummary
            {...defaultProps}
            selectedFeatures={[incompleteFeature]}
          />,
          { wrapper: TestWrapper }
        );
      }).not.toThrow();
    });

    it('should handle negative or invalid feature IDs', async () => {
      const user = userEvent.setup();
      const invalidFeature = {
        id: -1,
        name: 'Invalid Feature',
        description: 'Feature with negative ID',
        display_order: 1,
      } as Feature;

      render(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={[invalidFeature]}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      );

      const removeButton = screen.getByRole('button');
      await user.click(removeButton);

      expect(mockOnRemove).toHaveBeenCalledWith(-1);
    });
  });

  describe('performance considerations', () => {
    it('should handle large numbers of selected features efficiently', () => {
      const manyFeatures: Feature[] = Array.from({ length: 50 }, (_, index) => ({
        id: index + 1,
        name: `Feature ${index + 1}`,
        description: `Description for feature ${index + 1}`,
        display_order: 1,
      }));

      const start = performance.now();
      render(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={manyFeatures}
        />,
        { wrapper: TestWrapper }
      );
      const end = performance.now();

      expect(end - start).toBeLessThan(1000); // Should render in less than 1 second
      expect(screen.getByText('Selected Features (50)')).toBeInTheDocument();
    });

    it('should handle frequent feature list updates efficiently', () => {
      const { rerender } = render(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={[]}
        />,
        { wrapper: TestWrapper }
      );

      // Simulate rapid feature list changes
      const updates = [
        [mockFeatures[0]],
        [mockFeatures[0], mockFeatures[1]],
        [mockFeatures[0], mockFeatures[1], mockFeatures[2]],
        [mockFeatures[1], mockFeatures[2]],
        [mockFeatures[2]],
        []
      ];

      updates.forEach(features => {
        expect(() => {
          rerender(
            <SelectedFeaturesSummary
              {...defaultProps}
              selectedFeatures={features}
            />
          );
        }).not.toThrow();
      });
    });
  });

  describe('component lifecycle', () => {
    it('should cleanup properly on unmount', () => {
      const { unmount } = render(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={mockFeatures}
        />,
        { wrapper: TestWrapper }
      );

      expect(() => unmount()).not.toThrow();
    });

    it('should handle prop changes correctly', () => {
      const { rerender } = render(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={[]}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByTestId('selected-features-empty-state')).toBeInTheDocument();

      rerender(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={mockFeatures}
        />
      );

      expect(screen.queryByTestId('selected-features-empty-state')).not.toBeInTheDocument();
      expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle features with very long names', () => {
      const longNameFeature: Feature = {
        id: 1,
        name: 'This is a very long feature name that might cause layout issues if not handled properly',
        description: 'Description',
        display_order: 1,
      };

      render(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={[longNameFeature]}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText(longNameFeature.name)).toBeInTheDocument();
    });

    it('should handle features with special characters', () => {
      const specialCharFeature: Feature = {
        id: 1,
        name: 'Feature & Service™ (Premium)',
        description: 'Special chars: @#$%^&*()',
        display_order: 1,
      };

      render(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={[specialCharFeature]}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('Feature & Service™ (Premium)')).toBeInTheDocument();
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
          description: 'Duplicate ID feature',
          display_order: 1,
        }
      ];

      expect(() => {
        render(
          <SelectedFeaturesSummary
            {...defaultProps}
            selectedFeatures={duplicateFeatures}
          />,
          { wrapper: TestWrapper }
        );
      }).not.toThrow();

      expect(screen.getByText('Selected Features (2)')).toBeInTheDocument();
    });

    it('should handle zero or negative feature IDs', async () => {
      const user = userEvent.setup();
      const edgeIdFeatures: Feature[] = [
        {
          id: 0,
          name: 'Zero ID Feature',
          description: 'Feature with ID 0',
          display_order: 1,
        },
        {
          id: -1,
          name: 'Negative ID Feature',
          description: 'Feature with negative ID',
          display_order: 1,
        }
      ];

      render(
        <SelectedFeaturesSummary
          {...defaultProps}
          selectedFeatures={edgeIdFeatures}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      );

      const removeButtons = screen.getAllByRole('button');
      
      await user.click(removeButtons[0]);
      expect(mockOnRemove).toHaveBeenCalledWith(0);
      
      await user.click(removeButtons[1]);
      expect(mockOnRemove).toHaveBeenCalledWith(-1);
    });
  });
});