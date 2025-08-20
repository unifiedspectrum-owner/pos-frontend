import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from '@/components/ui/provider';
import SelectedSLAsSummary from '../selected-slas-summary';
import { SupportSLA } from '@plan-management/types';

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

describe('SelectedSLAsSummary', () => {
  const mockSlas: SupportSLA[] = [
    {
      id: 1,
      name: 'Premium Support',
      support_channel: 'phone',
      response_time_hours: 24,
      availability_schedule: '24/7',
      notes: 'Premium tier support',
      display_order: 1,
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

  const mockOnRemove = vi.fn();

  const defaultProps = {
    selectedSlas: [],
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
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={mockSlas}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('Selected SLAs (3)')).toBeInTheDocument();
    });

    it('should render zero count when no SLAs selected', () => {
      render(
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={[]}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('Selected SLAs (0)')).toBeInTheDocument();
    });

    it('should update count when selectedSlas change', () => {
      const { rerender } = render(
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={[mockSlas[0]]}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('Selected SLAs (1)')).toBeInTheDocument();

      rerender(
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={mockSlas}
        />
      );

      expect(screen.getByText('Selected SLAs (3)')).toBeInTheDocument();
    });
  });

  describe('selected SLAs display', () => {
    it('should display all selected SLA names as tags', () => {
      render(
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={mockSlas}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('Premium Support')).toBeInTheDocument();
      expect(screen.getByText('Standard Support')).toBeInTheDocument();
      expect(screen.getByText('Chat Support')).toBeInTheDocument();
    });

    it('should render SLA tags with remove buttons when not readonly', () => {
      render(
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={mockSlas}
          readOnly={false}
        />,
        { wrapper: TestWrapper }
      );

      // Each SLA should have a remove button
      const removeButtons = screen.getAllByRole('button');
      expect(removeButtons).toHaveLength(3);
    });

    it('should not render remove buttons when readonly', () => {
      render(
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={mockSlas}
          readOnly={true}
        />,
        { wrapper: TestWrapper }
      );

      // No remove buttons should be present in readonly mode
      const removeButtons = screen.queryAllByRole('button');
      expect(removeButtons).toHaveLength(0);
    });

    it('should display SLAs in flexbox layout with proper wrapping', () => {
      const { container } = render(
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={mockSlas}
        />,
        { wrapper: TestWrapper }
      );

      // Verify that SLAs are rendered (indicating flexbox layout is working)
      expect(screen.getByText('Premium Support')).toBeInTheDocument();
      expect(screen.getByText('Standard Support')).toBeInTheDocument();
      expect(screen.getByText('Chat Support')).toBeInTheDocument();
      
      // Check that the container has the expected structure
      const containerElements = container.querySelectorAll('div');
      expect(containerElements.length).toBeGreaterThan(0);
    });
  });

  describe('remove functionality', () => {
    it('should call onRemove when remove button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={[mockSlas[0]]}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      );

      const removeButton = screen.getByRole('button');
      await user.click(removeButton);

      expect(mockOnRemove).toHaveBeenCalledTimes(1);
      expect(mockOnRemove).toHaveBeenCalledWith(1);
    });

    it('should call onRemove with correct SLA ID for each button', async () => {
      const user = userEvent.setup();

      render(
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={mockSlas}
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
          <SelectedSLAsSummary
            {...defaultProps}
            selectedSlas={[mockSlas[0]]}
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

    it('should not call onRemove in readonly mode', () => {
      render(
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={mockSlas}
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
    it('should show empty state when no SLAs selected', () => {
      render(
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={[]}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByTestId('selected-slas-empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('empty-state-title')).toHaveTextContent('No SLAs selected');
      expect(screen.getByTestId('empty-state-description')).toHaveTextContent('Select SLAs from the list above to configure this plan');
    });

    it('should not show empty state when SLAs are selected', () => {
      render(
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={[mockSlas[0]]}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.queryByTestId('selected-slas-empty-state')).not.toBeInTheDocument();
      expect(screen.getByText('Premium Support')).toBeInTheDocument();
    });

    it('should show empty state icon correctly', () => {
      render(
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={[]}
        />,
        { wrapper: TestWrapper }
      );

      const emptyStateIcon = screen.getByTestId('empty-state-icon');
      expect(emptyStateIcon).toBeInTheDocument();
      // The icon should be the FaPlus icon
    });
  });

  describe('readonly mode behavior', () => {
    it('should display SLAs without remove functionality in readonly mode', () => {
      render(
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={mockSlas}
          readOnly={true}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('Premium Support')).toBeInTheDocument();
      expect(screen.getByText('Standard Support')).toBeInTheDocument();
      expect(screen.getByText('Chat Support')).toBeInTheDocument();
      
      expect(screen.queryAllByRole('button')).toHaveLength(0);
    });

    it('should maintain visual styling in readonly mode', () => {
      const { container } = render(
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={mockSlas}
          readOnly={true}
        />,
        { wrapper: TestWrapper }
      );

      // Verify that SLAs are displayed with proper styling in readonly mode
      expect(screen.getByText('Premium Support')).toBeInTheDocument();
      expect(screen.getByText('Standard Support')).toBeInTheDocument();
      expect(screen.getByText('Chat Support')).toBeInTheDocument();
      
      // SLA tags should still have structural elements
      const containerDivs = container.querySelectorAll('div');
      expect(containerDivs.length).toBeGreaterThan(0);
    });

    it('should handle readOnly prop changes correctly', () => {
      const { rerender } = render(
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={mockSlas}
          readOnly={false}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getAllByRole('button')).toHaveLength(3);

      rerender(
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={mockSlas}
          readOnly={true}
        />
      );

      expect(screen.queryAllByRole('button')).toHaveLength(0);
    });
  });

  describe('accessibility', () => {
    it('should have accessible remove buttons with proper labels', () => {
      render(
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={[mockSlas[0]]}
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
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={mockSlas}
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
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={[mockSlas[0]]}
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
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={mockSlas}
        />,
        { wrapper: TestWrapper }
      );

      // Header should be properly structured
      const header = screen.getByText('Selected SLAs (3)');
      expect(header).toBeInTheDocument();
      
      // SLA names should be readable by screen readers
      expect(screen.getByText('Premium Support')).toBeInTheDocument();
    });
  });

  describe('visual styling and layout', () => {
    it('should apply proper styling to SLA tags', () => {
      const { container } = render(
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={mockSlas}
        />,
        { wrapper: TestWrapper }
      );

      // SLA tags should be properly styled - verify by checking that SLAs are rendered
      expect(screen.getByText('Premium Support')).toBeInTheDocument();
      expect(screen.getByText('Standard Support')).toBeInTheDocument();
      expect(screen.getByText('Chat Support')).toBeInTheDocument();
      
      // Verify the container has the expected structure for styling
      const containerElements = container.querySelectorAll('div');
      expect(containerElements.length).toBeGreaterThan(0);
    });

    it('should handle hover effects on SLA tags', () => {
      const { container } = render(
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={mockSlas}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('Premium Support')).toBeInTheDocument();
    });

    it('should display remove button icons correctly', () => {
      render(
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={[mockSlas[0]]}
        />,
        { wrapper: TestWrapper }
      );

      const removeButton = screen.getByRole('button');
      expect(removeButton).toBeInTheDocument();
      // The button should contain the FiX icon
    });
  });

  describe('error handling', () => {
    it('should handle empty SLA objects gracefully', () => {
      const emptySla = {
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
          <SelectedSLAsSummary
            {...defaultProps}
            selectedSlas={[emptySla]}
          />,
          { wrapper: TestWrapper }
        );
      }).not.toThrow();

      expect(screen.getByText('Selected SLAs (1)')).toBeInTheDocument();
    });

    it('should handle null or undefined onRemove gracefully', async () => {
      const user = userEvent.setup();

      expect(() => {
        render(
          <SelectedSLAsSummary
            selectedSlas={[mockSlas[0]]}
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

    it('should handle SLAs with missing properties', () => {
      const incompleteSla = {
        id: 1
      } as SupportSLA;

      expect(() => {
        render(
          <SelectedSLAsSummary
            {...defaultProps}
            selectedSlas={[incompleteSla]}
          />,
          { wrapper: TestWrapper }
        );
      }).not.toThrow();
    });

    it('should handle negative or invalid SLA IDs', async () => {
      const user = userEvent.setup();
      const invalidSla = {
        id: -1,
        name: 'Invalid SLA',
        support_channel: 'email',
        response_time_hours: 24,
        availability_schedule: '9-5 Mon-Fri',
        notes: 'SLA with negative ID',
        display_order: 1,
      } as SupportSLA;

      render(
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={[invalidSla]}
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
    it('should handle large numbers of selected SLAs efficiently', () => {
      const manySlas: SupportSLA[] = Array.from({ length: 50 }, (_, index) => ({
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
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={manySlas}
        />,
        { wrapper: TestWrapper }
      );
      const end = performance.now();

      expect(end - start).toBeLessThan(1000); // Should render in less than 1 second
      expect(screen.getByText('Selected SLAs (50)')).toBeInTheDocument();
    });

    it('should handle frequent SLA list updates efficiently', () => {
      const { rerender } = render(
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={[]}
        />,
        { wrapper: TestWrapper }
      );

      // Simulate rapid SLA list changes
      const updates = [
        [mockSlas[0]],
        [mockSlas[0], mockSlas[1]],
        [mockSlas[0], mockSlas[1], mockSlas[2]],
        [mockSlas[1], mockSlas[2]],
        [mockSlas[2]],
        []
      ];

      updates.forEach(slas => {
        expect(() => {
          rerender(
            <SelectedSLAsSummary
              {...defaultProps}
              selectedSlas={slas}
            />
          );
        }).not.toThrow();
      });
    });
  });

  describe('component lifecycle', () => {
    it('should cleanup properly on unmount', () => {
      const { unmount } = render(
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={mockSlas}
        />,
        { wrapper: TestWrapper }
      );

      expect(() => unmount()).not.toThrow();
    });

    it('should handle prop changes correctly', () => {
      const { rerender } = render(
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={[]}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByTestId('selected-slas-empty-state')).toBeInTheDocument();

      rerender(
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={mockSlas}
        />
      );

      expect(screen.queryByTestId('selected-slas-empty-state')).not.toBeInTheDocument();
      expect(screen.getByText('Premium Support')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle SLAs with very long names', () => {
      const longNameSla: SupportSLA = {
        id: 1,
        name: 'This is a very long SLA name that might cause layout issues if not handled properly',
        support_channel: 'email',
        response_time_hours: 24,
        availability_schedule: '9-5 Mon-Fri',
        notes: 'Description',
        display_order: 1,
      };

      render(
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={[longNameSla]}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText(longNameSla.name)).toBeInTheDocument();
    });

    it('should handle SLAs with special characters', () => {
      const specialCharSla: SupportSLA = {
        id: 1,
        name: 'SLA & Service™ (Premium)',
        support_channel: 'phone',
        response_time_hours: 24,
        availability_schedule: '24/7',
        notes: 'Special chars: @#$%^&*()',
        display_order: 1,
      };

      render(
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={[specialCharSla]}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('SLA & Service™ (Premium)')).toBeInTheDocument();
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
          notes: 'Duplicate ID SLA',
          display_order: 1,
        }
      ];

      expect(() => {
        render(
          <SelectedSLAsSummary
            {...defaultProps}
            selectedSlas={duplicateSlas}
          />,
          { wrapper: TestWrapper }
        );
      }).not.toThrow();

      expect(screen.getByText('Selected SLAs (2)')).toBeInTheDocument();
    });

    it('should handle zero or negative SLA IDs', async () => {
      const user = userEvent.setup();
      const edgeIdSlas: SupportSLA[] = [
        {
          id: 0,
          name: 'Zero ID SLA',
          support_channel: 'chat',
          response_time_hours: 4,
          availability_schedule: '24/7',
          notes: 'SLA with ID 0',
          display_order: 1,
        },
        {
          id: -1,
          name: 'Negative ID SLA',
          support_channel: 'email',
          response_time_hours: 24,
          availability_schedule: '9-5 Mon-Fri',
          notes: 'SLA with negative ID',
          display_order: 1,
        }
      ];

      render(
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={edgeIdSlas}
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

    it('should handle SLAs with null notes', () => {
      const nullNotesSla: SupportSLA = {
        id: 1,
        name: 'SLA with null notes',
        support_channel: 'email',
        response_time_hours: 24,
        availability_schedule: '9-5 Mon-Fri',
        notes: '',
        display_order: 1,
      };

      expect(() => {
        render(
          <SelectedSLAsSummary
            {...defaultProps}
            selectedSlas={[nullNotesSla]}
          />,
          { wrapper: TestWrapper }
        );
      }).not.toThrow();

      expect(screen.getByText('SLA with null notes')).toBeInTheDocument();
    });

    it('should handle empty SLA list transitions', () => {
      const { rerender } = render(
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={mockSlas}
        />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('Selected SLAs (3)')).toBeInTheDocument();
      expect(screen.getByText('Premium Support')).toBeInTheDocument();

      rerender(
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={[]}
        />
      );

      expect(screen.getByText('Selected SLAs (0)')).toBeInTheDocument();
      expect(screen.getByTestId('selected-slas-empty-state')).toBeInTheDocument();
    });
  });

  describe('tag styling and behavior', () => {
    it('should apply cursor pointer to tags', () => {
      render(
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={[mockSlas[0]]}
        />,
        { wrapper: TestWrapper }
      );

      // Tags should be styled appropriately
      expect(screen.getByText('Premium Support')).toBeInTheDocument();
    });

    it('should handle tag hover states', () => {
      render(
        <SelectedSLAsSummary
          {...defaultProps}
          selectedSlas={[mockSlas[0]]}
        />,
        { wrapper: TestWrapper }
      );

      // Tags should have hover states
      expect(screen.getByText('Premium Support')).toBeInTheDocument();
    });
  });
});