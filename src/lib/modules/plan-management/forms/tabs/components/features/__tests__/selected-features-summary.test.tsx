/* Comprehensive test suite for SelectedFeaturesSummary component */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'
import React from 'react'

/* Plan module imports */
import SelectedFeaturesSummary from '@plan-management/forms/tabs/components/features/selected-features-summary'
import { Feature } from '@plan-management/types'

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
    Box: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="box">{children}</div>
    ),
    Flex: ({ children, flexWrap, gap, p, bg, color, borderWidth, borderRadius, borderColor, px, py, justify, fontSize, fontWeight, align, cursor, transition, _hover }: {
      children: React.ReactNode;
      flexWrap?: string;
      gap?: number;
      p?: number;
      bg?: string;
      color?: string;
      borderWidth?: number;
      borderRadius?: string;
      borderColor?: string;
      px?: number;
      py?: number;
      justify?: string;
      fontSize?: string;
      fontWeight?: string;
      align?: string;
      cursor?: string;
      transition?: string;
      _hover?: Record<string, unknown>;
    }) => (
      <div data-testid="flex" data-flexwrap={flexWrap} data-gap={gap} data-p={p} data-bg={bg} data-color={color}>
        {children}
      </div>
    ),
    Text: ({ children, fontSize, fontWeight, color, mb }: {
      children: React.ReactNode;
      fontSize?: string;
      fontWeight?: string;
      color?: string;
      mb?: number;
    }) => (
      <span data-testid="text" data-fontsize={fontSize} data-fontweight={fontWeight} data-color={color} data-mb={mb}>
        {children}
      </span>
    ),
    Button: ({ children, onClick, p, borderRadius, bg, color, transition }: {
      children: React.ReactNode;
      onClick: (e: React.MouseEvent) => void;
      p?: number;
      borderRadius?: string;
      bg?: string;
      color?: string;
      transition?: string;
    }) => (
      <button data-testid="remove-button" onClick={onClick} data-p={p} data-bg={bg}>
        {children}
      </button>
    )
  }
})

/* Mock react-icons */
vi.mock('react-icons/fi', () => ({
  FiX: () => <div data-testid="x-icon">X Icon</div>
}))

vi.mock('react-icons/fa', () => ({
  FaPlus: ({ size, color }: { size: number; color: string }) => (
    <div data-testid="plus-icon" data-size={size} data-color={color}>Plus Icon</div>
  )
}))

