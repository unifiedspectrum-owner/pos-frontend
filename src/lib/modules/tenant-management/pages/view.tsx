"use client"

/* Libraries imports */
import React, { useEffect, useState } from 'react'
import { 
  Flex,
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  SimpleGrid,
  Icon,
  Tabs,
  Accordion
} from '@chakra-ui/react'
import { lighten } from 'polished'
import { 
  FaBuilding, 
  FaUser, 
  FaMapMarkerAlt,
  FaEnvelope,
  FaServer,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaCloud,
  FaCity,
  FaGlobe,
  FaChartBar,
  FaMailBulk,
  FaCreditCard,
  FaBox,
  FaDollarSign,
  FaClock,
  FaReceipt,
  FaExclamationTriangle,
  FaPhoneAlt
} from 'react-icons/fa'
/* Shared module imports */
import { PRIMARY_COLOR, GRAY_COLOR } from '@shared/config'
import { ErrorMessageContainer, Breadcrumbs } from '@shared/components/common'
import { FullPageLoader } from '@shared/components/common'

/* Tenant module imports */
import { tenantManagementService } from '@tenant-management/api'
import { 
  TenantDetails, 
  TenantSubscriptionDetails, 
  TenantAssignedAddonDetails, 
  TenantTransactionDetails, 
  TenantTransactionSummary 
} from '@tenant-management/types/account/details'
import { formatDate, handleApiError } from '@/lib/shared'
import { AxiosError } from 'axios'


/* Props interface for tenant details page */
interface TenantDetailsPageProps {
  tenantId: string /* ID of the tenant to view */
}

/* Tab configuration for tenant details view */
const TENANT_DETAILS_TABS = [
  {
    id: 'business',
    label: 'Business Information',
    icon: FaBuilding
  },
  {
    id: 'system',
    label: 'System & Branch Info',
    icon: FaServer
  },
  {
    id: 'subscription',
    label: 'Subscription & Addons',
    icon: FaCreditCard
  },
  {
    id: 'transactions',
    label: 'Transaction History',
    icon: FaReceipt
  }
] as const

type TenantDetailsTabId = typeof TENANT_DETAILS_TABS[number]['id']

export const TenantDetailsViewFields = [
  {
    id: 1,
    display_order: 1,
    is_active: true,
    label: "Business Name",
    icon_name: FaBuilding,
    data_key: "organization_name",
    show_label_badge: false,
    show_value_badge: false,
    is_date_field: false
  },
  {
    id: 2,
    display_order: 2,
    is_active: true,
    label: "Contact Person",
    icon_name: FaUser,
    data_key: "contact_person",
    show_label_badge: false,
    show_value_badge: false,
    is_date_field: false
  },
  {
    id: 3,
    display_order: 3,
    is_active: true,
    label: "Account Status",
    icon_name: FaCheckCircle, // Will be dynamic based on is_active
    data_key: "is_active",
    show_label_badge: false,
    show_value_badge: true,
    is_date_field: false
  },
  {
    id: 4,
    display_order: 4,
    is_active: true,
    label: "Registration Date",
    icon_name: FaCalendarAlt,
    data_key: "created_at",
    show_label_badge: false,
    show_value_badge: false,
    is_date_field: true
  },
  {
    id: 5,
    display_order: 5,
    is_active: true,
    label: "Phone Number",
    icon_name: FaPhoneAlt,
    data_key: "primary_phone",
    show_label_badge: true, // Will show verification badge
    show_value_badge: false,
    is_date_field: false
  },
  {
    id: 6,
    display_order: 6,
    is_active: true,
    label: "Email",
    icon_name: FaEnvelope,
    data_key: "primary_email",
    show_label_badge: true, // Will show verification badge
    show_value_badge: false,
    is_date_field: false
  },
  {
    id: 7,
    display_order: 7,
    is_active: true,
    label: "Address Line 1",
    icon_name: FaMapMarkerAlt,
    data_key: "address_line1",
    show_label_badge: false,
    show_value_badge: false,
    is_date_field: false
  },
  {
    id: 8,
    display_order: 8,
    is_active: true,
    label: "Address Line 2",
    icon_name: FaMapMarkerAlt,
    data_key: "address_line2",
    show_label_badge: false,
    show_value_badge: false,
    is_date_field: false
  },
  {
    id: 9,
    display_order: 9,
    is_active: true,
    label: "City",
    icon_name: FaCity,
    data_key: "city",
    show_label_badge: false,
    show_value_badge: false,
    is_date_field: false
  },
  {
    id: 10,
    display_order: 10,
    is_active: true,
    label: "State/Province",
    icon_name: FaMapMarkerAlt,
    data_key: "state_province",
    show_label_badge: false,
    show_value_badge: false,
    is_date_field: false
  },
  {
    id: 11,
    display_order: 11,
    is_active: true,
    label: "Postal Code",
    icon_name: FaMailBulk,
    data_key: "postal_code",
    show_label_badge: false,
    show_value_badge: false,
    is_date_field: false
  },
  {
    id: 12,
    display_order: 12,
    is_active: true,
    label: "Country",
    icon_name: FaGlobe,
    data_key: "country",
    show_label_badge: false,
    show_value_badge: false,
    is_date_field: false
  }
];


