/* TypeScript interfaces for admin dashboard API responses */

/* Import existing dashboard types */
import {
  TenantMetrics,
  UserMetrics,
  TicketMetrics,
  RevenueMetrics,
  QuickStatsData,
  RevenueTrendData,
  StatusDistributionData,
  PlansOverviewData,
  RecentTenantsData,
  TicketsOverviewData,
  ActivityFeedData,
  GeographicData,
  ConversionMetricsData,
  TenantsDeploymentsData
} from './dashboard';

/* ============================================
   DASHBOARD OVERVIEW API RESPONSE (Priority 1)
   GET /api/v1/admin/dashboard/overview
   ============================================ */

export interface DashboardOverviewApiResponse {
  success: boolean;
  timestamp: string;
  data: {
    metrics: {
      tenants: TenantMetrics;
      users: UserMetrics;
      tickets: TicketMetrics;
      revenue: RevenueMetrics;
    };
    quickStats: QuickStatsData;
  };
}

/* ============================================
   DASHBOARD CHARTS API RESPONSE (Priority 2)
   GET /api/v1/admin/dashboard/charts
   ============================================ */

export interface DashboardChartsApiResponse {
  success: true;
  timestamp: string;
  data: {
    revenueTrend: RevenueTrendData;
    tenantStatusDistribution: StatusDistributionData;
    plansOverview: PlansOverviewData;
  };
}

/* ============================================
   DASHBOARD TABLES API RESPONSE (Priority 3)
   GET /api/v1/admin/dashboard/tables
   ============================================ */

export interface DashboardTablesApiResponse {
  success: true;
  timestamp: string;
  data: {
    recentTenants: RecentTenantsData;
    ticketsOverview: TicketsOverviewData;
    activityFeed: ActivityFeedData;
    tenantsDeployments: TenantsDeploymentsData
  };
}

/* ============================================
   DASHBOARD ANALYTICS API RESPONSE (Priority 4)
   GET /api/v1/admin/dashboard/analytics
   ============================================ */

export interface DashboardAnalyticsApiResponse {
  success: true;
  timestamp: string;
  data: {
    geographicData: GeographicData;
    conversionMetrics: ConversionMetricsData;
  };
}
