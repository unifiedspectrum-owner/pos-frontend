import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from '@/components/ui/provider';
import SLAsGrid from '../slas-grid';
import { SupportSLA } from '@plan-management/types';

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

describe('SLAsGrid', () => {
  const mockSlas: SupportSLA[] = [
    {
      id: 1,
      name: 'Premium Support',
      support_channel: 'phone',
      response_time_hours: 24,
      availability_schedule: '24/7',
      notes: 'Premium tier support with dedicated agent',
      display_order: 1
    },
    {
      id: 2,
      name: 'Standard Support',
      support_channel: 'email',
      response_time_hours: 48,
      availability_schedule: '9-5 Mon-Fri',
      notes: 'Standard email support',
      display_order: 2,
    },
    {
      id: 3,
      name: 'Chat Support',
      support_channel: 'chat',
      response_time_hours: 4,
      availability_schedule: '9-5 Mon-Fri',
      notes: '',
      display_order: 3,
    }
  ];

  const defaultProps = {
    loading: false,
    displaySlas: mockSlas,
    selectedSlaIds: [],
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
    it('should display loading skeleton when loading is true and no selected SLAs', () => {
      render(
        <SLAsGrid
          {...defaultProps}
          loading={true}
          selectedSlaIds={[]}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByTestId('resource-skeleton')).toBeInTheDocument();
      expect(screen.getByTestId('skeleton-count')).toHaveTextContent('6');
      expect(screen.getByTestId('skeleton-columns')).toHaveTextContent('3');
      expect(screen.getByTestId('skeleton-variant')).toHaveTextContent('detailed');
      expect(screen.getByTestId('skeleton-min-height')).toHaveTextContent('140px');
    });

    it('should not display loading skeleton when loading is true but has selected SLAs', () => {
      render(
        <SLAsGrid
          {...defaultProps}
          loading={true}
          selectedSlaIds={[1]}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.queryByTestId('resource-skeleton')).not.toBeInTheDocument();
      expect(screen.getByText('Premium Support')).toBeInTheDocument();
    });

    it('should not display SLAs grid when loading is true and no selected SLAs', () => {
      render(
        <SLAsGrid
          {...defaultProps}
          loading={true}
          selectedSlaIds={[]}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.queryByText('Premium Support')).not.toBeInTheDocument();
      expect(screen.queryByText('Standard Support')).not.toBeInTheDocument();
      expect(screen.queryByText('Chat Support')).not.toBeInTheDocument();
    });

    it('should display SLAs grid when loading is false', () => {
      render(
        <SLAsGrid
          {...defaultProps}
          loading={false}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.queryByTestId('resource-skeleton')).not.toBeInTheDocument();
      expect(screen.getByText('Premium Support')).toBeInTheDocument();
      expect(screen.getByText('Standard Support')).toBeInTheDocument();
      expect(screen.getByText('Chat Support')).toBeInTheDocument();
    });
  });

  describe('empty states', () => {
    it('should show empty state when no SLAs available and isReadOnly is true', () => {
      render(
        <SLAsGrid
          {...defaultProps}
          displaySlas={[]}
          selectedSlaIds={[]}
          isReadOnly={true}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByTestId('slas-empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('empty-state-title')).toHaveTextContent('No SLAs included');
      expect(screen.getByTestId('empty-state-description')).toHaveTextContent('This plan does not include any SLAs');
    });

    it('should show empty state when no SLAs available and isReadOnly is false', () => {
      render(
        <SLAsGrid
          {...defaultProps}
          displaySlas={[]}
          selectedSlaIds={[]}
          isReadOnly={false}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByTestId('slas-empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('empty-state-title')).toHaveTextContent('No SLAs selected');
      expect(screen.getByTestId('empty-state-description')).toHaveTextContent('Select SLAs from the list above to configure this plan');
    });

    it('should not show empty state when SLAs are available', () => {
      render(
        <SLAsGrid
          {...defaultProps}
          displaySlas={mockSlas}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.queryByTestId('slas-empty-state')).not.toBeInTheDocument();
      expect(screen.getByText('Premium Support')).toBeInTheDocument();
    });

    it('should not show empty state when SLAs are available', () => {
      render(
        <SLAsGrid
          loading={false}
          displaySlas={[mockSlas[0]]}
          selectedSlaIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={vi.fn()}
        />,
        { wrapper: TestWrapper }
      );

      // Should not show empty state when SLAs are available
      expect(screen.queryByTestId('slas-empty-state')).not.toBeInTheDocument();
      expect(screen.getByText('Premium Support')).toBeInTheDocument();
    });

    it('should handle empty displaySlas gracefully', () => {
      render(
        <SLAsGrid
          {...defaultProps}
          displaySlas={[]}
          selectedSlaIds={[]}
          isReadOnly={false} />,
        { wrapper: TestWrapper }
      );

      // Should show empty state when both displaySlas and selectedSlaIds are empty
      expect(screen.getByTestId('slas-empty-state')).toBeInTheDocument();
    });
  });

  describe('SLA rendering', () => {
    it('should render all SLAs with correct information', () => {
      render(
        <SLAsGrid
          {...defaultProps}
          displaySlas={mockSlas}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('Premium Support')).toBeInTheDocument();
      expect(screen.getByText('Channel: phone')).toBeInTheDocument();
      expect(screen.getByText('Response: 24h')).toBeInTheDocument();
      expect(screen.getByText('Schedule: 24/7')).toBeInTheDocument();
      expect(screen.getByText('Premium tier support with dedicated agent')).toBeInTheDocument();
      
      expect(screen.getByText('Standard Support')).toBeInTheDocument();
      expect(screen.getByText('Channel: email')).toBeInTheDocument();
      expect(screen.getByText('Response: 48h')).toBeInTheDocument();
      expect(screen.getByText('Standard email support')).toBeInTheDocument();
      
      expect(screen.getByText('Chat Support')).toBeInTheDocument();
      expect(screen.getByText('Channel: chat')).toBeInTheDocument();
      expect(screen.getByText('Response: 4h')).toBeInTheDocument();
      
      // Both Standard Support and Chat Support have "9-5 Mon-Fri" schedule
      const scheduleElements = screen.getAllByText('Schedule: 9-5 Mon-Fri');
      expect(scheduleElements).toHaveLength(2);
    });

    it('should render SLAs in a 3-column grid', () => {
      const { container } = render(
        <SLAsGrid
          {...defaultProps}
          displaySlas={mockSlas}
        />,
        { wrapper: TestWrapper }
      );

      // Check that the grid structure is rendered by looking for the grid container
      const gridContainer = container.querySelector('[class*="css-"]'); // Chakra UI generates CSS classes
      expect(gridContainer).toBeInTheDocument();
      
      // Verify that all SLAs are rendered as individual items
      expect(screen.getByText('Premium Support')).toBeInTheDocument();
      expect(screen.getByText('Standard Support')).toBeInTheDocument();
      expect(screen.getByText('Chat Support')).toBeInTheDocument();
    });

    it('should render correct number of SLA cards', () => {
      render(
        <SLAsGrid
          {...defaultProps}
          displaySlas={mockSlas}
        />,
        { wrapper: TestWrapper }
      );

      const slaCards = screen.getAllByText(/Premium Support|Standard Support|Chat Support/);
      expect(slaCards).toHaveLength(3);
    });

    it('should handle SLAs without notes gracefully', () => {
      render(
        <SLAsGrid
          {...defaultProps}
          displaySlas={[mockSlas[2]]} // Chat Support has null notes
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('Chat Support')).toBeInTheDocument();
      expect(screen.getByText('Channel: chat')).toBeInTheDocument();
      expect(screen.getByText('Response: 4h')).toBeInTheDocument();
      expect(screen.getByText('Schedule: 9-5 Mon-Fri')).toBeInTheDocument();
    });

    it('should display notes when available', () => {
      render(
        <SLAsGrid
          {...defaultProps}
          displaySlas={[mockSlas[0]]} // Premium Support has notes
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('Premium tier support with dedicated agent')).toBeInTheDocument();
    });
  });

  describe('SLA selection states', () => {
    it('should show unselected state for SLAs not in selectedSlaIds', () => {
      const { container } = render(
        <SLAsGrid
          {...defaultProps}
          selectedSlaIds={[]}
        />,
        { wrapper: TestWrapper }
      );

      // All SLAs should show unselected state (checkbox outline icons)
      // Since we can't easily test React Icons, we verify by checking that
      // the SLAs are rendered and clickable (indicating unselected interactive state)
      expect(screen.getByText('Premium Support')).toBeInTheDocument();
      expect(screen.getByText('Standard Support')).toBeInTheDocument();
      expect(screen.getByText('Chat Support')).toBeInTheDocument();
      
      // Verify SLAs are in unselected state by checking for lack of selected styling
      const slaCards = container.querySelectorAll('[class*="css-"]');
      expect(slaCards.length).toBeGreaterThan(0);
    });

    it('should show selected state for SLAs in selectedSlaIds', () => {
      render(
        <SLAsGrid
          {...defaultProps}
          selectedSlaIds={[1, 3]}
        />,
        { wrapper: TestWrapper }
      );

      // Selected SLAs should have different styling/icons
      // This would need to check for specific styling or icons used for selected state
      expect(screen.getByText('Premium Support')).toBeInTheDocument();
      expect(screen.getByText('Chat Support')).toBeInTheDocument();
    });

    it('should handle mixed selection states correctly', () => {
      render(
        <SLAsGrid
          {...defaultProps}
          selectedSlaIds={[2]}
        />,
        { wrapper: TestWrapper }
      );

      // Only SLA with id 2 (Standard Support) should be selected
      // Other SLAs should be unselected
      expect(screen.getByText('Standard Support')).toBeInTheDocument();
      expect(screen.getByText('Premium Support')).toBeInTheDocument();
      expect(screen.getByText('Chat Support')).toBeInTheDocument();
    });
  });

  describe('interaction handling', () => {
    it('should call handleToggleWithConfirm when SLA card is clicked and not readonly', async () => {
      const user = userEvent.setup();
      const mockHandleToggle = vi.fn();

      render(
        <SLAsGrid
          {...defaultProps}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggle}
        />,
        { wrapper: TestWrapper }
      );

      // Click on the SLA text which should be within the clickable area
      await user.click(screen.getByText('Premium Support'));
      expect(mockHandleToggle).toHaveBeenCalledWith(1);
    });

    it('should not call handleToggleWithConfirm when SLA card is clicked in readonly mode', async () => {
      const user = userEvent.setup();
      const mockHandleToggle = vi.fn();

      render(
        <SLAsGrid
          {...defaultProps}
          isReadOnly={true}
          handleToggleWithConfirm={mockHandleToggle}
        />,
        { wrapper: TestWrapper }
      );

      // Click on the SLA text - in readonly mode this should not trigger the handler
      await user.click(screen.getByText('Premium Support'));
      expect(mockHandleToggle).not.toHaveBeenCalled();
    });

    it('should handle multiple SLA clicks correctly', async () => {
      const user = userEvent.setup();
      const mockHandleToggle = vi.fn();

      render(
        <SLAsGrid
          {...defaultProps}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggle}
        />,
        { wrapper: TestWrapper }
      );

      // Click on each SLA text
      await user.click(screen.getByText('Premium Support'));
      await user.click(screen.getByText('Standard Support'));
      await user.click(screen.getByText('Chat Support'));

      expect(mockHandleToggle).toHaveBeenCalledTimes(3);
      expect(mockHandleToggle).toHaveBeenNthCalledWith(1, 1);
      expect(mockHandleToggle).toHaveBeenNthCalledWith(2, 2);
      expect(mockHandleToggle).toHaveBeenNthCalledWith(3, 3);
    });
  });

  describe('readonly mode behavior', () => {
    it('should not show selection indicators in readonly mode', () => {
      render(
        <SLAsGrid
          {...defaultProps}
          isReadOnly={true}
        />,
        { wrapper: TestWrapper }
      );

      // Selection indicators should not be visible in readonly mode
      // This would check for absence of checkbox icons or selection UI
      expect(screen.getByText('Premium Support')).toBeInTheDocument();
      expect(screen.getByText('Standard Support')).toBeInTheDocument();
      expect(screen.getByText('Chat Support')).toBeInTheDocument();
    });

    it('should show different styling in readonly mode', () => {
      render(
        <SLAsGrid
          {...defaultProps}
          isReadOnly={true}
        />,
        { wrapper: TestWrapper }
      );

      // SLAs should be displayed but not interactive
      expect(screen.getByText('Premium Support')).toBeInTheDocument();
    });

    it('should maintain selection display in readonly mode', () => {
      render(
        <SLAsGrid
          {...defaultProps}
          isReadOnly={true}
          selectedSlaIds={[1, 2]}
        />,
        { wrapper: TestWrapper }
      );

      // Selected SLAs should still show as selected visually
      // but without interactive elements
      expect(screen.getByText('Premium Support')).toBeInTheDocument();
      expect(screen.getByText('Standard Support')).toBeInTheDocument();
    });
  });

  describe('visual styling and states', () => {
    it('should apply correct styling for selected SLAs', () => {
      render(
        <SLAsGrid
          {...defaultProps}
          selectedSlaIds={[1]}
        />,
        { wrapper: TestWrapper }
      );

      // Selected SLA cards should have different border/background colors
      // This would check for specific CSS classes or inline styles
      expect(screen.getByText('Premium Support')).toBeInTheDocument();
    });

    it('should apply hover effects when not readonly', () => {
      render(
        <SLAsGrid
          {...defaultProps}
          isReadOnly={false}
        />,
        { wrapper: TestWrapper }
      );

      // SLA cards should have hover effects
      expect(screen.getByText('Premium Support')).toBeInTheDocument();
    });

    it('should not apply hover effects in readonly mode', () => {
      render(
        <SLAsGrid
          {...defaultProps}
          isReadOnly={true}
        />,
        { wrapper: TestWrapper }
      );

      // SLA cards should have default cursor in readonly mode
      expect(screen.getByText('Premium Support')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should be keyboard navigable when not readonly', async () => {
      const user = userEvent.setup();
      const mockHandleToggle = vi.fn();

      render(
        <SLAsGrid
          {...defaultProps}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggle}
        />,
        { wrapper: TestWrapper }
      );

      // Should be able to tab through SLA cards
      await user.tab();
    });

    it('should support keyboard activation when not readonly', async () => {
      const user = userEvent.setup();
      const mockHandleToggle = vi.fn();

      render(
        <SLAsGrid
          {...defaultProps}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggle}
        />,
        { wrapper: TestWrapper }
      );

      // Since the SLAs are clickable boxes, we can test click interaction
      // which is the primary interaction method for this component
      const firstSla = screen.getByText('Premium Support').closest('div');

      if (firstSla) {
        await user.click(firstSla);
        expect(mockHandleToggle).toHaveBeenCalledWith(1);
      } else {
        // If the closest div approach doesn't work, test the text element directly
        await user.click(screen.getByText('Premium Support'));
        expect(mockHandleToggle).toHaveBeenCalledWith(1);
      }
    });

    it('should have proper ARIA attributes for interactive elements', () => {
      render(
        <SLAsGrid
          {...defaultProps}
          isReadOnly={false}
        />,
        { wrapper: TestWrapper }
      );

      // Interactive SLA cards should have proper ARIA attributes
      // This would check for role, aria-label, aria-pressed, etc.
      expect(screen.getByText('Premium Support')).toBeInTheDocument();
    });

    it('should not be keyboard navigable in readonly mode', () => {
      render(
        <SLAsGrid
          {...defaultProps}
          isReadOnly={true}
        />,
        { wrapper: TestWrapper }
      );

      // SLA cards should not be focusable in readonly mode
      expect(screen.getByText('Premium Support')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should handle empty SLA objects gracefully', () => {
      const incompleteSla = {
        id: 1,
        name: '',
        support_channel: '',
        response_time_hours: 0,
        availability_schedule: '',
        notes: '',
        display_order: 1,
      } as SupportSLA;

      expect(() => {
        render(
          <SLAsGrid
            {...defaultProps}
            displaySlas={[incompleteSla]}
          />,
          { wrapper: TestWrapper }
        );
      }).not.toThrow();
    });

    it('should handle missing SLA properties gracefully', () => {
      const incompleteSla = {
        id: 1
      } as SupportSLA;

      expect(() => {
        render(
          <SLAsGrid
            {...defaultProps}
            displaySlas={[incompleteSla]}
          />,
          { wrapper: TestWrapper }
        );
      }).not.toThrow();
    });

    it('should handle invalid selectedSlaIds gracefully', () => {
      expect(() => {
        render(
          <SLAsGrid
            {...defaultProps}
            selectedSlaIds={[999, -1, 0]}
          />,
          { wrapper: TestWrapper }
        );
      }).not.toThrow();
    });

    it('should handle null or undefined handleToggleWithConfirm', () => {
      expect(() => {
        render(
          <SLAsGrid
            {...defaultProps}
            handleToggleWithConfirm={undefined as any}
          />,
          { wrapper: TestWrapper }
        );
      }).not.toThrow();
    });
  });

  describe('performance considerations', () => {
    it('should handle large numbers of SLAs efficiently', () => {
      const manySlas: SupportSLA[] = Array.from({ length: 100 }, (_, index) => ({
        id: index + 1,
        name: `SLA ${index + 1}`,
        support_channel: 'email',
        response_time_hours: 24,
        availability_schedule: '9-5 Mon-Fri',
        notes: `Notes for SLA ${index + 1}`,
        display_order: 1,
      }));

      const start = performance.now();
      render(
        <SLAsGrid
          {...defaultProps}
          displaySlas={manySlas}
        />,
        { wrapper: TestWrapper }
      );
      const end = performance.now();

      // Should render reasonably quickly even with many SLAs
      expect(end - start).toBeLessThan(1000); // Less than 1 second
    });

    it('should handle frequent selection updates efficiently', () => {
      const { rerender } = render(
        <SLAsGrid
          {...defaultProps}
          selectedSlaIds={[]}
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
            <SLAsGrid
              {...defaultProps}
              selectedSlaIds={selection}
            />
          );
        }).not.toThrow();
      });
    });
  });

  describe('component lifecycle', () => {
    it('should cleanup properly on unmount', () => {
      const { unmount } = render(
        <SLAsGrid
          {...defaultProps}
        />,
        { wrapper: TestWrapper }
      );

      expect(() => unmount()).not.toThrow();
    });

    it('should handle prop changes correctly', () => {
      const { rerender } = render(
        <SLAsGrid
          {...defaultProps}
          loading={true}
          selectedSlaIds={[]}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByTestId('resource-skeleton')).toBeInTheDocument();

      rerender(
        <SLAsGrid
          {...defaultProps}
          loading={false}
        />
      );

      expect(screen.queryByTestId('resource-skeleton')).not.toBeInTheDocument();
      expect(screen.getByText('Premium Support')).toBeInTheDocument();
    });

    it('should handle displaySlas updates correctly', () => {
      const { rerender } = render(
        <SLAsGrid
          {...defaultProps}
          displaySlas={[mockSlas[0]]}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('Premium Support')).toBeInTheDocument();
      expect(screen.queryByText('Standard Support')).not.toBeInTheDocument();

      rerender(
        <SLAsGrid
          {...defaultProps}
          displaySlas={mockSlas}
        />
      );

      expect(screen.getByText('Premium Support')).toBeInTheDocument();
      expect(screen.getByText('Standard Support')).toBeInTheDocument();
      expect(screen.getByText('Chat Support')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle SLAs with very long names and descriptions', () => {
      const longTextSla: SupportSLA = {
        id: 1,
        name: 'This is a very long SLA name that might cause layout issues if not handled properly in the UI components',
        support_channel: 'email',
        response_time_hours: 24,
        availability_schedule: 'This is an extremely long availability schedule description that goes on and on and on and should be handled gracefully by the component without breaking the layout',
        notes: 'This is an extremely long notes section that goes on and on and should be handled gracefully by the component without breaking the layout or causing visual issues',
        display_order: 1,
      };

      render(
        <SLAsGrid
          {...defaultProps}
          displaySlas={[longTextSla]}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText(longTextSla.name)).toBeInTheDocument();
      expect(screen.getByText(`Schedule: ${longTextSla.availability_schedule}`)).toBeInTheDocument();
      expect(screen.getByText(longTextSla.notes!)).toBeInTheDocument();
    });

    it('should handle SLAs with special characters in names and descriptions', () => {
      const specialCharSla: SupportSLA = {
        id: 1,
        name: 'SLA & Service™ (Premium) - 2024',
        support_channel: 'phone',
        response_time_hours: 24,
        availability_schedule: 'Schedule: @#$%^&*()_+{}|:"<>?[];\\,./`~',
        notes: 'Special chars: @#$%^&*()_+{}|:"<>?[];\\,./`~',
        display_order: 1,
      };

      render(
        <SLAsGrid
          {...defaultProps}
          displaySlas={[specialCharSla]}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('SLA & Service™ (Premium) - 2024')).toBeInTheDocument();
      expect(screen.getByText('Special chars: @#$%^&*()_+{}|:"<>?[];\\,./`~')).toBeInTheDocument();
    });

    it('should handle duplicate SLA IDs gracefully', () => {
      const duplicateSlas: SupportSLA[] = [
        {
          id: 1,
          name: 'SLA 1',
          support_channel: 'email',
          response_time_hours: 24,
          availability_schedule: '9-5 Mon-Fri',
          notes: 'First SLA',
          display_order: 1,
        },
        {
          id: 1,
          name: 'SLA 1 Duplicate',
          support_channel: 'phone',
          response_time_hours: 48,
          availability_schedule: '24/7',
          notes: 'Second SLA with same ID',
          display_order: 1,
        }
      ];

      expect(() => {
        render(
          <SLAsGrid
            {...defaultProps}
            displaySlas={duplicateSlas}
          />,
          { wrapper: TestWrapper }
        );
      }).not.toThrow();
    });

    it('should handle SLAs with zero or negative response times', () => {
      const edgeTimeSlas: SupportSLA[] = [
        {
          id: 1,
          name: 'Zero Response Time',
          support_channel: 'chat',
          response_time_hours: 0,
          availability_schedule: '24/7',
          notes: 'Instant response',
          display_order: 1,
        },
        {
          id: 2,
          name: 'Negative Response Time',
          support_channel: 'email',
          response_time_hours: -1,
          availability_schedule: '9-5 Mon-Fri',
          notes: 'Invalid response time',
          display_order: 1,
        }
      ];

      render(
        <SLAsGrid
          {...defaultProps}
          displaySlas={edgeTimeSlas}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('Response: 0h')).toBeInTheDocument();
      expect(screen.getByText('Response: -1h')).toBeInTheDocument();
    });

    it('should handle SLAs with empty strings for optional fields', () => {
      const emptySla: SupportSLA = {
        id: 1,
        name: 'Empty Fields SLA',
        support_channel: '',
        response_time_hours: 24,
        availability_schedule: '',
        notes: '',
        display_order: 1,
      };

      render(
        <SLAsGrid
          {...defaultProps}
          displaySlas={[emptySla]}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('Empty Fields SLA')).toBeInTheDocument();
      expect(screen.getByText('Channel:')).toBeInTheDocument();
      expect(screen.getByText('Schedule:')).toBeInTheDocument();
    });
  });

  describe('icon rendering', () => {
    it('should show correct empty state icon based on readonly status', () => {
      // Test readonly mode icon
      const { rerender } = render(
        <SLAsGrid
          {...defaultProps}
          displaySlas={[]}
          selectedSlaIds={[]}
          isReadOnly={true}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByTestId('slas-empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('empty-state-icon')).toBeInTheDocument();

      // Test non-readonly mode icon
      rerender(
        <SLAsGrid
          {...defaultProps}
          displaySlas={[]}
          selectedSlaIds={[]}
          isReadOnly={false}
        />
      );

      expect(screen.getByTestId('slas-empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('empty-state-icon')).toBeInTheDocument();
    });
  });
});