import React from 'react'
import { Flex, SegmentGroup, Badge } from '@chakra-ui/react'
import { formatBillingCycleLabel } from '../utils/pricing-helpers'
import { PLAN_BILLING_CYCLES } from '../constants'
import { PlanBillingCycle } from '../types'

interface BillingCycleSelectorProps {
  value: PlanBillingCycle
  onChange: (cycle: PlanBillingCycle) => void
  discountPercentage?: number
  disabled?: boolean
}

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