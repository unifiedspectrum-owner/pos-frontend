"use client"

/* Libraries imports */
import React, { useEffect, useState } from 'react'
import { Box, Flex, Heading, Text, Stat, Card, SimpleGrid, Badge, Icon, VStack, HStack, Separator, Button, FormatNumber, IconButton } from '@chakra-ui/react'
import { FiUsers, FiDollarSign, FiAlertCircle, FiTrendingUp, FiPackage, FiActivity, FiArrowRight, FiBarChart2, FiPieChart, FiRefreshCw, FiCalendar } from 'react-icons/fi'
import { useRouter } from '@/i18n/navigation'
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

/* Shared module imports */
import { ErrorMessageContainer, LoaderWrapper, PrimaryButton, SelectField, DateField } from '@shared/components'
import { STATUS_BADGE_CONFIG } from '@shared/constants'

/* Dashboard module imports */
import { useDashboard } from '@dashboard/hooks'

/* Tenant management module imports */
import { useTenantOperations } from '@tenant-management/hooks'
import { DashboardDateParams } from '@dashboard/api'

/* Chart type definition */
type ChartType = 'line' | 'bar' | 'area' | 'pie'

/* Time period type definition */
type TimePeriod = 'today' | 'this_week' | 'this_month' | 'custom'

/* Time period filter options */
const TIME_PERIOD_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'custom', label: 'Custom Range' }
]

/* Helper function to format date to YYYY-MM-DD */
const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/* Helper function to generate date params based on time period */
const getDateParamsForPeriod = (period: TimePeriod, customStartDate?: string, customEndDate?: string): DashboardDateParams => {
  const today = new Date()

  switch (period) {
    case 'today': {
      const startDate = formatDate(today)
      const endDate = formatDate(today)
      return {
        period: 'custom',
        start_date: startDate,
        end_date: endDate
      }
    }
    case 'this_week': {
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())
      const endOfWeek = new Date(today)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      return {
        period: 'weekly',
        start_date: formatDate(startOfWeek),
        end_date: formatDate(endOfWeek)
      }
    }
    case 'this_month': {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      return {
        period: 'monthly',
        start_date: formatDate(startOfMonth),
        end_date: formatDate(endOfMonth)
      }
    }
    case 'custom': {
      return {
        period: 'custom',
        start_date: customStartDate || formatDate(today),
        end_date: customEndDate || formatDate(today)
      }
    }
    default:
      return {
        period: 'monthly'
      }
  }
}

