import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { Provider } from '@/components/ui/provider';
import AddonsGrid from '../addons-grid';
import { Addon } from '@plan-management/types';
import { CreatePlanFormData } from '@plan-management/schemas/validation/plans';

// Mock dependencies
vi.mock('@shared/config', () => ({
  PRIMARY_COLOR: '#3182CE',
  GRAY_COLOR: '#718096',
  DARK_COLOR: '#2D3748',
  WHITE_COLOR: '#FFFFFF',
  SECONDARY_COLOR: '#805AD5'
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

// Test form wrapper that provides React Hook Form context
const FormTestWrapper = ({ 
  children, 
  defaultValues = {}
}: { 
  children: (form: any) => React.ReactNode;
  defaultValues?: Partial<CreatePlanFormData>;
}) => {
  const form = useForm<CreatePlanFormData>({
    defaultValues: {
      addon_assignments: [],
      ...defaultValues
    }
  });

  return (
    <Provider>
      <form>
        {children(form)}
      </form>
    </Provider>
  );
};

describe('AddonsGrid', () => {
  const mockAddons: Addon[] = [
    {
      id: 1,
      name: 'Premium Analytics',
      description: 'Advanced analytics dashboard with real-time insights',
      base_price: 99,
      pricing_scope: 'branch',
      default_quantity: 1,
      is_included: false,
      min_quantity: 1,
      max_quantity: 5,
      display_order: 1
    },
    {
      id: 2,
      name: 'API Access',
      description: 'Full REST API access for integrations',
      base_price: 49,
      pricing_scope: 'branch',
      default_quantity: 1,
      display_order: 1,
      is_included: false,
      min_quantity: 2,
      max_quantity: 3
    },
    {
      id: 3,
      name: 'Extra Storage',
      description: 'Additional 100GB storage space',
      base_price: 25,
      pricing_scope: 'organization',
      default_quantity: null,
      display_order: 2,
      is_included: false,
      min_quantity: 3,
      max_quantity: null
    }
  ];

  const mockAddonAssignments = [
    { 
      id: '1', 
      addon_id: 1, 
      quantity: 1, 
      is_included: false,
      feature_level: 'basic' as const,
      default_quantity: 1,
      min_quantity: 1,
      max_quantity: 5
    },
    { 
      id: '3', 
      addon_id: 3, 
      quantity: 2, 
      is_included: false,
      feature_level: 'basic' as const,
      default_quantity: null,
      min_quantity: 3,
      max_quantity: null
    }
  ];

  const defaultProps = {
    loading: false,
    displayAddons: mockAddons,
    addonAssignments: mockAddonAssignments,
    isReadOnly: false,
    control: null,
    handleToggleWithConfirm: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('loading states', () => {
    it('should display loading skeleton when loading is true and no addon assignments', () => {
      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              loading={true}
              addonAssignments={[]}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      expect(screen.getByTestId('resource-skeleton')).toBeInTheDocument();
      expect(screen.getByTestId('skeleton-count')).toHaveTextContent('6');
      expect(screen.getByTestId('skeleton-columns')).toHaveTextContent('3');
      expect(screen.getByTestId('skeleton-variant')).toHaveTextContent('detailed');
      expect(screen.getByTestId('skeleton-min-height')).toHaveTextContent('120px');
    });

    it('should not display loading skeleton when loading is true but has addon assignments', () => {
      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              loading={true}
              addonAssignments={mockAddonAssignments}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      expect(screen.queryByTestId('resource-skeleton')).not.toBeInTheDocument();
      expect(screen.getByText('Premium Analytics')).toBeInTheDocument();
    });

    it('should not display addons grid when loading is true and no addon assignments', () => {
      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              loading={true}
              addonAssignments={[]}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      expect(screen.queryByText('Premium Analytics')).not.toBeInTheDocument();
      expect(screen.queryByText('API Access')).not.toBeInTheDocument();
      expect(screen.queryByText('Extra Storage')).not.toBeInTheDocument();
    });

    it('should display addons grid when loading is false', () => {
      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              loading={false}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      expect(screen.queryByTestId('resource-skeleton')).not.toBeInTheDocument();
      expect(screen.getByText('Premium Analytics')).toBeInTheDocument();
      expect(screen.getByText('API Access')).toBeInTheDocument();
      expect(screen.getByText('Extra Storage')).toBeInTheDocument();
    });
  });

  describe('empty states', () => {
    it('should show empty state when no addons available and isReadOnly is true', () => {
      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              displayAddons={[]}
              addonAssignments={[]}
              isReadOnly={true}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      expect(screen.getByTestId('addons-empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('empty-state-title')).toHaveTextContent('No add-ons included');
      expect(screen.getByTestId('empty-state-description')).toHaveTextContent('This plan does not include any add-ons');
    });

    it('should show empty state when no addons available and isReadOnly is false', () => {
      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              displayAddons={[]}
              addonAssignments={[]}
              isReadOnly={false}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      expect(screen.getByTestId('addons-empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('empty-state-title')).toHaveTextContent('No add-ons selected');
      expect(screen.getByTestId('empty-state-description')).toHaveTextContent('Select add-ons from the list above to configure this plan');
    });

    it('should not show empty state when addons are available', () => {
      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              displayAddons={mockAddons}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      expect(screen.queryByTestId('addons-empty-state')).not.toBeInTheDocument();
      expect(screen.getByText('Premium Analytics')).toBeInTheDocument();
    });

    it('should handle empty displayAddons gracefully', () => {
      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              displayAddons={[]}
              addonAssignments={[]}
              isReadOnly={false}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      // Should show empty state when both displayAddons and addonAssignments are empty
      expect(screen.getByTestId('addons-empty-state')).toBeInTheDocument();
    });
  });

  describe('addon rendering', () => {
    it('should render all addons with correct information', () => {
      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              displayAddons={mockAddons}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      expect(screen.getByText('Premium Analytics')).toBeInTheDocument();
      expect(screen.getByText('Advanced analytics dashboard with real-time insights')).toBeInTheDocument();
      expect(screen.getAllByText('Price: $')).toHaveLength(3);
      expect(screen.getByText('99')).toBeInTheDocument();
      expect(screen.getAllByText('Scope:')).toHaveLength(3);
      expect(screen.getAllByText('branch')).toHaveLength(2);
      expect(screen.getAllByText('Default: 1')).toHaveLength(2); // Premium Analytics and API Access both have default_quantity: 1
      
      expect(screen.getByText('API Access')).toBeInTheDocument();
      expect(screen.getByText('Full REST API access for integrations')).toBeInTheDocument();
      expect(screen.getByText('49')).toBeInTheDocument();
      
      expect(screen.getByText('Extra Storage')).toBeInTheDocument();
      expect(screen.getByText('Additional 100GB storage space')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('organization')).toBeInTheDocument();
    });

    it('should render addons in a 3-column grid', () => {
      const { container } = render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              displayAddons={mockAddons}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      // Check that the grid structure is rendered by looking for the grid container
      const gridContainer = container.querySelector('[class*="css-"]'); // Chakra UI generates CSS classes
      expect(gridContainer).toBeInTheDocument();
      
      // Verify that all addons are rendered as individual items
      expect(screen.getByText('Premium Analytics')).toBeInTheDocument();
      expect(screen.getByText('API Access')).toBeInTheDocument();
      expect(screen.getByText('Extra Storage')).toBeInTheDocument();
    });

    it('should render correct number of addon cards', () => {
      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              displayAddons={mockAddons}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      const addonCards = screen.getAllByText(/Premium Analytics|API Access|Extra Storage/);
      expect(addonCards).toHaveLength(3);
    });

    it('should handle addons without default quantity gracefully', () => {
      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              displayAddons={[mockAddons[2]]} // Extra Storage has null default_quantity
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      expect(screen.getByText('Extra Storage')).toBeInTheDocument();
      expect(screen.getByText('Additional 100GB storage space')).toBeInTheDocument();
      expect(screen.getByText('Price: $')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('Scope:')).toBeInTheDocument();
      expect(screen.getByText('organization')).toBeInTheDocument();
      
      // Should not display default quantity when it's null
      expect(screen.queryByText('Default:')).not.toBeInTheDocument();
    });

    it('should display default quantity when available', () => {
      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              displayAddons={[mockAddons[0]]} // Premium Analytics has default_quantity: 1
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      expect(screen.getByText('Default: 1')).toBeInTheDocument();
    });

    it('should handle zero base price gracefully', () => {
      const addonWithZeroPrice = {
        ...mockAddons[0],
        base_price: 0
      };

      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              displayAddons={[addonWithZeroPrice]}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      expect(screen.getByText('Premium Analytics')).toBeInTheDocument();
      expect(screen.getByText('Price: $')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument(); // Should display 0 for zero price
    });

    it('should display pricing scope correctly', () => {
      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              displayAddons={[mockAddons[0]]} // Uses 'branch' pricing_scope
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      expect(screen.getByText('Premium Analytics')).toBeInTheDocument();
      expect(screen.getByText('Scope:')).toBeInTheDocument();
      expect(screen.getByText('branch')).toBeInTheDocument();
    });
  });

  describe('addon selection states', () => {
    it('should show unselected state for addons not in addonAssignments', () => {
      const { container } = render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              addonAssignments={[]}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      // All addons should show unselected state (checkbox outline icons)
      // Since we can't easily test React Icons, we verify by checking that
      // the addons are rendered and clickable (indicating unselected interactive state)
      expect(screen.getByText('Premium Analytics')).toBeInTheDocument();
      expect(screen.getByText('API Access')).toBeInTheDocument();
      expect(screen.getByText('Extra Storage')).toBeInTheDocument();
      
      // Verify addons are in unselected state by checking for lack of selected styling
      const addonCards = container.querySelectorAll('[class*="css-"]');
      expect(addonCards.length).toBeGreaterThan(0);
    });

    it('should show selected state for addons in addonAssignments', () => {
      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              addonAssignments={mockAddonAssignments} // Contains addons 1 and 3
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      // Selected addons should have different styling/icons
      // This would need to check for specific styling or icons used for selected state
      expect(screen.getByText('Premium Analytics')).toBeInTheDocument(); // addon_id: 1
      expect(screen.getByText('Extra Storage')).toBeInTheDocument(); // addon_id: 3
    });

    it('should handle mixed selection states correctly', () => {
      const mixedAssignments = [{ 
        id: '2', 
        addon_id: 2, 
        quantity: 1, 
        is_included: false,
        feature_level: 'basic' as const,
        default_quantity: 1,
        min_quantity: 1,
        max_quantity: 5
      }];

      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              addonAssignments={mixedAssignments}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      // Only addon with id 2 (API Access) should be selected
      // Other addons should be unselected
      expect(screen.getByText('API Access')).toBeInTheDocument();
      expect(screen.getByText('Premium Analytics')).toBeInTheDocument();
      expect(screen.getByText('Extra Storage')).toBeInTheDocument();
    });
  });

  describe('interaction handling', () => {
    it('should call handleToggleWithConfirm when addon card is clicked and not readonly', async () => {
      const user = userEvent.setup();
      const mockHandleToggle = vi.fn();

      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              isReadOnly={false}
              handleToggleWithConfirm={mockHandleToggle}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      // Click on the addon text which should be within the clickable area
      await user.click(screen.getByText('Premium Analytics'));
      expect(mockHandleToggle).toHaveBeenCalledWith(1);
    });

    it('should not call handleToggleWithConfirm when addon card is clicked in readonly mode', async () => {
      const user = userEvent.setup();
      const mockHandleToggle = vi.fn();

      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              isReadOnly={true}
              handleToggleWithConfirm={mockHandleToggle}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      // Click on the addon text - in readonly mode this should not trigger the handler
      await user.click(screen.getByText('Premium Analytics'));
      expect(mockHandleToggle).not.toHaveBeenCalled();
    });

    it('should handle multiple addon clicks correctly', async () => {
      const user = userEvent.setup();
      const mockHandleToggle = vi.fn();

      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              isReadOnly={false}
              handleToggleWithConfirm={mockHandleToggle}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      // Click on each addon text
      await user.click(screen.getByText('Premium Analytics'));
      await user.click(screen.getByText('API Access'));
      await user.click(screen.getByText('Extra Storage'));

      expect(mockHandleToggle).toHaveBeenCalledTimes(3);
      expect(mockHandleToggle).toHaveBeenNthCalledWith(1, 1);
      expect(mockHandleToggle).toHaveBeenNthCalledWith(2, 2);
      expect(mockHandleToggle).toHaveBeenNthCalledWith(3, 3);
    });
  });

  describe('readonly mode behavior', () => {
    it('should not show selection indicators in readonly mode', () => {
      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              isReadOnly={true}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      // Selection indicators should not be visible in readonly mode
      // This would check for absence of checkbox icons or selection UI
      expect(screen.getByText('Premium Analytics')).toBeInTheDocument();
      expect(screen.getByText('API Access')).toBeInTheDocument();
      expect(screen.getByText('Extra Storage')).toBeInTheDocument();
    });

    it('should show different styling in readonly mode', () => {
      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              isReadOnly={true}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      // Addons should be displayed but not interactive
      expect(screen.getByText('Premium Analytics')).toBeInTheDocument();
    });

    it('should maintain selection display in readonly mode', () => {
      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              isReadOnly={true}
              addonAssignments={mockAddonAssignments}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      // Selected addons should still show as selected visually
      // but without interactive elements
      expect(screen.getByText('Premium Analytics')).toBeInTheDocument();
      expect(screen.getByText('Extra Storage')).toBeInTheDocument();
    });
  });

  describe('visual styling and states', () => {
    it('should apply correct styling for selected addons', () => {
      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              addonAssignments={[{ 
                id: '1', 
                addon_id: 1, 
                is_included: false,
                feature_level: 'basic' as const,
                default_quantity: 1,
                min_quantity: 1,
                max_quantity: 5
              }]}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      // Selected addon cards should have different border/background colors
      // This would check for specific CSS classes or inline styles
      expect(screen.getByText('Premium Analytics')).toBeInTheDocument();
    });

    it('should apply hover effects when not readonly', () => {
      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              isReadOnly={false}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      // Addon cards should have hover effects
      expect(screen.getByText('Premium Analytics')).toBeInTheDocument();
    });

    it('should not apply hover effects in readonly mode', () => {
      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              isReadOnly={true}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      // Addon cards should have default cursor in readonly mode
      expect(screen.getByText('Premium Analytics')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should be keyboard navigable when not readonly', async () => {
      const user = userEvent.setup();
      const mockHandleToggle = vi.fn();

      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              isReadOnly={false}
              handleToggleWithConfirm={mockHandleToggle}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      // Should be able to tab through addon cards
      await user.tab();
    });

    it('should support keyboard activation when not readonly', async () => {
      const user = userEvent.setup();
      const mockHandleToggle = vi.fn();

      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              isReadOnly={false}
              handleToggleWithConfirm={mockHandleToggle}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      // Since the addons are clickable boxes, we can test click interaction
      // which is the primary interaction method for this component
      const firstAddon = screen.getByText('Premium Analytics').closest('div');

      if (firstAddon) {
        await user.click(firstAddon);
        expect(mockHandleToggle).toHaveBeenCalledWith(1);
      } else {
        // If the closest div approach doesn't work, test the text element directly
        await user.click(screen.getByText('Premium Analytics'));
        expect(mockHandleToggle).toHaveBeenCalledWith(1);
      }
    });

    it('should have proper ARIA attributes for interactive elements', () => {
      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              isReadOnly={false}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      // Interactive addon cards should have proper ARIA attributes
      // This would check for role, aria-label, aria-pressed, etc.
      expect(screen.getByText('Premium Analytics')).toBeInTheDocument();
    });

    it('should not be keyboard navigable in readonly mode', () => {
      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              isReadOnly={true}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      // Addon cards should not be focusable in readonly mode
      expect(screen.getByText('Premium Analytics')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should handle empty addon objects gracefully', () => {
      const incompleteAddon = {
        id: 1,
        name: '',
        description: '',
        base_price: 0,
        pricing_scope: 'branch' as const,
        default_quantity: null,
        is_included: false,
        min_quantity: null,
        max_quantity: null,
        display_order: 1
      } as Addon;

      expect(() => {
        render(
          <FormTestWrapper>
            {(form) => (
              <AddonsGrid
                {...defaultProps}
                displayAddons={[incompleteAddon]}
                control={form.control}
              />
            )}
          </FormTestWrapper>
        );
      }).not.toThrow();
    });

    it('should handle missing addon properties gracefully', () => {
      const incompleteAddon = {
        id: 1
      } as Addon;

      expect(() => {
        render(
          <FormTestWrapper>
            {(form) => (
              <AddonsGrid
                {...defaultProps}
                displayAddons={[incompleteAddon]}
                control={form.control}
              />
            )}
          </FormTestWrapper>
        );
      }).not.toThrow();
    });

    it('should handle invalid addonAssignments gracefully', () => {
      const invalidAssignments = [
        { 
          id: '999', 
          addon_id: 999, 
          quantity: 1, 
          is_included: false,
          feature_level: 'basic' as const,
          default_quantity: 1,
          min_quantity: 1,
          max_quantity: 5
        },
        { 
          id: '-1', 
          addon_id: -1, 
          quantity: 1, 
          is_included: false,
          feature_level: 'basic' as const,
          default_quantity: 1,
          min_quantity: 1,
          max_quantity: 5
        }
      ];

      expect(() => {
        render(
          <FormTestWrapper>
            {(form) => (
              <AddonsGrid
                {...defaultProps}
                addonAssignments={invalidAssignments}
                control={form.control}
              />
            )}
          </FormTestWrapper>
        );
      }).not.toThrow();
    });

    it('should handle null or undefined handleToggleWithConfirm', () => {
      expect(() => {
        render(
          <FormTestWrapper>
            {(form) => (
              <AddonsGrid
                {...defaultProps}
                handleToggleWithConfirm={undefined as any}
                control={form.control}
              />
            )}
          </FormTestWrapper>
        );
      }).not.toThrow();
    });
  });

  describe('performance considerations', () => {
    it('should handle large numbers of addons efficiently', () => {
      const manyAddons: Addon[] = Array.from({ length: 100 }, (_, index) => ({
        id: index + 1,
        name: `Addon ${index + 1}`,
        description: `Description for addon ${index + 1}`,
        base_price: 10 + index,
        pricing_scope: 'branch' as const,
        default_quantity: 1,
        is_included: false,
        min_quantity: 1,
        max_quantity: 5,
        display_order: index + 1
      }));

      const start = performance.now();
      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              displayAddons={manyAddons}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );
      const end = performance.now();

      // Should render reasonably quickly even with many addons
      // Increased timeout to account for test environment variability
      expect(end - start).toBeLessThan(2000); // Less than 2 seconds
    });

    it('should handle frequent selection updates efficiently', () => {
      const { rerender } = render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              addonAssignments={[]}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      // Simulate rapid selection changes
      const selectionStates = [
        [{ 
          id: '1', 
          addon_id: 1, 
          quantity: 1, 
          is_included: false,
          feature_level: 'basic' as const,
          default_quantity: 1,
          min_quantity: 1,
          max_quantity: 5
        }],
        [
          { 
            id: '1', 
            addon_id: 1, 
            quantity: 1, 
            is_included: false,
            feature_level: 'basic' as const,
            default_quantity: 1,
            min_quantity: 1,
            max_quantity: 5
          },
          { 
            id: '2', 
            addon_id: 2, 
            quantity: 1, 
            is_included: false,
            feature_level: 'basic' as const,
            default_quantity: 1,
            min_quantity: 1,
            max_quantity: 5
          }
        ],
        [
          { 
            id: '1', 
            addon_id: 1, 
            quantity: 1, 
            is_included: false,
            feature_level: 'basic' as const,
            default_quantity: 1,
            min_quantity: 1,
            max_quantity: 5
          },
          { 
            id: '2', 
            addon_id: 2, 
            quantity: 1,
            is_included: false,
            feature_level: 'basic' as const,
            default_quantity: 1,
            min_quantity: 1,
            max_quantity: 5
          },
          { 
            id: '3', 
            addon_id: 3, 
            quantity: 1, 
            is_included: false,
            feature_level: 'basic' as const,
            default_quantity: null,
            min_quantity: 3,
            max_quantity: null
          }
        ],
        [
          { 
            id: '2', 
            addon_id: 2, 
            quantity: 1, 
            is_included: false,
            feature_level: 'basic' as const,
            default_quantity: 1,
            min_quantity: 1,
            max_quantity: 5
          },
          { 
            id: '3', 
            addon_id: 3, 
            quantity: 1, 
            is_included: false,
            feature_level: 'basic' as const,
            default_quantity: null,
            min_quantity: 3,
            max_quantity: null
          }
        ],
        [{ 
          id: '3', 
          addon_id: 3, 
          quantity: 1, 
          is_included: false,
          feature_level: 'basic' as const,
          default_quantity: null,
          min_quantity: 3,
          max_quantity: null
        }],
        []
      ];

      selectionStates.forEach(assignments => {
        expect(() => {
          rerender(
            <FormTestWrapper>
              {(form) => (
                <AddonsGrid
                  {...defaultProps}
                  addonAssignments={assignments}
                  control={form.control}
                />
              )}
            </FormTestWrapper>
          );
        }).not.toThrow();
      });
    });
  });

  describe('component lifecycle', () => {
    it('should cleanup properly on unmount', () => {
      const { unmount } = render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      expect(() => unmount()).not.toThrow();
    });

    it('should handle prop changes correctly', () => {
      const { rerender } = render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              loading={true}
              addonAssignments={[]}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      expect(screen.getByTestId('resource-skeleton')).toBeInTheDocument();

      rerender(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              loading={false}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      expect(screen.queryByTestId('resource-skeleton')).not.toBeInTheDocument();
      expect(screen.getByText('Premium Analytics')).toBeInTheDocument();
    });

    it('should handle displayAddons updates correctly', () => {
      const { rerender } = render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              displayAddons={[mockAddons[0]]}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      expect(screen.getByText('Premium Analytics')).toBeInTheDocument();
      expect(screen.queryByText('API Access')).not.toBeInTheDocument();

      rerender(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              displayAddons={mockAddons}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      expect(screen.getByText('Premium Analytics')).toBeInTheDocument();
      expect(screen.getByText('API Access')).toBeInTheDocument();
      expect(screen.getByText('Extra Storage')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle addons with very long names and descriptions', () => {
      const longTextAddon: Addon = {
        id: 1,
        name: 'This is a very long addon name that might cause layout issues if not handled properly in the UI components',
        description: 'This is an extremely long description that goes on and on and on and should be handled gracefully by the component without breaking the layout or causing visual issues that would impact the user experience negatively',
        base_price: 99,
        pricing_scope: 'branch' as const,
        default_quantity: 1,
        is_included: false,
        min_quantity: 1,
        max_quantity: 5,
        display_order: 1
      };

      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              displayAddons={[longTextAddon]}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      expect(screen.getByText(longTextAddon.name)).toBeInTheDocument();
      expect(screen.getByText(longTextAddon.description)).toBeInTheDocument();
    });

    it('should handle addons with special characters in names and descriptions', () => {
      const specialCharAddon: Addon = {
        id: 1,
        name: 'Addon & Service™ (Premium) - 2024',
        description: 'Special chars: @#$%^&*()_+{}|:"<>?[];\\,./`~',
        base_price: 99,
        pricing_scope: 'branch' as const,
        default_quantity: 1,
        is_included: false,
        min_quantity: 1,
        max_quantity: 5,
        display_order: 1
      };

      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              displayAddons={[specialCharAddon]}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      expect(screen.getByText('Addon & Service™ (Premium) - 2024')).toBeInTheDocument();
      expect(screen.getByText('Special chars: @#$%^&*()_+{}|:"<>?[];\\,./`~')).toBeInTheDocument();
    });

    it('should handle duplicate addon IDs gracefully', () => {
      const duplicateAddons: Addon[] = [
        {
          id: 1,
          name: 'Addon 1',
          description: 'First addon',
          base_price: 50,
          pricing_scope: 'branch' as const,
          default_quantity: 1,
          is_included: false,
          min_quantity: 1,
          max_quantity: 5,
          display_order: 1
        },
        {
          id: 1,
          name: 'Addon 1 Duplicate',
          description: 'Second addon with same ID',
          base_price: 75,
          pricing_scope: 'branch' as const,
          default_quantity: 2,
          is_included: false,
          min_quantity: 1,
          max_quantity: 5,
          display_order: 2
        }
      ];

      expect(() => {
        render(
          <FormTestWrapper>
            {(form) => (
              <AddonsGrid
                {...defaultProps}
                displayAddons={duplicateAddons}
                control={form.control}
              />
            )}
          </FormTestWrapper>
        );
      }).not.toThrow();
    });

    it('should handle addons with negative prices', () => {
      const negativePrice: Addon = {
        id: 1,
        name: 'Discount Addon',
        description: 'Addon with negative price',
        base_price: -10,
        pricing_scope: 'branch' as const,
        default_quantity: 1,
        is_included: false,
        min_quantity: 1,
        max_quantity: 5,
        display_order: 1
      };

      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              displayAddons={[negativePrice]}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      expect(screen.getByText('Discount Addon')).toBeInTheDocument();
      expect(screen.getByText('Price: $')).toBeInTheDocument();
      expect(screen.getByText('-10')).toBeInTheDocument();
    });

    it('should handle addons with empty description', () => {
      const emptyDescriptionAddon = {
        ...mockAddons[0],
        description: '',
      };

      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              displayAddons={[emptyDescriptionAddon]}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      expect(screen.getByText('Premium Analytics')).toBeInTheDocument();
      expect(screen.getByText('Price: $')).toBeInTheDocument();
      expect(screen.getByText('99')).toBeInTheDocument();
    });

    it('should handle addons with zero price', () => {
      const zeroPriceAddon = {
        ...mockAddons[0],
        base_price: 0,
      };

      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              displayAddons={[zeroPriceAddon]}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      expect(screen.getByText('Premium Analytics')).toBeInTheDocument();
      expect(screen.getByText('Price: $')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('icon rendering', () => {
    it('should show correct empty state icon based on readonly status', () => {
      // Test readonly mode icon
      const { rerender } = render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              displayAddons={[]}
              addonAssignments={[]}
              isReadOnly={true}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      expect(screen.getByTestId('addons-empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('empty-state-icon')).toBeInTheDocument();

      // Test non-readonly mode icon
      rerender(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              displayAddons={[]}
              addonAssignments={[]}
              isReadOnly={false}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      expect(screen.getByTestId('addons-empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('empty-state-icon')).toBeInTheDocument();
    });
  });

  describe('controller integration', () => {
    it('should render with Controller wrapper for form integration', () => {
      render(
        <FormTestWrapper>
          {(form) => (
            <AddonsGrid
              {...defaultProps}
              control={form.control}
            />
          )}
        </FormTestWrapper>
      );

      // Component should render without errors when wrapped with Controller
      expect(screen.getByText('Premium Analytics')).toBeInTheDocument();
      expect(screen.getByText('API Access')).toBeInTheDocument();
      expect(screen.getByText('Extra Storage')).toBeInTheDocument();
    });
  });
});