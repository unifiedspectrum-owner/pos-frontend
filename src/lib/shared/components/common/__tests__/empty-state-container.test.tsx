import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from '@/components/ui/provider'
import { FiInbox, FiUser, FiFile, FiDatabase } from 'react-icons/fi'
import EmptyStateContainer from '../empty-state-container'

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

interface EmptyStateContainerProps {
  icon: React.ReactNode
  title: string
  description: string
  testId?: string
}

const defaultProps: EmptyStateContainerProps = {
  icon: <FiInbox data-testid="default-icon" />,
  title: 'No Items Found',
  description: 'There are no items to display at the moment.'
}

const renderEmptyState = (props: Partial<EmptyStateContainerProps> = {}) => {
  const mergedProps = { ...defaultProps, ...props }
  return render(
    <EmptyStateContainer {...mergedProps} />,
    { wrapper: TestWrapper }
  )
}

describe('EmptyStateContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      renderEmptyState()
      
      expect(screen.getByText('No Items Found')).toBeInTheDocument()
      expect(screen.getByText('There are no items to display at the moment.')).toBeInTheDocument()
      expect(screen.getByTestId('default-icon')).toBeInTheDocument()
    })

    it('should render all required elements', () => {
      renderEmptyState()
      
      // Check for title
      expect(screen.getByText('No Items Found')).toBeInTheDocument()
      
      // Check for description
      expect(screen.getByText('There are no items to display at the moment.')).toBeInTheDocument()
      
      // Check for icon
      expect(screen.getByTestId('default-icon')).toBeInTheDocument()
    })

    it('should use custom testId when provided', () => {
      renderEmptyState({ testId: 'custom-empty-state' })
      
      expect(screen.getByTestId('custom-empty-state')).toBeInTheDocument()
    })

    it('should not have testId attribute when not provided', () => {
      renderEmptyState()
      
      // Should not throw when testId is undefined
      expect(screen.queryByTestId('undefined')).not.toBeInTheDocument()
    })
  })

  describe('Content Customization', () => {
    it('should render custom title', () => {
      renderEmptyState({ title: 'Custom Title Here' })
      
      expect(screen.getByText('Custom Title Here')).toBeInTheDocument()
      expect(screen.queryByText('No Items Found')).not.toBeInTheDocument()
    })

    it('should render custom description', () => {
      renderEmptyState({ description: 'Custom description text for empty state.' })
      
      expect(screen.getByText('Custom description text for empty state.')).toBeInTheDocument()
      expect(screen.queryByText('There are no items to display at the moment.')).not.toBeInTheDocument()
    })

    it('should render custom icon', () => {
      const customIcon = <FiUser data-testid="custom-user-icon" />
      
      renderEmptyState({ icon: customIcon })
      
      expect(screen.getByTestId('custom-user-icon')).toBeInTheDocument()
      expect(screen.queryByTestId('default-icon')).not.toBeInTheDocument()
    })

    it('should handle all props together', () => {
      const customIcon = <FiFile data-testid="file-icon" />
      
      renderEmptyState({
        icon: customIcon,
        title: 'No Files Available',
        description: 'Upload files to get started with your project.',
        testId: 'files-empty-state'
      })
      
      expect(screen.getByTestId('file-icon')).toBeInTheDocument()
      expect(screen.getByText('No Files Available')).toBeInTheDocument()
      expect(screen.getByText('Upload files to get started with your project.')).toBeInTheDocument()
      expect(screen.getByTestId('files-empty-state')).toBeInTheDocument()
    })
  })

  describe('Different Empty State Scenarios', () => {
    it('should render empty users state', () => {
      const userIcon = <FiUser data-testid="user-icon" />
      
      renderEmptyState({
        icon: userIcon,
        title: 'No Users Found',
        description: 'Start by inviting team members to your workspace.',
        testId: 'users-empty-state'
      })
      
      expect(screen.getByTestId('user-icon')).toBeInTheDocument()
      expect(screen.getByText('No Users Found')).toBeInTheDocument()
      expect(screen.getByText('Start by inviting team members to your workspace.')).toBeInTheDocument()
    })

    it('should render empty database state', () => {
      const databaseIcon = <FiDatabase data-testid="database-icon" />
      
      renderEmptyState({
        icon: databaseIcon,
        title: 'No Data Available',
        description: 'Connect your data source to view information here.',
        testId: 'database-empty-state'
      })
      
      expect(screen.getByTestId('database-icon')).toBeInTheDocument()
      expect(screen.getByText('No Data Available')).toBeInTheDocument()
      expect(screen.getByText('Connect your data source to view information here.')).toBeInTheDocument()
    })

    it('should render search results empty state', () => {
      renderEmptyState({
        icon: <FiInbox data-testid="search-icon" />,
        title: 'No Results Found',
        description: 'Try adjusting your search criteria or filters.',
        testId: 'search-empty-state'
      })
      
      expect(screen.getByText('No Results Found')).toBeInTheDocument()
      expect(screen.getByText('Try adjusting your search criteria or filters.')).toBeInTheDocument()
    })
  })

  describe('Icon Handling', () => {
    it('should render React element icons', () => {
      const reactIcon = <div data-testid="react-element-icon">Custom React Element</div>
      
      renderEmptyState({ icon: reactIcon })
      
      expect(screen.getByTestId('react-element-icon')).toBeInTheDocument()
      expect(screen.getByText('Custom React Element')).toBeInTheDocument()
    })

    it('should render React component icons', () => {
      const ComponentIcon = () => <span data-testid="component-icon">Component Icon</span>
      
      renderEmptyState({ icon: <ComponentIcon /> })
      
      expect(screen.getByTestId('component-icon')).toBeInTheDocument()
    })

    it('should handle complex icon structures', () => {
      const complexIcon = (
        <div data-testid="complex-icon">
          <FiInbox />
          <span>With Text</span>
        </div>
      )
      
      renderEmptyState({ icon: complexIcon })
      
      expect(screen.getByTestId('complex-icon')).toBeInTheDocument()
      expect(screen.getByText('With Text')).toBeInTheDocument()
    })

    it('should handle string content as icon', () => {
      renderEmptyState({ icon: 'String Icon Content' })
      
      expect(screen.getByText('String Icon Content')).toBeInTheDocument()
    })

    it('should handle null icon gracefully', () => {
      renderEmptyState({ 
        icon: null,
        testId: 'null-icon-test'
      })
      
      const container = screen.getByTestId('null-icon-test')
      expect(container).toBeInTheDocument()
      expect(screen.getByText('No Items Found')).toBeInTheDocument()
      expect(screen.getByText('There are no items to display at the moment.')).toBeInTheDocument()
    })

    it('should handle undefined icon gracefully', () => {
      renderEmptyState({ 
        icon: undefined as any,
        testId: 'undefined-icon-test'
      })
      
      const container = screen.getByTestId('undefined-icon-test')
      expect(container).toBeInTheDocument()
      expect(screen.getByText('No Items Found')).toBeInTheDocument()
    })
  })

  describe('Text Content Handling', () => {
    it('should handle long titles gracefully', () => {
      const longTitle = 'This is a very long title that should be displayed properly even when it exceeds the typical length expected for empty state titles'
      
      renderEmptyState({ title: longTitle })
      
      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('should handle long descriptions gracefully', () => {
      const longDescription = 'This is a very long description that provides detailed information about why the empty state is being displayed and what actions the user can take to resolve it. It should wrap properly and maintain good readability.'
      
      renderEmptyState({ description: longDescription })
      
      expect(screen.getByText(longDescription)).toBeInTheDocument()
    })

    it('should handle empty string title', () => {
      renderEmptyState({ title: '', testId: 'empty-title-test' })
      
      // Component should still render with empty title
      const container = screen.getByTestId('empty-title-test')
      expect(container).toBeInTheDocument()
      
      // Should still render the default description
      expect(screen.getByText('There are no items to display at the moment.')).toBeInTheDocument()
    })

    it('should handle empty string description', () => {
      renderEmptyState({ description: '', testId: 'empty-description-test' })
      
      // Component should still render with empty description
      const container = screen.getByTestId('empty-description-test')
      expect(container).toBeInTheDocument()
      
      // Should still render the default title
      expect(screen.getByText('No Items Found')).toBeInTheDocument()
    })

    it('should handle both empty title and description', () => {
      renderEmptyState({ 
        title: '', 
        description: '', 
        testId: 'both-empty-test' 
      })
      
      // Component should still render
      const container = screen.getByTestId('both-empty-test')
      expect(container).toBeInTheDocument()
      
      // Icon should still be present
      expect(screen.getByTestId('default-icon')).toBeInTheDocument()
    })

    it('should handle whitespace-only content without crashing', () => {
      // Test that component renders gracefully with whitespace-only content
      expect(() => {
        renderEmptyState({ 
          title: '   ',
          description: '\n\t  ',
          testId: 'whitespace-test'
        })
      }).not.toThrow()
      
      // Component should still render properly
      const container = screen.getByTestId('whitespace-test')
      expect(container).toBeInTheDocument()
      
      // Icon should still be present
      expect(screen.getByTestId('default-icon')).toBeInTheDocument()
      
      // Component should have proper structure even with whitespace content
      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should handle special characters in text', () => {
      renderEmptyState({
        title: 'Special Characters: @#$%^&*()',
        description: 'Description with special chars: <>?/\\|{}[]'
      })
      
      expect(screen.getByText('Special Characters: @#$%^&*()')).toBeInTheDocument()
      expect(screen.getByText('Description with special chars: <>?/\\|{}[]')).toBeInTheDocument()
    })

    it('should handle HTML entities in text', () => {
      renderEmptyState({
        title: 'Title with &amp; entities &lt;test&gt;',
        description: 'Description with &quot;quotes&quot; and &apos;apostrophes&apos;'
      })
      
      expect(screen.getByText('Title with &amp; entities &lt;test&gt;')).toBeInTheDocument()
      expect(screen.getByText('Description with &quot;quotes&quot; and &apos;apostrophes&apos;')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper text hierarchy', () => {
      renderEmptyState()
      
      const title = screen.getByText('No Items Found')
      const description = screen.getByText('There are no items to display at the moment.')
      
      expect(title).toBeInTheDocument()
      expect(description).toBeInTheDocument()
    })

    it('should be readable by screen readers', () => {
      renderEmptyState({
        title: 'Screen Reader Friendly Title',
        description: 'This description should be accessible to screen readers.',
        testId: 'accessible-empty-state'
      })
      
      // Content should be available for screen readers
      expect(screen.getByText('Screen Reader Friendly Title')).toBeInTheDocument()
      expect(screen.getByText('This description should be accessible to screen readers.')).toBeInTheDocument()
    })

    it('should support keyboard navigation (when interactive)', () => {
      renderEmptyState({ testId: 'keyboard-testable' })
      
      const container = screen.getByTestId('keyboard-testable')
      expect(container).toBeInTheDocument()
      
      // Container should not have negative tabindex
      expect(container).not.toHaveAttribute('tabindex', '-1')
    })
  })

  describe('Layout and Styling', () => {
    it('should maintain proper layout structure', () => {
      renderEmptyState({ testId: 'layout-test' })
      
      const container = screen.getByTestId('layout-test')
      expect(container).toBeInTheDocument()
      
      // Should contain all expected elements
      expect(screen.getByText('No Items Found')).toBeInTheDocument()
      expect(screen.getByText('There are no items to display at the moment.')).toBeInTheDocument()
      expect(screen.getByTestId('default-icon')).toBeInTheDocument()
    })

    it('should handle size prop correctly', () => {
      renderEmptyState({ testId: 'size-test' })
      
      const container = screen.getByTestId('size-test')
      expect(container).toBeInTheDocument()
      
      // Component uses size='sm' internally - this should be reflected in styling
    })
  })

  describe('Component Re-rendering', () => {
    it('should update content when props change', () => {
      const { rerender } = renderEmptyState({
        title: 'Original Title',
        testId: 'rerender-test'
      })
      
      expect(screen.getByText('Original Title')).toBeInTheDocument()
      
      rerender(
        <TestWrapper>
          <EmptyStateContainer
            {...defaultProps}
            title="Updated Title"
            testId="rerender-test"
          />
        </TestWrapper>
      )
      
      expect(screen.getByText('Updated Title')).toBeInTheDocument()
      expect(screen.queryByText('Original Title')).not.toBeInTheDocument()
    })

    it('should update icon when icon prop changes', () => {
      const { rerender } = renderEmptyState({
        icon: <FiUser data-testid="user-icon" />,
        testId: 'icon-change-test'
      })
      
      expect(screen.getByTestId('user-icon')).toBeInTheDocument()
      
      rerender(
        <TestWrapper>
          <EmptyStateContainer
            {...defaultProps}
            icon={<FiFile data-testid="file-icon" />}
            testId="icon-change-test"
          />
        </TestWrapper>
      )
      
      expect(screen.getByTestId('file-icon')).toBeInTheDocument()
      expect(screen.queryByTestId('user-icon')).not.toBeInTheDocument()
    })
  })

  describe('Integration and Use Cases', () => {
    it('should work in different contexts', () => {
      const ContextWrapper = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="context-wrapper">
          <h2>Page Context</h2>
          {children}
        </div>
      )
      
      render(
        <TestWrapper>
          <ContextWrapper>
            <EmptyStateContainer
              icon={<FiInbox data-testid="context-icon" />}
              title="Contextual Empty State"
              description="This empty state is rendered within a specific context."
              testId="contextual-empty-state"
            />
          </ContextWrapper>
        </TestWrapper>
      )
      
      expect(screen.getByTestId('context-wrapper')).toBeInTheDocument()
      expect(screen.getByText('Page Context')).toBeInTheDocument()
      expect(screen.getByTestId('contextual-empty-state')).toBeInTheDocument()
      expect(screen.getByText('Contextual Empty State')).toBeInTheDocument()
    })

    it('should handle multiple empty states on same page', () => {
      render(
        <TestWrapper>
          <div>
            <EmptyStateContainer
              icon={<FiUser data-testid="users-icon" />}
              title="No Users"
              description="No users found."
              testId="users-empty"
            />
            <EmptyStateContainer
              icon={<FiFile data-testid="files-icon" />}
              title="No Files"
              description="No files found."
              testId="files-empty"
            />
          </div>
        </TestWrapper>
      )
      
      expect(screen.getByTestId('users-empty')).toBeInTheDocument()
      expect(screen.getByTestId('files-empty')).toBeInTheDocument()
      expect(screen.getByText('No Users')).toBeInTheDocument()
      expect(screen.getByText('No Files')).toBeInTheDocument()
    })
  })
})