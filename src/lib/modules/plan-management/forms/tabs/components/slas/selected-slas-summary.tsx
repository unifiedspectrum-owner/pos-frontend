/* Summary component for displaying selected SLAs with removal functionality */
import React from 'react'
import { Box, Text, Flex, Button } from '@chakra-ui/react'
import { FiX } from 'react-icons/fi'
import { FaPlus } from 'react-icons/fa'
import { lighten } from 'polished'

/* Types */
import { SupportSLA } from '@plan-management/types'

/* Constants */
import { GRAY_COLOR, SECONDARY_COLOR } from '@shared/config'

/* Components */
import { EmptyStateContainer } from '@shared/components'

interface SelectedSLAsSummaryProps {
  selectedSlas: SupportSLA[]
  onRemove: (id: number) => void
  readOnly?: boolean
}

const SelectedSLAsSummary: React.FC<SelectedSLAsSummaryProps> = ({
  selectedSlas,
  onRemove,
  readOnly = false
}) => {
  return (
    <Box>
      <Text fontSize="md" fontWeight="semibold" color={GRAY_COLOR} mb={3}>
        Selected SLAs ({selectedSlas.length})
      </Text>
      
      {selectedSlas.length > 0 ? (
        <Flex flexWrap="wrap" gap={2}>
          {selectedSlas.map((sla) => (
            <Flex
              key={sla.id}
              p={10}
              bg={lighten(0.3, SECONDARY_COLOR)}
              color={SECONDARY_COLOR}
              borderWidth={1}
              borderRadius="lg"
              borderColor={lighten(0.2, SECONDARY_COLOR)}
              px={3}
              py={1}
              justify={'space-between'}
              fontSize="sm"
              fontWeight="medium"
              align="center"
              gap={2}
              cursor="pointer"
              _hover={{ opacity: 0.8 }}
              transition="opacity 0.2s"
            >
              <Text>{sla.name}</Text>
              {!readOnly && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(sla.id);
                  }}
                  p={0.5}
                  borderRadius="sm"
                  bg={'transparent'}
                  color={SECONDARY_COLOR}
                  transition="background 0.2s"
                >
                  <FiX fontSize={'20px'}/>
                </Button>
              )}
            </Flex>
          ))}
        </Flex>
      ) : (
        /* Empty state when no SLAs are selected */
        <EmptyStateContainer
          icon={<FaPlus size={48} color={lighten(0.2, GRAY_COLOR)} />}
          title="No SLAs selected"
          description="Select SLAs from the list above to configure this plan"
          testId="selected-slas-empty-state"
        />
      )}
    </Box>
  )
}

export default SelectedSLAsSummary