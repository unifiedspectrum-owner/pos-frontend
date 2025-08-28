/* React and Chakra UI component imports */
import React from 'react'
import { Flex, SegmentGroup, Badge } from '@chakra-ui/react'

/* Tenant module imports */
import { formatBillingCycleLabel } from '@tenant-management/utils/pricing-helpers'
import { PLAN_BILLING_CYCLES } from '@tenant-management/constants'
import { PlanBillingCycle } from '@tenant-management/types'

/* Component props interface */
interface BillingCycleSelectorProps {
  value: PlanBillingCycle
  onChange: (cycle: PlanBillingCycle) => void
  discountPercentage?: number
  disabled?: boolean
}

/* Billing cycle selector component with discount badge */
const BillingCycleSelector: React.FC<BillingCycleSelectorProps> = ({
  value,
  onChange,
  discountPercentage = 0,
  disabled = false
}) => {
  return (
    <Flex justify="center" position="relative">
      <SegmentGroup.Root 
        value={value} 
        onValueChange={(e) => onChange(e.value as PlanBillingCycle)}
        defaultValue={PLAN_BILLING_CYCLES[0]}
        disabled={disabled}
      >
        <SegmentGroup.Indicator />
        <SegmentGroup.Items 
          p="20px"  
          items={PLAN_BILLING_CYCLES.map((cycle) => ({
            value: cycle,
            /* Show discount badge for yearly billing when discount exists */
            label: cycle === 'yearly' && discountPercentage > 0 ? (
              <Flex position="relative">
                {formatBillingCycleLabel(cycle)}
                <Badge
                  variant="solid" 
                  fontSize="xx-small" 
                  position="absolute"
                  top="-20px" 
                  right="-10px" 
                  borderRadius="full" 
                  px="2"
                >
                  Save {discountPercentage}%
                </Badge>
              </Flex>
            ) : formatBillingCycleLabel(cycle)
          }))}
        />
      </SegmentGroup.Root>
    </Flex>
  )
}

export default BillingCycleSelector