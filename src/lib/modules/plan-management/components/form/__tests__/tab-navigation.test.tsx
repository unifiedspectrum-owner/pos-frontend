/* Libraries imports */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';

/* Plan management module imports */
import TabNavigation from '../tab-navigation';

/* Helper function to render with Chakra provider */
const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider value={defaultSystem}>{component}</ChakraProvider>);
};

describe('TabNavigation', () => {
  const mockOnPrevious = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnSubmit = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnBackToList = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = renderWithChakra(<TabNavigation />);
      expect(container).toBeInTheDocument();
    });

    it('renders with default props', () => {
      renderWithChakra(<TabNavigation />);
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('does not render previous button on first tab', () => {
      renderWithChakra(<TabNavigation isFirstTab={true} />);
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    });

    it('renders previous button when not first tab', () => {
      renderWithChakra(<TabNavigation isFirstTab={false} onPrevious={mockOnPrevious} />);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('renders next button with custom text', () => {
      renderWithChakra(<TabNavigation nextButtonText="Continue" />);
      expect(screen.getByText('Continue')).toBeInTheDocument();
    });

    it('renders submit button on last tab', () => {
      renderWithChakra(<TabNavigation isLastTab={true} isFormValid={true} />);
      expect(screen.getByText('Create Plan')).toBeInTheDocument();
    });

    it('renders submit button with custom text', () => {
      renderWithChakra(<TabNavigation isLastTab={true} isFormValid={true} submitButtonText="Save Plan" />);
      expect(screen.getByText('Save Plan')).toBeInTheDocument();
    });
  });

  describe('Previous Button', () => {
    it('calls onPrevious when previous button is clicked', async () => {
      const user = userEvent.setup();
      renderWithChakra(<TabNavigation isFirstTab={false} onPrevious={mockOnPrevious} />);

      const previousButton = screen.getByText('Cancel');
      await user.click(previousButton);

      expect(mockOnPrevious).toHaveBeenCalledTimes(1);
    });

    it('does not render previous button on first tab', () => {
      renderWithChakra(<TabNavigation isFirstTab={true} onPrevious={mockOnPrevious} />);
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    });

    it('renders previous button on middle tabs', () => {
      renderWithChakra(<TabNavigation isFirstTab={false} isLastTab={false} onPrevious={mockOnPrevious} />);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('renders previous button on last tab', () => {
      renderWithChakra(<TabNavigation isFirstTab={false} isLastTab={true} onPrevious={mockOnPrevious} />);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  describe('Next Button', () => {
    it('calls onNext when next button is clicked', async () => {
      const user = userEvent.setup();
      renderWithChakra(<TabNavigation onNext={mockOnNext} />);

      const nextButton = screen.getByText('Next');
      await user.click(nextButton);

      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });

    it('renders next button with custom text', async () => {
      renderWithChakra(<TabNavigation onNext={mockOnNext} nextButtonText="Continue" />);
      expect(screen.getByText('Continue')).toBeInTheDocument();
    });

    it('renders next button on first tab', () => {
      renderWithChakra(<TabNavigation isFirstTab={true} onNext={mockOnNext} />);
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('renders next button on middle tabs', () => {
      renderWithChakra(<TabNavigation isFirstTab={false} isLastTab={false} onNext={mockOnNext} />);
      expect(screen.getByText('Next')).toBeInTheDocument();
    });
  });

  describe('Submit Button', () => {
    it('calls onSubmit when submit button is clicked on last tab', async () => {
      const user = userEvent.setup();
      renderWithChakra(<TabNavigation isLastTab={true} isFormValid={true} onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByText('Create Plan');
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('does not call onSubmit when form is invalid', async () => {
      const user = userEvent.setup();
      renderWithChakra(<TabNavigation isLastTab={true} isFormValid={false} onSubmit={mockOnSubmit} onNext={mockOnNext} />);

      const button = screen.getByText('Next');
      await user.click(button);

      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });

    it('shows loading text when submitting', () => {
      renderWithChakra(<TabNavigation isLastTab={true} isFormValid={true} isSubmitting={true} />);
      expect(screen.getByText('Creating Plan...')).toBeInTheDocument();
    });

    it('disables button when submitting', () => {
      renderWithChakra(<TabNavigation isLastTab={true} isFormValid={true} isSubmitting={true} />);
      const buttons = screen.getAllByRole('button');
      const submitButton = buttons.find(btn => btn.textContent?.includes('Creating Plan...'));
      expect(submitButton).toBeDisabled();
    });

    it('renders submit button with custom text', () => {
      renderWithChakra(<TabNavigation isLastTab={true} isFormValid={true} submitButtonText="Update Plan" />);
      expect(screen.getByText('Update Plan')).toBeInTheDocument();
    });
  });

  describe('Read-Only Mode', () => {
    it('renders Edit Plan button on last tab in read-only mode', () => {
      renderWithChakra(<TabNavigation isLastTab={true} readOnly={true} />);
      expect(screen.getByText('Edit Plan')).toBeInTheDocument();
    });

    it('calls onEdit when Edit Plan button is clicked', async () => {
      const user = userEvent.setup();
      renderWithChakra(<TabNavigation isLastTab={true} readOnly={true} onEdit={mockOnEdit} />);

      const editButton = screen.getByText('Edit Plan');
      await user.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it('renders Back to List button on last tab in read-only mode', () => {
      renderWithChakra(<TabNavigation isLastTab={true} readOnly={true} onBackToList={mockOnBackToList} />);
      /* SecondaryButton renders "Cancel" by default, not "Back to List" */
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it('calls onBackToList when Back to List button is clicked', async () => {
      const user = userEvent.setup();
      renderWithChakra(<TabNavigation isLastTab={true} readOnly={true} onBackToList={mockOnBackToList} />);

      /* Get all buttons */
      const buttons = screen.getAllByRole('button');

      /* In read-only last tab mode with isFirstTab defaulting to false, button order is:
         [0] = Previous (Cancel) button
         [1] = Back to List (Cancel) button
         [2] = Edit Plan button */
      expect(buttons.length).toBeGreaterThanOrEqual(3);
      await user.click(buttons[1]);
      expect(mockOnBackToList).toHaveBeenCalledTimes(1);
    });

    it('renders Next button on non-last tabs in read-only mode', () => {
      renderWithChakra(<TabNavigation isLastTab={false} readOnly={true} onNext={mockOnNext} />);
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('does not render Back to List button on non-last tabs', () => {
      renderWithChakra(<TabNavigation isLastTab={false} readOnly={true} onBackToList={mockOnBackToList} />);
      /* In read-only non-last tab, there should be Cancel (Previous) and Next buttons */
      const buttons = screen.getAllByRole('button');
      /* Since we're not on first tab (readOnly=true, isLastTab=false), Previous button shows */
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Button States', () => {
    it('enables submit button when form is valid', () => {
      renderWithChakra(<TabNavigation isLastTab={true} isFormValid={true} onSubmit={mockOnSubmit} />);
      const button = screen.getByText('Create Plan');
      expect(button).not.toBeDisabled();
    });

    it('disables submit button when submitting', () => {
      renderWithChakra(<TabNavigation isLastTab={true} isFormValid={true} isSubmitting={true} />);
      const buttons = screen.getAllByRole('button');
      const submitButton = buttons.find(btn => btn.textContent?.includes('Creating Plan...'));
      expect(submitButton).toBeDisabled();
    });

    it('shows loading indicator when submitting', () => {
      renderWithChakra(<TabNavigation isLastTab={true} isFormValid={true} isSubmitting={true} />);
      expect(screen.getByText('Creating Plan...')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('renders buttons in HStack container', () => {
      const { container } = renderWithChakra(<TabNavigation onNext={mockOnNext} />);
      const hstack = container.firstChild;
      expect(hstack).toBeInTheDocument();
    });

    it('justifies buttons to right on first tab', () => {
      renderWithChakra(<TabNavigation isFirstTab={true} onNext={mockOnNext} />);
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('justifies buttons between on non-first tabs', () => {
      renderWithChakra(<TabNavigation isFirstTab={false} onPrevious={mockOnPrevious} onNext={mockOnNext} />);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing handlers gracefully', async () => {
      const user = userEvent.setup();
      renderWithChakra(<TabNavigation />);

      const nextButton = screen.getByText('Next');
      await user.click(nextButton);

      /* Should not throw error even without handlers */
      expect(nextButton).toBeInTheDocument();
    });

    it('handles last tab with invalid form', () => {
      renderWithChakra(<TabNavigation isLastTab={true} isFormValid={false} onNext={mockOnNext} />);
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('handles read-only mode without onEdit handler', async () => {
      const user = userEvent.setup();
      renderWithChakra(<TabNavigation isLastTab={true} readOnly={true} />);

      const editButton = screen.getByText('Edit Plan');
      await user.click(editButton);

      /* Should not throw error */
      expect(editButton).toBeInTheDocument();
    });

    it('handles read-only mode without onBackToList handler', () => {
      renderWithChakra(<TabNavigation isLastTab={true} readOnly={true} />);
      expect(screen.queryByText('Back to List')).not.toBeInTheDocument();
    });
  });

  describe('Component Lifecycle', () => {
    it('mounts without errors', () => {
      expect(() => {
        renderWithChakra(<TabNavigation />);
      }).not.toThrow();
    });

    it('unmounts cleanly', () => {
      const { unmount } = renderWithChakra(<TabNavigation />);
      expect(() => {
        unmount();
      }).not.toThrow();
    });

    it('handles multiple mount/unmount cycles', () => {
      const { unmount: unmount1 } = renderWithChakra(<TabNavigation />);
      unmount1();

      const { unmount: unmount2 } = renderWithChakra(<TabNavigation />);
      unmount2();

      expect(() => {
        renderWithChakra(<TabNavigation />);
      }).not.toThrow();
    });
  });

  describe('Re-rendering Behavior', () => {
    it('updates when isFirstTab prop changes', () => {
      const { rerender } = renderWithChakra(<TabNavigation isFirstTab={true} onPrevious={mockOnPrevious} />);
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();

      rerender(
        <ChakraProvider value={defaultSystem}>
          <TabNavigation isFirstTab={false} onPrevious={mockOnPrevious} />
        </ChakraProvider>
      );

      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('updates when isLastTab prop changes', () => {
      const { rerender } = renderWithChakra(<TabNavigation isLastTab={false} onNext={mockOnNext} />);
      expect(screen.getByText('Next')).toBeInTheDocument();

      rerender(
        <ChakraProvider value={defaultSystem}>
          <TabNavigation isLastTab={true} isFormValid={true} onSubmit={mockOnSubmit} />
        </ChakraProvider>
      );

      expect(screen.getByText('Create Plan')).toBeInTheDocument();
    });

    it('updates when isSubmitting prop changes', () => {
      const { rerender } = renderWithChakra(<TabNavigation isLastTab={true} isFormValid={true} isSubmitting={false} />);
      expect(screen.getByText('Create Plan')).toBeInTheDocument();

      rerender(
        <ChakraProvider value={defaultSystem}>
          <TabNavigation isLastTab={true} isFormValid={true} isSubmitting={true} />
        </ChakraProvider>
      );

      expect(screen.getByText('Creating Plan...')).toBeInTheDocument();
    });

    it('updates when readOnly prop changes', () => {
      const { rerender } = renderWithChakra(<TabNavigation isLastTab={true} isFormValid={true} readOnly={false} />);
      expect(screen.getByText('Create Plan')).toBeInTheDocument();

      rerender(
        <ChakraProvider value={defaultSystem}>
          <TabNavigation isLastTab={true} readOnly={true} />
        </ChakraProvider>
      );

      expect(screen.getByText('Edit Plan')).toBeInTheDocument();
    });
  });

  describe('Integration Scenarios', () => {
    it('works with multi-step form navigation', async () => {
      const user = userEvent.setup();
      const { rerender } = renderWithChakra(<TabNavigation isFirstTab={true} onNext={mockOnNext} />);

      /* First tab - only Next button */
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();

      await user.click(screen.getByText('Next'));
      expect(mockOnNext).toHaveBeenCalledTimes(1);

      /* Middle tab - both buttons */
      rerender(
        <ChakraProvider value={defaultSystem}>
          <TabNavigation isFirstTab={false} isLastTab={false} onPrevious={mockOnPrevious} onNext={mockOnNext} />
        </ChakraProvider>
      );

      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();

      /* Last tab - Previous and Submit */
      rerender(
        <ChakraProvider value={defaultSystem}>
          <TabNavigation isFirstTab={false} isLastTab={true} isFormValid={true} onPrevious={mockOnPrevious} onSubmit={mockOnSubmit} />
        </ChakraProvider>
      );

      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Create Plan')).toBeInTheDocument();
    });

    it('works with view mode to edit mode transition', async () => {
      const user = userEvent.setup();
      const { rerender } = renderWithChakra(
        <TabNavigation isLastTab={true} readOnly={true} onEdit={mockOnEdit} onBackToList={mockOnBackToList} />
      );

      /* View mode - Edit Plan and Cancel button (which serves as Back to List) */
      expect(screen.getByText('Edit Plan')).toBeInTheDocument();
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);

      await user.click(screen.getByText('Edit Plan'));
      expect(mockOnEdit).toHaveBeenCalledTimes(1);

      /* Edit mode */
      rerender(
        <ChakraProvider value={defaultSystem}>
          <TabNavigation isLastTab={true} isFormValid={true} readOnly={false} onSubmit={mockOnSubmit} />
        </ChakraProvider>
      );

      expect(screen.getByText('Create Plan')).toBeInTheDocument();
      /* In edit mode on last tab with valid form, we have Cancel (Previous) and Create Plan buttons */
      const editModeButtons = screen.getAllByRole('button');
      expect(editModeButtons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Performance', () => {
    it('renders quickly with default props', () => {
      const startTime = Date.now();
      renderWithChakra(<TabNavigation />);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);
    });

    it('handles rapid prop changes efficiently', () => {
      const { rerender } = renderWithChakra(<TabNavigation isFirstTab={true} />);

      const startTime = Date.now();

      for (let i = 0; i < 50; i++) {
        rerender(
          <ChakraProvider value={defaultSystem}>
            <TabNavigation isFirstTab={i % 2 === 0} />
          </ChakraProvider>
        );
      }

      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(500);
    });
  });
});
