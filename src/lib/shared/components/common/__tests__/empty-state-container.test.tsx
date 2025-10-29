/* Libraries imports */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

/* Shared module imports */
import { Provider } from '@/components/ui/provider'

/* Component imports */
import EmptyStateContainer from '../empty-state-container'

/* Test wrapper with Chakra Provider */
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>{children}</Provider>
)

describe('EmptyStateContainer Component', () => {
  describe('Basic Rendering', () => {
    it('should render with required props', () => {
      render(
        <EmptyStateContainer
          icon={<div data-testid="test-icon">Icon</div>}
          title="No Data"
          description="No data available"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('No Data')).toBeInTheDocument()
      expect(screen.getByText('No data available')).toBeInTheDocument()
      expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    })

    it('should render icon element', () => {
      const icon = <span data-testid="custom-icon">📦</span>

      render(
        <EmptyStateContainer
          icon={icon}
          title="Empty"
          description="Nothing here"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
    })

    it('should render title text', () => {
      render(
        <EmptyStateContainer
          icon={<div>Icon</div>}
          title="No Items Found"
          description="Description"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('No Items Found')).toBeInTheDocument()
    })

    it('should render description text', () => {
      render(
        <EmptyStateContainer
          icon={<div>Icon</div>}
          title="Title"
          description="Please add items to get started"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Please add items to get started')).toBeInTheDocument()
    })
  })

  describe('Test ID', () => {
    it('should apply custom testId when provided', () => {
      render(
        <EmptyStateContainer
          icon={<div>Icon</div>}
          title="Title"
          description="Description"
          testId="custom-empty-state"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('custom-empty-state')).toBeInTheDocument()
    })

    it('should work without testId', () => {
      const { container } = render(
        <EmptyStateContainer
          icon={<div>Icon</div>}
          title="Title"
          description="Description"
        />,
        { wrapper: TestWrapper }
      )

      /* Component should render successfully without testId */
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Content Variations', () => {
    it('should render with short title', () => {
      render(
        <EmptyStateContainer
          icon={<div>Icon</div>}
          title="Empty"
          description="Description"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Empty')).toBeInTheDocument()
    })

    it('should render with long title', () => {
      const longTitle = 'This is a very long title that describes the empty state in detail'

      render(
        <EmptyStateContainer
          icon={<div>Icon</div>}
          title={longTitle}
          description="Description"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('should render with short description', () => {
      render(
        <EmptyStateContainer
          icon={<div>Icon</div>}
          title="Title"
          description="Empty"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Empty')).toBeInTheDocument()
    })

    it('should render with long description', () => {
      const longDescription = 'This is a very long description that provides detailed information about why the state is empty and what the user can do about it'

      render(
        <EmptyStateContainer
          icon={<div>Icon</div>}
          title="Title"
          description={longDescription}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText(longDescription)).toBeInTheDocument()
    })

    it('should render with multiline description', () => {
      const multilineDescription = 'Line one\nLine two\nLine three'

      render(
        <EmptyStateContainer
          icon={<div>Icon</div>}
          title="Title"
          description={multilineDescription}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText((content, element) => {
        return element?.textContent === multilineDescription
      })).toBeInTheDocument()
    })
  })

  describe('Icon Variations', () => {
    it('should render with React Icon component', () => {
      const IconComponent = () => <svg data-testid="svg-icon"><circle /></svg>

      render(
        <EmptyStateContainer
          icon={<IconComponent />}
          title="Title"
          description="Description"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('svg-icon')).toBeInTheDocument()
    })

    it('should render with emoji icon', () => {
      render(
        <EmptyStateContainer
          icon={<span>📭</span>}
          title="Title"
          description="Description"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('📭')).toBeInTheDocument()
    })

    it('should render with custom styled icon', () => {
      const StyledIcon = () => (
        <div
          data-testid="styled-icon"
          style={{ color: 'red', fontSize: '48px' }}
        >
          ⚠️
        </div>
      )

      render(
        <EmptyStateContainer
          icon={<StyledIcon />}
          title="Title"
          description="Description"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('styled-icon')).toBeInTheDocument()
    })

    it('should render with image as icon', () => {
      render(
        <EmptyStateContainer
          icon={<img src="/empty.png" alt="Empty" data-testid="img-icon" />}
          title="Title"
          description="Description"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('img-icon')).toBeInTheDocument()
    })
  })

  describe('Use Cases', () => {
    it('should render empty users state', () => {
      render(
        <EmptyStateContainer
          icon={<div>👥</div>}
          title="No Users Found"
          description="Start by adding your first user to the system"
          testId="empty-users"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('empty-users')).toBeInTheDocument()
      expect(screen.getByText('No Users Found')).toBeInTheDocument()
    })

    it('should render empty roles state', () => {
      render(
        <EmptyStateContainer
          icon={<div>🔐</div>}
          title="No Roles Available"
          description="Create roles to manage user permissions"
          testId="empty-roles"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('empty-roles')).toBeInTheDocument()
      expect(screen.getByText('No Roles Available')).toBeInTheDocument()
    })

    it('should render empty plans state', () => {
      render(
        <EmptyStateContainer
          icon={<div>📋</div>}
          title="No Plans Created"
          description="Add subscription plans for your tenants"
          testId="empty-plans"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('empty-plans')).toBeInTheDocument()
      expect(screen.getByText('No Plans Created')).toBeInTheDocument()
    })

    it('should render empty tickets state', () => {
      render(
        <EmptyStateContainer
          icon={<div>🎫</div>}
          title="No Support Tickets"
          description="All caught up! No open tickets at the moment"
          testId="empty-tickets"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('empty-tickets')).toBeInTheDocument()
      expect(screen.getByText('No Support Tickets')).toBeInTheDocument()
    })

    it('should render search no results state', () => {
      render(
        <EmptyStateContainer
          icon={<div>🔍</div>}
          title="No Results Found"
          description="Try adjusting your search criteria"
          testId="no-search-results"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('no-search-results')).toBeInTheDocument()
      expect(screen.getByText('No Results Found')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      render(
        <EmptyStateContainer
          icon={<div>Icon</div>}
          title=""
          description="Description"
        />,
        { wrapper: TestWrapper }
      )

      /* Empty title should still render the element */
      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('should handle empty description', () => {
      render(
        <EmptyStateContainer
          icon={<div>Icon</div>}
          title="Title"
          description=""
        />,
        { wrapper: TestWrapper }
      )

      /* Empty description should still render the element */
      expect(screen.getByText('Title')).toBeInTheDocument()
    })

    it('should handle special characters in title', () => {
      render(
        <EmptyStateContainer
          icon={<div>Icon</div>}
          title="No Data <>&"
          description="Description"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('No Data <>&')).toBeInTheDocument()
    })

    it('should handle special characters in description', () => {
      render(
        <EmptyStateContainer
          icon={<div>Icon</div>}
          title="Title"
          description="Contact support@example.com for help"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Contact support@example.com for help')).toBeInTheDocument()
    })

    it('should handle null icon gracefully', () => {
      render(
        <EmptyStateContainer
          icon={null}
          title="Title"
          description="Description"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Title')).toBeInTheDocument()
    })

    it('should handle complex icon with nested elements', () => {
      const ComplexIcon = () => (
        <div data-testid="complex-icon">
          <div>
            <span>Icon</span>
          </div>
        </div>
      )

      render(
        <EmptyStateContainer
          icon={<ComplexIcon />}
          title="Title"
          description="Description"
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('complex-icon')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should render semantic HTML structure', () => {
      const { container } = render(
        <EmptyStateContainer
          icon={<div>Icon</div>}
          title="Title"
          description="Description"
        />,
        { wrapper: TestWrapper }
      )

      /* Should contain proper box structure */
      expect(container.querySelector('div')).toBeInTheDocument()
    })

    it('should maintain text hierarchy', () => {
      render(
        <EmptyStateContainer
          icon={<div>Icon</div>}
          title="Main Title"
          description="Secondary Description"
        />,
        { wrapper: TestWrapper }
      )

      /* Title and description should both be present */
      expect(screen.getByText('Main Title')).toBeInTheDocument()
      expect(screen.getByText('Secondary Description')).toBeInTheDocument()
    })
  })
})
