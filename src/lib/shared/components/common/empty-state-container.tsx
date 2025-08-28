/* React and Chakra UI component imports */
import React from 'react';
import { EmptyState, VStack, Box } from '@chakra-ui/react';

/* Props interface for empty state container */
interface EmptyStateContainerProps {
  icon: React.ReactNode; /* Icon element to display */
  title: string; /* Main title text */
  description: string; /* Descriptive text */
  testId?: string; /* Optional test identifier */
}

/* Reusable empty state container component with consistent border styling */
const EmptyStateContainer: React.FC<EmptyStateContainerProps> = ({
  icon,
  title,
  description,
  testId
}) => {
  return (
    <Box
      border="1px solid"
      borderColor="gray.200"
      borderRadius="lg"
      p={8}
      textAlign="center"
      bg="gray.50"
    >
      <EmptyState.Root size={'sm'} data-testid={testId}>
        <EmptyState.Content>
          {/* Empty state icon indicator */}
          <EmptyState.Indicator>
            {icon}
          </EmptyState.Indicator>
          
          {/* Text content */}
          <VStack textAlign="center">
            <EmptyState.Title>{title}</EmptyState.Title>
            <EmptyState.Description>
              {description}
            </EmptyState.Description>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    </Box>
  );
};

export default EmptyStateContainer;