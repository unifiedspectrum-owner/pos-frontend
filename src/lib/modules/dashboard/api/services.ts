/* Dashboard API service methods */

/* Dashboard module imports */
import { DashboardOverviewApiResponse, DashboardChartsApiResponse, DashboardTablesApiResponse, DashboardAnalyticsApiResponse } from '@dashboard/types'
import { dashboardApiClient } from '@dashboard/api/client'
import { DASHBOARD_API_ROUTES } from '@dashboard/constants'

/* Service object containing dashboard API methods */
export const dashboardService = {

  /* Get dashboard overview with metrics and quick stats */
  async getOverview(): Promise<DashboardOverviewApiResponse> {
    try {
      const response = await dashboardApiClient.get<DashboardOverviewApiResponse>(DASHBOARD_API_ROUTES.OVERVIEW)
      return response.data
    } catch (error) {
      console.error('[DashboardService] Failed to fetch overview:', error)
      throw error
    }
  },

  /* Get dashboard charts data including revenue trend, status distribution, and plans overview */
  async getCharts(): Promise<DashboardChartsApiResponse> {
    try {
      const response = await dashboardApiClient.get<DashboardChartsApiResponse>(DASHBOARD_API_ROUTES.CHARTS)
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
