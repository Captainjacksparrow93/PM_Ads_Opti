export const PLATFORM_LABELS: Record<string, string> = {
  meta: "Meta Ads",
  google: "Google Ads",
};

export const PLATFORM_COLORS: Record<string, string> = {
  meta: "#1877F2",
  google: "#4285F4",
};

export const OBJECTIVE_LABELS: Record<string, string> = {
  awareness: "Awareness",
  traffic: "Traffic",
  engagement: "Engagement",
  leads: "Lead Generation",
  app_promotion: "App Promotion",
  sales: "Sales / Conversions",
  search: "Search",
  display: "Display",
  shopping: "Shopping",
  performance_max: "Performance Max",
  video: "Video",
};

export const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  paused: "Paused",
  draft: "Draft",
  pending_approval: "Pending Approval",
  completed: "Completed",
  error: "Error",
};

export const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  paused: "bg-amber-100 text-amber-700 border-amber-200",
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  pending_approval: "bg-violet-100 text-violet-700 border-violet-200",
  completed: "bg-blue-100 text-blue-700 border-blue-200",
  error: "bg-red-100 text-red-700 border-red-200",
};

export const AI_ACTION_LABELS: Record<string, string> = {
  budget_increase: "Budget Increased",
  budget_decrease: "Budget Decreased",
  bid_increase: "Bid Raised",
  bid_decrease: "Bid Lowered",
  pause_ad: "Ad Paused",
  enable_ad: "Ad Enabled",
  pause_adset: "Ad Set Paused",
  enable_adset: "Ad Set Enabled",
  create_campaign: "Campaign Created",
  update_targeting: "Targeting Updated",
  asset_swap: "Assets Swapped",
  campaign_created: "Campaign Created",
};

export const AI_ACTION_ICONS: Record<string, string> = {
  budget_increase: "TrendingUp",
  budget_decrease: "TrendingDown",
  bid_increase: "ArrowUpCircle",
  bid_decrease: "ArrowDownCircle",
  pause_ad: "PauseCircle",
  enable_ad: "PlayCircle",
  pause_adset: "PauseCircle",
  enable_adset: "PlayCircle",
  create_campaign: "Plus",
  update_targeting: "Target",
  asset_swap: "RefreshCw",
  campaign_created: "Plus",
};

export const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  manager: "Manager",
  viewer: "Viewer",
};

export const ROLE_COLORS: Record<string, string> = {
  admin: "bg-violet-100 text-violet-700",
  manager: "bg-blue-100 text-blue-700",
  viewer: "bg-slate-100 text-slate-600",
};
