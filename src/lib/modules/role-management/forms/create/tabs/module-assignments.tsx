/* Libraries imports */
import React from 'react'
import { Flex, Text, Box } from '@chakra-ui/react'
import { FaCog } from 'react-icons/fa'

/* Module assignments placeholder tab */
const ModuleAssignmentsTab: React.FC = () => {
  return (
    <Flex flexDir="column" gap={6} align="center" justify="center" minH="300px">
      {/* Placeholder content */}
      <Box textAlign="center">
        <FaCog size={48} color="gray.400" />
        <Text fontSize="xl" fontWeight="semibold" color="gray.600" mt={4}>
          Module Assignments
        </Text>
        <Text color="gray.500" mt={2} maxW="400px">
          This section will be updated later to allow assignment of modules and permissions to the role.
        </Text>
      </Box>
    </Flex>
  )
}

export default ModuleAssignmentsTab