/* React and Chakra UI component imports */
import React from 'react'
import { Flex, SegmentGroup, Badge, Text } from '@chakra-ui/react'

/* Shared module imports */
import { PRIMARY_COLOR, WHITE_COLOR } from '@shared/config'

/* Tenant module imports */
import { getBillingCycleLabel } from '@tenant-management/utils'
import { PLAN_BILLING_CYCLE, PLAN_BILLING_CYCLES } from '@tenant-management/constants'
import { PlanBillingCycle } from '@tenant-management/types'

/* Component props interface */
interface BillingCycleSelectorProps {
  value: PlanBillingCycle
  onChange: (cycle: PlanBillingCycle) => void
  discountPercentage?: number
}

/* Billing cycle selector component with discount badge */
const BillingCycleSelector: React.FC<BillingCycleSelectorProps> = ({
  value,
  onChange,
  discountPercentage = 0,
}) => {
  return (
    <Flex justify="center" alignItems={'center'} position="relative" mb={3}>
      <SegmentGroup.Root 
        value={value} 
        onValueChange={(e) => onChange(e.value as PlanBillingCycle)}
        defaultValue={PLAN_BILLING_CYCLE.MONTHLY}
        borderRadius={50}
      >
        <SegmentGroup.Indicator borderRadius={50} bg={PRIMARY_COLOR} />
        <SegmentGroup.Items
          py={6}
          px={10}
          fontSize={'md'}
          _checked={{ color: WHITE_COLOR }}
          items={PLAN_BILLING_CYCLES.map((cycle) => ({
            value: cycle,
            /* Show discount badge for yearly billing when discount exists */
            label: cycle === PLAN_BILLING_CYCLE.YEARLY && discountPercentage > 0 ? (
              <Flex position="relative">
                <Text>{
                  getBillingCycleLabel({
                    billingCycle: cycle,
                    capitalize: true
                  })
                }</Text>
                <Badge
                  variant="solid" 
                  fontSize="xx-small" 
                  position="absolute"
                  top="-30px" 
                  right="-10px" 
                  borderRadius="full" 
                  px="2"
                >
                  Save {discountPercentage}%
                </Badge>
              </Flex>
            ) : getBillingCycleLabel({billingCycle: cycle, capitalize: true})
          }))}
        />
      </SegmentGroup.Root>
    </Flex>
  )
}

export default BillingCycleSelector