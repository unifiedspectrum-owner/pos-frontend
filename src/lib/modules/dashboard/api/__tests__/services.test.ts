/* Libraries imports */
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import type { AxiosResponse, InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios'

/* Dashboard module imports */
import type { DashboardOverviewApiResponse, DashboardChartsApiResponse, DashboardTablesApiResponse, DashboardAnalyticsApiResponse } from '@dashboard/types'
import { DASHBOARD_API_ROUTES } from '@dashboard/constants'
import type { DashboardDateParams } from '@dashboard/api/services'

/* Helper to create mock axios config */
const createMockAxiosConfig = (): InternalAxiosRequestConfig => ({
  headers: {} as AxiosRequestHeaders,
  url: '',
  method: 'get'
})

/* Helper to create mock overview response */
const createMockOverviewData = (): DashboardOverviewApiResponse['data'] => ({
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
      locked: 10,
      pending_verification: 40,
      new_today: 5,
      new_this_week: 20,
      new_this_month: 80,
      online_now: 150,
      two_fa_enabled: 300
    },
    tickets: {
      total: 45,
      open: 12,
      new: 5,
      overdue: 2,
      new_today: 1,
      new_this_week: 5,
      new_this_month: 15,
      resolved_today: 3,
      resolved_this_week: 10,
      resolved_this_month: 25,
      avg_resolution_time_hours: 24,
      satisfaction_avg: 4.5
    },
    revenue: {
      total_all_time: 500000,
      today: 1000,
      this_week: 5000,
      this_month: 15000,
      this_year: 150000,
      mrr: 15000,
      arr: 180000,
      growth_rate: 10.5,
      outstanding: 5000,
      avg_per_tenant: 1000
    }
  },
  quickStats: {
    topRevenuePlans: [],
    activeUsers: {
      total: 500,
      online_now: 150,
      locked: 10,
      new_this_month: 80
    },
    failedPayments: {
      count_this_month: 5,
      total_amount: 1000,
      tenants_affected: 3,
      oldest_failure_days: 7
    },
    infrastructureHealth: {
      provisioning_pending: 2,
      provisioning_failed: 0,
      avg_api_response_ms: 150,
      uptime_percentage: 99.9
    }
  }
})

/* Mock axios instance */
const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: {
      use: vi.fn()
    },
    response: {
      use: vi.fn()
    }
  }
}

/* Mock createApiClient to return our mock instance */
vi.mock('@shared/api/base-client', () => ({
  createApiClient: vi.fn(() => mockAxiosInstance)
}))

/* Mock the client module to use our mock instance */
vi.mock('@dashboard/api/client', () => ({
  dashboardApiClient: mockAxiosInstance
}))

