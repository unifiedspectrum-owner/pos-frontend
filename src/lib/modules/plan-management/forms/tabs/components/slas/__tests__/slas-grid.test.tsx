/* Comprehensive test suite for SLAsGrid component */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from '@/components/ui/provider'
import React from 'react'

/* Plan module imports */
import SLAsGrid from '@plan-management/forms/tabs/components/slas/slas-grid'
import { SupportSLA } from '@plan-management/types'

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
      /* Distinguish between SLA card and icon container */
      const isSlaCard = p === 4 && borderWidth === 1
      const testId = isSlaCard ? 'sla-card' : 'box'

      return (
        <div data-testid={testId} onClick={onClick} data-cursor={cursor || undefined} data-bordercolor={borderColor} data-bg={bg} {...props}>
          {children}
        </div>
      )
    },
    Flex: ({ children, justifyContent, align, flexDir, gap, flex, minH, flexShrink, ml, flexWrap }: {
      children: React.ReactNode;
      justifyContent?: string;
      align?: string;
      flexDir?: string;
      gap?: number;
      flex?: number;
      minH?: number;
      flexShrink?: number;
      ml?: number;
      flexWrap?: string;
    }) => (
      <div data-testid="flex" data-justifycontent={justifyContent} data-align={align} data-flexdir={flexDir} data-gap={gap} data-flex={flex} data-minh={minH} data-flexshrink={flexShrink} data-ml={ml} data-flexwrap={flexWrap}>
        {children}
      </div>
    ),
    Text: ({ children, fontSize, fontWeight, color, lineHeight, flex }: {
      children: React.ReactNode;
      fontSize?: string;
      fontWeight?: string;
      color?: string;
      lineHeight?: string;
      flex?: number;
    }) => (
      <span data-testid="text" data-fontsize={fontSize} data-fontweight={fontWeight} data-color={color} data-lineheight={lineHeight} data-flex={flex}>
        {children}
      </span>
    )
  }
})

/* Mock react-icons */
vi.mock('react-icons/md', () => ({
  MdSecurity: ({ size, color }: { size: number; color: string }) => (
    <div data-testid="md-security-icon" data-size={size} data-color={color}>Security Icon</div>
  ),
  MdOutlineCheckBoxOutlineBlank: () => (
    <div data-testid="checkbox-outline-icon">Checkbox Icon</div>
  )
}))

vi.mock('react-icons/fi', () => ({
  FiPlus: () => (
    <div data-testid="fi-plus-icon">Plus Icon</div>
  )
}))

vi.mock('react-icons/fa', () => ({
  FaPlus: ({ size, color }: { size: number; color: string }) => (
    <div data-testid="fa-plus-icon" data-size={size} data-color={color}>Plus Icon</div>
  )
}))

