'use client';

/* React and external library imports */
import React, { useState, useEffect } from 'react';
import { Flex, HStack, Text, Button, Menu, Portal, Skeleton, SkeletonCircle, IconButton, Badge } from '@chakra-ui/react';
import { FiUser, FiSettings, FiLogOut, FiChevronDown, FiBell, FiClock, FiLogIn } from 'react-icons/fi';
import { lighten } from 'polished';
import { useRouter } from '@/i18n/navigation';
import { Avatar } from '@/components/ui/avatar';
import { Tooltip } from '@/components/ui/tooltip';

/* Shared module imports */
import { PRIMARY_COLOR, WHITE_COLOR, GRAY_COLOR } from '@shared/config';
import { AUTH_STORAGE_KEYS } from '@auth-management/constants';
import { ADMIN_PAGE_ROUTES } from '@shared/constants';
import { UserDetailsCache } from '@/lib/modules/auth-management/types';
import { ConfirmationDialog } from '@shared/components/common';
import { useAuthOperations } from '@auth-management/hooks';
import { useSessionTimer } from '@shared/hooks';

/* Top navigation header for admin pages */
const NavigationHeader: React.FC = () => {
  const router = useRouter();
  const { logoutUser, isLoggingOut } = useAuthOperations();

  /* State for user data */
  const [userData, setUserData] = useState<UserDetailsCache>({
    name: 'Admin User',
    role: "Admin",
    id: 'admin',
    email: 'admin@pos.com'
  });
  const [isLoadingUserData, setIsLoadingUserData] = useState<boolean>(true);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState<boolean>(false);

  /* State for notifications */
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState<boolean>(true);

  /* Initialize session timer */
  const {
    formattedTime, remainingTime, showWarningDialog,
    isInactivityWarning, inactivityCountdown,
    showExpiredDialog, expiredCountdown,
    extendSession, resumeSession, dismissWarning, handleExpiredLogin
  } = useSessionTimer(logoutUser);

  /* Determine which dialog to show and its configuration */
  const getDialogConfig = () => {
    if (showExpiredDialog) {
      return {
        isOpen: true,
        title: 'Session Expired',
        message: `Your session has expired. Please log in again to continue. You will be automatically redirected to the login page in ${expiredCountdown} seconds.`,
        confirmText: expiredCountdown > 0 ? `Go to Login (${expiredCountdown}s)` : 'Go to Login',
        confirmVariant: 'danger' as const,
        confirmIcon: FiLogIn,
        onConfirm: handleExpiredLogin,
        preventOutsideClick: true,
        showCancelBtn: false
      };
    }

    if (showWarningDialog) {
      return {
        isOpen: true,
        title: isInactivityWarning ? 'Inactivity Detected' : 'Session Expiring Soon',
        message: isInactivityWarning
          ? `You have been inactive for a while. Your session will automatically log out in ${inactivityCountdown} seconds if no action is taken. Would you like to continue working or log out?`
          : `Your session will expire in ${formattedTime}. Would you like to extend your session or log out now?`,
        confirmText: inactivityCountdown ? `Log out (${inactivityCountdown})` : 'Log out',
        cancelText: isInactivityWarning ? 'Continue Session' : 'Extend Session',
        confirmVariant: 'danger' as const,
        confirmIcon: FiLogOut,
        onConfirm: async () => await logoutUser(),
        onCancel: async () => {
          if (isInactivityWarning) {
            resumeSession();
          } else {
            await extendSession();
          }
        },
        onOutsideClick: isInactivityWarning ? undefined : dismissWarning,
        preventOutsideClick: isInactivityWarning,
        isLoading: isLoggingOut,
      };
    }

    if (showLogoutConfirmation) {
      return {
        isOpen: true,
        title: 'Confirm Logout',
        message: 'Are you sure you want to sign out? You will need to log in again to access your account.',
        confirmText: 'Sign Out',
        cancelText: 'Cancel',
        confirmVariant: 'danger' as const,
        confirmIcon: FiLogOut,
        onConfirm: async () => {
          await logoutUser();
          setShowLogoutConfirmation(false);
        },
        onCancel: () => setShowLogoutConfirmation(false),
        isLoading: isLoggingOut,
      };
    }

    /* Default/unhandled scenario */
    return {
      isOpen: false,
      title: 'Error',
      message: 'An unknown error occurred. Please reload the page and try again.',
      confirmText: 'Reload',
      confirmVariant: 'danger' as const,
      onConfirm: () => router.refresh(),
    };
  };

  const dialogConfig = getDialogConfig();

  /* Get user data from localStorage */
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
      if (storedUser) {
        const parsedUser: UserDetailsCache = JSON.parse(storedUser);
        setUserData(parsedUser);
      }
    } catch (error) {
      console.error('[NavigationHeader] Error parsing user data from localStorage:', error);
    } finally {
      setIsLoadingUserData(false);
    }
  }, []);

  /* Get notification count */
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoadingNotifications(true);
        /* TODO: Replace with actual notifications API call */
        /* const response = await notificationsService.getUnreadCount(); */
        /* setNotificationCount(response.count); */

        /* Mock data for now */
        await new Promise(resolve => setTimeout(resolve, 500));
        setNotificationCount(3);
      } catch (error) {
        console.error('[NavigationHeader] Error fetching notifications:', error);
        setNotificationCount(0);
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    fetchNotifications();
  }, []);

  /* Handle user profile navigation */
  const handleProfileClick = () => {
    router.push(ADMIN_PAGE_ROUTES.PROFILE);
  };

  /* Handle settings navigation */
  const handleSettingsClick = () => {
    router.push(ADMIN_PAGE_ROUTES.SETTINGS);
  };

  /* Handle notifications */
  const handleNotificationsClick = () => {
    router.push(ADMIN_PAGE_ROUTES.NOTIFICATIONS);
  };

  /* Show logout confirmation */
  const handleLogout = () => {
    setShowLogoutConfirmation(true);
  };

  return (
    <Flex
      as="header" w="100%" h="64px" bg={WHITE_COLOR}
      borderBottom="1px solid" borderBottomColor="gray.100"
      align="center" justify="space-between" px={[4, 6, 8 ]}
      position="sticky" top={0} zIndex={1000} backdropFilter="blur(8px)"
      boxShadow="0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)"
      bgGradient={`linear(to-r, ${WHITE_COLOR}, ${lighten(0.02, WHITE_COLOR)})`}
    >
      {/* Left section - Brand/Title */}
      <Flex align="center" gap={4}>
        <Flex w="8px" h="32px" borderRadius="full" bg={`linear-gradient(135deg, ${PRIMARY_COLOR}, ${lighten(0.1, PRIMARY_COLOR)})`}/>
        <Text fontSize={['md', 'lg' ]} fontWeight="600" color={GRAY_COLOR} letterSpacing="-0.025em">
          Admin Dashboard
        </Text>
      </Flex>

      {/* Right section - Professional action bar */}
      <HStack gap={[2, 3]}>
        {/* Session Timer */}
        <Tooltip
          openDelay={300}
          closeDelay={100}
          content={`Your session will expire in: ${formattedTime}`}
          contentProps={{
            bg: WHITE_COLOR,
            color: GRAY_COLOR,
            borderRadius: 'md',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            px: 3,
            py: 2,
            fontSize: 'sm',
            fontWeight: '500'
          }}
        >
          <Flex
            align="center"
            gap={2}
            px={3}
            py={2}
            bg={remainingTime <= 60 ? lighten(0.95, PRIMARY_COLOR) : lighten(0.97, GRAY_COLOR)}
            borderRadius="xl"
            border="1px solid"
            borderColor={remainingTime <= 60 ? lighten(0.7, PRIMARY_COLOR) : "gray.100"}
            transition="all 0.3s ease"
            display={{ base: 'none', md: 'flex' }}
            cursor="default"
            _hover={{
              bg: lighten(0.95, GRAY_COLOR),
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
          >
            <FiClock size={16} color={remainingTime <= 60 ? PRIMARY_COLOR : lighten(0.2, GRAY_COLOR)} />
            <Text
              fontSize="sm"
              fontWeight="600"
              color={remainingTime <= 60 ? PRIMARY_COLOR : GRAY_COLOR}
              fontVariantNumeric="tabular-nums"
              letterSpacing="-0.01em"
            >
              {formattedTime}
            </Text>
          </Flex>
        </Tooltip>

        {/* Notifications with badge */}
        <Flex position="relative">
          <IconButton
            variant="ghost"
            onClick={handleNotificationsClick}
            color={lighten(0.1, GRAY_COLOR)}
            _hover={{
              bg: lighten(0.95, GRAY_COLOR),
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
            _active={{ transform: 'translateY(0)' }}
            borderRadius="xl" h="44px" w="44px"
            title="Notifications" transition="all 0.2s ease"
            border="1px solid" borderColor="gray.100"
          >
            <FiBell size={18} />
          </IconButton>
          {isLoadingNotifications ? (
            <SkeletonCircle
              size="16px"
              position="absolute"
              top="-2px"
              right="-2px"
            />
          ) : notificationCount > 0 && (
            <Badge
              position="absolute" top="-2px" right="-2px"
              bg={`linear-gradient(135deg, ${PRIMARY_COLOR}, ${lighten(0.1, PRIMARY_COLOR)})`}
              color={WHITE_COLOR} borderRadius="full"
              minW="16px" h="16px" px={1}
              fontSize="9px" fontWeight="700"
              display="flex" alignItems="center" justifyContent="center"
              boxShadow="0 2px 4px rgba(0, 0, 0, 0.2)" border="2px solid" borderColor={WHITE_COLOR}
            >
              {notificationCount > 9 ? '9+' : notificationCount}
            </Badge>
          )}
        </Flex>

        {/* Enhanced user menu with loading state */}
        {isLoadingUserData ? (
          <Button variant="ghost" borderRadius="xl" px={[2, 4]} py={2} h="auto" minH="44px" border="1px solid" borderColor="gray.100" cursor="default" _hover={{}}>
            <HStack gap={3}>
              <SkeletonCircle size="32px" />
              <Flex direction="column" align="start" display={{ base: 'none', lg: 'flex' }} gap={1}>
                <Skeleton height="14px" width="80px" />
                <Skeleton height="10px" width="60px" />
              </Flex>
              <FiChevronDown size={16} color={lighten(0.4, GRAY_COLOR)} />
            </HStack>
          </Button>
        ) : (
          <Menu.Root>
            <Menu.Trigger asChild>
              <Button variant="ghost" _hover={{ bg: lighten(0.95, GRAY_COLOR), transform: 'translateY(-1px)', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)' }} _active={{ transform: 'translateY(0)' }} borderRadius="xl" px={[2, 4]} py={2} h="auto" minH="44px" transition="all 0.2s ease" border="1px solid" borderColor="gray.100" outline={'none'}>
                <HStack gap={3}>
                  <Avatar size="sm" name={userData.name} bg={`linear-gradient(135deg, ${PRIMARY_COLOR}, ${lighten(0.1, PRIMARY_COLOR)})`} color={WHITE_COLOR} boxShadow="0 2px 8px rgba(0, 0, 0, 0.15)" />
                  <Flex direction="column" align="start" display={{ base: 'none', lg: 'flex' }}>
                    <Text fontSize="sm" fontWeight="600" color={GRAY_COLOR} lineHeight="tight" letterSpacing="-0.01em">
                      {userData.name}
                    </Text>
                    <Text fontSize="xs" color={lighten(0.4, GRAY_COLOR)} lineHeight="tight" fontWeight="500">
                      {userData.role}
                    </Text>
                  </Flex>
                  <FiChevronDown size={16} color={lighten(0.2, GRAY_COLOR)} style={{ transition: 'transform 0.2s ease' }} />
                </HStack>
              </Button>
            </Menu.Trigger>

          <Portal>
            <Menu.Positioner>
              <Menu.Content w={'100%'} bg={WHITE_COLOR} border="1px solid" borderColor="gray.100" borderRadius="2xl" boxShadow="0 10px 25px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.05)" minW="250px" py={3} backdropFilter="blur(16px)" overflow="hidden">

                {/* Profile */}
                <Menu.Item value="profile" onClick={handleProfileClick} _hover={{ bg: lighten(0.97, GRAY_COLOR), transform: 'translateX(4px)' }} px={4} py={3} cursor="pointer" transition="all 0.2s ease" borderRadius="lg" mx={2}>
                  <HStack gap={3}>
                    <Flex w="32px" h="32px" bg={lighten(0.95, PRIMARY_COLOR)} borderRadius="lg" align="center" justify="center" color={PRIMARY_COLOR}>
                      <FiUser size={16} />
                    </Flex>
                    <Flex direction="column" align="start">
                      <Text fontSize="sm" fontWeight="500" color={GRAY_COLOR}>
                        Profile
                      </Text>
                      <Text fontSize="xs" color={lighten(0.4, GRAY_COLOR)}>
                        Manage your account
                      </Text>
                    </Flex>
                  </HStack>
                </Menu.Item>

                {/* Settings */}
                <Menu.Item value="settings" onClick={handleSettingsClick} _hover={{ bg: lighten(0.97, GRAY_COLOR), transform: 'translateX(4px)' }} px={4} py={3} cursor="pointer" transition="all 0.2s ease" borderRadius="lg" mx={2}>
                  <HStack gap={3}>
                    <Flex w="32px" h="32px" bg={lighten(0.95, GRAY_COLOR)} borderRadius="lg" align="center" justify="center" color={lighten(0.2, GRAY_COLOR)}>
                      <FiSettings size={16} />
                    </Flex>
                    <Flex direction="column" align="start">
                      <Text fontSize="sm" fontWeight="500" color={GRAY_COLOR}>
                        Settings
                      </Text>
                      <Text fontSize="xs" color={lighten(0.4, GRAY_COLOR)}>
                        Preferences & config
                      </Text>
                    </Flex>
                  </HStack>
                </Menu.Item>

                <Menu.Separator my={2} borderColor="gray.50" />

                {/* Logout */}
                <Menu.Item value="logout" onClick={handleLogout} _hover={{ bg: lighten(0.95, PRIMARY_COLOR), transform: 'translateX(4px)' }} px={4} py={3} cursor="pointer" transition="all 0.2s ease" borderRadius="lg" mx={2}>
                  <HStack gap={3}>
                    <Flex w="32px" h="32px" bg={lighten(0.95, PRIMARY_COLOR)} borderRadius="lg" align="center" justify="center" color={PRIMARY_COLOR}>
                      <FiLogOut size={16} />
                    </Flex>
                    <Flex direction="column" align="start">
                      <Text fontSize="sm" fontWeight="500" color={PRIMARY_COLOR}>
                        Sign Out
                      </Text>
                      <Text fontSize="xs" color={lighten(0.2, PRIMARY_COLOR)}>
                        End your session
                      </Text>
                    </Flex>
                  </HStack>
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
        )}
      </HStack>

      {/* Single confirmation dialog for all scenarios */}
      {dialogConfig.isOpen && (
        <ConfirmationDialog
          isOpen={dialogConfig.isOpen}
          title={dialogConfig.title!}
          message={dialogConfig.message!}
          confirmText={dialogConfig.confirmText!}
          cancelText={dialogConfig.cancelText!}
          confirmVariant={dialogConfig.confirmVariant!}
          confirmIcon={dialogConfig.confirmIcon}
          onConfirm={dialogConfig.onConfirm!}
          onCancel={dialogConfig.onCancel}
          onOutsideClick={dialogConfig.onOutsideClick}
          preventOutsideClick={dialogConfig.preventOutsideClick}
          isLoading={dialogConfig.isLoading}
          showCancelBtn={dialogConfig.showCancelBtn}
        />
      )}
    </Flex>
  );
};

export default NavigationHeader;