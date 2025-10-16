/* Dashboard API service methods */

/* Dashboard module imports */
import { DashboardOverviewApiResponse, DashboardChartsApiResponse, DashboardTablesApiResponse, DashboardAnalyticsApiResponse } from '@dashboard/types'
import { dashboardApiClient } from '@dashboard/api/client'
import { DASHBOARD_API_ROUTES } from '@dashboard/constants'

/* Query parameters interface for date filtering */
export interface DashboardDateParams {
  period?: 'monthly' | 'weekly' | 'custom'
  start_date?: string /* Format: YYYY-MM-DD */
  end_date?: string /* Format: YYYY-MM-DD */
}

/* Service object containing dashboard API methods */
export const dashboardService = {

  /* GET /api/v1/admin/dashboard/overview?period=monthly|weekly|custom&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD */
  /* Get dashboard overview with metrics and quick stats */
  async getOverview(params?: DashboardDateParams): Promise<DashboardOverviewApiResponse> {
    try {
      const response = await dashboardApiClient.get<DashboardOverviewApiResponse>(DASHBOARD_API_ROUTES.OVERVIEW, { params })
      return response.data
    } catch (error) {
      console.error('[DashboardService] Failed to fetch overview:', error)
      throw error
    }
  },

  /* GET /api/v1/admin/dashboard/charts?period=monthly|weekly|custom&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD */
  /* Get dashboard charts data including revenue trend, status distribution, and plans overview */
  async getCharts(params?: DashboardDateParams): Promise<DashboardChartsApiResponse> {
    try {
      const response = await dashboardApiClient.get<DashboardChartsApiResponse>(DASHBOARD_API_ROUTES.CHARTS, { params })
      return response.data
    } catch (error) {
      console.error('[DashboardService] Failed to fetch charts:', error)
      throw error
    }
  },

  /* Get dashboard tables data including recent tenants, tickets overview, and activity feed */
  async getTables(): Promise<DashboardTablesApiResponse> {
    try {
      const response = await dashboardApiClient.get<DashboardTablesApiResponse>(DASHBOARD_API_ROUTES.TABLES)
      return response.data
    } catch (error) {
      console.error('[DashboardService] Failed to fetch tables:', error)
      throw error
    }
  },

  /* Get dashboard analytics data including geographic data and conversion metrics */
  async getAnalytics(): Promise<DashboardAnalyticsApiResponse> {
    try {
      const response = await dashboardApiClient.get<DashboardAnalyticsApiResponse>(DASHBOARD_API_ROUTES.ANALYTICS)
      return response.data
    } catch (error) {
      console.error('[DashboardService] Failed to fetch analytics:', error)
      throw error
    }
  },
}
