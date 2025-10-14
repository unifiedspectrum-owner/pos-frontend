"use client"

/* Libraries imports */
import React, { useEffect, useState } from 'react'
import { Box, Flex, Heading, Text, Stat, Card, SimpleGrid, Badge, Icon, VStack, HStack, Separator, Button, FormatNumber, IconButton } from '@chakra-ui/react'
import { FiUsers, FiDollarSign, FiAlertCircle, FiTrendingUp, FiPackage, FiActivity, FiArrowRight, FiBarChart2, FiPieChart } from 'react-icons/fi'
import { useRouter } from '@/i18n/navigation'
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

/* Shared module imports */
import { HeaderSection, ErrorMessageContainer, LoaderWrapper } from '@shared/components'

/* Dashboard module imports */
import { useDashboard } from '@dashboard/hooks'

/* Chart type definition */
type ChartType = 'line' | 'bar' | 'area' | 'pie'

/* Main dashboard page component */
const DashboardHome: React.FC = () => {
  /* Navigation hooks */
  const router = useRouter()

  /* Chart type state */
  const [chartType, setChartType] = useState<ChartType>('line')

  /* Dashboard data hook */
  const { overview, charts, tables, analytics, overviewLoading, chartsLoading, tablesLoading, analyticsLoading, overviewError, chartsError, tablesError, analyticsError, fetchAllDashboardData, refetch } = useDashboard()

  /* Fetch all dashboard data on mount */
  useEffect(() => {
    fetchAllDashboardData()
  }, [fetchAllDashboardData])

  /* Handle manual refresh */
  const handleRefresh = () => {
    refetch()
    console.log('[Dashboard] Dashboard data refreshed successfully')
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
        <HeaderSection translation={'Dashboard'} loading={isLoading} handleRefresh={handleRefresh} showAddButton={false} />
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
                          <Badge colorPalette={overview.data.metrics.tenants.new_this_month >= 0 ? "green" : "red"} gap="0">
                            {overview.data.metrics.tenants.new_this_month >= 0 ? <Stat.UpIndicator /> : <Stat.DownIndicator />}
                            {Math.abs(overview.data.metrics.tenants.new_this_month)}
                          </Badge>
                        </HStack>
                        <Text fontSize={'sm'}>Since last month</Text>
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
                          <Badge colorPalette={overview.data.metrics.users.new_this_month >= 0 ? "green" : "red"} gap="0">
                            {overview.data.metrics.users.new_this_month >= 0 ? <Stat.UpIndicator /> : <Stat.DownIndicator />}
                            {Math.abs(overview.data.metrics.users.new_this_month)}
                          </Badge>
                        </HStack>
                        <Text fontSize={'sm'}>Since last month</Text>
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
                          <Badge colorPalette={overview.data.metrics.tickets.overdue > 0 ? "red" : "green"} gap="0">
                            {overview.data.metrics.tickets.overdue > 0 ? <Stat.DownIndicator /> : <Stat.UpIndicator />}
                            {overview.data.metrics.tickets.overdue}
                          </Badge>
                        </HStack>
                        <Text fontSize={'sm'}>Overdue tickets</Text>
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
                        <Stat.Label fontSize="sm" fontWeight="bold" color="gray.600" _dark={{ color: 'gray.400' }}>Monthly Revenue</Stat.Label>
                        <HStack alignItems={'center'}>
                          <Stat.ValueText fontSize="4xl" fontWeight="bold" color="gray.900" _dark={{ color: 'white' }} lineHeight="1">
                            <FormatNumber value={overview.data.metrics.revenue.this_month} style="currency" currency="USD" />
                          </Stat.ValueText>
                          
                        </HStack>
                        <HStack>
                          <Badge size={'sm'} colorPalette={overview.data.metrics.revenue.growth_rate >= 0 ? "green" : "red"} gap="0">
                            {overview.data.metrics.revenue.growth_rate >= 0 ? <Stat.UpIndicator /> : <Stat.DownIndicator />}
                            {Math.abs(overview.data.metrics.revenue.growth_rate)}%
                          </Badge>
                          <Text fontSize={'xs'}>Since last month</Text>
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

          {/* Recent Tenants Table - Row 5 */}
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
                          <Badge colorScheme={tenant.status === 'active' ? 'green' : tenant.status === 'trial' ? 'blue' : 'red'} textTransform="capitalize" fontSize="xs" px={2} py={1} borderRadius="md">{tenant.status}</Badge>
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

          {/* System Alerts & Activity - Row 6 */}
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