describe('dashboardService', () => {
  let dashboardService: typeof import('@dashboard/api/services').dashboardService

  beforeAll(async () => {
    /* Clear any previous calls before importing */
    vi.clearAllMocks()

    /* Import after mocks are set up */
    const module = await import('@dashboard/api/services')
    dashboardService = module.dashboardService
  })

  beforeEach(() => {
    /* Clear HTTP method mocks */
    mockAxiosInstance.get.mockClear()
    mockAxiosInstance.post.mockClear()
    mockAxiosInstance.put.mockClear()
    mockAxiosInstance.delete.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Service Configuration', () => {
    it('should have dashboardService with all required methods', () => {
      expect(dashboardService).toBeDefined()
      expect(dashboardService.getOverview).toBeTypeOf('function')
      expect(dashboardService.getCharts).toBeTypeOf('function')
      expect(dashboardService.getTables).toBeTypeOf('function')
      expect(dashboardService.getAnalytics).toBeTypeOf('function')
    })

    it('should expose only dashboard-related methods', () => {
      const serviceMethods = Object.keys(dashboardService)
      expect(serviceMethods).toHaveLength(4)
      expect(serviceMethods).toContain('getOverview')
      expect(serviceMethods).toContain('getCharts')
      expect(serviceMethods).toContain('getTables')
      expect(serviceMethods).toContain('getAnalytics')
    })
  })

  describe('getOverview', () => {
    it('should fetch dashboard overview without parameters', async () => {
      const mockResponse: AxiosResponse<DashboardOverviewApiResponse> = {
        data: {
          success: true,
          timestamp: '2024-01-01T00:00:00Z',
          data: createMockOverviewData()
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await dashboardService.getOverview()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(DASHBOARD_API_ROUTES.OVERVIEW, { params: undefined })
      expect(result).toEqual(mockResponse.data)
      expect(result.data.metrics.tenants.total).toBe(150)
      expect(result.data.metrics.tenants.active).toBe(120)
    })

    it('should fetch dashboard overview with monthly period', async () => {
      const params: DashboardDateParams = { period: 'monthly' }

      const mockResponse: AxiosResponse<DashboardOverviewApiResponse> = {
        data: {
          success: true,
          timestamp: '2024-01-01T00:00:00Z',
          data: createMockOverviewData()
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await dashboardService.getOverview(params)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(DASHBOARD_API_ROUTES.OVERVIEW, { params })
      expect(result).toEqual(mockResponse.data)
    })

    it('should fetch dashboard overview with weekly period', async () => {
      const params: DashboardDateParams = { period: 'weekly' }

      const mockResponse: AxiosResponse<DashboardOverviewApiResponse> = {
        data: {
          success: true,
          timestamp: '2024-01-01T00:00:00Z',
          data: createMockOverviewData()
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await dashboardService.getOverview(params)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(DASHBOARD_API_ROUTES.OVERVIEW, { params })
      expect(result.data.metrics.tenants.total).toBe(150)
    })

    it('should fetch dashboard overview with custom date range', async () => {
      const params: DashboardDateParams = {
        period: 'custom',
        start_date: '2024-01-01',
        end_date: '2024-01-31'
      }

      const mockResponse: AxiosResponse<DashboardOverviewApiResponse> = {
        data: {
          success: true,
          timestamp: '2024-01-01T00:00:00Z',
          data: createMockOverviewData()
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await dashboardService.getOverview(params)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(DASHBOARD_API_ROUTES.OVERVIEW, { params })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors when fetching overview', async () => {
      const mockError = new Error('Failed to fetch overview')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(dashboardService.getOverview()).rejects.toThrow('Failed to fetch overview')
      expect(consoleSpy).toHaveBeenCalledWith('[DashboardService] Failed to fetch overview:', mockError)

      consoleSpy.mockRestore()
    })

    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network error')
      mockAxiosInstance.get.mockRejectedValueOnce(networkError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(dashboardService.getOverview()).rejects.toThrow('Network error')

      consoleSpy.mockRestore()
    })
  })

  describe('getCharts', () => {
    it('should fetch dashboard charts without parameters', async () => {
      const mockResponse: AxiosResponse<DashboardChartsApiResponse> = {
        data: {
          success: true,
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            revenueTrend: {
              period: 'monthly',
              labels: ['Jan', 'Feb'],
              datasets: [{
                label: 'Revenue',
                data: [10000, 12000],
                color: '#4299e1'
              }],
              summary: {
                highest_month: 'Feb',
                highest_value: 12000,
                lowest_month: 'Jan',
                lowest_value: 10000,
                trend: 'up',
                growth_rate: 20
              }
            },
            tenantStatusDistribution: {
              labels: ['Active', 'Pending'],
              data: [120, 20],
              colors: ['#48bb78', '#ed8936'],
              percentages: [85.7, 14.3]
            },
            plansOverview: {
              plans: [{
                id: 1,
                name: 'Basic',
                monthly_fee: 99,
                active_subscriptions: 50,
                monthly_revenue: 4950,
                percentage_of_total: 33,
                is_featured: false,
                trial_conversions: 10,
                churn_count: 2
              }],
              summary: {
                total_plans: 3,
                most_popular: {
                  plan_name: 'Basic',
                  subscriber_count: 50
                },
                highest_revenue: {
                  plan_name: 'Basic',
                  revenue: 4950
                }
              }
            }
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await dashboardService.getCharts()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(DASHBOARD_API_ROUTES.CHARTS, { params: undefined })
      expect(result).toEqual(mockResponse.data)
      expect(result.data.revenueTrend.labels).toHaveLength(2)
    })

    it('should fetch dashboard charts with monthly period', async () => {
      const params: DashboardDateParams = { period: 'monthly' }

      const mockResponse: AxiosResponse<DashboardChartsApiResponse> = {
        data: {
          success: true,
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            revenueTrend: {
              period: 'monthly',
              labels: ['Jan'],
              datasets: [{ label: 'Revenue', data: [10000], color: '#4299e1' }],
              summary: {
                highest_month: 'Jan',
                highest_value: 10000,
                lowest_month: 'Jan',
                lowest_value: 10000,
                trend: 'stable',
                growth_rate: 0
              }
            },
            tenantStatusDistribution: {
              labels: ['Active'],
              data: [120],
              colors: ['#48bb78'],
              percentages: [100]
            },
            plansOverview: {
              plans: [],
              summary: {
                total_plans: 0,
                most_popular: { plan_name: '', subscriber_count: 0 },
                highest_revenue: { plan_name: '', revenue: 0 }
              }
            }
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await dashboardService.getCharts(params)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(DASHBOARD_API_ROUTES.CHARTS, { params })
      expect(result).toEqual(mockResponse.data)
    })

    it('should fetch dashboard charts with custom date range', async () => {
      const params: DashboardDateParams = {
        period: 'custom',
        start_date: '2024-01-01',
        end_date: '2024-01-31'
      }

      const mockResponse: AxiosResponse<DashboardChartsApiResponse> = {
        data: {
          success: true,
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            revenueTrend: {
              period: 'custom',
              labels: [],
              datasets: [],
              summary: {
                highest_month: '',
                highest_value: 0,
                lowest_month: '',
                lowest_value: 0,
                trend: 'stable',
                growth_rate: 0
              }
            },
            tenantStatusDistribution: {
              labels: [],
              data: [],
              colors: [],
              percentages: []
            },
            plansOverview: {
              plans: [],
              summary: {
                total_plans: 0,
                most_popular: { plan_name: '', subscriber_count: 0 },
                highest_revenue: { plan_name: '', revenue: 0 }
              }
            }
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await dashboardService.getCharts(params)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(DASHBOARD_API_ROUTES.CHARTS, { params })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle errors when fetching charts', async () => {
      const mockError = new Error('Failed to fetch charts')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(dashboardService.getCharts()).rejects.toThrow('Failed to fetch charts')
      expect(consoleSpy).toHaveBeenCalledWith('[DashboardService] Failed to fetch charts:', mockError)

      consoleSpy.mockRestore()
    })
  })

  describe('getTables', () => {
    it('should fetch dashboard tables data successfully', async () => {
      const mockResponse: AxiosResponse<DashboardTablesApiResponse> = {
        data: {
          success: true,
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            recentTenants: {
              tenants: [{
                id: 1,
                tenant_id: 'T1',
                organization_name: 'Tenant 1',
                primary_email: 'tenant1@test.com',
                primary_phone: '+1234567890',
                status: 'active',
                status_badge_color: 'green',
                plan_name: 'Basic',
                subscription_status: 'active',
                billing_cycle: 'monthly',
                mrr: 99,
                trial_ends_at: null,
                next_billing_date: '2024-02-01',
                days_since_created: 30,
                created_at: '2024-01-01',
                quick_actions: ['view', 'edit']
              }],
              total_count: 1,
              showing: 1
            },
            ticketsOverview: {
              by_status: [],
              by_category: [],
              critical_alerts: { overdue_count: 0, escalated_count: 0, unassigned_count: 0 },
              agent_performance: []
            },
            activityFeed: {
              alerts: [],
              recent_activities: [],
              showing: 0,
              total_count: 0
            },
            tenantsDeployments: {
              tenants: [],
              total_count: 0,
              showing: 0,
              summary: {
                total_tenants: 0,
                deployed: 0,
                provisioning: 0,
                failed: 0,
                pending: 0,
                shared_deployment: 0,
                dedicated_deployment: 0
              }
            }
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await dashboardService.getTables()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(DASHBOARD_API_ROUTES.TABLES)
      expect(result).toEqual(mockResponse.data)
      expect(result.data.recentTenants.tenants).toHaveLength(1)
    })

    it('should handle empty tables data', async () => {
      const mockResponse: AxiosResponse<DashboardTablesApiResponse> = {
        data: {
          success: true,
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            recentTenants: { tenants: [], total_count: 0, showing: 0 },
            ticketsOverview: {
              by_status: [],
              by_category: [],
              critical_alerts: { overdue_count: 0, escalated_count: 0, unassigned_count: 0 },
              agent_performance: []
            },
            activityFeed: { alerts: [], recent_activities: [], showing: 0, total_count: 0 },
            tenantsDeployments: {
              tenants: [],
              total_count: 0,
              showing: 0,
              summary: {
                total_tenants: 0,
                deployed: 0,
                provisioning: 0,
                failed: 0,
                pending: 0,
                shared_deployment: 0,
                dedicated_deployment: 0
              }
            }
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await dashboardService.getTables()

      expect(result.data.recentTenants.tenants).toHaveLength(0)
    })

    it('should handle errors when fetching tables', async () => {
      const mockError = new Error('Failed to fetch tables')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(dashboardService.getTables()).rejects.toThrow('Failed to fetch tables')
      expect(consoleSpy).toHaveBeenCalledWith('[DashboardService] Failed to fetch tables:', mockError)

      consoleSpy.mockRestore()
    })

    it('should call API without parameters', async () => {
      const mockResponse: AxiosResponse<DashboardTablesApiResponse> = {
        data: {
          success: true,
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            recentTenants: { tenants: [], total_count: 0, showing: 0 },
            ticketsOverview: {
              by_status: [],
              by_category: [],
              critical_alerts: { overdue_count: 0, escalated_count: 0, unassigned_count: 0 },
              agent_performance: []
            },
            activityFeed: { alerts: [], recent_activities: [], showing: 0, total_count: 0 },
            tenantsDeployments: {
              tenants: [],
              total_count: 0,
              showing: 0,
              summary: {
                total_tenants: 0,
                deployed: 0,
                provisioning: 0,
                failed: 0,
                pending: 0,
                shared_deployment: 0,
                dedicated_deployment: 0
              }
            }
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      await dashboardService.getTables()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(DASHBOARD_API_ROUTES.TABLES)
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1)
    })
  })

  describe('getAnalytics', () => {
    it('should fetch dashboard analytics data successfully', async () => {
      const mockResponse: AxiosResponse<DashboardAnalyticsApiResponse> = {
        data: {
          success: true,
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            geographicData: {
              by_country: [
                { country: 'USA', country_code: 'US', tenant_count: 50, revenue: 25000, percentage: 50 },
                { country: 'Canada', country_code: 'CA', tenant_count: 20, revenue: 10000, percentage: 20 }
              ],
              top_countries: ['USA', 'Canada']
            },
            conversionMetrics: {
              trial_to_paid: {
                total_trials: 100,
                converted: 75,
                conversion_rate: 75,
                expired_without_conversion: 25
              },
              churn: {
                churned_this_month: 5,
                churn_rate: 3.3,
                retention_rate: 96.7,
                avg_lifetime_months: 18,
                top_churn_reasons: [
                  { reason: 'Too expensive', count: 3 },
                  { reason: 'Missing features', count: 2 }
                ]
              }
            }
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await dashboardService.getAnalytics()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(DASHBOARD_API_ROUTES.ANALYTICS)
      expect(result).toEqual(mockResponse.data)
      expect(result.data.geographicData.by_country).toHaveLength(2)
      expect(result.data.conversionMetrics.trial_to_paid.conversion_rate).toBe(75)
    })

    it('should handle empty analytics data', async () => {
      const mockResponse: AxiosResponse<DashboardAnalyticsApiResponse> = {
        data: {
          success: true,
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            geographicData: {
              by_country: [],
              top_countries: []
            },
            conversionMetrics: {
              trial_to_paid: {
                total_trials: 0,
                converted: 0,
                conversion_rate: 0,
                expired_without_conversion: 0
              },
              churn: {
                churned_this_month: 0,
                churn_rate: 0,
                retention_rate: 100,
                avg_lifetime_months: 0,
                top_churn_reasons: []
              }
            }
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await dashboardService.getAnalytics()

      expect(result.data.geographicData.by_country).toHaveLength(0)
      expect(result.data.conversionMetrics.trial_to_paid.conversion_rate).toBe(0)
    })

    it('should handle errors when fetching analytics', async () => {
      const mockError = new Error('Failed to fetch analytics')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(dashboardService.getAnalytics()).rejects.toThrow('Failed to fetch analytics')
      expect(consoleSpy).toHaveBeenCalledWith('[DashboardService] Failed to fetch analytics:', mockError)

      consoleSpy.mockRestore()
    })

    it('should call API without parameters', async () => {
      const mockResponse: AxiosResponse<DashboardAnalyticsApiResponse> = {
        data: {
          success: true,
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            geographicData: {
              by_country: [],
              top_countries: []
            },
            conversionMetrics: {
              trial_to_paid: {
                total_trials: 0,
                converted: 0,
                conversion_rate: 0,
                expired_without_conversion: 0
              },
              churn: {
                churned_this_month: 0,
                churn_rate: 0,
                retention_rate: 100,
                avg_lifetime_months: 0,
                top_churn_reasons: []
              }
            }
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      await dashboardService.getAnalytics()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(DASHBOARD_API_ROUTES.ANALYTICS)
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1)
    })
  })

  describe('Error Handling', () => {
    it('should log errors with service prefix', async () => {
      const mockError = new Error('API Error')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(dashboardService.getOverview()).rejects.toThrow()

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[DashboardService]'),
        mockError
      )

      consoleSpy.mockRestore()
    })

    it('should propagate errors to caller', async () => {
      const mockError = new Error('Network timeout')
      mockAxiosInstance.get.mockRejectedValueOnce(mockError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(dashboardService.getCharts()).rejects.toThrow('Network timeout')

      consoleSpy.mockRestore()
    })

    it('should handle 500 server errors', async () => {
      const serverError = new Error('Internal server error')
      mockAxiosInstance.get.mockRejectedValueOnce(serverError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(dashboardService.getTables()).rejects.toThrow('Internal server error')

      consoleSpy.mockRestore()
    })

    it('should handle 404 not found errors', async () => {
      const notFoundError = new Error('Resource not found')
      mockAxiosInstance.get.mockRejectedValueOnce(notFoundError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(dashboardService.getAnalytics()).rejects.toThrow('Resource not found')

      consoleSpy.mockRestore()
    })
  })

  describe('Date Parameters Validation', () => {
    it('should accept valid monthly period parameter', async () => {
      const params: DashboardDateParams = { period: 'monthly' }

      const mockResponse: AxiosResponse<DashboardOverviewApiResponse> = {
        data: {
          success: true,
          timestamp: '2024-01-01T00:00:00Z',
          data: createMockOverviewData()
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      await dashboardService.getOverview(params)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(DASHBOARD_API_ROUTES.OVERVIEW, { params })
    })

    it('should accept valid weekly period parameter', async () => {
      const params: DashboardDateParams = { period: 'weekly' }

      const mockResponse: AxiosResponse<DashboardOverviewApiResponse> = {
        data: {
          success: true,
          timestamp: '2024-01-01T00:00:00Z',
          data: createMockOverviewData()
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      await dashboardService.getOverview(params)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(DASHBOARD_API_ROUTES.OVERVIEW, { params })
    })

    it('should accept valid custom period with date range', async () => {
      const params: DashboardDateParams = {
        period: 'custom',
        start_date: '2024-01-01',
        end_date: '2024-01-31'
      }

      const mockResponse: AxiosResponse<DashboardChartsApiResponse> = {
        data: {
          success: true,
          timestamp: '2024-01-01T00:00:00Z',
          data: {
            revenueTrend: {
              period: 'custom',
              labels: [],
              datasets: [],
              summary: {
                highest_month: '',
                highest_value: 0,
                lowest_month: '',
                lowest_value: 0,
                trend: 'stable',
                growth_rate: 0
              }
            },
            tenantStatusDistribution: {
              labels: [],
              data: [],
              colors: [],
              percentages: []
            },
            plansOverview: {
              plans: [],
              summary: {
                total_plans: 0,
                most_popular: { plan_name: '', subscriber_count: 0 },
                highest_revenue: { plan_name: '', revenue: 0 }
              }
            }
          }
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      await dashboardService.getCharts(params)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(DASHBOARD_API_ROUTES.CHARTS, { params })
    })
  })

  describe('API Integration', () => {
    it('should make GET requests to correct endpoints', async () => {
      const mockResponse: AxiosResponse<any> = {
        data: { success: true, timestamp: '2024-01-01T00:00:00Z', data: {} },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      await dashboardService.getOverview()
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(DASHBOARD_API_ROUTES.OVERVIEW, expect.any(Object))

      await dashboardService.getCharts()
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(DASHBOARD_API_ROUTES.CHARTS, expect.any(Object))

      await dashboardService.getTables()
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(DASHBOARD_API_ROUTES.TABLES)

      await dashboardService.getAnalytics()
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(DASHBOARD_API_ROUTES.ANALYTICS)
    })

    it('should use dashboardApiClient for all requests', async () => {
      const mockResponse: AxiosResponse<any> = {
        data: { success: true, timestamp: '2024-01-01T00:00:00Z', data: {} },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: createMockAxiosConfig()
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      await dashboardService.getOverview()
      await dashboardService.getCharts()
      await dashboardService.getTables()
      await dashboardService.getAnalytics()

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(4)
    })
  })
})
