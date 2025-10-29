/* Comprehensive test suite for FeaturesGrid component */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'
import React from 'react'

/* Plan module imports */
import FeaturesGrid from '@plan-management/forms/tabs/components/features/features-grid'
import { Feature } from '@plan-management/types'

/* Mock ResourceGridSkeleton component */
vi.mock('@plan-management/components', () => ({
  ResourceGridSkeleton: ({ count, columns, variant, minHeight }: {
    count: number;
    columns: number;
    variant: string;
    minHeight: string;
  }) => (
    <div data-testid="resource-grid-skeleton" data-count={count} data-columns={columns} data-variant={variant} data-minheight={minHeight}>
      Loading skeleton...
    </div>
  )
}))

/* Mock EmptyStateContainer component */
vi.mock('@shared/components', () => ({
  EmptyStateContainer: ({ icon, title, description, testId }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    testId: string;
  }) => (
    <div data-testid={testId}>
      <div data-testid="empty-state-icon">{icon}</div>
      <div data-testid="empty-state-title">{title}</div>
      <div data-testid="empty-state-description">{description}</div>
    </div>
  )
}))

/* Mock Chakra UI components */
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react')
  return {
    ...actual as Record<string, unknown>,
    SimpleGrid: ({ children, columns, gap }: { children: React.ReactNode; columns: number; gap: number }) => (
      <div data-testid="simple-grid" data-columns={columns} data-gap={gap}>{children}</div>
    ),
    GridItem: ({ children, h }: { children: React.ReactNode; h: string }) => (
      <div data-testid="grid-item" data-h={h}>{children}</div>
    ),
    Box: ({ children, onClick, cursor, borderColor, bg, p, borderWidth, w, ...props }: {
      children: React.ReactNode;
      onClick?: () => void;
      cursor?: string;
      borderColor?: string;
      bg?: string;
      p?: number;
      borderWidth?: number;
      borderRadius?: string;
      transition?: string;
      position?: string;
      h?: string;
      minH?: string;
      display?: string;
      flexDirection?: string;
      shadow?: string;
      w?: string;
      _hover?: Record<string, unknown>;
    }) => {
      /* Distinguish between feature card (has onClick, cursor, p=4, borderWidth) and icon container (has w="20px") */
      const isFeatureCard = p === 4 && borderWidth === 1
      const testId = isFeatureCard ? 'feature-card' : 'box'

      return (
        <div data-testid={testId} onClick={onClick} data-cursor={cursor || undefined} data-bordercolor={borderColor} data-bg={bg} {...props}>
          {children}
        </div>
      )
    },
    Flex: ({ children, justifyContent, align, flexDir, gap, flex, minH, flexShrink, ml }: {
      children: React.ReactNode;
      justifyContent?: string;
      align?: string;
      flexDir?: string;
      gap?: number;
      flex?: number;
      minH?: number;
      flexShrink?: number;
      ml?: number;
    }) => (
      <div data-testid="flex" data-justifycontent={justifyContent} data-align={align} data-flexdir={flexDir} data-gap={gap} data-flex={flex} data-minh={minH} data-flexshrink={flexShrink} data-ml={ml}>
        {children}
      </div>
    ),
    Text: ({ children, fontSize, fontWeight, color, lineHeight }: {
      children: React.ReactNode;
      fontSize?: string;
      fontWeight?: string;
      color?: string;
      lineHeight?: string;
    }) => (
      <span data-testid="text" data-fontsize={fontSize} data-fontweight={fontWeight} data-color={color} data-lineheight={lineHeight}>
        {children}
      </span>
    )
  }
})

/* Mock react-icons */
vi.mock('react-icons/md', () => ({
  MdStars: ({ size, color }: { size: number; color: string }) => (
    <div data-testid="md-stars-icon" data-size={size} data-color={color}>Stars Icon</div>
  ),
  MdOutlineCheckBoxOutlineBlank: () => (
    <div data-testid="checkbox-outline-icon">Checkbox Icon</div>
  )
}))

vi.mock('react-icons/fi', () => ({
  FiPlus: () => (
    <div data-testid="plus-icon">Plus Icon</div>
  )
}))

