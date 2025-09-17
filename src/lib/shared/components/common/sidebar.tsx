/* React and external library imports */
import React, { useState } from 'react';
import Link from 'next/link';
import { Box, Flex, VStack, Button, Text } from '@chakra-ui/react';
import { FaChartLine } from 'react-icons/fa';
import { FiLayers, FiList, FiPlus, FiGrid, FiUsers, FiShield } from 'react-icons/fi';
import { MdClose } from 'react-icons/md';
import { IconType } from 'react-icons';

/* Interface for sidebar menu items structure */
export interface SidebarMenuItems {
  id: number; /* Unique menu item identifier */
  icon: IconType; /* Icon component for menu item */
  label: string; /* Display label for menu item */
  base_path: string; /* Base path for navigation */
  sub_menu_items: { /* Submenu items array */
    id: number; /* Unique submenu item identifier */
    label: string; /* Display label for submenu item */
    icon: IconType; /* Icon component for submenu item */
    path: string; /* Relative path for submenu item */
  }[];
}

/* Sample menu data configuration */
const menuItems: SidebarMenuItems[] = [
  { 
    id: 1, 
    icon: FaChartLine, 
    label: 'Dashboard',
    base_path: '/dashboard',
    sub_menu_items: [
      {
        id: 1,
        label: 'Overview',
        icon: FaChartLine,
        path: '/overview'
      }
    ]
  },
  { 
    id: 2, 
    icon: FiLayers, 
    label: 'Plan Management',
    base_path: 'plan-management',
    sub_menu_items: [
      { 
        id: 1, 
        label: 'Manage Plans', 
        icon: FiList,
        path: '/'

      },
      { 
        id: 2, 
        label: 'Create Plan', 
        icon: FiPlus,
        path: '/create'
      },
    ]
  },
  { 
    id: 3, 
    icon: FiGrid, 
    label: 'Tenant Management',
    base_path: 'tenant-management',
    sub_menu_items: [
      { 
        id: 1, 
        label: 'Manage Tenants', 
        icon: FiList,
        path: '/'
      },
      { 
        id: 2, 
        label: 'Create tenant', 
        icon: FiPlus,
        path: '/create'
      },
    ]
  },
  {
    id: 4,
    icon: FiUsers,
    label: 'User Management',
    base_path: 'user-management',
    sub_menu_items: [
      {
        id: 1,
        label: 'Manage Users',
        icon: FiList,
        path: '/'
      },
      {
        id: 2,
        label: 'Create User',
        icon: FiPlus,
        path: '/create'
      },
    ]
  },
  {
    id: 5,
    icon: FiShield,
    label: 'Role Management',
    base_path: 'role-management',
    sub_menu_items: [
      {
        id: 1,
        label: 'Manage Roles',
        icon: FiList,
        path: '/'
      },
      {
        id: 2,
        label: 'Create Role',
        icon: FiPlus,
        path: '/create'
      },
    ]
  }
];

/* Main sidebar navigation component */
export const Sidebar = () => {
  /* State for expanded section and active item */
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [activeItem, setActiveItem] = useState<number>(2);
  
  /* Color theme values */
  const primaryBg = '#885CF7'; /* Primary background color */
  const secondaryBg = '#562dc6'; /* Secondary background color */
  const textColor = 'white'; /* Main text color */
  const mutedTextColor = 'whiteAlpha.800'; /* Muted text color */

  /* Handle main menu icon click */
  const handleIconClick = (itemID?: number) => {
    if (!itemID) {
      setExpandedSection(null);
    } else {
      setExpandedSection(expandedSection === itemID ? null : itemID);
    }
  };

  /* Handle submenu item click */
  const handleSubItemClick = (subItemID: number) => {
    setActiveItem(subItemID);
  };

  return (
    <Flex h="100vh" p={3}>
      {/* Main icon-only sidebar */}
      <Flex
        position="relative" bg={secondaryBg} color={textColor} w="auto"
        flexDirection="column" transition="all 0.2s" borderLeftRadius="2xl"
        borderRightWidth={1} borderRightRadius={expandedSection == null ? '2xl' : '0'}
      >
        {/* Application logo section */}
        <Flex p={5} mb={4}>
          <Flex w={10} h={10} align="center" justify="center">
            <Text color={textColor} fontWeight="bold" fontSize="xl">
              US {/* Logo placeholder */}
            </Text>
          </Flex>
        </Flex>

        {/* Main navigation icons */}
        <VStack as="nav" flex={1} px={3} gap={2} align="stretch">
          {
            menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  onClick={() => handleIconClick(item.id)}
                  bg={expandedSection === item.id ? primaryBg : ''} /* Active state */
                  _hover={{ bg: primaryBg }}
                  w="full" p={3} borderRadius="lg" transition="all 0.2s"
                  display="flex" alignItems="center" justifyContent="center"
                  color={textColor} variant="ghost" size="lg" h="auto"
                >
                  <Icon className="w-5 h-5" />
                </Button>
              );
            })
          }
        </VStack>
      </Flex>

      {/* Expandable submenu panel */}
      <Box
        position="relative" bg={secondaryBg}
        color={textColor} transition="all 0.3s ease-in-out"
        overflow="hidden" borderRightRadius="2xl"
        w={expandedSection ? '224px' : '0'} /* Dynamic width based on expansion */
      >
        <Flex flexDir={'column'}>
          {expandedSection && (
            <>
              {/* Submenu header with title and close button */}
              <Flex
                align="center" justify="space-between"
                borderBottomWidth="1px" borderColor={'white'} p={5}
              >
                <Text fontSize="md" fontWeight="semibold">
                  {menuItems.find(item => item.id === expandedSection)?.label}
                </Text>

                {/* Close expansion button */}
                <Button 
                  background={secondaryBg} 
                  _hover={{background: primaryBg}} 
                  onClick={() => handleIconClick()}
                >
                  <MdClose width={10} height={10}/>
                </Button>
              </Flex>

              {/* Submenu items list */}
              <VStack gap={1} p={2} align="stretch">
                {
                  menuItems.find(item => item.id === expandedSection)
                    ?.sub_menu_items.map((subItem) => {
                      const basePath = menuItems.find(item => item.id === expandedSection)?.base_path || '/';
                      const Icon = subItem.icon;
                      return (
                        <Button
                          key={subItem.id}
                          onClick={() => handleSubItemClick(subItem.id)}
                          bg={activeItem === subItem.id ? primaryBg : 'transparent'} /* Active state styling */
                          color={activeItem === subItem.id ? textColor : mutedTextColor}
                          fontWeight={activeItem === subItem.id ? 'medium' : 'normal'}
                          _hover={{
                            bg: primaryBg,
                            color: textColor,
                          }}
                          justifyContent="flex-start" size="sm" px={4} py={3} borderRadius="lg" 
                          fontSize="sm" transition="all 0.2s" variant="ghost" w="full"
                        >
                          <Icon width={10} height={10}/>
                          <Link key={subItem.id} href={`${basePath}${subItem.path}`}>
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