/* Main dashboard page component */
const DashboardHome: React.FC = () => {
  /* Navigation hooks */
  const router = useRouter()

  /* Chart type state */
  const [chartType, setChartType] = useState<ChartType>('line')

  /* Time period filter state */
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('this_month')

  /* Custom date range state */
  const [customStartDate, setCustomStartDate] = useState<string>(formatDate(new Date()))
  const [customEndDate, setCustomEndDate] = useState<string>(formatDate(new Date()))

  /* Provisioning tenant tracking */
  const [provisioningTenantId, setProvisioningTenantId] = useState<string | null>(null)

  /* Dashboard data hook */
  const { overview, charts, tables, analytics, overviewLoading, chartsLoading, tablesLoading, analyticsLoading, overviewError, chartsError, tablesError, analyticsError, fetchAllDashboardData, refetch } = useDashboard()

  /* Tenant operations hook */
  const { startResourceProvisioning } = useTenantOperations()

  /* Fetch all dashboard data on mount and when time period or custom dates change */
  useEffect(() => {
    const dateParams = getDateParamsForPeriod(timePeriod, customStartDate, customEndDate)
    fetchAllDashboardData(dateParams)
  }, [timePeriod, customStartDate, customEndDate, fetchAllDashboardData])

  /* Handle manual refresh */
  const handleRefresh = () => {
    const dateParams = getDateParamsForPeriod(timePeriod, customStartDate, customEndDate)
    refetch(dateParams)
    console.log('[Dashboard] Dashboard data refreshed successfully with params:', dateParams)
  }

  /* Handle tenant redeployment */
  const handleRedeploy = async (tenantId: string, organizationName: string) => {
    console.log(`[Dashboard] Starting redeployment for tenant: ${organizationName} (ID: ${tenantId})`)

    /* Set the current tenant being provisioned */
    setProvisioningTenantId(tenantId)

    try {
      const result = await startResourceProvisioning(tenantId, organizationName)

      if (result) {
        console.log('[Dashboard] Resource provisioning initiated successfully:', result.data)
        /* Refresh dashboard data after successful provisioning */
        refetch()
      }
    } finally {
      /* Clear the provisioning state */
      setProvisioningTenantId(null)
    }
  }

  /* Helper function to get metric value based on selected time period */
  const getMetricByPeriod = (today: number, thisWeek: number, thisMonth: number): number => {
    switch (timePeriod) {
      case 'today':
        return today
      case 'this_week':
        return thisWeek
      case 'this_month':
        return thisMonth
      default:
        return thisMonth
    }
  }

  /* Helper function to get period label */
  const getPeriodLabel = (): string => {
    switch (timePeriod) {
      case 'today':
        return 'Today'
      case 'this_week':
        return 'This Week'
      case 'this_month':
        return 'This Month'
      default:
        return 'This Month'
    }
  }

  /* Check if any section is loading */
  const isLoading = overviewLoading || chartsLoading || tablesLoading || analyticsLoading

  /* Check if any section has error */
  const hasError = overviewError || chartsError || tablesError || analyticsError
  const errorMessage = overviewError || chartsError || tablesError || analyticsError

  return (
    <Flex w={'100%'} flexDir={'column'} bg="gray.50" _dark={{ bg: 'gray.900' }} minH="100vh">
      {/* Header section */}
      <Box bg="white" _dark={{ bg: 'gray.800' }} borderBottomWidth="1px" borderColor="gray.200" >
        <Flex justify="space-between" align="center" px={8} py={4} flexWrap="wrap" gap={4}>
          <Heading size="lg" color="gray.900" _dark={{ color: 'white' }}>Dashboard</Heading>
          <HStack gap={3} flexWrap="wrap">
            {/* Time period filter */}
            <HStack gap={2}>
              <Icon as={FiCalendar} color="gray.600" _dark={{ color: 'gray.400' }} />
              <Box w="150px">
                <SelectField
                  label=""
                  value={timePeriod}
                  onChange={(value) => setTimePeriod(value as TimePeriod)}
                  options={TIME_PERIOD_OPTIONS}
                  isInValid={false}
                  required={false}
                  size="sm"
                  height="32px"
                  borderRadius="md"
                />
              </Box>
            </HStack>

            {/* Custom date range fields - shown only when custom is selected */}
            {timePeriod === 'custom' && (
              <HStack gap={2}>
                <Box w="150px">
                  <DateField
                    label=""
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    isInValid={false}
                    required={false}
                    placeholder="Start Date"
                    inputProps={{ h: '32px', fontSize: 'sm' }}
                  />
                </Box>
                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>to</Text>
                <Box w="150px">
                  <DateField
                    label=""
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    isInValid={false}
                    required={false}
                    placeholder="End Date"
                    min={customStartDate}
                    inputProps={{ h: '32px', fontSize: 'sm' }}
                  />
                </Box>
              </HStack>
            )}

            {/* Refresh button */}
            <IconButton
              aria-label="Refresh dashboard"
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              loading={isLoading}
            >
              <Icon as={FiRefreshCw} />
            </IconButton>
          </HStack>
        </Flex>
      </Box>

      {/* Error state */}
      {hasError && (
        <Box px={8} pt={6}>
          <ErrorMessageContainer error={errorMessage || 'Failed to load dashboard data'} title="Error Loading Dashboard" onRetry={refetch} isRetrying={isLoading} testId="dashboard-error" />
        </Box>
      )}

      {/* Dashboard content */}
      <LoaderWrapper isLoading={isLoading && !overview && !charts && !tables && !analytics} loadingText="Loading dashboard data..." minHeight="500px">
        <Box p={[4, 6, 8]} maxW="1600px" mx="auto" w="full">
          {/* Key Metrics Cards - Row 1 */}
          {overview && (
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={{ base: 4, md: 6 }} mb={{ base: 6, md: 8 }}>
              {/* Tenants Metric */}
              <Card.Root boxShadow="sm" _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }} transition="all 0.2s" borderRadius="xl">
                <Card.Body p={5}>
                  <Stat.Root>
                    <Flex justify="space-between" align="center">
                      <Flex flexDir={'column'} gap={1}>
                        <Stat.Label fontSize="sm" fontWeight="bold" color="gray.600" _dark={{ color: 'gray.400' }}>Total Tenants</Stat.Label>
                        <HStack alignItems={'center'}>
                          <Stat.ValueText fontSize="4xl" fontWeight="bold" color="gray.900" _dark={{ color: 'white' }} lineHeight="1">
                            {overview.data.metrics.tenants.total}
                          </Stat.ValueText>
                          <Badge colorPalette={getMetricByPeriod(overview.data.metrics.tenants.new_today, overview.data.metrics.tenants.new_this_week, overview.data.metrics.tenants.new_this_month) >= 0 ? "green" : "red"} gap="0">
                            {getMetricByPeriod(overview.data.metrics.tenants.new_today, overview.data.metrics.tenants.new_this_week, overview.data.metrics.tenants.new_this_month) >= 0 ? <Stat.UpIndicator /> : <Stat.DownIndicator />}
                            {Math.abs(getMetricByPeriod(overview.data.metrics.tenants.new_today, overview.data.metrics.tenants.new_this_week, overview.data.metrics.tenants.new_this_month))}
                          </Badge>
                        </HStack>
                        <Text fontSize={'sm'}>{getPeriodLabel()}</Text>
                      </Flex>
                      <Flex align="center" justify="center" w={16} h={16} borderRadius="full" bg="blue.50" _dark={{ bg: 'blue.900' }}>
                        <Icon as={FiUsers} boxSize={8} color="blue.500" _dark={{ color: 'blue.400' }} />
                      </Flex>
                    </Flex>
                  </Stat.Root>
                </Card.Body>
              </Card.Root>

              {/* Users Metric */}
              <Card.Root boxShadow="sm" _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }} transition="all 0.2s" borderRadius="xl">
                <Card.Body p={5}>
                  <Stat.Root>
                    <Flex justify="space-between" align="center">
                      <Flex flexDir={'column'} gap={1}>
                        <Stat.Label fontSize="sm" fontWeight="bold" color="gray.600" _dark={{ color: 'gray.400' }}>Total Users</Stat.Label>
                        <HStack alignItems={'center'}>
                          <Stat.ValueText fontSize="4xl" fontWeight="bold" color="gray.900" _dark={{ color: 'white' }} lineHeight="1">
                            {overview.data.metrics.users.total}
                          </Stat.ValueText>
                          <Badge colorPalette={getMetricByPeriod(overview.data.metrics.users.new_today, overview.data.metrics.users.new_this_week, overview.data.metrics.users.new_this_month) >= 0 ? "green" : "red"} gap="0">
                            {getMetricByPeriod(overview.data.metrics.users.new_today, overview.data.metrics.users.new_this_week, overview.data.metrics.users.new_this_month) >= 0 ? <Stat.UpIndicator /> : <Stat.DownIndicator />}
                            {Math.abs(getMetricByPeriod(overview.data.metrics.users.new_today, overview.data.metrics.users.new_this_week, overview.data.metrics.users.new_this_month))}
                          </Badge>
                        </HStack>
                        <Text fontSize={'sm'}>{getPeriodLabel()}</Text>
                      </Flex>
                      <Flex align="center" justify="center" w={16} h={16} borderRadius="full" bg="purple.50" _dark={{ bg: 'purple.900' }}>
                        <Icon as={FiActivity} boxSize={8} color="purple.500" _dark={{ color: 'purple.400' }} />
                      </Flex>
                    </Flex>
                  </Stat.Root>
                </Card.Body>
              </Card.Root>

              {/* Tickets Metric */}
              <Card.Root boxShadow="sm" _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }} transition="all 0.2s" borderRadius="xl">
                <Card.Body p={5}>
                  <Stat.Root>
                    <Flex justify="space-between" align="center">
                      <Flex flexDir={'column'} gap={1}>
                        <Stat.Label fontSize="sm" fontWeight="bold" color="gray.600" _dark={{ color: 'gray.400' }}>Support Tickets</Stat.Label>
                        <HStack alignItems={'center'}>
                          <Stat.ValueText fontSize="4xl" fontWeight="bold" color="gray.900" _dark={{ color: 'white' }} lineHeight="1">
                            {overview.data.metrics.tickets.total}
                          </Stat.ValueText>
                          <Badge colorPalette={getMetricByPeriod(overview.data.metrics.tickets.new_today, overview.data.metrics.tickets.new_this_week, overview.data.metrics.tickets.new_this_month) >= 0 ? "green" : "red"} gap="0">
                            {getMetricByPeriod(overview.data.metrics.tickets.new_today, overview.data.metrics.tickets.new_this_week, overview.data.metrics.tickets.new_this_month) >= 0 ? <Stat.UpIndicator /> : <Stat.DownIndicator />}
                            {Math.abs(getMetricByPeriod(overview.data.metrics.tickets.new_today, overview.data.metrics.tickets.new_this_week, overview.data.metrics.tickets.new_this_month))}
                          </Badge>
                        </HStack>
                        <Text fontSize={'sm'}>New {getPeriodLabel().toLowerCase()}</Text>
                      </Flex>
                      <Flex align="center" justify="center" w={16} h={16} borderRadius="full" bg="orange.50" _dark={{ bg: 'orange.900' }}>
                        <Icon as={FiAlertCircle} boxSize={8} color="orange.500" _dark={{ color: 'orange.400' }} />
                      </Flex>
                    </Flex>
                  </Stat.Root>
                </Card.Body>
              </Card.Root>

              {/* Revenue Metric */}
              <Card.Root boxShadow="sm" _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }} transition="all 0.2s" borderRadius="xl">
                <Card.Body p={5}>
                  <Stat.Root>
                    <Flex justify="space-between" align="center">
                      <Flex flexDir={'column'} gap={1}>
                        <Stat.Label fontSize="sm" fontWeight="bold" color="gray.600" _dark={{ color: 'gray.400' }}>Revenue - {getPeriodLabel()}</Stat.Label>
                        <HStack alignItems={'center'}>
                          <Stat.ValueText fontSize="4xl" fontWeight="bold" color="gray.900" _dark={{ color: 'white' }} lineHeight="1">
                            <FormatNumber value={getMetricByPeriod(overview.data.metrics.revenue.today, overview.data.metrics.revenue.this_week, overview.data.metrics.revenue.this_month)} style="currency" currency="USD" />
                          </Stat.ValueText>

                        </HStack>
                        <HStack>
                          <Badge size={'sm'} colorPalette={overview.data.metrics.revenue.growth_rate >= 0 ? "green" : "red"} gap="0">
                            {overview.data.metrics.revenue.growth_rate >= 0 ? <Stat.UpIndicator /> : <Stat.DownIndicator />}
                            {Math.abs(overview.data.metrics.revenue.growth_rate)}%
                          </Badge>
                          <Text fontSize={'xs'}>Growth rate</Text>
                        </HStack>
                      </Flex>
                      <Flex align="center" justify="center" w={16} h={16} borderRadius="full" bg="green.50" _dark={{ bg: 'green.900' }}>
                        <Icon as={FiDollarSign} boxSize={8} color="green.500" _dark={{ color: 'green.400' }} />
                      </Flex>
                    </Flex>
                  </Stat.Root>
                </Card.Body>
              </Card.Root>
            </SimpleGrid>
          )}

          {/* Quick Stats - Row 2 */}
          {overview && (
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={{ base: 4, md: 6 }} mb={{ base: 6, md: 8 }}>
              {/* Top Revenue Plans */}
              <Card.Root size="sm" boxShadow="sm">
                <Card.Header pb={4} borderBottomWidth="1px">
                  <Heading size="sm" fontWeight="semibold" color="gray.900" _dark={{ color: 'white' }}>Top Revenue Plans</Heading>
                </Card.Header>
                <Card.Body pt={4}>
                  {overview.data.quickStats.topRevenuePlans.length > 0 ? (
                    <VStack align="stretch" gap={3}>
                      {overview.data.quickStats.topRevenuePlans.map((plan, index) => (
                        <Flex key={index} justify="space-between" align="center" p={2} _hover={{ bg: 'gray.50', _dark: { bg: 'gray.800' } }} borderRadius="md" transition="all 0.2s">
                          <HStack gap={2}>
                            <Flex align="center" justify="center" w={6} h={6} bg="green.100" _dark={{ bg: 'green.900' }} borderRadius="md" fontSize="xs" fontWeight="bold" color="green.700">
                              {index + 1}
                            </Flex>
                            <Text fontSize="sm" fontWeight="medium" color="gray.700" _dark={{ color: 'gray.300' }}>{plan.plan_name}</Text>
                          </HStack>
                          <Text fontWeight="bold" color="green.600" _dark={{ color: 'green.400' }} fontSize="sm">${plan.revenue.toLocaleString()}</Text>
                        </Flex>
                      ))}
                    </VStack>
                  ) : (
                    <Flex h="120px" align="center" justify="center" flexDir="column" gap={2}>
                      <Icon as={FiPackage} boxSize={8} color="gray.400" />
                      <Text fontSize="sm" color="gray.500" _dark={{ color: 'gray.500' }}>No plans with revenue yet</Text>
                    </Flex>
                  )}
                </Card.Body>
              </Card.Root>

              {/* Active Users */}
              <Card.Root size="sm" boxShadow="sm">
                <Card.Header pb={4} borderBottomWidth="1px">
                  <Heading size="sm" fontWeight="semibold" color="gray.900" _dark={{ color: 'white' }}>Active Users</Heading>
                </Card.Header>
                <Card.Body pt={4}>
                  <VStack align="stretch" gap={3}>
                    <Flex justify="space-between" align="center" p={2}>
                      <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>Total</Text>
                      <Text fontWeight="bold" fontSize="lg" color="gray.900" _dark={{ color: 'white' }}>{overview.data.quickStats.activeUsers.total}</Text>
                    </Flex>
                    <Flex justify="space-between" align="center" p={2}>
                      <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>Online Now</Text>
                      <Badge colorScheme="green" fontSize="sm" px={3} py={1} borderRadius="md">{overview.data.quickStats.activeUsers.online_now}</Badge>
                    </Flex>
                    <Flex justify="space-between" align="center" p={2}>
                      <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>Locked</Text>
                      <Badge colorScheme="red" fontSize="sm" px={3} py={1} borderRadius="md">{overview.data.quickStats.activeUsers.locked}</Badge>
                    </Flex>
                  </VStack>
                </Card.Body>
              </Card.Root>

              {/* Failed Payments */}
              <Card.Root size="sm" boxShadow="sm">
                <Card.Header pb={4} borderBottomWidth="1px">
                  <Heading size="sm" fontWeight="semibold" color="gray.900" _dark={{ color: 'white' }}>Failed Payments</Heading>
                </Card.Header>
                <Card.Body pt={4}>
                  <VStack align="stretch" gap={3}>
                    <Flex justify="space-between" align="center" p={2}>
                      <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>This Month</Text>
                      <Badge colorScheme="red" fontSize="sm" px={3} py={1} borderRadius="md">{overview.data.quickStats.failedPayments.count_this_month}</Badge>
                    </Flex>
                    <Flex justify="space-between" align="center" p={2}>
                      <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>Amount</Text>
                      <Text fontWeight="bold" color="red.600" _dark={{ color: 'red.400' }} fontSize="lg">${overview.data.quickStats.failedPayments.total_amount.toLocaleString()}</Text>
                    </Flex>
                    <Button size="sm" colorScheme="blue" variant="outline" mt={1}>
                      View Details <Icon as={FiArrowRight} ml={1} />
                    </Button>
                  </VStack>
                </Card.Body>
              </Card.Root>
            </SimpleGrid>
          )}

          {/* Charts Section - Row 3 */}
          {charts && (
            <Box mb={{ base: 6, md: 8 }}>
              {/* Revenue Trend Chart - Full Width */}
              <Card.Root size="sm" boxShadow="sm" mb={{ base: 4, md: 6 }}>
                <Card.Header pb={4} borderBottomWidth="1px">
                  <Flex justify="space-between" align="center">
                    <Heading size="md" fontWeight="semibold" color="gray.900" _dark={{ color: 'white' }}>Revenue Trend (Last 12 Months)</Heading>
                    <HStack gap={2}>
                      <IconButton
                        aria-label="Line Chart"
                        size="sm"
                        variant={chartType === 'line' ? 'solid' : 'ghost'}
                        colorScheme={chartType === 'line' ? 'blue' : 'gray'}
                        onClick={() => setChartType('line')}
                      >
                        <Icon as={FiTrendingUp} />
                      </IconButton>
                      <IconButton
                        aria-label="Bar Chart"
                        size="sm"
                        variant={chartType === 'bar' ? 'solid' : 'ghost'}
                        colorScheme={chartType === 'bar' ? 'blue' : 'gray'}
                        onClick={() => setChartType('bar')}
                      >
                        <Icon as={FiBarChart2} />
                      </IconButton>
                      <IconButton
                        aria-label="Area Chart"
                        size="sm"
                        variant={chartType === 'area' ? 'solid' : 'ghost'}
                        colorScheme={chartType === 'area' ? 'blue' : 'gray'}
                        onClick={() => setChartType('area')}
                      >
                        <Icon as={FiActivity} />
                      </IconButton>
                      <IconButton
                        aria-label="Pie Chart"
                        size="sm"
                        variant={chartType === 'pie' ? 'solid' : 'ghost'}
                        colorScheme={chartType === 'pie' ? 'blue' : 'gray'}
                        onClick={() => setChartType('pie')}
                      >
                        <Icon as={FiPieChart} />
                      </IconButton>
                    </HStack>
                  </Flex>
                </Card.Header>
                <Card.Body pt={6}>
                  {(() => {
                    /* Check if data exists and has values */
                    if (!charts.data.revenueTrend.datasets ||
                        charts.data.revenueTrend.datasets.length === 0 ||
                        !charts.data.revenueTrend.labels ||
                        charts.data.revenueTrend.labels.length === 0 ||
                        !charts.data.revenueTrend.datasets[0].data ||
                        charts.data.revenueTrend.datasets[0].data.length === 0) {
                      return (
                        <Flex h="320px" align="center" justify="center" bg="gray.50" _dark={{ bg: 'gray.800' }} borderRadius="lg" borderWidth="1px" borderStyle="dashed" borderColor="gray.300" flexDir="column" gap={3}>
                          <Icon as={chartType === 'line' ? FiTrendingUp : chartType === 'bar' ? FiBarChart2 : chartType === 'area' ? FiActivity : FiPieChart} boxSize={12} color="gray.400" />
                          <Text color="gray.600" _dark={{ color: 'gray.400' }} fontWeight="medium">No Revenue Data Available</Text>
                          <Text fontSize="sm" color="gray.500" _dark={{ color: 'gray.500' }}>Period: {charts.data.revenueTrend.period}</Text>
                          <Text fontSize="xs" color="gray.400" _dark={{ color: 'gray.500' }}>Data will appear once revenue is recorded</Text>
                        </Flex>
                      )
                    }

                    /* Prepare chart data */
                    const chartData = charts.data.revenueTrend.labels.map((label, index) => ({
                      month: label,
                      revenue: charts.data.revenueTrend.datasets[0].data[index]
                    }))

                    /* Colors for pie chart */
                    const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#84cc16', '#a855f7']

                    return (
                      <Box h="320px" w="100%">
                        {chartType === 'line' ? (
                          /* Line Chart */
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis
                                dataKey="month"
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                stroke="#6b7280"
                                angle={-45}
                                textAnchor="end"
                                height={60}
                              />
                              <YAxis
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                stroke="#6b7280"
                                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                width={60}
                              />
                              <Tooltip
                                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                              />
                              <Legend wrapperStyle={{ paddingTop: '10px' }} />
                              <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={{ fill: '#3b82f6', r: 5 }}
                                activeDot={{ r: 7 }}
                                name="Revenue"
                                isAnimationActive={true}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : chartType === 'bar' ? (
                          /* Bar Chart */
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis
                                dataKey="month"
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                stroke="#6b7280"
                                angle={-45}
                                textAnchor="end"
                                height={60}
                              />
                              <YAxis
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                stroke="#6b7280"
                                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                width={60}
                              />
                              <Tooltip
                                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                              />
                              <Legend wrapperStyle={{ paddingTop: '10px' }} />
                              <Bar
                                dataKey="revenue"
                                fill="#3b82f6"
                                radius={[8, 8, 0, 0]}
                                name="Revenue"
                                isAnimationActive={true}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : chartType === 'area' ? (
                          /* Area Chart */
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                              <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis
                                dataKey="month"
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                stroke="#6b7280"
                                angle={-45}
                                textAnchor="end"
                                height={60}
                              />
                              <YAxis
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                stroke="#6b7280"
                                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                width={60}
                              />
                              <Tooltip
                                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                              />
                              <Legend wrapperStyle={{ paddingTop: '10px' }} />
                              <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                                name="Revenue"
                                isAnimationActive={true}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        ) : (
                          /* Pie Chart */
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                fill="#8884d8"
                                paddingAngle={2}
                                dataKey="revenue"
                                label={({ month, percent }) => `${month}: ${(Number(percent) * 100).toFixed(0)}%`}
                                isAnimationActive={true}
                              >
                                {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                              />
                              {/* <Legend /> */}
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </Box>
                    )
                  })()}
                </Card.Body>
              </Card.Root>
            </Box>
          )}

          {/* Tenant Status, Plans & Tickets Overview - Row 4 */}
          {tables && charts && (
            <SimpleGrid columns={{ base: 1, lg: 3 }} gap={{ base: 4, md: 6 }} mb={{ base: 6, md: 8 }}>
              {/* Tenant Status Distribution */}
              <Card.Root size="sm" boxShadow="sm">
                <Card.Header pb={4} borderBottomWidth="1px">
                  <Heading size="md" fontWeight="semibold" color="gray.900" _dark={{ color: 'white' }}>Tenant Status Distribution</Heading>
                </Card.Header>
                <Card.Body pt={6}>
                  <VStack align="stretch" gap={4}>
                    {charts.data.tenantStatusDistribution.labels.map((label, index) => (
                      <Flex key={index} justify="space-between" align="center" p={3} bg="gray.50" _dark={{ bg: 'gray.800' }} borderRadius="md">
                        <HStack gap={3}>
                          <Box w={4} h={4} borderRadius="full" bg={charts.data.tenantStatusDistribution.colors[index]} boxShadow="sm" />
                          <Text fontSize="sm" fontWeight="medium" color="gray.700" _dark={{ color: 'gray.300' }}>{label}</Text>
                        </HStack>
                        <HStack gap={2}>
                          <Text fontWeight="bold" fontSize="lg" color="gray.900" _dark={{ color: 'white' }}>{charts.data.tenantStatusDistribution.data[index]}</Text>
                          <Text fontSize="sm" color="gray.500" _dark={{ color: 'gray.500' }}>({charts.data.tenantStatusDistribution.percentages[index]}%)</Text>
                        </HStack>
                      </Flex>
                    ))}
                  </VStack>
                </Card.Body>
              </Card.Root>

              {/* Subscription Plans Overview */}
              <Card.Root size="sm" boxShadow="sm">
                <Card.Header pb={4} borderBottomWidth="1px">
                  <Flex justify="space-between" align="center">
                    <HStack gap={2}>
                      <Icon as={FiPackage} color="blue.500" boxSize={5} />
                      <Heading size="md" fontWeight="semibold" color="gray.900" _dark={{ color: 'white' }}>Subscription Plans</Heading>
                    </HStack>
                    <Button size="sm" variant="ghost" colorScheme="blue" onClick={() => router.push('/admin/plan-management')}>
                      Manage <Icon as={FiArrowRight} ml={1} />
                    </Button>
                  </Flex>
                </Card.Header>
                <Card.Body pt={4}>
                  <VStack align="stretch" gap={3}>
                    {charts.data.plansOverview.plans.map((plan) => (
                      <Flex key={plan.id} justify="space-between" align="center" p={3} bg="gray.50" _dark={{ bg: 'gray.800' }} borderRadius="md" _hover={{ bg: 'blue.50', _dark: { bg: 'gray.700' } }} transition="all 0.2s">
                        <Box>
                          <Text fontWeight="semibold" fontSize="sm" color="gray.900" _dark={{ color: 'white' }} mb={0.5}>{plan.name}</Text>
                          <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.500' }}>{plan.active_subscriptions} subscriptions</Text>
                        </Box>
                        <Text fontWeight="bold" color="green.600" _dark={{ color: 'green.400' }} fontSize="md">${plan.monthly_revenue.toLocaleString()}</Text>
                      </Flex>
                    ))}
                  </VStack>
                </Card.Body>
              </Card.Root>

              {/* Support Tickets Overview */}
              <Card.Root size="sm" boxShadow="sm">
                <Card.Header pb={4} borderBottomWidth="1px">
                  <Flex justify="space-between" align="center">
                    <HStack gap={2}>
                      <Icon as={FiAlertCircle} color="orange.500" boxSize={5} />
                      <Heading size="md" fontWeight="semibold" color="gray.900" _dark={{ color: 'white' }}>Support Tickets</Heading>
                    </HStack>
                    <Button size="sm" variant="ghost" colorScheme="blue" onClick={() => router.push('/admin/support-ticket-management')}>
                      View All <Icon as={FiArrowRight} ml={1} />
                    </Button>
                  </Flex>
                </Card.Header>
                <Card.Body pt={4}>
                  <VStack align="stretch" gap={3}>
                    {tables.data.ticketsOverview.by_status.map((status) => (
                      <Flex key={status.status} justify="space-between" align="center" p={3} bg="gray.50" _dark={{ bg: 'gray.800' }} borderRadius="md">
                        <Box>
                          <Text fontWeight="semibold" fontSize="sm" color="gray.900" _dark={{ color: 'white' }} mb={0.5} textTransform="capitalize">{status.status}</Text>
                          <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.500' }}>{status.percentage}% of total</Text>
                        </Box>
                        <HStack gap={2}>
                          <Text fontWeight="bold" fontSize="lg" color="gray.900" _dark={{ color: 'white' }}>{status.count}</Text>
                          <Badge colorScheme={status.sla_compliant > status.sla_breached ? 'green' : 'red'} fontSize="xs" px={2} py={1}>
                            {status.sla_breached > 0 ? '⚠️' : '✓'}
                          </Badge>
                        </HStack>
                      </Flex>
                    ))}
                  </VStack>
                </Card.Body>
              </Card.Root>
            </SimpleGrid>
          )}

          {/* Deployment Statistics - Row 5 */}
          {tables && tables.data.tenantsDeployments && (
            <Card.Root size="sm" boxShadow="sm" mb={{ base: 6, md: 8 }}>
              <Card.Header pb={4} borderBottomWidth="1px">
                <Flex justify="space-between" align="center">
                  <HStack gap={2}>
                    <Icon as={FiPackage} color="purple.500" boxSize={5} />
                    <Heading size="md" fontWeight="semibold" color="gray.900" _dark={{ color: 'white' }}>Deployment Overview</Heading>
                  </HStack>
                  <Button size="sm" variant="ghost" colorScheme="blue" onClick={() => router.push('/admin/tenant-management')}>
                    View All <Icon as={FiArrowRight} ml={1} />
                  </Button>
                </Flex>
              </Card.Header>
              <Card.Body pt={4}>
                {/* Deployment Summary Stats */}
                <SimpleGrid columns={{ base: 2, md: 4, lg: 7 }} gap={4} mb={6}>
                  <Box p={3} bg="blue.50" _dark={{ bg: 'blue.900' }} borderRadius="lg" textAlign="center">
                    <Text fontSize="xs" fontWeight="medium" color="blue.700" _dark={{ color: 'blue.300' }} mb={1}>Total</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="blue.900" _dark={{ color: 'blue.100' }}>{tables.data.tenantsDeployments.summary.total_tenants}</Text>
                  </Box>
                  <Box p={3} bg="green.50" _dark={{ bg: 'green.900' }} borderRadius="lg" textAlign="center">
                    <Text fontSize="xs" fontWeight="medium" color="green.700" _dark={{ color: 'green.300' }} mb={1}>Deployed</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="green.900" _dark={{ color: 'green.100' }}>{tables.data.tenantsDeployments.summary.deployed}</Text>
                  </Box>
                  <Box p={3} bg="yellow.50" _dark={{ bg: 'yellow.900' }} borderRadius="lg" textAlign="center">
                    <Text fontSize="xs" fontWeight="medium" color="yellow.700" _dark={{ color: 'yellow.300' }} mb={1}>Provisioning</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="yellow.900" _dark={{ color: 'yellow.100' }}>{tables.data.tenantsDeployments.summary.provisioning}</Text>
                  </Box>
                  <Box p={3} bg="red.50" _dark={{ bg: 'red.900' }} borderRadius="lg" textAlign="center">
                    <Text fontSize="xs" fontWeight="medium" color="red.700" _dark={{ color: 'red.300' }} mb={1}>Failed</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="red.900" _dark={{ color: 'red.100' }}>{tables.data.tenantsDeployments.summary.failed}</Text>
                  </Box>
                  <Box p={3} bg="gray.50" _dark={{ bg: 'gray.800' }} borderRadius="lg" textAlign="center">
                    <Text fontSize="xs" fontWeight="medium" color="gray.700" _dark={{ color: 'gray.300' }} mb={1}>Pending</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="gray.900" _dark={{ color: 'gray.100' }}>{tables.data.tenantsDeployments.summary.pending}</Text>
                  </Box>
                  <Box p={3} bg="purple.50" _dark={{ bg: 'purple.900' }} borderRadius="lg" textAlign="center">
                    <Text fontSize="xs" fontWeight="medium" color="purple.700" _dark={{ color: 'purple.300' }} mb={1}>Shared</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="purple.900" _dark={{ color: 'purple.100' }}>{tables.data.tenantsDeployments.summary.shared_deployment}</Text>
                  </Box>
                  <Box p={3} bg="teal.50" _dark={{ bg: 'teal.900' }} borderRadius="lg" textAlign="center">
                    <Text fontSize="xs" fontWeight="medium" color="teal.700" _dark={{ color: 'teal.300' }} mb={1}>Dedicated</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="teal.900" _dark={{ color: 'teal.100' }}>{tables.data.tenantsDeployments.summary.dedicated_deployment}</Text>
                  </Box>
                </SimpleGrid>

                {/* Deployments List - Scrollable */}
                <Box borderWidth="1px" borderRadius="lg">
                  <Box maxH="500px" overflowY="auto" overflowX="auto" scrollbar={'hidden'}>
                    {/* Header Row */}
                    <Box gap={4} minW="900px" bg="gray.100" _dark={{ bg: 'gray.800' }} overflowY="auto" overflowX="auto" scrollbar={'hidden'} borderBottomWidth="2px" borderColor="gray.300" px={4} py={3} position="sticky" top={0} zIndex={1}>
                      <HStack >
                        <Box w="5%" flexShrink={0}>
                          <Text fontSize="xs" fontWeight="bold" color="gray.700" _dark={{ color: 'gray.300' }} textTransform="uppercase">#</Text>
                        </Box>
                        <Box w="20%" flexShrink={0}>
                          <Text fontSize="xs" fontWeight="bold" color="gray.700" _dark={{ color: 'gray.300' }} textTransform="uppercase">Organization</Text>
                        </Box>
                        <Box w="10%" flexShrink={0}>
                          <Text fontSize="xs" fontWeight="bold" color="gray.700" _dark={{ color: 'gray.300' }} textTransform="uppercase">Status</Text>
                        </Box>
                        <Box w="8%" flexShrink={0}>
                          <Text fontSize="xs" fontWeight="bold" color="gray.700" _dark={{ color: 'gray.300' }} textTransform="uppercase">Type</Text>
                        </Box>
                        <Box w="12%" flexShrink={0}>
                          <Text fontSize="xs" fontWeight="bold" color="gray.700" _dark={{ color: 'gray.300' }} textTransform="uppercase">Infrastructure</Text>
                        </Box>
                        <Box w="10%" flexShrink={0}>
                          <Text fontSize="xs" fontWeight="bold" color="gray.700" _dark={{ color: 'gray.300' }} textTransform="uppercase">Branches</Text>
                        </Box>
                        <Box w="13%" flexShrink={0}>
                          <Text fontSize="xs" fontWeight="bold" color="gray.700" _dark={{ color: 'gray.300' }} textTransform="uppercase">Last Deployed</Text>
                        </Box>
                        <Box w="10%" flexShrink={0}>
                          <Text fontSize="xs" fontWeight="bold" color="gray.700" _dark={{ color: 'gray.300' }} textTransform="uppercase">Tenant</Text>
                        </Box>
                        <Box w="12%" flexShrink={0}>
                          <Text fontSize="xs" fontWeight="bold" color="gray.700" _dark={{ color: 'gray.300' }} textTransform="uppercase">Actions</Text>
                        </Box>
                      </HStack>
                    </Box>
                    <VStack overflowY="auto" overflowX="auto" scrollbar={'hidden'}  align="stretch" gap={0} divideY="1px" bg="white" _dark={{ bg: 'gray.900' }}>
                      {tables.data.tenantsDeployments.tenants.map((tenant, index) => (
                        <Box key={tenant.id} px={4} py={3} _hover={{ bg: 'gray.50', _dark: { bg: 'gray.800' } }} transition="all 0.2s">
                          <HStack gap={4} minW="900px">
                            {/* Serial Number */}
                            <Box w="5%" flexShrink={0}>
                              <Text fontSize="sm" fontWeight="semibold" color="gray.700" _dark={{ color: 'gray.300' }}>
                                {index + 1}
                              </Text>
                            </Box>

                            {/* Organization Info */}
                            <Box w="20%" flexShrink={0}>
                              <Text fontWeight="semibold" color="gray.900" _dark={{ color: 'white' }} fontSize="sm" mb={0.5}>{tenant.organization_name}</Text>
                              <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.500' }}>{tenant.primary_email}</Text>
                            </Box>

                            {/* Deployment Status */}
                            <Box w="10%" flexShrink={0}>
                              <Badge 
                                bg={STATUS_BADGE_CONFIG[tenant.deployment_status as keyof typeof STATUS_BADGE_CONFIG]?.bg || 'gray'} 
                                color={STATUS_BADGE_CONFIG[tenant.deployment_status as keyof typeof STATUS_BADGE_CONFIG]?.color || 'gray'} 
                                textTransform="capitalize" fontSize="xs" px={2} py={1} borderRadius="md">{tenant.deployment_status}</Badge>
                            </Box>

                            {/* Type */}
                            <Box w="8%" flexShrink={0}>
                              <Badge colorScheme={tenant.deployment_type === 'dedicated' ? 'purple' : 'blue'} textTransform="capitalize" fontSize="xs" px={2} py={1} borderRadius="md">{tenant.deployment_type || 'N/A'}</Badge>
                            </Box>

                            {/* Infrastructure */}
                            <Box w="12%" flexShrink={0}>
                              <HStack gap={1}>
                                <Badge colorScheme={tenant.infrastructure_provisioned ? 'green' : 'red'} fontSize="xs" px={2} py={1} borderRadius="md">{tenant.infrastructure_provisioned ? 'Provisioned' : 'Provisioning'}</Badge>
                                {tenant.custom_domain && (
                                  <Icon as={FiPackage} boxSize={3} color="purple.500" />
                                )}
                              </HStack>
                            </Box>

                            {/* Branches Usage */}
                            <Box w="10%" flexShrink={0}>
                              <Text fontSize="sm" color="gray.700" _dark={{ color: 'gray.300' }} mb={0.5}>{tenant.current_branches_count || 0} / {tenant.max_branches_count || 0}</Text>
                              {tenant.branches_usage_percentage > 0 && (
                                <Text fontSize="xs" color={tenant.branches_usage_percentage >= 80 ? 'red.500' : 'gray.500'} fontWeight={tenant.branches_usage_percentage >= 80 ? 'semibold' : 'normal'}>{tenant.branches_usage_percentage}% used</Text>
                              )}
                            </Box>

                            {/* Last Deployed */}
                            <Box w="13%" flexShrink={0}>
                              <Text fontSize="sm" color="gray.700" _dark={{ color: 'gray.300' }} mb={0.5}>{tenant.last_deployed_at ? `${tenant.days_since_deployment || 0} days ago` : 'Never'}</Text>
                              {tenant.last_deployment_status && (
                                <Badge
                                  bg={STATUS_BADGE_CONFIG[tenant.last_deployment_status as keyof typeof STATUS_BADGE_CONFIG]?.bg || 'gray'}
                                  color={STATUS_BADGE_CONFIG[tenant.last_deployment_status as keyof typeof STATUS_BADGE_CONFIG]?.color || 'gray'}
                                  fontSize="xs" px={1.5} py={0.5}>{tenant.last_deployment_status}</Badge>
                              )}
                            </Box>

                            {/* Tenant Status */}
                            <Box w="10%" flexShrink={0}>
                              <Badge
                                bg={STATUS_BADGE_CONFIG[tenant.tenant_status as keyof typeof STATUS_BADGE_CONFIG]?.bg || 'gray'}
                                color={STATUS_BADGE_CONFIG[tenant.tenant_status as keyof typeof STATUS_BADGE_CONFIG]?.color || 'gray'}
                                textTransform="capitalize" fontSize="xs" px={2} py={1} borderRadius="md">{tenant.tenant_status}</Badge>
                            </Box>

                            {/* Actions */}
                            <Box w="12%" flexShrink={0} bg="inherit">
                              {tenant.deployment_status === 'failed' && (
                                <PrimaryButton
                                  size="sm"
                                  onClick={() => handleRedeploy(tenant.tenant_id, tenant.organization_name)}
                                  loading={provisioningTenantId === tenant.tenant_id}
                                  disabled={provisioningTenantId === tenant.tenant_id}
                                  leftIcon={FiRefreshCw}
                                  buttonText="Redeploy"
                                  buttonProps={{ fontSize: 'xs', px: 2, py: 1, h: 'auto', minH: 'auto' }}
                                />
                              )}
                              {tenant.deployment_status === 'deployed' && (
                                <Text fontSize="xs" color="gray.400" _dark={{ color: 'gray.600' }}>-</Text>
                              )}
                              {(tenant.deployment_status === 'provisioning' || tenant.deployment_status === 'pending') && (
                                <Badge colorScheme="yellow" fontSize="xs" px={2} py={1}>In Progress</Badge>
                              )}
                            </Box>
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  </Box>

                  {/* Footer with count */}
                  <Box borderTopWidth="1px" p={3} bg="gray.50" _dark={{ bg: 'gray.800' }}>
                    <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }} textAlign="center">
                      Showing {tables.data.tenantsDeployments.showing} of {tables.data.tenantsDeployments.total_count} deployments
                    </Text>
                  </Box>
                </Box>
              </Card.Body>
            </Card.Root>
          )}

          {/* Recent Tenants Table - Row 6 */}
          {tables && (
            <Card.Root size="sm" boxShadow="sm" mb={{ base: 6, md: 8 }}>
              <Card.Header pb={4} borderBottomWidth="1px">
                <Flex justify="space-between" align="center">
                  <Heading size="md" fontWeight="semibold" color="gray.900" _dark={{ color: 'white' }}>Recent Tenants</Heading>
                  <Button size="sm" variant="ghost" colorScheme="blue" onClick={() => router.push('/admin/tenant-management')}>
                    View All <Icon as={FiArrowRight} ml={1} />
                  </Button>
                </Flex>
              </Card.Header>
              <Card.Body pt={4}>
                <VStack align="stretch" gap={3}>
                  {tables.data.recentTenants.tenants.slice(0, 5).map((tenant) => (
                    <Box key={tenant.id} p={4} bg="gray.50" _dark={{ bg: 'gray.800' }} borderRadius="lg" borderWidth="1px" borderColor="gray.200" _hover={{ borderColor: 'blue.400', boxShadow: 'sm' }} transition="all 0.2s">
                      <SimpleGrid columns={{ base: 1, md: 5 }} gap={4}>
                        <Box>
                          <Text fontSize="xs" fontWeight="medium" color="gray.500" _dark={{ color: 'gray.500' }} mb={1}>Organization</Text>
                          <Text fontWeight="semibold" color="gray.900" _dark={{ color: 'white' }} fontSize="sm">{tenant.organization_name}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" fontWeight="medium" color="gray.500" _dark={{ color: 'gray.500' }} mb={1}>Email</Text>
                          <Text fontSize="sm" color="gray.700" _dark={{ color: 'gray.300' }}>{tenant.primary_email}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" fontWeight="medium" color="gray.500" _dark={{ color: 'gray.500' }} mb={1}>Plan</Text>
                          <Text fontSize="sm" fontWeight="medium" color="gray.700" _dark={{ color: 'gray.300' }}>{tenant.plan_name}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" fontWeight="medium" color="gray.500" _dark={{ color: 'gray.500' }} mb={1}>Status</Text>
                          <Badge
                            bg={STATUS_BADGE_CONFIG[tenant.status as keyof typeof STATUS_BADGE_CONFIG]?.bg || 'gray'}
                            color={STATUS_BADGE_CONFIG[tenant.status as keyof typeof STATUS_BADGE_CONFIG]?.color || 'gray'}
                            textTransform="capitalize" fontSize="xs" px={2} py={1} borderRadius="md">{tenant.status}</Badge>
                        </Box>
                        <Box>
                          <Text fontSize="xs" fontWeight="medium" color="gray.500" _dark={{ color: 'gray.500' }} mb={1}>MRR</Text>
                          <Text fontWeight="bold" color="green.600" _dark={{ color: 'green.400' }} fontSize="sm">${tenant.mrr}</Text>
                        </Box>
                      </SimpleGrid>
                    </Box>
                  ))}
                </VStack>
              </Card.Body>
            </Card.Root>
          )}

          {/* System Alerts & Activity - Row 7 */}
          {tables && (
            <Card.Root size="sm" boxShadow="sm">
              <Card.Header pb={4} borderBottomWidth="1px">
                <HStack gap={2}>
                  <Icon as={FiActivity} color="blue.500" boxSize={5} />
                  <Heading size="md" fontWeight="semibold" color="gray.900" _dark={{ color: 'white' }}>System Alerts & Activity</Heading>
                </HStack>
              </Card.Header>
              <Card.Body pt={4}>
                <VStack align="stretch" gap={4}>
                  {/* System Alerts */}
                  {tables.data.activityFeed.alerts.map((alert) => (
                    <Box key={alert.id} p={4} bg="gray.50" _dark={{ bg: 'gray.800' }} borderRadius="lg" borderLeftWidth="4px" borderLeftColor={alert.type === 'critical' ? 'red.500' : alert.type === 'warning' ? 'orange.500' : 'blue.500'}>
                      <Flex justify="space-between" align="flex-start">
                        <HStack gap={3} flex={1}>
                          <Text fontSize="2xl">{alert.icon}</Text>
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm" color="gray.900" _dark={{ color: 'white' }} mb={1}>{alert.title}</Text>
                            <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>{alert.message}</Text>
                          </Box>
                        </HStack>
                        <Badge colorScheme={alert.type === 'critical' ? 'red' : alert.type === 'warning' ? 'orange' : 'blue'} fontSize="sm" px={3} py={1} borderRadius="full">{alert.count}</Badge>
                      </Flex>
                    </Box>
                  ))}

                  <Separator my={2} />

                  {/* Recent Activities */}
                  <VStack align="stretch" gap={2}>
                    {tables.data.activityFeed.recent_activities.slice(0, 5).map((activity) => (
                      <SimpleGrid key={activity.id} columns={3} p={3} alignItems="center" _hover={{ bg: 'gray.50', _dark: { bg: 'gray.800' } }} borderRadius="md" transition="all 0.2s" gap={3}>
                        <HStack gap={3}>
                          <Text fontSize="xl">{activity.icon}</Text>
                          <Text fontSize="sm" color="gray.700" _dark={{ color: 'gray.300' }}>{activity.description}</Text>
                        </HStack>
                        <Flex justify="center">
                          <Badge colorScheme="blue" fontSize="xs" px={2} py={0.5} borderRadius="md" textTransform="capitalize">{activity.activity_type}</Badge>
                        </Flex>
                        <Flex justify="flex-end">
                          <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.500' }} whiteSpace="nowrap">{activity.relative_time}</Text>
                        </Flex>
                      </SimpleGrid>
                    ))}
                  </VStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          )}
        </Box>
      </LoaderWrapper>
    </Flex>
  )
}

export default DashboardHome