describe('SLAsGrid', () => {
  const mockHandleToggleWithConfirm = vi.fn()

  const mockSlas: SupportSLA[] = [
    {
      id: 1,
      name: 'Premium Support',
      support_channel: 'Email, Phone, Chat',
      response_time_hours: 4,
      availability_schedule: '24/7',
      notes: 'Priority support for critical issues',
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
      notes: 'Community forum access',
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
    it('should render skeleton when loading with no selected SLAs', () => {
      render(
        <SLAsGrid
          loading={true}
          displaySlas={[]}
          selectedSlaIds={[]}
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
        <SLAsGrid
          loading={true}
          displaySlas={[]}
          selectedSlaIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const skeleton = screen.getByTestId('resource-grid-skeleton')
      expect(skeleton).toHaveAttribute('data-count', '6')
      expect(skeleton).toHaveAttribute('data-columns', '3')
      expect(skeleton).toHaveAttribute('data-variant', 'detailed')
      expect(skeleton).toHaveAttribute('data-minheight', '140px')
    })

    it('should not render skeleton when loading with selected SLAs', () => {
      render(
        <SLAsGrid
          loading={true}
          displaySlas={mockSlas}
          selectedSlaIds={[1]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByTestId('resource-grid-skeleton')).not.toBeInTheDocument()
    })

    it('should not render SLAs when loading with no selected items', () => {
      render(
        <SLAsGrid
          loading={true}
          displaySlas={mockSlas}
          selectedSlaIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByTestId('simple-grid')).not.toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should render empty state when no SLAs and not loading', () => {
      render(
        <SLAsGrid
          loading={false}
          displaySlas={[]}
          selectedSlaIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('slas-empty-state')).toBeInTheDocument()
    })

    it('should show correct empty state title in edit mode', () => {
      render(
        <SLAsGrid
          loading={false}
          displaySlas={[]}
          selectedSlaIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('empty-state-title')).toHaveTextContent('No SLAs selected')
    })

    it('should show correct empty state description in edit mode', () => {
      render(
        <SLAsGrid
          loading={false}
          displaySlas={[]}
          selectedSlaIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('empty-state-description')).toHaveTextContent('Select SLAs from the list above to configure this plan')
    })

    it('should show correct empty state title in read-only mode', () => {
      render(
        <SLAsGrid
          loading={false}
          displaySlas={[]}
          selectedSlaIds={[]}
          isReadOnly={true}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('empty-state-title')).toHaveTextContent('No SLAs included')
    })

    it('should show correct empty state description in read-only mode', () => {
      render(
        <SLAsGrid
          loading={false}
          displaySlas={[]}
          selectedSlaIds={[]}
          isReadOnly={true}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('empty-state-description')).toHaveTextContent('This plan does not include any SLAs')
    })

    it('should render security icon in read-only empty state', () => {
      render(
        <SLAsGrid
          loading={false}
          displaySlas={[]}
          selectedSlaIds={[]}
          isReadOnly={true}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('md-security-icon')).toBeInTheDocument()
    })

    it('should render plus icon in edit mode empty state', () => {
      render(
        <SLAsGrid
          loading={false}
          displaySlas={[]}
          selectedSlaIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('fa-plus-icon')).toBeInTheDocument()
    })
  })

  describe('SLAs Grid Rendering', () => {
    it('should render grid with SLAs', () => {
      render(
        <SLAsGrid
          loading={false}
          displaySlas={mockSlas}
          selectedSlaIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('simple-grid')).toBeInTheDocument()
    })

    it('should render grid with correct columns and gap', () => {
      render(
        <SLAsGrid
          loading={false}
          displaySlas={mockSlas}
          selectedSlaIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const grid = screen.getByTestId('simple-grid')
      expect(grid).toHaveAttribute('data-columns', '3')
      expect(grid).toHaveAttribute('data-gap', '4')
    })

    it('should render all SLAs', () => {
      render(
        <SLAsGrid
          loading={false}
          displaySlas={mockSlas}
          selectedSlaIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const slaCards = screen.getAllByTestId('sla-card')
      expect(slaCards).toHaveLength(3)
    })

    it('should render SLA names', () => {
      render(
        <SLAsGrid
          loading={false}
          displaySlas={mockSlas}
          selectedSlaIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Premium Support')).toBeInTheDocument()
      expect(screen.getByText('Standard Support')).toBeInTheDocument()
      expect(screen.getByText('Basic Support')).toBeInTheDocument()
    })

    it('should render SLA support channels', () => {
      render(
        <SLAsGrid
          loading={false}
          displaySlas={mockSlas}
          selectedSlaIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Channel: Email, Phone, Chat')).toBeInTheDocument()
      const emailChannels = screen.getAllByText('Channel: Email')
      expect(emailChannels.length).toBeGreaterThan(0)
    })

    it('should render SLA response times', () => {
      render(
        <SLAsGrid
          loading={false}
          displaySlas={mockSlas}
          selectedSlaIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Response: 4h')).toBeInTheDocument()
      expect(screen.getByText('Response: 24h')).toBeInTheDocument()
      expect(screen.getByText('Response: 48h')).toBeInTheDocument()
    })

    it('should render SLA availability schedules', () => {
      render(
        <SLAsGrid
          loading={false}
          displaySlas={mockSlas}
          selectedSlaIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Schedule: 24/7')).toBeInTheDocument()
      const businessHoursSchedules = screen.getAllByText('Schedule: Business Hours')
      expect(businessHoursSchedules.length).toBeGreaterThan(0)
    })

    it('should render SLA notes when present', () => {
      render(
        <SLAsGrid
          loading={false}
          displaySlas={mockSlas}
          selectedSlaIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Priority support for critical issues')).toBeInTheDocument()
      expect(screen.getByText('Community forum access')).toBeInTheDocument()
    })

    it('should not render notes when empty', () => {
      const slaWithoutNotes: SupportSLA[] = [{
        id: 1,
        name: 'Test SLA',
        support_channel: 'Email',
        response_time_hours: 24,
        availability_schedule: '24/7',
        notes: '',
        display_order: 1
      }]

      render(
        <SLAsGrid
          loading={false}
          displaySlas={slaWithoutNotes}
          selectedSlaIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Test SLA')).toBeInTheDocument()
      const textElements = screen.getAllByTestId('text')
      const notesTexts = textElements.filter(el => el.getAttribute('data-fontsize') === 'xs')
      expect(notesTexts).toHaveLength(0)
    })

    it('should render single SLA correctly', () => {
      const singleSla = [mockSlas[0]]

      render(
        <SLAsGrid
          loading={false}
          displaySlas={singleSla}
          selectedSlaIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const slaCards = screen.getAllByTestId('sla-card')
      expect(slaCards).toHaveLength(1)
      expect(screen.getByText('Premium Support')).toBeInTheDocument()
    })
  })

  describe('SLA Selection', () => {
    it('should show checkbox icon for unselected SLAs', () => {
      render(
        <SLAsGrid
          loading={false}
          displaySlas={mockSlas}
          selectedSlaIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const checkboxIcons = screen.getAllByTestId('checkbox-outline-icon')
      expect(checkboxIcons).toHaveLength(3)
    })

    it('should show plus icon for selected SLAs', () => {
      render(
        <SLAsGrid
          loading={false}
          displaySlas={mockSlas}
          selectedSlaIds={[1, 2]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const plusIcons = screen.getAllByTestId('fi-plus-icon')
      expect(plusIcons).toHaveLength(2)
    })

    it('should show mixed icons for partially selected SLAs', () => {
      render(
        <SLAsGrid
          loading={false}
          displaySlas={mockSlas}
          selectedSlaIds={[1]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByTestId('fi-plus-icon')).toHaveLength(1)
      expect(screen.getAllByTestId('checkbox-outline-icon')).toHaveLength(2)
    })

    it('should call handleToggleWithConfirm when SLA is clicked', async () => {
      const user = userEvent.setup()

      render(
        <SLAsGrid
          loading={false}
          displaySlas={mockSlas}
          selectedSlaIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const slaCards = screen.getAllByTestId('sla-card')
      await user.click(slaCards[0])

      expect(mockHandleToggleWithConfirm).toHaveBeenCalledWith(1)
    })

    it('should call handleToggleWithConfirm with correct SLA id', async () => {
      const user = userEvent.setup()

      render(
        <SLAsGrid
          loading={false}
          displaySlas={mockSlas}
          selectedSlaIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const slaCards = screen.getAllByTestId('sla-card')
      await user.click(slaCards[0])

      expect(mockHandleToggleWithConfirm).toHaveBeenCalledWith(1)
      expect(mockHandleToggleWithConfirm).toHaveBeenCalledTimes(1)
    })

    it('should handle multiple SLA clicks', async () => {
      const user = userEvent.setup()

      render(
        <SLAsGrid
          loading={false}
          displaySlas={mockSlas}
          selectedSlaIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const slaCards = screen.getAllByTestId('sla-card')
      await user.click(slaCards[0])
      await user.click(slaCards[1])
      await user.click(slaCards[2])

      expect(mockHandleToggleWithConfirm).toHaveBeenCalledTimes(3)
    })
  })

  describe('Read-Only Mode', () => {
    it('should not show selection icons in read-only mode', () => {
      render(
        <SLAsGrid
          loading={false}
          displaySlas={mockSlas}
          selectedSlaIds={[]}
          isReadOnly={true}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByTestId('checkbox-outline-icon')).not.toBeInTheDocument()
      expect(screen.queryByTestId('fi-plus-icon')).not.toBeInTheDocument()
    })

    it('should set cursor to default in read-only mode', () => {
      render(
        <SLAsGrid
          loading={false}
          displaySlas={mockSlas}
          selectedSlaIds={[]}
          isReadOnly={true}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const slaCards = screen.getAllByTestId('sla-card')
      slaCards.forEach(card => {
        expect(card).toHaveAttribute('data-cursor', 'default')
      })
    })

    it('should set cursor to pointer in edit mode', () => {
      render(
        <SLAsGrid
          loading={false}
          displaySlas={mockSlas}
          selectedSlaIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const slaCards = screen.getAllByTestId('sla-card')
      slaCards.forEach(card => {
        expect(card).toHaveAttribute('data-cursor', 'pointer')
      })
    })

    it('should not call handler when clicked in read-only mode', async () => {
      const user = userEvent.setup()

      render(
        <SLAsGrid
          loading={false}
          displaySlas={mockSlas}
          selectedSlaIds={[]}
          isReadOnly={true}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const slaCards = screen.getAllByTestId('sla-card')
      await user.click(slaCards[0])

      expect(mockHandleToggleWithConfirm).not.toHaveBeenCalled()
    })

    it('should render all SLAs in read-only mode', () => {
      render(
        <SLAsGrid
          loading={false}
          displaySlas={mockSlas}
          selectedSlaIds={[1, 2, 3]}
          isReadOnly={true}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Premium Support')).toBeInTheDocument()
      expect(screen.getByText('Standard Support')).toBeInTheDocument()
      expect(screen.getByText('Basic Support')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should return null when displaySlas is empty array with selected items', () => {
      render(
        <SLAsGrid
          loading={false}
          displaySlas={[]}
          selectedSlaIds={[1]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByTestId('simple-grid')).not.toBeInTheDocument()
      expect(screen.queryByTestId('slas-empty-state')).not.toBeInTheDocument()
    })

    it('should handle SLA with long name', () => {
      const longNameSla: SupportSLA[] = [{
        id: 1,
        name: 'This is a very long SLA name that should be displayed properly without breaking the layout',
        support_channel: 'Email',
        response_time_hours: 24,
        availability_schedule: '24/7',
        notes: '',
        display_order: 1
      }]

      render(
        <SLAsGrid
          loading={false}
          displaySlas={longNameSla}
          selectedSlaIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('This is a very long SLA name that should be displayed properly without breaking the layout')).toBeInTheDocument()
    })

    it('should handle SLA with long notes', () => {
      const longNotesSla: SupportSLA[] = [{
        id: 1,
        name: 'Premium SLA',
        support_channel: 'Email',
        response_time_hours: 4,
        availability_schedule: '24/7',
        notes: 'This is a very long note that contains multiple sentences and should be displayed properly within the card layout without causing any overflow or layout issues.',
        display_order: 1
      }]

      render(
        <SLAsGrid
          loading={false}
          displaySlas={longNotesSla}
          selectedSlaIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('This is a very long note that contains multiple sentences and should be displayed properly within the card layout without causing any overflow or layout issues.')).toBeInTheDocument()
    })

    it('should handle rapid clicks on same SLA', async () => {
      const user = userEvent.setup()

      render(
        <SLAsGrid
          loading={false}
          displaySlas={mockSlas}
          selectedSlaIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const slaCard = screen.getAllByTestId('sla-card')[0]
      await user.click(slaCard)
      await user.click(slaCard)
      await user.click(slaCard)

      expect(mockHandleToggleWithConfirm).toHaveBeenCalledTimes(3)
      expect(mockHandleToggleWithConfirm).toHaveBeenCalledWith(1)
    })

    it('should handle selectedSlaIds with non-existent ids', () => {
      render(
        <SLAsGrid
          loading={false}
          displaySlas={mockSlas}
          selectedSlaIds={[999, 1000]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      const checkboxIcons = screen.getAllByTestId('checkbox-outline-icon')
      expect(checkboxIcons).toHaveLength(3)
    })

    it('should handle mixed valid and invalid selectedSlaIds', () => {
      render(
        <SLAsGrid
          loading={false}
          displaySlas={mockSlas}
          selectedSlaIds={[1, 999]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByTestId('fi-plus-icon')).toHaveLength(1)
      expect(screen.getAllByTestId('checkbox-outline-icon')).toHaveLength(2)
    })
  })

  describe('Props Integration', () => {
    it('should update when loading prop changes', () => {
      const { rerender } = render(
        <SLAsGrid
          loading={true}
          displaySlas={mockSlas}
          selectedSlaIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('resource-grid-skeleton')).toBeInTheDocument()

      rerender(
        <Provider>
          <SLAsGrid
            loading={false}
            displaySlas={mockSlas}
            selectedSlaIds={[]}
            isReadOnly={false}
            handleToggleWithConfirm={mockHandleToggleWithConfirm}
          />
        </Provider>
      )

      expect(screen.queryByTestId('resource-grid-skeleton')).not.toBeInTheDocument()
      expect(screen.getByTestId('simple-grid')).toBeInTheDocument()
    })

    it('should update when selectedSlaIds prop changes', () => {
      const { rerender } = render(
        <SLAsGrid
          loading={false}
          displaySlas={mockSlas}
          selectedSlaIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByTestId('checkbox-outline-icon')).toHaveLength(3)

      rerender(
        <Provider>
          <SLAsGrid
            loading={false}
            displaySlas={mockSlas}
            selectedSlaIds={[1, 2]}
            isReadOnly={false}
            handleToggleWithConfirm={mockHandleToggleWithConfirm}
          />
        </Provider>
      )

      expect(screen.getAllByTestId('fi-plus-icon')).toHaveLength(2)
      expect(screen.getAllByTestId('checkbox-outline-icon')).toHaveLength(1)
    })

    it('should update when isReadOnly prop changes', () => {
      const { rerender } = render(
        <SLAsGrid
          loading={false}
          displaySlas={mockSlas}
          selectedSlaIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByTestId('checkbox-outline-icon')).toHaveLength(3)

      rerender(
        <Provider>
          <SLAsGrid
            loading={false}
            displaySlas={mockSlas}
            selectedSlaIds={[]}
            isReadOnly={true}
            handleToggleWithConfirm={mockHandleToggleWithConfirm}
          />
        </Provider>
      )

      expect(screen.queryByTestId('checkbox-outline-icon')).not.toBeInTheDocument()
    })

    it('should update when displaySlas prop changes', () => {
      const { rerender } = render(
        <SLAsGrid
          loading={false}
          displaySlas={mockSlas}
          selectedSlaIds={[]}
          isReadOnly={false}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByTestId('sla-card')).toHaveLength(3)

      const newSlas = [mockSlas[0]]
      rerender(
        <Provider>
          <SLAsGrid
            loading={false}
            displaySlas={newSlas}
            selectedSlaIds={[]}
            isReadOnly={false}
            handleToggleWithConfirm={mockHandleToggleWithConfirm}
          />
        </Provider>
      )

      expect(screen.getAllByTestId('sla-card')).toHaveLength(1)
    })
  })
})
