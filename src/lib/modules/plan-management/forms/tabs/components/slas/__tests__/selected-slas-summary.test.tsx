/* Comprehensive test suite for SelectedSLAsSummary component */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'
import React from 'react'

/* Plan module imports */
import SelectedSLAsSummary from '@plan-management/forms/tabs/components/slas/selected-slas-summary'
import { SupportSLA } from '@plan-management/types'

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

describe('SelectedSLAsSummary', () => {
  const mockOnRemove = vi.fn()

  const mockSlas: SupportSLA[] = [
    {
      id: 1,
      name: 'Premium Support',
      support_channel: 'Email, Phone, Chat',
      response_time_hours: 4,
      availability_schedule: '24/7',
      notes: 'Priority support',
      display_order: 1
    },
    {
      id: 2,
      name: 'Standard Support',
      support_channel: 'Email',
      response_time_hours: 24,
      availability_schedule: 'Business Hours',
      notes: '',
      display_order: 2
    },
    {
      id: 3,
      name: 'Basic Support',
      support_channel: 'Email',
      response_time_hours: 48,
      availability_schedule: 'Business Hours',
      notes: 'Community access',
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
        <SelectedSLAsSummary
          selectedSlas={mockSlas}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('box')).toBeInTheDocument()
    })

    it('should render header with SLA count', () => {
      render(
        <SelectedSLAsSummary
          selectedSlas={mockSlas}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Selected SLAs (3)')).toBeInTheDocument()
    })

    it('should display correct count with single SLA', () => {
      const singleSla = [mockSlas[0]]

      render(
        <SelectedSLAsSummary
          selectedSlas={singleSla}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Selected SLAs (1)')).toBeInTheDocument()
    })

    it('should display count of zero when no SLAs', () => {
      render(
        <SelectedSLAsSummary
          selectedSlas={[]}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Selected SLAs (0)')).toBeInTheDocument()
    })
  })

  describe('Selected SLAs Display', () => {
    it('should render all selected SLA names', () => {
      render(
        <SelectedSLAsSummary
          selectedSlas={mockSlas}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Premium Support')).toBeInTheDocument()
      expect(screen.getByText('Standard Support')).toBeInTheDocument()
      expect(screen.getByText('Basic Support')).toBeInTheDocument()
    })

    it('should render SLAs in flex container', () => {
      render(
        <SelectedSLAsSummary
          selectedSlas={mockSlas}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      const flexContainers = screen.getAllByTestId('flex')
      expect(flexContainers.length).toBeGreaterThan(0)
    })

    it('should render single SLA correctly', () => {
      const singleSla = [mockSlas[0]]

      render(
        <SelectedSLAsSummary
          selectedSlas={singleSla}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Premium Support')).toBeInTheDocument()
      expect(screen.queryByText('Standard Support')).not.toBeInTheDocument()
    })

    it('should render multiple SLAs', () => {
      render(
        <SelectedSLAsSummary
          selectedSlas={mockSlas}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      const slaNames = mockSlas.map(s => s.name)
      slaNames.forEach(name => {
        expect(screen.getByText(name)).toBeInTheDocument()
      })
    })
  })

  describe('Remove Functionality', () => {
    it('should render remove buttons for all SLAs', () => {
      render(
        <SelectedSLAsSummary
          selectedSlas={mockSlas}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      const removeButtons = screen.getAllByTestId('remove-button')
      expect(removeButtons).toHaveLength(3)
    })

    it('should render X icon in remove buttons', () => {
      render(
        <SelectedSLAsSummary
          selectedSlas={mockSlas}
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
        <SelectedSLAsSummary
          selectedSlas={mockSlas}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      const removeButtons = screen.getAllByTestId('remove-button')
      await user.click(removeButtons[0])

      expect(mockOnRemove).toHaveBeenCalledWith(1)
    })

    it('should call onRemove with correct SLA id', async () => {
      const user = userEvent.setup()

      render(
        <SelectedSLAsSummary
          selectedSlas={mockSlas}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      const removeButtons = screen.getAllByTestId('remove-button')
      await user.click(removeButtons[1])

      expect(mockOnRemove).toHaveBeenCalledWith(2)
      expect(mockOnRemove).toHaveBeenCalledTimes(1)
    })

    it('should handle removing multiple SLAs', async () => {
      const user = userEvent.setup()

      render(
        <SelectedSLAsSummary
          selectedSlas={mockSlas}
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
        <SelectedSLAsSummary
          selectedSlas={mockSlas}
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
        <SelectedSLAsSummary
          selectedSlas={mockSlas}
          onRemove={mockOnRemove}
          readOnly={true}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByTestId('remove-button')).not.toBeInTheDocument()
    })

    it('should not render X icons in read-only mode', () => {
      render(
        <SelectedSLAsSummary
          selectedSlas={mockSlas}
          onRemove={mockOnRemove}
          readOnly={true}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument()
    })

    it('should still display SLA names in read-only mode', () => {
      render(
        <SelectedSLAsSummary
          selectedSlas={mockSlas}
          onRemove={mockOnRemove}
          readOnly={true}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Premium Support')).toBeInTheDocument()
      expect(screen.getByText('Standard Support')).toBeInTheDocument()
      expect(screen.getByText('Basic Support')).toBeInTheDocument()
    })

    it('should display correct SLA count in read-only mode', () => {
      render(
        <SelectedSLAsSummary
          selectedSlas={mockSlas}
          onRemove={mockOnRemove}
          readOnly={true}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Selected SLAs (3)')).toBeInTheDocument()
    })

    it('should render all SLAs in read-only mode', () => {
      render(
        <SelectedSLAsSummary
          selectedSlas={mockSlas}
          onRemove={mockOnRemove}
          readOnly={true}
        />,
        { wrapper: TestWrapper }
      )

      const slaTexts = screen.getAllByText(/Premium Support|Standard Support|Basic Support/)
      expect(slaTexts.length).toBeGreaterThan(0)
    })

    it('should default to edit mode when readOnly is not specified', () => {
      render(
        <SelectedSLAsSummary
          selectedSlas={mockSlas}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByTestId('remove-button')).toHaveLength(3)
    })
  })

  describe('Empty State', () => {
    it('should render empty state when no SLAs selected', () => {
      render(
        <SelectedSLAsSummary
          selectedSlas={[]}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('selected-slas-empty-state')).toBeInTheDocument()
    })

    it('should display empty state title', () => {
      render(
        <SelectedSLAsSummary
          selectedSlas={[]}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('empty-state-title')).toHaveTextContent('No SLAs selected')
    })

    it('should display empty state description', () => {
      render(
        <SelectedSLAsSummary
          selectedSlas={[]}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('empty-state-description')).toHaveTextContent('Select SLAs from the list above to configure this plan')
    })

    it('should render plus icon in empty state', () => {
      render(
        <SelectedSLAsSummary
          selectedSlas={[]}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('plus-icon')).toBeInTheDocument()
    })

    it('should not render SLA list when empty', () => {
      render(
        <SelectedSLAsSummary
          selectedSlas={[]}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByTestId('remove-button')).not.toBeInTheDocument()
    })

    it('should render empty state in read-only mode', () => {
      render(
        <SelectedSLAsSummary
          selectedSlas={[]}
          onRemove={mockOnRemove}
          readOnly={true}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('selected-slas-empty-state')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle SLA with very long name', () => {
      const longNameSla: SupportSLA[] = [{
        id: 1,
        name: 'This is a very long SLA name that should be displayed properly in the selected SLAs summary without breaking the layout or causing overflow issues',
        support_channel: 'Email',
        response_time_hours: 24,
        availability_schedule: '24/7',
        notes: '',
        display_order: 1
      }]

      render(
        <SelectedSLAsSummary
          selectedSlas={longNameSla}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('This is a very long SLA name that should be displayed properly in the selected SLAs summary without breaking the layout or causing overflow issues')).toBeInTheDocument()
    })

    it('should handle SLA with special characters in name', () => {
      const specialCharSla: SupportSLA[] = [{
        id: 1,
        name: 'Premium & Elite Support (24/7) - "VIP"',
        support_channel: 'Email',
        response_time_hours: 4,
        availability_schedule: '24/7',
        notes: '',
        display_order: 1
      }]

      render(
        <SelectedSLAsSummary
          selectedSlas={specialCharSla}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Premium & Elite Support (24/7) - "VIP"')).toBeInTheDocument()
    })

    it('should handle large number of selected SLAs', () => {
      const manySlas: SupportSLA[] = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        name: `SLA ${i + 1}`,
        support_channel: 'Email',
        response_time_hours: 24,
        availability_schedule: 'Business Hours',
        notes: '',
        display_order: i + 1
      }))

      render(
        <SelectedSLAsSummary
          selectedSlas={manySlas}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Selected SLAs (20)')).toBeInTheDocument()
      expect(screen.getAllByTestId('remove-button')).toHaveLength(20)
    })

    it('should handle SLA with empty name', () => {
      const emptyNameSla: SupportSLA[] = [{
        id: 1,
        name: '',
        support_channel: 'Email',
        response_time_hours: 24,
        availability_schedule: '24/7',
        notes: '',
        display_order: 1
      }]

      render(
        <SelectedSLAsSummary
          selectedSlas={emptyNameSla}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Selected SLAs (1)')).toBeInTheDocument()
    })

    it('should handle SLAs with duplicate ids', () => {
      const duplicateIdSlas: SupportSLA[] = [
        {
          id: 1,
          name: 'SLA A',
          support_channel: 'Email',
          response_time_hours: 24,
          availability_schedule: '24/7',
          notes: '',
          display_order: 1
        },
        {
          id: 1,
          name: 'SLA B',
          support_channel: 'Phone',
          response_time_hours: 12,
          availability_schedule: 'Business Hours',
          notes: '',
          display_order: 2
        }
      ]

      render(
        <SelectedSLAsSummary
          selectedSlas={duplicateIdSlas}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Selected SLAs (2)')).toBeInTheDocument()
    })
  })

  describe('Props Integration', () => {
    it('should update when selectedSlas prop changes', () => {
      const { rerender } = render(
        <SelectedSLAsSummary
          selectedSlas={[mockSlas[0]]}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Selected SLAs (1)')).toBeInTheDocument()

      rerender(
        <Provider>
          <SelectedSLAsSummary
            selectedSlas={mockSlas}
            onRemove={mockOnRemove}
          />
        </Provider>
      )

      expect(screen.getByText('Selected SLAs (3)')).toBeInTheDocument()
    })

    it('should update when readOnly prop changes', () => {
      const { rerender } = render(
        <SelectedSLAsSummary
          selectedSlas={mockSlas}
          onRemove={mockOnRemove}
          readOnly={false}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByTestId('remove-button')).toHaveLength(3)

      rerender(
        <Provider>
          <SelectedSLAsSummary
            selectedSlas={mockSlas}
            onRemove={mockOnRemove}
            readOnly={true}
          />
        </Provider>
      )

      expect(screen.queryByTestId('remove-button')).not.toBeInTheDocument()
    })

    it('should update from empty to populated', () => {
      const { rerender } = render(
        <SelectedSLAsSummary
          selectedSlas={[]}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('selected-slas-empty-state')).toBeInTheDocument()

      rerender(
        <Provider>
          <SelectedSLAsSummary
            selectedSlas={mockSlas}
            onRemove={mockOnRemove}
          />
        </Provider>
      )

      expect(screen.queryByTestId('selected-slas-empty-state')).not.toBeInTheDocument()
      expect(screen.getByText('Premium Support')).toBeInTheDocument()
    })

    it('should update from populated to empty', () => {
      const { rerender } = render(
        <SelectedSLAsSummary
          selectedSlas={mockSlas}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Premium Support')).toBeInTheDocument()

      rerender(
        <Provider>
          <SelectedSLAsSummary
            selectedSlas={[]}
            onRemove={mockOnRemove}
          />
        </Provider>
      )

      expect(screen.getByTestId('selected-slas-empty-state')).toBeInTheDocument()
      expect(screen.queryByText('Premium Support')).not.toBeInTheDocument()
    })

    it('should call different onRemove handlers', async () => {
      const user = userEvent.setup()
      const firstHandler = vi.fn()
      const secondHandler = vi.fn()

      const { rerender } = render(
        <SelectedSLAsSummary
          selectedSlas={mockSlas}
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
          <SelectedSLAsSummary
            selectedSlas={mockSlas}
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
    it('should render SLAs in flex wrap layout', () => {
      render(
        <SelectedSLAsSummary
          selectedSlas={mockSlas}
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
        <SelectedSLAsSummary
          selectedSlas={mockSlas}
          onRemove={mockOnRemove}
        />,
        { wrapper: TestWrapper }
      )

      const headerTexts = screen.getAllByTestId('text')
      const header = headerTexts.find(el => el.textContent?.includes('Selected SLAs'))
      expect(header).toHaveAttribute('data-fontsize', 'md')
      expect(header).toHaveAttribute('data-fontweight', 'semibold')
    })

    it('should render main container box', () => {
      render(
        <SelectedSLAsSummary
          selectedSlas={mockSlas}
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
          <SelectedSLAsSummary
            selectedSlas={mockSlas}
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
        <SelectedSLAsSummary
          selectedSlas={mockSlas}
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