describe('FeaturesGrid', () => {
  const mockHandleToggleWithConfirm = vi.fn()

  const mockFeatures: Feature[] = [
    {
      id: 1,
      name: 'Advanced Reporting',
      description: 'Detailed analytics and custom reports',
      display_order: 1
    },
    {
      id: 2,
      name: 'Multi-User Access',
      description: 'Support for multiple user accounts',
      display_order: 2
    },
    {
      id: 3,
      name: 'API Integration',
      description: 'RESTful API for third-party integrations',
      display_order: 3
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  describe('Loading State', () => {
    it('should render skeleton when loading is true', () => {
      render(
        <FeaturesGrid
          loading={true}
          displayResources={[]}
          selectedFeatureIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('resource-grid-skeleton')).toBeInTheDocument()
      expect(screen.getByText('Loading skeleton...')).toBeInTheDocument()
    })

    it('should render skeleton with correct props', () => {
      render(
        <FeaturesGrid
          loading={true}
          displayResources={[]}
          selectedFeatureIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const skeleton = screen.getByTestId('resource-grid-skeleton')
      expect(skeleton).toHaveAttribute('data-count', '6')
      expect(skeleton).toHaveAttribute('data-columns', '3')
      expect(skeleton).toHaveAttribute('data-variant', 'simple')
      expect(skeleton).toHaveAttribute('data-minheight', '100px')
    })

    it('should not render features when loading', () => {
      render(
        <FeaturesGrid
          loading={true}
          displayResources={mockFeatures}
          selectedFeatureIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByTestId('simple-grid')).not.toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should render empty state in read-only mode when no features', () => {
      render(
        <FeaturesGrid
          loading={false}
          displayResources={[]}
          selectedFeatureIds={[]}
          isReadOnly={true}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('features-empty-state')).toBeInTheDocument()
      expect(screen.getByTestId('empty-state-title')).toHaveTextContent('No features included')
      expect(screen.getByTestId('empty-state-description')).toHaveTextContent('This plan does not include any features')
    })

    it('should render stars icon in empty state', () => {
      render(
        <FeaturesGrid
          loading={false}
          displayResources={[]}
          selectedFeatureIds={[]}
          isReadOnly={true}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('md-stars-icon')).toBeInTheDocument()
    })

    it('should not render empty state in edit mode when no features', () => {
      render(
        <FeaturesGrid
          loading={false}
          displayResources={[]}
          selectedFeatureIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByTestId('features-empty-state')).not.toBeInTheDocument()
    })

    it('should return null in edit mode when no features', () => {
      const { container } = render(
        <FeaturesGrid
          loading={false}
          displayResources={[]}
          selectedFeatureIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      /* Component returns null, so no grid or empty state should be rendered */
      expect(screen.queryByTestId('simple-grid')).not.toBeInTheDocument()
      expect(screen.queryByTestId('features-empty-state')).not.toBeInTheDocument()
    })
  })

  describe('Features Grid Rendering', () => {
    it('should render grid with features', () => {
      render(
        <FeaturesGrid
          loading={false}
          displayResources={mockFeatures}
          selectedFeatureIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('simple-grid')).toBeInTheDocument()
    })

    it('should render grid with correct columns and gap', () => {
      render(
        <FeaturesGrid
          loading={false}
          displayResources={mockFeatures}
          selectedFeatureIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const grid = screen.getByTestId('simple-grid')
      expect(grid).toHaveAttribute('data-columns', '3')
      expect(grid).toHaveAttribute('data-gap', '4')
    })

    it('should render all features', () => {
      render(
        <FeaturesGrid
          loading={false}
          displayResources={mockFeatures}
          selectedFeatureIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const featureCards = screen.getAllByTestId('feature-card')
      expect(featureCards).toHaveLength(3)
    })

    it('should render feature names', () => {
      render(
        <FeaturesGrid
          loading={false}
          displayResources={mockFeatures}
          selectedFeatureIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Advanced Reporting')).toBeInTheDocument()
      expect(screen.getByText('Multi-User Access')).toBeInTheDocument()
      expect(screen.getByText('API Integration')).toBeInTheDocument()
    })

    it('should render feature descriptions', () => {
      render(
        <FeaturesGrid
          loading={false}
          displayResources={mockFeatures}
          selectedFeatureIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Detailed analytics and custom reports')).toBeInTheDocument()
      expect(screen.getByText('Support for multiple user accounts')).toBeInTheDocument()
      expect(screen.getByText('RESTful API for third-party integrations')).toBeInTheDocument()
    })

    it('should render single feature correctly', () => {
      const singleFeature = [mockFeatures[0]]

      render(
        <FeaturesGrid
          loading={false}
          displayResources={singleFeature}
          selectedFeatureIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const featureCards = screen.getAllByTestId('feature-card')
      expect(featureCards).toHaveLength(1)
      expect(screen.getByText('Advanced Reporting')).toBeInTheDocument()
    })
  })

  describe('Feature Selection', () => {
    it('should show checkbox icon for unselected features', () => {
      render(
        <FeaturesGrid
          loading={false}
          displayResources={mockFeatures}
          selectedFeatureIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const checkboxIcons = screen.getAllByTestId('checkbox-outline-icon')
      expect(checkboxIcons).toHaveLength(3)
    })

    it('should show plus icon for selected features', () => {
      render(
        <FeaturesGrid
          loading={false}
          displayResources={mockFeatures}
          selectedFeatureIds={[1, 2]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const plusIcons = screen.getAllByTestId('plus-icon')
      expect(plusIcons).toHaveLength(2)
    })

    it('should show mixed icons for partially selected features', () => {
      render(
        <FeaturesGrid
          loading={false}
          displayResources={mockFeatures}
          selectedFeatureIds={[1]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByTestId('plus-icon')).toHaveLength(1)
      expect(screen.getAllByTestId('checkbox-outline-icon')).toHaveLength(2)
    })

    it('should call handleToggleWithConfirm when feature is clicked', async () => {
      const user = userEvent.setup()

      render(
        <FeaturesGrid
          loading={false}
          displayResources={mockFeatures}
          selectedFeatureIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const featureCards = screen.getAllByTestId('feature-card')
      await user.click(featureCards[0])

      expect(mockHandleToggleWithConfirm).toHaveBeenCalledWith(1)
    })

    it('should call handleToggleWithConfirm with correct feature id', async () => {
      const user = userEvent.setup()

      render(
        <FeaturesGrid
          loading={false}
          displayResources={mockFeatures}
          selectedFeatureIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const featureCards = screen.getAllByTestId('feature-card')
      await user.click(featureCards[0])

      expect(mockHandleToggleWithConfirm).toHaveBeenCalledWith(1)
      expect(mockHandleToggleWithConfirm).toHaveBeenCalledTimes(1)
    })

    it('should handle multiple feature clicks', async () => {
      const user = userEvent.setup()

      render(
        <FeaturesGrid
          loading={false}
          displayResources={mockFeatures}
          selectedFeatureIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const featureCards = screen.getAllByTestId('feature-card')
      await user.click(featureCards[0])
      await user.click(featureCards[1])
      await user.click(featureCards[2])

      expect(mockHandleToggleWithConfirm).toHaveBeenCalledTimes(3)
    })
  })

  describe('Read-Only Mode', () => {
    it('should not show selection icons in read-only mode', () => {
      render(
        <FeaturesGrid
          loading={false}
          displayResources={mockFeatures}
          selectedFeatureIds={[]}
          isReadOnly={true}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByTestId('checkbox-outline-icon')).not.toBeInTheDocument()
      expect(screen.queryByTestId('plus-icon')).not.toBeInTheDocument()
    })

    it('should set cursor to default in read-only mode', () => {
      render(
        <FeaturesGrid
          loading={false}
          displayResources={mockFeatures}
          selectedFeatureIds={[]}
          isReadOnly={true}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const featureCards = screen.getAllByTestId('feature-card')
      featureCards.forEach(card => {
        expect(card).toHaveAttribute('data-cursor', 'default')
      })
    })

    it('should set cursor to pointer in edit mode', () => {
      render(
        <FeaturesGrid
          loading={false}
          displayResources={mockFeatures}
          selectedFeatureIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const featureCards = screen.getAllByTestId('feature-card')
      featureCards.forEach(card => {
        expect(card).toHaveAttribute('data-cursor', 'pointer')
      })
    })

    it('should not call handler when clicked in read-only mode', async () => {
      const user = userEvent.setup()

      render(
        <FeaturesGrid
          loading={false}
          displayResources={mockFeatures}
          selectedFeatureIds={[]}
          isReadOnly={true}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const featureCards = screen.getAllByTestId('feature-card')
      await user.click(featureCards[0])

      expect(mockHandleToggleWithConfirm).not.toHaveBeenCalled()
    })

    it('should render all features in read-only mode', () => {
      render(
        <FeaturesGrid
          loading={false}
          displayResources={mockFeatures}
          selectedFeatureIds={[1, 2, 3]}
          isReadOnly={true}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Advanced Reporting')).toBeInTheDocument()
      expect(screen.getByText('Multi-User Access')).toBeInTheDocument()
      expect(screen.getByText('API Integration')).toBeInTheDocument()
    })
  })

  describe('Visual States', () => {
    it('should apply selected border color to selected features', () => {
      render(
        <FeaturesGrid
          loading={false}
          displayResources={mockFeatures}
          selectedFeatureIds={[1]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const featureCards = screen.getAllByTestId('feature-card')
      expect(featureCards[0]).toHaveAttribute('data-bordercolor')
    })

    it('should apply different background for selected features', () => {
      render(
        <FeaturesGrid
          loading={false}
          displayResources={mockFeatures}
          selectedFeatureIds={[1]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const featureCards = screen.getAllByTestId('feature-card')
      expect(featureCards[0]).toHaveAttribute('data-bg')
    })

    it('should render grid items with full height', () => {
      render(
        <FeaturesGrid
          loading={false}
          displayResources={mockFeatures}
          selectedFeatureIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const gridItems = screen.getAllByTestId('grid-item')
      gridItems.forEach(item => {
        expect(item).toHaveAttribute('data-h', 'full')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty selectedFeatureIds array', () => {
      render(
        <FeaturesGrid
          loading={false}
          displayResources={mockFeatures}
          selectedFeatureIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const checkboxIcons = screen.getAllByTestId('checkbox-outline-icon')
      expect(checkboxIcons).toHaveLength(3)
    })

    it('should handle all features selected', () => {
      render(
        <FeaturesGrid
          loading={false}
          displayResources={mockFeatures}
          selectedFeatureIds={[1, 2, 3]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const plusIcons = screen.getAllByTestId('plus-icon')
      expect(plusIcons).toHaveLength(3)
      expect(screen.queryByTestId('checkbox-outline-icon')).not.toBeInTheDocument()
    })

    it('should handle feature with long name', () => {
      const longNameFeature: Feature[] = [{
        id: 1,
        name: 'This is a very long feature name that should be displayed properly without breaking the layout',
        description: 'Short description',
        display_order: 1
      }]

      render(
        <FeaturesGrid
          loading={false}
          displayResources={longNameFeature}
          selectedFeatureIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('This is a very long feature name that should be displayed properly without breaking the layout')).toBeInTheDocument()
    })

    it('should handle feature with long description', () => {
      const longDescFeature: Feature[] = [{
        id: 1,
        name: 'Feature',
        description: 'This is a very long description that contains multiple sentences and should be displayed properly within the card layout without causing any overflow or layout issues.',
        display_order: 1
      }]

      render(
        <FeaturesGrid
          loading={false}
          displayResources={longDescFeature}
          selectedFeatureIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('This is a very long description that contains multiple sentences and should be displayed properly within the card layout without causing any overflow or layout issues.')).toBeInTheDocument()
    })

    it('should handle rapid clicks on same feature', async () => {
      const user = userEvent.setup()

      render(
        <FeaturesGrid
          loading={false}
          displayResources={mockFeatures}
          selectedFeatureIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const featureCard = screen.getAllByTestId('feature-card')[0]
      await user.click(featureCard)
      await user.click(featureCard)
      await user.click(featureCard)

      expect(mockHandleToggleWithConfirm).toHaveBeenCalledTimes(3)
      expect(mockHandleToggleWithConfirm).toHaveBeenCalledWith(1)
    })

    it('should handle feature with empty description', () => {
      const emptyDescFeature: Feature[] = [{
        id: 1,
        name: 'Feature Name',
        description: '',
        display_order: 1
      }]

      render(
        <FeaturesGrid
          loading={false}
          displayResources={emptyDescFeature}
          selectedFeatureIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Feature Name')).toBeInTheDocument()
    })

    it('should handle selectedFeatureIds with non-existent ids', () => {
      render(
        <FeaturesGrid
          loading={false}
          displayResources={mockFeatures}
          selectedFeatureIds={[999, 1000]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const checkboxIcons = screen.getAllByTestId('checkbox-outline-icon')
      expect(checkboxIcons).toHaveLength(3)
    })

    it('should handle mixed valid and invalid selectedFeatureIds', () => {
      render(
        <FeaturesGrid
          loading={false}
          displayResources={mockFeatures}
          selectedFeatureIds={[1, 999]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByTestId('plus-icon')).toHaveLength(1)
      expect(screen.getAllByTestId('checkbox-outline-icon')).toHaveLength(2)
    })
  })

  describe('Props Integration', () => {
    it('should update when loading prop changes', () => {
      const { rerender } = render(
        <FeaturesGrid
          loading={true}
          displayResources={mockFeatures}
          selectedFeatureIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('resource-grid-skeleton')).toBeInTheDocument()

      rerender(
        <Provider>
          <FeaturesGrid
            loading={false}
            displayResources={mockFeatures}
            selectedFeatureIds={[]}
            isReadOnly={false}
            handleToggleWithConfirm={mockHandleToggleWithConfirm}
          />
        </Provider>
      )

      expect(screen.queryByTestId('resource-grid-skeleton')).not.toBeInTheDocument()
      expect(screen.getByTestId('simple-grid')).toBeInTheDocument()
    })

    it('should update when selectedFeatureIds prop changes', () => {
      const { rerender } = render(
        <FeaturesGrid
          loading={false}
          displayResources={mockFeatures}
          selectedFeatureIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByTestId('checkbox-outline-icon')).toHaveLength(3)

      rerender(
        <Provider>
          <FeaturesGrid
            loading={false}
            displayResources={mockFeatures}
            selectedFeatureIds={[1, 2]}
            isReadOnly={false}
            handleToggleWithConfirm={mockHandleToggleWithConfirm}
          />
        </Provider>
      )

      expect(screen.getAllByTestId('plus-icon')).toHaveLength(2)
      expect(screen.getAllByTestId('checkbox-outline-icon')).toHaveLength(1)
    })

    it('should update when isReadOnly prop changes', () => {
      const { rerender } = render(
        <FeaturesGrid
          loading={false}
          displayResources={mockFeatures}
          selectedFeatureIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByTestId('checkbox-outline-icon')).toHaveLength(3)

      rerender(
        <Provider>
          <FeaturesGrid
            loading={false}
            displayResources={mockFeatures}
            selectedFeatureIds={[]}
            isReadOnly={true}
            handleToggleWithConfirm={mockHandleToggleWithConfirm}
          />
        </Provider>
      )

      expect(screen.queryByTestId('checkbox-outline-icon')).not.toBeInTheDocument()
    })

    it('should update when displayResources prop changes', () => {
      const { rerender } = render(
        <FeaturesGrid
          loading={false}
          displayResources={mockFeatures}
          selectedFeatureIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByTestId('feature-card')).toHaveLength(3)

      const newFeatures = [mockFeatures[0]]
      rerender(
        <Provider>
          <FeaturesGrid
            loading={false}
            displayResources={newFeatures}
            selectedFeatureIds={[]}
            isReadOnly={false}
            handleToggleWithConfirm={mockHandleToggleWithConfirm}
          />
        </Provider>
      )

      expect(screen.getAllByTestId('feature-card')).toHaveLength(1)
    })
  })
})
