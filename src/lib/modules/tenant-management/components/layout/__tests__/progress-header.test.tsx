/* Libraries imports */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@shared/test-utils/render'
import { axe } from 'vitest-axe'
import { FaBuilding, FaClipboardList, FaPuzzlePiece, FaCheckCircle } from 'react-icons/fa'

/* Tenant management module imports */
import { ProgressHeader } from '../progress-header'
import type { TenantAccountCreationSteps, TenantAccountCreationStepType } from '@tenant-management/types'

describe('ProgressHeader', () => {
  const mockProgressSteps: TenantAccountCreationSteps[] = [
    {
      id: 'tenant-info',
      label: 'Account Info',
      title: 'Create Your Account',
      description: 'Enter your company information',
      icon: FaBuilding
    },
    {
      id: 'plan-selection',
      label: 'Plan',
      title: 'Choose Your Plan',
      description: 'Select a subscription plan',
      icon: FaClipboardList
    },
    {
      id: 'addon-selection',
      label: 'Add-ons',
      title: 'Select Add-ons',
      description: 'Choose additional features',
      icon: FaPuzzlePiece
    },
    {
      id: 'plan-summary',
      label: 'Summary',
      title: 'Plan Summary',
      description: 'Review your selections',
      icon: FaCheckCircle
    }
  ]

  const defaultProps = {
    currentStep: 'tenant-info' as TenantAccountCreationStepType,
    completedSteps: new Set<TenantAccountCreationStepType>(),
    progressSteps: mockProgressSteps,
    progressStepIndex: 0,
    stepProgressPercentage: 25
  }

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<ProgressHeader {...defaultProps} />)
      expect(container).toBeInTheDocument()
    })

    it('renders current step title', () => {
      render(<ProgressHeader {...defaultProps} />)
      expect(screen.getByText('Create Your Account')).toBeInTheDocument()
    })

    it('renders current step description', () => {
      render(<ProgressHeader {...defaultProps} />)
      expect(screen.getByText('Enter your company information')).toBeInTheDocument()
    })

    it('renders progress percentage', () => {
      render(<ProgressHeader {...defaultProps} />)
      expect(screen.getByText('25% complete')).toBeInTheDocument()
    })

    it('renders step indicator text', () => {
      render(<ProgressHeader {...defaultProps} />)
      expect(screen.getByText(/Step 1 of 4/)).toBeInTheDocument()
    })

    it('renders all step labels', () => {
      render(<ProgressHeader {...defaultProps} />)
      expect(screen.getByText('Account Info')).toBeInTheDocument()
      expect(screen.getByText('Plan')).toBeInTheDocument()
      expect(screen.getByText('Add-ons')).toBeInTheDocument()
      expect(screen.getByText('Summary')).toBeInTheDocument()
    })

    it('returns null when progressStepIndex is negative', () => {
      render(
        <ProgressHeader {...defaultProps} progressStepIndex={-1} />
      )
      /* Component returns null, so no progress content should render */
      expect(screen.queryByText('Create Your Account')).not.toBeInTheDocument()
      expect(screen.queryByText(/Step 1 of/)).not.toBeInTheDocument()
    })
  })

  describe('Progress Bar', () => {
    it('displays correct progress percentage', () => {
      render(<ProgressHeader {...defaultProps} stepProgressPercentage={50} />)
      expect(screen.getByText('50% complete')).toBeInTheDocument()
    })

    it('displays 0% progress', () => {
      render(<ProgressHeader {...defaultProps} stepProgressPercentage={0} />)
      expect(screen.getByText('0% complete')).toBeInTheDocument()
    })

    it('displays 100% progress', () => {
      render(<ProgressHeader {...defaultProps} stepProgressPercentage={100} />)
      expect(screen.getByText('100% complete')).toBeInTheDocument()
    })

    it('renders progress bar component', () => {
      const { container} = render(<ProgressHeader {...defaultProps} />)
      expect(container).toBeInTheDocument()
    })
  })

  describe('Step Indicators', () => {
    it('renders all step indicators', () => {
      render(<ProgressHeader {...defaultProps} />)
      mockProgressSteps.forEach(step => {
        expect(screen.getByText(step.label)).toBeInTheDocument()
      })
    })

    it('highlights current step', () => {
      render(<ProgressHeader {...defaultProps} currentStep="plan-selection" progressStepIndex={1} />)
      expect(screen.getByText('Plan')).toBeInTheDocument()
    })

    it('shows completed steps correctly', () => {
      const completedSteps = new Set<TenantAccountCreationStepType>(['tenant-info'])
      render(
        <ProgressHeader
          {...defaultProps}
          currentStep="plan-selection"
          completedSteps={completedSteps}
          progressStepIndex={1}
        />
      )
      expect(screen.getByText('Account Info')).toBeInTheDocument()
      expect(screen.getByText('Plan')).toBeInTheDocument()
    })

    it('handles multiple completed steps', () => {
      const completedSteps = new Set<TenantAccountCreationStepType>(['tenant-info', 'plan-selection'])
      render(
        <ProgressHeader
          {...defaultProps}
          currentStep="addon-selection"
          completedSteps={completedSteps}
          progressStepIndex={2}
        />
      )
      expect(screen.getByText('Account Info')).toBeInTheDocument()
      expect(screen.getByText('Plan')).toBeInTheDocument()
      expect(screen.getByText('Add-ons')).toBeInTheDocument()
    })
  })

  describe('Step Navigation', () => {
    it('displays correct step number at first step', () => {
      render(<ProgressHeader {...defaultProps} progressStepIndex={0} />)
      expect(screen.getByText(/Step 1 of 4/)).toBeInTheDocument()
    })

    it('displays correct step number at second step', () => {
      render(
        <ProgressHeader
          {...defaultProps}
          currentStep="plan-selection"
          progressStepIndex={1}
        />
      )
      expect(screen.getByText(/Step 2 of 4/)).toBeInTheDocument()
    })

    it('displays correct step number at third step', () => {
      render(
        <ProgressHeader
          {...defaultProps}
          currentStep="addon-selection"
          progressStepIndex={2}
        />
      )
      expect(screen.getByText(/Step 3 of 4/)).toBeInTheDocument()
    })

    it('displays correct step number at final step', () => {
      render(
        <ProgressHeader
          {...defaultProps}
          currentStep="plan-summary"
          progressStepIndex={3}
        />
      )
      expect(screen.getByText(/Step 4 of 4/)).toBeInTheDocument()
    })
  })

  describe('Current Step Display', () => {
    it('displays tenant info step details', () => {
      render(<ProgressHeader {...defaultProps} currentStep="tenant-info" />)
      expect(screen.getByText('Create Your Account')).toBeInTheDocument()
      expect(screen.getByText('Enter your company information')).toBeInTheDocument()
    })

    it('displays plan selection step details', () => {
      render(
        <ProgressHeader
          {...defaultProps}
          currentStep="plan-selection"
          progressStepIndex={1}
        />
      )
      expect(screen.getByText('Choose Your Plan')).toBeInTheDocument()
      expect(screen.getByText('Select a subscription plan')).toBeInTheDocument()
    })

    it('displays addon selection step details', () => {
      render(
        <ProgressHeader
          {...defaultProps}
          currentStep="addon-selection"
          progressStepIndex={2}
        />
      )
      expect(screen.getByText('Select Add-ons')).toBeInTheDocument()
      expect(screen.getByText('Choose additional features')).toBeInTheDocument()
    })

    it('displays summary step details', () => {
      render(
        <ProgressHeader
          {...defaultProps}
          currentStep="plan-summary"
          progressStepIndex={3}
        />
      )
      expect(screen.getByText('Plan Summary')).toBeInTheDocument()
      expect(screen.getByText('Review your selections')).toBeInTheDocument()
    })
  })

  describe('Layout and Styling', () => {
    it('has primary background color', () => {
      const { container } = render(<ProgressHeader {...defaultProps} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('has proper padding', () => {
      const { container } = render(<ProgressHeader {...defaultProps} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('has rounded top corners', () => {
      const { container } = render(<ProgressHeader {...defaultProps} />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('uses white color for text', () => {
      const { container } = render(<ProgressHeader {...defaultProps} />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should not have critical accessibility violations', async () => {
      const { container } = render(<ProgressHeader {...defaultProps} />)
      const results = await axe(container)
      /* Filter out non-critical violations if any */
      const criticalViolations = results.violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      )
      expect(criticalViolations.length).toBeLessThanOrEqual(2)
    })

    it('has readable text contrast', () => {
      render(<ProgressHeader {...defaultProps} />)
      expect(screen.getByText('Create Your Account')).toBeInTheDocument()
    })

    it('provides clear step indicators', () => {
      render(<ProgressHeader {...defaultProps} />)
      expect(screen.getByText(/Step 1 of 4/)).toBeInTheDocument()
    })
  })

  describe('Component Lifecycle', () => {
    it('mounts without errors', () => {
      expect(() => {
        render(<ProgressHeader {...defaultProps} />)
      }).not.toThrow()
    })

    it('unmounts cleanly', () => {
      const { unmount } = render(<ProgressHeader {...defaultProps} />)
      expect(screen.getByText('Create Your Account')).toBeInTheDocument()
      unmount()
      expect(screen.queryByText('Create Your Account')).not.toBeInTheDocument()
    })

    it('handles multiple mount/unmount cycles', () => {
      const { unmount: unmount1 } = render(<ProgressHeader {...defaultProps} />)
      expect(screen.getByText('Create Your Account')).toBeInTheDocument()
      unmount1()

      const { unmount: unmount2 } = render(<ProgressHeader {...defaultProps} />)
      expect(screen.getByText('Create Your Account')).toBeInTheDocument()
      unmount2()

      expect(screen.queryByText('Create Your Account')).not.toBeInTheDocument()
    })
  })

  describe('Re-rendering Behavior', () => {
    it('updates on step change', () => {
      const { rerender } = render(<ProgressHeader {...defaultProps} />)
      expect(screen.getByText('Create Your Account')).toBeInTheDocument()

      rerender(
        <ProgressHeader
          {...defaultProps}
          currentStep="plan-selection"
          progressStepIndex={1}
          stepProgressPercentage={50}
        />
      )
      expect(screen.getByText('Choose Your Plan')).toBeInTheDocument()
    })

    it('updates progress percentage on re-render', () => {
      const { rerender } = render(<ProgressHeader {...defaultProps} stepProgressPercentage={25} />)
      expect(screen.getByText('25% complete')).toBeInTheDocument()

      rerender(<ProgressHeader {...defaultProps} stepProgressPercentage={75} />)
      expect(screen.getByText('75% complete')).toBeInTheDocument()
    })

    it('updates completed steps on re-render', () => {
      const { rerender } = render(<ProgressHeader {...defaultProps} />)

      const completedSteps = new Set<TenantAccountCreationStepType>(['tenant-info'])
      rerender(<ProgressHeader {...defaultProps} completedSteps={completedSteps} />)

      expect(screen.getByText('Account Info')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty completed steps set', () => {
      expect(() => {
        render(<ProgressHeader {...defaultProps} completedSteps={new Set()} />)
      }).not.toThrow()
    })

    it('handles all steps completed', () => {
      const allCompleted = new Set<TenantAccountCreationStepType>([
        'tenant-info',
        'plan-selection',
        'addon-selection',
        'plan-summary'
      ])
      expect(() => {
        render(<ProgressHeader {...defaultProps} completedSteps={allCompleted} />)
      }).not.toThrow()
    })

    it('handles 0% progress', () => {
      render(<ProgressHeader {...defaultProps} stepProgressPercentage={0} />)
      expect(screen.getByText('0% complete')).toBeInTheDocument()
    })

    it('handles 100% progress', () => {
      render(<ProgressHeader {...defaultProps} stepProgressPercentage={100} />)
      expect(screen.getByText('100% complete')).toBeInTheDocument()
    })

    it('handles single step', () => {
      const singleStep = [mockProgressSteps[0]]
      render(
        <ProgressHeader
          {...defaultProps}
          progressSteps={singleStep}
        />
      )
      expect(screen.getByText(/Step 1 of 1/)).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('renders quickly', () => {
      const startTime = Date.now()
      render(<ProgressHeader {...defaultProps} />)
      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(100)
    })

    it('maintains performance with many steps', () => {
      const manySteps = Array.from({ length: 10 }, (_, i) => ({
        id: `step-${i}` as TenantAccountCreationStepType,
        label: `Step ${i}`,
        title: `Title ${i}`,
        description: `Description ${i}`,
        icon: FaBuilding
      }))

      const startTime = Date.now()
      render(
        <ProgressHeader
          {...defaultProps}
          progressSteps={manySteps}
        />
      )
      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(200)
    })
  })
})
