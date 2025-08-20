import React from 'react'
import { Box, Text, Flex, Button } from '@chakra-ui/react'
import { FiX } from 'react-icons/fi'
import { FaPlus } from 'react-icons/fa'
import { lighten } from 'polished'
import { Feature } from '@plan-management/types'
import { GRAY_COLOR, SECONDARY_COLOR } from '@shared/config'
import { EmptyStateContainer } from '@shared/components'

/* Selected features summary component props */
interface SelectedFeaturesSummaryProps {
  selectedFeatures: Feature[] /* Currently selected features array */
  onRemove: (id: number) => void /* Feature removal handler */
  readOnly?: boolean /* Is component in read-only mode */
}

/* Summary display of selected features with removal option */
const SelectedFeaturesSummary: React.FC<SelectedFeaturesSummaryProps> = ({
  selectedFeatures,
  onRemove,
  readOnly = false
}) => {
  return (
    <Box>
      {/* Section header with selected count */}
      <Text fontSize="md" fontWeight="semibold" color={GRAY_COLOR} mb={3}>
        Selected Features ({selectedFeatures.length})
      </Text>
      
      {selectedFeatures.length > 0 ? (
        /* Features displayed as removable tags */
        <Flex flexWrap="wrap" gap={2}>
          {selectedFeatures.map((feature) => (
            /* Individual feature tag with remove button */
            <Flex
              key={feature.id}
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
              <Text>{feature.name}</Text>
              {!readOnly && (
                /* Remove button for individual feature */
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(feature.id);
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
        /* Empty state when no features selected */
        <EmptyStateContainer
          icon={<FaPlus size={48} color={lighten(0.2, GRAY_COLOR)} />}
          title="No features selected"
          description="Select features from the list above to configure this plan"
          testId="selected-features-empty-state"
        />
      )}
    </Box>
  )
}

export default SelectedFeaturesSummary;