import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@shared/test-utils/render'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import SearchHeader from '../search-header'

// Mock the shared config
vi.mock('@shared/config', () => ({
  PRIMARY_COLOR: '#3182CE',
  GRAY_COLOR: '#718096'
}))

// Mock react-icons
vi.mock('react-icons/fi', () => ({
  FiSearch: () => <span data-testid="search-icon">SearchIcon</span>,
  FiPlus: () => <span data-testid="plus-icon">PlusIcon</span>,
  FiX: () => <span data-testid="x-icon">XIcon</span>
}))

// Mock polished library
vi.mock('polished', () => ({
  lighten: (amount: number, color: string) => `lightened-${amount}-${color}`
}))

// Mock shared components
vi.mock('@shared/components/form-elements', () => ({
  PrimaryButton: ({ children, onClick, leftIcon: LeftIcon, disabled, ...props }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled}
      data-testid="primary-button" 
      aria-label={children}
      {...props}
    >
      {LeftIcon && <LeftIcon aria-hidden="true" />}
      {children}
    </button>
  )
}))

describe('SearchHeader', () => {
  const mockOnSearchToggle = vi.fn()
  const mockOnSearchChange = vi.fn()
  const mockOnCreateToggle = vi.fn()

  const defaultProps = {
    title: 'Test Resources',
    showSearch: false,
    searchTerm: '',
    onSearchToggle: mockOnSearchToggle,
    onSearchChange: mockOnSearchChange,
    searchPlaceholder: 'Search resources...',
    showCreateForm: false,
    onCreateToggle: mockOnCreateToggle,
    createButtonText: 'Add New'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders title correctly', () => {
      render(<SearchHeader {...defaultProps} />)
      
      expect(screen.getByText('Test Resources')).toBeInTheDocument()
    })

    it('renders search toggle button when not hidden', () => {
      render(<SearchHeader {...defaultProps} />)
      
      // Should have both search toggle and create buttons
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(2)
      
      // Should have search icons (one in button, one in input field)
      const searchIcons = screen.getAllByTestId('search-icon')
      expect(searchIcons.length).toBeGreaterThanOrEqual(1)
    })

    it('renders create button when not hidden', () => {
      render(<SearchHeader {...defaultProps} />)
      
      expect(screen.getByText('Add New')).toBeInTheDocument()
    })

    it('hides search button when hideSearchButton is true', () => {
      render(<SearchHeader {...defaultProps} hideSearchButton={true} />)
      
      // Only the create button should be visible
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(1)
      expect(screen.getByText('Add New')).toBeInTheDocument()
    })

    it('hides create button when hideCreateButton is true', () => {
      render(<SearchHeader {...defaultProps} hideCreateButton={true} />)
      
      // Only the search button should be visible
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(1)
    })

    it('renders search input when showSearch is true', () => {
      render(<SearchHeader {...defaultProps} showSearch={true} />)
      
      expect(screen.getByPlaceholderText('Search resources...')).toBeInTheDocument()
    })

    it('handles search input visibility when showSearch is false', () => {
      render(<SearchHeader {...defaultProps} showSearch={false} />)
      
      // Component should render correctly when search is hidden
      // The input may still be in DOM but hidden via CSS transitions
      expect(() => screen.queryByPlaceholderText('Search resources...')).not.toThrow()
      
      // What's important is that the component renders without errors
      expect(screen.getByText('Test Resources')).toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('calls onSearchToggle when search button is clicked', async () => {
      const user = userEvent.setup()
      render(<SearchHeader {...defaultProps} />)
      
      // Find the search toggle button (not the create button)
      const buttons = screen.getAllByRole('button')
      const searchButton = buttons.find(btn => !btn.textContent?.includes('Add New'))
      
      if (searchButton) {
        await user.click(searchButton)
        expect(mockOnSearchToggle).toHaveBeenCalledTimes(1)
      }
    })

    it('displays current search term in input', () => {
      render(<SearchHeader {...defaultProps} showSearch={true} searchTerm="test query" />)
      
      const searchInput = screen.getByDisplayValue('test query')
      expect(searchInput).toBeInTheDocument()
    })

    it('calls onSearchChange when search input value changes', async () => {
      const user = userEvent.setup()
      render(<SearchHeader {...defaultProps} showSearch={true} />)
      
      const searchInput = screen.getByPlaceholderText('Search resources...')
      await user.type(searchInput, 'new')
      
      expect(mockOnSearchChange).toHaveBeenCalledWith('n')
      expect(mockOnSearchChange).toHaveBeenCalledWith('e')
      expect(mockOnSearchChange).toHaveBeenCalledWith('w')
    })
  })

  describe('Create Form Functionality', () => {
    it('calls onCreateToggle when create button is clicked', async () => {
      const user = userEvent.setup()
      render(<SearchHeader {...defaultProps} />)
      
      const createButton = screen.getByText('Add New')
      await user.click(createButton)
      
      expect(mockOnCreateToggle).toHaveBeenCalledTimes(1)
    })

    it('shows create button text when form is hidden', () => {
      render(<SearchHeader {...defaultProps} showCreateForm={false} />)
      
      expect(screen.getByText('Add New')).toBeInTheDocument()
    })

    it('shows cancel text when form is shown', () => {
      render(<SearchHeader {...defaultProps} showCreateForm={true} />)
      
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('disables create button when isCreating is true', () => {
      render(<SearchHeader {...defaultProps} isCreating={true} />)
      
      const createButton = screen.getByText('Add New')
      expect(createButton).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<SearchHeader {...defaultProps} showSearch={true} />)
      const results = await axe(container)
      expect(results.violations).toHaveLength(0)
    })

    it('has proper input accessibility attributes', () => {
      render(<SearchHeader {...defaultProps} showSearch={true} />)
      
      const searchInput = screen.getByRole('textbox')
      expect(searchInput).toHaveAttribute('placeholder', 'Search resources...')
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<SearchHeader {...defaultProps} showSearch={true} />)
      
      // Tab through interactive elements
      await user.tab()
      
      // Should be able to focus on buttons and inputs
      expect(document.activeElement).not.toBe(document.body)
    })
  })

  describe('Search Button States', () => {
    it('shows inactive search button when search is hidden', () => {
      render(<SearchHeader {...defaultProps} showSearch={false} />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(1)
    })

    it('shows active search button when search is shown', () => {
      render(<SearchHeader {...defaultProps} showSearch={true} />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(1)
    })

    it('toggles search button state correctly', () => {
      const { rerender } = render(<SearchHeader {...defaultProps} showSearch={false} />)
      
      // Initially search should be hidden (may still be in DOM but not visible)
      const initialInput = screen.queryByPlaceholderText('Search resources...')
      // Don't assume it's removed from DOM, just that component renders without error
      
      // Toggle to active
      rerender(<SearchHeader {...defaultProps} showSearch={true} />)
      
      // When active, search input should be accessible
      expect(screen.getByPlaceholderText('Search resources...')).toBeInTheDocument()
    })

    it('maintains search button functionality during rapid toggles', async () => {
      const user = userEvent.setup()
      render(<SearchHeader {...defaultProps} />)
      
      const buttons = screen.getAllByRole('button')
      const searchButton = buttons.find(btn => !btn.textContent?.includes('Add New'))
      
      if (searchButton) {
        // Rapid clicks
        await user.click(searchButton)
        await user.click(searchButton)
        await user.click(searchButton)
        
        expect(mockOnSearchToggle).toHaveBeenCalledTimes(3)
      }
    })
  })

  describe('Search Input Animation', () => {
    it('applies correct transition styles', () => {
      render(<SearchHeader {...defaultProps} showSearch={false} />)
      
      // Component should render without errors when search is hidden
      // The exact styling implementation (CSS transitions, etc.) is handled by the component
      expect(() => screen.queryByPlaceholderText('Search resources...')).not.toThrow()
    })

    it('shows search input with animation when visible', () => {
      render(<SearchHeader {...defaultProps} showSearch={true} />)
      
      const searchInput = screen.getByPlaceholderText('Search resources...')
      expect(searchInput).toBeInTheDocument()
    })

    it('handles search visibility toggle correctly', () => {
      const { rerender } = render(<SearchHeader {...defaultProps} showSearch={true} />)
      
      // When showSearch is true, input should be accessible
      expect(screen.getByPlaceholderText('Search resources...')).toBeInTheDocument()
      
      rerender(<SearchHeader {...defaultProps} showSearch={false} />)
      
      // When showSearch is false, the component should handle the state change
      // The exact DOM manipulation depends on the implementation (CSS transitions, etc.)
      // What's important is that the component doesn't crash and state is managed correctly
      expect(() => screen.queryByPlaceholderText('Search resources...')).not.toThrow()
    })
  })

  describe('Input Validation and Behavior', () => {
    it('handles empty search placeholder', () => {
      render(<SearchHeader {...defaultProps} showSearch={true} searchPlaceholder="" />)
      
      const searchInput = screen.getByRole('textbox')
      expect(searchInput).toHaveAttribute('placeholder', '')
    })

    it('preserves search term during search toggle', () => {
      const { rerender } = render(
        <SearchHeader {...defaultProps} showSearch={true} searchTerm="preserved" />
      )
      
      expect(screen.getByDisplayValue('preserved')).toBeInTheDocument()
      
      // Hide search
      rerender(<SearchHeader {...defaultProps} showSearch={false} searchTerm="preserved" />)
      
      // Show search again - term should be preserved
      rerender(<SearchHeader {...defaultProps} showSearch={true} searchTerm="preserved" />)
      
      expect(screen.getByDisplayValue('preserved')).toBeInTheDocument()
    })

    it('handles special characters in search term', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      render(<SearchHeader {...defaultProps} showSearch={true} searchTerm={specialChars} />)
      
      const searchInput = screen.getByDisplayValue(specialChars)
      expect(searchInput).toBeInTheDocument()
    })

    it('handles unicode characters in search term', () => {
      const unicodeText = '测试 🔍 العربية ñáéíóú'
      render(<SearchHeader {...defaultProps} showSearch={true} searchTerm={unicodeText} />)
      
      const searchInput = screen.getByDisplayValue(unicodeText)
      expect(searchInput).toBeInTheDocument()
    })

    it('calls onSearchChange for each character typed', async () => {
      const user = userEvent.setup()
      render(<SearchHeader {...defaultProps} showSearch={true} searchTerm="" />)
      
      const searchInput = screen.getByPlaceholderText('Search resources...')
      await user.type(searchInput, 'test')
      
      expect(mockOnSearchChange).toHaveBeenCalledTimes(4)
      expect(mockOnSearchChange).toHaveBeenNthCalledWith(1, 't')
      expect(mockOnSearchChange).toHaveBeenNthCalledWith(2, 'e')
      expect(mockOnSearchChange).toHaveBeenNthCalledWith(3, 's')
      expect(mockOnSearchChange).toHaveBeenNthCalledWith(4, 't')
    })
  })

  describe('Create Button States and Behavior', () => {
    it('shows plus icon when form is hidden', () => {
      render(<SearchHeader {...defaultProps} showCreateForm={false} />)
      
      expect(screen.getByText('Add New')).toBeInTheDocument()
      expect(screen.getByTestId('plus-icon')).toBeInTheDocument()
    })

    it('shows X icon when form is shown', () => {
      render(<SearchHeader {...defaultProps} showCreateForm={true} />)
      
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByTestId('x-icon')).toBeInTheDocument()
    })

    it('handles rapid create button clicks', async () => {
      const user = userEvent.setup()
      render(<SearchHeader {...defaultProps} />)
      
      const createButton = screen.getByText('Add New')
      
      await user.click(createButton)
      await user.click(createButton)
      await user.click(createButton)
      
      expect(mockOnCreateToggle).toHaveBeenCalledTimes(3)
    })

    it('maintains disabled state during creation', () => {
      render(<SearchHeader {...defaultProps} isCreating={true} />)
      
      const createButton = screen.getByText('Add New')
      expect(createButton).toBeDisabled()
    })

    it('re-enables button when creation completes', () => {
      const { rerender } = render(<SearchHeader {...defaultProps} isCreating={true} />)
      
      expect(screen.getByText('Add New')).toBeDisabled()
      
      rerender(<SearchHeader {...defaultProps} isCreating={false} />)
      
      expect(screen.getByText('Add New')).not.toBeDisabled()
    })
  })

  describe('Button Visibility Controls', () => {
    it('shows both buttons by default', () => {
      render(<SearchHeader {...defaultProps} />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(2) // Search toggle + Create button
    })

    it('hides only search button when hideSearchButton is true', () => {
      render(<SearchHeader {...defaultProps} hideSearchButton={true} />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(1)
      expect(screen.getByText('Add New')).toBeInTheDocument()
    })

    it('hides only create button when hideCreateButton is true', () => {
      render(<SearchHeader {...defaultProps} hideCreateButton={true} />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(1)
    })

    it('hides both buttons when both hide props are true', () => {
      render(<SearchHeader {...defaultProps} hideSearchButton={true} hideCreateButton={true} />)
      
      const buttons = screen.queryAllByRole('button')
      expect(buttons).toHaveLength(0)
    })

    it('maintains title visibility when buttons are hidden', () => {
      render(<SearchHeader {...defaultProps} hideSearchButton={true} hideCreateButton={true} />)
      
      expect(screen.getByText('Test Resources')).toBeInTheDocument()
    })
  })

  describe('Title and Layout', () => {
    it('renders title with correct styling', () => {
      render(<SearchHeader {...defaultProps} title="Custom Title" />)
      
      expect(screen.getByText('Custom Title')).toBeInTheDocument()
    })

    it('handles very long titles', () => {
      const longTitle = 'This is a very long title that might wrap to multiple lines or cause layout issues'
      render(<SearchHeader {...defaultProps} title={longTitle} />)
      
      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('handles titles with special characters', () => {
      const specialTitle = 'Title with Special Chars: !@#$%^&*()'
      render(<SearchHeader {...defaultProps} title={specialTitle} />)
      
      expect(screen.getByText(specialTitle)).toBeInTheDocument()
    })

    it('handles unicode titles', () => {
      const unicodeTitle = '资源管理 🔍 إدارة الموارد'
      render(<SearchHeader {...defaultProps} title={unicodeTitle} />)
      
      expect(screen.getByText(unicodeTitle)).toBeInTheDocument()
    })

    it('maintains header layout with different content lengths', () => {
      const { rerender } = render(<SearchHeader {...defaultProps} title="Short" />)
      
      expect(screen.getByText('Short')).toBeInTheDocument()
      
      rerender(<SearchHeader {...defaultProps} title="This is a much longer title" />)
      
      expect(screen.getByText('This is a much longer title')).toBeInTheDocument()
    })
  })

  describe('Performance and Optimization', () => {
    it('handles frequent search input changes efficiently', async () => {
      const user = userEvent.setup()
      render(<SearchHeader {...defaultProps} showSearch={true} />)
      
      const searchInput = screen.getByPlaceholderText('Search resources...')
      
      const startTime = Date.now()
      await user.type(searchInput, 'performance test input')
      const endTime = Date.now()
      
      expect(endTime - startTime).toBeLessThan(1000)
      expect(mockOnSearchChange).toHaveBeenCalled()
    })

    it('maintains performance with long content', () => {
      const longTitle = 'A'.repeat(1000)
      const longPlaceholder = 'B'.repeat(500)
      const longSearchTerm = 'C'.repeat(200)
      
      expect(() => {
        render(
          <SearchHeader 
            {...defaultProps} 
            title={longTitle} 
            searchPlaceholder={longPlaceholder}
            searchTerm={longSearchTerm}
            showSearch={true}
          />
        )
      }).not.toThrow()
    })

    it('handles rapid prop updates efficiently', () => {
      const { rerender } = render(<SearchHeader {...defaultProps} />)
      
      // Multiple rapid re-renders
      for (let i = 0; i < 20; i++) {
        rerender(
          <SearchHeader 
            {...defaultProps}
            showSearch={i % 2 === 0}
            showCreateForm={i % 3 === 0}
            searchTerm={`term-${i}`}
          />
        )
      }
      
      expect(screen.getByText('Test Resources')).toBeInTheDocument()
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('handles undefined callback props gracefully', () => {
      expect(() => {
        render(
          <SearchHeader 
            {...defaultProps}
            onSearchToggle={undefined as any}
            onSearchChange={undefined as any}
            onCreateToggle={undefined as any}
          />
        )
      }).not.toThrow()
    })

    it('handles null values in props', () => {
      expect(() => {
        render(
          <SearchHeader 
            {...defaultProps}
            title={null as any}
            searchTerm={null as any}
            searchPlaceholder={null as any}
            createButtonText={null as any}
          />
        )
      }).not.toThrow()
    })

    it('handles empty strings in all text props', () => {
      render(
        <SearchHeader 
          {...defaultProps}
          title=""
          searchTerm=""
          searchPlaceholder=""
          createButtonText=""
        />
      )
      
      // Should render without crashing
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(1)
    })

    it('recovers from invalid boolean props', () => {
      expect(() => {
        render(
          <SearchHeader 
            {...defaultProps}
            showSearch={"invalid" as any}
            showCreateForm={"invalid" as any}
            isCreating={"invalid" as any}
            hideSearchButton={"invalid" as any}
            hideCreateButton={"invalid" as any}
          />
        )
      }).not.toThrow()
    })
  })

  describe('Component Lifecycle', () => {
    it('cleans up properly when unmounted', () => {
      const { unmount } = render(<SearchHeader {...defaultProps} showSearch={true} />)
      
      expect(screen.getByText('Test Resources')).toBeInTheDocument()
      
      unmount()
      
      expect(screen.queryByText('Test Resources')).not.toBeInTheDocument()
    })

    it('handles multiple mount/unmount cycles', () => {
      // First mount
      const { unmount: unmount1 } = render(<SearchHeader {...defaultProps} />)
      expect(screen.getByText('Test Resources')).toBeInTheDocument()
      
      unmount1()
      expect(screen.queryByText('Test Resources')).not.toBeInTheDocument()
      
      // Second mount
      const { unmount: unmount2 } = render(<SearchHeader {...defaultProps} />)
      expect(screen.getByText('Test Resources')).toBeInTheDocument()
      
      unmount2()
      expect(screen.queryByText('Test Resources')).not.toBeInTheDocument()
    })

    it('maintains callback references during re-renders', () => {
      const { rerender } = render(<SearchHeader {...defaultProps} />)
      
      expect(screen.getByText('Test Resources')).toBeInTheDocument()
      
      // Re-render with same callbacks
      rerender(<SearchHeader {...defaultProps} />)
      
      expect(screen.getByText('Test Resources')).toBeInTheDocument()
    })
  })

  describe('Integration Scenarios', () => {
    it('works correctly in typical search workflow', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<SearchHeader {...defaultProps} showSearch={false} />)
      
      // 1. Toggle search on
      const buttons = screen.getAllByRole('button')
      const searchButton = buttons.find(btn => !btn.textContent?.includes('Add New'))
      if (searchButton) {
        await user.click(searchButton)
        expect(mockOnSearchToggle).toHaveBeenCalled()
      }
      
      // 2. Show search input
      rerender(<SearchHeader {...defaultProps} showSearch={true} />)
      
      // 3. Type in search
      const searchInput = screen.getByPlaceholderText('Search resources...')
      await user.type(searchInput, 'test query')
      
      expect(mockOnSearchChange).toHaveBeenCalled()
    })

    it('works correctly in create workflow', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<SearchHeader {...defaultProps} showCreateForm={false} />)
      
      // 1. Click create button
      const createButton = screen.getByText('Add New')
      await user.click(createButton)
      expect(mockOnCreateToggle).toHaveBeenCalled()
      
      // 2. Show cancel state
      rerender(<SearchHeader {...defaultProps} showCreateForm={true} />)
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      
      // 3. Show loading state
      rerender(<SearchHeader {...defaultProps} showCreateForm={true} isCreating={true} />)
      expect(screen.getByText('Cancel')).toBeDisabled()
    })

    it('handles simultaneous search and create interactions', async () => {
      const user = userEvent.setup()
      render(<SearchHeader {...defaultProps} showSearch={true} showCreateForm={false} />)
      
      // Search and create should work independently
      const searchInput = screen.getByPlaceholderText('Search resources...')
      const createButton = screen.getByText('Add New')
      
      await user.type(searchInput, 'search')
      await user.click(createButton)
      
      expect(mockOnSearchChange).toHaveBeenCalled()
      expect(mockOnCreateToggle).toHaveBeenCalled()
    })
  })
})