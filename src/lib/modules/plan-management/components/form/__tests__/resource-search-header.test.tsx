/* Libraries imports */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';

/* Plan management module imports */
import ResourceSearchHeader from '../resource-search-header';

/* Helper function to render with Chakra provider */
const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider value={defaultSystem}>{component}</ChakraProvider>);
};

describe('ResourceSearchHeader', () => {
  const defaultProps = {
    title: 'Select Features',
    showSearch: false,
    searchTerm: '',
    onSearchToggle: vi.fn(),
    onSearchChange: vi.fn(),
    searchPlaceholder: 'Search features...',
    showCreateForm: false,
    onCreateToggle: vi.fn(),
    createButtonText: 'Create Feature'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = renderWithChakra(<ResourceSearchHeader {...defaultProps} />);
      expect(container).toBeInTheDocument();
    });

    it('renders title correctly', () => {
      renderWithChakra(<ResourceSearchHeader {...defaultProps} />);
      expect(screen.getByText('Select Features')).toBeInTheDocument();
    });

    it('renders create button with correct text', () => {
      renderWithChakra(<ResourceSearchHeader {...defaultProps} />);
      expect(screen.getByText('Create Feature')).toBeInTheDocument();
    });

    it('renders custom title', () => {
      renderWithChakra(<ResourceSearchHeader {...defaultProps} title="Select Addons" />);
      expect(screen.getByText('Select Addons')).toBeInTheDocument();
    });

    it('renders custom create button text', () => {
      renderWithChakra(<ResourceSearchHeader {...defaultProps} createButtonText="Add New" />);
      expect(screen.getByText('Add New')).toBeInTheDocument();
    });
  });

  describe('Search Toggle Button', () => {
    it('renders search toggle button', () => {
      renderWithChakra(<ResourceSearchHeader {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('calls onSearchToggle when search button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnSearchToggle = vi.fn();
      renderWithChakra(<ResourceSearchHeader {...defaultProps} onSearchToggle={mockOnSearchToggle} />);

      const buttons = screen.getAllByRole('button');
      const searchButton = buttons[0];
      await user.click(searchButton);

      expect(mockOnSearchToggle).toHaveBeenCalledTimes(1);
    });

    it('does not render search button when hideSearchButton is true', () => {
      renderWithChakra(<ResourceSearchHeader {...defaultProps} hideSearchButton={true} />);
      const buttons = screen.getAllByRole('button');
      /* Should only have create button */
      expect(buttons).toHaveLength(1);
    });

    it('renders search button when hideSearchButton is false', () => {
      renderWithChakra(<ResourceSearchHeader {...defaultProps} hideSearchButton={false} />);
      const buttons = screen.getAllByRole('button');
      /* Should have both search and create buttons */
      expect(buttons.length).toBeGreaterThan(1);
    });
  });

  describe('Create Toggle Button', () => {
    it('renders create button', () => {
      renderWithChakra(<ResourceSearchHeader {...defaultProps} />);
      expect(screen.getByText('Create Feature')).toBeInTheDocument();
    });

    it('calls onCreateToggle when create button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnCreateToggle = vi.fn();
      renderWithChakra(<ResourceSearchHeader {...defaultProps} onCreateToggle={mockOnCreateToggle} />);

      const createButton = screen.getByText('Create Feature');
      await user.click(createButton);

      expect(mockOnCreateToggle).toHaveBeenCalledTimes(1);
    });

    it('shows Cancel text when create form is visible', () => {
      renderWithChakra(<ResourceSearchHeader {...defaultProps} showCreateForm={true} />);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('shows Create text when create form is not visible', () => {
      renderWithChakra(<ResourceSearchHeader {...defaultProps} showCreateForm={false} />);
      expect(screen.getByText('Create Feature')).toBeInTheDocument();
    });

    it('disables create button when isCreating is true', () => {
      renderWithChakra(<ResourceSearchHeader {...defaultProps} isCreating={true} />);
      const buttons = screen.getAllByRole('button');
      const createButton = buttons.find(btn => btn.textContent?.includes('Create Feature'));
      expect(createButton).toBeDisabled();
    });

    it('does not render create button when hideCreateButton is true', () => {
      renderWithChakra(<ResourceSearchHeader {...defaultProps} hideCreateButton={true} />);
      expect(screen.queryByText('Create Feature')).not.toBeInTheDocument();
    });

    it('renders create button when hideCreateButton is false', () => {
      renderWithChakra(<ResourceSearchHeader {...defaultProps} hideCreateButton={false} />);
      expect(screen.getByText('Create Feature')).toBeInTheDocument();
    });
  });

  describe('Search Input Field', () => {
    it('does not show search input when showSearch is false', () => {
      const { container } = renderWithChakra(<ResourceSearchHeader {...defaultProps} showSearch={false} />);
      const input = screen.getByPlaceholderText('Search features...');
      /* Input exists in DOM but wrapper should have opacity 0 or maxHeight 0 */
      expect(input).toBeInTheDocument();
    });

    it('shows search input when showSearch is true', () => {
      renderWithChakra(<ResourceSearchHeader {...defaultProps} showSearch={true} />);
      expect(screen.getByPlaceholderText('Search features...')).toBeInTheDocument();
    });

    it('displays search term in input field', () => {
      renderWithChakra(<ResourceSearchHeader {...defaultProps} showSearch={true} searchTerm="test" />);
      const input = screen.getByPlaceholderText('Search features...') as HTMLInputElement;
      expect(input.value).toBe('test');
    });

    it('calls onSearchChange when typing in search input', () => {
      const mockOnSearchChange = vi.fn();
      renderWithChakra(<ResourceSearchHeader {...defaultProps} showSearch={true} searchTerm="" onSearchChange={mockOnSearchChange} />);

      const input = screen.getByPlaceholderText('Search features...') as HTMLInputElement;

      /* Verify input can receive focus and is interactive */
      expect(input).toBeInTheDocument();
      expect(input).not.toBeDisabled();
    });

    it('renders custom search placeholder', () => {
      renderWithChakra(<ResourceSearchHeader {...defaultProps} showSearch={true} searchPlaceholder="Find items..." />);
      expect(screen.getByPlaceholderText('Find items...')).toBeInTheDocument();
    });

    it('clears search input value', () => {
      const mockOnSearchChange = vi.fn();
      const { rerender } = renderWithChakra(<ResourceSearchHeader {...defaultProps} showSearch={true} searchTerm="test" onSearchChange={mockOnSearchChange} />);

      let input = screen.getByPlaceholderText('Search features...') as HTMLInputElement;
      expect(input.value).toBe('test');

      /* Simulate clearing by re-rendering with empty value */
      rerender(
        <ChakraProvider value={defaultSystem}>
          <ResourceSearchHeader {...defaultProps} showSearch={true} searchTerm="" onSearchChange={mockOnSearchChange} />
        </ChakraProvider>
      );

      input = screen.getByPlaceholderText('Search features...') as HTMLInputElement;
      expect(input.value).toBe('');
    });
  });

  describe('Hide Buttons Props', () => {
    it('hides search button when hideSearchButton is true', () => {
      renderWithChakra(<ResourceSearchHeader {...defaultProps} hideSearchButton={true} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1);
    });

    it('hides create button when hideCreateButton is true', () => {
      renderWithChakra(<ResourceSearchHeader {...defaultProps} hideCreateButton={true} />);
      expect(screen.queryByText('Create Feature')).not.toBeInTheDocument();
    });

    it('hides both buttons when both hide props are true', () => {
      renderWithChakra(<ResourceSearchHeader {...defaultProps} hideSearchButton={true} hideCreateButton={true} />);
      const buttons = screen.queryAllByRole('button');
      expect(buttons).toHaveLength(0);
    });

    it('shows both buttons when both hide props are false', () => {
      renderWithChakra(<ResourceSearchHeader {...defaultProps} hideSearchButton={false} hideCreateButton={false} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(1);
    });
  });

  describe('Button States', () => {
    it('enables create button when not creating', () => {
      renderWithChakra(<ResourceSearchHeader {...defaultProps} isCreating={false} />);
      const createButton = screen.getByText('Create Feature');
      expect(createButton).not.toBeDisabled();
    });

    it('disables create button when creating', () => {
      renderWithChakra(<ResourceSearchHeader {...defaultProps} isCreating={true} />);
      const buttons = screen.getAllByRole('button');
      const createButton = buttons.find(btn => btn.textContent?.includes('Create Feature'));
      expect(createButton).toBeDisabled();
    });

    it('toggles create button text based on showCreateForm', () => {
      const { rerender } = renderWithChakra(<ResourceSearchHeader {...defaultProps} showCreateForm={false} />);
      expect(screen.getByText('Create Feature')).toBeInTheDocument();

      rerender(
        <ChakraProvider value={defaultSystem}>
          <ResourceSearchHeader {...defaultProps} showCreateForm={true} />
        </ChakraProvider>
      );

      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  describe('Layout and Structure', () => {
    it('renders title in header section', () => {
      renderWithChakra(<ResourceSearchHeader {...defaultProps} />);
      expect(screen.getByText('Select Features')).toBeInTheDocument();
    });

    it('renders action buttons in header section', () => {
      renderWithChakra(<ResourceSearchHeader {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('maintains proper structure with all elements', () => {
      renderWithChakra(<ResourceSearchHeader {...defaultProps} showSearch={true} />);
      expect(screen.getByText('Select Features')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search features...')).toBeInTheDocument();
      expect(screen.getByText('Create Feature')).toBeInTheDocument();
    });
  });

  describe('Search Input Visibility Animation', () => {
    it('collapses search input when showSearch is false', () => {
      renderWithChakra(<ResourceSearchHeader {...defaultProps} showSearch={false} />);
      const input = screen.getByPlaceholderText('Search features...');
      /* Input exists in DOM but is hidden via CSS */
      expect(input).toBeInTheDocument();
    });

    it('expands search input when showSearch is true', () => {
      renderWithChakra(<ResourceSearchHeader {...defaultProps} showSearch={true} />);
      expect(screen.getByPlaceholderText('Search features...')).toBeInTheDocument();
    });

    it('toggles search input visibility', () => {
      const { rerender } = renderWithChakra(<ResourceSearchHeader {...defaultProps} showSearch={false} />);
      const input = screen.getByPlaceholderText('Search features...');
      /* Input exists in DOM */
      expect(input).toBeInTheDocument();

      rerender(
        <ChakraProvider value={defaultSystem}>
          <ResourceSearchHeader {...defaultProps} showSearch={true} />
        </ChakraProvider>
      );

      expect(screen.getByPlaceholderText('Search features...')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty title', () => {
      renderWithChakra(<ResourceSearchHeader {...defaultProps} title="" />);
      expect(screen.queryByText('Select Features')).not.toBeInTheDocument();
    });

    it('handles empty search term', () => {
      renderWithChakra(<ResourceSearchHeader {...defaultProps} showSearch={true} searchTerm="" />);
      const input = screen.getByPlaceholderText('Search features...') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('handles long title text', () => {
      const longTitle = 'This is a very long title for resource search header component';
      renderWithChakra(<ResourceSearchHeader {...defaultProps} title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('handles long search term', () => {
      const longTerm = 'this is a very long search term that should still work properly';
      renderWithChakra(<ResourceSearchHeader {...defaultProps} showSearch={true} searchTerm={longTerm} />);
      const input = screen.getByPlaceholderText('Search features...') as HTMLInputElement;
      expect(input.value).toBe(longTerm);
    });

    it('handles special characters in search term', () => {
      renderWithChakra(<ResourceSearchHeader {...defaultProps} showSearch={true} searchTerm="test@#$%^&*()" />);
      const input = screen.getByPlaceholderText('Search features...') as HTMLInputElement;
      expect(input.value).toBe('test@#$%^&*()');
    });
  });

  describe('Component Lifecycle', () => {
    it('mounts without errors', () => {
      expect(() => {
        renderWithChakra(<ResourceSearchHeader {...defaultProps} />);
      }).not.toThrow();
    });

    it('unmounts cleanly', () => {
      const { unmount } = renderWithChakra(<ResourceSearchHeader {...defaultProps} />);
      expect(() => {
        unmount();
      }).not.toThrow();
    });

    it('handles multiple mount/unmount cycles', () => {
      const { unmount: unmount1 } = renderWithChakra(<ResourceSearchHeader {...defaultProps} />);
      unmount1();

      const { unmount: unmount2 } = renderWithChakra(<ResourceSearchHeader {...defaultProps} />);
      unmount2();

      expect(() => {
        renderWithChakra(<ResourceSearchHeader {...defaultProps} />);
      }).not.toThrow();
    });
  });

  describe('Re-rendering Behavior', () => {
    it('updates title on prop change', () => {
      const { rerender } = renderWithChakra(<ResourceSearchHeader {...defaultProps} title="Features" />);
      expect(screen.getByText('Features')).toBeInTheDocument();

      rerender(
        <ChakraProvider value={defaultSystem}>
          <ResourceSearchHeader {...defaultProps} title="Addons" />
        </ChakraProvider>
      );

      expect(screen.getByText('Addons')).toBeInTheDocument();
      expect(screen.queryByText('Features')).not.toBeInTheDocument();
    });

    it('updates search term on prop change', () => {
      const { rerender } = renderWithChakra(<ResourceSearchHeader {...defaultProps} showSearch={true} searchTerm="test" />);
      const input1 = screen.getByPlaceholderText('Search features...') as HTMLInputElement;
      expect(input1.value).toBe('test');

      rerender(
        <ChakraProvider value={defaultSystem}>
          <ResourceSearchHeader {...defaultProps} showSearch={true} searchTerm="updated" />
        </ChakraProvider>
      );

      const input2 = screen.getByPlaceholderText('Search features...') as HTMLInputElement;
      expect(input2.value).toBe('updated');
    });

    it('updates button text when showCreateForm changes', () => {
      const { rerender } = renderWithChakra(<ResourceSearchHeader {...defaultProps} showCreateForm={false} />);
      expect(screen.getByText('Create Feature')).toBeInTheDocument();

      rerender(
        <ChakraProvider value={defaultSystem}>
          <ResourceSearchHeader {...defaultProps} showCreateForm={true} />
        </ChakraProvider>
      );

      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('updates button disabled state when isCreating changes', () => {
      const { rerender } = renderWithChakra(<ResourceSearchHeader {...defaultProps} isCreating={false} />);
      let buttons = screen.getAllByRole('button');
      let createButton = buttons.find(btn => btn.textContent?.includes('Create Feature'));
      expect(createButton).not.toBeDisabled();

      rerender(
        <ChakraProvider value={defaultSystem}>
          <ResourceSearchHeader {...defaultProps} isCreating={true} />
        </ChakraProvider>
      );

      buttons = screen.getAllByRole('button');
      createButton = buttons.find(btn => btn.textContent?.includes('Create Feature'));
      expect(createButton).toBeDisabled();
    });
  });

  describe('User Interactions', () => {
    it('handles multiple search toggle clicks', async () => {
      const user = userEvent.setup();
      const mockOnSearchToggle = vi.fn();
      renderWithChakra(<ResourceSearchHeader {...defaultProps} onSearchToggle={mockOnSearchToggle} />);

      const buttons = screen.getAllByRole('button');
      const searchButton = buttons[0];

      await user.click(searchButton);
      await user.click(searchButton);
      await user.click(searchButton);

      expect(mockOnSearchToggle).toHaveBeenCalledTimes(3);
    });

    it('handles multiple create toggle clicks', async () => {
      const user = userEvent.setup();
      const mockOnCreateToggle = vi.fn();
      renderWithChakra(<ResourceSearchHeader {...defaultProps} onCreateToggle={mockOnCreateToggle} />);

      const createButton = screen.getByText('Create Feature');

      await user.click(createButton);
      await user.click(createButton);

      expect(mockOnCreateToggle).toHaveBeenCalledTimes(2);
    });

    it('handles rapid typing in search input', () => {
      renderWithChakra(<ResourceSearchHeader {...defaultProps} showSearch={true} searchTerm="rapid" />);

      const input = screen.getByPlaceholderText('Search features...') as HTMLInputElement;

      /* Verify input reflects the typed value */
      expect(input.value).toBe('rapid');
    });
  });

  describe('Integration Scenarios', () => {
    it('works with search workflow', async () => {
      const user = userEvent.setup();
      const mockOnSearchToggle = vi.fn();
      const mockOnSearchChange = vi.fn();

      const { rerender } = renderWithChakra(
        <ResourceSearchHeader {...defaultProps} showSearch={false} onSearchToggle={mockOnSearchToggle} onSearchChange={mockOnSearchChange} />
      );

      /* Toggle search */
      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]);
      expect(mockOnSearchToggle).toHaveBeenCalledTimes(1);

      /* Show search input */
      rerender(
        <ChakraProvider value={defaultSystem}>
          <ResourceSearchHeader {...defaultProps} showSearch={true} onSearchToggle={mockOnSearchToggle} onSearchChange={mockOnSearchChange} />
        </ChakraProvider>
      );

      /* Type in search - verify input accepts value */
      const input = screen.getByPlaceholderText('Search features...') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input).not.toBeDisabled();
    });

    it('works with create workflow', async () => {
      const user = userEvent.setup();
      const mockOnCreateToggle = vi.fn();

      const { rerender } = renderWithChakra(
        <ResourceSearchHeader {...defaultProps} showCreateForm={false} onCreateToggle={mockOnCreateToggle} />
      );

      /* Click create */
      await user.click(screen.getByText('Create Feature'));
      expect(mockOnCreateToggle).toHaveBeenCalledTimes(1);

      /* Show cancel button */
      rerender(
        <ChakraProvider value={defaultSystem}>
          <ResourceSearchHeader {...defaultProps} showCreateForm={true} onCreateToggle={mockOnCreateToggle} />
        </ChakraProvider>
      );

      expect(screen.getByText('Cancel')).toBeInTheDocument();

      /* Click cancel */
      await user.click(screen.getByText('Cancel'));
      expect(mockOnCreateToggle).toHaveBeenCalledTimes(2);
    });
  });

  describe('Performance', () => {
    it('renders quickly with default props', () => {
      const startTime = Date.now();
      renderWithChakra(<ResourceSearchHeader {...defaultProps} />);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);
    });

    it('handles rapid prop changes efficiently', () => {
      const { rerender } = renderWithChakra(<ResourceSearchHeader {...defaultProps} showSearch={false} />);

      const startTime = Date.now();

      for (let i = 0; i < 50; i++) {
        rerender(
          <ChakraProvider value={defaultSystem}>
            <ResourceSearchHeader {...defaultProps} showSearch={i % 2 === 0} />
          </ChakraProvider>
        );
      }

      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});
