'use client';

import React from 'react';
import { Flex } from '@chakra-ui/react';
import Sidebar from '@shared/components/common/sidebar';

/* Props for admin layout component */
interface AdminLayoutProps {
  children: React.ReactNode; /* Page content to render */
}

/* Main admin layout with sidebar navigation */
const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <Flex>
      {/* Navigation sidebar */}
      <Sidebar />
      
      {/* Main content area */}
      <Flex w={'100%'}>
        {children}
      </Flex>
    </Flex>
  );
};

export default AdminLayout;