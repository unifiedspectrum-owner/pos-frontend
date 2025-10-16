"use client"

/* Libraries imports */
import { useState, useCallback } from 'react'
import { AxiosError } from 'axios'

/* Shared module imports */
import { handleApiError } from '@shared/utils/api'
import { LOADING_DELAY, LOADING_DELAY_ENABLED } from '@shared/config'

/* Dashboard module imports */
import { dashboardService, DashboardDateParams } from '@dashboard/api'
import { DashboardOverviewApiResponse, DashboardChartsApiResponse, DashboardTablesApiResponse, DashboardAnalyticsApiResponse } from '@dashboard/types'

/* Hook return interface */
interface UseDashboardReturn {
  overview: DashboardOverviewApiResponse | null
  charts: DashboardChartsApiResponse | null
  tables: DashboardTablesApiResponse | null
  analytics: DashboardAnalyticsApiResponse | null
  overviewLoading: boolean
  chartsLoading: boolean
  tablesLoading: boolean
  analyticsLoading: boolean
  overviewError: string | null
  chartsError: string | null
  tablesError: string | null
  analyticsError: string | null
  fetchOverview: (params?: DashboardDateParams) => Promise<void>
  fetchCharts: (params?: DashboardDateParams) => Promise<void>
  fetchTables: () => Promise<void>
  fetchAnalytics: () => Promise<void>
  fetchAllDashboardData: (params?: DashboardDateParams) => Promise<void>
  refetchOverview: (params?: DashboardDateParams) => Promise<void>
  refetchCharts: (params?: DashboardDateParams) => Promise<void>
  refetchTables: () => Promise<void>
  refetchAnalytics: () => Promise<void>
  refetch: (params?: DashboardDateParams) => Promise<void>
}