/* Page component for viewing tenant details */
const TenantDetailsPage: React.FC<TenantDetailsPageProps> = ({ tenantId }) => {
  /* State management for tenant data and loading */
  const [tenant_details, setTenantDetails] = useState<TenantDetails | null>(null)
  const [subscription_details, setSubscriptionDetails] = useState<TenantSubscriptionDetails | null>(null)
  const [assigned_addons, setAssignedAddons] = useState<TenantAssignedAddonDetails[]>([])
  const [transaction_details, setTransactionDetails] = useState<TenantTransactionDetails[]>([])
  const [transaction_summary, setTransactionSummary] = useState<TenantTransactionSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TenantDetailsTabId>('business')

  /* Fetch tenant details on component mount */
  useEffect(() => {
    const fetchTenantDetails = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await tenantManagementService.getTenantDetails(tenantId)
        
        if (response.success && response.data) {
          setTenantDetails(response.data.tenant_details)
          setSubscriptionDetails(response.data.subscription_details.plan_details)
          setAssignedAddons(response.data.subscription_details.addon_details || [])
          setTransactionDetails(response.data.transaction_details.transactions || [])
          setTransactionSummary(response.data.transaction_details.transaction_summary)
        } else {
          setError(response.error || 'Failed to fetch tenant details')
        }
      } catch (error) {
        const err = error as AxiosError;
        handleApiError(err, {title: "Error fetching tenant details"})
        console.error('[TenantDetailsPage] Error fetching tenant details:', err)
        setError('Error fetching tenant details:')
      } finally {
        setIsLoading(false)
      }
    }

    if (tenantId) {
      fetchTenantDetails()
    }
  }, [tenantId])

  /* Show loading spinner while fetching data */
  if (isLoading) {
    return <FullPageLoader />
  }

  /* Show error message if data fetch failed */
  if (error || !tenant_details) {
    return (
      <ErrorMessageContainer 
        error={error || 'Tenant details not found'}
      />
    )
  }

  return (
    <Flex w={'100%'} flexDir={'column'}>
      {/* Header Section */}
      <Flex flexDir="column" p={6} maxW="1400px" mx="auto" w="full" gap={4}>
        {/* Page title and breadcrumb navigation */}
        <Flex flexDir="column" gap={1}>
          <Heading as="h1" fontWeight="700" mb={0}>
            {tenant_details?.organization_name ? `${tenant_details.organization_name} - Tenant Details` : 'Tenant Details'}
          </Heading>
          <Breadcrumbs />
        </Flex>
        
        {/* Content */}
        <Flex py={5} borderWidth={1} borderRadius={10} borderColor={lighten(0.3, GRAY_COLOR)}>
          <Tabs.Root w="100%" value={activeTab} variant="outline" size="md" 
            onValueChange={(e) => setActiveTab(e.value as TenantDetailsTabId)}>
            
            {/* Tab headers */}
            <Tabs.List w={'full'} px={5} borderBottomWidth={1} gap={1} borderColor={lighten(0.3, GRAY_COLOR)} flex={1} mb={4}>
              {TENANT_DETAILS_TABS.map((tab) => {
                const Icon = tab.icon
                const isSelected = tab.id === activeTab
                
                return (
                  <Tabs.Trigger key={tab.id} alignItems="center" justifyContent="space-between" 
                    h="60px" borderWidth={1} borderBottomWidth={isSelected ? 0 : 1} 
                    borderColor={lighten(0.3, GRAY_COLOR)} borderTopRadius={10} w="25%" p={5} 
                    value={tab.id} cursor={'pointer'}
                    _hover={{ bg: lighten(0.47, PRIMARY_COLOR) }}>
                    
                    {/* Tab icon and label display */}
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

            {/* Tab content */}
            <Tabs.ContentGroup px={6} borderTopWidth={0}>
              {/* Business Information Tab */}
              <Tabs.Content value="business" borderTopWidth={0}>
              <SimpleGrid columns={4} gap={6}>
                {TenantDetailsViewFields
                  .filter(field => field.is_active)
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((field) => {
                                   
                  /* Get field value */
                  const rawValue = tenant_details[field.data_key as keyof TenantDetails] ?? 'N/A';
                  
                  /* Special handling for account status */
                  if (field.data_key === 'is_active') {
                    const isActive = rawValue as boolean;
                    const statusIcon = isActive ? FaCheckCircle : FaTimesCircle;
                    return (
                      <VStack align="start" gap={1} key={field.data_key}>
                        <HStack color="gray.600">
                          <Icon as={statusIcon} boxSize={3} />
                          <Text fontSize="xs" fontWeight="600">{field.label}</Text>
                        </HStack>
                        <Badge 
                          colorScheme={isActive ? "green" : "red"}
                          size="sm"
                          px={2}
                          py={1}
                          borderRadius="full"
                          fontSize="xs"
                          fontWeight="700"
                        >
                          {isActive ? "Active" : "Inactive"}
                        </Badge>
                      </VStack>
                    );
                  }
                  
                  /* Format display value */
                  let displayValue: string | number | boolean | null = rawValue || 'N/A';
                  if (field.is_date_field && rawValue) {
                    displayValue = formatDate(rawValue as string);
                  }
                  
                  return (
                    <VStack key={field.id} align={'start'} gap={1}>
                      <HStack color="gray.600">
                        { field.data_key == 'is_active' ? displayValue 
                          ? <Icon as={FaCheckCircle} boxSize={3} /> 
                          : <Icon as={FaTimesCircle} boxSize={3} />
                          : <Icon as={field.icon_name} boxSize={3} />
                        }
                        <Text fontSize="xs" fontWeight="600">{field.label}</Text>
                        {/* Show verification badge for phone/email */}
                        {field.show_label_badge && (
                          <Badge 
                            colorScheme={
                              (field.data_key === 'primary_phone' && tenant_details.phone_verified) ||
                              (field.data_key === 'primary_email' && tenant_details.email_verified)
                                ? "green" : "red"
                            }
                            size="sm"
                            px={1.5}
                            py={0.5}
                            borderRadius="full"
                            fontSize="9px"
                            fontWeight="700"
                          >
                            {
                              (field.data_key === 'primary_phone' && tenant_details.phone_verified) ||
                              (field.data_key === 'primary_email' && tenant_details.email_verified)
                                ? "Verified" : "Not Verified"
                            }
                          </Badge>
                        )}
                      </HStack>
                      <Text fontSize="md" fontWeight="600" color="gray.900">
                        {displayValue}
                      </Text>
                    </VStack>
                  );
                })}
              </SimpleGrid>
              </Tabs.Content>

              {/* System & Branch Information Tab */}
              <Tabs.Content value="system" borderTopWidth={0}>
                <SimpleGrid columns={4} gap={6}>

                  
                  {/* Current Branches */}
                  <VStack align="start" gap={1}>
                    <HStack color="gray.600">
                      <Icon as={FaBuilding} boxSize={3} />
                      <Text fontSize="xs" fontWeight="600">Current Branches</Text>
                    </HStack>
                    <Text fontSize="xl" fontWeight="700" color={PRIMARY_COLOR}>
                      {tenant_details.current_branches_count ?? 'N/A'}
                    </Text>
                  </VStack>

                  {/* Maximum Branches */}
                  <VStack align="start" gap={1}>
                    <HStack color="gray.600">
                      <Icon as={FaBuilding} boxSize={3} />
                      <Text fontSize="xs" fontWeight="600">Maximum Branches Allowed</Text>
                    </HStack>
                    <Text fontSize="xl" fontWeight="700" color="gray.700">
                      {tenant_details.max_branches_count ?? 'N/A'}
                    </Text>
                  </VStack>
                  
                  {/* Branch Usage Percentage */}
                  <VStack align="start" gap={1}>
                    <HStack color="gray.600">
                      <Icon as={FaChartBar} boxSize={3} />
                      <Text fontSize="xs" fontWeight="600">Branch Usage</Text>
                    </HStack>
                    <Text fontSize="md" fontWeight="600" color="gray.900">
                      { tenant_details.max_branches_count == null ? "No Restriction" :
                      ((tenant_details.current_branches_count / tenant_details.max_branches_count) * 100).toFixed(1)}% Used
                    </Text>
                  </VStack>

                  {/* Deployment Type */}
                  <VStack align="start" gap={1}>
                    <HStack color="gray.600">
                      <Icon as={FaCloud} boxSize={3} />
                      <Text fontSize="xs" fontWeight="600">Deployment Type</Text>
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
                      {tenant_details.deployment_type || 'N/A'}
                    </Badge>
                  </VStack>

                  {/* Last Deployment Status */}
                  <VStack align="start" gap={1}>
                    <HStack color="gray.600">
                      <Icon as={tenant_details.last_deployment_status === 'success' ? FaCheckCircle : FaTimesCircle} boxSize={3} />
                      <Text fontSize="xs" fontWeight="600">Last Deployment Status</Text>
                    </HStack>
                    <Badge 
                      size="sm"
                      px={2}
                      py={1}
                      borderRadius="full"
                      fontSize="xs"
                      fontWeight="700"
                    >
                      {tenant_details.last_deployment_status || 'N/A'}
                    </Badge>
                  </VStack>


                  {/* Last Deployed Date */}
                  <VStack align="start" gap={1}>
                    <HStack color="gray.600">
                      <Icon as={FaCalendarAlt} boxSize={3} />
                      <Text fontSize="xs" fontWeight="600">Last Deployed</Text>
                    </HStack>
                    <Text fontSize="md" fontWeight="600" color="gray.900">
                      {tenant_details.last_deployed_at ? new Date(tenant_details.last_deployed_at).toLocaleDateString() : 'N/A'}
                    </Text>
                  </VStack>

                  {/* Last Updated */}
                  <VStack align="start" gap={1}>
                    <HStack color="gray.600">
                      <Icon as={FaCalendarAlt} boxSize={3} />
                      <Text fontSize="xs" fontWeight="600">Last Updated</Text>
                    </HStack>
                    <Text fontSize="md" fontWeight="600" color="gray.900">
                      {tenant_details.updated_at ? new Date(tenant_details.updated_at).toLocaleDateString() : 'N/A'}
                    </Text>
                  </VStack>
                </SimpleGrid>
              </Tabs.Content>

              {/* Subscription & Addons Tab */}
              <Tabs.Content value="subscription" borderTopWidth={0}>
              {/* Subscription Details */}
              <VStack align="start" gap={4} mb={6}>
                <Heading size="sm" color="gray.700">Current Plan</Heading>
                {!subscription_details ? (
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
                      <Icon as={FaBox} boxSize={12} color="gray.300" />
                      <Text fontSize="lg" fontWeight="600" color="gray.500">
                        No Plan Assigned
                      </Text>
                      <Text fontSize="sm" color="gray.400">
                        This tenant currently has no subscription plan assigned.
                      </Text>
                    </VStack>
                  </Box>
                ) : (
                <SimpleGrid columns={4} gap={6} w="full">
                  {/* Plan Name */}
                  <VStack align="start" gap={1}>
                    <HStack color="gray.600">
                      <Icon as={FaBox} boxSize={3} />
                      <Text fontSize="xs" fontWeight="600">Plan Name</Text>
                    </HStack>
                    <Text fontSize="md" fontWeight="600" color="gray.900">
                      {subscription_details.plan_name || 'N/A'}
                    </Text>
                  </VStack>

                  {/* Billing Cycle */}
                  <VStack align="start" gap={1}>
                    <HStack color="gray.600">
                      <Icon as={FaClock} boxSize={3} />
                      <Text fontSize="xs" fontWeight="600">Billing Cycle</Text>
                    </HStack>
                    <Badge 
                      colorScheme="blue"
                      size="sm"
                      px={2}
                      py={1}
                      borderRadius="full"
                      fontSize="xs"
                      fontWeight="700"
                      textTransform="capitalize"
                    >
                      {subscription_details?.billing_cycle || 'N/A'}
                    </Badge>
                  </VStack>

                  {/* Subscription Status */}
                  <VStack align="start" gap={1}>
                    <HStack color="gray.600">
                      <Icon as={FaCheckCircle} boxSize={3} />
                      <Text fontSize="xs" fontWeight="600">Status</Text>
                    </HStack>
                    <Badge 
                      colorScheme="green"
                      size="sm"
                      px={2}
                      py={1}
                      borderRadius="full"
                      fontSize="xs"
                      fontWeight="700"
                    >
                      {subscription_details?.subscription_status || 'N/A'}
                    </Badge>
                  </VStack>

                  {/* Billing Period Start */}
                  <VStack align="start" gap={1}>
                    <HStack color="gray.600">
                      <Icon as={FaCalendarAlt} boxSize={3} />
                      <Text fontSize="xs" fontWeight="600">Period Start</Text>
                    </HStack>
                    <Text fontSize="md" fontWeight="600" color="gray.900">
                      {subscription_details?.billing_period_start ? new Date(subscription_details.billing_period_start).toLocaleDateString() : 'N/A'}
                    </Text>
                  </VStack>

                  {/* Billing Period End */}
                  <VStack align="start" gap={1}>
                    <HStack color="gray.600">
                      <Icon as={FaCalendarAlt} boxSize={3} />
                      <Text fontSize="xs" fontWeight="600">Period End</Text>
                    </HStack>
                    <Text fontSize="md" fontWeight="600" color="gray.900">
                      {subscription_details?.billing_period_end ? new Date(subscription_details.billing_period_end).toLocaleDateString() : 'N/A'}
                    </Text>
                  </VStack>

                  {/* Next Billing Date */}
                  <VStack align="start" gap={1}>
                    <HStack color="gray.600">
                      <Icon as={FaCalendarAlt} boxSize={3} />
                      <Text fontSize="xs" fontWeight="600">Next Billing</Text>
                    </HStack>
                    <Text fontSize="md" fontWeight="600" color="gray.900">
                      {subscription_details?.next_billing_date ? new Date(subscription_details.next_billing_date).toLocaleDateString() : 'N/A'}
                    </Text>
                  </VStack>

                  {/* Last Billing Date */}
                  <VStack align="start" gap={1}>
                    <HStack color="gray.600">
                      <Icon as={FaCalendarAlt} boxSize={3} />
                      <Text fontSize="xs" fontWeight="600">Last Billing</Text>
                    </HStack>
                    <Text fontSize="md" fontWeight="600" color="gray.900">
                      {subscription_details?.last_billing_date ? new Date(subscription_details.last_billing_date).toLocaleDateString() : 'N/A'}
                    </Text>
                  </VStack>
                </SimpleGrid>
                )}
              </VStack>

              {/* Addons Details */}
              <VStack align="start" gap={4} w="full">
                <Heading size="sm" color="gray.700">Active Addons ({assigned_addons.length})</Heading>
                {assigned_addons.length === 0 ? (
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
                      <Icon as={FaBox} boxSize={12} color="gray.300" />
                      <Text fontSize="lg" fontWeight="600" color="gray.500">
                        No Active Addons
                      </Text>
                      <Text fontSize="sm" color="gray.400">
                        This tenant currently has no active addon subscriptions.
                      </Text>
                    </VStack>
                  </Box>
                ) : (
                <Accordion.Root collapsible multiple w="full">
                  {assigned_addons.map((addon) => (
                    <Accordion.Item 
                      key={addon.assignment_id}
                      value={`addon-${addon.assignment_id}`}
                      bg="gray.50"
                      borderRadius="8px"
                      borderWidth={1}
                      borderColor="gray.200"
                      mb={2}
                    >
                      <Accordion.ItemTrigger
                        p={3}
                        _hover={{ bg: "gray.100" }}
                      >
                        <HStack flex={1} textAlign="left">
                          <Icon as={FaBox} color={PRIMARY_COLOR} boxSize={4} />
                          <Text fontSize="md" fontWeight="600" color="gray.800">
                            {addon.addon_name || 'N/A'}
                          </Text>
                          <Badge 
                            colorScheme={addon.pricing_scope === 'organization' ? 'purple' : 'orange'}
                            size="sm"
                            px={2}
                            py={1}
                            borderRadius="full"
                            fontSize="xs"
                            fontWeight="700"
                            textTransform="capitalize"
                          >
                            {addon.pricing_scope || 'N/A'}
                          </Badge>
                          <Badge 
                            colorScheme="green"
                            size="sm"
                            px={2}
                            py={1}
                            borderRadius="full"
                            fontSize="xs"
                            fontWeight="700"
                          >
                            {addon.subscription_status || 'N/A'}
                          </Badge>
                        </HStack>
                        <Accordion.ItemIndicator />
                      </Accordion.ItemTrigger>
                      
                      <Accordion.ItemContent p={4}>
                        <SimpleGrid columns={4} gap={6} w="full">
                          {/* Description */}
                          <VStack align="start" gap={1}>
                            <HStack color="gray.600">
                              <Icon as={FaBox} boxSize={3} />
                              <Text fontSize="xs" fontWeight="600">Description</Text>
                            </HStack>
                            <Text fontSize="md" fontWeight="600" color="gray.900">
                              {addon.addon_description || 'N/A'}
                            </Text>
                          </VStack>

                          {/* Feature Level */}
                          <VStack align="start" gap={1}>
                            <HStack color="gray.600">
                              <Icon as={FaChartBar} boxSize={3} />
                              <Text fontSize="xs" fontWeight="600">Feature Level</Text>
                            </HStack>
                            <Badge 
                              colorScheme={addon.feature_level === 'Premium' ? 'gold' : 'gray'}
                              size="sm"
                              px={2}
                              py={1}
                              borderRadius="full"
                              fontSize="xs"
                              fontWeight="700"
                            >
                              {addon.feature_level || 'N/A'}
                            </Badge>
                          </VStack>

                          {/* Billing Cycle */}
                          <VStack align="start" gap={1}>
                            <HStack color="gray.600">
                              <Icon as={FaClock} boxSize={3} />
                              <Text fontSize="xs" fontWeight="600">Billing Cycle</Text>
                            </HStack>
                            <Badge 
                              colorScheme="blue"
                              size="sm"
                              px={2}
                              py={1}
                              borderRadius="full"
                              fontSize="xs"
                              fontWeight="700"
                              textTransform="capitalize"
                            >
                              {addon.billing_cycle || 'N/A'}
                            </Badge>
                          </VStack>

                          {/* Branch ID */}
                          <VStack align="start" gap={1}>
                            <HStack color="gray.600">
                              <Icon as={FaBuilding} boxSize={3} />
                              <Text fontSize="xs" fontWeight="600">Branch ID</Text>
                            </HStack>
                            <Text fontSize="md" fontWeight="600" color="gray.900">
                              {addon.branch_id || 'Organization Level'}
                            </Text>
                          </VStack>

                          {/* Period Start */}
                          <VStack align="start" gap={1}>
                            <HStack color="gray.600">
                              <Icon as={FaCalendarAlt} boxSize={3} />
                              <Text fontSize="xs" fontWeight="600">Period Start</Text>
                            </HStack>
                            <Text fontSize="md" fontWeight="600" color="gray.900">
                              {addon.billing_period_start ? new Date(addon.billing_period_start).toLocaleDateString() : 'N/A'}
                            </Text>
                          </VStack>

                          {/* Period End */}
                          <VStack align="start" gap={1}>
                            <HStack color="gray.600">
                              <Icon as={FaCalendarAlt} boxSize={3} />
                              <Text fontSize="xs" fontWeight="600">Period End</Text>
                            </HStack>
                            <Text fontSize="md" fontWeight="600" color="gray.900">
                              {addon.billing_period_end ? new Date(addon.billing_period_end).toLocaleDateString() : 'N/A'}
                            </Text>
                          </VStack>

                          {/* Next Billing */}
                          <VStack align="start" gap={1}>
                            <HStack color="gray.600">
                              <Icon as={FaCalendarAlt} boxSize={3} />
                              <Text fontSize="xs" fontWeight="600">Next Billing</Text>
                            </HStack>
                            <Text fontSize="md" fontWeight="600" color="gray.900">
                              {addon.next_billing_date ? new Date(addon.next_billing_date).toLocaleDateString() : 'N/A'}
                            </Text>
                          </VStack>

                          {/* Last Billing */}
                          <VStack align="start" gap={1}>
                            <HStack color="gray.600">
                              <Icon as={FaCalendarAlt} boxSize={3} />
                              <Text fontSize="xs" fontWeight="600">Last Billing</Text>
                            </HStack>
                            <Text fontSize="md" fontWeight="600" color="gray.900">
                              {addon.last_billing_date ? new Date(addon.last_billing_date).toLocaleDateString() : 'N/A'}
                            </Text>
                          </VStack>
                        </SimpleGrid>
                      </Accordion.ItemContent>
                    </Accordion.Item>
                  ))}
                </Accordion.Root>
                )}
              </VStack>
              </Tabs.Content>

              {/* Transaction History Tab */}
              <Tabs.Content value="transactions" borderTopWidth={0}>
              {/* Transaction Summary */}
              <VStack align="start" gap={4} mb={6}>
                <Heading size="sm" color="gray.700">Transaction Summary</Heading>
                <SimpleGrid columns={4} gap={6} w="full">
                  {/* Total Transactions */}
                  <VStack align="start" gap={1}>
                    <HStack color="gray.600">
                      <Icon as={FaReceipt} boxSize={3} />
                      <Text fontSize="xs" fontWeight="600">Total Transactions</Text>
                    </HStack>
                    <Text fontSize="xl" fontWeight="700" color={PRIMARY_COLOR}>
                      {transaction_summary?.total_transactions ?? 'N/A'}
                    </Text>
                  </VStack>

                  {/* Successful Transactions */}
                  <VStack align="start" gap={1}>
                    <HStack color="gray.600">
                      <Icon as={FaCheckCircle} boxSize={3} />
                      <Text fontSize="xs" fontWeight="600">Successful</Text>
                    </HStack>
                    <Text fontSize="xl" fontWeight="700" color="green.500">
                      {transaction_summary?.successful_transactions ?? 'N/A'}
                    </Text>
                  </VStack>

                  {/* Failed Transactions */}
                  <VStack align="start" gap={1}>
                    <HStack color="gray.600">
                      <Icon as={FaTimesCircle} boxSize={3} />
                      <Text fontSize="xs" fontWeight="600">Failed</Text>
                    </HStack>
                    <Text fontSize="xl" fontWeight="700" color="red.500">
                      {transaction_summary?.failed_transactions ?? 'N/A'}
                    </Text>
                  </VStack>

                  {/* Pending Transactions */}
                  <VStack align="start" gap={1}>
                    <HStack color="gray.600">
                      <Icon as={FaClock} boxSize={3} />
                      <Text fontSize="xs" fontWeight="600">Pending</Text>
                    </HStack>
                    <Text fontSize="xl" fontWeight="700" color="orange.500">
                      {transaction_summary?.pending_transactions ?? 'N/A'}
                    </Text>
                  </VStack>

                  {/* Total Paid Amount */}
                  <VStack align="start" gap={1}>
                    <HStack color="gray.600">
                      <Icon as={FaDollarSign} boxSize={3} />
                      <Text fontSize="xs" fontWeight="600">Total Paid</Text>
                    </HStack>
                    <Text fontSize="md" fontWeight="600" color="green.600">
                      ${transaction_summary?.total_paid_amount?.toFixed(2) || '0.00'}
                    </Text>
                  </VStack>

                  {/* Total Pending Amount */}
                  <VStack align="start" gap={1}>
                    <HStack color="gray.600">
                      <Icon as={FaDollarSign} boxSize={3} />
                      <Text fontSize="xs" fontWeight="600">Total Pending</Text>
                    </HStack>
                    <Text fontSize="md" fontWeight="600" color="orange.600">
                      ${transaction_summary?.total_pending_amount?.toFixed(2) || '0.00'}
                    </Text>
                  </VStack>

                  {/* Last Successful Payment */}
                  <VStack align="start" gap={1}>
                    <HStack color="gray.600">
                      <Icon as={FaCalendarAlt} boxSize={3} />
                      <Text fontSize="xs" fontWeight="600">Last Success</Text>
                    </HStack>
                    <Text fontSize="md" fontWeight="600" color="gray.900">
                      {transaction_summary?.last_successful_payment_date ? 
                        new Date(transaction_summary.last_successful_payment_date).toLocaleDateString() : 
                        'N/A'
                      }
                    </Text>
                  </VStack>

                  {/* Last Failed Payment */}
                  <VStack align="start" gap={1}>
                    <HStack color="gray.600">
                      <Icon as={FaExclamationTriangle} boxSize={3} />
                      <Text fontSize="xs" fontWeight="600">Last Failed</Text>
                    </HStack>
                    <Text fontSize="md" fontWeight="600" color="gray.900">
                      {transaction_summary?.last_failed_payment_date ? 
                        new Date(transaction_summary.last_failed_payment_date).toLocaleDateString() : 
                        'N/A'
                      }
                    </Text>
                  </VStack>
                </SimpleGrid>
              </VStack>

              {/* Transaction Details */}
              <VStack align="start" gap={4} w="full">
                <Heading size="sm" color="gray.700">Recent Transactions ({transaction_details.length})</Heading>
                {transaction_details.length === 0 ? (
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
                      <Icon as={FaReceipt} boxSize={12} color="gray.300" />
                      <Text fontSize="lg" fontWeight="600" color="gray.500">
                        No Transaction History
                      </Text>
                      <Text fontSize="sm" color="gray.400">
                        This tenant currently has no transaction records.
                      </Text>
                    </VStack>
                  </Box>
                ) : (
                <Accordion.Root collapsible multiple w="full">
                  {transaction_details.map((transaction) => (
                    <Accordion.Item 
                      key={transaction.id}
                      value={`transaction-${transaction.id}`}
                      bg="gray.50"
                      borderRadius="8px"
                      borderWidth={1}
                      borderColor="gray.200"
                      mb={2}
                    >
                      <Accordion.ItemTrigger
                        p={3}
                        _hover={{ bg: "gray.100" }}
                      >
                        <HStack flex={1} textAlign="left">
                          <Icon as={FaReceipt} color={PRIMARY_COLOR} boxSize={4} />
                          <Text fontSize="md" fontWeight="600" color="gray.800">
                            {transaction.invoice_id || `Transaction #${transaction.id}`}
                          </Text>
                          <Badge 
                            colorScheme={
                              transaction.transaction_status === 'paid' ? 'green' :
                              transaction.transaction_status === 'failed' ? 'red' :
                              transaction.transaction_status === 'pending' ? 'orange' : 'gray'
                            }
                            size="sm"
                            px={2}
                            py={1}
                            borderRadius="full"
                            fontSize="xs"
                            fontWeight="700"
                            textTransform="capitalize"
                          >
                            {transaction.transaction_status}
                          </Badge>
                          <Badge 
                            colorScheme="blue"
                            size="sm"
                            px={2}
                            py={1}
                            borderRadius="full"
                            fontSize="xs"
                            fontWeight="700"
                            textTransform="capitalize"
                          >
                            {transaction.transaction_type}
                          </Badge>
                          <Text fontSize="md" fontWeight="700" color={PRIMARY_COLOR}>
                            ${transaction.net_amount?.toFixed(2) || 'N/A'}
                          </Text>
                        </HStack>
                        <Accordion.ItemIndicator />
                      </Accordion.ItemTrigger>
                      
                      <Accordion.ItemContent p={4}>
                        <SimpleGrid columns={4} gap={6} w="full">
                          {/* Plan Amount */}
                          <VStack align="start" gap={1}>
                            <HStack color="gray.600">
                              <Icon as={FaDollarSign} boxSize={3} />
                              <Text fontSize="xs" fontWeight="600">Plan Amount</Text>
                            </HStack>
                            <Text fontSize="md" fontWeight="600" color="gray.900">
                              ${transaction.total_plan_amount?.toFixed(2) || 'N/A'}
                            </Text>
                          </VStack>

                          {/* Addon Amount */}
                          <VStack align="start" gap={1}>
                            <HStack color="gray.600">
                              <Icon as={FaDollarSign} boxSize={3} />
                              <Text fontSize="xs" fontWeight="600">Addon Amount</Text>
                            </HStack>
                            <Text fontSize="md" fontWeight="600" color="gray.900">
                              ${transaction.total_addon_amount?.toFixed(2) || 'N/A'}
                            </Text>
                          </VStack>

                          {/* Tax */}
                          <VStack align="start" gap={1}>
                            <HStack color="gray.600">
                              <Icon as={FaDollarSign} boxSize={3} />
                              <Text fontSize="xs" fontWeight="600">Tax</Text>
                            </HStack>
                            <Text fontSize="md" fontWeight="600" color="gray.900">
                              ${transaction.tax?.toFixed(2) || 'N/A'}
                            </Text>
                          </VStack>

                          {/* Discount */}
                          <VStack align="start" gap={1}>
                            <HStack color="gray.600">
                              <Icon as={FaDollarSign} boxSize={3} />
                              <Text fontSize="xs" fontWeight="600">Discount</Text>
                            </HStack>
                            <Text fontSize="md" fontWeight="600" color="green.600">
                              -${transaction.discount?.toFixed(2) || 'N/A'}
                            </Text>
                          </VStack>

                          {/* Payment Method */}
                          <VStack align="start" gap={1}>
                            <HStack color="gray.600">
                              <Icon as={FaCreditCard} boxSize={3} />
                              <Text fontSize="xs" fontWeight="600">Payment Method</Text>
                            </HStack>
                            <Badge 
                              colorScheme="purple"
                              size="sm"
                              px={2}
                              py={1}
                              borderRadius="full"
                              fontSize="xs"
                              fontWeight="700"
                              textTransform="capitalize"
                            >
                              {transaction.payment_method_type || 'N/A'}
                            </Badge>
                          </VStack>

                          {/* Payment Processor */}
                          <VStack align="start" gap={1}>
                            <HStack color="gray.600">
                              <Icon as={FaServer} boxSize={3} />
                              <Text fontSize="xs" fontWeight="600">Processor</Text>
                            </HStack>
                            <Badge 
                              colorScheme="gray"
                              size="sm"
                              px={2}
                              py={1}
                              borderRadius="full"
                              fontSize="xs"
                              fontWeight="700"
                              textTransform="capitalize"
                            >
                              {transaction.payment_processor || 'N/A'}
                            </Badge>
                          </VStack>

                          {/* Due Date */}
                          <VStack align="start" gap={1}>
                            <HStack color="gray.600">
                              <Icon as={FaCalendarAlt} boxSize={3} />
                              <Text fontSize="xs" fontWeight="600">Due Date</Text>
                            </HStack>
                            <Text fontSize="md" fontWeight="600" color="gray.900">
                              {transaction.due_date ? new Date(transaction.due_date).toLocaleDateString() : 'N/A'}
                            </Text>
                          </VStack>

                          {/* Invoice Date */}
                          <VStack align="start" gap={1}>
                            <HStack color="gray.600">
                              <Icon as={FaCalendarAlt} boxSize={3} />
                              <Text fontSize="xs" fontWeight="600">Invoice Date</Text>
                            </HStack>
                            <Text fontSize="md" fontWeight="600" color="gray.900">
                              {transaction.invoice_date ? 
                                new Date(transaction.invoice_date).toLocaleDateString() : 
                                'N/A'
                              }
                            </Text>
                          </VStack>
                        </SimpleGrid>

                        {transaction.last_failed_payment_date && (
                          <Box mt={4} p={3} bg="red.50" borderRadius="8px" borderWidth={1} borderColor="red.200">
                            <HStack>
                              <Icon as={FaExclamationTriangle} color="red.500" boxSize={4} />
                              <VStack align="start" gap={1}>
                                <Text fontSize="sm" fontWeight="600" color="red.700">
                                  Last Failed Payment
                                </Text>
                                <Text fontSize="sm" color="red.600">
                                  {new Date(transaction.last_failed_payment_date).toLocaleDateString()}
                                </Text>
                              </VStack>
                            </HStack>
                          </Box>
                        )}
                      </Accordion.ItemContent>
                    </Accordion.Item>
                  ))}
                </Accordion.Root>
                )}
              </VStack>
              </Tabs.Content>
            </Tabs.ContentGroup>
          </Tabs.Root>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default TenantDetailsPage