describe('SelectedFeaturesSummary', () => {
  const mockOnRemove = vi.fn()

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

  describe('Component Rendering', () => {
    it('should render component', () => {
      render(
        <SelectedFeaturesSummary
          selectedFeatures={mockFeatures}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('box')).toBeInTheDocument()
    })

    it('should render header with feature count', () => {
      render(
        <SelectedFeaturesSummary
          selectedFeatures={mockFeatures}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Selected Features (3)')).toBeInTheDocument()
    })

    it('should display correct count with single feature', () => {
      const singleFeature = [mockFeatures[0]]

      render(
        <SelectedFeaturesSummary
          selectedFeatures={singleFeature}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Selected Features (1)')).toBeInTheDocument()
    })

    it('should display count of zero when no features', () => {
      render(
        <SelectedFeaturesSummary
          selectedFeatures={[]}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Selected Features (0)')).toBeInTheDocument()
    })
  })

  describe('Selected Features Display', () => {
    it('should render all selected feature names', () => {
      render(
        <SelectedFeaturesSummary
          selectedFeatures={mockFeatures}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Advanced Reporting')).toBeInTheDocument()
      expect(screen.getByText('Multi-User Access')).toBeInTheDocument()
      expect(screen.getByText('API Integration')).toBeInTheDocument()
    })

    it('should render features in flex container', () => {
      render(
        <SelectedFeaturesSummary
          selectedFeatures={mockFeatures}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      const flexContainers = screen.getAllByTestId('flex')
      expect(flexContainers.length).toBeGreaterThan(0)
    })

    it('should render single feature correctly', () => {
      const singleFeature = [mockFeatures[0]]

      render(
        <SelectedFeaturesSummary
          selectedFeatures={singleFeature}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Advanced Reporting')).toBeInTheDocument()
      expect(screen.queryByText('Multi-User Access')).not.toBeInTheDocument()
    })

    it('should render multiple features', () => {
      render(
        <SelectedFeaturesSummary
          selectedFeatures={mockFeatures}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      const featureNames = mockFeatures.map(f => f.name)
      featureNames.forEach(name => {
        expect(screen.getByText(name)).toBeInTheDocument()
      })
    })
  })

  describe('Remove Functionality', () => {
    it('should render remove buttons for all features', () => {
      render(
        <SelectedFeaturesSummary
          selectedFeatures={mockFeatures}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      const removeButtons = screen.getAllByTestId('remove-button')
      expect(removeButtons).toHaveLength(3)
    })

    it('should render X icon in remove buttons', () => {
      render(
        <SelectedFeaturesSummary
          selectedFeatures={mockFeatures}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      const xIcons = screen.getAllByTestId('x-icon')
      expect(xIcons).toHaveLength(3)
    })

    it('should call onRemove when remove button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <SelectedFeaturesSummary
          selectedFeatures={mockFeatures}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      const removeButtons = screen.getAllByTestId('remove-button')
      await user.click(removeButtons[0])

      expect(mockOnRemove).toHaveBeenCalledWith(1)
    })

    it('should call onRemove with correct feature id', async () => {
      const user = userEvent.setup()

      render(
        <SelectedFeaturesSummary
          selectedFeatures={mockFeatures}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      const removeButtons = screen.getAllByTestId('remove-button')
      await user.click(removeButtons[1])

      expect(mockOnRemove).toHaveBeenCalledWith(2)
      expect(mockOnRemove).toHaveBeenCalledTimes(1)
    })

    it('should handle removing multiple features', async () => {
      const user = userEvent.setup()

      render(
        <SelectedFeaturesSummary
          selectedFeatures={mockFeatures}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      const removeButtons = screen.getAllByTestId('remove-button')
      await user.click(removeButtons[0])
      await user.click(removeButtons[1])
      await user.click(removeButtons[2])

      expect(mockOnRemove).toHaveBeenCalledTimes(3)
      expect(mockOnRemove).toHaveBeenNthCalledWith(1, 1)
      expect(mockOnRemove).toHaveBeenNthCalledWith(2, 2)
      expect(mockOnRemove).toHaveBeenNthCalledWith(3, 3)
    })

    it('should handle rapid clicks on remove button', async () => {
      const user = userEvent.setup()

      render(
        <SelectedFeaturesSummary
          selectedFeatures={mockFeatures}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      const removeButton = screen.getAllByTestId('remove-button')[0]
      await user.click(removeButton)
      await user.click(removeButton)

      expect(mockOnRemove).toHaveBeenCalledTimes(2)
      expect(mockOnRemove).toHaveBeenCalledWith(1)
    })
  })

  describe('Read-Only Mode', () => {
    it('should not render remove buttons in read-only mode', () => {
      render(
        <SelectedFeaturesSummary
          selectedFeatures={mockFeatures}
          onRemove={mockOnRemove}
          readOnly={true}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByTestId('remove-button')).not.toBeInTheDocument()
    })

    it('should not render X icons in read-only mode', () => {
      render(
        <SelectedFeaturesSummary
          selectedFeatures={mockFeatures}
          onRemove={mockOnRemove}
          readOnly={true}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument()
    })

    it('should still display feature names in read-only mode', () => {
      render(
        <SelectedFeaturesSummary
          selectedFeatures={mockFeatures}
          onRemove={mockOnRemove}
          readOnly={true}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Advanced Reporting')).toBeInTheDocument()
      expect(screen.getByText('Multi-User Access')).toBeInTheDocument()
      expect(screen.getByText('API Integration')).toBeInTheDocument()
    })

    it('should display correct feature count in read-only mode', () => {
      render(
        <SelectedFeaturesSummary
          selectedFeatures={mockFeatures}
          onRemove={mockOnRemove}
          readOnly={true}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Selected Features (3)')).toBeInTheDocument()
    })

    it('should render all features in read-only mode', () => {
      render(
        <SelectedFeaturesSummary
          selectedFeatures={mockFeatures}
          onRemove={mockOnRemove}
          readOnly={true}
        />,
        { wrapper: TestWrapper }
      )

      const featureTexts = screen.getAllByText(/Advanced Reporting|Multi-User Access|API Integration/)
      expect(featureTexts.length).toBeGreaterThan(0)
    })

    it('should default to edit mode when readOnly is not specified', () => {
      render(
        <SelectedFeaturesSummary
          selectedFeatures={mockFeatures}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByTestId('remove-button')).toHaveLength(3)
    })
  })

  describe('Empty State', () => {
    it('should render empty state when no features selected', () => {
      render(
        <SelectedFeaturesSummary
          selectedFeatures={[]}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('selected-features-empty-state')).toBeInTheDocument()
    })

    it('should display empty state title', () => {
      render(
        <SelectedFeaturesSummary
          selectedFeatures={[]}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('empty-state-title')).toHaveTextContent('No features selected')
    })

    it('should display empty state description', () => {
      render(
        <SelectedFeaturesSummary
          selectedFeatures={[]}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('empty-state-description')).toHaveTextContent('Select features from the list above to configure this plan')
    })

    it('should render plus icon in empty state', () => {
      render(
        <SelectedFeaturesSummary
          selectedFeatures={[]}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('plus-icon')).toBeInTheDocument()
    })

    it('should not render feature list when empty', () => {
      render(
        <SelectedFeaturesSummary
          selectedFeatures={[]}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByTestId('remove-button')).not.toBeInTheDocument()
    })

    it('should render empty state in read-only mode', () => {
      render(
        <SelectedFeaturesSummary
          selectedFeatures={[]}
          onRemove={mockOnRemove}
          readOnly={true}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('selected-features-empty-state')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle feature with very long name', () => {
      const longNameFeature: Feature[] = [{
        id: 1,
        name: 'This is a very long feature name that should be displayed properly in the selected features summary without breaking the layout or causing overflow issues',
        description: 'Description',
        display_order: 1
      }]

      render(
        <SelectedFeaturesSummary
          selectedFeatures={longNameFeature}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('This is a very long feature name that should be displayed properly in the selected features summary without breaking the layout or causing overflow issues')).toBeInTheDocument()
    })

    it('should handle feature with special characters in name', () => {
      const specialCharFeature: Feature[] = [{
        id: 1,
        name: 'Feature & Special <chars> "test"',
        description: 'Description',
        display_order: 1
      }]

      render(
        <SelectedFeaturesSummary
          selectedFeatures={specialCharFeature}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Feature & Special <chars> "test"')).toBeInTheDocument()
    })

    it('should handle large number of selected features', () => {
      const manyFeatures: Feature[] = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        name: `Feature ${i + 1}`,
        description: `Description ${i + 1}`,
        display_order: i + 1
      }))

      render(
        <SelectedFeaturesSummary
          selectedFeatures={manyFeatures}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Selected Features (20)')).toBeInTheDocument()
      expect(screen.getAllByTestId('remove-button')).toHaveLength(20)
    })

    it('should handle feature with empty name', () => {
      const emptyNameFeature: Feature[] = [{
        id: 1,
        name: '',
        description: 'Description',
        display_order: 1
      }]

      render(
        <SelectedFeaturesSummary
          selectedFeatures={emptyNameFeature}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Selected Features (1)')).toBeInTheDocument()
    })

    it('should handle features with duplicate ids', () => {
      const duplicateIdFeatures: Feature[] = [
        {
          id: 1,
          name: 'Feature A',
          description: 'Description A',
          display_order: 1
        },
        {
          id: 1,
          name: 'Feature B',
          description: 'Description B',
          display_order: 2
        }
      ]

      render(
        <SelectedFeaturesSummary
          selectedFeatures={duplicateIdFeatures}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Selected Features (2)')).toBeInTheDocument()
    })
  })

  describe('Props Integration', () => {
    it('should update when selectedFeatures prop changes', () => {
      const { rerender } = render(
        <SelectedFeaturesSummary
          selectedFeatures={[mockFeatures[0]]}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Selected Features (1)')).toBeInTheDocument()

      rerender(
        <Provider>
          <SelectedFeaturesSummary
            selectedFeatures={mockFeatures}
            onRemove={mockOnRemove}
          />
        </Provider>
      )

      expect(screen.getByText('Selected Features (3)')).toBeInTheDocument()
    })

    it('should update when readOnly prop changes', () => {
      const { rerender } = render(
        <SelectedFeaturesSummary
          selectedFeatures={mockFeatures}
          onRemove={mockOnRemove}
          readOnly={false}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByTestId('remove-button')).toHaveLength(3)

      rerender(
        <Provider>
          <SelectedFeaturesSummary
            selectedFeatures={mockFeatures}
            onRemove={mockOnRemove}
            readOnly={true}
          />
        </Provider>
      )

      expect(screen.queryByTestId('remove-button')).not.toBeInTheDocument()
    })

    it('should update from empty to populated', () => {
      const { rerender } = render(
        <SelectedFeaturesSummary
          selectedFeatures={[]}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('selected-features-empty-state')).toBeInTheDocument()

      rerender(
        <Provider>
          <SelectedFeaturesSummary
            selectedFeatures={mockFeatures}
            onRemove={mockOnRemove}
          />
        </Provider>
      )

      expect(screen.queryByTestId('selected-features-empty-state')).not.toBeInTheDocument()
      expect(screen.getByText('Advanced Reporting')).toBeInTheDocument()
    })

    it('should update from populated to empty', () => {
      const { rerender } = render(
        <SelectedFeaturesSummary
          selectedFeatures={mockFeatures}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Advanced Reporting')).toBeInTheDocument()

      rerender(
        <Provider>
          <SelectedFeaturesSummary
            selectedFeatures={[]}
            onRemove={mockOnRemove}
          />
        </Provider>
      )

      expect(screen.getByTestId('selected-features-empty-state')).toBeInTheDocument()
      expect(screen.queryByText('Advanced Reporting')).not.toBeInTheDocument()
    })

    it('should call different onRemove handlers', async () => {
      const user = userEvent.setup()
      const firstHandler = vi.fn()
      const secondHandler = vi.fn()

      const { rerender } = render(
        <SelectedFeaturesSummary
          selectedFeatures={mockFeatures}
          onRemove={firstHandler}
        />,
        { wrapper: TestWrapper }
      )

      const removeButtons = screen.getAllByTestId('remove-button')
      await user.click(removeButtons[0])

      expect(firstHandler).toHaveBeenCalledWith(1)
      expect(secondHandler).not.toHaveBeenCalled()

      rerender(
        <Provider>
          <SelectedFeaturesSummary
            selectedFeatures={mockFeatures}
            onRemove={secondHandler}
          />
        </Provider>
      )

      const newRemoveButtons = screen.getAllByTestId('remove-button')
      await user.click(newRemoveButtons[0])

      expect(secondHandler).toHaveBeenCalledWith(1)
      expect(firstHandler).toHaveBeenCalledTimes(1)
    })
  })

  describe('Visual Structure', () => {
    it('should render features in flex wrap layout', () => {
      render(
        <SelectedFeaturesSummary
          selectedFeatures={mockFeatures}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      const flexContainers = screen.getAllByTestId('flex')
      const wrapContainer = flexContainers.find(el => el.getAttribute('data-flexwrap') === 'wrap')
      expect(wrapContainer).toBeTruthy()
    })

    it('should render header text with proper styling', () => {
      render(
        <SelectedFeaturesSummary
          selectedFeatures={mockFeatures}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      const headerTexts = screen.getAllByTestId('text')
      const header = headerTexts.find(el => el.textContent?.includes('Selected Features'))
      expect(header).toHaveAttribute('data-fontsize', 'md')
      expect(header).toHaveAttribute('data-fontweight', 'semibold')
    })

    it('should render main container box', () => {
      render(
        <SelectedFeaturesSummary
          selectedFeatures={mockFeatures}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('box')).toBeInTheDocument()
    })
  })

  describe('Click Event Handling', () => {
    it('should stop propagation when remove button is clicked', async () => {
      const user = userEvent.setup()
      const parentClickHandler = vi.fn()

      const TestComponentWithParent = () => (
        <div onClick={parentClickHandler}>
          <SelectedFeaturesSummary
            selectedFeatures={mockFeatures}
            onRemove={mockOnRemove}
          />
        </div>
      )

      render(<TestComponentWithParent />, { wrapper: TestWrapper })

      const removeButtons = screen.getAllByTestId('remove-button')
      await user.click(removeButtons[0])

      expect(mockOnRemove).toHaveBeenCalledWith(1)
    })

    it('should handle clicks on all remove buttons independently', async () => {
      const user = userEvent.setup()

      render(
        <SelectedFeaturesSummary
          selectedFeatures={mockFeatures}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      const removeButtons = screen.getAllByTestId('remove-button')

      for (let i = 0; i < removeButtons.length; i++) {
        await user.click(removeButtons[i])
      }

      expect(mockOnRemove).toHaveBeenCalledTimes(3)
    })
  })
})
