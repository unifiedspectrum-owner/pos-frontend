"use client"

/* Libraries imports */
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Box, Flex, VStack, Button, Text } from '@chakra-ui/react';
import { FaChartLine } from 'react-icons/fa';
import { FiLayers, FiList, FiPlus, FiGrid, FiUsers, FiShield } from 'react-icons/fi';
import { MdClose } from 'react-icons/md';
import { IconType } from 'react-icons';

/* Shared module imports */
import { usePermissions } from '@shared/contexts';
import { PermissionTypes } from '@shared/types/validation';
import { PRIMARY_COLOR, SECONDARY_COLOR, WHITE_COLOR } from '@shared/config';
import { ADMIN_PAGE_ROUTES } from '@shared/constants';

/* Sidebar menu item interface */
export interface SidebarMenuItems {
  id: number;
  icon: IconType;
  label: string;
  path: string;
  module_code: string;
  sub_menu_items: {
    id: number;
    label: string;
    icon: IconType;
    path: string;
    requires_permission?: PermissionTypes;
  }[];
}

/* Menu configuration with admin routes */
const menuItems: SidebarMenuItems[] = [
  {
    id: 1,
    icon: FaChartLine,
    label: 'Dashboard',
    path: ADMIN_PAGE_ROUTES.DASHBOARD.HOME,
    module_code: 'dashboard',
    sub_menu_items: [
      {
        id: 1,
        label: 'Overview',
        icon: FaChartLine,
        path: ADMIN_PAGE_ROUTES.DASHBOARD.HOME,
        requires_permission: 'READ'
      }
    ]
  },
  {
    id: 2,
    icon: FiLayers,
    label: 'Plan Management',
    path: ADMIN_PAGE_ROUTES.PLAN_MANAGEMENT.HOME,
    module_code: 'plan-management',
    sub_menu_items: [
      {
        id: 1,
        label: 'Manage Plans',
        icon: FiList,
        path: ADMIN_PAGE_ROUTES.PLAN_MANAGEMENT.HOME,
        requires_permission: 'READ'
      },
      {
        id: 2,
        label: 'Create Plan',
        icon: FiPlus,
        path: ADMIN_PAGE_ROUTES.PLAN_MANAGEMENT.CREATE,
        requires_permission: 'CREATE'
      },
    ]
  },
  {
    id: 3,
    icon: FiGrid,
    label: 'Tenant Management',
    path: ADMIN_PAGE_ROUTES.TENANT_MANAGEMENT.HOME,
    module_code: 'tenant-management',
    sub_menu_items: [
      {
        id: 1,
        label: 'Manage Tenants',
        icon: FiList,
        path: ADMIN_PAGE_ROUTES.TENANT_MANAGEMENT.HOME,
        requires_permission: 'READ'
      },
      {
        id: 2,
        label: 'Create Tenant',
        icon: FiPlus,
        path: ADMIN_PAGE_ROUTES.TENANT_MANAGEMENT.CREATE,
        requires_permission: 'CREATE'
      },
    ]
  },
  {
    id: 4,
    icon: FiUsers,
    label: 'User Management',
    path: ADMIN_PAGE_ROUTES.USER_MANAGEMENT.HOME,
    module_code: 'user-management',
    sub_menu_items: [
      {
        id: 1,
        label: 'Manage Users',
        icon: FiList,
        path: ADMIN_PAGE_ROUTES.USER_MANAGEMENT.HOME,
        requires_permission: 'READ'
      },
      {
        id: 2,
        label: 'Create User',
        icon: FiPlus,
        path: ADMIN_PAGE_ROUTES.USER_MANAGEMENT.CREATE,
        requires_permission: 'CREATE'
      },
    ]
  },
  {
    id: 5,
    icon: FiShield,
    label: 'Role Management',
    path: ADMIN_PAGE_ROUTES.ROLE_MANAGEMENT.HOME,
    module_code: 'role-management',
    sub_menu_items: [
      {
        id: 1,
        label: 'Manage Roles',
        icon: FiList,
        path: ADMIN_PAGE_ROUTES.ROLE_MANAGEMENT.HOME,
        requires_permission: 'READ'
      },
      {
        id: 2,
        label: 'Create Role',
        icon: FiPlus,
        path: ADMIN_PAGE_ROUTES.ROLE_MANAGEMENT.CREATE,
        requires_permission: 'CREATE'
      },
    ]
  }
];

