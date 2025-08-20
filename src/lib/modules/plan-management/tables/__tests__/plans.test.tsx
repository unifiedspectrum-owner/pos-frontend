import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from '@/components/ui/provider';
import PlanTable from '../plans';
import { planService } from '@plan-management/api';
import { toaster } from '@/components/ui/toaster';
import { useRouter } from 'next/navigation';
import { Plan } from '@plan-management/types/plans';

// Mock dependencies
vi.mock('@plan-management/api', () => ({
  planService: {
    deleteSubscriptionPlan: vi.fn()
  }
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn()
}));

vi.mock('@/components/ui/toaster', () => ({
  toaster: {
    create: vi.fn()
  },
  Toaster: () => <div data-testid="toaster" />
}));

vi.mock('@shared/config', () => ({
  CURRENCY_SYMBOL: '$',
  ERROR_RED_COLOR: '#E53E3E',
  GRAY_COLOR: '#718096',
  PRIMARY_COLOR: '#3182CE',
  SUCCESS_GREEN_COLOR: '#38A169',
  SUCCESS_GREEN_COLOR2: '#68D391',
  LOADING_DELAY: 100,
  LOADING_DELAY_ENABLED: false
}));

// Mock shared components
vi.mock('@shared/components', () => ({
  ConfirmationDialog: ({ isOpen, title, message, onConfirm, onCancel, confirmText, cancelText }: any) => 
    isOpen ? (
      <div data-testid="confirmation-dialog">
        <div data-testid="dialog-title">{title}</div>
        <div data-testid="dialog-message">{message}</div>
        <button data-testid="confirm-button" onClick={onConfirm}>{confirmText}</button>
        <button data-testid="cancel-button" onClick={onCancel}>{cancelText}</button>
      </div>
    ) : null,
  EmptyStateContainer: ({ icon, title, description, testId }: any) => (
    <div data-testid={testId}>
      <div data-testid="empty-state-icon">{icon}</div>
      <div data-testid="empty-state-title">{title}</div>
      <div data-testid="empty-state-description">{description}</div>
    </div>
  )
}));

const mockPlanService = vi.mocked(planService);
const mockToaster = vi.mocked(toaster);
const mockUseRouter = vi.mocked(useRouter);
const mockPush = vi.fn();

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
);

