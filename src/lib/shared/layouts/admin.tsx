'use client';

/* React and Chakra UI component imports */
import React from 'react';
import { Flex, VStack } from '@chakra-ui/react';

/* Shared module imports */
import Sidebar from '@shared/components/common/sidebar';
import {NavigationHeader} from '@shared/components/common';

/* Props for admin layout component */
interface AdminLayoutProps {
  children: React.ReactNode; /* Page content to render */
}

/* Main admin layout with sidebar navigation and top header */
const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <Flex h="100vh">
      {/* Navigation sidebar */}
      <Sidebar />

      {/* Main content area with header */}
      <VStack w="100%" gap={0} align="stretch">
        {/* Top navigation header */}
        <NavigationHeader />

        {/* Page content */}
        <Flex flex={1} w="100%" overflow="auto">
          {children}
        </Flex>
      </VStack>
    </Flex>
  );
};

export default AdminLayout;