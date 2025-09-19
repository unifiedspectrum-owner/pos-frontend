"use client"

/* Libraries imports */
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Flex, Box, VStack, HStack, Heading, Text, Badge, SimpleGrid, Icon, Tabs, Accordion } from '@chakra-ui/react'
import { lighten } from 'polished'
import { FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaUserShield, FaIdBadge } from 'react-icons/fa'

/* Shared module imports */
import { PRIMARY_COLOR, GRAY_COLOR } from '@shared/config'
import { ErrorMessageContainer, Breadcrumbs, FullPageLoader } from '@shared/components/common'
import { formatDate } from '@shared/utils'
import { getStatusBadgeColor } from '@shared/utils/ui/badge-colors'

/* User module imports */
import { useUserOperations } from '@user-management/hooks'
import { USER_DETAILS_TABS, USER_DETAILS, UserDetailsTabType, USER_DETAILS_TAB } from '@user-management/constants'

/* Role module imports */
import { useRoles, useModules } from '@role-management/hooks'

/* Component props interface */
interface UserDetailsPageProps {
  userId: string
}

/* User details page component with tabbed interface */
const UserDetailsPage: React.FC<UserDetailsPageProps> = ({ userId }) => {
  /* User operations hook for data fetching */
  const { fetchUserDetails, userDetails: user_details, userStatistics: user_statistics, permissions, isFetching, fetchError } = useUserOperations()

  /* Role permissions and modules hooks */
  const { rolePermissions, fetchRolePermissions } = useRoles()
  const { modules, fetchModules } = useModules()

  /* Active tab state management */
  const [activeTab, setActiveTab] = useState<UserDetailsTabType>(USER_DETAILS_TAB.PROFILE_INFO)

  /* Memoized processed sections with filtered and sorted fields */
  const processedSections = useMemo(() =>
    USER_DETAILS.map(section => ({
      ...section,
      processedFields: section.section_values
        .filter(field => field.is_active)
        .sort((a, b) => a.display_order - b.display_order)
    })), []
  )

  /* Get only the active section for rendering */
  const activeSection = useMemo(() =>
    processedSections.find(section => section.id === activeTab),
    [processedSections, activeTab]
  )

  /* Memoized tab change handler */
  const handleTabChange = useCallback((e: { value: string }) => {
    setActiveTab(e.value as UserDetailsTabType)
  }, [])

  /* Memoized merged permissions data combining user and role permissions */
  const mergedPermissions = useMemo(() => {
    if (!user_details?.role_details || !modules.length || !rolePermissions.length) {
      return []
    }

    const userRoleId = user_details.role_details.id.toString()
    const userRolePermissions = rolePermissions.filter(
      rp => rp.role_id.toString() === userRoleId
    )

    /* Create merged permissions for each module that has either role or user permissions */
    const permissionsMap = new Map()

    /* Add role permissions */
    userRolePermissions.forEach(rolePerm => {
      const moduleData = modules.find(m => m.id === rolePerm.module_id)
      if (moduleData) {
        permissionsMap.set(rolePerm.module_id, {
          module_id: rolePerm.module_id,
          module_name: moduleData.name,
          role_name: user_details.role_details?.name || '',
          role_can_create: Boolean(Number(rolePerm.can_create)),
          role_can_read: Boolean(Number(rolePerm.can_read)),
          role_can_update: Boolean(Number(rolePerm.can_update)),
          role_can_delete: Boolean(Number(rolePerm.can_delete)),
          user_can_create: false,
          user_can_read: false,
          user_can_update: false,
          user_can_delete: false,
          permission_expires_at: null
        })
      }
    })

    /* Add user permissions */
    permissions.forEach(userPerm => {
      const existing = permissionsMap.get(userPerm.module_id)
      if (existing) {
        /* Update existing entry with user permissions */
        permissionsMap.set(userPerm.module_id, {
          ...existing,
          user_can_create: Boolean(userPerm.can_create),
          user_can_read: Boolean(userPerm.can_read),
          user_can_update: Boolean(userPerm.can_update),
          user_can_delete: Boolean(userPerm.can_delete),
          permission_expires_at: userPerm.permission_expires_at
        })
      } else {
        /* Create new entry for user-only permissions */
        const moduleData = modules.find(m => m.id === userPerm.module_id)
        if (moduleData) {
          permissionsMap.set(userPerm.module_id, {
            module_id: userPerm.module_id,
            module_name: moduleData.name,
            role_name: user_details.role_details?.name || '',
            role_can_create: false,
            role_can_read: false,
            role_can_update: false,
            role_can_delete: false,
            user_can_create: Boolean(userPerm.can_create),
            user_can_read: Boolean(userPerm.can_read),
            user_can_update: Boolean(userPerm.can_update),
            user_can_delete: Boolean(userPerm.can_delete),
            permission_expires_at: userPerm.permission_expires_at
          })
        }
      }
    })

    return Array.from(permissionsMap.values())
  }, [user_details, modules, rolePermissions, permissions])

  /* Fetch user data on component mount */
  useEffect(() => {
    if (userId) {
      fetchUserDetails(userId)
      fetchRolePermissions()
      fetchModules()
    }
  }, [userId, fetchUserDetails, fetchRolePermissions, fetchModules])

  /* Loading state display */
  if (isFetching) {
    return <FullPageLoader />
  }

  /* Error state display */
  if (fetchError || !user_details) {
    return (
      <ErrorMessageContainer
        error={fetchError || 'User details not found'}
      />
    )
  }

  return (
    <Flex w={'100%'} flexDir={'column'}>
      {/* Main container with responsive layout */}
      <Flex flexDir="column" p={6} maxW="1400px" mx="auto" w="full" gap={4}>
        {/* Page header with title and breadcrumbs */}
        <Flex flexDir="column" gap={1}>
          <Heading as="h1" fontWeight="700" mb={0}>
            {user_details?.f_name && user_details?.l_name
              ? `${user_details.f_name} ${user_details.l_name} - User Details`
              : 'User Details'}
          </Heading>
          <Breadcrumbs />
        </Flex>

        {/* Main content container with tabs */}
        <Flex py={5} borderWidth={1} borderRadius={10} borderColor={lighten(0.3, GRAY_COLOR)}>
          <Tabs.Root w="100%" value={activeTab} variant="outline" size="md" onValueChange={handleTabChange}>

            {/* Tab navigation headers */}
            <Tabs.List w={'full'} px={5} borderBottomWidth={1} gap={1} borderColor={lighten(0.3, GRAY_COLOR)} flex={1} mb={4}>
              {USER_DETAILS_TABS.map((tab) => {
                const Icon = tab.icon
                const isSelected = tab.id === activeTab

                return (
                  <Tabs.Trigger key={tab.id} alignItems="center" justifyContent="space-between"
                    h="60px" borderWidth={1} borderBottomWidth={isSelected ? 0 : 1}
                    borderColor={lighten(0.3, GRAY_COLOR)} borderTopRadius={10} w="33.33%" p={5}
                    value={tab.id} cursor={'pointer'}
                    _hover={{ bg: lighten(0.47, PRIMARY_COLOR) }}>

                    {/* Tab content with icon and label */}
                    <Flex align="center" justify="center" gap="5px">
                      <Text fontSize="lg">
                        <Icon color={PRIMARY_COLOR} />
                      </Text>
                      <Text>
                        {tab.label}
                      </Text>
                    </Flex>
                  </Tabs.Trigger>
                )
              })}
            </Tabs.List>

            {/* Dynamic tab content - only render active tab */}
            <Tabs.ContentGroup px={6} borderTopWidth={0}>
              {/* Profile and Statistics tabs */}
              {activeSection && activeSection.id !== USER_DETAILS_TAB.PERMISSIONS_INFO && (
                <Tabs.Content value={activeSection.id} borderTopWidth={0}>
                  <VStack align="start" gap={6} w="full">
                    <Box w="full">
                      <Heading size="sm" color="gray.700" mb={4}>{activeSection.section_heading}</Heading>
                      <SimpleGrid columns={4} gap={6}>
                        {activeSection.processedFields.map((field) => {
                          const isStatisticsSection = activeSection.id === USER_DETAILS_TAB.STATISTICS_INFO;
                          const value = isStatisticsSection ? user_statistics?.[field.data_key as keyof typeof user_statistics]
                            : user_details?.[field.data_key as keyof typeof user_details];

                            /* Text field rendering */
                            if (field.type === "TEXT") {
                              const displayValue = value as string;
                              return (
                                <VStack key={field.id} align={'start'} gap={1}>
                                  <HStack color="gray.600">
                                    <Icon as={field.icon_name} boxSize={3} />
                                    <Text fontSize="xs" fontWeight="600">{field.label}</Text>
                                  </HStack>
                                  <Text fontSize="md" fontWeight="600" color="gray.900">
                                    {displayValue || 'N/A'}
                                  </Text>
                                </VStack>
                              );
                            } else if (field.type === 'BADGE') {
                              /* Status badge with dynamic colors */
                              const status = value as string;
                              const badgeConfig = getStatusBadgeColor(status || '');

                              return (
                                <VStack align="start" gap={1} key={field.id}>
                                  <HStack color="gray.600">
                                    <Icon as={badgeConfig.icon} boxSize={3} />
                                    <Text fontSize="xs" fontWeight="600">{field.label}</Text>
                                  </HStack>
                                  <Badge
                                    colorScheme={badgeConfig.colorScheme}
                                    size="sm"
                                    px={2}
                                    py={1}
                                    borderRadius="full"
                                    fontSize="xs"
                                    fontWeight="700"
                                    textTransform="capitalize"
                                  >
                                    {status || 'N/A'}
                                  </Badge>
                                </VStack>
                              );
                            } else if (field.type === 'DATE') {
                              /* Date field with conditional formatting */
                              const displayValue = value
                                ? formatDate(value as string) ?? 'N/A'
                                : field.data_key === 'last_password_change'
                                  ? 'Never Changed'
                                  : isStatisticsSection
                                    ? 'Never'
                                    : 'N/A';

                              return (
                                <VStack key={field.id} align={'start'} gap={1}>
                                  <HStack color="gray.600">
                                    <Icon as={field.icon_name} boxSize={3} />
                                    <Text fontSize="xs" fontWeight="600">{field.label}</Text>
                                  </HStack>
                                  <Text fontSize="md" fontWeight="600" color="gray.900">
                                    {displayValue}
                                  </Text>
                                </VStack>
                              );
                            } else if (field.type === 'VERIFICATION') {
                              /* Verification field with status indicator */
                              const isPhoneField = field.data_key === 'phone';
                              const isEmailField = field.data_key === 'email';
                              const isVerified = isPhoneField ? user_details?.phone_verified ?? false :
                                              isEmailField ? user_details?.email_verified ?? false : false;

                              return (
                                <VStack key={field.id} align={'start'} gap={1}>
                                  <HStack color="gray.600">
                                    <Icon as={field.icon_name} boxSize={3} />
                                    <Text fontSize="xs" fontWeight="600">{field.label}</Text>
                                    <Badge
                                      colorScheme={isVerified ? "green" : "red"}
                                      size="sm"
                                      px={1.5}
                                      py={0.5}
                                      borderRadius="full"
                                      fontSize="9px"
                                      fontWeight="700"
                                    >
                                      {isVerified ? "Verified" : "Not Verified"}
                                    </Badge>
                                  </HStack>
                                  <Text fontSize="md" fontWeight="600" color="gray.900">
                                    {value as string || 'N/A'}
                                  </Text>
                                </VStack>
                              );
                            }
                          return null;
                        })}
                      </SimpleGrid>
                    </Box>
                  </VStack>
                </Tabs.Content>
              )}

              {/* Permissions tab - only render when active */}
              {activeTab === USER_DETAILS_TAB.PERMISSIONS_INFO && (
                <Tabs.Content value={USER_DETAILS_TAB.PERMISSIONS_INFO} borderTopWidth={0}>
                <VStack align="start" gap={6} w="full">
                  {/* User role assignment section */}
                  <Box w="full">
                    <Heading size="sm" color="gray.700" mb={4}>Assigned Role</Heading>
                    {user_details?.role_details ? (
                      <SimpleGrid columns={4} gap={6}>
                        {/* Role name badge */}
                        <VStack align="start" gap={1}>
                          <HStack color="gray.600">
                            <Icon as={FaIdBadge} boxSize={3} />
                            <Text fontSize="xs" fontWeight="600">Role Name</Text>
                          </HStack>
                          <Badge
                            colorScheme="blue"
                            size="sm"
                            px={2}
                            py={1}
                            borderRadius="full"
                            fontSize="xs"
                            fontWeight="700"
                          >
                            {user_details.role_details.name}
                          </Badge>
                        </VStack>

                        {/* Role description text */}
                        <VStack align="start" gap={1}>
                          <HStack color="gray.600">
                            <Icon as={FaUserShield} boxSize={3} />
                            <Text fontSize="xs" fontWeight="600">Description</Text>
                          </HStack>
                          <Text fontSize="md" fontWeight="600" color="gray.900">
                            {user_details.role_details.description || 'No description available'}
                          </Text>
                        </VStack>

                        {/* Role active status */}
                        <VStack align="start" gap={1}>
                          <HStack color="gray.600">
                            <Icon as={user_details.role_details.is_active ? FaCheckCircle : FaTimesCircle} boxSize={3} />
                            <Text fontSize="xs" fontWeight="600">Role Status</Text>
                          </HStack>
                          <Badge
                            colorScheme={user_details.role_details.is_active ? "green" : "red"}
                            size="sm"
                            px={2}
                            py={1}
                            borderRadius="full"
                            fontSize="xs"
                            fontWeight="700"
                          >
                            {user_details.role_details.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </VStack>

                        {/* Role creation date */}
                        <VStack align="start" gap={1}>
                          <HStack color="gray.600">
                            <Icon as={FaCalendarAlt} boxSize={3} />
                            <Text fontSize="xs" fontWeight="600">Role Created</Text>
                          </HStack>
                          <Text fontSize="md" fontWeight="600" color="gray.900">
                            {user_details.role_details.created_at ? formatDate(user_details.role_details.created_at) : 'N/A'}
                          </Text>
                        </VStack>
                      </SimpleGrid>
                    ) : (
                      /* Empty state for no assigned role */
                      <Box
                        p={8}
                        bg="gray.50"
                        borderRadius="12px"
                        borderWidth={1}
                        borderColor="gray.200"
                        w="full"
                        textAlign="center"
                      >
                        <VStack gap={3}>
                          <Icon as={FaUserShield} boxSize={12} color="gray.300" />
                          <Text fontSize="lg" fontWeight="600" color="gray.500">
                            No Role Assigned
                          </Text>
                          <Text fontSize="sm" color="gray.400">
                            This user currently has no role assigned.
                          </Text>
                        </VStack>
                      </Box>
                    )}
                  </Box>

                  {/* Module permissions list with accordion */}
                  <Box w="full">
                    <Heading size="sm" color="gray.700" mb={4}>Module Permissions ({mergedPermissions.length})</Heading>
                    {mergedPermissions.length === 0 ? (
                    /* Empty state for no permissions */
                    <Box
                      p={8}
                      bg="gray.50"
                      borderRadius="12px"
                      borderWidth={1}
                      borderColor="gray.200"
                      w="full"
                      textAlign="center"
                    >
                      <VStack gap={3}>
                        <Icon as={FaUserShield} boxSize={12} color="gray.300" />
                        <Text fontSize="lg" fontWeight="600" color="gray.500">
                          No Permissions Found
                        </Text>
                        <Text fontSize="sm" color="gray.400">
                          This user currently has no permissions assigned.
                        </Text>
                      </VStack>
                    </Box>
                  ) : (
                    /* Expandable permission cards */
                    <Accordion.Root collapsible multiple w="full">
                      {mergedPermissions.map((permission) => (
                        <Accordion.Item
                          key={`${permission.module_id}-${permission.role_name}`}
                          value={`permission-${permission.module_id}`}
                          bg="gray.50"
                          borderRadius="8px"
                          borderWidth={1}
                          borderColor="gray.200"
                          mb={2}
                        >
                          {/* Permission header with module name */}
                          <Accordion.ItemTrigger
                            p={3}
                            _hover={{ bg: "gray.100" }}
                          >
                            <HStack flex={1} textAlign="left">
                              <Icon as={FaUserShield} color={PRIMARY_COLOR} boxSize={4} />
                              <Text fontSize="md" fontWeight="600" color="gray.800">
                                {permission.module_name}
                              </Text>
                            </HStack>
                            <Accordion.ItemIndicator />
                          </Accordion.ItemTrigger>

                          <Accordion.ItemContent p={4}>
                            <VStack align="start" gap={4} w="full">
                              {/* Role Permissions */}
                              <Box w="full">
                                <Text fontSize="sm" fontWeight="700" color="gray.700" mb={3}>
                                  Role-based Permissions ({permission.role_name})
                                </Text>
                                <SimpleGrid columns={4} gap={4}>
                                  <VStack align="start" gap={1}>
                                    <HStack color="gray.600">
                                      <Icon as={permission.role_can_create ? FaCheckCircle : FaTimesCircle} boxSize={3} />
                                      <Text fontSize="xs" fontWeight="600">Create</Text>
                                    </HStack>
                                    <Badge
                                      colorScheme={permission.role_can_create ? "green" : "red"}
                                      size="sm"
                                      px={2}
                                      py={1}
                                      borderRadius="full"
                                      fontSize="xs"
                                      fontWeight="700"
                                    >
                                      {permission.role_can_create ? "Allowed" : "Denied"}
                                    </Badge>
                                  </VStack>

                                  <VStack align="start" gap={1}>
                                    <HStack color="gray.600">
                                      <Icon as={permission.role_can_read ? FaCheckCircle : FaTimesCircle} boxSize={3} />
                                      <Text fontSize="xs" fontWeight="600">Read</Text>
                                    </HStack>
                                    <Badge
                                      colorScheme={permission.role_can_read ? "green" : "red"}
                                      size="sm"
                                      px={2}
                                      py={1}
                                      borderRadius="full"
                                      fontSize="xs"
                                      fontWeight="700"
                                    >
                                      {permission.role_can_read ? "Allowed" : "Denied"}
                                    </Badge>
                                  </VStack>

                                  <VStack align="start" gap={1}>
                                    <HStack color="gray.600">
                                      <Icon as={permission.role_can_update ? FaCheckCircle : FaTimesCircle} boxSize={3} />
                                      <Text fontSize="xs" fontWeight="600">Update</Text>
                                    </HStack>
                                    <Badge
                                      colorScheme={permission.role_can_update ? "green" : "red"}
                                      size="sm"
                                      px={2}
                                      py={1}
                                      borderRadius="full"
                                      fontSize="xs"
                                      fontWeight="700"
                                    >
                                      {permission.role_can_update ? "Allowed" : "Denied"}
                                    </Badge>
                                  </VStack>

                                  <VStack align="start" gap={1}>
                                    <HStack color="gray.600">
                                      <Icon as={permission.role_can_delete ? FaCheckCircle : FaTimesCircle} boxSize={3} />
                                      <Text fontSize="xs" fontWeight="600">Delete</Text>
                                    </HStack>
                                    <Badge
                                      colorScheme={permission.role_can_delete ? "green" : "red"}
                                      size="sm"
                                      px={2}
                                      py={1}
                                      borderRadius="full"
                                      fontSize="xs"
                                      fontWeight="700"
                                    >
                                      {permission.role_can_delete ? "Allowed" : "Denied"}
                                    </Badge>
                                  </VStack>
                                </SimpleGrid>
                              </Box>

                              {/* User-specific Permissions */}
                              <Box w="full">
                                <Text fontSize="sm" fontWeight="700" color="gray.700" mb={3}>
                                  User-specific Permissions
                                </Text>
                                <SimpleGrid columns={4} gap={4}>
                                  <VStack align="start" gap={1}>
                                    <HStack color="gray.600">
                                      <Icon as={permission.user_can_create ? FaCheckCircle : FaTimesCircle} boxSize={3} />
                                      <Text fontSize="xs" fontWeight="600">Create</Text>
                                    </HStack>
                                    <Badge
                                      colorScheme={permission.user_can_create ? "green" : "red"}
                                      size="sm"
                                      px={2}
                                      py={1}
                                      borderRadius="full"
                                      fontSize="xs"
                                      fontWeight="700"
                                    >
                                      {permission.user_can_create ? "Allowed" : "Denied"}
                                    </Badge>
                                  </VStack>

                                  <VStack align="start" gap={1}>
                                    <HStack color="gray.600">
                                      <Icon as={permission.user_can_read ? FaCheckCircle : FaTimesCircle} boxSize={3} />
                                      <Text fontSize="xs" fontWeight="600">Read</Text>
                                    </HStack>
                                    <Badge
                                      colorScheme={permission.user_can_read ? "green" : "red"}
                                      size="sm"
                                      px={2}
                                      py={1}
                                      borderRadius="full"
                                      fontSize="xs"
                                      fontWeight="700"
                                    >
                                      {permission.user_can_read ? "Allowed" : "Denied"}
                                    </Badge>
                                  </VStack>

                                  <VStack align="start" gap={1}>
                                    <HStack color="gray.600">
                                      <Icon as={permission.user_can_update ? FaCheckCircle : FaTimesCircle} boxSize={3} />
                                      <Text fontSize="xs" fontWeight="600">Update</Text>
                                    </HStack>
                                    <Badge
                                      colorScheme={permission.user_can_update ? "green" : "red"}
                                      size="sm"
                                      px={2}
                                      py={1}
                                      borderRadius="full"
                                      fontSize="xs"
                                      fontWeight="700"
                                    >
                                      {permission.user_can_update ? "Allowed" : "Denied"}
                                    </Badge>
                                  </VStack>

                                  <VStack align="start" gap={1}>
                                    <HStack color="gray.600">
                                      <Icon as={permission.user_can_delete ? FaCheckCircle : FaTimesCircle} boxSize={3} />
                                      <Text fontSize="xs" fontWeight="600">Delete</Text>
                                    </HStack>
                                    <Badge
                                      colorScheme={permission.user_can_delete ? "green" : "red"}
                                      size="sm"
                                      px={2}
                                      py={1}
                                      borderRadius="full"
                                      fontSize="xs"
                                      fontWeight="700"
                                    >
                                      {permission.user_can_delete ? "Allowed" : "Denied"}
                                    </Badge>
                                  </VStack>
                                </SimpleGrid>
                              </Box>

                              {/* Permission Expiry */}
                              <VStack align="start" gap={1}>
                                <HStack color="gray.600">
                                  <Icon as={FaCalendarAlt} boxSize={3} />
                                  <Text fontSize="xs" fontWeight="600">Permission Expires</Text>
                                </HStack>
                                <Text fontSize="md" fontWeight="600" color="gray.900">
                                  {permission.permission_expires_at ? formatDate(permission.permission_expires_at) : 'Never'}
                                </Text>
                              </VStack>
                            </VStack>
                          </Accordion.ItemContent>
                        </Accordion.Item>
                      ))}
                    </Accordion.Root>
                    )}
                  </Box>
                </VStack>
              </Tabs.Content>
              )}
            </Tabs.ContentGroup>
          </Tabs.Root>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default React.memo(UserDetailsPage)