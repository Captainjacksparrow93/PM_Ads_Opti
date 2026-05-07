export type Platform = "meta" | "google";
export type CampaignStatus = "active" | "paused" | "draft" | "pending_approval" | "completed" | "error";
export type CampaignObjective =
  | "awareness" | "traffic" | "engagement" | "leads" | "app_promotion" | "sales"
  | "search" | "display" | "shopping" | "performance_max" | "video";
export type AssetType = "image" | "video" | "copy";
export type UserRole = "admin" | "manager" | "viewer";
export type AIActionType =
  | "budget_increase" | "budget_decrease" | "bid_increase" | "bid_decrease"
  | "pause_ad" | "enable_ad" | "pause_adset" | "enable_adset"
  | "create_campaign" | "update_targeting" | "asset_swap" | "campaign_created";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type OptimizationFrequency = "15min" | "30min" | "1hour" | "3hours" | "6hours" | "12hours" | "daily";

export interface Agency {
  id: string;
  name: string;
  logo_url?: string;
  created_at: string;
}

export interface ClientGoal {
  target_roas?: number;
  target_cpa?: number;
  target_revenue?: number;
  monthly_budget?: number;
  timeframe_start?: string;
  timeframe_end?: string;
  notes?: string;
}

export interface ShopifyStore {
  id: string;
  client_id: string;
  store_url: string;
  store_name: string;
  connected_at: string;
  currency: string;
  total_revenue?: number;
  total_orders?: number;
  avg_order_value?: number;
  conversion_rate?: number;
}

export interface TelegramConfig {
  bot_token: string;
  chat_id: string;
  notify_pending_approvals: boolean;
  notify_campaign_alerts: boolean;
  notify_budget_alerts: boolean;
  notify_weekly_report: boolean;
  notify_ai_actions: boolean;
}

export interface Client {
  id: string;
  agency_id: string;
  name: string;
  logo_url?: string;
  industry?: string;
  website?: string;
  meta_connected: boolean;
  google_connected: boolean;
  shopify_connected: boolean;
  shopify_store_url?: string;
  monthly_budget?: number;
  currency: string;
  goal?: ClientGoal;
  created_at: string;
  campaign_count?: number;
  active_campaigns?: number;
  total_spend?: number;
  roas?: number;
  shopify_revenue?: number;
}

export interface AdAccount {
  id: string;
  client_id: string;
  platform: Platform;
  account_id: string;
  account_name: string;
  currency: string;
  timezone: string;
  connected_at: string;
  access_token_encrypted?: string;
}

export interface CampaignTarget {
  roas?: number;
  cpa?: number;
  cpc?: number;
  cpm?: number;
  daily_budget?: number;
  monthly_budget?: number;
  impressions?: number;
  conversions?: number;
}

export interface Campaign {
  id: string;
  client_id: string;
  platform: Platform;
  platform_campaign_id?: string;
  name: string;
  objective: CampaignObjective;
  status: CampaignStatus;
  daily_budget: number;
  total_budget?: number;
  currency: string;
  start_date: string;
  end_date?: string;
  targets: CampaignTarget;
  metrics: CampaignMetrics;
  ai_managed: boolean;
  optimization_frequency: OptimizationFrequency;
  created_at: string;
  updated_at: string;
}

export interface CampaignMetrics {
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  conversions: number;
  conversion_rate: number;
  roas: number;
  cpa: number;
  reach?: number;
  frequency?: number;
  updated_at: string;
}

export interface Asset {
  id: string;
  client_id: string;
  type: AssetType;
  name: string;
  url?: string;
  content?: string;
  thumbnail_url?: string;
  width?: number;
  height?: number;
  duration?: number;
  file_size?: number;
  mime_type?: string;
  tags: string[];
  ai_generated: boolean;
  performance_score?: number;
  usage_count: number;
  created_at: string;
}

export interface AIAction {
  id: string;
  client_id: string;
  campaign_id?: string;
  campaign_name?: string;
  platform?: Platform;
  action_type: AIActionType;
  title: string;
  reasoning: string;
  details: Record<string, unknown>;
  predicted_impact?: string;
  actual_impact?: string;
  approval_status: ApprovalStatus;
  approved_by?: string;
  approved_at?: string;
  executed_at?: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  agency_id: string;
  user_id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  invited_at: string;
  joined_at?: string;
}

export interface ApiKey {
  id: string;
  agency_id: string;
  service: "anthropic" | "meta" | "google";
  label: string;
  key_preview: string;
  is_active: boolean;
  created_at: string;
}

export interface DashboardMetrics {
  total_spend: number;
  total_spend_change: number;
  avg_roas: number;
  avg_roas_change: number;
  total_conversions: number;
  total_conversions_change: number;
  active_campaigns: number;
  active_campaigns_change: number;
  pending_approvals: number;
  ai_actions_today: number;
  shopify_revenue?: number;
  shopify_orders?: number;
  shopify_revenue_change?: number;
}

export interface ChartDataPoint {
  date: string;
  spend: number;
  roas: number;
  conversions: number;
  clicks: number;
  shopify_revenue?: number;
}

export interface ClientContextValue {
  clients: Client[];
  selectedClient: Client | null;
  setSelectedClient: (client: Client) => void;
  isLoading: boolean;
}
