"use client";
import { useState } from "react";
import {
  Bot, CheckCircle2, XCircle, Clock, TrendingUp, TrendingDown,
  PauseCircle, Target, RefreshCw, Zap, Filter, Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MOCK_AI_ACTIONS } from "@/lib/mock-data";
import { AI_ACTION_LABELS, PLATFORM_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import type { AIAction, ApprovalStatus } from "@/types";

const ACTION_ICON: Record<string, React.ElementType> = {
  budget_increase: TrendingUp,
  budget_decrease: TrendingDown,
  bid_increase: TrendingUp,
  bid_decrease: TrendingDown,
  pause_ad: PauseCircle,
  enable_ad: Zap,
  pause_adset: PauseCircle,
  enable_adset: Zap,
  update_targeting: Target,
  asset_swap: RefreshCw,
  create_campaign: Zap,
  campaign_created: Zap,
};

const ACTION_COLOR: Record<string, string> = {
  budget_increase: "bg-green-100 text-green-700 border-green-200",
  budget_decrease: "bg-amber-100 text-amber-700 border-amber-200",
  bid_increase: "bg-blue-100 text-blue-700 border-blue-200",
  bid_decrease: "bg-orange-100 text-orange-700 border-orange-200",
  pause_ad: "bg-red-100 text-red-700 border-red-200",
  enable_ad: "bg-green-100 text-green-700 border-green-200",
  update_targeting: "bg-violet-100 text-violet-700 border-violet-200",
  asset_swap: "bg-purple-100 text-purple-700 border-purple-200",
  campaign_created: "bg-violet-100 text-violet-700 border-violet-200",
};

const STATUS_CONFIG: Record<ApprovalStatus, { icon: React.ElementType; label: string; color: string }> = {
  approved: { icon: CheckCircle2, label: "Executed", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  pending: { icon: Clock, label: "Pending", color: "text-amber-600 bg-amber-50 border-amber-200" },
  rejected: { icon: XCircle, label: "Rejected", color: "text-red-600 bg-red-50 border-red-200" },
};

function LogEntry({ action }: { action: AIAction }) {
  const Icon = ACTION_ICON[action.action_type] ?? Bot;
  const iconColor = ACTION_COLOR[action.action_type] ?? "bg-slate-100 text-slate-600 border-slate-200";
  const status = STATUS_CONFIG[action.approval_status];
  const StatusIcon = status.icon;

  return (
    <div className="flex gap-4">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border flex-shrink-0", iconColor)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="w-px flex-1 bg-slate-200 mt-2 mb-0" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            {/* Header row */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-md border",
                    iconColor.replace("text-", "text-").replace("bg-", "bg-")
                  )}>
                    {AI_ACTION_LABELS[action.action_type] ?? action.action_type}
                  </span>
                  {action.platform && (
                    <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-md",
                      action.platform === "meta" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                    )}>
                      {PLATFORM_LABELS[action.platform]}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mt-1.5">{action.title}</h3>
                {action.campaign_name && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Campaign: <span className="font-medium text-slate-600">{action.campaign_name}</span>
                  </p>
                )}
              </div>
              <div className="flex-shrink-0 text-right">
                <span className={cn("inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border", status.color)}>
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  {formatDistanceToNow(new Date(action.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>

            {/* Reasoning */}
            <div className="bg-slate-50 rounded-lg p-3 mb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <Bot className="w-3 h-3 text-violet-500" /> AI Reasoning
              </p>
              <p className="text-xs text-slate-700 leading-relaxed">{action.reasoning}</p>
            </div>

            {/* Impact row */}
            <div className="grid grid-cols-2 gap-3">
              {action.predicted_impact && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5">
                  <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide mb-1">Predicted Impact</p>
                  <p className="text-xs text-blue-700">{action.predicted_impact}</p>
                </div>
              )}
              {action.actual_impact && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5">
                  <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide mb-1">Actual Impact</p>
                  <p className="text-xs text-emerald-700">{action.actual_impact}</p>
                </div>
              )}
            </div>

            {/* Approval meta */}
            {action.approved_by && (
              <p className="text-xs text-slate-400 mt-3">
                Approved by <span className="font-medium text-slate-500">{action.approved_by}</span>
                {action.approved_at && ` · ${format(new Date(action.approved_at), "MMM d, yyyy 'at' HH:mm")}`}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AILogPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | "all">("all");

  const actions = MOCK_AI_ACTIONS.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.campaign_name?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchStatus = statusFilter === "all" || a.approval_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    all: MOCK_AI_ACTIONS.length,
    approved: MOCK_AI_ACTIONS.filter((a) => a.approval_status === "approved").length,
    pending: MOCK_AI_ACTIONS.filter((a) => a.approval_status === "pending").length,
    rejected: MOCK_AI_ACTIONS.filter((a) => a.approval_status === "rejected").length,
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Actions", value: counts.all, color: "text-slate-700", bg: "bg-slate-100" },
          { label: "Executed", value: counts.approved, color: "text-emerald-700", bg: "bg-emerald-100" },
          { label: "Pending", value: counts.pending, color: "text-amber-700", bg: "bg-amber-100" },
          { label: "Rejected", value: counts.rejected, color: "text-red-600", bg: "bg-red-100" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={cn("rounded-xl p-3 text-center", bg)}>
            <p className={cn("text-2xl font-bold", color)}>{value}</p>
            <p className={cn("text-xs font-medium mt-0.5", color + "/80")}>{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search actions or campaigns…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {(["all", "approved", "pending", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn("px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize", statusFilter === f ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700")}
            >
              {f === "all" ? "All" : STATUS_CONFIG[f].label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      {actions.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No actions found</p>
        </div>
      ) : (
        <div className="relative">
          {actions.map((action) => (
            <LogEntry key={action.id} action={action} />
          ))}
        </div>
      )}
    </div>
  );
}
