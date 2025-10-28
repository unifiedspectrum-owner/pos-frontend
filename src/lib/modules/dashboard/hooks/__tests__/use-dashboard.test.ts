/* Libraries imports */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { AxiosError } from 'axios'

/* Shared module imports */
import * as sharedUtils from '@shared/utils'

/* Dashboard module imports */
import { useDashboard } from '@dashboard/hooks/use-dashboard'
import { dashboardService, DashboardDateParams } from '@dashboard/api'
import { DashboardOverviewApiResponse, DashboardChartsApiResponse, DashboardTablesApiResponse, DashboardAnalyticsApiResponse } from '@dashboard/types'

/* Mock dependencies */
vi.mock('@dashboard/api', () => ({
  dashboardService: {
    getOverview: vi.fn(),
    getCharts: vi.fn(),
    getTables: vi.fn(),
    getAnalytics: vi.fn()
  }
}))

vi.mock('@shared/utils', async () => {
  const actual = await vi.importActual('@shared/utils')
  return {
    ...actual,
    handleApiError: vi.fn()
  }
})

vi.mock('@shared/config', () => ({
  LOADING_DELAY: 0,
  LOADING_DELAY_ENABLED: false
}))

describe('useDashboard Hook', () => {
  /* Mock data */
  const mockOverviewData: DashboardOverviewApiResponse = {
    success: true,
    timestamp: '2024-01-01T00:00:00Z',
    data: {
      metrics: {
        tenants: {
          total: 150,
          active: 120,
          trial: 10,
          suspended: 10,
          setup: 5,
          new_today: 2,
          new_this_week: 10,
          new_this_month: 30,
          growth_rate: 5.5
        },
        users: {
          total: 500,
          active: 450,
          locked: 30,
          pending_verification: 20,
          new_today: 5,
          new_this_week: 25,
          new_this_month: 100,
          online_now: 380,
          two_fa_enabled: 250
        },
        tickets: {
          total: 1000,
          open: 250,
          new: 50,
          overdue: 30,
          new_today: 10,
          new_this_week: 50,
          new_this_month: 200,
          resolved_today: 15,
          resolved_this_week: 80,
          resolved_this_month: 350,
          avg_resolution_time_hours: 24,
          satisfaction_avg: 4.5
        },
        revenue: {
          total_all_time: 500000,
          today: 2000,
          this_week: 12000,
          this_month: 50000,
          this_year: 180000,
          mrr: 15000,
          arr: 180000,
          growth_rate: 7.14,
          outstanding: 5000,
          avg_per_tenant: 333.33
        }
      },
      quickStats: {
        topRevenuePlans: [
          { plan_name: 'Pro', revenue: 30000, subscriber_count: 70 },
          { plan_name: 'Basic', revenue: 10000, subscriber_count: 50 }
        ],
        activeUsers: {
          total: 500,
          online_now: 380,
          locked: 30,
          new_this_month: 100
        },
        failedPayments: {
          count_this_month: 5,
          total_amount: 2500,
          tenants_affected: 4,
          oldest_failure_days: 15
        },
        infrastructureHealth: {
          provisioning_pending: 2,
          provisioning_failed: 1,
          avg_api_response_ms: 120,
          uptime_percentage: 99.9
        }
      }
    }
  }

  const mockChartsData: DashboardChartsApiResponse = {
    success: true,
    timestamp: '2024-01-01T00:00:00Z',
    data: {
      revenueTrend: {
        period: 'last_12_months',
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Revenue',
            data: [10000, 12000, 11000, 13000, 15000, 14000],
            color: '#3182ce'
          }
        ],
        summary: {
          highest_month: 'May',
          highest_value: 15000,
          lowest_month: 'Jan',
          lowest_value: 10000,
          trend: 'up',
          growth_rate: 7.5
        }
      },
      tenantStatusDistribution: {
        labels: ['Active', 'Trial', 'Suspended', 'Setup'],
        data: [120, 10, 10, 5],
        colors: ['#48bb78', '#ed8936', '#f56565', '#4299e1'],
        percentages: [82.76, 6.90, 6.90, 3.45]
      },
      plansOverview: {
        plans: [
          {
            id: 1,
            name: 'Basic',
            monthly_fee: 100,
            active_subscriptions: 50,
            monthly_revenue: 5000,
            percentage_of_total: 25,
            is_featured: false,
            trial_conversions: 10,
            churn_count: 2
          },
          {
            id: 2,
            name: 'Pro',
            monthly_fee: 200,
            active_subscriptions: 70,
            monthly_revenue: 14000,
            percentage_of_total: 70,
            is_featured: true,
            trial_conversions: 20,
            churn_count: 3
          }
        ],
        summary: {
          total_plans: 3,
          most_popular: {
            plan_name: 'Pro',
            subscriber_count: 70
          },
          highest_revenue: {
            plan_name: 'Pro',
            revenue: 14000
          }
        }
      }
    }
  }

  const mockTablesData: DashboardTablesApiResponse = {
    success: true,
    timestamp: '2024-01-01T00:00:00Z',
    data: {
      recentTenants: {
        tenants: [
          {
            id: 1,
            tenant_id: 'TNT001',
            organization_name: 'Tenant One',
            primary_email: 'tenant1@example.com',
            primary_phone: '+1234567890',
            status: 'active',
            status_badge_color: 'green',
            plan_name: 'Pro',
            subscription_status: 'active',
            billing_cycle: 'monthly',
            mrr: 200,
            trial_ends_at: null,
            next_billing_date: '2024-02-01T00:00:00Z',
            days_since_created: 30,
            created_at: '2024-01-01T00:00:00Z',
            quick_actions: ['view', 'edit', 'suspend']
          }
        ],
        total_count: 1,
        showing: 1
      },
      ticketsOverview: {
        by_status: [
          {
            status: 'open',
            count: 250,
            sla_compliant: 200,
            sla_breached: 50,
            percentage: 25
          }
        ],
        by_category: [
          {
            category_id: 1,
            category_name: 'Technical Support',
            count: 300,
            percentage: 30
          }
        ],
        critical_alerts: {
          overdue_count: 30,
          escalated_count: 15,
          unassigned_count: 20
        },
        agent_performance: [
          {
            user_id: 1,
            agent_name: 'John Doe',
            assigned_tickets: 50,
            resolved_today: 10,
            avg_satisfaction: 4.5
          }
        ]
      },
      activityFeed: {
        alerts: [
          {
            id: 1,
            type: 'warning',
            icon: 'alert-triangle',
            color: 'orange',
            title: 'High Ticket Volume',
            message: 'Ticket volume is above normal',
            count: 5,
            timestamp: '2024-01-01T00:00:00Z',
            action_url: '/admin/tickets',
            action_label: 'View Tickets'
          }
        ],
        recent_activities: [
          {
            id: 1,
            activity_type: 'tenant_created',
            icon: 'plus',
            color: 'green',
            description: 'New tenant registered',
            actor: 'Admin',
            target: 'Tenant One',
            timestamp: '2024-01-01T00:00:00Z',
            relative_time: '1 hour ago'
          }
        ],
        showing: 1,
        total_count: 1
      },
      tenantsDeployments: {
        tenants: [
          {
            id: 1,
            tenant_id: 'TNT001',
            organization_name: 'Tenant One',
            primary_email: 'tenant1@example.com',
            primary_phone: '+1234567890',
            tenant_status: 'active',
            email_verified: true,
            phone_verified: true,
            onboarding_completed: true,
            onboarding_completed_at: '2024-01-01T00:00:00Z',
            country: 'USA',
            state_province: 'CA',
            city: 'San Francisco',
            business_category: 'Technology',
            tenant_created_at: '2024-01-01T00:00:00Z',
            days_since_created: 30,
            plan_name: 'Pro',
            plan_id: 2,
            subscription_status: 'active',
            billing_cycle: 'monthly',
            trial_starts_at: null,
            trial_ends_at: null,
            next_billing_date: '2024-02-01T00:00:00Z',
            trial_days_remaining: 0,
            deployment_type: 'shared',
            d1_database_id: 'db123',
            kv_namespace_id: 'kv123',
            r2_bucket_name: 'bucket123',
            custom_subdomain: 'tenant1',
            custom_domain: null,
            last_deployment_status: 'success',
            last_deployed_at: '2024-01-01T00:00:00Z',
            days_since_deployment: 10,
            max_branches_count: 5,
            current_branches_count: 3,
            branches_usage_percentage: 60,
            config_created_at: '2024-01-01T00:00:00Z',
            mrr: 200,
            infrastructure_provisioned: true,
            deployment_status: 'deployed'
          }
        ],
        total_count: 1,
        showing: 1,
        summary: {
          total_tenants: 150,
          deployed: 120,
          provisioning: 10,
          failed: 5,
          pending: 15,
          shared_deployment: 100,
          dedicated_deployment: 50
        }
      }
    }
  }

  const mockAnalyticsData: DashboardAnalyticsApiResponse = {
    success: true,
    timestamp: '2024-01-01T00:00:00Z',
    data: {
      geographicData: {
        by_country: [
          {
            country: 'USA',
            country_code: 'US',
            tenant_count: 80,
            revenue: 30000,
            percentage: 53.33
          },
          {
            country: 'UK',
            country_code: 'GB',
            tenant_count: 40,
            revenue: 15000,
            percentage: 26.67
          }
        ],
        top_countries: ['USA', 'UK', 'Canada']
      },
      conversionMetrics: {
        trial_to_paid: {
          total_trials: 100,
          converted: 65,
          conversion_rate: 65.5,
          expired_without_conversion: 35
        },
        churn: {
          churned_this_month: 5,
          churn_rate: 2.3,
          retention_rate: 97.7,
          avg_lifetime_months: 24,
          top_churn_reasons: [
            { reason: 'Price', count: 2 },
            { reason: 'Features', count: 3 }
          ]
        }
      }
    }
  }

  /* Mock service functions */
  const mockGetOverview = vi.mocked(dashboardService.getOverview)
  const mockGetCharts = vi.mocked(dashboardService.getCharts)
  const mockGetTables = vi.mocked(dashboardService.getTables)
  const mockGetAnalytics = vi.mocked(dashboardService.getAnalytics)
  const mockHandleApiError = vi.mocked(sharedUtils.handleApiError)

  beforeEach(() => {
    vi.clearAllMocks()
    /* Suppress console logs */
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useDashboard())

      expect(result.current.overview).toBe(null)
      expect(result.current.charts).toBe(null)
      expect(result.current.tables).toBe(null)
      expect(result.current.analytics).toBe(null)
      expect(result.current.overviewLoading).toBe(false)
      expect(result.current.chartsLoading).toBe(false)
      expect(result.current.tablesLoading).toBe(false)
      expect(result.current.analyticsLoading).toBe(false)
      expect(result.current.overviewError).toBe(null)
      expect(result.current.chartsError).toBe(null)
      expect(result.current.tablesError).toBe(null)
      expect(result.current.analyticsError).toBe(null)
    })

    it('should provide all fetch functions', () => {
      const { result } = renderHook(() => useDashboard())

      expect(result.current.fetchOverview).toBeTypeOf('function')
      expect(result.current.fetchCharts).toBeTypeOf('function')
      expect(result.current.fetchTables).toBeTypeOf('function')
      expect(result.current.fetchAnalytics).toBeTypeOf('function')
      expect(result.current.fetchAllDashboardData).toBeTypeOf('function')
    })

    it('should provide all refetch functions', () => {
      const { result } = renderHook(() => useDashboard())

      expect(result.current.refetchOverview).toBeTypeOf('function')
      expect(result.current.refetchCharts).toBeTypeOf('function')
      expect(result.current.refetchTables).toBeTypeOf('function')
      expect(result.current.refetchAnalytics).toBeTypeOf('function')
      expect(result.current.refetch).toBeTypeOf('function')
    })
  })

  describe('fetchOverview Function', () => {
    it('should fetch overview data successfully', async () => {
      mockGetOverview.mockResolvedValue(mockOverviewData)

      const { result } = renderHook(() => useDashboard())

      await result.current.fetchOverview()

      await waitFor(() => {
        expect(result.current.overview).toEqual(mockOverviewData)
        expect(result.current.overviewLoading).toBe(false)
        expect(result.current.overviewError).toBe(null)
      })
    })

    it('should set loading state during fetch', async () => {
      mockGetOverview.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockOverviewData), 100))
      )

      const { result } = renderHook(() => useDashboard())

      result.current.fetchOverview()

      await waitFor(() => {
        expect(result.current.overviewLoading).toBe(true)
      })

      await waitFor(() => {
        expect(result.current.overviewLoading).toBe(false)
      }, { timeout: 200 })
    })

    it('should fetch with date parameters', async () => {
      mockGetOverview.mockResolvedValue(mockOverviewData)

      const { result } = renderHook(() => useDashboard())
      const params: DashboardDateParams = { period: 'custom', start_date: '2024-01-01', end_date: '2024-01-31' }

      await result.current.fetchOverview(params)

      await waitFor(() => {
        expect(mockGetOverview).toHaveBeenCalledWith(params)
      })
    })

    it('should handle API error response', async () => {
      const errorResponse = {
        success: false,
        timestamp: mockOverviewData.timestamp,
        data: mockOverviewData.data
      }
      mockGetOverview.mockResolvedValue(errorResponse as DashboardOverviewApiResponse)

      const { result } = renderHook(() => useDashboard())

      await result.current.fetchOverview()

      await waitFor(() => {
        expect(result.current.overviewError).toBe('Failed to fetch dashboard overview')
        expect(result.current.overview).toBe(null)
        expect(result.current.overviewLoading).toBe(false)
      })
    })

    it('should handle network error', async () => {
      const mockError = new Error('Network error') as AxiosError
      mockGetOverview.mockRejectedValue(mockError)

      const { result } = renderHook(() => useDashboard())

      await result.current.fetchOverview()

      await waitFor(() => {
        expect(result.current.overviewError).toBe('Failed to load dashboard overview')
        expect(result.current.overview).toBe(null)
        expect(result.current.overviewLoading).toBe(false)
      })
    })

    it('should clear previous errors on successful fetch', async () => {
      const errorResponse = {
        success: false,
        timestamp: mockOverviewData.timestamp,
        data: mockOverviewData.data
      }
      mockGetOverview.mockResolvedValueOnce(errorResponse as DashboardOverviewApiResponse)

      const { result } = renderHook(() => useDashboard())

      await result.current.fetchOverview()

      await waitFor(() => {
        expect(result.current.overviewError).toBe('Failed to fetch dashboard overview')
      })

      mockGetOverview.mockResolvedValue(mockOverviewData)

      await result.current.fetchOverview()

      await waitFor(() => {
        expect(result.current.overviewError).toBe(null)
        expect(result.current.overview).toEqual(mockOverviewData)
      })
    })
  })

  describe('fetchCharts Function', () => {
    it('should fetch charts data successfully', async () => {
      mockGetCharts.mockResolvedValue(mockChartsData)

      const { result } = renderHook(() => useDashboard())

      await result.current.fetchCharts()

      await waitFor(() => {
        expect(result.current.charts).toEqual(mockChartsData)
        expect(result.current.chartsLoading).toBe(false)
        expect(result.current.chartsError).toBe(null)
      })
    })

    it('should set loading state during fetch', async () => {
      mockGetCharts.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockChartsData), 100))
      )

      const { result } = renderHook(() => useDashboard())

      result.current.fetchCharts()

      await waitFor(() => {
        expect(result.current.chartsLoading).toBe(true)
      })

      await waitFor(() => {
        expect(result.current.chartsLoading).toBe(false)
      }, { timeout: 200 })
    })

    it('should fetch with date parameters', async () => {
      mockGetCharts.mockResolvedValue(mockChartsData)

      const { result } = renderHook(() => useDashboard())
      const params: DashboardDateParams = { period: 'custom', start_date: '2024-01-01', end_date: '2024-01-31' }

      await result.current.fetchCharts(params)

      await waitFor(() => {
        expect(mockGetCharts).toHaveBeenCalledWith(params)
      })
    })

    it('should handle API error response', async () => {
      const errorResponse = {
        success: false,
        timestamp: mockChartsData.timestamp,
        data: mockChartsData.data
      }
      mockGetCharts.mockResolvedValue(errorResponse as DashboardChartsApiResponse)

      const { result } = renderHook(() => useDashboard())

      await result.current.fetchCharts()

      await waitFor(() => {
        expect(result.current.chartsError).toBe('Failed to fetch dashboard charts')
        expect(result.current.charts).toBe(null)
        expect(result.current.chartsLoading).toBe(false)
      })
    })

    it('should handle network error', async () => {
      const mockError = new Error('Network error') as AxiosError
      mockGetCharts.mockRejectedValue(mockError)

      const { result } = renderHook(() => useDashboard())

      await result.current.fetchCharts()

      await waitFor(() => {
        expect(result.current.chartsError).toBe('Failed to load dashboard charts')
        expect(result.current.charts).toBe(null)
        expect(result.current.chartsLoading).toBe(false)
      })
    })
  })

  describe('fetchTables Function', () => {
    it('should fetch tables data successfully', async () => {
      mockGetTables.mockResolvedValue(mockTablesData)

      const { result } = renderHook(() => useDashboard())

      await result.current.fetchTables()

      await waitFor(() => {
        expect(result.current.tables).toEqual(mockTablesData)
        expect(result.current.tablesLoading).toBe(false)
        expect(result.current.tablesError).toBe(null)
      })
    })

    it('should set loading state during fetch', async () => {
      mockGetTables.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockTablesData), 100))
      )

      const { result } = renderHook(() => useDashboard())

      result.current.fetchTables()

      await waitFor(() => {
        expect(result.current.tablesLoading).toBe(true)
      })

      await waitFor(() => {
        expect(result.current.tablesLoading).toBe(false)
      }, { timeout: 200 })
    })

    it('should handle API error response', async () => {
      const errorResponse = {
        success: false,
        timestamp: mockTablesData.timestamp,
        data: mockTablesData.data
      }
      mockGetTables.mockResolvedValue(errorResponse as DashboardTablesApiResponse)

      const { result } = renderHook(() => useDashboard())

      await result.current.fetchTables()

      await waitFor(() => {
        expect(result.current.tablesError).toBe('Failed to fetch dashboard tables')
        expect(result.current.tables).toBe(null)
        expect(result.current.tablesLoading).toBe(false)
      })
    })

    it('should handle network error', async () => {
      const mockError = new Error('Network error') as AxiosError
      mockGetTables.mockRejectedValue(mockError)

      const { result } = renderHook(() => useDashboard())

      await result.current.fetchTables()

      await waitFor(() => {
        expect(result.current.tablesError).toBe('Failed to load dashboard tables')
        expect(result.current.tables).toBe(null)
        expect(result.current.tablesLoading).toBe(false)
      })
    })
  })

  describe('fetchAnalytics Function', () => {
    it('should fetch analytics data successfully', async () => {
      mockGetAnalytics.mockResolvedValue(mockAnalyticsData)

      const { result } = renderHook(() => useDashboard())

      await result.current.fetchAnalytics()

      await waitFor(() => {
        expect(result.current.analytics).toEqual(mockAnalyticsData)
        expect(result.current.analyticsLoading).toBe(false)
        expect(result.current.analyticsError).toBe(null)
      })
    })

    it('should set loading state during fetch', async () => {
      mockGetAnalytics.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockAnalyticsData), 100))
      )

      const { result } = renderHook(() => useDashboard())

      result.current.fetchAnalytics()

      await waitFor(() => {
        expect(result.current.analyticsLoading).toBe(true)
      })

      await waitFor(() => {
        expect(result.current.analyticsLoading).toBe(false)
      }, { timeout: 200 })
    })

    it('should handle API error response', async () => {
      const errorResponse = {
        success: false,
        timestamp: mockAnalyticsData.timestamp,
        data: mockAnalyticsData.data
      }
      mockGetAnalytics.mockResolvedValue(errorResponse as DashboardAnalyticsApiResponse)

      const { result } = renderHook(() => useDashboard())

      await result.current.fetchAnalytics()

      await waitFor(() => {
        expect(result.current.analyticsError).toBe('Failed to fetch dashboard analytics')
        expect(result.current.analytics).toBe(null)
        expect(result.current.analyticsLoading).toBe(false)
      })
    })

    it('should handle network error', async () => {
      const mockError = new Error('Network error') as AxiosError
      mockGetAnalytics.mockRejectedValue(mockError)

      const { result } = renderHook(() => useDashboard())

      await result.current.fetchAnalytics()

      await waitFor(() => {
        expect(result.current.analyticsError).toBe('Failed to load dashboard analytics')
        expect(result.current.analytics).toBe(null)
        expect(result.current.analyticsLoading).toBe(false)
      })
    })
  })

  describe('fetchAllDashboardData Function', () => {
    it('should fetch all data in parallel', async () => {
      mockGetOverview.mockResolvedValue(mockOverviewData)
      mockGetCharts.mockResolvedValue(mockChartsData)
      mockGetTables.mockResolvedValue(mockTablesData)
      mockGetAnalytics.mockResolvedValue(mockAnalyticsData)

      const { result } = renderHook(() => useDashboard())

      await result.current.fetchAllDashboardData()

      await waitFor(() => {
        expect(result.current.overview).toEqual(mockOverviewData)
        expect(result.current.charts).toEqual(mockChartsData)
        expect(result.current.tables).toEqual(mockTablesData)
        expect(result.current.analytics).toEqual(mockAnalyticsData)
      })
    })

    it('should call all service methods', async () => {
      mockGetOverview.mockResolvedValue(mockOverviewData)
      mockGetCharts.mockResolvedValue(mockChartsData)
      mockGetTables.mockResolvedValue(mockTablesData)
      mockGetAnalytics.mockResolvedValue(mockAnalyticsData)

      const { result } = renderHook(() => useDashboard())

      await result.current.fetchAllDashboardData()

      await waitFor(() => {
        expect(mockGetOverview).toHaveBeenCalledTimes(1)
        expect(mockGetCharts).toHaveBeenCalledTimes(1)
        expect(mockGetTables).toHaveBeenCalledTimes(1)
        expect(mockGetAnalytics).toHaveBeenCalledTimes(1)
      })
    })

    it('should pass date parameters to overview and charts', async () => {
      mockGetOverview.mockResolvedValue(mockOverviewData)
      mockGetCharts.mockResolvedValue(mockChartsData)
      mockGetTables.mockResolvedValue(mockTablesData)
      mockGetAnalytics.mockResolvedValue(mockAnalyticsData)

      const { result } = renderHook(() => useDashboard())
      const params: DashboardDateParams = { period: 'custom', start_date: '2024-01-01', end_date: '2024-01-31' }

      await result.current.fetchAllDashboardData(params)

      await waitFor(() => {
        expect(mockGetOverview).toHaveBeenCalledWith(params)
        expect(mockGetCharts).toHaveBeenCalledWith(params)
        expect(mockGetTables).toHaveBeenCalled()
        expect(mockGetAnalytics).toHaveBeenCalled()
      })
    })

    it('should handle partial failures gracefully', async () => {
      mockGetOverview.mockResolvedValue(mockOverviewData)
      mockGetCharts.mockRejectedValue(new Error('Charts error'))
      mockGetTables.mockResolvedValue(mockTablesData)
      mockGetAnalytics.mockResolvedValue(mockAnalyticsData)

      const { result } = renderHook(() => useDashboard())

      await result.current.fetchAllDashboardData()

      await waitFor(() => {
        expect(result.current.overview).toEqual(mockOverviewData)
        expect(result.current.charts).toBe(null)
        expect(result.current.tables).toEqual(mockTablesData)
        expect(result.current.analytics).toEqual(mockAnalyticsData)
        expect(result.current.chartsError).toBe('Failed to load dashboard charts')
      })
    })
  })

  describe('Refetch Functions', () => {
    it('should refetch overview data', async () => {
      mockGetOverview.mockResolvedValue(mockOverviewData)

      const { result } = renderHook(() => useDashboard())

      await result.current.refetchOverview()

      await waitFor(() => {
        expect(result.current.overview).toEqual(mockOverviewData)
        expect(mockGetOverview).toHaveBeenCalledTimes(1)
      })
    })

    it('should refetch charts data', async () => {
      mockGetCharts.mockResolvedValue(mockChartsData)

      const { result } = renderHook(() => useDashboard())

      await result.current.refetchCharts()

      await waitFor(() => {
        expect(result.current.charts).toEqual(mockChartsData)
        expect(mockGetCharts).toHaveBeenCalledTimes(1)
      })
    })

    it('should refetch tables data', async () => {
      mockGetTables.mockResolvedValue(mockTablesData)

      const { result } = renderHook(() => useDashboard())

      await result.current.refetchTables()

      await waitFor(() => {
        expect(result.current.tables).toEqual(mockTablesData)
        expect(mockGetTables).toHaveBeenCalledTimes(1)
      })
    })

    it('should refetch analytics data', async () => {
      mockGetAnalytics.mockResolvedValue(mockAnalyticsData)

      const { result } = renderHook(() => useDashboard())

      await result.current.refetchAnalytics()

      await waitFor(() => {
        expect(result.current.analytics).toEqual(mockAnalyticsData)
        expect(mockGetAnalytics).toHaveBeenCalledTimes(1)
      })
    })

    it('should refetch all data', async () => {
      mockGetOverview.mockResolvedValue(mockOverviewData)
      mockGetCharts.mockResolvedValue(mockChartsData)
      mockGetTables.mockResolvedValue(mockTablesData)
      mockGetAnalytics.mockResolvedValue(mockAnalyticsData)

      const { result } = renderHook(() => useDashboard())

      await result.current.refetch()

      await waitFor(() => {
        expect(mockGetOverview).toHaveBeenCalledTimes(1)
        expect(mockGetCharts).toHaveBeenCalledTimes(1)
        expect(mockGetTables).toHaveBeenCalledTimes(1)
        expect(mockGetAnalytics).toHaveBeenCalledTimes(1)
      })
    })

    it('should pass parameters to refetch functions', async () => {
      mockGetOverview.mockResolvedValue(mockOverviewData)
      mockGetCharts.mockResolvedValue(mockChartsData)

      const { result } = renderHook(() => useDashboard())
      const params: DashboardDateParams = { period: 'custom', start_date: '2024-01-01', end_date: '2024-01-31' }

      await result.current.refetchOverview(params)
      await result.current.refetchCharts(params)

      await waitFor(() => {
        expect(mockGetOverview).toHaveBeenCalledWith(params)
        expect(mockGetCharts).toHaveBeenCalledWith(params)
      })
    })
  })

  describe('State Management', () => {
    it('should manage independent loading states', async () => {
      mockGetOverview.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockOverviewData), 100))
      )
      mockGetCharts.mockResolvedValue(mockChartsData)

      const { result } = renderHook(() => useDashboard())

      result.current.fetchOverview()
      await result.current.fetchCharts()

      await waitFor(() => {
        expect(result.current.overviewLoading).toBe(true)
        expect(result.current.chartsLoading).toBe(false)
        expect(result.current.charts).toEqual(mockChartsData)
      })
    })

    it('should manage independent error states', async () => {
      mockGetOverview.mockRejectedValue(new Error('Overview error'))
      mockGetCharts.mockResolvedValue(mockChartsData)

      const { result } = renderHook(() => useDashboard())

      await result.current.fetchOverview()
      await result.current.fetchCharts()

      await waitFor(() => {
        expect(result.current.overviewError).toBe('Failed to load dashboard overview')
        expect(result.current.chartsError).toBe(null)
        expect(result.current.overview).toBe(null)
        expect(result.current.charts).toEqual(mockChartsData)
      })
    })

    it('should clear errors on successful refetch', async () => {
      mockGetOverview.mockRejectedValueOnce(new Error('Error'))
      mockGetOverview.mockResolvedValue(mockOverviewData)

      const { result } = renderHook(() => useDashboard())

      await result.current.fetchOverview()

      await waitFor(() => {
        expect(result.current.overviewError).toBe('Failed to load dashboard overview')
      })

      await result.current.refetchOverview()

      await waitFor(() => {
        expect(result.current.overviewError).toBe(null)
        expect(result.current.overview).toEqual(mockOverviewData)
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle concurrent fetch calls', async () => {
      mockGetOverview.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockOverviewData), 50))
      )

      const { result } = renderHook(() => useDashboard())

      result.current.fetchOverview()
      result.current.fetchOverview()
      result.current.fetchOverview()

      await waitFor(() => {
        expect(result.current.overviewLoading).toBe(false)
        expect(result.current.overview).toEqual(mockOverviewData)
      }, { timeout: 200 })
    })

    it('should handle undefined parameters', async () => {
      mockGetOverview.mockResolvedValue(mockOverviewData)

      const { result } = renderHook(() => useDashboard())

      await result.current.fetchOverview(undefined)

      await waitFor(() => {
        expect(mockGetOverview).toHaveBeenCalledWith(undefined)
        expect(result.current.overview).toEqual(mockOverviewData)
      })
    })

    it('should maintain state across multiple operations', async () => {
      mockGetOverview.mockResolvedValue(mockOverviewData)
      mockGetCharts.mockResolvedValue(mockChartsData)

      const { result } = renderHook(() => useDashboard())

      await result.current.fetchOverview()

      await waitFor(() => {
        expect(result.current.overview).toEqual(mockOverviewData)
      })

      await result.current.fetchCharts()

      await waitFor(() => {
        expect(result.current.overview).toEqual(mockOverviewData)
        expect(result.current.charts).toEqual(mockChartsData)
      })
    })
  })

  describe('Hook Stability', () => {
    it('should provide stable function references', () => {
      const { result, rerender } = renderHook(() => useDashboard())

      const firstFetchOverview = result.current.fetchOverview
      const firstRefetch = result.current.refetch

      rerender()

      expect(result.current.fetchOverview).toBe(firstFetchOverview)
      expect(result.current.refetch).toBe(firstRefetch)
    })

    it('should not cause infinite loops with useCallback dependencies', () => {
      mockGetOverview.mockResolvedValue(mockOverviewData)
      mockGetCharts.mockResolvedValue(mockChartsData)
      mockGetTables.mockResolvedValue(mockTablesData)
      mockGetAnalytics.mockResolvedValue(mockAnalyticsData)

      const { result } = renderHook(() => useDashboard())

      /* fetchAllDashboardData depends on individual fetch functions */
      expect(result.current.fetchAllDashboardData).toBeTypeOf('function')
      expect(result.current.refetch).toBeTypeOf('function')
    })
  })
})