/* Main admin sidebar component */
export const Sidebar = () => {
  /* Component state */
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [activeItem, setActiveItem] = useState<number>(2);
  const [filteredMenuItems, setFilteredMenuItems] = useState<SidebarMenuItems[]>([]);

  /* Permission context */
  const { permissions, hasModuleAccess, hasSpecificPermission, loading } = usePermissions();

  /* Filter menu items by user permissions */
  useEffect(() => {
    if (!loading && permissions.length > 0) {
      const filtered = menuItems.filter(item => {
        /* Check module access */
        if (!hasModuleAccess(item.module_code)) {
          console.log(`[Sidebar] Access denied for module: ${item.module_code}`);
          return false;
        }

        /* Filter sub-items by permissions */
        const filteredSubItems = item.sub_menu_items.filter(subItem => {
          if (!subItem.requires_permission) return true;
          return hasSpecificPermission(item.module_code, subItem.requires_permission);
        });

        /* Show module only if accessible sub-items exist */
        return filteredSubItems.length > 0;
      }).map(item => ({
        ...item,
        sub_menu_items: item.sub_menu_items.filter(subItem => {
          if (!subItem.requires_permission) return true;
          return hasSpecificPermission(item.module_code, subItem.requires_permission);
        })
      }));

      console.log('[Sidebar] Filtered menu items:', filtered);
      setFilteredMenuItems(filtered);
    } else if (!loading && permissions.length === 0) {
      /* No permissions available */
      setFilteredMenuItems([]);
    } else {
      /* Loading state - prevent UI flash */
      setFilteredMenuItems([]);
    }
  }, [permissions, loading, hasModuleAccess, hasSpecificPermission]);

  /* Toggle expanded section */
  const handleIconClick = (itemID?: number) => {
    if (!itemID) {
      setExpandedSection(null);
    } else {
      setExpandedSection(expandedSection === itemID ? null : itemID);
    }
  };

  /* Set active menu item */
  const handleSubItemClick = (subItemID: number) => {
    setActiveItem(subItemID);
  };

  return (
    <Flex h="100vh" p={3}>
      {/* Icon sidebar */}
      <Flex
        position="relative" bg={PRIMARY_COLOR} color={WHITE_COLOR} w="auto"
        flexDirection="column" transition="all 0.2s" borderLeftRadius="2xl"
        borderRightWidth={1} borderRightRadius={expandedSection == null ? '2xl' : '0'}
      >
        {/* Logo section */}
        <Flex p={5} mb={4}>
          <Flex w={10} h={10} align="center" justify="center">
            <Text color={WHITE_COLOR} fontWeight="bold" fontSize="xl">
              US
            </Text>
          </Flex>
        </Flex>

        {/* Navigation icons */}
        <VStack as="nav" flex={1} px={3} gap={2} align="stretch">
          {
            filteredMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  title={item.label}
                  onClick={() => handleIconClick(item.id)}
                  bg={expandedSection === item.id ? SECONDARY_COLOR : ''}
                  _hover={{ bg: SECONDARY_COLOR }}
                  w="full" p={3} borderRadius="lg" transition="all 0.2s"
                  display="flex" alignItems="center" justifyContent="center"
                  color={WHITE_COLOR} variant="ghost" size="lg" h="auto"
                >
                  <Icon className="w-5 h-5" />
                </Button>
              );
            })
          }
        </VStack>
      </Flex>

      {/* Expandable submenu */}
      <Box
        position="relative" bg={PRIMARY_COLOR}
        color={WHITE_COLOR} transition="all 0.3s ease-in-out"
        overflow="hidden" borderRightRadius="2xl"
        w={expandedSection ? '224px' : '0'}
      >
        <Flex flexDir={'column'}>
          {expandedSection && (
            <>
              {/* Submenu header */}
              <Flex
                align="center" justify="space-between"
                borderBottomWidth="1px" borderColor={WHITE_COLOR} p={5}
              >
                <Text fontSize="md" fontWeight="semibold">
                  {filteredMenuItems.find(item => item.id === expandedSection)?.label}
                </Text>

                {/* Close button */}
                <Button
                  background={PRIMARY_COLOR}
                  _hover={{background: SECONDARY_COLOR}}
                  onClick={() => handleIconClick()}
                >
                  <MdClose width={10} height={10}/>
                </Button>
              </Flex>

              {/* Submenu items */}
              <VStack gap={1} p={2} align="stretch">
                {
                  filteredMenuItems.find(item => item.id === expandedSection)
                    ?.sub_menu_items.map((subItem) => {
                      const Icon = subItem.icon;
                      return (
                        <Button
                          key={subItem.id}
                          onClick={() => handleSubItemClick(subItem.id)}
                          bg={activeItem === subItem.id ? SECONDARY_COLOR : 'transparent'}
                          color={activeItem === subItem.id ? WHITE_COLOR : 'whiteAlpha.800'}
                          fontWeight={activeItem === subItem.id ? 'medium' : 'normal'}
                          _hover={{
                            bg: SECONDARY_COLOR,
                            color: WHITE_COLOR,
                          }}
                          justifyContent="flex-start" size="sm" px={4} py={3} borderRadius="lg"
                          fontSize="sm" transition="all 0.2s" variant="ghost" w="full"
                        >
                          <Icon width={10} height={10}/>
                          <Link key={subItem.id} href={subItem.path}>
                            {subItem.label}
                          </Link>
                        </Button>
                      );
                  })
                }
              </VStack>
            </>
          )}
        </Flex>
      </Box>
    </Flex>
  );
}

export default Sidebar;