/* Custom hook for fetching dashboard data */
export const useDashboard = (): UseDashboardReturn => {

  /* Overview state */
  const [overview, setOverview] = useState<DashboardOverviewApiResponse | null>(null)
  const [overviewLoading, setOverviewLoading] = useState<boolean>(false)
  const [overviewError, setOverviewError] = useState<string | null>(null)

  /* Charts state */
  const [charts, setCharts] = useState<DashboardChartsApiResponse | null>(null)
  const [chartsLoading, setChartsLoading] = useState<boolean>(false)
  const [chartsError, setChartsError] = useState<string | null>(null)

  /* Tables state */
  const [tables, setTables] = useState<DashboardTablesApiResponse | null>(null)
  const [tablesLoading, setTablesLoading] = useState<boolean>(false)
  const [tablesError, setTablesError] = useState<string | null>(null)

  /* Analytics state */
  const [analytics, setAnalytics] = useState<DashboardAnalyticsApiResponse | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(false)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)

  /* Fetch dashboard overview data */
  const fetchOverview = useCallback(async (params?: DashboardDateParams) => {
    try {
      setOverviewLoading(true)
      setOverviewError(null)

      /* Artificial delay for testing loading states */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[useDashboard] Fetching dashboard overview with params:', params)

      /* Call API to get dashboard overview */
      const response = await dashboardService.getOverview(params)

      console.log('[useDashboard] Overview API response:', response)

      /* Handle successful response */
      if (response.success) {
        setOverview(response)
        console.log('[useDashboard] Successfully fetched dashboard overview')
      } else {
        /* Handle API error response */
        const errorMsg = 'Failed to fetch dashboard overview'
        setOverviewError(errorMsg)
        console.error('[useDashboard] API error:', errorMsg)
      }

    } catch (error: unknown) {
      const errorMsg = 'Failed to load dashboard overview'
      console.error('[useDashboard] Overview fetch error:', error)
      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Load Dashboard Overview'
      })
      setOverview(null)
      setOverviewError(errorMsg)
    } finally {
      setOverviewLoading(false)
    }
  }, [])

  /* Fetch dashboard charts data */
  const fetchCharts = useCallback(async (params?: DashboardDateParams) => {
    try {
      setChartsLoading(true)
      setChartsError(null)

      /* Artificial delay for testing loading states */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[useDashboard] Fetching dashboard charts with params:', params)

      /* Call API to get dashboard charts */
      const response = await dashboardService.getCharts(params)

      console.log('[useDashboard] Charts API response:', response)

      /* Handle successful response */
      if (response.success) {
        setCharts(response)
        console.log('[useDashboard] Successfully fetched dashboard charts')
      } else {
        /* Handle API error response */
        const errorMsg = 'Failed to fetch dashboard charts'
        setChartsError(errorMsg)
        console.error('[useDashboard] API error:', errorMsg)
      }

    } catch (error: unknown) {
      const errorMsg = 'Failed to load dashboard charts'
      console.error('[useDashboard] Charts fetch error:', error)
      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Load Dashboard Charts'
      })
      setCharts(null)
      setChartsError(errorMsg)
    } finally {
      setChartsLoading(false)
    }
  }, [])

  /* Fetch dashboard tables data */
  const fetchTables = useCallback(async () => {
    try {
      setTablesLoading(true)
      setTablesError(null)

      /* Artificial delay for testing loading states */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[useDashboard] Fetching dashboard tables')

      /* Call API to get dashboard tables */
      const response = await dashboardService.getTables()

      console.log('[useDashboard] Tables API response:', response)

      /* Handle successful response */
      if (response.success) {
        setTables(response)
        console.log('[useDashboard] Successfully fetched dashboard tables')
      } else {
        /* Handle API error response */
        const errorMsg = 'Failed to fetch dashboard tables'
        setTablesError(errorMsg)
        console.error('[useDashboard] API error:', errorMsg)
      }

    } catch (error: unknown) {
      const errorMsg = 'Failed to load dashboard tables'
      console.error('[useDashboard] Tables fetch error:', error)
      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Load Dashboard Tables'
      })
      setTables(null)
      setTablesError(errorMsg)
    } finally {
      setTablesLoading(false)
    }
  }, [])

  /* Fetch dashboard analytics data */
  const fetchAnalytics = useCallback(async () => {
    try {
      setAnalyticsLoading(true)
      setAnalyticsError(null)

      /* Artificial delay for testing loading states */
      if (LOADING_DELAY_ENABLED) {
        await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      }

      console.log('[useDashboard] Fetching dashboard analytics')

      /* Call API to get dashboard analytics */
      const response = await dashboardService.getAnalytics()

      console.log('[useDashboard] Analytics API response:', response)

      /* Handle successful response */
      if (response.success) {
        setAnalytics(response)
        console.log('[useDashboard] Successfully fetched dashboard analytics')
      } else {
        /* Handle API error response */
        const errorMsg = 'Failed to fetch dashboard analytics'
        setAnalyticsError(errorMsg)
        console.error('[useDashboard] API error:', errorMsg)
      }

    } catch (error: unknown) {
      const errorMsg = 'Failed to load dashboard analytics'
      console.error('[useDashboard] Analytics fetch error:', error)
      const err = error as AxiosError
      handleApiError(err, {
        title: 'Failed to Load Dashboard Analytics'
      })
      setAnalytics(null)
      setAnalyticsError(errorMsg)
    } finally {
      setAnalyticsLoading(false)
    }
  }, [])

  /* Fetch all dashboard data in parallel */
  const fetchAllDashboardData = useCallback(async (params?: DashboardDateParams) => {
    console.log('[useDashboard] Fetching all dashboard data with params:', params)
    await Promise.all([
      fetchOverview(params),
      fetchCharts(params),
      fetchTables(),
      fetchAnalytics()
    ])
    console.log('[useDashboard] All dashboard data fetched')
  }, [fetchOverview, fetchCharts, fetchTables, fetchAnalytics])

  /* Refetch overview data */
  const refetchOverview = useCallback(async (params?: DashboardDateParams) => {
    await fetchOverview(params)
  }, [fetchOverview])

  /* Refetch charts data */
  const refetchCharts = useCallback(async (params?: DashboardDateParams) => {
    await fetchCharts(params)
  }, [fetchCharts])

  /* Refetch tables data */
  const refetchTables = useCallback(async () => {
    await fetchTables()
  }, [fetchTables])

  /* Refetch analytics data */
  const refetchAnalytics = useCallback(async () => {
    await fetchAnalytics()
  }, [fetchAnalytics])

  /* Refetch all dashboard data */
  const refetch = useCallback(async (params?: DashboardDateParams) => {
    await fetchAllDashboardData(params)
  }, [fetchAllDashboardData])

  return {
    /* Overview data */
    overview,
    overviewLoading,
    overviewError,

    /* Charts data */
    charts,
    chartsLoading,
    chartsError,

    /* Tables data */
    tables,
    tablesLoading,
    tablesError,

    /* Analytics data */
    analytics,
    analyticsLoading,
    analyticsError,

    /* Actions */
    fetchOverview,
    fetchCharts,
    fetchTables,
    fetchAnalytics,
    fetchAllDashboardData,
    refetchOverview,
    refetchCharts,
    refetchTables,
    refetchAnalytics,
    refetch
  }
}
