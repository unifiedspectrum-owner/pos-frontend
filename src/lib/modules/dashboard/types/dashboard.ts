/* TypeScript interfaces for admin dashboard data structures */

/* Top-level dashboard response */
export interface DashboardResponse {
  success: boolean;
  timestamp: string;
  data: DashboardData;
}

/* Complete dashboard data */
export interface DashboardData {
  metrics: DashboardMetrics;
  revenueTrend: RevenueTrendData;
  tenantStatusDistribution: StatusDistributionData;
  recentTenants: RecentTenantsData;
  plansOverview: PlansOverviewData;
  ticketsOverview: TicketsOverviewData;
  activityFeed: ActivityFeedData;
  quickStats: QuickStatsData;
  geographicData: GeographicData;
  conversionMetrics: ConversionMetricsData;
}

/* Key metrics section */
export interface DashboardMetrics {
  tenants: TenantMetrics;
  users: UserMetrics;
  tickets: TicketMetrics;
  revenue: RevenueMetrics;
}

export interface TenantMetrics {
  total: number;
  active: number;
  trial: number;
  suspended: number;
  setup: number;
  new_today: number;
  new_this_week: number;
  new_this_month: number;
  growth_rate: number;
}

export interface UserMetrics {
  total: number;
  active: number;
  locked: number;
  pending_verification: number;
  new_today: number;
  new_this_month: number;
  online_now: number;
  two_fa_enabled: number;
}

export interface TicketMetrics {
  total: number;
  open: number;
  new: number;
  overdue: number;
  resolved_today: number;
  resolved_this_week: number;
  avg_resolution_time_hours: number;
  satisfaction_avg: number;
}

export interface RevenueMetrics {
  total_all_time: number;
  today: number;
  this_week: number;
  this_month: number;
  this_year: number;
  mrr: number;
  arr: number;
  growth_rate: number;
  outstanding: number;
  avg_per_tenant: number;
}

/* Revenue trend chart data */
export interface RevenueTrendData {
  period: string;
  labels: string[];
  datasets: ChartDataset[];
  summary: RevenueSummary;
}

export interface ChartDataset {
  label: string;
  data: number[];
  color: string;
}

export interface RevenueSummary {
  highest_month: string;
  highest_value: number;
  lowest_month: string;
  lowest_value: number;
  trend: 'up' | 'down' | 'stable';
  growth_rate: number;
}

/* Status distribution pie chart */
export interface StatusDistributionData {
  labels: string[];
  data: number[];
  colors: string[];
  percentages: number[];
}

/* Recent tenants table */
export interface RecentTenantsData {
  tenants: TenantRow[];
  total_count: number;
  showing: number;
}

export interface TenantRow {
  id: number;
  tenant_id: string;
  organization_name: string;
  primary_email: string;
  primary_phone: string;
  status: 'active' | 'trial' | 'suspended' | 'setup';
  status_badge_color: string;
  plan_name: string;
  subscription_status: string;
  billing_cycle: 'monthly' | 'yearly';
  mrr: number;
  trial_ends_at: string | null;
  next_billing_date: string | null;
  days_since_created: number;
  created_at: string;
  quick_actions: string[];
}

/* Plans overview */
export interface PlansOverviewData {
  plans: PlanOverview[];
  summary: PlansSummary;
}

export interface PlanOverview {
  id: number;
  name: string;
  monthly_fee: number;
  active_subscriptions: number;
  monthly_revenue: number;
  percentage_of_total: number;
  is_featured: boolean;
  trial_conversions: number;
  churn_count: number;
}

export interface PlansSummary {
  total_plans: number;
  most_popular: {
    plan_name: string;
    subscriber_count: number;
  };
  highest_revenue: {
    plan_name: string;
    revenue: number;
  };
}

/* Tickets overview */
export interface TicketsOverviewData {
  by_status: TicketStatusBreakdown[];
  by_category: TicketCategoryBreakdown[];
  critical_alerts: TicketCriticalAlerts;
  agent_performance: AgentPerformance[];
}

export interface TicketStatusBreakdown {
  status: string;
  count: number;
  sla_compliant: number;
  sla_breached: number;
  percentage: number;
}

export interface TicketCategoryBreakdown {
  category_id: number;
  category_name: string;
  count: number;
  percentage: number;
}

export interface TicketCriticalAlerts {
  overdue_count: number;
  escalated_count: number;
  unassigned_count: number;
}

export interface AgentPerformance {
  user_id: number;
  agent_name: string;
  assigned_tickets: number;
  resolved_today: number;
  avg_satisfaction: number;
}

/* Activity feed */
export interface ActivityFeedData {
  alerts: SystemAlert[];
  recent_activities: RecentActivity[];
  showing: number;
  total_count: number;
}

export interface SystemAlert {
  id: number;
  type: 'critical' | 'warning' | 'info' | 'success';
  icon: string;
  color: string;
  title: string;
  message: string;
  count: number;
  timestamp: string;
  action_url: string | null;
  action_label: string | null;
}

export interface RecentActivity {
  id: number;
  activity_type: string;
  icon: string;
  color: string;
  description: string;
  actor: string;
  target: string;
  timestamp: string;
  relative_time: string;
}

/* Quick stats */
export interface QuickStatsData {
  topRevenuePlans: TopRevenuePlan[];
  activeUsers: ActiveUsersStats;
  failedPayments: FailedPaymentsStats;
  infrastructureHealth: InfrastructureHealthStats;
}

export interface TopRevenuePlan {
  plan_name: string;
  revenue: number;
  subscriber_count: number;
}

export interface ActiveUsersStats {
  total: number;
  online_now: number;
  locked: number;
  new_this_week: number;
}

export interface FailedPaymentsStats {
  count_this_month: number;
  total_amount: number;
  tenants_affected: number;
  oldest_failure_days: number;
}

export interface InfrastructureHealthStats {
  provisioning_pending: number;
  provisioning_failed: number;
  avg_api_response_ms: number;
  uptime_percentage: number;
}

/* Geographic data */
export interface GeographicData {
  by_country: CountryData[];
  top_countries: string[];
}

export interface CountryData {
  country: string;
  country_code: string;
  tenant_count: number;
  revenue: number;
  percentage: number;
}

/* Conversion metrics */
export interface ConversionMetricsData {
  trial_to_paid: TrialConversionData;
  churn: ChurnData;
}

export interface TrialConversionData {
  total_trials: number;
  converted: number;
  conversion_rate: number;
  expired_without_conversion: number;
}

export interface ChurnData {
  churned_this_month: number;
  churn_rate: number;
  retention_rate: number;
  avg_lifetime_months: number;
  top_churn_reasons: ChurnReason[];
}

export interface ChurnReason {
  reason: string;
  count: number;
}
