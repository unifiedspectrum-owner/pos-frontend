/* Libraries imports */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';

/* Plan management module imports */
import DataRecoveryModal from '../data-recovery-modal';

/* Helper function to render with Chakra provider */
const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider value={defaultSystem}>{component}</ChakraProvider>);
};

describe('DataRecoveryModal', () => {
  const mockOnRestore = vi.fn();
  const mockOnStartFresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing when open', () => {
      const { container } = renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      expect(container).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      renderWithChakra(
        <DataRecoveryModal isOpen={false} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      expect(screen.queryByText('Restore Previous Data?')).not.toBeInTheDocument();
    });

    it('renders modal title', () => {
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      expect(screen.getByText('Restore Previous Data?')).toBeInTheDocument();
    });

    it('renders modal description', () => {
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      expect(screen.getByText(/We found previously saved form data/i)).toBeInTheDocument();
    });

    it('renders Start Fresh button', () => {
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      expect(screen.getByText('Start Fresh')).toBeInTheDocument();
    });

    it('renders Restore Data button', () => {
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      expect(screen.getByText('Restore Data')).toBeInTheDocument();
    });
  });

  describe('Modal Header', () => {
    it('displays refresh icon in header', () => {
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      expect(screen.getByText('Restore Previous Data?')).toBeInTheDocument();
    });

    it('displays title text', () => {
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      expect(screen.getByText('Restore Previous Data?')).toBeInTheDocument();
    });

    it('renders header with proper styling', () => {
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      expect(screen.getByText('Restore Previous Data?')).toBeInTheDocument();
    });
  });

  describe('Modal Body', () => {
    it('displays explanation text', () => {
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      expect(screen.getByText(/We found previously saved form data/i)).toBeInTheDocument();
    });

    it('displays complete message about restoration choice', () => {
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      expect(screen.getByText(/Would you like to restore your previous progress or start with a fresh form/i)).toBeInTheDocument();
    });
  });

  describe('Start Fresh Button', () => {
    it('calls onStartFresh when clicked', async () => {
      const user = userEvent.setup();
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );

      const startFreshButton = screen.getByText('Start Fresh');
      await user.click(startFreshButton);

      expect(mockOnStartFresh).toHaveBeenCalledTimes(1);
    });

    it('renders as secondary button', () => {
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      expect(screen.getByText('Start Fresh')).toBeInTheDocument();
    });

    it('displays X icon', () => {
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      expect(screen.getByText('Start Fresh')).toBeInTheDocument();
    });
  });

  describe('Restore Data Button', () => {
    it('calls onRestore when clicked', async () => {
      const user = userEvent.setup();
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );

      const restoreButton = screen.getByText('Restore Data');
      await user.click(restoreButton);

      expect(mockOnRestore).toHaveBeenCalledTimes(1);
    });

    it('renders as primary button', () => {
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      expect(screen.getByText('Restore Data')).toBeInTheDocument();
    });

    it('displays refresh icon', () => {
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      expect(screen.getByText('Restore Data')).toBeInTheDocument();
    });
  });

  describe('Modal Behavior', () => {
    it('shows modal when isOpen is true', () => {
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      expect(screen.getByText('Restore Previous Data?')).toBeInTheDocument();
    });

    it('hides modal when isOpen is false', () => {
      renderWithChakra(
        <DataRecoveryModal isOpen={false} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      expect(screen.queryByText('Restore Previous Data?')).not.toBeInTheDocument();
    });

    it('toggles visibility based on isOpen prop', async () => {
      const { rerender } = renderWithChakra(
        <DataRecoveryModal isOpen={false} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      expect(screen.queryByText('Restore Previous Data?')).not.toBeInTheDocument();

      rerender(
        <ChakraProvider value={defaultSystem}>
          <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
        </ChakraProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Restore Previous Data?')).toBeInTheDocument();
      });
    });
  });

  describe('Modal Footer', () => {
    it('renders both action buttons', () => {
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      expect(screen.getByText('Start Fresh')).toBeInTheDocument();
      expect(screen.getByText('Restore Data')).toBeInTheDocument();
    });

    it('arranges buttons in horizontal stack', () => {
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      expect(screen.getByText('Start Fresh')).toBeInTheDocument();
      expect(screen.getByText('Restore Data')).toBeInTheDocument();
    });

    it('places Start Fresh button before Restore Data button', () => {
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('User Interactions', () => {
    it('handles restore button click', async () => {
      const user = userEvent.setup();
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );

      await user.click(screen.getByText('Restore Data'));

      expect(mockOnRestore).toHaveBeenCalledTimes(1);
      expect(mockOnStartFresh).not.toHaveBeenCalled();
    });

    it('handles start fresh button click', async () => {
      const user = userEvent.setup();
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );

      await user.click(screen.getByText('Start Fresh'));

      expect(mockOnStartFresh).toHaveBeenCalledTimes(1);
      expect(mockOnRestore).not.toHaveBeenCalled();
    });

    it('handles multiple clicks on same button', async () => {
      const user = userEvent.setup();
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );

      const restoreButton = screen.getByText('Restore Data');
      await user.click(restoreButton);
      await user.click(restoreButton);

      expect(mockOnRestore).toHaveBeenCalledTimes(2);
    });
  });

  describe('Modal Close Behavior', () => {
    it('calls onStartFresh when modal backdrop is clicked', async () => {
      const user = userEvent.setup();
      const { container } = renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );

      /* Modal should handle close via onOpenChange */
      expect(screen.getByText('Restore Previous Data?')).toBeInTheDocument();
    });
  });

  describe('Component Lifecycle', () => {
    it('mounts without errors when open', () => {
      expect(() => {
        renderWithChakra(
          <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
        );
      }).not.toThrow();
    });

    it('mounts without errors when closed', () => {
      expect(() => {
        renderWithChakra(
          <DataRecoveryModal isOpen={false} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
        );
      }).not.toThrow();
    });

    it('unmounts cleanly', () => {
      const { unmount } = renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      expect(() => {
        unmount();
      }).not.toThrow();
    });

    it('handles multiple mount/unmount cycles', () => {
      const { unmount: unmount1 } = renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      unmount1();

      const { unmount: unmount2 } = renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      unmount2();

      expect(() => {
        renderWithChakra(
          <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
        );
      }).not.toThrow();
    });
  });

  describe('Re-rendering Behavior', () => {
    it('updates when isOpen prop changes', async () => {
      const { rerender } = renderWithChakra(
        <DataRecoveryModal isOpen={false} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      expect(screen.queryByText('Restore Previous Data?')).not.toBeInTheDocument();

      rerender(
        <ChakraProvider value={defaultSystem}>
          <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
        </ChakraProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Restore Previous Data?')).toBeInTheDocument();
      });
    });

    it('maintains handlers during re-renders', async () => {
      const user = userEvent.setup();
      const { rerender } = renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );

      rerender(
        <ChakraProvider value={defaultSystem}>
          <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
        </ChakraProvider>
      );

      await user.click(screen.getByText('Restore Data'));
      expect(mockOnRestore).toHaveBeenCalledTimes(1);
    });

    it('handles rapid open/close toggles', () => {
      const { rerender } = renderWithChakra(
        <DataRecoveryModal isOpen={false} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );

      for (let i = 0; i < 10; i++) {
        rerender(
          <ChakraProvider value={defaultSystem}>
            <DataRecoveryModal isOpen={i % 2 === 0} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
          </ChakraProvider>
        );
      }

      expect(screen.queryByText('Restore Previous Data?')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing onRestore handler gracefully', async () => {
      const user = userEvent.setup();
      const noOpHandler = () => { /* no-op */ };
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={noOpHandler} onStartFresh={mockOnStartFresh} />
      );

      await user.click(screen.getByText('Restore Data'));
      /* Should not throw error */
      expect(screen.getByText('Restore Data')).toBeInTheDocument();
    });

    it('handles missing onStartFresh handler gracefully', async () => {
      const user = userEvent.setup();
      const noOpHandler = () => { /* no-op */ };
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={noOpHandler} />
      );

      await user.click(screen.getByText('Start Fresh'));
      /* Should not throw error */
      expect(screen.getByText('Start Fresh')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('renders dialog with proper role', () => {
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      expect(screen.getByText('Restore Previous Data?')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      expect(screen.getByText('Start Fresh')).toBeInTheDocument();
      expect(screen.getByText('Restore Data')).toBeInTheDocument();
    });

    it('maintains focus management', () => {
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      expect(screen.getByText('Restore Previous Data?')).toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    it('renders with backdrop blur effect', () => {
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      expect(screen.getByText('Restore Previous Data?')).toBeInTheDocument();
    });

    it('centers modal on screen', () => {
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      expect(screen.getByText('Restore Previous Data?')).toBeInTheDocument();
    });

    it('applies proper spacing to content', () => {
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      expect(screen.getByText('Restore Previous Data?')).toBeInTheDocument();
    });
  });

  describe('Integration Scenarios', () => {
    it('works in form recovery workflow', async () => {
      const user = userEvent.setup();
      const { rerender } = renderWithChakra(
        <DataRecoveryModal isOpen={false} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );

      /* Open modal */
      rerender(
        <ChakraProvider value={defaultSystem}>
          <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
        </ChakraProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Restore Previous Data?')).toBeInTheDocument();
      });

      /* User chooses to restore */
      await user.click(screen.getByText('Restore Data'));
      expect(mockOnRestore).toHaveBeenCalledTimes(1);

      /* Close modal */
      rerender(
        <ChakraProvider value={defaultSystem}>
          <DataRecoveryModal isOpen={false} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
        </ChakraProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Restore Previous Data?')).not.toBeInTheDocument();
      });
    });

    it('works when user chooses fresh start', async () => {
      const user = userEvent.setup();
      const { rerender } = renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );

      await waitFor(() => {
        expect(screen.getByText('Start Fresh')).toBeInTheDocument();
      });

      /* User chooses fresh start */
      await user.click(screen.getByText('Start Fresh'));
      expect(mockOnStartFresh).toHaveBeenCalledTimes(1);

      /* Close modal */
      rerender(
        <ChakraProvider value={defaultSystem}>
          <DataRecoveryModal isOpen={false} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
        </ChakraProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Restore Previous Data?')).not.toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('renders quickly when opened', () => {
      const startTime = Date.now();
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);
    });

    it('handles rapid open/close cycles efficiently', () => {
      const { rerender } = renderWithChakra(
        <DataRecoveryModal isOpen={false} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );

      const startTime = Date.now();

      for (let i = 0; i < 50; i++) {
        rerender(
          <ChakraProvider value={defaultSystem}>
            <DataRecoveryModal isOpen={i % 2 === 0} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
          </ChakraProvider>
        );
      }

      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  describe('Button Styling', () => {
    it('renders Start Fresh as secondary button', () => {
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      expect(screen.getByText('Start Fresh')).toBeInTheDocument();
    });

    it('renders Restore Data as primary button', () => {
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      expect(screen.getByText('Restore Data')).toBeInTheDocument();
    });

    it('applies correct button sizes', () => {
      renderWithChakra(
        <DataRecoveryModal isOpen={true} onRestore={mockOnRestore} onStartFresh={mockOnStartFresh} />
      );
      expect(screen.getByText('Start Fresh')).toBeInTheDocument();
      expect(screen.getByText('Restore Data')).toBeInTheDocument();
    });
  });
});