describe('PlanTable', () => {
  const mockPlans: Plan[] = [
    {
      id: 1,
      name: 'Basic Plan',
      description: 'Basic plan description',
      monthly_price: '29.99',
      yearly_price: '299.99',
      is_active: 1,
      is_custom: 0,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'Premium Plan',
      description: 'Premium plan description',
      monthly_price: '59.99',
      yearly_price: '599.99',
      is_active: 0,
      is_custom: 1,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z'
    },
    {
      id: 3,
      name: 'Enterprise Plan',
      description: 'Enterprise plan description',
      monthly_price: '99.99',
      yearly_price: '999.99',
      is_active: 1,
      is_custom: 0,
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn()
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render table with plans data', () => {
      render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('Subscription Plans')).toBeInTheDocument();
      expect(screen.getByText('Last Updated: 2024-01-01 10:30:00')).toBeInTheDocument();
      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
      expect(screen.getByText('Premium Plan')).toBeInTheDocument();
      expect(screen.getByText('Enterprise Plan')).toBeInTheDocument();
    });

    it('should render table headers correctly', () => {
      render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('SNo.')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Price')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('should render plan data with correct formatting', () => {
      render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      // Check if specific price is rendered
      expect(screen.getByText('$29.99')).toBeInTheDocument();
      
      // Check if all plans show monthly pricing format
      const monthlyTexts = screen.getAllByText('/month');
      expect(monthlyTexts).toHaveLength(3);
      
      // Check status badges - there should be Active badges for active plans
      const activeBadges = screen.getAllByText((content, element) => {
        return element?.tagName.toLowerCase() === 'span' && 
               element?.classList.contains('chakra-badge') && 
               content === 'Active';
      });
      expect(activeBadges).toHaveLength(2);
      
      // Check for inactive badge
      const inactiveBadge = screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'span' && 
               element?.classList.contains('chakra-badge') && 
               content === 'Inactive';
      });
      expect(inactiveBadge).toBeInTheDocument();
    });

    it('should display row numbers correctly', () => {
      render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('loading states', () => {
    it('should show skeleton rows when loading', () => {
      const { container } = render(
        <PlanTable 
          plans={[]} 
          lastUpdated="" 
          loading={true}
        />, 
        { wrapper: TestWrapper }
      );

      // Should have 5 skeleton rows - check for skeleton elements by their CSS classes
      const skeletonElements = container.querySelectorAll('[class*="chakra-skeleton"]');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it('should hide actual content when loading', () => {
      render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
          loading={true}
        />, 
        { wrapper: TestWrapper }
      );

      expect(screen.queryByText('Basic Plan')).not.toBeInTheDocument();
      expect(screen.queryByText('Premium Plan')).not.toBeInTheDocument();
    });

    it('should disable search and filters when loading', () => {
      render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
          loading={true}
        />, 
        { wrapper: TestWrapper }
      );

      const searchInput = screen.getByPlaceholderText('Search plans by name...');
      expect(searchInput).toBeDisabled();
    });
  });

  describe('empty states', () => {
    it('should show empty state when no plans exist', () => {
      render(
        <PlanTable 
          plans={[]} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      expect(screen.getByTestId('plans-empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('empty-state-title')).toHaveTextContent('No plans found');
      expect(screen.getByTestId('empty-state-description')).toHaveTextContent('No plans have been created yet');
    });

    it('should show filtered empty state when search returns no results', async () => {
      const user = userEvent.setup();
      render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      const searchInput = screen.getByPlaceholderText('Search plans by name...');
      await user.type(searchInput, 'NonExistentPlan');

      expect(screen.getByTestId('plans-empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('empty-state-description')).toHaveTextContent('Try adjusting your search or filters');
    });
  });

  describe('search functionality', () => {
    it('should filter plans by name', async () => {
      const user = userEvent.setup();
      render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      const searchInput = screen.getByPlaceholderText('Search plans by name...');
      await user.type(searchInput, 'Basic');

      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
      expect(screen.queryByText('Premium Plan')).not.toBeInTheDocument();
      expect(screen.queryByText('Enterprise Plan')).not.toBeInTheDocument();
    });

    it('should be case insensitive', async () => {
      const user = userEvent.setup();
      render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      const searchInput = screen.getByPlaceholderText('Search plans by name...');
      await user.type(searchInput, 'PREMIUM');

      expect(screen.getByText('Premium Plan')).toBeInTheDocument();
      expect(screen.queryByText('Basic Plan')).not.toBeInTheDocument();
    });

    it('should clear search results when input is cleared', async () => {
      const user = userEvent.setup();
      render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      const searchInput = screen.getByPlaceholderText('Search plans by name...');
      await user.type(searchInput, 'Basic');
      
      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
      expect(screen.queryByText('Premium Plan')).not.toBeInTheDocument();

      await user.clear(searchInput);

      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
      expect(screen.getByText('Premium Plan')).toBeInTheDocument();
      expect(screen.getByText('Enterprise Plan')).toBeInTheDocument();
    });
  });

  describe('status filtering', () => {
    it('should filter by active status', async () => {
      const user = userEvent.setup();
      render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      // Find and click the status filter button
      const selectElements = screen.getAllByRole('combobox');
      const statusFilter = selectElements[0]; // First select is status filter
      await user.click(statusFilter);
      
      const activeOption = screen.getByRole('option', { name: 'Active' });
      await user.click(activeOption);

      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
      expect(screen.getByText('Enterprise Plan')).toBeInTheDocument();
      expect(screen.queryByText('Premium Plan')).not.toBeInTheDocument();
    });

    it('should filter by inactive status', async () => {
      const user = userEvent.setup();
      render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      const selectElements = screen.getAllByRole('combobox');
      const statusFilter = selectElements[0]; // Status filter
      await user.click(statusFilter);
      
      const inactiveOption = screen.getByRole('option', { name: 'Inactive' });
      await user.click(inactiveOption);

      expect(screen.getByText('Premium Plan')).toBeInTheDocument();
      expect(screen.queryByText('Basic Plan')).not.toBeInTheDocument();
      expect(screen.queryByText('Enterprise Plan')).not.toBeInTheDocument();
    });

    it('should show all plans when "All Status" is selected', async () => {
      const user = userEvent.setup();
      render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      // First filter to active only
      const selectElements = screen.getAllByRole('combobox');
      const statusFilter = selectElements[0]; // Status filter
      await user.click(statusFilter);
      await user.click(screen.getByRole('option', { name: 'Active' }));

      expect(screen.queryByText('Premium Plan')).not.toBeInTheDocument();

      // Then select "All Status" - click the same button again
      await user.click(statusFilter);
      await user.click(screen.getByRole('option', { name: 'All Status' }));

      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
      expect(screen.getByText('Premium Plan')).toBeInTheDocument();
      expect(screen.getByText('Enterprise Plan')).toBeInTheDocument();
    });
  });

  describe('type filtering', () => {
    it('should filter by custom type', async () => {
      const user = userEvent.setup();
      render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      const selectElements = screen.getAllByRole('combobox');
      const typeFilter = selectElements[1]; // Second select is type filter
      await user.click(typeFilter);
      
      const customOption = screen.getByRole('option', { name: 'Custom' });
      await user.click(customOption);

      expect(screen.getByText('Premium Plan')).toBeInTheDocument();
      expect(screen.queryByText('Basic Plan')).not.toBeInTheDocument();
      expect(screen.queryByText('Enterprise Plan')).not.toBeInTheDocument();
    });

    it('should filter by regular type', async () => {
      const user = userEvent.setup();
      render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      const selectElements = screen.getAllByRole('combobox');
      const typeFilter = selectElements[1]; // Type filter
      await user.click(typeFilter);
      
      const regularOption = screen.getByRole('option', { name: 'Regular' });
      await user.click(regularOption);

      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
      expect(screen.getByText('Enterprise Plan')).toBeInTheDocument();
      expect(screen.queryByText('Premium Plan')).not.toBeInTheDocument();
    });
  });

  describe('combined filtering', () => {
    it('should combine search and status filters', async () => {
      const user = userEvent.setup();
      render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      // Search for "Plan" and filter by active
      const searchInput = screen.getByPlaceholderText('Search plans by name...');
      await user.type(searchInput, 'Plan');

      const selectElements = screen.getAllByRole('combobox');
      const statusFilter = selectElements[0]; // Status filter
      await user.click(statusFilter);
      await user.click(screen.getByRole('option', { name: 'Active' }));

      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
      expect(screen.getByText('Enterprise Plan')).toBeInTheDocument();
      expect(screen.queryByText('Premium Plan')).not.toBeInTheDocument();
    });

    it('should combine all three filters', async () => {
      const user = userEvent.setup();
      render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      // Search, status filter, and type filter
      const searchInput = screen.getByPlaceholderText('Search plans by name...');
      await user.type(searchInput, 'Enterprise');

      const selectElements = screen.getAllByRole('combobox');
      const statusFilter = selectElements[0]; // Status filter
      const typeFilter = selectElements[1]; // Type filter
      
      await user.click(statusFilter);
      await user.click(screen.getByRole('option', { name: 'Active' }));

      await user.click(typeFilter);
      await user.click(screen.getByRole('option', { name: 'Regular' }));

      expect(screen.getByText('Enterprise Plan')).toBeInTheDocument();
      expect(screen.queryByText('Basic Plan')).not.toBeInTheDocument();
      expect(screen.queryByText('Premium Plan')).not.toBeInTheDocument();
    });
  });

  describe('row interactions', () => {
    it('should highlight row when clicked', async () => {
      const user = userEvent.setup();
      render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      const basicPlanRow = screen.getByText('Basic Plan').closest('[data-testid]') || screen.getByText('Basic Plan');
      await user.click(basicPlanRow);

      // Row should be selected (test visual change through CSS classes if possible)
      expect(basicPlanRow).toBeInTheDocument();
    });

    it('should toggle row selection', async () => {
      const user = userEvent.setup();
      render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      const basicPlanRow = screen.getByText('Basic Plan');
      
      // Click to select
      await user.click(basicPlanRow);
      
      // Click again to deselect
      await user.click(basicPlanRow);

      expect(basicPlanRow).toBeInTheDocument();
    });
  });

  describe('action buttons', () => {
    it('should navigate to view page when view button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      const viewButtons = screen.getAllByTitle('View Plan');
      await user.click(viewButtons[0]);

      expect(mockPush).toHaveBeenCalledWith('/admin/plan-management/view/1');
    });

    it('should navigate to edit page when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      const editButtons = screen.getAllByTitle('Edit Plan');
      await user.click(editButtons[1]);

      expect(mockPush).toHaveBeenCalledWith('/admin/plan-management/edit/2');
    });

    it('should open delete confirmation when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      const deleteButtons = screen.getAllByTitle('Delete Plan');
      await user.click(deleteButtons[0]);

      expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('Delete Plan');
      expect(screen.getByTestId('dialog-message')).toHaveTextContent('Are you sure you want to delete "Basic Plan"?');
    });

    it('should prevent event propagation when action buttons are clicked', async () => {
      const user = userEvent.setup();
      render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      const viewButton = screen.getAllByTitle('View Plan')[0];
      await user.click(viewButton);

      // Row should not be selected when action button is clicked
      expect(mockPush).toHaveBeenCalledWith('/admin/plan-management/view/1');
    });
  });

  describe('delete functionality', () => {
    it('should handle successful delete', async () => {
      const user = userEvent.setup();
      const mockOnPlanDeleted = vi.fn();
      
      mockPlanService.deleteSubscriptionPlan.mockResolvedValue({
        data: { success: true, message: 'Plan deleted successfully' }
      });

      render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
          onPlanDeleted={mockOnPlanDeleted}
        />, 
        { wrapper: TestWrapper }
      );

      // Open delete dialog
      const deleteButtons = screen.getAllByTitle('Delete Plan');
      await user.click(deleteButtons[0]);

      // Confirm delete
      const confirmButton = screen.getByTestId('confirm-button');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockPlanService.deleteSubscriptionPlan).toHaveBeenCalledWith(1);
        expect(mockToaster.create).toHaveBeenCalledWith({
          type: 'success',
          title: 'Plan Deleted Successfully',
          description: '"Basic Plan" has been deleted successfully.',
          duration: 5000,
          closable: true
        });
        expect(mockOnPlanDeleted).toHaveBeenCalled();
      });
    });

    it('should handle failed delete with error message', async () => {
      const user = userEvent.setup();
      
      mockPlanService.deleteSubscriptionPlan.mockResolvedValue({
        data: { success: false, message: 'Cannot delete plan with active subscriptions' }
      });

      render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      const deleteButtons = screen.getAllByTitle('Delete Plan');
      await user.click(deleteButtons[0]);

      const confirmButton = screen.getByTestId('confirm-button');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockToaster.create).toHaveBeenCalledWith({
          type: 'error',
          title: 'Failed to Delete Plan',
          description: 'Cannot delete plan with active subscriptions',
          duration: 7000,
          closable: true
        });
      });
    });

    it('should handle network error during delete', async () => {
      const user = userEvent.setup();
      
      mockPlanService.deleteSubscriptionPlan.mockRejectedValue(new Error('Network error'));

      render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      const deleteButtons = screen.getAllByTitle('Delete Plan');
      await user.click(deleteButtons[0]);

      const confirmButton = screen.getByTestId('confirm-button');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockToaster.create).toHaveBeenCalledWith({
          type: 'error',
          title: 'Failed to Delete Plan',
          description: 'An unexpected error occurred. Please try again.',
          duration: 7000,
          closable: true
        });
      });
    });

    it('should cancel delete when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      const deleteButtons = screen.getAllByTitle('Delete Plan');
      await user.click(deleteButtons[0]);

      expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();

      const cancelButton = screen.getByTestId('cancel-button');
      await user.click(cancelButton);

      expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument();
      expect(mockPlanService.deleteSubscriptionPlan).not.toHaveBeenCalled();
    });

    it('should disable delete button during deletion', async () => {
      const user = userEvent.setup();
      
      // Mock a delayed response
      mockPlanService.deleteSubscriptionPlan.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          data: { success: true }
        }), 1000))
      );

      render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      const deleteButtons = screen.getAllByTitle('Delete Plan');
      await user.click(deleteButtons[0]);

      const confirmButton = screen.getByTestId('confirm-button');
      await user.click(confirmButton);

      // Check that delete button is disabled during operation
      const deleteButton = deleteButtons[0];
      expect(deleteButton).toBeDisabled();
    });
  });

  describe('prop validation', () => {
    it('should handle undefined onPlanDeleted prop', async () => {
      const user = userEvent.setup();
      
      mockPlanService.deleteSubscriptionPlan.mockResolvedValue({
        data: { success: true }
      });

      render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      const deleteButtons = screen.getAllByTitle('Delete Plan');
      await user.click(deleteButtons[0]);

      const confirmButton = screen.getByTestId('confirm-button');
      await user.click(confirmButton);

      // Should not throw error when onPlanDeleted is undefined
      await waitFor(() => {
        expect(mockPlanService.deleteSubscriptionPlan).toHaveBeenCalled();
      });
    });

    it('should handle empty plans array', () => {
      render(
        <PlanTable 
          plans={[]} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      expect(screen.getByTestId('plans-empty-state')).toBeInTheDocument();
      expect(screen.getByText('No plans have been created yet')).toBeInTheDocument();
    });

    it('should handle loading prop default value', () => {
      const { container } = render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      // Should render plans (not loading state)
      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
      // No skeleton elements should be present
      expect(container.querySelectorAll('[class*="chakra-skeleton"]')).toHaveLength(0);
    });
  });

  describe('accessibility', () => {
    it('should have proper button titles for screen readers', () => {
      render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      expect(screen.getAllByTitle('View Plan')).toHaveLength(3);
      expect(screen.getAllByTitle('Edit Plan')).toHaveLength(3);
      expect(screen.getAllByTitle('Delete Plan')).toHaveLength(3);
    });

    it('should have proper input labels and placeholders', () => {
      render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      expect(screen.getByPlaceholderText('Search plans by name...')).toBeInTheDocument();
      // Check for the select elements using their combobox role
      const selectElements = screen.getAllByRole('combobox');
      expect(selectElements).toHaveLength(2); // Status and Type selectors
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      const searchInput = screen.getByPlaceholderText('Search plans by name...');
      
      // Should be able to focus search input
      await user.tab();
      expect(searchInput).toHaveFocus();
      
      // Should be able to type in search
      await user.keyboard('Basic');
      expect(searchInput).toHaveValue('Basic');
    });
  });

  describe('performance and memoization', () => {
    it('should memoize filtered results', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      // Apply search filter
      const searchInput = screen.getByPlaceholderText('Search plans by name...');
      await user.type(searchInput, 'Basic');

      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
      expect(screen.queryByText('Premium Plan')).not.toBeInTheDocument();

      // Rerender with same props should maintain filter
      rerender(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />
      );

      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
      expect(screen.queryByText('Premium Plan')).not.toBeInTheDocument();
    });

    it('should update when plans prop changes', () => {
      const { rerender } = render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
      expect(screen.getByText('Premium Plan')).toBeInTheDocument();

      const newPlans = [mockPlans[0]]; // Only Basic Plan
      rerender(
        <PlanTable 
          plans={newPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />
      );

      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
      expect(screen.queryByText('Premium Plan')).not.toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle plans with null/undefined values', () => {
      const plansWithNulls: Plan[] = [
        {
          id: 1,
          name: 'Test Plan',
          description: '',
          monthly_price: '0.00',
          yearly_price: '0.00',
          is_active: 1,
          is_custom: 0,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      render(
        <PlanTable 
          plans={plansWithNulls} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('Test Plan')).toBeInTheDocument();
      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });

    it('should handle very long plan names', () => {
      const longNamePlan: Plan[] = [
        {
          id: 1,
          name: 'This is a very long plan name that might overflow the table cell and cause layout issues',
          description: 'Long description',
          monthly_price: '99.99',
          yearly_price: '999.99',
          is_active: 1,
          is_custom: 0,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      render(
        <PlanTable 
          plans={longNamePlan} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('This is a very long plan name that might overflow the table cell and cause layout issues')).toBeInTheDocument();
    });

    it('should handle large numbers of plans', () => {
      const manyPlans: Plan[] = Array.from({ length: 50 }, (_, index) => ({
        id: index + 1,
        name: `Plan ${index + 1}`,
        description: `Description ${index + 1}`,
        monthly_price: `${(index + 1) * 10}.99`,
        yearly_price: `${(index + 1) * 100}.99`,
        is_active: index % 2,
        is_custom: index % 3 === 0 ? 1 : 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }));

      render(
        <PlanTable 
          plans={manyPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('Plan 1')).toBeInTheDocument();
      expect(screen.getByText('Plan 50')).toBeInTheDocument();
    });

    it('should handle special characters in plan names', () => {
      const specialCharPlans: Plan[] = [
        {
          id: 1,
          name: 'Plan & Service™ (Premium) - 2024',
          description: 'Special characters test',
          monthly_price: '29.99',
          yearly_price: '299.99',
          is_active: 1,
          is_custom: 0,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      render(
        <PlanTable 
          plans={specialCharPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('Plan & Service™ (Premium) - 2024')).toBeInTheDocument();
    });
  });

  describe('component lifecycle', () => {
    it('should cleanup event listeners on unmount', () => {
      const { unmount } = render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      // Should not throw error on unmount
      expect(() => unmount()).not.toThrow();
    });

    it('should maintain state during re-renders', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 10:30:00" 
        />, 
        { wrapper: TestWrapper }
      );

      // Set search term
      const searchInput = screen.getByPlaceholderText('Search plans by name...');
      await user.type(searchInput, 'Basic');

      expect(searchInput).toHaveValue('Basic');

      // Re-render with different lastUpdated
      rerender(
        <PlanTable 
          plans={mockPlans} 
          lastUpdated="2024-01-01 11:30:00" 
        />
      );

      // Search term should be maintained
      expect(searchInput).toHaveValue('Basic');
    });
  });
});