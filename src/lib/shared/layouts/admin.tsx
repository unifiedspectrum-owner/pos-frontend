'use client';

/* React and Chakra UI component imports */
import React, { useState, useEffect } from 'react';
import { Flex, VStack } from '@chakra-ui/react';

/* Shared module imports */
import Sidebar from '@shared/components/common/sidebar';
import {NavigationHeader} from '@shared/components/common';

/* Auth module imports */
import { TwoFAReminderDialog } from '@auth-management/components';
import { AUTH_STORAGE_KEYS } from '@auth-management/constants';

/* Props for admin layout component */
interface AdminLayoutProps {
  children: React.ReactNode; /* Page content to render */
}

/* Main admin layout with sidebar navigation and top header */
const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  /* 2FA reminder dialog state */
  const [show2FAReminder, setShow2FAReminder] = useState<boolean>(false);

  /* Check if user needs 2FA reminder on mount */
  useEffect(() => {
    const checkTwoFactorReminder = () => {
      try {
        const is2faSetupRequired = localStorage.getItem(AUTH_STORAGE_KEYS.PENDING_2FA_SETUP_REQUIRED);
        if (is2faSetupRequired) {
          console.log('[AdminLayout] User 2FA status:', is2faSetupRequired);
          /* Show reminder if 2FA is required */
          if (is2faSetupRequired == "true") {
            console.log('[AdminLayout] Showing 2FA reminder dialog');
            setShow2FAReminder(true);
          }
        }
      } catch (error) {
        console.error('[AdminLayout] Error checking 2FA requirement:', error);
      }
    };

    checkTwoFactorReminder();
  }, []);

  /* Handle 2FA reminder dialog close */
  const handle2FAReminderClose = () => {
    console.log('[AdminLayout] Closing 2FA reminder dialog');
    setShow2FAReminder(false);
  };

  return (
    <>
      {/* 2FA Reminder Dialog */}
      <TwoFAReminderDialog
        isOpen={show2FAReminder}
        onClose={handle2FAReminderClose}
      />
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
    </>
  );
};

export default AdminLayout;