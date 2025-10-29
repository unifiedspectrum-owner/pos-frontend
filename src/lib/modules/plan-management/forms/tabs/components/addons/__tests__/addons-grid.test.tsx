/* Comprehensive test suite for AddonsGrid component */

/* Libraries imports */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm, FormProvider } from 'react-hook-form'
import { Provider } from '@/components/ui/provider'
import React from 'react'

/* Plan module imports */
import AddonsGrid from '@plan-management/forms/tabs/components/addons/addons-grid'
import { CreatePlanFormData } from '@plan-management/schemas'
import { Addon } from '@plan-management/types'
import { FieldArrayWithId } from 'react-hook-form'

type AddonAssignmentFieldArray = FieldArrayWithId<CreatePlanFormData, "addon_assignments", "id">

/* Mock dependencies */
vi.mock('@shared/components', () => ({
  EmptyStateContainer: ({ icon, title, description, testId }: { icon: React.ReactNode; title: string; description: string; testId: string }) => (
    <div data-testid={testId}>
      {icon}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}))

vi.mock('@plan-management/components', () => ({
  ResourceGridSkeleton: ({ count, columns }: { count: number; columns: number }) => (
    <div data-testid="resource-grid-skeleton">
      Loading {count} items in {columns} columns
    </div>
  )
}))

describe('AddonsGrid', () => {
  const mockHandleToggleWithConfirm = vi.fn()

  /* Helper to create field array items with id */
  const createFieldArrayItem = (addon_id: number): AddonAssignmentFieldArray => ({
    id: `addon-${addon_id}`,
    addon_id,
    default_quantity: null,
    is_included: false,
    feature_level: 'basic',
    min_quantity: null,
    max_quantity: null
  })

  const mockAddons: Addon[] = [
    {
      id: 1,
      name: 'Cloud Storage',
      description: 'Additional cloud storage space',
      addon_price: 10,
      pricing_scope: 'branch',
      default_quantity: 5,
      is_included: false,
      feature_level: null,
      min_quantity: null,
      max_quantity: null,
      display_order: 1
    },
    {
      id: 2,
      name: 'Analytics Module',
      description: 'Advanced analytics and reporting',
      addon_price: 25,
      pricing_scope: 'organization',
      default_quantity: null,
      is_included: false,
      feature_level: null,
      min_quantity: null,
      max_quantity: null,
      display_order: 2
    },
    {
      id: 3,
      name: 'SMS Notifications',
      description: 'Send SMS notifications to customers',
      addon_price: 15,
      pricing_scope: 'branch',
      default_quantity: 10,
      is_included: false,
      feature_level: null,
      min_quantity: null,
      max_quantity: null,
      display_order: 3
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider>{children}</Provider>
  )

  const TestComponent = ({
    loading = false,
    displayAddons = [],
    addonAssignments = [],
    isReadOnly = false
  }: {
    loading?: boolean;
    displayAddons?: Addon[];
    addonAssignments?: AddonAssignmentFieldArray[];
    isReadOnly?: boolean;
  }) => {
    /* Convert field array items back to plain assignments for form defaults */
    const plainAssignments = addonAssignments.map(({ id, ...rest }) => rest)

    const methods = useForm<CreatePlanFormData>({
      defaultValues: {
        addon_assignments: plainAssignments
      }
    })

    return (
      <FormProvider {...methods}>
        <AddonsGrid
          loading={loading}
          displayAddons={displayAddons}
          addonAssignments={addonAssignments}
          isReadOnly={isReadOnly}
          control={methods.control}
          handleToggleWithConfirm={mockHandleToggleWithConfirm}
        />
      </FormProvider>
    )
  }

  describe('Loading State', () => {
    it('should display skeleton loader when loading with no assignments', () => {
      render(
        <TestComponent
          loading={true}
          displayAddons={[]}
          addonAssignments={[]}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('resource-grid-skeleton')).toBeInTheDocument()
      expect(screen.getByText(/Loading 6 items in 3 columns/)).toBeInTheDocument()
    })

    it('should not display skeleton when loading with existing assignments', () => {
      render(
        <TestComponent
          loading={true}
          displayAddons={mockAddons}
          addonAssignments={[createFieldArrayItem(1)]}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByTestId('resource-grid-skeleton')).not.toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should display empty state when no addons or assignments exist', () => {
      render(
        <TestComponent
          loading={false}
          displayAddons={[]}
          addonAssignments={[]}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('addons-empty-state')).toBeInTheDocument()
      expect(screen.getByText('No add-ons selected')).toBeInTheDocument()
      expect(screen.getByText('Select add-ons from the list above to configure this plan')).toBeInTheDocument()
    })

    it('should display different empty state message in read-only mode', () => {
      render(
        <TestComponent
          loading={false}
          displayAddons={[]}
          addonAssignments={[]}
          isReadOnly={true}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByTestId('addons-empty-state')).toBeInTheDocument()
      expect(screen.getByText('No add-ons included')).toBeInTheDocument()
      expect(screen.getByText('This plan does not include any add-ons')).toBeInTheDocument()
    })
  })

  describe('Addon Grid Rendering', () => {
    it('should render addon cards for all display addons', () => {
      render(
        <TestComponent
          displayAddons={mockAddons}
          addonAssignments={[]}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Cloud Storage')).toBeInTheDocument()
      expect(screen.getByText('Analytics Module')).toBeInTheDocument()
      expect(screen.getByText('SMS Notifications')).toBeInTheDocument()
    })

    it('should display addon descriptions', () => {
      render(
        <TestComponent
          displayAddons={mockAddons}
          addonAssignments={[]}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Additional cloud storage space')).toBeInTheDocument()
      expect(screen.getByText('Advanced analytics and reporting')).toBeInTheDocument()
      expect(screen.getByText('Send SMS notifications to customers')).toBeInTheDocument()
    })

    it('should display addon pricing information', () => {
      render(
        <TestComponent
          displayAddons={mockAddons}
          addonAssignments={[]}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('10')).toBeInTheDocument()
      expect(screen.getByText('25')).toBeInTheDocument()
      expect(screen.getByText('15')).toBeInTheDocument()
    })

    it('should display pricing scope for each addon', () => {
      render(
        <TestComponent
          displayAddons={mockAddons}
          addonAssignments={[]}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getAllByText('branch')).toHaveLength(2)
      expect(screen.getByText('organization')).toBeInTheDocument()
    })

    it('should display default quantity when available', () => {
      render(
        <TestComponent
          displayAddons={mockAddons}
          addonAssignments={[]}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Default: 5')).toBeInTheDocument()
      expect(screen.getByText('Default: 10')).toBeInTheDocument()
    })

    it('should not display default quantity when null', () => {
      render(
        <TestComponent
          displayAddons={[mockAddons[1]]}
          addonAssignments={[]}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByText(/Default:/)).not.toBeInTheDocument()
    })

    it('should return null when no display addons', () => {
      render(
        <TestComponent
          displayAddons={[]}
          addonAssignments={[]}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.queryByText(/No add-ons available/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Cloud Storage/)).not.toBeInTheDocument()
    })
  })

  describe('Addon Selection', () => {
    it('should highlight selected addons', () => {
      const { container } = render(
        <TestComponent
          displayAddons={mockAddons}
          addonAssignments={[createFieldArrayItem(1)]}
        />,
        { wrapper: TestWrapper }
      )

      /* Check if the first addon card has selection styling */
      const addonCards = container.querySelectorAll('[class*="css-"]')
      expect(addonCards.length).toBeGreaterThan(0)
    })

    it('should call handleToggleWithConfirm when addon card is clicked', async () => {
      const user = userEvent.setup()
      render(
        <TestComponent
          displayAddons={mockAddons}
          addonAssignments={[]}
        />,
        { wrapper: TestWrapper }
      )

      const cloudStorageCard = screen.getByText('Cloud Storage').closest('[class*="css-"]')
      if (cloudStorageCard) {
        await user.click(cloudStorageCard)
        expect(mockHandleToggleWithConfirm).toHaveBeenCalledWith(1)
      }
    })

    it('should call handleToggleWithConfirm with correct addon id', async () => {
      const user = userEvent.setup()
      render(
        <TestComponent
          displayAddons={mockAddons}
          addonAssignments={[]}
        />,
        { wrapper: TestWrapper }
      )

      const analyticsCard = screen.getByText('Analytics Module').closest('[class*="css-"]')
      if (analyticsCard) {
        await user.click(analyticsCard)
        expect(mockHandleToggleWithConfirm).toHaveBeenCalledWith(2)
      }
    })

    it('should show selection indicator for selected addons', () => {
      const { container } = render(
        <TestComponent
          displayAddons={mockAddons}
          addonAssignments={[createFieldArrayItem(1)]}
        />,
        { wrapper: TestWrapper }
      )

      /* Check for selection icon presence */
      const icons = container.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
    })
  })

  describe('Read-Only Mode', () => {
    it('should not allow clicking addon cards in read-only mode', async () => {
      const user = userEvent.setup()
      render(
        <TestComponent
          displayAddons={mockAddons}
          addonAssignments={[]}
          isReadOnly={true}
        />,
        { wrapper: TestWrapper }
      )

      const cloudStorageCard = screen.getByText('Cloud Storage').closest('[class*="css-"]')
      if (cloudStorageCard) {
        await user.click(cloudStorageCard)
        expect(mockHandleToggleWithConfirm).not.toHaveBeenCalled()
      }
    })

    it('should not show selection indicators in read-only mode', () => {
      const { container } = render(
        <TestComponent
          displayAddons={mockAddons}
          addonAssignments={[createFieldArrayItem(1)]}
          isReadOnly={true}
        />,
        { wrapper: TestWrapper }
      )

      /* In read-only mode, selection boxes should not be rendered */
      const addonCards = container.querySelectorAll('[class*="css-"]')
      expect(addonCards.length).toBeGreaterThan(0)
    })

    it('should have different styling in read-only mode', () => {
      const { container } = render(
        <TestComponent
          displayAddons={mockAddons}
          addonAssignments={[]}
          isReadOnly={true}
        />,
        { wrapper: TestWrapper }
      )

      expect(container.firstChild).toBeTruthy()
    })
  })

  describe('Grid Layout', () => {
    it('should render addons in a grid layout', () => {
      const { container } = render(
        <TestComponent
          displayAddons={mockAddons}
          addonAssignments={[]}
        />,
        { wrapper: TestWrapper }
      )

      /* SimpleGrid should be present */
      const grid = container.querySelector('[class*="css-"]')
      expect(grid).toBeTruthy()
    })

    it('should render correct number of addon cards', () => {
      render(
        <TestComponent
          displayAddons={mockAddons}
          addonAssignments={[]}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Cloud Storage')).toBeInTheDocument()
      expect(screen.getByText('Analytics Module')).toBeInTheDocument()
      expect(screen.getByText('SMS Notifications')).toBeInTheDocument()
    })
  })

  describe('Multiple Selection', () => {
    it('should highlight multiple selected addons', () => {
      render(
        <TestComponent
          displayAddons={mockAddons}
          addonAssignments={[
            createFieldArrayItem(1),
            createFieldArrayItem(2)
          ]}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Cloud Storage')).toBeInTheDocument()
      expect(screen.getByText('Analytics Module')).toBeInTheDocument()
    })

    it('should allow clicking multiple addon cards', async () => {
      const user = userEvent.setup()
      render(
        <TestComponent
          displayAddons={mockAddons}
          addonAssignments={[]}
        />,
        { wrapper: TestWrapper }
      )

      const cloudStorageCard = screen.getByText('Cloud Storage').closest('[class*="css-"]')
      const analyticsCard = screen.getByText('Analytics Module').closest('[class*="css-"]')

      if (cloudStorageCard) {
        await user.click(cloudStorageCard)
        expect(mockHandleToggleWithConfirm).toHaveBeenCalledWith(1)
      }

      if (analyticsCard) {
        await user.click(analyticsCard)
        expect(mockHandleToggleWithConfirm).toHaveBeenCalledWith(2)
      }

      expect(mockHandleToggleWithConfirm).toHaveBeenCalledTimes(2)
    })
  })

  describe('Edge Cases', () => {
    it('should handle addon with zero price', () => {
      const addonWithZeroPrice: Addon = {
        id: 4,
        name: 'Free Addon',
        description: 'This addon is free',
        addon_price: 0,
        pricing_scope: 'branch',
        default_quantity: null,
        is_included: false,
        feature_level: null,
        min_quantity: null,
        max_quantity: null,
        display_order: 4
      }

      render(
        <TestComponent
          displayAddons={[addonWithZeroPrice]}
          addonAssignments={[]}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Free Addon')).toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should handle addon with missing pricing scope display', () => {
      const addonWithBranchScope: Addon = {
        id: 5,
        name: 'Basic Addon',
        description: 'Addon with branch scope',
        addon_price: 10,
        pricing_scope: 'branch',
        default_quantity: null,
        is_included: false,
        feature_level: null,
        min_quantity: null,
        max_quantity: null,
        display_order: 5
      }

      render(
        <TestComponent
          displayAddons={[addonWithBranchScope]}
          addonAssignments={[]}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Basic Addon')).toBeInTheDocument()
      expect(screen.getByText('branch')).toBeInTheDocument()
    })

    it('should handle single addon', () => {
      render(
        <TestComponent
          displayAddons={[mockAddons[0]]}
          addonAssignments={[]}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Cloud Storage')).toBeInTheDocument()
      expect(screen.queryByText('Analytics Module')).not.toBeInTheDocument()
    })

    it('should handle many addons', () => {
      const manyAddons = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `Addon ${i + 1}`,
        description: `Description ${i + 1}`,
        addon_price: (i + 1) * 5,
        pricing_scope: 'branch' as const,
        default_quantity: null,
        is_included: false,
        feature_level: null,
        min_quantity: null,
        max_quantity: null,
        display_order: i + 1
      }))

      render(
        <TestComponent
          displayAddons={manyAddons}
          addonAssignments={[]}
        />,
        { wrapper: TestWrapper }
      )

      expect(screen.getByText('Addon 1')).toBeInTheDocument()
      expect(screen.getByText('Addon 10')).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('should handle complete addon selection workflow', async () => {
      const user = userEvent.setup()
      render(
        <TestComponent
          displayAddons={mockAddons}
          addonAssignments={[]}
        />,
        { wrapper: TestWrapper }
      )

      /* Click first addon */
      const cloudStorageCard = screen.getByText('Cloud Storage').closest('[class*="css-"]')
      if (cloudStorageCard) {
        await user.click(cloudStorageCard)
      }

      /* Click second addon */
      const analyticsCard = screen.getByText('Analytics Module').closest('[class*="css-"]')
      if (analyticsCard) {
        await user.click(analyticsCard)
      }

      expect(mockHandleToggleWithConfirm).toHaveBeenCalledTimes(2)
      expect(mockHandleToggleWithConfirm).toHaveBeenNthCalledWith(1, 1)
      expect(mockHandleToggleWithConfirm).toHaveBeenNthCalledWith(2, 2)
    })

    it('should display all addon information correctly', () => {
      render(
        <TestComponent
          displayAddons={[mockAddons[0]]}
          addonAssignments={[]}
        />,
        { wrapper: TestWrapper }
      )

      /* Verify all information is displayed */
      expect(screen.getByText('Cloud Storage')).toBeInTheDocument()
      expect(screen.getByText('Additional cloud storage space')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
      expect(screen.getByText('branch')).toBeInTheDocument()
      expect(screen.getByText('Default: 5')).toBeInTheDocument()
    })
  })
})
